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

/** @typedef {{ offset?: number, delay?: number, duration?: number, easing?: string, once?: boolean, mirror?: boolean, anchorPlacement?: string, disable?: boolean | string, useClassNames?: boolean, startEvent?: string, animatedClassName?: string, initClassName?: string }} AOSOptions */

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
let options = {
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

/**
 * Check if AOS should be disabled based on option value
 * @param {boolean | string | (() => boolean) | undefined} disable
 * @returns {boolean}
 */
function shouldDisable(disable) {
  if (!disable) return false;
  if (typeof disable === "function") return disable();
  if (disable === "mobile") return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (disable === "phone") return /Android|iPhone|iPod/i.test(navigator.userAgent);
  return true; // disable: true
}

/** @type {Array<{ destroy: () => void }>} */
let activeActions = [];

/** @type {MutationObserver | null} */
let mutationObserver = null;

/** @type {boolean} */
let initialized = false;

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
  return attr || fallback;
}

/**
 * Apply rune-scroller action to a single element
 * @param {HTMLElement} el
 */
function applyToElement(el) {
  const animation = resolveAnimation(el.getAttribute("data-aos") || "fade-up");

  const duration = Number(getInlineOption(el, "duration", options.duration));
  const delay = Number(getInlineOption(el, "delay", options.delay));
  const offset = Number(getInlineOption(el, "offset", options.offset));
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

  // Apply runeScroller action
  const action = runeScroller(el, {
    animation,
    duration,
    offset: offset - 120, // AOS offset is "px from viewport bottom", we adjust
    repeat: !once || mirror,
  });

  // Set delay CSS variable AFTER runeScroller (which sets --delay: 0ms)
  el.style.setProperty("--delay", `${delay}ms`);

  activeActions.push(action);
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
    let hasNewAOS = false;

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          if (node.hasAttribute && node.hasAttribute("data-aos")) {
            hasNewAOS = true;
          }
          if (node.querySelectorAll) {
            const aosChildren = node.querySelectorAll("[data-aos]");
            if (aosChildren.length > 0) hasNewAOS = true;
          }
        }
      }
    }

    if (hasNewAOS) {
      refreshHard();
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

  Object.assign(options, settings);

  // Check disable option
  if (shouldDisable(options.disable)) return;

  // Set global easing on body for CSS
  const body = document.querySelector("body");
  if (body) {
    body.setAttribute("data-aos-easing", options.easing);
    body.setAttribute("data-aos-duration", String(options.duration));
    body.setAttribute("data-aos-delay", String(options.delay));
  }

  // Process elements on start event or immediately
  const startEvent = options.startEvent || "DOMContentLoaded";

  if (
    startEvent === "DOMContentLoaded" &&
    ["complete", "interactive"].includes(document.readyState)
  ) {
    processElements();
    observeMutations();
    initialized = true;
  } else if (startEvent === "load") {
    window.addEventListener("load", () => {
      processElements();
      observeMutations();
      initialized = true;
    });
  } else {
    document.addEventListener(startEvent, () => {
      processElements();
      observeMutations();
      initialized = true;
    });
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
  // Destroy all active actions
  activeActions.forEach((action) => {
    try {
      action.destroy();
    } catch {
      /* ignore */
    }
  });
  activeActions = [];

  // Remove init classes
  if (options.initClassName) {
    document
      .querySelectorAll(`[data-aos].${options.initClassName}`)
      .forEach((el) => el.classList.remove(options.initClassName));
  }

  processElements();
}

/**
 * Disable — remove all AOS attributes and classes
 */
function disable() {
  activeActions.forEach((action) => {
    try {
      action.destroy();
    } catch {
      /* ignore */
    }
  });
  activeActions = [];

  document.querySelectorAll("[data-aos]").forEach((el) => {
    el.removeAttribute("data-aos");
    el.removeAttribute("data-aos-easing");
    el.removeAttribute("data-aos-duration");
    el.removeAttribute("data-aos-delay");
    el.removeAttribute("data-aos-offset");

    if (options.initClassName) el.classList.remove(options.initClassName);
  });
}

// Public API — compatible with AOS
export default { init, refresh, refreshHard, disable };
export { init, refresh, refreshHard, disable };
