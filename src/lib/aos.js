/**
 * AOS compatibility layer for rune-scroller
 *
 * Drop-in replacement for AOS (Animate On Scroll).
 * Supports the same data attributes and init() API.
 *
 * Usage:
 *   import { init, refresh, refreshHard } from 'rune-scroller/aos'
 *   init()
 *
 * Or as AOS drop-in:
 *   import AOS from 'rune-scroller/aos'
 *   AOS.init()
 */

import { runeScroller } from "./runeScroller.js";
import { ANIMATION_TYPES } from "./animations.js";

/** @typedef {{ offset?: number, delay?: number, duration?: number, easing?: string, once?: boolean, mirror?: boolean, anchorPlacement?: string, disable?: boolean | 'mobile' | 'phone' | (() => boolean), useClassNames?: boolean, startEvent?: string, animatedClassName?: string, initClassName?: string }} AOSOptions */

/**
 * Map old animation names (v2.x) to new names
 * @type {Record<string, string>}
 */
const LEGACY_MAP = {
  "fade-in": "fade",
  "fade-in-up": "fade-up",
  "fade-in-down": "fade-down",
  "fade-in-left": "fade-left",
  "fade-in-right": "fade-right",
  flip: "flip-left",
  "flip-x": "flip-up",
};

/**
 * Normalize animation name (resolve legacy + validate)
 * @param {string} name
 * @returns {string}
 */
function resolveAnimation(name) {
  if (LEGACY_MAP[name]) return LEGACY_MAP[name];
  if (ANIMATION_TYPES.includes(name)) return name;
  // Unknown animation — try as-is, CSS will silently ignore
  return name;
}

/** @type {AOSOptions} */
const DEFAULT_OPTIONS = {
  offset: 120,
  delay: 0,
  duration: 400,
  easing: "ease",
  once: false,
  mirror: false,
  anchorPlacement: "top-bottom",
  disable: false,
  useClassNames: false,
  startEvent: "DOMContentLoaded",
  animatedClassName: "aos-animate",
  initClassName: "aos-init",
};

/** @type {AOSOptions} */
let options = { ...DEFAULT_OPTIONS };

/**
 * Check if AOS should be disabled based on option value
 * @param {boolean | string | (() => boolean) | undefined} disable
 * @returns {boolean}
 */
function shouldDisable(disable) {
  if (!disable) return false;
  if (typeof disable === "function") return disable();
  if (disable === "mobile")
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (disable === "phone")
    return /Android|iPhone|iPod/i.test(navigator.userAgent);
  return true; // disable: true
}

/** @type {Map<HTMLElement, { destroy: () => void }>} */
let activeActions = new Map();

/** @type {MutationObserver | null} */
let mutationObserver = null;

/** @type {boolean} */
let initialized = false;

/** @type {(() => void) | null} */
let removeStartEventListener = null;

/** @type {Record<string, { exists: boolean, value: string | null }> | null} */
let bodyAttributeSnapshot = null;

/**
 * Read a data-aos-* attribute from an element
 * @param {HTMLElement} el
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function getInlineOption(el, key, fallback) {
  const attr = el.getAttribute("data-aos-" + key);
  if (attr === "true") return true;
  if (attr === "false") return false;
  return attr !== null && attr !== "" ? attr : fallback;
}

/**
 * @param {*} value
 * @param {number} fallback
 */
function getFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Apply rune-scroller action to a single element
 * @param {HTMLElement} el
 */
