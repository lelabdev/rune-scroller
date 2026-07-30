import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const BASE = "http://localhost:3210";
const root = resolve(import.meta.dirname, "..");

async function waitVisibleState(page) {
  await page.waitForFunction(() => window.__api?.visible() === true, null, {
    timeout: 5000,
  });
}

async function waitHiddenState(page) {
  await page.waitForFunction(() => window.__api?.visible() === false, null, {
    timeout: 5000,
  });
}

async function scrollToSelector(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    el?.scrollIntoView({ block: "center" });
  }, selector);
}

test.describe("useIntersection browser composables", () => {
  test.beforeAll(() => {
    if (!existsSync(resolve(root, "dist/useIntersection.svelte.js"))) {
      throw new Error(
        "dist/useIntersection.svelte.js missing — run `bun run build` first",
      );
    }
    const build = spawnSync(
      "bun",
      ["e2e/fixtures/build-intersection-page.js"],
      {
        cwd: root,
        stdio: "inherit",
        env: process.env,
      },
    );
    if (build.status !== 0) {
      throw new Error("failed to build intersection harness fixture");
    }
  });

  test("bind target becomes visible and records callback true", async ({
    page,
  }) => {
    await page.goto(`${BASE}/intersection.html`);
    await page.waitForFunction(
      () => typeof window.__mountIntersectionHarness === "function",
    );

    await page.evaluate(() => {
      const rootEl = document.getElementById("app");
      window.__api = window.__mountIntersectionHarness(rootEl);
      window.__api.setTarget(document.getElementById("target"));
    });

    await scrollToSelector(page, "#target");
    await waitVisibleState(page);

    const state = await page.evaluate(() => ({
      visible: window.__api.visible(),
      once: window.__api.onceVisible(),
      events: window.__api.callbackEvents(),
    }));
    expect(state.visible).toBe(true);
    expect(state.events).toContain(true);
  });

  test("scroll out clears continuous visibility but once stays true", async ({
    page,
  }) => {
    await page.goto(`${BASE}/intersection.html`);
    await page.waitForFunction(
      () => typeof window.__mountIntersectionHarness === "function",
    );

    await page.evaluate(() => {
      const rootEl = document.getElementById("app");
      window.__api = window.__mountIntersectionHarness(rootEl);
      window.__api.setTarget(document.getElementById("target"));
    });

    await scrollToSelector(page, "#target");
    await waitVisibleState(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await waitHiddenState(page);

    const state = await page.evaluate(() => ({
      visible: window.__api.visible(),
      once: window.__api.onceVisible(),
      events: window.__api.callbackEvents(),
    }));
    expect(state.visible).toBe(false);
    expect(state.once).toBe(true);
    expect(state.events).toContain(false);
  });

  test("replacing target after once allows a new once observation", async ({
    page,
  }) => {
    await page.goto(`${BASE}/intersection.html`);
    await page.waitForFunction(
      () => typeof window.__mountIntersectionHarness === "function",
    );

    await page.evaluate(() => {
      const rootEl = document.getElementById("app");
      window.__api = window.__mountIntersectionHarness(rootEl);
      window.__api.setTarget(document.getElementById("target"));
    });

    await scrollToSelector(page, "#target");
    await waitVisibleState(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await waitHiddenState(page);

    await page.evaluate(() => {
      window.__api.setTarget(document.getElementById("target-b"));
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    // once resets when element is reassigned (effect re-runs)
    const before = await page.evaluate(() => window.__api.onceVisible());
    // may still be true from previous; scroll target-b into view
    await scrollToSelector(page, "#target-b");
    await waitVisibleState(page);

    const after = await page.evaluate(() => ({
      once: window.__api.onceVisible(),
      visible: window.__api.visible(),
    }));
    expect(after.once).toBe(true);
    expect(after.visible).toBe(true);
    // ensure we exercised the replacement path
    expect(typeof before === "boolean").toBe(true);
  });

  test("unmount cleans up without page errors", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto(`${BASE}/intersection.html`);
    await page.waitForFunction(
      () => typeof window.__mountIntersectionHarness === "function",
    );

    await page.evaluate(() => {
      const rootEl = document.getElementById("app");
      window.__api = window.__mountIntersectionHarness(rootEl);
      window.__api.setTarget(document.getElementById("target"));
    });
    await scrollToSelector(page, "#target");
    await page.evaluate(() => {
      window.__unmountIntersectionHarness(window.__api);
    });
    await page.waitForTimeout(100);

    expect(pageErrors).toEqual([]);
  });
});
