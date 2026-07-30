/**
 * Centralized type definitions for Rune Scroller
 */

/**
 * Animation type names (primary names plus v2.x legacy aliases)
 * @typedef {'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade-up-right' | 'fade-up-left' | 'fade-down-right' | 'fade-down-left' | 'zoom-in' | 'zoom-in-up' | 'zoom-in-down' | 'zoom-in-left' | 'zoom-in-right' | 'zoom-out' | 'zoom-out-up' | 'zoom-out-down' | 'zoom-out-left' | 'zoom-out-right' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'flip-left' | 'flip-right' | 'flip-up' | 'flip-down' | 'slide-rotate' | 'bounce-in' | 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'flip' | 'flip-x'} AnimationType
 */

/**
 * Options for the framework-neutral `animate` core and the Svelte action.
 * @typedef {Object} AnimateOptions
 * @property {AnimationType} [animation='fade-in'] - Animation type to apply
 * @property {number} [duration=400] - Animation duration in milliseconds
 * @property {boolean} [repeat=false] - Repeat animation on every scroll
 * @property {boolean} [debug=false] - Show a visual trigger indicator for debugging
 * @property {string} [sentinelColor='#00e0ff'] - Debug indicator color
 * @property {string} [sentinelId] - Unique debug indicator identifier
 * @property {string} [debugLabel] - Label to show on the debug indicator
 * @property {number} [offset=0] - Viewport offset in pixels (positive = trigger earlier). This is separate from calculateRootMargin's percentage helper.
 * @property {string} [easing='ease'] - CSS timing function
 * @property {number} [delay=0] - Animation delay in milliseconds
 * @property {number | number[]} [threshold=0] - IntersectionObserver threshold
 * @property {string} [rootMargin] - IntersectionObserver root margin override
 * @property {HTMLElement} [observerTarget] - Element to observe instead of the animated element
 * @property {(element: HTMLElement) => void} [onVisible] - Callback when animation triggers
 * @property {(element: HTMLElement) => void} [onHidden] - Callback when a repeating animation exits
 */

/**
 * Deterministic lifecycle handle returned by `animate` and the Svelte action.
 * `update` receives the complete new option set (replacement semantics).
 * @typedef {Object} AnimateHandle
 * @property {(newOptions?: AnimateOptions) => void} update - Replace the active options
 * @property {() => void} destroy - Release observers, listeners, and DOM state
 */

/**
 * Options for `useIntersection` / `useIntersectionOnce` only (not `animate`).
 * Composable defaults: threshold 0.5, rootMargin '-10% 0px -10% 0px', root null.
 * Differ from AnimateOptions (threshold 0, offset-derived rootMargin).
 * @typedef {Object} IntersectionOptions
 * @property {number | number[]} [threshold=0.5] - IntersectionObserver threshold
 * @property {string} [rootMargin='-10% 0px -10% 0px'] - margin around root
 * @property {Element | null} [root=null] - root element for observation
 */

/**
 * Return type for useIntersection and useIntersectionOnce composables
 * @typedef {Object} UseIntersectionReturn
 * @property {HTMLElement | null} element - Reference to the DOM element being observed
 * @property {boolean} isVisible - Whether the element is currently visible in viewport
 */

export {};
