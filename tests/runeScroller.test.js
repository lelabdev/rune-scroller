import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { runeScroller } from "../src/lib/runeScroller.js";
import { mockIntersectionObserver } from "./__mocks__/IntersectionObserver.js";

let window;
let document;
let element;
let action;

beforeEach(() => {
  window = new Window();
  document = window.document;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.getComputedStyle = () => ({
    transitionProperty: "opacity, transform",
  });
  mockIntersectionObserver.install();

  element = document.createElement("div");
  document.body.appendChild(element);
});

afterEach(() => {
  action?.destroy();
  mockIntersectionObserver.reset();
  mockIntersectionObserver.uninstall();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.getComputedStyle;
});

describe("runeScroller action", () => {
  it("uses fade-in as the default animation", () => {
    action = runeScroller(element);

    expect(element.getAttribute("data-animation")).toBe("fade-in");
  });

  it("observes the animated element without changing its positioning", () => {
    action = runeScroller(element, { animation: "fade-up" });

    expect(mockIntersectionObserver.getObserverFor(element)).toBeDefined();
    expect(element.querySelector("[data-sentinel-id]")).toBeNull();
    expect(element.style.position).toBe("");
  });

  it("uses a positive offset to extend the viewport bottom", () => {
    action = runeScroller(element, { animation: "fade", offset: 120 });

    expect(
      mockIntersectionObserver.getObserverFor(element)?.options.rootMargin,
    ).toBe("0px 0px 120px 0px");
  });

  it("adds the visible class and invokes onVisible on intersection", () => {
    let visibleElement;
    action = runeScroller(element, {
      animation: "fade",
      onVisible: (target) => {
        visibleElement = target;
      },
    });

    mockIntersectionObserver.trigger(element, true);

    expect(element.classList.contains("is-visible")).toBe(true);
    expect(visibleElement).toBe(element);
  });

  it("removes the visible class on exit in repeat mode", () => {
    action = runeScroller(element, { animation: "fade", repeat: true });

    mockIntersectionObserver.trigger(element, true);
    mockIntersectionObserver.trigger(element, false);

    expect(element.classList.contains("is-visible")).toBe(false);
  });

  it("applies duration, delay, easing, and animation options", () => {
    action = runeScroller(element, {
      animation: "zoom-in",
      duration: 0,
      delay: 0,
      easing: "linear",
    });

    expect(element.getAttribute("data-animation")).toBe("zoom-in");
    expect(element.style.getPropertyValue("--duration")).toBe("0ms");
    expect(element.style.getPropertyValue("--delay")).toBe("0ms");
    expect(element.style.getPropertyValue("--easing")).toBe("linear");
  });

  it("applies zero duration and delay through update", () => {
    action = runeScroller(element, {
      animation: "fade",
      duration: 300,
      delay: 300,
    });

    action.update({ duration: 0, delay: 0 });

    expect(element.style.getPropertyValue("--duration")).toBe("0ms");
    expect(element.style.getPropertyValue("--delay")).toBe("0ms");
  });

  it("replaces the visibility callback through update", () => {
    let firstCalls = 0;
    let secondCalls = 0;
    action = runeScroller(element, {
      animation: "fade",
      repeat: true,
      onVisible: () => firstCalls++,
    });

    action.update({ onVisible: () => secondCalls++ });
    mockIntersectionObserver.trigger(element, true);

    expect(firstCalls).toBe(0);
    expect(secondCalls).toBe(1);
  });

  it("creates and removes the debug indicator through update", () => {
    action = runeScroller(element, { animation: "fade" });

    action.update({ debug: true, sentinelId: "updated-debug" });
    expect(element.querySelector("[data-sentinel-debug]")).not.toBeNull();

    action.update({ debug: false });
    expect(element.querySelector("[data-sentinel-debug]")).toBeNull();
    expect(element.hasAttribute("data-sentinel-id")).toBe(false);
  });

  it("starts and stops resize tracking with debug updates", () => {
    const originalResizeObserver = globalThis.ResizeObserver;
    const instances = [];
    globalThis.ResizeObserver = class {
      constructor() {
        this.disconnected = false;
        instances.push(this);
      }
      observe() {}
      disconnect() {
        this.disconnected = true;
      }
    };

    action = runeScroller(element, { animation: "fade" });
    action.update({ debug: true });
    expect(instances).toHaveLength(1);
    expect(instances[0].disconnected).toBe(false);

    action.update({ debug: false });
    expect(instances[0].disconnected).toBe(true);
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it("validates animation names supplied through update", () => {
    const originalWarn = console.warn;
    const warnings = [];
    console.warn = (message) => warnings.push(message);
    action = runeScroller(element, { animation: "fade" });

    action.update({ animation: /** @type {*} */ ("not-an-animation") });

    expect(element.getAttribute("data-animation")).toBe("fade-in");
    expect(warnings).toHaveLength(1);
    console.warn = originalWarn;
  });

  it("creates and cleans up a debug sentinel", () => {
    action = runeScroller(element, {
      animation: "fade",
      debug: true,
      debugLabel: "trigger",
    });

    const sentinel = element.querySelector("[data-sentinel-debug]");
    expect(sentinel?.textContent).toBe("trigger");
    expect(element.style.position).toBe("relative");

    action.destroy();
    expect(element.querySelector("[data-sentinel-debug]")).toBeNull();
    expect(element.hasAttribute("data-sentinel-id")).toBe(false);
  });

  it("uses will-change only while an animation is active", () => {
    action = runeScroller(element, { animation: "fade", repeat: true });

    expect(element.style.getPropertyValue("will-change")).toBe("");

    mockIntersectionObserver.trigger(element, true);
    expect(element.style.getPropertyValue("will-change")).toBe(
      "transform, opacity",
    );

    element.dispatchEvent(new window.Event("transitionend"));
    expect(element.style.getPropertyValue("will-change")).toBe("");
  });

  it("does not retain a compositor hint for zero-duration animations", () => {
    action = runeScroller(element, {
      animation: "fade",
      duration: 0,
      delay: 0,
    });

    mockIntersectionObserver.trigger(element, true);

    expect(element.style.getPropertyValue("will-change")).toBe("");
  });

  it("skips compositor hints when reduced motion is enabled", () => {
    window.matchMedia = () => ({ matches: true });
    action = runeScroller(element, { animation: "fade" });

    mockIntersectionObserver.trigger(element, true);

    expect(element.style.getPropertyValue("will-change")).toBe("");
  });

  it("restores action-owned DOM state on destroy", () => {
    action = runeScroller(element, {
      animation: "fade",
      duration: 800,
      delay: 100,
      easing: "linear",
      repeat: true,
    });
    mockIntersectionObserver.trigger(element, true);

    action.destroy();

    expect(element.hasAttribute("data-animation")).toBe(false);
    expect(element.classList.contains("scroll-animate")).toBe(false);
    expect(element.classList.contains("is-visible")).toBe(false);
    expect(element.style.getPropertyValue("--duration")).toBe("");
    expect(element.style.getPropertyValue("--delay")).toBe("");
    expect(element.style.getPropertyValue("--easing")).toBe("");
  });

  it("preserves caller-owned DOM state on destroy", () => {
    element.classList.add("scroll-animate", "is-visible");
    element.setAttribute("data-animation", "caller-animation");
    element.setAttribute("data-sentinel-id", "caller-sentinel");
    element.style.setProperty("--duration", "2s");
    element.style.setProperty("--delay", "1s");
    element.style.setProperty("--easing", "steps(2)");

    action = runeScroller(element, {
      animation: "fade",
      duration: 800,
      debug: true,
    });
    action.destroy();

    expect(element.getAttribute("data-animation")).toBe("caller-animation");
    expect(element.classList.contains("scroll-animate")).toBe(true);
    expect(element.classList.contains("is-visible")).toBe(true);
    expect(element.getAttribute("data-sentinel-id")).toBe("caller-sentinel");
    expect(element.style.getPropertyValue("--duration")).toBe("2s");
    expect(element.style.getPropertyValue("--delay")).toBe("1s");
    expect(element.style.getPropertyValue("--easing")).toBe("steps(2)");
  });

  it("restores positioning added for an internal observer target", () => {
    const target = document.createElement("span");
    element.appendChild(target);
    action = runeScroller(element, {
      animation: "fade",
      observerTarget: target,
    });
    expect(element.style.position).toBe("relative");

    action.destroy();

    expect(element.style.position).toBe("");
  });

  it("returns a no-op action during SSR", () => {
    const browserWindow = globalThis.window;
    delete globalThis.window;

    const ssrAction = runeScroller(element, { animation: "fade" });

    expect(typeof ssrAction.update).toBe("function");
    expect(typeof ssrAction.destroy).toBe("function");
    globalThis.window = browserWindow;
  });
});
