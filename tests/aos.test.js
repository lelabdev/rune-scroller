import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import AOS, { destroy, disable, init, refreshHard } from "../src/lib/aos.js";
import { mockIntersectionObserver } from "./__mocks__/IntersectionObserver.js";

let window;
let document;

function createAOSElement(attributes = {}) {
  const element = document.createElement("div");
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
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

describe("AOS compatibility API", () => {
  it("processes data-aos attributes with their inline options", () => {
    const element = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-duration": "800",
      "data-aos-delay": "200",
      "data-aos-easing": "linear",
    });

    init();

    expect(element.getAttribute("data-animation")).toBe("fade-up");
    expect(element.classList.contains("aos-init")).toBe(true);
    expect(element.style.getPropertyValue("--duration")).toBe("800ms");
    expect(element.style.getPropertyValue("--delay")).toBe("200ms");
    expect(element.style.getPropertyValue("--easing")).toBe("linear");
  });

  it("maps legacy AOS animation names", () => {
    const element = createAOSElement({ "data-aos": "fade-in-up" });

    init();

    expect(element.getAttribute("data-animation")).toBe("fade-up");
  });

  it("passes intersection events through to the action", () => {
    const element = createAOSElement({ "data-aos": "fade" });
    init({ once: true });

    mockIntersectionObserver.trigger(element, true);

    expect(element.classList.contains("is-visible")).toBe(true);
  });

  it("refreshHard reapplies animation to existing AOS elements", () => {
    const element = createAOSElement({ "data-aos": "zoom-in" });
    init();
    refreshHard();

    expect(element.getAttribute("data-animation")).toBe("zoom-in");
    expect(element.classList.contains("scroll-animate")).toBe(true);
  });

  it("removes supported data attributes with disable", () => {
    const element = createAOSElement({
      "data-aos": "fade",
      "data-aos-duration": "500",
      "data-aos-delay": "100",
    });
    init();
    disable();

    expect(element.hasAttribute("data-aos")).toBe(false);
    expect(element.hasAttribute("data-aos-duration")).toBe(false);
    expect(element.hasAttribute("data-aos-delay")).toBe(false);
  });

  it("exposes the documented AOS API", () => {
    expect(typeof AOS.init).toBe("function");
    expect(typeof AOS.refresh).toBe("function");
    expect(typeof AOS.refreshHard).toBe("function");
    expect(typeof AOS.disable).toBe("function");
    expect(typeof AOS.destroy).toBe("function");
  });
});
