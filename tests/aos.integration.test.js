import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { destroy, init, refreshHard } from "../src/lib/aos.js";
import { mockIntersectionObserver } from "./__mocks__/IntersectionObserver.js";

let window;
let document;

function addElement(animation) {
  const element = document.createElement("div");
  element.setAttribute("data-aos", animation);
  document.body.appendChild(element);
  return element;
}

beforeEach(() => {
  window = new Window();
  document = window.document;
  Object.defineProperty(document, "readyState", { value: "complete" });
  globalThis.window = window;
  globalThis.document = document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.MutationObserver = window.MutationObserver;
  globalThis.getComputedStyle = () => ({ animation: "fade" });
  mockIntersectionObserver.install();
});

afterEach(() => {
  destroy();
  mockIntersectionObserver.reset();
  mockIntersectionObserver.uninstall();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.HTMLElement;
  delete globalThis.MutationObserver;
  delete globalThis.getComputedStyle;
});

describe("AOS integration", () => {
  it("animates each supported element independently", () => {
    const fade = addElement("fade-up");
    const zoom = addElement("zoom-in");
    const slide = addElement("slide-left");

    init({ once: true });
    mockIntersectionObserver.trigger(zoom, true);

    expect(fade.getAttribute("data-animation")).toBe("fade-up");
    expect(zoom.classList.contains("is-visible")).toBe(true);
    expect(slide.classList.contains("is-visible")).toBe(false);
  });

  it("processes new elements after an explicit hard refresh", () => {
    const first = addElement("fade");
    init();
    const second = addElement("bounce-in");

    refreshHard();

    expect(first.getAttribute("data-animation")).toBe("fade");
    expect(second.getAttribute("data-animation")).toBe("bounce-in");
  });

  it("does nothing during SSR", () => {
    const element = addElement("fade");
    const browserWindow = globalThis.window;
    delete globalThis.window;

    init();

    expect(element.hasAttribute("data-animation")).toBe(false);
    globalThis.window = browserWindow;
  });
});
