import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import AOS, {
  destroy,
  disable,
  init,
  refresh,
  refreshHard,
} from "../src/lib/aos.js";
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
  globalThis.getComputedStyle = () => ({
    transitionProperty: "opacity, transform",
  });
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

  it("makes every public method a no-op during SSR", () => {
    const browserWindow = globalThis.window;
    const browserDocument = globalThis.document;
    delete globalThis.window;
    delete globalThis.document;

    expect(() => init()).not.toThrow();
    expect(() => refresh()).not.toThrow();
    expect(() => refreshHard()).not.toThrow();
    expect(() => disable()).not.toThrow();
    expect(() => destroy()).not.toThrow();

    globalThis.window = browserWindow;
    globalThis.document = browserDocument;
  });

  it("falls back to defaults for malformed numeric inline options", () => {
    const element = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-duration": "invalid",
      "data-aos-delay": "NaN",
      "data-aos-offset": "not-a-number",
    });

    init();

    const anchor = element.querySelector("[data-aos-anchor]");
    expect(element.style.getPropertyValue("--duration")).toBe("400ms");
    expect(element.style.getPropertyValue("--delay")).toBe("0ms");
    expect(anchor?.style.transform).toBe("translateY(-120px)");
  });

  it("uses valid observer margins for non-default anchor placement", () => {
    const element = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-anchor-placement": "top-center",
    });

    init();

    const anchor = element.querySelector("[data-aos-anchor]");
    expect(anchor?.style.top).toBe("0%");
    expect(anchor?.style.transform).toBe("translateY(-120px)");
    expect(
      mockIntersectionObserver.getObserverFor(anchor)?.options.rootMargin,
    ).toBe("0px 0px -50% 0px");
  });

  it("uses a positive AOS offset to shift the observed anchor", () => {
    const element = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-offset": "120",
    });

    init();

    const anchor = element.querySelector("[data-aos-anchor]");
    expect(anchor?.style.transform).toBe("translateY(-120px)");
    expect(
      mockIntersectionObserver.getObserverFor(anchor)?.options.rootMargin,
    ).toBe("0px 0px 0% 0px");
  });

  for (const placement of [
    "top-top",
    "top-center",
    "top-bottom",
    "center-top",
    "center-center",
    "center-bottom",
    "bottom-top",
    "bottom-center",
    "bottom-bottom",
  ]) {
    it(`uses a valid root margin for ${placement}`, () => {
      const element = createAOSElement({
        "data-aos": "fade-up",
        "data-aos-anchor-placement": placement,
      });

      init();

      const anchor = element.querySelector("[data-aos-anchor]");
      const rootMargin =
        mockIntersectionObserver.getObserverFor(anchor)?.options.rootMargin;
      expect(rootMargin).not.toContain("calc(");
      expect(rootMargin).toMatch(/^0px 0px (-100%|-50%|0%) 0px$/);
    });
  }

  it("falls back safely for an invalid anchor placement", () => {
    const element = createAOSElement({
      "data-aos": "fade-up",
      "data-aos-anchor-placement": "invalid-placement",
    });

    init();

    const anchor = element.querySelector("[data-aos-anchor]");
    expect(anchor?.style.top).toBe("0%");
    expect(
      mockIntersectionObserver.getObserverFor(anchor)?.options.rootMargin,
    ).toBe("0px 0px 0% 0px");
  });

  it("maps legacy AOS animation names", () => {
    const element = createAOSElement({ "data-aos": "fade-in-up" });

    init();

    expect(element.getAttribute("data-animation")).toBe("fade-up");
  });

  it("passes intersection events through to the action", () => {
    const element = createAOSElement({ "data-aos": "fade" });
    init({ once: true });

    mockIntersectionObserver.trigger(
      element.querySelector("[data-aos-anchor]"),
      true,
    );

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

  it("uses the configured animated class on visibility changes", () => {
    const element = createAOSElement({ "data-aos": "fade" });
    init({ animatedClassName: "custom-animated" });

    const anchor = element.querySelector("[data-aos-anchor]");
    mockIntersectionObserver.trigger(anchor, true);
    expect(element.classList.contains("custom-animated")).toBe(true);

    mockIntersectionObserver.trigger(anchor, false);
    expect(element.classList.contains("custom-animated")).toBe(false);
  });

  it("removes a custom init class when disabled", () => {
    const element = createAOSElement({ "data-aos": "fade" });
    init({ initClassName: "custom-init" });

    disable();

    expect(element.classList.contains("custom-init")).toBe(false);
  });

  it("exposes the documented AOS API", () => {
    expect(typeof AOS.init).toBe("function");
    expect(typeof AOS.refresh).toBe("function");
    expect(typeof AOS.refreshHard).toBe("function");
    expect(typeof AOS.disable).toBe("function");
    expect(typeof AOS.destroy).toBe("function");
  });
});
