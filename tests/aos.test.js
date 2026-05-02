/**
 * AOS Compatibility Module Tests
 * Issue #28: Unit tests for src/lib/aos.js
 *
 * Tests verify: attribute reading, element processing, CSS variable setting,
 * API methods (init, refreshHard, disable), legacy mapping, and initClassName.
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Window } from "happy-dom";
import { init, refreshHard, disable } from "../src/lib/aos.js";

// ─── Environment helpers ────────────────────────────────────────────────────

function setupEnvironment() {
  const win = new Window();
  const doc = win.document;

  // Stub readyState so init() processes elements immediately
  Object.defineProperty(doc, "readyState", {
    value: "complete",
    writable: true,
    configurable: true,
  });

  globalThis.window = win;
  globalThis.document = doc;
  globalThis.HTMLElement = win.HTMLElement;
  globalThis.HTMLDivElement = win.HTMLDivElement;

  // IntersectionObserver (happy-dom may provide it)
  globalThis.IntersectionObserver =
    win.IntersectionObserver ||
    class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };

  // ResizeObserver stub
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ||
    class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };

  // MutationObserver
  if (win.MutationObserver) {
    globalThis.MutationObserver = win.MutationObserver;
  }

  // getComputedStyle stub — avoid CSS detection warnings
  globalThis.getComputedStyle = () => ({
    animation: "fade-in 800ms ease-out",
    getPropertyValue: () => "",
  });

  process.env.NODE_ENV = "production";
}

function teardownEnvironment() {
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.HTMLElement;
  delete globalThis.HTMLDivElement;
}

/** Default AOS options (to reset module state between tests/files) */
const DEFAULT_OPTIONS = {
  offset: 120,
  delay: 0,
  duration: 400,
  easing: "ease",
  once: false,
  mirror: false,
  anchorPlacement: "top-bottom",
  disable: false,
  useClassNames: false,
  startEvent: "DOMContentLoaded",
  animatedClassName: "aos-animate",
  initClassName: "aos-init",
};

/** Create a div with data-aos-* attributes, append to body */
function createAOSElement(attrs = {}) {
  const el = document.createElement("div");
  el.textContent = "AOS Element";
  el.style.height = "100px";
  el.style.width = "200px";

  // Mock offsetHeight for sentinel positioning
  Object.defineProperty(el, "offsetHeight", {
    configurable: true,
    value: 100,
  });

  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }

  document.body.appendChild(el);
  return el;
}

