import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { runeScroller } from "../src/lib/runeScroller.js";
import { mockIntersectionObserver } from "./__mocks__/IntersectionObserver.js";

let window;
let document;

beforeEach(() => {
  window = new Window();
  document = window.document;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.getComputedStyle = () => ({ animation: "fade" });
  mockIntersectionObserver.install();
});

afterEach(() => {
  mockIntersectionObserver.reset();
  mockIntersectionObserver.uninstall();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.getComputedStyle;
});

describe("runeScroller integration", () => {
  it("keeps flex children in place while animating independently", () => {
    const container = document.createElement("div");
    container.style.display = "flex";
    const first = document.createElement("div");
    const second = document.createElement("div");
    container.append(first, second);
    document.body.appendChild(container);

    const firstAction = runeScroller(first, { animation: "fade-up" });
    const secondAction = runeScroller(second, { animation: "zoom-in" });

    mockIntersectionObserver.trigger(first, true);

    expect(container.children).toHaveLength(2);
    expect(first.classList.contains("is-visible")).toBe(true);
    expect(second.classList.contains("is-visible")).toBe(false);

    firstAction.destroy();
    secondAction.destroy();
  });

  it("disconnects a non-repeating observer after the first intersection", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const action = runeScroller(element, { animation: "fade" });
    const observer = mockIntersectionObserver.getObserverFor(element);

    mockIntersectionObserver.trigger(element, true);

    expect(mockIntersectionObserver.getObserverFor(element)).toBeUndefined();
    expect(element.classList.contains("is-visible")).toBe(true);
    action.destroy();
    expect(observer?.isConnected).toBe(false);
  });

  it("disconnects a replacement observer when the action is destroyed", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const action = runeScroller(element, { animation: "fade", offset: 0 });

    action.update({ offset: 100 });
    const replacementObserver =
      mockIntersectionObserver.getObserverFor(element);
    action.destroy();

    expect(replacementObserver?.isConnected).toBe(false);
  });

  it("keeps a caller-defined position when destroyed", () => {
    const element = document.createElement("div");
    element.style.position = "absolute";
    document.body.appendChild(element);

    const action = runeScroller(element, { animation: "fade" });
    action.destroy();

    expect(element.style.position).toBe("absolute");
  });
});
