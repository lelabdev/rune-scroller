import { test, expect } from "@playwright/test";
import { ANIMATION_TYPES } from "../dist/animations.js";

const BASE = "http://localhost:3210";

/**
 * Navigate to action test page, optionally replace #content, then load module + run script
 */
async function setupActionPage(page, { html, script } = {}) {
  await page.goto(`${BASE}/action.html`);

  // Replace target HTML if custom
  if (html) {
    await page.evaluate((h) => {
      const old = document.getElementById("target");
      if (old) old.remove();
      const content = document.createElement("div");
      content.innerHTML = h;
      // Insert before the last spacer
      const lastSpacer = document.querySelector(".spacer:last-child");
      lastSpacer.parentNode.insertBefore(content, lastSpacer);
    }, html);
  }

  // Load the module
  await page.addScriptTag({ url: `${BASE}/dist/svelte.js`, type: "module" });

  // Run test script
  if (script) {
    await page.evaluate(`(async () => {
			const { runeScroller, rs } = await import('${BASE}/dist/svelte.js');
			window.runeScroller = runeScroller;
			window.rs = rs;
			${script}
		})()`);
  }

  // Let the observer settle
  await page.waitForTimeout(100);
}

/**
 * Scroll page down to reveal the target
 */
async function scrollToTarget(page) {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await page.waitForTimeout(300);
}

// ============================================================
// Action API (use:rs)
// ============================================================

test.describe("runeScroller action", () => {
  test("starts with opacity 0", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    const opacity = await page.$eval(
      "#target",
      (el) => getComputedStyle(el).opacity,
    );
    expect(Number(opacity)).toBeLessThan(0.1);
  });

  test("adds data-animation attribute", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    const attr = await page.$eval("#target", (el) =>
      el.getAttribute("data-animation"),
    );
    expect(attr).toBe("fade-up");
  });

  test("adds scroll-animate class", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    const hasClass = await page.$eval("#target", (el) =>
      el.classList.contains("scroll-animate"),
    );
    expect(hasClass).toBe(true);
  });

  test("triggers is-visible on scroll", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    await scrollToTarget(page);
    const hasClass = await page.$eval("#target", (el) =>
      el.classList.contains("is-visible"),
    );
    expect(hasClass).toBe(true);
  });

  test("opacity becomes 1 after trigger", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up' });`,
    });
    await scrollToTarget(page);
    await page.waitForTimeout(500);
    const opacity = await page.$eval(
      "#target",
      (el) => getComputedStyle(el).opacity,
    );
    expect(Number(opacity)).toBeGreaterThan(0.9);
  });

  test("respects custom duration", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade', duration: 1000 });`,
    });
    const duration = await page.$eval("#target", (el) =>
      el.style.getPropertyValue("--duration"),
    );
    expect(duration).toBe("1000ms");
  });

  test("respects custom delay", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade', delay: 500 });`,
    });
    const delay = await page.$eval("#target", (el) =>
      el.style.getPropertyValue("--delay"),
    );
    expect(delay).toBe("500ms");
  });

  test("respects custom easing", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade', easing: 'ease-in-out' });`,
    });
    const easing = await page.$eval("#target", (el) =>
      el.style.getPropertyValue("--easing"),
    );
    expect(easing).toBe("ease-in-out");
  });

  test("does not overwrite inherited --delay when delay not provided", async ({
    page,
  }) => {
    await page.goto(`${BASE}/action.html`);
    await page.evaluate(() => {
      document.getElementById("target").style.setProperty("--delay", "300ms");
    });
    await page.evaluate(`(async () => {
			const { rs } = await import('${BASE}/dist/svelte.js');
			window.rs = rs;
			rs(document.getElementById('target'), { animation: 'fade' });
		})()`);
    await page.waitForTimeout(100);

    const delay = await page.$eval("#target", (el) =>
      el.style.getPropertyValue("--delay"),
    );
    expect(delay).toBe("300ms");
  });
});

// ============================================================
// Repeat mode
// ============================================================

test.describe("repeat mode", () => {
  test("removes is-visible when scrolling back up", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up', repeat: true });`,
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

  test("stays visible without repeat", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up', repeat: false });`,
    });

    await scrollToTarget(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    const hasClass = await page.$eval("#target", (el) =>
      el.classList.contains("is-visible"),
    );
    expect(hasClass).toBe(true);
  });
});

// ============================================================
// onVisible callback
// ============================================================

test.describe("onVisible callback", () => {
  test("fires when element becomes visible", async ({ page }) => {
    await setupActionPage(page, {
      script: `
				window.__callbackFired = false;
				rs(document.getElementById('target'), {
					animation: 'fade-up',
					onVisible: () => { window.__callbackFired = true; }
				});
			`,
    });

    await scrollToTarget(page);
    const fired = await page.evaluate(() => window.__callbackFired);
    expect(fired).toBe(true);
  });

  test("receives the element as argument", async ({ page }) => {
    await setupActionPage(page, {
      script: `
				window.__receivedTag = null;
				rs(document.getElementById('target'), {
					animation: 'fade-up',
					onVisible: (el) => { window.__receivedTag = el.tagName; }
				});
			`,
    });

    await scrollToTarget(page);
    const tag = await page.evaluate(() => window.__receivedTag);
    expect(tag).toBe("DIV");
  });
});

