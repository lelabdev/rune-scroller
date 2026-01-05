/**
 * Centralized type definitions for Rune Scroller library
 * All types are defined here for consistency and ease of maintenance
 */

/**
 * Animation type names available in Rune Scroller
 * @typedef {'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'zoom-in' | 'zoom-out' | 'zoom-in-up' | 'zoom-in-left' | 'zoom-in-right' | 'flip' | 'flip-x' | 'slide-rotate' | 'bounce-in'} AnimationType
 */

/**
 * Options for the runeScroller action
 * Sentinel-based scroll animation triggering
 *
 * @typedef {Object} RuneScrollerOptions
 * @property {AnimationType} [animation='fade-in'] - Animation type to apply
 * @property {number} [duration=800] - Animation duration in milliseconds
 * @property {boolean} [repeat=false] - Repeat animation on every scroll
 * @property {boolean} [debug=false] - Show sentinel as visible cyan line for debugging
 * @property {number} [offset=0] - Offset of sentinel in pixels (negative = above element)
 */

/**
 * Options for the animate action
 * Direct DOM node animation control with threshold/offset support
 *
 * @typedef {Object} AnimateOptions
 * @property {AnimationType} [animation='fade-in'] - Animation type to apply
 * @property {number} [duration=800] - Animation duration in milliseconds
 * @property {number} [delay=0] - Animation delay in milliseconds
 * @property {number} [offset] - Viewport offset percentage (0-100)
 * @property {number} [threshold=0] - Intersection ratio to trigger (0-1)
 * @property {string} [rootMargin] - Custom IntersectionObserver margin
 */

/**
 * Configuration options for IntersectionObserver
 * Used by useIntersection and useIntersectionOnce composables
 *
 * @typedef {Object} IntersectionOptions
 * @property {number | number[]} [threshold] - IntersectionObserver threshold
 * @property {string} [rootMargin] - Custom margin around root element
 * @property {Element | null} [root] - Root element for intersection observation
 */

/**
 * Return type for useIntersection and useIntersectionOnce composables
 * Provides reactive element reference and visibility state
 *
 * @typedef {Object} UseIntersectionReturn
 * @property {HTMLElement | null} element - Reference to the DOM element being observed
 * @property {boolean} isVisible - Whether the element is currently visible in viewport
 */

export {};
