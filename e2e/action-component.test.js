import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const BASE = "http://localhost:3210";
const root = resolve(import.meta.dirname, "..");

async function waitVisible(page, selector = "#hosted") {
  await page.waitForFunction(
    (sel) => document.querySelector(sel)?.classList.contains("is-visible"),
    selector,
    { timeout: 5000 },
  );
}

async function scrollHostedIntoView(page) {
  await page.evaluate(() => {
    document.querySelector("#hosted")?.scrollIntoView({ block: "center" });
  });
}

test.describe("use:rs Svelte component action", () => {
  test.beforeAll(() => {
    if (!existsSync(resolve(root, "dist/svelte.js"))) {
      const built = spawnSync("bun", ["run", "build"], {
        cwd: root,
        encoding: "utf8",
        env: process.env,
      });
      if (built.status !== 0) {
        throw new Error(
          `bun run build failed:\n${built.stderr || built.stdout}`,
        );
      }
    }
    const build = spawnSync(
      "bun",
      ["e2e/fixtures/build-action-component-page.js"],
      {
        cwd: root,
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `/home/loops/.bun/bin:/usr/bin:/bin:${process.env.PATH ?? ""}`,
        },
      },
    );
    if (build.status !== 0) {
      throw new Error(
        `failed to build action-component harness:\n${build.stderr || build.stdout}`,
      );
    }
  });

  test("mount + scroll applies is-visible on #hosted", async ({ page }) => {
    await page.goto(`${BASE}/action-component.html`);
    await page.waitForFunction(
      () => typeof window.__mountRsHarness === "function",
    );

    await page.evaluate(() => {
      window.__api = window.__mountRsHarness(
        document.getElementById("mount-root"),
      );
    });

    const before = await page.$eval("#hosted", (el) =>
      el.classList.contains("is-visible"),
    );
    expect(before).toBe(false);

    await scrollHostedIntoView(page);
    await waitVisible(page, "#hosted");

    const after = await page.$eval("#hosted", (el) => ({
      visible: el.classList.contains("is-visible"),
      animation: el.getAttribute("data-animation"),
      duration: el.style.getPropertyValue("--duration"),
    }));
    expect(after.visible).toBe(true);
    expect(after.animation).toBe("fade-up");
    expect(after.duration).toBe("400ms");
  });

  test("setOptions replacement clears removed duration", async ({ page }) => {
    await page.goto(`${BASE}/action-component.html`);
    await page.waitForFunction(
      () => typeof window.__mountRsHarness === "function",
    );

    await page.evaluate(() => {
      window.__api = window.__mountRsHarness(
        document.getElementById("mount-root"),
      );
    });

    await page.waitForFunction(
      () =>
        document
          .querySelector("#hosted")
          ?.style.getPropertyValue("--duration") === "400ms",
    );

    await page.evaluate(() => {
      window.__api.setOptions({ animation: "fade-up" });
    });

    const duration = await page.$eval("#hosted", (el) =>
      el.style.getPropertyValue("--duration"),
    );
    expect(duration).toBe("");
  });

  test("unmount cleans up without page errors", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto(`${BASE}/action-component.html`);
    await page.waitForFunction(
      () => typeof window.__mountRsHarness === "function",
    );

    await page.evaluate(() => {
      window.__api = window.__mountRsHarness(
        document.getElementById("mount-root"),
      );
    });

    await scrollHostedIntoView(page);
    await waitVisible(page, "#hosted");

    await page.evaluate(() => {
      window.__unmountRsHarness(window.__api);
    });

    expect(pageErrors).toEqual([]);
  });
});