// ============================================================
// onHidden callback
// ============================================================

test.describe("onHidden callback", () => {
  test("fires when element leaves viewport with repeat", async ({ page }) => {
    await setupActionPage(page, {
      script: `
				window.__hiddenFired = false;
				window.__hiddenTag = null;
				rs(document.getElementById('target'), {
					animation: 'fade-up',
					repeat: true,
					onHidden: (el) => {
						window.__hiddenFired = true;
						window.__hiddenTag = el.tagName;
					}
				});
			`,
    });

    await scrollToTarget(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const result = await page.evaluate(() => ({
      fired: window.__hiddenFired,
      tag: window.__hiddenTag,
    }));
    expect(result.fired).toBe(true);
    expect(result.tag).toBe("DIV");
  });

  test("does not fire without repeat", async ({ page }) => {
    await setupActionPage(page, {
      script: `
				window.__hiddenFired = false;
				rs(document.getElementById('target'), {
					animation: 'fade-up',
					repeat: false,
					onHidden: () => { window.__hiddenFired = true; }
				});
			`,
    });

    await scrollToTarget(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const fired = await page.evaluate(() => window.__hiddenFired);
    expect(fired).toBe(false);
  });
});

// ============================================================
// Offset
// ============================================================

test.describe("offset", () => {
  test("positive offset triggers earlier", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up', offset: 200 });`,
    });

    // Scroll partially — offset should make it trigger sooner
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.5));
    await page.waitForTimeout(300);
    const hasClass = await page.$eval("#target", (el) =>
      el.classList.contains("is-visible"),
    );
    expect(hasClass).toBe(true);
  });
});

// ============================================================
// Debug mode
// ============================================================

test.describe("debug mode", () => {
  test("creates visible sentinel with debug: true", async ({ page }) => {
    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up', debug: true, debugLabel: 'test-sentinel' });`,
    });

    const sentinel = await page.$('div[data-sentinel-debug="true"]');
    expect(sentinel).toBeTruthy();

    const text = await sentinel.textContent();
    expect(text).toBe("test-sentinel");
  });
});

// ============================================================
// Animation types
// ============================================================

test.describe("animation types", () => {
  if (!Array.isArray(ANIMATION_TYPES) || ANIMATION_TYPES.length === 0) {
    throw new Error(
      "ANIMATION_TYPES missing from dist/animations.js — run `bun run build` first",
    );
  }

  for (const anim of ANIMATION_TYPES) {
    test(`${anim}: starts hidden, becomes visible on scroll`, async ({
      page,
    }) => {
      await setupActionPage(page, {
        script: `rs(document.getElementById('target'), { animation: '${anim}' });`,
      });

      const before = await page.$eval("#target", (el) => ({
        hasVisible: el.classList.contains("is-visible"),
        animation: el.getAttribute("data-animation"),
      }));
      expect(before.hasVisible).toBe(false);
      expect(before.animation).toBe(anim);

      await scrollToTarget(page);
      await page.waitForTimeout(anim === "bounce-in" ? 700 : 500);

      const after = await page.$eval("#target", (el) => ({
        hasVisible: el.classList.contains("is-visible"),
        opacity: Number(getComputedStyle(el).opacity),
        animation: el.getAttribute("data-animation"),
      }));
      expect(after.hasVisible).toBe(true);
      expect(after.opacity).toBeGreaterThan(0.9);
      expect(after.animation).toBe(anim);
    });
  }
});

// ============================================================
// Destroy / cleanup
// ============================================================

test.describe("destroy", () => {
  test("cleanup removes sentinel", async ({ page }) => {
    await setupActionPage(page, {
      script: `
				const action = rs(document.getElementById('target'), { animation: 'fade-up', debug: true });
				window.__action = action;
			`,
    });

    let sentinel = await page.$('div[data-sentinel-debug="true"]');
    expect(sentinel).toBeTruthy();

    await page.evaluate(() => window.__action.destroy());
    await page.waitForTimeout(50);

    sentinel = await page.$('div[data-sentinel-debug="true"]');
    expect(sentinel).toBeNull();
  });
});

// ============================================================
// Reduced motion
// ============================================================

test.describe("prefers-reduced-motion", () => {
  test("respects reduced motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    await setupActionPage(page, {
      script: `rs(document.getElementById('target'), { animation: 'fade-up' });`,
    });

    await scrollToTarget(page);
    await page.waitForTimeout(200);

    const opacity = await page.$eval(
      "#target",
      (el) => getComputedStyle(el).opacity,
    );
    expect(Number(opacity)).toBeGreaterThan(0.9);

    const transition = await page.$eval(
      "#target",
      (el) => getComputedStyle(el).transition,
    );
    expect(transition).toContain("none");
  });
});