function applyToElement(el) {
  if (activeActions.has(el)) return;

  const animation = resolveAnimation(el.getAttribute("data-aos") || "fade-up");
  const originalClasses = {
    init: options.initClassName
      ? el.classList.contains(options.initClassName)
      : false,
    animated: options.animatedClassName
      ? el.classList.contains(options.animatedClassName)
      : false,
    animation: animation ? el.classList.contains(animation) : false,
  };

  const duration = getFiniteNumber(
    getInlineOption(el, "duration", options.duration),
    options.duration ?? 400,
  );
  const delay = getFiniteNumber(
    getInlineOption(el, "delay", options.delay),
    options.delay ?? 0,
  );
  const offset = getFiniteNumber(
    getInlineOption(el, "offset", options.offset),
    options.offset ?? 120,
  );
  const once = getInlineOption(el, "once", options.once);
  const mirror = getInlineOption(el, "mirror", options.mirror);

  // Set easing as CSS variable
  if (options.easing || el.getAttribute("data-aos-easing")) {
    const easing = getInlineOption(el, "easing", options.easing);
    el.style.setProperty("--easing", easing);
  }

  // Add init class
  if (options.initClassName) {
    el.classList.add(options.initClassName);
  }

  // Use useClassNames to add animation name as extra class
  if (options.useClassNames && animation) {
    el.classList.add(animation);
  }

  // Parse anchorPlacement for sentinel positioning
  // Format: "vertical-horizontal" e.g. "top-bottom", "center-center"
  const placement =
    getInlineOption(el, "anchor-placement", options.anchorPlacement) ||
    "top-bottom";
  const [anchor, target] = placement.split("-");

  const anchorPosition =
    { top: "0%", center: "50%", bottom: "100%" }[
      /** @type {"top" | "center" | "bottom"} */ (anchor)
    ] ?? "0%";
  const viewportOffset =
    {
      bottom: "0%",
      center: "-50%",
      top: "-100%",
    }[/** @type {"top" | "center" | "bottom"} */ (target)] ?? "0%";
  const anchorElement = document.createElement("span");
  anchorElement.setAttribute("data-aos-anchor", "");
  anchorElement.style.cssText = `position:absolute;top:${anchorPosition};left:0;width:1px;height:1px;pointer-events:none;transform:translateY(${-offset}px)`;
  el.appendChild(anchorElement);

  // Apply runeScroller action
  const action = runeScroller(el, {
    animation: /** @type {import('./types.js').AnimationType} */ (animation),
    duration,
    offset,
    rootMargin: `0px 0px ${viewportOffset} 0px`,
    observerTarget: anchorElement,
    delay,
    easing: getInlineOption(el, "easing", options.easing),
    onVisible: () => {
      if (options.animatedClassName)
        el.classList.add(options.animatedClassName);
    },
    onHidden: () => {
      if (options.animatedClassName) {
        el.classList.remove(options.animatedClassName);
      }
    },
    // mirror: animate out on exit; once: animate only once
    // Both need repeat=true for reverse animation to play
    repeat: !once || mirror,
  });

  let destroyed = false;
  activeActions.set(el, {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      action.destroy();
      anchorElement.remove();
      if (options.initClassName && !originalClasses.init)
        el.classList.remove(options.initClassName);
      if (options.animatedClassName && !originalClasses.animated)
        el.classList.remove(options.animatedClassName);
      if (options.useClassNames && !originalClasses.animation)
        el.classList.remove(animation);
      activeActions.delete(el);
    },
  });
}

/**
 * Process all [data-aos] elements in the DOM
 */
function processElements() {
  /** @type {NodeListOf<HTMLElement>} */
  const elements = document.querySelectorAll("[data-aos]");
  elements.forEach(applyToElement);
}

/**
 * Watch for new [data-aos] elements added to the DOM
 */
function observeMutations() {
  if (mutationObserver) mutationObserver.disconnect();

  mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.removedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        for (const [element, action] of activeActions) {
          if (element === node || node.contains(element)) action.destroy();
        }
      }
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.hasAttribute("data-aos")) applyToElement(node);
        node.querySelectorAll("[data-aos]").forEach((element) => {
          if (element instanceof HTMLElement) applyToElement(element);
        });
      }
    }
  });

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/**
 * Initialize AOS compatibility mode
 * @param {AOSOptions} [settings]
 */
