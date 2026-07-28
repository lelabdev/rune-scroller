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
  globalThis.getComputedStyle = () => ({ animation: "fade" });
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
  it("observes the animated element directly without a sentinel", () => {
    action = runeScroller(element, { animation: "fade-up" });

    expect(mockIntersectionObserver.getObserverFor(element)).toBeDefined();
    expect(element.querySelector("[data-sentinel-id]")).toBeNull();
    expect(element.style.position).toBe("relative");
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

  it("creates and cleans up a debug sentinel", () => {
    action = runeScroller(element, {
      animation: "fade",
      debug: true,
      debugLabel: "trigger",
    });

    const sentinel = element.querySelector("[data-sentinel-debug]");
    expect(sentinel?.textContent).toBe("trigger");

    action.destroy();
    expect(element.querySelector("[data-sentinel-debug]")).toBeNull();
  });

  it("restores a position added by the action on destroy", () => {
    action = runeScroller(element, { animation: "fade" });
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
