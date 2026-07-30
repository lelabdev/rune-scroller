import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { compile, compileModule } from "svelte/compiler";

const root = resolve(import.meta.dirname, "../..");
const distComposable = join(root, "dist/useIntersection.svelte.js");
const outDir = join(root, "e2e/pages/generated");
const compiledDir = join(outDir, "compiled");

if (!existsSync(distComposable)) {
  console.error(
    "dist/useIntersection.svelte.js missing — run `bun run build` first",
  );
  process.exit(1);
}

mkdirSync(compiledDir, { recursive: true });

const composableSource = readFileSync(distComposable, "utf8");
const composable = compileModule(composableSource, {
  filename: "useIntersection.svelte.js",
  generate: "client",
});
const composableOut = join(compiledDir, "useIntersection.js");
writeFileSync(composableOut, composable.js.code);

// Relative import so bun build can resolve the module graph.
const harnessSource = `
<script>
  import { useIntersection, useIntersectionOnce } from "./useIntersection.js";

  let target = $state(null);
  const events = [];
  const intersection = useIntersection({ threshold: 0 }, (visible) => {
    events.push(visible);
  });
  const onceIntersection = useIntersectionOnce({ threshold: 0 });

  $effect(() => {
    intersection.element = target;
    onceIntersection.element = target;
  });

  export function setTarget(value) {
    target = value;
  }

  export function visible() {
    return intersection.isVisible;
  }

  export function onceVisible() {
    return onceIntersection.isVisible;
  }

  export function callbackEvents() {
    return events.slice();
  }
</script>
`;

const compiledHarness = compile(harnessSource, {
  filename: "IntersectionHarness.svelte",
  generate: "client",
});
const harnessOut = join(compiledDir, "IntersectionHarness.js");
// compile() may rewrite relative imports; force sibling import for bundling.
const harnessCode = compiledHarness.js.code.replace(
  /from\s+["'][^"']*useIntersection[^"']*["']/,
  'from "./useIntersection.js"',
);
writeFileSync(harnessOut, harnessCode);

const entryPath = join(compiledDir, "entry.js");
writeFileSync(
  entryPath,
  `import { mount, unmount, flushSync } from "svelte";
import Harness from "./IntersectionHarness.js";

window.__mountIntersectionHarness = (rootEl) => {
  const instance = mount(Harness, { target: rootEl });
  flushSync();
  return {
    setTarget: (el) => {
      instance.setTarget(el);
      flushSync();
    },
    visible: () => instance.visible(),
    onceVisible: () => instance.onceVisible(),
    callbackEvents: () => instance.callbackEvents(),
    instance,
  };
};

window.__unmountIntersectionHarness = (api) => {
  unmount(api.instance ?? api);
  flushSync();
};
`,
);

const bundlePath = join(outDir, "intersection-harness.bundle.js");
const build = Bun.spawnSync(
  [
    "bun",
    "build",
    entryPath,
    "--outfile",
    bundlePath,
    "--format",
    "esm",
    "--target",
    "browser",
  ],
  {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      PATH: `/home/loops/.bun/bin:/usr/bin:/bin:${process.env.PATH ?? ""}`,
    },
  },
);

if (build.exitCode !== 0) {
  console.error("bun build failed for intersection harness");
  process.exit(build.exitCode ?? 1);
}

console.log("Wrote", bundlePath);
