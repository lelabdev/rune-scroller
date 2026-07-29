import {
  setCSSVariables,
  setupAnimationElement,
  createSentinel,
  checkAndWarnIfCSSNotLoaded,
} from "./dom-utils.js";
import { createManagedObserver, disconnectObserver } from "./observer-utils.js";
import { ANIMATION_TYPES } from "./animations.js";

const DEFAULT_ANIMATION = "fade-in";

/**
 * @param {unknown} animation
 * @returns {import('./types.js').AnimationType}
 */
function normalizeAnimation(animation) {
  if (typeof animation === "string" && ANIMATION_TYPES.includes(animation)) {
    return /** @type {import('./types.js').AnimationType} */ (animation);
  }

  if (
    animation !== undefined &&
    typeof process !== "undefined" &&
    process.env?.NODE_ENV !== "production"
  ) {
    console.warn(
      `[rune-scroller] Invalid animation "${String(animation)}". Using "${DEFAULT_ANIMATION}" instead. ` +
        `Valid options: ${ANIMATION_TYPES.join(", ")}`,
    );
  }

  return DEFAULT_ANIMATION;
}

/**
 * @param {HTMLElement} element
 * @param {string} property
 * @returns {{ value: string, priority: string }}
 */
function captureStyleProperty(element, property) {
  return {
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  };
}

/**
 * @param {HTMLElement} element
 * @param {string} property
 * @param {{ value: string, priority: string }} original
 */
function restoreStyleProperty(element, property, original) {
  if (original.value) {
    element.style.setProperty(property, original.value, original.priority);
  } else {
    element.style.removeProperty(property);
  }
}

/**
 * @param {HTMLElement} element
 * @param {import('./types.js').RuneScrollerOptions} [options]
 * @returns {{ update: (newOptions?: import('./types.js').RuneScrollerOptions) => void, destroy: () => void }}
 */
