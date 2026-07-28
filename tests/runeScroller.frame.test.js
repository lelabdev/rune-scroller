import { describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { runeScroller } from "../src/lib/runeScroller.js";

describe("runeScroller scheduling", () => {
  it("uses the animation frame scheduler from the browser window", () => {
    const window = new Window();
    const document = window.document;
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalIntersectionObserver = globalThis.IntersectionObserver;
    const originalGetComputedStyle = globalThis.getComputedStyle;

    globalThis.window = window;
    globalThis.document = document;
    globalThis.getComputedStyle = () => ({ animation: "fade" });
    globalThis.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    };

    const element = document.createElement("div");
    document.body.appendChild(element);

    expect(() => runeScroller(element, { animation: "fade" })).not.toThrow();

    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.IntersectionObserver = originalIntersectionObserver;
    globalThis.getComputedStyle = originalGetComputedStyle;
  });
});
