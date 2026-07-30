import { afterEach, describe, expect, it } from "bun:test";
import { compile, compileModule } from "svelte/compiler";
import {
  flushSync,
  mount,
  unmount,
} from "../node_modules/svelte/src/index-client.js";
import { Window } from "happy-dom";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mockIntersectionObserver } from "./__mocks__/IntersectionObserver.js";

const composableSource = readFileSync(
  resolve(import.meta.dirname, "../src/lib/useIntersection.svelte.js"),
  "utf8",
);
const composable = compileModule(composableSource, {
  filename: "useIntersection.svelte.js",
  generate: "client",
});
const composableUrl = `data:text/javascript;base64,${Buffer.from(
  composable.js.code,
).toString("base64")}`;

const componentSource = `
<script>
  import { useIntersection, useIntersectionOnce } from "${composableUrl}";

  let target = $state(null);
  let observerOptions = $state({ threshold: 0 });
  const events = [];
  const intersection = useIntersection(observerOptions, (visible) => events.push(visible));
  const onceIntersection = useIntersectionOnce(observerOptions);

  $effect(() => {
    intersection.element = target;
    onceIntersection.element = target;
  });

  export function setTarget(value) {
    target = value;
  }

  export function setThreshold(value) {
    observerOptions.threshold = value;
  }

  export function visible() {
    return intersection.isVisible;
  }

  export function onceVisible() {
    return onceIntersection.isVisible;
  }

  export function callbackEvents() {
    return events;
  }
</script>`;

const compiled = compile(componentSource, { generate: "client" });
const componentUrl = `data:text/javascript;base64,${Buffer.from(
  compiled.js.code,
).toString("base64")}`;
const Component = (await import(componentUrl)).default;

let mounted = [];
let win;

function installDom() {
  win = new Window();
  global.window = win;
  global.document = win.document;
  global.HTMLElement = win.HTMLElement;
  global.Element = win.Element;
  global.Node = win.Node;
  global.Text = win.Text;
  global.MutationObserver = win.MutationObserver;
  global.IntersectionObserver = undefined;
  mockIntersectionObserver.install();
}

function createHarness() {
  const target = document.createElement("div");
  document.body.append(target);
  const instance = mount(Component, { target: document.body });
  mounted.push(instance);
  return { instance, target };
}

afterEach(() => {
  mounted.forEach((instance) => unmount(instance));
  mounted = [];
  mockIntersectionObserver.uninstall();
  win?.close();
  delete global.window;
  delete global.document;
  delete global.HTMLElement;
  delete global.Element;
  delete global.Node;
  delete global.Text;
  delete global.MutationObserver;
});

describe("useIntersection runtime lifecycle", () => {
  it("evaluates safely without browser globals", async () => {
    const module = await import(
      `../src/lib/useIntersection.svelte.js?ssr=${Date.now()}`
    );

    expect(module.useIntersection).toBeFunction();
    expect(module.useIntersectionOnce).toBeFunction();
  });

  it("updates visibility and delivers every callback transition", () => {
    installDom();
    const { instance, target } = createHarness();

    instance.setTarget(target);
    flushSync();
    mockIntersectionObserver.trigger(target, true);
    expect(instance.visible()).toBe(true);
    mockIntersectionObserver.trigger(target, false);

    expect(instance.visible()).toBe(false);
    expect(instance.callbackEvents()).toEqual([true, false]);
  });

  it("disconnects both observers when its component unmounts", () => {
    installDom();
    const { instance, target } = createHarness();

    instance.setTarget(target);
    flushSync();
    unmount(instance);
    mounted = [];

    expect(mockIntersectionObserver.getAll()).toHaveLength(0);
  });

  it("reacts to observer option changes", () => {
    installDom();
    const { instance, target } = createHarness();

    instance.setTarget(target);
    flushSync();
    expect(
      mockIntersectionObserver.getObserverFor(target)?.options.threshold,
    ).toBe(0);

    instance.setThreshold(0.75);
    flushSync();

    expect(
      mockIntersectionObserver.getObserverFor(target)?.options.threshold,
    ).toBe(0.75);
  });

  it("resets visibility when the observed target changes", () => {
    installDom();
    const { instance, target } = createHarness();

    instance.setTarget(target);
    flushSync();
    mockIntersectionObserver.trigger(target, true);
    expect(instance.visible()).toBe(true);

    const replacement = document.createElement("div");
    document.body.append(replacement);
    instance.setTarget(replacement);
    flushSync();

    expect(instance.visible()).toBe(false);
  });

  it("observes a replacement target after useIntersectionOnce has triggered", () => {
    installDom();
    const { instance, target } = createHarness();

    instance.setTarget(target);
    flushSync();
    mockIntersectionObserver.trigger(target, true);
    expect(instance.onceVisible()).toBe(true);

    const replacement = document.createElement("div");
    document.body.append(replacement);
    instance.setTarget(replacement);
    flushSync();
    mockIntersectionObserver.trigger(replacement, true);

    expect(instance.onceVisible()).toBe(true);
    expect(
      mockIntersectionObserver
        .getAll()
        .filter((observer) => observer.observedElements.has(replacement)),
    ).toHaveLength(1);
  });
});
