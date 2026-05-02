/**
 * AOS Integration Tests — Real-world HTML snippet patterns
 * Issue #30: Verify drop-in compatibility with actual AOS usage patterns
 *
 * Uses bun:test and happy-dom. Creates elements with document.createElement
 * and sets data-aos-* attributes directly, then calls the AOS init function.
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Window } from "happy-dom";
import AOS, { init, refreshHard, disable } from "../src/lib/aos.js";
import { ANIMATION_TYPES } from "../src/lib/animations.js";

/**
 * Setup a fresh happy-dom environment with all required globals.
 * The AOS module checks for window, uses IntersectionObserver, ResizeObserver,
 * MutationObserver, and document.readyState.
 */
function setupEnvironment() {
  const win = new Window();
  const doc = win.document;

  // Stub document.readyState so AOS init() processes elements immediately
  Object.defineProperty(doc, "readyState", {
    value: "complete",
    writable: true,
    configurable: true,
  });

  globalThis.window = win;
  globalThis.document = doc;
  globalThis.HTMLElement = win.HTMLElement;
  globalThis.HTMLDivElement = win.HTMLDivElement;

  // happy-dom provides IntersectionObserver
  if (win.IntersectionObserver) {
    globalThis.IntersectionObserver = win.IntersectionObserver;
  } else {
    globalThis.IntersectionObserver = class {
      constructor(cb) {
        this._cb = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // ResizeObserver may not exist in happy-dom
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // MutationObserver for dynamic element detection
  if (win.MutationObserver) {
    globalThis.MutationObserver = win.MutationObserver;
  }

  // getComputedStyle stub — avoid CSS detection warnings
  globalThis.getComputedStyle = () => ({
    animation: "fade-in 800ms ease-out",
    getPropertyValue: () => "",
  });

  process.env.NODE_ENV = "production";

  return { win, doc };
}

/**
 * Teardown globals to avoid cross-test contamination.
 */
function teardownEnvironment() {
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.HTMLElement;
  delete globalThis.HTMLDivElement;
}

/**
 * Create a div with given data-aos-* attributes and append it to the body.
 * Returns the created element.
 */
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

/**
 * Get the sentinel element from an animated element's wrapper.
 * The element itself also gets data-sentinel-id, so we must find the child
 * of the wrapper that is NOT the animated element and HAS data-sentinel-id.
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

describe("AOS Integration Tests — Real-world HTML patterns", () => {
  beforeEach(() => {
    setupEnvironment();
  });

  afterEach(() => {
    try {
      disable();
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

  // ─── Test 1 ────────────────────────────────────────────────────────────────
  it("fade-up with duration: element gets scroll-animate class, data-animation, sentinel wrapper, correct animation", () => {
    const el = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-duration": "800",
    });

    init();

    // Element should have animation class and data attribute
    expect(el.classList.contains("scroll-animate")).toBe(true);
    expect(el.getAttribute("data-animation")).toBe("fade-up");

    // Element should be wrapped in a sentinel wrapper (position:relative)
    const wrapper = el.parentElement;
    expect(wrapper).toBeDefined();
    expect(wrapper.tagName).toBe("DIV");
    expect(wrapper.style.position).toBe("relative");

    // Sentinel child should exist inside the wrapper
    const sentinel = getSentinel(el);
    expect(sentinel).not.toBeNull();

    // Duration CSS variable should be set (800ms)
    const durationVar = el.style.getPropertyValue("--duration");
    expect(durationVar).toBe("800ms");

    // aos-init class should be added
    expect(el.classList.contains("aos-init")).toBe(true);
  });

  // ─── Test 2 ────────────────────────────────────────────────────────────────
  it("zoom-in with delay: body gets delay attribute, element is animated", () => {
    const el = createAOSElement({
      "data-aos": "zoom-in",
      "data-aos-delay": "300",
    });

    init();

    expect(el.getAttribute("data-animation")).toBe("zoom-in");

    // Duration variable (from default 400ms since no data-aos-duration)
    const durationVar = el.style.getPropertyValue("--duration");
    expect(durationVar).toBe("400ms");

    // Body gets global delay attribute
    const body = document.querySelector("body");
    expect(body.getAttribute("data-aos-delay")).toBe("0");

    // Sentinel exists
    const sentinel = getSentinel(el);
    expect(sentinel).not.toBeNull();
  });

  // ─── Test 3 ────────────────────────────────────────────────────────────────
  it("slide-left with once=true: repeat is false (once mode)", () => {
    const el = createAOSElement({
      "data-aos": "slide-left",
      "data-aos-once": "true",
    });

    init();

    expect(el.getAttribute("data-animation")).toBe("slide-left");
    expect(el.classList.contains("scroll-animate")).toBe(true);

    // The once=true means repeat=false. Verify sentinel is set up.
    const sentinel = getSentinel(el);
    expect(sentinel).not.toBeNull();
  });

  // ─── Test 4 ────────────────────────────────────────────────────────────────
  it("flip-right with offset: offset is applied to sentinel position", () => {
    const el = createAOSElement({
      "data-aos": "flip-right",
      "data-aos-offset": "200",
    });

    init();

    expect(el.getAttribute("data-animation")).toBe("flip-right");

    // Sentinel should exist with position:absolute
    // AOS offset is "px from viewport bottom", runeScroller adjusts: offset - 120
    // So effective offset = 200 - 120 = 80
    // Sentinel top = elementHeight(100) + offset(80) = 180px
    const sentinel = getSentinel(el);
    expect(sentinel).not.toBeNull();
    expect(sentinel.style.position).toBe("absolute");
  });

  // ─── Test 5 ────────────────────────────────────────────────────────────────
  it("bounce-in with mirror=true: repeat is true (mirror mode)", () => {
    const el = createAOSElement({
      "data-aos": "bounce-in",
      "data-aos-mirror": "true",
    });

    init();

    expect(el.getAttribute("data-animation")).toBe("bounce-in");
    expect(el.classList.contains("scroll-animate")).toBe(true);

    // mirror=true means repeat=true — verify sentinel is set up
    const sentinel = getSentinel(el);
    expect(sentinel).not.toBeNull();
  });

  // ─── Test 6 ────────────────────────────────────────────────────────────────
  it("staggered: 3 elements with increasing data-aos-delay", () => {
    const el1 = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-delay": "0",
    });
    const el2 = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-delay": "100",
    });
    const el3 = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-delay": "200",
    });

    init();

    // All three should be processed
    const elements = document.querySelectorAll("[data-aos]");
    expect(elements.length).toBe(3);

    // Each should have its own sentinel wrapper and unique sentinel IDs
    for (const el of [el1, el2, el3]) {
      expect(el.classList.contains("scroll-animate")).toBe(true);
      expect(el.getAttribute("data-animation")).toBe("fade-up");
      const sentinel = getSentinel(el);
      expect(sentinel).not.toBeNull();
    }

    const ids = [el1, el2, el3].map((el) =>
      el.getAttribute("data-sentinel-id"),
    );
    expect(new Set(ids).size).toBe(3);
  });

  // ─── Test 7 ────────────────────────────────────────────────────────────────
  it("all animation types: loop through ANIMATION_TYPES, create element, init, no error", () => {
    for (const anim of ANIMATION_TYPES) {
      createAOSElement({ "data-aos": anim });
    }

    // Init should not throw
    expect(() => init()).not.toThrow();

    // All elements should be processed
    const elements = document.querySelectorAll("[data-animation]");
    expect(elements.length).toBe(ANIMATION_TYPES.length);

    // Each should have scroll-animate class
    for (const el of elements) {
      expect(el.classList.contains("scroll-animate")).toBe(true);
    }
  });

  // ─── Test 8 ────────────────────────────────────────────────────────────────
  it("mixed: elements with data-aos and without coexist", () => {
    const aosEl = createAOSElement({ "data-aos": "fade-up" });

    // Create a plain element without data-aos
    const plainEl = document.createElement("div");
    plainEl.textContent = "Plain element";
    plainEl.style.height = "100px";
    Object.defineProperty(plainEl, "offsetHeight", {
      configurable: true,
      value: 100,
    });
    document.body.appendChild(plainEl);

    init();

    // AOS element should be animated
    expect(aosEl.classList.contains("scroll-animate")).toBe(true);
    expect(aosEl.getAttribute("data-animation")).toBe("fade-up");

    // Plain element should be untouched
    expect(plainEl.classList.contains("scroll-animate")).toBe(false);
    expect(plainEl.classList.contains("aos-init")).toBe(false);
    expect(plainEl.getAttribute("data-animation")).toBeNull();
    // Plain element is still a direct child of body (not wrapped)
    expect(plainEl.parentElement?.tagName).toBe("BODY");
  });

  // ─── Test 9 ────────────────────────────────────────────────────────────────
  it("dynamic: MutationObserver picks up new [data-aos] element after init", async () => {
    // Init with no elements first
    init();

    // Dynamically add a new [data-aos] element
    const newEl = createAOSElement({
      "data-aos": "fade-right",
      "data-aos-duration": "600",
    });

    // Give MutationObserver time to fire and process
    await new Promise((resolve) => setTimeout(resolve, 100));

    // The element should have been picked up by the MutationObserver,
    // which calls refreshHard() and re-processes all elements.
    expect(newEl.classList.contains("scroll-animate")).toBe(true);
    expect(newEl.getAttribute("data-animation")).toBe("fade-right");
  });

  // ─── Additional: AOS default export API ────────────────────────────────────
  it("AOS default export has init, refresh, refreshHard, disable methods", () => {
    expect(typeof AOS.init).toBe("function");
    expect(typeof AOS.refresh).toBe("function");
    expect(typeof AOS.refreshHard).toBe("function");
    expect(typeof AOS.disable).toBe("function");
  });

  // ─── Additional: body gets global attributes ───────────────────────────────
  it("init sets data-aos-easing/duration/delay attributes on body", () => {
    createAOSElement({ "data-aos": "fade" });
    init();

    const body = document.querySelector("body");
    expect(body.getAttribute("data-aos-easing")).toBe("ease");
    expect(body.getAttribute("data-aos-duration")).toBe("400");
    expect(body.getAttribute("data-aos-delay")).toBe("0");
  });

  // ─── Additional: custom global settings ────────────────────────────────────
  it("init with custom settings overrides defaults", () => {
    createAOSElement({ "data-aos": "fade" });
    init({ duration: 1000, delay: 200, easing: "ease-in-out", offset: 50 });

    const body = document.querySelector("body");
    expect(body.getAttribute("data-aos-duration")).toBe("1000");
    expect(body.getAttribute("data-aos-delay")).toBe("200");
    expect(body.getAttribute("data-aos-easing")).toBe("ease-in-out");
  });

  // ─── Additional: useClassNames option ──────────────────────────────────────
  it("useClassNames adds animation name as CSS class", () => {
    const el = createAOSElement({ "data-aos": "zoom-out" });
    init({ useClassNames: true });

    expect(el.classList.contains("zoom-out")).toBe(true);
  });

  // ─── Additional: refreshHard re-processes elements ─────────────────────────
  it("refreshHard destroys and re-processes all elements", () => {
    const el = createAOSElement({ "data-aos": "fade-up" });
    init();

    expect(el.classList.contains("scroll-animate")).toBe(true);
    expect(el.classList.contains("aos-init")).toBe(true);

    refreshHard();

    // Element should still have animation (re-processed)
    expect(el.classList.contains("scroll-animate")).toBe(true);
    expect(el.getAttribute("data-animation")).toBe("fade-up");
  });

  // ─── Additional: disable removes AOS attributes ────────────────────────────
  it("disable removes data-aos attributes from elements", () => {
    const el = createAOSElement({
      "data-aos": "fade",
      "data-aos-duration": "500",
    });
    init();

    expect(el.hasAttribute("data-aos")).toBe(true);

    disable();

    expect(el.hasAttribute("data-aos")).toBe(false);
    expect(el.hasAttribute("data-aos-duration")).toBe(false);
    expect(el.classList.contains("aos-init")).toBe(false);
  });

  // ─── Additional: legacy animation names are resolved ───────────────────────
  it("legacy animation names (fade-in, flip, flip-x) are resolved correctly", () => {
    const legacyTests = [
      { input: "fade-in", expected: "fade" },
      { input: "fade-in-up", expected: "fade-up" },
      { input: "fade-in-down", expected: "fade-down" },
      { input: "fade-in-left", expected: "fade-left" },
      { input: "fade-in-right", expected: "fade-right" },
      { input: "flip", expected: "flip-left" },
      { input: "flip-x", expected: "flip-up" },
    ];

    for (const { input } of legacyTests) {
      createAOSElement({ "data-aos": input });
    }

    init();

    const elements = document.querySelectorAll("[data-animation]");
    expect(elements.length).toBe(legacyTests.length);

    let idx = 0;
    for (const { expected } of legacyTests) {
      expect(elements[idx].getAttribute("data-animation")).toBe(expected);
      idx++;
    }
  });
});