export function runeScroller(element, options = {}) {
  if (typeof window === "undefined") {
    return {
      update: () => {},
      destroy: () => {},
    };
  }

  if (typeof document !== "undefined") {
    checkAndWarnIfCSSNotLoaded();
  }

  const original = {
    position: element.style.position,
    transition: element.style.transition,
    hasAnimationAttribute: element.hasAttribute("data-animation"),
    animationAttribute: element.getAttribute("data-animation"),
    hasSentinelAttribute: element.hasAttribute("data-sentinel-id"),
    sentinelAttribute: element.getAttribute("data-sentinel-id"),
    hasScrollAnimateClass: element.classList.contains("scroll-animate"),
    hasVisibleClass: element.classList.contains("is-visible"),
    duration: captureStyleProperty(element, "--duration"),
    delay: captureStyleProperty(element, "--delay"),
    easing: captureStyleProperty(element, "--easing"),
    willChange: captureStyleProperty(element, "will-change"),
  };

  let currentOptions = { ...options };
  let animation = normalizeAnimation(currentOptions.animation);
  setupAnimationElement(element, animation);

  element.style.transition = "none";
  void element.offsetHeight;

  if (
    currentOptions.duration !== undefined ||
    currentOptions.delay !== undefined
  ) {
    setCSSVariables(element, currentOptions.duration, currentOptions.delay);
  }
  if (currentOptions.easing !== undefined) {
    element.style.setProperty("--easing", currentOptions.easing);
  }

  let destroyed = false;
  const animationFrame = window.requestAnimationFrame(() => {
    if (!destroyed) element.style.transition = original.transition;
  });

  /** @type {HTMLElement | null} */
  let sentinel = null;
  /** @type {string | undefined} */
  let sentinelId;
  let positionChanged = false;
  /** @type {ResizeObserver | undefined} */
  let resizeObserver;
  /** @type {ReturnType<typeof createManagedObserver> | undefined} */
  let managedObserver;
  const state = { isConnected: false };

  function ensurePositioningContext() {
    if (!element.style.position || element.style.position === "static") {
      element.style.position = "relative";
      positionChanged = true;
    }
  }

  function renderSentinel() {
    ensurePositioningContext();
    const result = createSentinel(
      element,
      true,
      currentOptions.offset,
      currentOptions.sentinelColor,
      currentOptions.debugLabel,
      sentinelId ?? currentOptions.sentinelId,
    );
    sentinelId = result.id;
    element.setAttribute("data-sentinel-id", sentinelId);

    if (sentinel) {
      sentinel.replaceWith(result.element);
    } else {
      element.appendChild(result.element);
    }
    sentinel = result.element;
  }

  function startResizeObserver() {
    if (resizeObserver || typeof ResizeObserver === "undefined") return;
    resizeObserver = new ResizeObserver(() => {
      if (sentinel) renderSentinel();
    });
    resizeObserver.observe(element);
  }

  function stopResizeObserver() {
    resizeObserver?.disconnect();
    resizeObserver = undefined;
  }

  function enableDebug() {
    if (element.style.overflow === "hidden") {
      console.warn(
        "[rune-scroller] Element has overflow:hidden — the sentinel indicator may be clipped in debug mode.",
      );
    }
    renderSentinel();
    startResizeObserver();
  }

  function disableDebug() {
    stopResizeObserver();
    sentinel?.remove();
    sentinel = null;
    sentinelId = undefined;
    if (original.hasSentinelAttribute) {
      element.setAttribute(
        "data-sentinel-id",
        original.sentinelAttribute ?? "",
      );
    } else {
      element.removeAttribute("data-sentinel-id");
    }
    const target = currentOptions.observerTarget;
    const observerNeedsPositioning =
      target !== undefined && target !== element && element.contains(target);
    if (positionChanged && !observerNeedsPositioning) {
      element.style.position = original.position;
      positionChanged = false;
    }
  }

  if (currentOptions.debug) enableDebug();

  /** @type {number | undefined} */
  let willChangeTimer;
  let willChangeActive = false;

  function releaseWillChange() {
    if (!willChangeActive) return;
    willChangeActive = false;
    window.clearTimeout(willChangeTimer);
    element.removeEventListener("transitionend", releaseWillChange);
    element.removeEventListener("animationend", releaseWillChange);
    restoreStyleProperty(element, "will-change", original.willChange);
  }

  function activateWillChange() {
    if (original.willChange.value || willChangeActive) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const duration = Number(currentOptions.duration ?? 400);
    if (Number.isFinite(duration) && duration <= 0) return;

    willChangeActive = true;
    element.style.setProperty("will-change", "transform, opacity");
    element.addEventListener("transitionend", releaseWillChange);
    element.addEventListener("animationend", releaseWillChange);
    const delay = Number(currentOptions.delay ?? 0);
    const timeout = Number.isFinite(delay)
      ? Math.max(0, duration + delay) + 100
      : 500;
    willChangeTimer = window.setTimeout(releaseWillChange, timeout);
  }

  /** @param {IntersectionObserverEntry[]} entries */
  const handleIntersection = (entries) => {
    const entry = entries[0];
    if (!entry) return;

    if (entry.isIntersecting) {
      activateWillChange();
      element.classList.add("is-visible");
      currentOptions.onVisible?.(element);
      if (!currentOptions.repeat) {
        disconnectObserver(managedObserver, state);
      }
    } else if (currentOptions.repeat) {
      activateWillChange();
      element.classList.remove("is-visible");
      currentOptions.onHidden?.(element);
    }
  };

  function connectObserver() {
    disconnectObserver(managedObserver, state);
    const offset = currentOptions.offset ?? 0;
    const rootMargin = currentOptions.rootMargin ?? `0px 0px ${offset}px 0px`;
    const target = currentOptions.observerTarget ?? element;
    if (target !== element && element.contains(target)) {
      ensurePositioningContext();
    } else if (positionChanged && !currentOptions.debug) {
      element.style.position = original.position;
      positionChanged = false;
    }
    managedObserver = createManagedObserver(target, handleIntersection, {
      threshold: currentOptions.threshold ?? 0,
      rootMargin,
    });
    state.isConnected = true;
  }

  connectObserver();

  return {
    update(newOptions = {}) {
      if (destroyed) return;

      const previousOptions = currentOptions;
      currentOptions = { ...currentOptions, ...newOptions };

      if (newOptions.animation !== undefined) {
        animation = normalizeAnimation(newOptions.animation);
        element.setAttribute("data-animation", animation);
      }
      if (newOptions.duration !== undefined || newOptions.delay !== undefined) {
        setCSSVariables(element, newOptions.duration, newOptions.delay);
      }
      if (newOptions.easing !== undefined) {
        element.style.setProperty("--easing", newOptions.easing);
      }

      const observerOptionsChanged =
        newOptions.offset !== undefined ||
        newOptions.threshold !== undefined ||
        newOptions.rootMargin !== undefined ||
        newOptions.observerTarget !== undefined;
      const repeatNeedsReconnect =
        newOptions.repeat === true &&
        previousOptions.repeat !== true &&
        !state.isConnected;

      if (observerOptionsChanged || repeatNeedsReconnect) {
        connectObserver();
      }

      const debugChanged =
        newOptions.debug !== undefined &&
        newOptions.debug !== previousOptions.debug;
      const debugAppearanceChanged =
        newOptions.offset !== undefined ||
        newOptions.sentinelColor !== undefined ||
        newOptions.debugLabel !== undefined ||
        newOptions.sentinelId !== undefined;

      if (debugChanged) {
        if (currentOptions.debug) enableDebug();
        else disableDebug();
      } else if (currentOptions.debug && debugAppearanceChanged) {
        renderSentinel();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      window.cancelAnimationFrame?.(animationFrame);
      releaseWillChange();
      disconnectObserver(managedObserver, state);
      disableDebug();
      if (positionChanged) {
        element.style.position = original.position;
        positionChanged = false;
      }

      if (original.hasAnimationAttribute) {
        element.setAttribute(
          "data-animation",
          original.animationAttribute ?? "",
        );
      } else {
        element.removeAttribute("data-animation");
      }
      if (!original.hasScrollAnimateClass) {
        element.classList.remove("scroll-animate");
      }
      if (!original.hasVisibleClass) {
        element.classList.remove("is-visible");
      }
      restoreStyleProperty(element, "--duration", original.duration);
      restoreStyleProperty(element, "--delay", original.delay);
      restoreStyleProperty(element, "--easing", original.easing);
      restoreStyleProperty(element, "will-change", original.willChange);
      element.style.transition = original.transition;
    },
  };
}
