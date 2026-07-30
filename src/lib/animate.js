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
 * Snapshot caller options so replacement comparisons are not affected by
 * mutations to an object retained by the caller after animate/update.
 *
 * @param {import('./types.js').AnimateOptions} options
 * @returns {import('./types.js').AnimateOptions}
 */
function snapshotOptions(options) {
  return {
    ...options,
    threshold: Array.isArray(options.threshold)
      ? [...options.threshold]
      : options.threshold,
  };
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
 * Animate an element when it enters the viewport.
 *
 * Framework-neutral DOM core. Returns a deterministic lifecycle handle whose
 * `update(newOptions)` treats the argument as the complete new option set, so
 * options removed by a reactive caller are no longer retained.
 *
 * @param {HTMLElement} element
 * @param {import('./types.js').AnimateOptions} [options]
 * @returns {import('./types.js').AnimateHandle}
 */
export function animate(element, options = {}) {
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
    transition: element.style.transition,
    hasAnimationAttribute: element.hasAttribute("data-animation"),
    animationAttribute: element.getAttribute("data-animation"),
    hasScrollAnimateClass: element.classList.contains("scroll-animate"),
    hasVisibleClass: element.classList.contains("is-visible"),
  };
  /** @type {string | undefined} */
  let originalPosition;
  /** @type {{ hasAttribute: boolean, value: string | null } | undefined} */
  let originalSentinelAttribute;
  /** @type {{ value: string, priority: string } | undefined} */
  let originalDuration;
  /** @type {{ value: string, priority: string } | undefined} */
  let originalDelay;
  /** @type {{ value: string, priority: string } | undefined} */
  let originalEasing;
  /** @type {{ value: string, priority: string } | undefined} */
  let originalWillChange;

  let currentOptions = snapshotOptions(options);
  let animation = normalizeAnimation(currentOptions.animation);
  setupAnimationElement(element, animation);

  // Keep transitions disabled through the first paint, without forcing a
  // synchronous layout read. The second frame restores caller transitions.
  element.style.transition = "none";

  if (
    currentOptions.duration !== undefined ||
    currentOptions.delay !== undefined
  ) {
    originalDuration = captureStyleProperty(element, "--duration");
    originalDelay = captureStyleProperty(element, "--delay");
    setCSSVariables(element, currentOptions.duration, currentOptions.delay);
  }
  if (currentOptions.easing !== undefined) {
    originalEasing = captureStyleProperty(element, "--easing");
    element.style.setProperty("--easing", currentOptions.easing);
  }

  let destroyed = false;
  /** @type {number | undefined} */
  let restoreTransitionFrame;
  const animationFrame = window.requestAnimationFrame(() => {
    restoreTransitionFrame = window.requestAnimationFrame(() => {
      if (!destroyed) element.style.transition = original.transition;
    });
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
      originalPosition ??= element.style.position;
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
    originalSentinelAttribute ??= {
      hasAttribute: element.hasAttribute("data-sentinel-id"),
      value: element.getAttribute("data-sentinel-id"),
    };
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
    if (originalSentinelAttribute?.hasAttribute) {
      element.setAttribute(
        "data-sentinel-id",
        originalSentinelAttribute.value ?? "",
      );
    } else {
      element.removeAttribute("data-sentinel-id");
    }
    const target = currentOptions.observerTarget;
    const observerNeedsPositioning =
      target !== undefined && target !== element && element.contains(target);
    if (positionChanged && !observerNeedsPositioning) {
      element.style.position = originalPosition ?? "";
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
    if (originalWillChange) {
      restoreStyleProperty(element, "will-change", originalWillChange);
      originalWillChange = undefined;
    }
  }

  function activateWillChange() {
    if (element.style.getPropertyValue("will-change") || willChangeActive)
      return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const duration = Number(currentOptions.duration ?? 400);
    if (Number.isFinite(duration) && duration <= 0) return;

    originalWillChange ??= captureStyleProperty(element, "will-change");
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
      element.style.position = originalPosition ?? "";
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
    // Svelte action + reactive contract: the argument is the full new option
    // set. Options that are no longer present revert to their defaults or to
    // the caller-owned value, so a reactive update never retains stale values.
    update(newOptions = {}) {
      if (destroyed) return;

      const previousOptions = currentOptions;
      currentOptions = snapshotOptions(newOptions);

      animation = normalizeAnimation(currentOptions.animation);
      element.setAttribute("data-animation", animation);

      // Duration and delay are independent options: replacement semantics
      // require each to revert to its caller-owned value when removed, even
      // while the other timing option remains active.
      if (currentOptions.duration !== undefined) {
        originalDuration ??= captureStyleProperty(element, "--duration");
        element.style.setProperty("--duration", `${currentOptions.duration}ms`);
      } else if (previousOptions.duration !== undefined) {
        if (originalDuration)
          restoreStyleProperty(element, "--duration", originalDuration);
        originalDuration = undefined;
      }

      if (currentOptions.delay !== undefined) {
        originalDelay ??= captureStyleProperty(element, "--delay");
        element.style.setProperty("--delay", `${currentOptions.delay}ms`);
      } else if (previousOptions.delay !== undefined) {
        if (originalDelay)
          restoreStyleProperty(element, "--delay", originalDelay);
        originalDelay = undefined;
      }

      if (currentOptions.easing !== undefined) {
        originalEasing ??= captureStyleProperty(element, "--easing");
        element.style.setProperty("--easing", currentOptions.easing);
      } else if (previousOptions.easing !== undefined) {
        if (originalEasing)
          restoreStyleProperty(element, "--easing", originalEasing);
        originalEasing = undefined;
      }

      const observerChanged =
        currentOptions.offset !== previousOptions.offset ||
        currentOptions.threshold !== previousOptions.threshold ||
        currentOptions.rootMargin !== previousOptions.rootMargin ||
        currentOptions.observerTarget !== previousOptions.observerTarget;
      const repeatNeedsReconnect =
        currentOptions.repeat === true &&
        previousOptions.repeat !== true &&
        !state.isConnected;

      if (observerChanged || repeatNeedsReconnect) {
        connectObserver();
      }

      if (currentOptions.debug !== previousOptions.debug) {
        if (currentOptions.debug) enableDebug();
        else disableDebug();
      } else if (currentOptions.debug) {
        const debugAppearanceChanged =
          currentOptions.offset !== previousOptions.offset ||
          currentOptions.sentinelColor !== previousOptions.sentinelColor ||
          currentOptions.debugLabel !== previousOptions.debugLabel ||
          currentOptions.sentinelId !== previousOptions.sentinelId;
        if (debugAppearanceChanged) renderSentinel();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      window.cancelAnimationFrame?.(animationFrame);
      if (restoreTransitionFrame !== undefined) {
        window.cancelAnimationFrame?.(restoreTransitionFrame);
      }
      releaseWillChange();
      disconnectObserver(managedObserver, state);
      disableDebug();
      if (positionChanged) {
        element.style.position = originalPosition ?? "";
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
      if (originalDuration) {
        restoreStyleProperty(element, "--duration", originalDuration);
      }
      if (originalDelay)
        restoreStyleProperty(element, "--delay", originalDelay);
      if (originalEasing) {
        restoreStyleProperty(element, "--easing", originalEasing);
      }
      if (originalWillChange) {
        restoreStyleProperty(element, "will-change", originalWillChange);
      }
      element.style.transition = original.transition;
    },
  };
}
