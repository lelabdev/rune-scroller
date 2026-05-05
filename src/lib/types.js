/**
 * Centralized type definitions for Rune Scroller library
 */

/**
 * Animation type names (includes AOS-compatible names)
 * @typedef {'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade-up-right' | 'fade-up-left' | 'fade-down-right' | 'fade-down-left' | 'zoom-in' | 'zoom-in-up' | 'zoom-in-down' | 'zoom-in-left' | 'zoom-in-right' | 'zoom-out' | 'zoom-out-up' | 'zoom-out-down' | 'zoom-out-left' | 'zoom-out-right' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'flip-left' | 'flip-right' | 'flip-up' | 'flip-down' | 'slide-rotate' | 'bounce-in' | 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'flip' | 'flip-x'} AnimationType
 */

/**
 * Options for the runeScroller action
 * @typedef {Object} RuneScrollerOptions
 * @property {AnimationType} [animation='fade-up'] - Animation type to apply
 * @property {number} [duration=400] - Animation duration in milliseconds
 * @property {boolean} [repeat=false] - Repeat animation on every scroll
 * @property {boolean} [debug=false] - Show sentinel as visible line for debugging
 * @property {string} [sentinelColor='#00e0ff'] - Sentinel color for debug mode
 * @property {string} [sentinelId] - Unique identifier for sentinel
 * @property {string} [debugLabel] - Debug label to show on sentinel
 * @property {number} [offset=0] - Offset of sentinel in pixels (negative = above element)
 * @property {string} [easing='ease'] - CSS timing function
 * @property {number} [delay=0] - Animation delay in milliseconds
 * @property {(element: HTMLElement) => void} [onVisible] - Callback when animation triggers
 */

/**
 * Configuration options for IntersectionObserver
 * @typedef {Object} IntersectionOptions
 * @property {number | number[]} [threshold] - IntersectionObserver threshold
 * @property {string} [rootMargin] - Custom margin around root element
 * @property {Element | null} [root] - Root element for intersection observation
 */

/**
 * Return type for useIntersection and useIntersectionOnce composables
 * @typedef {Object} UseIntersectionReturn
 * @property {HTMLElement | null} element - Reference to the DOM element being observed
 * @property {boolean} isVisible - Whether the element is currently visible in viewport
 */

export {};
