import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const outputDir = resolve(root, "benchmarks/results");
const samples = Number(process.env.BENCHMARK_SAMPLES ?? 3);
const counts = [50, 200, 1000];
const profiles = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 2,
  },
];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function variance(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return (
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  );
}

function summarize(samplesForScenario) {
  const keys = Object.keys(samplesForScenario[0]);
  return Object.fromEntries(
    keys.map((key) => {
      const values = samplesForScenario
        .map((sample) => sample[key])
        .filter(Number.isFinite);
      return [key, { median: median(values), variance: variance(values) }];
    }),
  );
}

function startServer() {
  const server = createServer(async (request, response) => {
    const path = request.url?.split("?")[0] ?? "";
    const file = resolve(dist, path.slice("/dist/".length));
    if (!file || !file.startsWith(root) || !file.startsWith(dist)) {
      response.writeHead(404).end();
      return;
    }
    try {
      const body = await readFile(file);
      response.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": file.endsWith(".css")
          ? "text/css"
          : "application/javascript",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  return new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", () => resolveServer(server));
  });
}

async function runScenario(browser, port, profile, count, warm) {
  const context = await browser.newContext(profile);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  const beforeMetrics = await cdp.send("Performance.getMetrics");
  await page.setContent(
    `<!doctype html><style>body{margin:0}.item{height:80px;margin:80px 16px}</style><main>${'<div class="item"></div>'.repeat(count)}</main>`,
  );
  await page.addStyleTag({
    url: `http://127.0.0.1:${port}/dist/animations.css`,
  });

  const result = await page.evaluate(
    async ({ port, warm }) => {
      const originalObserver = window.IntersectionObserver;
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      let observerCount = 0;
      let listenerCount = 0;
      EventTarget.prototype.addEventListener = function (type, ...args) {
        if (
          (this === window || this === document) &&
          ["scroll", "resize"].includes(type)
        ) {
          listenerCount++;
        }
        return originalAddEventListener.call(this, type, ...args);
      };
      window.IntersectionObserver = class extends originalObserver {
        constructor(...args) {
          super(...args);
          observerCount++;
        }
      };
      const elements = [...document.querySelectorAll(".item")];
      const longTasks = [];
      const observer = new PerformanceObserver((list) => {
        longTasks.push(...list.getEntries());
      });
      try {
        observer.observe({ type: "longtask", buffered: true });
      } catch {
        // Long Tasks is unavailable in some Chromium builds.
      }

      if (warm)
        await new Promise((resolveFrame) =>
          requestAnimationFrame(resolveFrame),
        );
      const start = performance.now();
      const { animate } = await import(
        `http://127.0.0.1:${port}/dist/index.js`
      );
      const actions = elements.map((element) =>
        animate(element, {
          animation: "fade-up",
          repeat: true,
          duration: 400,
          offset: 120,
        }),
      );
      const cleanup = () => actions.forEach((action) => action.destroy());
      const initializationMs = performance.now() - start;

      const scrollStart = performance.now();
      const frames = [];
      for (let step = 0; step < 40; step++) {
        window.scrollTo(0, step * 300);
        const frameStart = performance.now();
        await new Promise((resolveFrame) =>
          requestAnimationFrame(() => resolveFrame()),
        );
        frames.push(performance.now() - frameStart);
      }
      const scrollMs = performance.now() - scrollStart;
      const heap = performance.memory?.usedJSHeapSize ?? NaN;
      cleanup();
      observer.disconnect();
      window.IntersectionObserver = originalObserver;
      EventTarget.prototype.addEventListener = originalAddEventListener;
      return {
        initializationMs,
        scrollMs,
        maxFrameMs: Math.max(...frames),
        droppedFrames: frames.filter((frame) => frame > 16.7).length,
        longTaskCount: longTasks.length,
        longTaskMs: longTasks.reduce((total, task) => total + task.duration, 0),
        observerCount,
        listenerCount,
        heap,
      };
    },
    { port, warm },
  );

  const afterMetrics = await cdp.send("Performance.getMetrics");
  const metric = (metrics, name) =>
    metrics.metrics.find((item) => item.name === name)?.value ?? NaN;
  result.scriptMs =
    (metric(afterMetrics, "ScriptDuration") -
      metric(beforeMetrics, "ScriptDuration")) *
    1000;
  result.layoutMs =
    (metric(afterMetrics, "LayoutDuration") -
      metric(beforeMetrics, "LayoutDuration")) *
    1000;
  result.styleMs =
    (metric(afterMetrics, "RecalcStyleDuration") -
      metric(beforeMetrics, "RecalcStyleDuration")) *
    1000;
  result.heap = metric(afterMetrics, "JSHeapUsedSize");
  await context.close();
  return result;
}

const server = await startServer();
const port = server.address().port;
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BENCHMARK_CHROMIUM,
});
const results = [];
try {
  for (const profile of profiles) {
    for (const count of counts) {
      const runs = [];
      for (let sample = 0; sample < samples; sample++) {
        runs.push(await runScenario(browser, port, profile, count, sample > 0));
      }
      results.push({
        profile: profile.name,
        count,
        runs,
        summary: summarize(runs),
      });
      console.log(
        `${profile.name} rune-scroller ${count}: ${runs.length} samples`,
      );
    }
  }
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}

const report = {
  generatedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    samples,
    counts,
  },
  results,
};
await mkdir(outputDir, { recursive: true });
await writeFile(
  resolve(outputDir, "latest.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const rows = results.map(
  ({ profile, count, summary }) =>
    `| ${profile} | ${count} | ${summary.initializationMs.median.toFixed(2)} | ${summary.scrollMs.median.toFixed(2)} | ${summary.maxFrameMs.median.toFixed(2)} | ${summary.droppedFrames.median.toFixed(0)} | ${summary.observerCount.median.toFixed(0)} | ${summary.listenerCount.median.toFixed(0)} | ${summary.scriptMs.median.toFixed(2)} | ${summary.layoutMs.median.toFixed(2)} | ${summary.styleMs.median.toFixed(2)} | ${summary.heap.median.toFixed(0)} |`,
);
await writeFile(
  resolve(outputDir, "latest.md"),
  `# Benchmark Results\n\nGenerated: ${report.generatedAt}\n\n| Profile | Elements | Init median (ms) | Scroll median (ms) | Max frame median (ms) | Dropped frames median | Observers | Scroll/resize listeners | Script median (ms) | Layout median (ms) | Style median (ms) | Heap median (bytes) |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${rows.join("\n")}\n\nResults are machine-specific. Run \`bun run benchmark\` on the target machine before making public performance claims.\n`,
);