function init(settings = {}) {
  if (typeof window === "undefined") return;

  destroy();
  options = { ...DEFAULT_OPTIONS, ...settings };

  // Check disable option
  if (shouldDisable(options.disable)) return;

  // Set global easing on body for CSS
  const body = document.querySelector("body");
  if (body) {
    bodyAttributeSnapshot = Object.fromEntries(
      ["data-aos-easing", "data-aos-duration", "data-aos-delay"].map(
        (attribute) => [
          attribute,
          {
            exists: body.hasAttribute(attribute),
            value: body.getAttribute(attribute),
          },
        ],
      ),
    );
    body.setAttribute("data-aos-easing", options.easing ?? "ease");
    body.setAttribute("data-aos-duration", String(options.duration));
    body.setAttribute("data-aos-delay", String(options.delay));
  }

  // Process elements on start event or immediately
  const startEvent = options.startEvent || "DOMContentLoaded";

  const start = () => {
    removeStartEventListener = null;
    if (initialized) return;
    processElements();
    observeMutations();
    initialized = true;
  };

  if (
    ["complete", "interactive"].includes(document.readyState) &&
    (startEvent === "DOMContentLoaded" || startEvent === "load")
  ) {
    start();
  } else {
    const target = startEvent === "load" ? window : document;
    target.addEventListener(startEvent, start, { once: true });
    removeStartEventListener = () =>
      target.removeEventListener(startEvent, start);
  }
}

/**
 * Soft refresh — recalculate positions (no-op for IntersectionObserver)
 */
function refresh() {
  // IntersectionObserver handles position automatically
  // Only refresh if initialized
  if (!initialized) return;
}

/**
 * Hard refresh — destroy and re-process all elements
 */
function refreshHard() {
  if (typeof document === "undefined") return;

  // Destroy all active actions
  activeActions.forEach((action) => {
    try {
      action.destroy();
    } catch {
      /* ignore */
    }
  });
  activeActions.clear();

  // Remove init classes
  const initClassName = options.initClassName;
  if (initClassName) {
    document
      .querySelectorAll(`[data-aos].${initClassName}`)
      .forEach((el) => el.classList.remove(initClassName));
  }

  processElements();
}

/**
 * Disable — remove all AOS attributes and classes
 */
function disable() {
  if (typeof document === "undefined") return;

  const cleanupOptions = options;
  const elements = document.querySelectorAll("[data-aos]");
  destroy();

  elements.forEach((el) => {
    const animation = resolveAnimation(el.getAttribute("data-aos") || "");
    [...el.attributes]
      .filter((attribute) => attribute.name.startsWith("data-aos"))
      .forEach((attribute) => el.removeAttribute(attribute.name));

    if (cleanupOptions.initClassName) {
      el.classList.remove(cleanupOptions.initClassName);
    }
    if (cleanupOptions.animatedClassName) {
      el.classList.remove(cleanupOptions.animatedClassName);
    }
    if (cleanupOptions.useClassNames) {
      el.classList.remove(animation);
    }
  });
}

/**
 * Destroy — full cleanup for SPA route changes.
 * Destroys all actions, disconnects observers, resets state.
 */
function destroy() {
  if (typeof document === "undefined") return;

  if (removeStartEventListener) {
    removeStartEventListener();
    removeStartEventListener = null;
  }

  // Destroy all active runeScroller actions
  activeActions.forEach((action) => {
    try {
      action.destroy();
    } catch {
      /* ignore */
    }
  });
  activeActions.clear();

  // Disconnect the MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }

  // Reset initialized flag and options
  initialized = false;
  options = { ...DEFAULT_OPTIONS };

  // Restore body attributes changed during init
  const body = document.querySelector("body");
  if (body && bodyAttributeSnapshot) {
    for (const [attribute, original] of Object.entries(bodyAttributeSnapshot)) {
      if (original.exists) body.setAttribute(attribute, original.value ?? "");
      else body.removeAttribute(attribute);
    }
  }
  bodyAttributeSnapshot = null;
}

// Public API — compatible with AOS
export default { init, refresh, refreshHard, disable, destroy };
export { init, refresh, refreshHard, disable, destroy };
