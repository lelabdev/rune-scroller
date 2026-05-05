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

  // Warn about overflow:hidden in debug mode
  if (options?.debug && element.style.overflow === "hidden") {
    console.warn(
      "[rune-scroller] Element has overflow:hidden — the sentinel indicator may be clipped in debug mode.",
    );
  }

  // Set CSS variables for duration and delay
  if (options?.duration !== undefined || options?.delay !== undefined) {
    setCSSVariables(element, options?.duration, options?.delay);
  if (options?.easing !== undefined) { element.style.setProperty("--easing", options.easing); }
  }

  // Force reflow to ensure transitions are ready
  void element.offsetHeight;

  // Create a wrapper div around the element to position the sentinel
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:relative;display:block;width:100%;margin:0;padding:0;box-sizing:border-box";
  element.insertAdjacentElement("beforebegin", wrapper);
  wrapper.appendChild(element);

  // Create the invisible sentinel (or visible if debug=true)
  // Positioned absolutely relative to the wrapper
  const sentinelResult = createSentinel(
    element,
    options?.debug,
    options?.offset,
    options?.sentinelColor,
    options?.debugLabel,
    options?.sentinelId,
  );
  const sentinel = sentinelResult.element;
  const sentinelId = sentinelResult.id;

  // Add sentinel ID to element (either provided or auto-generated)
  element.setAttribute("data-sentinel-id", sentinelId);

  wrapper.appendChild(sentinel);

  // Observe the sentinel with cleanup tracking
  const state = { isConnected: true };
  let currentSentinel = sentinel;
  let resizeObserver;
  let intersectionObserver;

  const { observer } = createManagedObserver(
    sentinel,
    (entries) => {
      const isIntersecting = entries[0].isIntersecting;
      if (isIntersecting) {
        // Add the is-visible class to trigger animation
        element.classList.add("is-visible");
        // Call onVisible callback if provided
        options?.onVisible?.(element);
        // Disconnect if not in repeat mode
        if (!options?.repeat) {
          disconnectObserver(intersectionObserver, state);
        }
      } else if (options?.repeat) {
        // In repeat mode, remove the class when the sentinel exits
        element.classList.remove("is-visible");
      }
    },
    { threshold: 0 },
  );

  intersectionObserver = observer;

  // Function to recreate sentinel when element is resized
  const recreateSentinel = () => {
    const newSentinelResult = createSentinel(
      element,
      options?.debug,
      options?.offset,
      options?.sentinelColor,
      options?.debugLabel,
      sentinelId,
    );
    const newSentinel = newSentinelResult.element;
    currentSentinel.replaceWith(newSentinel);
    currentSentinel = newSentinel;
    // Update observer to watch the new sentinel
    intersectionObserver.disconnect();
    intersectionObserver.observe(newSentinel);
  };

  // Setup ResizeObserver to handle element resizing
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      recreateSentinel();
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
      if (newOptions?.easing !== undefined) { element.style.setProperty("--easing", newOptions.easing); }
      }
      // Update repeat option
      if (
        newOptions?.repeat !== undefined &&
        newOptions.repeat !== options?.repeat
      ) {
        options = { ...options, repeat: newOptions.repeat };
      }
      // Update offset and debug if changed
      if (
        (newOptions?.offset !== undefined &&
          newOptions.offset !== options?.offset) ||
        (newOptions?.debug !== undefined && newOptions.debug !== options?.debug)
      ) {
        options = { ...options, ...newOptions };
        recreateSentinel();
      }
    },
    destroy() {
      disconnectObserver(intersectionObserver, state);
      // Cleanup ResizeObserver
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      currentSentinel.remove();
      // Unwrap element (move it out of wrapper)
      const parent = wrapper.parentElement;
      if (parent) {
        wrapper.insertAdjacentElement("beforebegin", element);
      }
      wrapper.remove();
    },
  };
}
