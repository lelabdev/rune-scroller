import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";
import { destroy, disable, init, refreshHard } from "../src/lib/aos.js";
import { mockIntersectionObserver } from "./__mocks__/IntersectionObserver.js";

let window;
let document;

function getAOSObserver(element) {
  return mockIntersectionObserver.getObserverFor(
    element.querySelector("[data-aos-anchor]"),
  );
}

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

describe("AOS integration", () => {
  it("animates each supported element independently", () => {
    const fade = addElement("fade-up");
    const zoom = addElement("zoom-in");
    const slide = addElement("slide-left");

    init({ once: true });
    mockIntersectionObserver.trigger(
      zoom.querySelector("[data-aos-anchor]"),
      true,
    );

    expect(fade.getAttribute("data-animation")).toBe("fade-up");
    expect(zoom.classList.contains("is-visible")).toBe(true);
    expect(slide.classList.contains("is-visible")).toBe(false);
  });

  it("cancels a pending start event when destroyed", () => {
    const element = addElement("fade");

    init({ startEvent: "rune-start" });
    destroy();
    document.dispatchEvent(new window.Event("rune-start"));

    expect(element.hasAttribute("data-animation")).toBe(false);
    expect(mockIntersectionObserver.getAll()).toHaveLength(0);
  });

  it("keeps one observer per element after repeated initialization", () => {
    const element = addElement("fade");

    init();
    init();

    expect(mockIntersectionObserver.getAll()).toHaveLength(1);
    expect(getAOSObserver(element)).toBeDefined();
  });

  it("disconnects the mutation observer when disabled", () => {
    const originalMutationObserver = globalThis.MutationObserver;
    class TrackingMutationObserver {
      static instances = [];

      constructor() {
        this.disconnected = false;
        TrackingMutationObserver.instances.push(this);
      }

      observe() {}

      disconnect() {
        this.disconnected = true;
      }
    }
    globalThis.MutationObserver = TrackingMutationObserver;

    addElement("fade");
    init();
    disable();

    expect(TrackingMutationObserver.instances).toHaveLength(1);
    expect(TrackingMutationObserver.instances[0].disconnected).toBe(true);
    globalThis.MutationObserver = originalMutationObserver;
  });

  it("leaves content visible and removes action-owned state when disabled", () => {
    const element = addElement("fade");
    init();

    disable();

    expect(element.hasAttribute("data-aos")).toBe(false);
    expect(element.hasAttribute("data-animation")).toBe(false);
    expect(element.classList.contains("scroll-animate")).toBe(false);
    expect(element.classList.contains("is-visible")).toBe(false);
  });

  it("preserves caller-owned AOS classes during cleanup", () => {
    const element = addElement("fade");
    element.classList.add("custom-init", "custom-animated", "fade");

    init({
      initClassName: "custom-init",
      animatedClassName: "custom-animated",
      useClassNames: true,
    });
    destroy();

    expect(element.classList.contains("custom-init")).toBe(true);
    expect(element.classList.contains("custom-animated")).toBe(true);
    expect(element.classList.contains("fade")).toBe(true);
  });

  it("restores caller-owned body attributes after destroy", () => {
    document.body.setAttribute("data-aos-easing", "caller-easing");
    document.body.setAttribute("data-aos-duration", "123");
    document.body.setAttribute("data-aos-delay", "456");
    addElement("fade");

    init({ easing: "linear", duration: 800, delay: 100 });
    destroy();

    expect(document.body.getAttribute("data-aos-easing")).toBe("caller-easing");
    expect(document.body.getAttribute("data-aos-duration")).toBe("123");
    expect(document.body.getAttribute("data-aos-delay")).toBe("456");
  });

  it("processes added AOS elements with a shared observer", async () => {
    const first = addElement("fade");
    const second = addElement("zoom-in");
    init();
    const firstObserver = getAOSObserver(first);
    const secondObserver = getAOSObserver(second);

    const third = addElement("bounce-in");
    await new Promise((resolve) => window.setTimeout(resolve, 0));

    const thirdObserver = getAOSObserver(third);
    expect(firstObserver?.isConnected).toBe(true);
    expect(secondObserver).toBe(firstObserver);
    expect(thirdObserver).toBe(firstObserver);
    expect(mockIntersectionObserver.getAll()).toHaveLength(1);
  });

  it("destroys actions when animated elements are removed", async () => {
    const element = addElement("fade");
    init();
    const observer = getAOSObserver(element);

    element.remove();
    await new Promise((resolve) => window.setTimeout(resolve, 0));

    expect(observer?.isConnected).toBe(false);
    expect(mockIntersectionObserver.getAll()).toHaveLength(0);
  });

  it("processes new elements after an explicit hard refresh", () => {
    const first = addElement("fade");
    init();
    const second = addElement("bounce-in");

    refreshHard();

    expect(first.getAttribute("data-animation")).toBe("fade");
    expect(second.getAttribute("data-animation")).toBe("bounce-in");
  });

  it("restores default options before reinitialization", () => {
    addElement("fade");
    init({ duration: 800 });
    destroy();

    const reinitialized = addElement("zoom-in");
    init();

    expect(reinitialized.style.getPropertyValue("--duration")).toBe("400ms");
  });

  it("does not retain disabled settings across initialization", () => {
    const element = addElement("fade");

    init({ disable: true });
    init();

    expect(element.getAttribute("data-animation")).toBe("fade");
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