/** Get the sentinel div inside the wrapper created by runeScroller */
function getSentinel(el) {
  const wrapper = el.parentElement;
  if (!wrapper) return null;
  for (const child of wrapper.children) {
    if (child !== el && child.hasAttribute("data-sentinel-id")) {
      return child;
    }
  }
  return null;
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe("AOS Compat Module", () => {
  beforeEach(() => {
    setupEnvironment();
  });

  afterEach(() => {
    try {
      disable();
    } catch {
      /* ignore */
    }
    // Reset module-level options to defaults before teardown
    // so other test files aren't affected by our option overrides
    try {
      init(DEFAULT_OPTIONS);
    } catch {
      /* ignore */
    }
    try {
      document.body.innerHTML = "";
    } catch {
      /* ignore */
    }
    teardownEnvironment();
  });

  // ─── 1. init() detects [data-aos] elements ────────────────────────────────
  it("init() detects [data-aos] elements and applies animation", () => {
    const el = createAOSElement({ "data-aos": "fade-up" });

    init();

    // data-animation attribute set by runeScroller via setupAnimationElement
    expect(el.getAttribute("data-animation")).toBe("fade-up");
    // scroll-animate class added by setupAnimationElement
    expect(el.classList.contains("scroll-animate")).toBe(true);
    // Element is wrapped in a position:relative wrapper (runeScroller behavior)
    const wrapper = el.parentElement;
    expect(wrapper).toBeDefined();
    expect(wrapper.tagName).toBe("DIV");
    expect(wrapper.style.position).toBe("relative");
  });

  // ─── 2. data-aos-duration → --duration CSS variable ───────────────────────
  it('data-aos-duration="800" sets --duration CSS variable', () => {
    const el = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-duration": "800",
    });

    init();

    expect(el.style.getPropertyValue("--duration")).toBe("800ms");
  });

  // ─── 3. data-aos-delay → --delay CSS variable ─────────────────────────────
  it('data-aos-delay="300" sets --delay CSS variable', () => {
    const el = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-delay": "300",
    });

    init();

    expect(el.style.getPropertyValue("--delay")).toBe("300ms");
  });

  // ─── 4. data-aos-easing → --easing CSS variable ───────────────────────────
  it('data-aos-easing="ease-in-out" sets --easing CSS variable', () => {
    const el = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-easing": "ease-in-out",
    });

    init();

    expect(el.style.getPropertyValue("--easing")).toBe("ease-in-out");
  });

  // ─── 5. data-aos-offset → offset passed to runeScroller ───────────────────
  it('data-aos-offset="200" affects sentinel position (offset passed through)', () => {
    const el = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-offset": "200",
    });

    init();

    // AOS offset=200, adjustment: 200-120=80, sentinel top = elementHeight(100)+80=180px
    const sentinel = getSentinel(el);
    expect(sentinel).not.toBeNull();
    expect(sentinel.style.top).toBe("180px");
  });

  // ─── 6. data-aos-once="true" → repeat=false ───────────────────────────────
  it('data-aos-once="true" results in non-repeat mode (sentinel still created)', () => {
    const el = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-once": "true",
    });

    init();

    // Element is processed successfully with once=true (repeat=false)
    expect(el.classList.contains("scroll-animate")).toBe(true);
    expect(el.getAttribute("data-animation")).toBe("fade-up");
    // Sentinel exists — the animation was set up in non-repeat mode
    const sentinel = getSentinel(el);
    expect(sentinel).not.toBeNull();
  });

  // ─── 7. data-aos-mirror="true" → repeat=true ──────────────────────────────
  it('data-aos-mirror="true" results in repeat mode (element re-animates)', () => {
    const el = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-mirror": "true",
    });

    init();

    // Element is processed with mirror=true (repeat=true)
    expect(el.classList.contains("scroll-animate")).toBe(true);
    expect(el.getAttribute("data-animation")).toBe("fade-up");
    // Sentinel exists
    const sentinel = getSentinel(el);
    expect(sentinel).not.toBeNull();
  });

  // ─── 8. init({ duration: 600 }) → global default ─────────────────────────
  it("init({ duration: 600 }) applies global default to elements without inline duration", () => {
    const elWithInline = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-duration": "200",
    });
    const elWithoutInline = createAOSElement({
      "data-aos": "fade-up",
    });

    init({ duration: 600 });

    // Element with inline duration keeps its own value
    expect(elWithInline.style.getPropertyValue("--duration")).toBe("200ms");
    // Element without inline duration gets the global default
    expect(elWithoutInline.style.getPropertyValue("--duration")).toBe("600ms");
  });

  // ─── 9. refreshHard() → destroys old actions, re-processes ─────────────────
  it("refreshHard() destroys old actions and re-processes elements", () => {
    const el = createAOSElement({ "data-aos": "fade-up" });

    init();

    expect(el.classList.contains("scroll-animate")).toBe(true);
    expect(el.classList.contains("aos-init")).toBe(true);

    refreshHard();

    // Element should still have animation (re-processed)
    expect(el.classList.contains("scroll-animate")).toBe(true);
    expect(el.getAttribute("data-animation")).toBe("fade-up");
    expect(el.classList.contains("aos-init")).toBe(true);
    // New sentinel created after refresh
    const newSentinel = getSentinel(el);
    expect(newSentinel).not.toBeNull();
  });

  // ─── 10. disable() → removes data-aos attributes ──────────────────────────
  it("disable() removes data-aos attributes and classes", () => {
    const el = createAOSElement({
      "data-aos": "fade",
      "data-aos-duration": "500",
      "data-aos-delay": "100",
      "data-aos-easing": "ease-in-out",
      "data-aos-offset": "150",
    });

    init();

    // Verify attributes exist before disable
    expect(el.hasAttribute("data-aos")).toBe(true);
    expect(el.hasAttribute("data-aos-duration")).toBe(true);
    expect(el.classList.contains("aos-init")).toBe(true);

    disable();

    // All data-aos-* attributes removed
    expect(el.hasAttribute("data-aos")).toBe(false);
    expect(el.hasAttribute("data-aos-duration")).toBe(false);
    expect(el.hasAttribute("data-aos-delay")).toBe(false);
    expect(el.hasAttribute("data-aos-easing")).toBe(false);
    expect(el.hasAttribute("data-aos-offset")).toBe(false);
    // Init class removed
    expect(el.classList.contains("aos-init")).toBe(false);
  });

  // ─── 11. Legacy mapping ────────────────────────────────────────────────────
  it('legacy mapping: data-aos="fade-in" resolves to animation "fade"', () => {
    const el = createAOSElement({ "data-aos": "fade-in" });

    init();

    // "fade-in" is a legacy name that should resolve to "fade"
    expect(el.getAttribute("data-animation")).toBe("fade");
  });

  // ─── 12. initClassName ─────────────────────────────────────────────────────
  it("initClassName: adds aos-init class to elements", () => {
    const el = createAOSElement({ "data-aos": "fade-up" });

    init();

    expect(el.classList.contains("aos-init")).toBe(true);
  });

  it("initClassName: custom initClassName is applied when provided", () => {
    const el = createAOSElement({ "data-aos": "fade-up" });

    init({ initClassName: "custom-init" });

    expect(el.classList.contains("custom-init")).toBe(true);
  });

  // ─── 13. SSR guard ─────────────────────────────────────────────────────────
  it("SSR guard: init() is no-op when window is undefined", () => {
    const el = createAOSElement({ "data-aos": "fade-up" });

    // Remove global window to simulate SSR
    const savedWindow = globalThis.window;
    delete globalThis.window;

    // init() should silently return without error
    expect(() => init()).not.toThrow();

    // Element should NOT have been processed
    expect(el.classList.contains("scroll-animate")).toBe(false);
    expect(el.getAttribute("data-animation")).toBeNull();

    // Restore
    globalThis.window = savedWindow;
  });
});
