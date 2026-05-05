import {
  setCSSVariables,
  setupAnimationElement,
  createSentinel,
  checkAndWarnIfCSSNotLoaded,
} from "./dom-utils.js";
import { createManagedObserver, disconnectObserver } from "./observer-utils.js";
import { ANIMATION_TYPES } from "./animations.js";

/**
 * @param {HTMLElement} element
 * @param {import('./types.js').RuneScrollerOptions} [options]
 * @returns {{ update: (newOptions?: import('./types.js').RuneScrollerOptions) => void, destroy: () => void }}
 */
export function runeScroller(element, options) {
  // SSR Guard: Return no-op action when running on server
  if (typeof window === "undefined") {
    return {
      update: () => {},
      destroy: () => {},
    };
  }

  // Warn if CSS is not loaded (first time only)
  if (typeof document !== "undefined") {
    checkAndWarnIfCSSNotLoaded();
  }

  // Validate animation type
  let animation = options?.animation ?? "fade-in";
  if (animation && !ANIMATION_TYPES.includes(animation)) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      console.warn(
        `[rune-scroller] Invalid animation "${animation}". Using "fade-in" instead. ` +
          `Valid options: ${ANIMATION_TYPES.join(", ")}`,
      );
    }
    animation = "fade-in";
  }

  // CSS handles initial opacity via [data-animation] { opacity: 0 }
  // No inline opacity needed — it would override slide animations that use opacity: 1

  // Setup animation classes and CSS variables
  if (animation) {
    setupAnimationElement(element, animation);
  }

  // Force initial state without transition to prevent FOUC
  // When data-animation is added dynamically, the browser would animate
  // from the current state (opacity:1) to the initial state (opacity:0)
  element.style.transition = "none";
  void element.offsetHeight; // Force reflow to apply no-transition

  // Warn about overflow:hidden in debug mode
  if (options?.debug && element.style.overflow === "hidden") {
    console.warn(
      "[rune-scroller] Element has overflow:hidden — the sentinel indicator may be clipped in debug mode.",
    );
  }

  // Set CSS variables for duration and delay
  if (options?.duration !== undefined || options?.delay !== undefined) {
    setCSSVariables(element, options?.duration, options?.delay);
  }
  if (options?.easing !== undefined) { element.style.setProperty("--easing", options.easing); }

  // Re-enable transitions after a frame (CSS takes over from here)
  requestAnimationFrame(() => {
    element.style.transition = "";
  });

  // Ensure element can serve as positioning context for debug sentinel
  const originalPosition = element.style.position;
  if (!originalPosition || originalPosition === "static") {
    element.style.position = "relative";
  }

  // Create debug sentinel (visual indicator only, not used for observation)
  let sentinel = null;
  let sentinelId = null;
  if (options?.debug) {
    const sentinelResult = createSentinel(
      element,
      options?.debug,
      options?.offset,
      options?.sentinelColor,
      options?.debugLabel,
      options?.sentinelId,
    );
    sentinel = sentinelResult.element;
    sentinelId = sentinelResult.id;
    element.setAttribute("data-sentinel-id", sentinelId);
    element.appendChild(sentinel);
  }

  // Calculate rootMargin from offset
  // Positive offset = trigger earlier = expand the viewport top boundary
  const offset = options?.offset ?? 0;
  const rootMargin = `${offset}px 0px 0px 0px`;

  // Observe the element directly (not the sentinel)
  // This avoids overflow:hidden clipping issues when the element has transforms
  const state = { isConnected: true };
  let resizeObserver;
  let intersectionObserver;

  // IntersectionObserver callback
  const handleIntersection = (entries) => {
    const isIntersecting = entries[0].isIntersecting;
    if (isIntersecting) {
      element.classList.add("is-visible");
      options?.onVisible?.(element);
      if (!options?.repeat) {
        disconnectObserver(intersectionObserver, state);
      }
    } else if (options?.repeat) {
      element.classList.remove("is-visible");
    }
  };

  const { observer } = createManagedObserver(
    element,
    handleIntersection,
    {
      threshold: options?.threshold ?? 0,
      rootMargin,
    },
  );

  intersectionObserver = observer;

  // Update debug sentinel if element resizes
  if (options?.debug && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      if (!sentinel) return;
      const newResult = createSentinel(
        element,
        options?.debug,
        options?.offset,
        options?.sentinelColor,
        options?.debugLabel,
        sentinelId,
      );
      sentinel.replaceWith(newResult.element);
      sentinel = newResult.element;
    });
    resizeObserver.observe(element);
  }

  return {
    update(newOptions) {
      if (newOptions?.animation) {
        element.setAttribute("data-animation", newOptions.animation);
      }
      if (newOptions?.duration || newOptions?.delay) {
        setCSSVariables(element, newOptions?.duration, newOptions?.delay);
      }
      if (newOptions?.easing !== undefined) { element.style.setProperty("--easing", newOptions.easing); }
      // Update repeat option
      if (
        newOptions?.repeat !== undefined &&
        newOptions.repeat !== options?.repeat
      ) {
        options = { ...options, repeat: newOptions.repeat };
      }
      // Recreate observer if offset or threshold changed
      const offsetChanged = newOptions?.offset !== undefined && newOptions.offset !== options?.offset;
      const thresholdChanged = newOptions?.threshold !== undefined && newOptions.threshold !== options?.threshold;
      if (offsetChanged || thresholdChanged) {
        options = { ...options, ...newOptions };
        disconnectObserver(intersectionObserver, state);
        const newOffset = options?.offset ?? 0;
        const { observer: newObserver } = createManagedObserver(
          element,
          handleIntersection,
          {
            threshold: options?.threshold ?? 0,
            rootMargin: `${newOffset}px 0px 0px 0px`,
          },
        );
        intersectionObserver = newObserver;
      }
      // Update debug if changed
      if (newOptions?.debug !== undefined && newOptions.debug !== options?.debug) {
        options = { ...options, ...newOptions };
      }
    },
    destroy() {
      disconnectObserver(intersectionObserver, state);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (sentinel) {
        sentinel.remove();
      }
      // Restore original position if we changed it
      if (!originalPosition || originalPosition === "static") {
        element.style.position = originalPosition || "";
      }
    },
  };
}
