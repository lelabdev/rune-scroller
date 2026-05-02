/**
 * Animation utilities
 * Type definitions have been moved to types.js for single source of truth
 */

/**
 * All available animation types in the library
 * Includes both native rune-scroller animations and AOS-compatible names
 * @type {readonly string[]}
 */
export const ANIMATION_TYPES = [
	// Fade (10)
	'fade',
	'fade-up',
	'fade-down',
	'fade-left',
	'fade-right',
	'fade-up-right',
	'fade-up-left',
	'fade-down-right',
	'fade-down-left',
	// Zoom (10)
	'zoom-in',
	'zoom-in-up',
	'zoom-in-down',
	'zoom-in-left',
	'zoom-in-right',
	'zoom-out',
	'zoom-out-up',
	'zoom-out-down',
	'zoom-out-left',
	'zoom-out-right',
	// Slide (4)
	'slide-up',
	'slide-down',
	'slide-left',
	'slide-right',
	// Flip (4)
	'flip-left',
	'flip-right',
	'flip-up',
	'flip-down',
	// Special (2)
	'slide-rotate',
	'bounce-in',
	// Legacy aliases (v2.x backward compat)
	'fade-in',
	'fade-in-up',
	'fade-in-down',
	'fade-in-left',
	'fade-in-right',
	'flip',
	'flip-x'
];

/**
 * Calculate rootMargin for IntersectionObserver from offset or custom rootMargin
 *
 * @param {number} [offset] - Viewport offset (0-100). 0 = bottom of viewport touches top of element, 100 = top of viewport touches top of element
 * @param {string} [rootMargin] - Custom rootMargin string (takes precedence over offset)
 * @returns {string} rootMargin string for IntersectionObserver
 */
export function calculateRootMargin(offset, rootMargin) {
	return rootMargin ??
		(offset !== undefined ? `-${100 - offset}% 0px -${offset}% 0px` : '-10% 0px -10% 0px');
}
