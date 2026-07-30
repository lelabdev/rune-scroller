import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { animate } from "../src/lib/animate.js";
import { mockIntersectionObserver } from "./__mocks__/IntersectionObserver.js";

let window;
let document;

beforeEach(() => {
  window = new Window();
  document = window.document;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.getComputedStyle = () => ({
    transitionProperty: "opacity, transform",
  });
  mockIntersectionObserver.install();
});

afterEach(() => {
  mockIntersectionObserver.reset();
  mockIntersectionObserver.uninstall();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.getComputedStyle;
});

describe("animate integration", () => {
  it("keeps flex children in place while animating independently", () => {
    const container = document.createElement("div");
    container.style.display = "flex";
    const first = document.createElement("div");
    const second = document.createElement("div");
    container.append(first, second);
    document.body.appendChild(container);

    const firstAction = animate(first, { animation: "fade-up" });
    const secondAction = animate(second, { animation: "zoom-in" });

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
    const action = animate(element, { animation: "fade" });
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
    const action = animate(element, { animation: "fade", offset: 0 });

    action.update({ offset: 100 });
    const replacementObserver =
      mockIntersectionObserver.getObserverFor(element);
    expect(replacementObserver?.options.rootMargin).toBe("0px 0px 100px 0px");
    action.destroy();

    expect(replacementObserver?.isConnected).toBe(false);
  });

  it("reconnects when a completed action becomes repeating", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const action = animate(element, { animation: "fade" });

    mockIntersectionObserver.trigger(element, true);
    expect(mockIntersectionObserver.getObserverFor(element)).toBeUndefined();

    action.update({ repeat: true });
    expect(mockIntersectionObserver.getObserverFor(element)).toBeDefined();

    mockIntersectionObserver.trigger(element, false);
    expect(element.classList.contains("is-visible")).toBe(false);
    action.destroy();
  });

  it("preserves a custom target and root margin when an update passes them", () => {
    const element = document.createElement("div");
    const target = document.createElement("span");
    element.appendChild(target);
    document.body.appendChild(element);
    const action = animate(element, {
      animation: "fade",
      observerTarget: target,
      rootMargin: "10px 20px 30px 40px",
    });

    action.update({
      observerTarget: target,
      rootMargin: "10px 20px 30px 40px",
      threshold: 0.75,
    });
    const replacementObserver = mockIntersectionObserver.getObserverFor(target);

    expect(replacementObserver).toBeDefined();
    expect(replacementObserver?.options.rootMargin).toBe("10px 20px 30px 40px");
    expect(replacementObserver?.options.threshold).toBe(0.75);
    expect(mockIntersectionObserver.getObserverFor(element)).toBeUndefined();
    action.destroy();
  });

  it("shares observers with matching options and releases each target independently", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");
    document.body.append(first, second);

    const firstAction = animate(first, { animation: "fade", offset: 120 });
    const secondAction = animate(second, {
      animation: "zoom-in",
      offset: 120,
    });
    const sharedObserver = mockIntersectionObserver.getObserverFor(first);

    expect(mockIntersectionObserver.getAll()).toHaveLength(1);
    expect(mockIntersectionObserver.getObserverFor(second)).toBe(
      sharedObserver,
    );

    firstAction.destroy();
    expect(mockIntersectionObserver.getObserverFor(first)).toBeUndefined();
    expect(mockIntersectionObserver.getObserverFor(second)).toBe(
      sharedObserver,
    );

    secondAction.destroy();
    expect(mockIntersectionObserver.getAll()).toHaveLength(0);
  });

  it("does not share observers with different options", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");
    document.body.append(first, second);

    const firstAction = animate(first, { animation: "fade", offset: 120 });
    const secondAction = animate(second, {
      animation: "fade",
      offset: 240,
    });

    expect(mockIntersectionObserver.getAll()).toHaveLength(2);

    firstAction.destroy();
    secondAction.destroy();
  });

  it("keeps a caller-defined position when destroyed", () => {
    const element = document.createElement("div");
    element.style.position = "absolute";
    document.body.appendChild(element);

    const action = animate(element, { animation: "fade" });
    action.destroy();

    expect(element.style.position).toBe("absolute");
  });
});
