/**
 * Animation utilities
 * Type definitions have been moved to types.js for single source of truth
 */

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
