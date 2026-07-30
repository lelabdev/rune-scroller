import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { animate } from "../src/lib/animate.js";
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

describe("animate DOM core", () => {
  it("uses fade-in as the default animation", () => {
    action = animate(element);

    expect(element.getAttribute("data-animation")).toBe("fade-in");
  });

  it("observes the animated element without changing its positioning", () => {
    action = animate(element, { animation: "fade-up" });

    expect(mockIntersectionObserver.getObserverFor(element)).toBeDefined();
    expect(element.querySelector("[data-sentinel-id]")).toBeNull();
    expect(element.style.position).toBe("");
  });

  it("does not force layout during animation setup", () => {
    Object.defineProperty(element, "offsetHeight", {
      get() {
        throw new Error("forced layout");
      },
    });

    expect(() => {
      action = animate(element, { animation: "fade" });
    }).not.toThrow();
  });

  it("uses a positive offset to extend the viewport bottom", () => {
    action = animate(element, { animation: "fade", offset: 120 });

    expect(
      mockIntersectionObserver.getObserverFor(element)?.options.rootMargin,
    ).toBe("0px 0px 120px 0px");
  });

  it("adds the visible class and invokes onVisible on intersection", () => {
    let visibleElement;
    action = animate(element, {
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
    action = animate(element, { animation: "fade", repeat: true });

    mockIntersectionObserver.trigger(element, true);
    mockIntersectionObserver.trigger(element, false);

    expect(element.classList.contains("is-visible")).toBe(false);
  });

  it("applies duration, delay, easing, and animation options", () => {
    action = animate(element, {
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
});

describe("animate update lifecycle (replacement semantics)", () => {
  it("applies zero duration and delay through update", () => {
    action = animate(element, {
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
    action = animate(element, {
      animation: "fade",
      repeat: true,
      onVisible: () => firstCalls++,
    });

    action.update({ onVisible: () => secondCalls++ });
    mockIntersectionObserver.trigger(element, true);

    expect(firstCalls).toBe(0);
    expect(secondCalls).toBe(1);
  });

  it("handles replacement updates with a reused options object", () => {
    const options = {
      animation: "fade",
      duration: 300,
      debug: true,
      threshold: 0,
    };
    action = animate(element, options);

    delete options.duration;
    options.debug = false;
    options.threshold = 1;
    action.update(options);

    expect(element.style.getPropertyValue("--duration")).toBe("");
    expect(element.querySelector("[data-sentinel-debug]")).toBeNull();
    expect(
      mockIntersectionObserver.getObserverFor(element)?.options.threshold,
    ).toBe(1);
  });

  it("does not retain a duration removed by a reactive update", () => {
    action = animate(element, { animation: "fade", duration: 300 });

    expect(element.style.getPropertyValue("--duration")).toBe("300ms");

    action.update({ animation: "fade" });

    expect(element.style.getPropertyValue("--duration")).toBe("");
  });

  it("removes duration while delay remains through update", () => {
    action = animate(element, {
      animation: "fade",
      duration: 500,
      delay: 100,
    });

    expect(element.style.getPropertyValue("--duration")).toBe("500ms");
    expect(element.style.getPropertyValue("--delay")).toBe("100ms");

    action.update({ animation: "fade", delay: 100 });

    expect(element.style.getPropertyValue("--duration")).toBe("");
    expect(element.style.getPropertyValue("--delay")).toBe("100ms");
  });

  it("removes delay while duration remains through update", () => {
    action = animate(element, {
      animation: "fade",
      duration: 500,
      delay: 100,
    });

    expect(element.style.getPropertyValue("--duration")).toBe("500ms");
    expect(element.style.getPropertyValue("--delay")).toBe("100ms");

    action.update({ animation: "fade", duration: 500 });

    expect(element.style.getPropertyValue("--duration")).toBe("500ms");
    expect(element.style.getPropertyValue("--delay")).toBe("");
  });

  it("does not retain a debug indicator removed by a reactive update", () => {
    action = animate(element, { animation: "fade", debug: true });

    expect(element.querySelector("[data-sentinel-debug]")).not.toBeNull();

    action.update({ animation: "fade" });

    expect(element.querySelector("[data-sentinel-debug]")).toBeNull();
    expect(element.hasAttribute("data-sentinel-id")).toBe(false);
  });

  it("does not retain an easing removed by a reactive update", () => {
    action = animate(element, { animation: "fade", easing: "linear" });

    expect(element.style.getPropertyValue("--easing")).toBe("linear");

    action.update({ animation: "fade" });

    expect(element.style.getPropertyValue("--easing")).toBe("");
  });

  it("reverts to observing the element when an observer target is removed", () => {
    const target = document.createElement("span");
    element.appendChild(target);
    action = animate(element, {
      animation: "fade",
      observerTarget: target,
    });

    expect(mockIntersectionObserver.getObserverFor(target)).toBeDefined();

    action.update({ animation: "fade" });

    expect(mockIntersectionObserver.getObserverFor(element)).toBeDefined();
    expect(mockIntersectionObserver.getObserverFor(target)).toBeUndefined();
  });

  it("replaces the debug sentinel ID through update", () => {
    action = animate(element, {
      animation: "fade",
      debug: true,
      sentinelId: "first",
    });

    action.update({ animation: "fade", debug: true, sentinelId: "second" });
    expect(element.getAttribute("data-sentinel-id")).toBe("second");

    action.update({ animation: "fade", debug: true });
    expect(element.getAttribute("data-sentinel-id")).not.toBe("second");
  });

  it("creates and removes the debug indicator through update", () => {
    action = animate(element, { animation: "fade" });

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

    action = animate(element, { animation: "fade" });
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
    action = animate(element, { animation: "fade" });

    action.update({ animation: "not-an-animation" });

    expect(element.getAttribute("data-animation")).toBe("fade-in");
    expect(warnings).toHaveLength(1);
    console.warn = originalWarn;
  });

  it("restores a previously removed duration when it is re-added", () => {
    action = animate(element, { animation: "fade", duration: 300 });

    action.update({ animation: "fade" });
    expect(element.style.getPropertyValue("--duration")).toBe("");

    action.update({ animation: "fade", duration: 600 });
    expect(element.style.getPropertyValue("--duration")).toBe("600ms");
  });
});

describe("animate cleanup", () => {
  it("creates and cleans up a debug sentinel", () => {
    action = animate(element, {
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
    action = animate(element, { animation: "fade", repeat: true });

    expect(element.style.getPropertyValue("will-change")).toBe("");

    mockIntersectionObserver.trigger(element, true);
    expect(element.style.getPropertyValue("will-change")).toBe(
      "transform, opacity",
    );

    element.dispatchEvent(new window.Event("transitionend"));
    expect(element.style.getPropertyValue("will-change")).toBe("");
  });

  it("does not retain a compositor hint for zero-duration animations", () => {
    action = animate(element, {
      animation: "fade",
      duration: 0,
      delay: 0,
    });

    mockIntersectionObserver.trigger(element, true);

    expect(element.style.getPropertyValue("will-change")).toBe("");
  });

  it("skips compositor hints when reduced motion is enabled", () => {
    window.matchMedia = () => ({ matches: true });
    action = animate(element, { animation: "fade" });

    mockIntersectionObserver.trigger(element, true);

    expect(element.style.getPropertyValue("will-change")).toBe("");
  });

  it("restores action-owned DOM state on destroy", () => {
    action = animate(element, {
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

    action = animate(element, {
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
    action = animate(element, {
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

    const ssrAction = animate(element, { animation: "fade" });

    expect(typeof ssrAction.update).toBe("function");
    expect(typeof ssrAction.destroy).toBe("function");
    globalThis.window = browserWindow;
  });
});
