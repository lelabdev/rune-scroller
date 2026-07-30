import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3210";

/**
 * Load the framework-neutral core from the root entry and run a script.
 * This verifies that `dist/index.js` resolves and works in a real browser
 * without pulling in the Svelte runtime.
 */
async function setupCorePage(page, { script } = {}) {
  await page.goto(`${BASE}/action.html`);

  await page.addScriptTag({ url: `${BASE}/dist/index.js`, type: "module" });

  if (script) {
    await page.evaluate(`(async () => {
			const { animate } = await import('${BASE}/dist/index.js');
			window.animate = animate;
			${script}
		})()`);
  }

  await page.waitForTimeout(100);
}

async function scrollToTarget(page) {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await page.waitForTimeout(300);
}

test.describe("animate core (dist/index.js)", () => {
  test("exposes ANIMATION_TYPES from the framework-neutral root", async ({
    page,
  }) => {
    await setupCorePage(page, {});
    const types = await page.evaluate(async (base) => {
      const { ANIMATION_TYPES } = await import(`${base}/dist/index.js`);
      return ANIMATION_TYPES;
    }, BASE);
    expect(Array.isArray(types)).toBe(true);
    expect(types).toContain("fade-up");
    expect(types.length).toBeGreaterThanOrEqual(36);
  });

  test("default export and named animate are the same function", async ({
    page,
  }) => {
    await setupCorePage(page, {});
    const same = await page.evaluate(async (base) => {
      const mod = await import(`${base}/dist/index.js`);
      return mod.default === mod.animate;
    }, BASE);
    expect(same).toBe(true);
  });

  test("starts with opacity 0", async ({ page }) => {
    await setupCorePage(page, {
      script: `animate(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    const opacity = await page.$eval(
      "#target",
      (el) => getComputedStyle(el).opacity,
    );
    expect(Number(opacity)).toBeLessThan(0.1);
  });

  test("sets the data-animation attribute", async ({ page }) => {
    await setupCorePage(page, {
      script: `animate(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    const attr = await page.$eval("#target", (el) =>
      el.getAttribute("data-animation"),
    );
    expect(attr).toBe("fade-up");
  });

  test("triggers is-visible on scroll", async ({ page }) => {
    await setupCorePage(page, {
      script: `animate(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    await scrollToTarget(page);
    const hasClass = await page.$eval("#target", (el) =>
      el.classList.contains("is-visible"),
    );
    expect(hasClass).toBe(true);
  });

  test("applies duration and delay as CSS variables", async ({ page }) => {
    await setupCorePage(page, {
      script: `animate(document.getElementById('target'), { animation: 'fade', duration: 1000, delay: 500 });`,
    });
    const duration = await page.$eval("#target", (el) =>
      el.style.getPropertyValue("--duration"),
    );
    const delay = await page.$eval("#target", (el) =>
      el.style.getPropertyValue("--delay"),
    );
    expect(duration).toBe("1000ms");
    expect(delay).toBe("500ms");
  });

  test("update replaces the whole option set", async ({ page }) => {
    await setupCorePage(page, {
      script: `
				window.__action = animate(document.getElementById('target'), { animation: 'fade', duration: 1000 });
				window.__action.update({ animation: 'fade' });
			`,
    });
    const duration = await page.$eval("#target", (el) =>
      el.style.getPropertyValue("--duration"),
    );
    expect(duration).toBe("");
  });

  test("repeat removes is-visible when scrolling back up", async ({ page }) => {
    await setupCorePage(page, {
      script: `animate(document.getElementById('target'), { animation: 'fade-up', repeat: true });`,
    });

    await scrollToTarget(page);
    let hasClass = await page.$eval("#target", (el) =>
      el.classList.contains("is-visible"),
    );
    expect(hasClass).toBe(true);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    hasClass = await page.$eval("#target", (el) =>
      el.classList.contains("is-visible"),
    );
    expect(hasClass).toBe(false);
  });

  test("fires onVisible with the element", async ({ page }) => {
    await setupCorePage(page, {
      script: `
				window.__received = null;
				animate(document.getElementById('target'), {
					animation: 'fade-up',
					onVisible: (el) => { window.__received = el.tagName; }
				});
			`,
    });
    await scrollToTarget(page);
    const tag = await page.evaluate(() => window.__received);
    expect(tag).toBe("DIV");
  });

  test("cleanup restores DOM state on destroy", async ({ page }) => {
    await setupCorePage(page, {
      script: `
				window.__action = animate(document.getElementById('target'), { animation: 'fade', duration: 800 });
			`,
    });
    await page.evaluate(() => window.__action.destroy());
    await page.waitForTimeout(50);

    const state = await page.$eval("#target", (el) => ({
      animation: el.getAttribute("data-animation"),
      visible: el.classList.contains("is-visible"),
      duration: el.style.getPropertyValue("--duration"),
    }));
    expect(state.animation).toBeNull();
    expect(state.visible).toBe(false);
    expect(state.duration).toBe("");
  });

  test("respects reduced motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setupCorePage(page, {
      script: `animate(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    await scrollToTarget(page);
    await page.waitForTimeout(200);

    const opacity = await page.$eval(
      "#target",
      (el) => getComputedStyle(el).opacity,
    );
    expect(Number(opacity)).toBeGreaterThan(0.9);
  });
});
