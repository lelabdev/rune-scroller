/**
 * Animation type definitions and utilities
 */

/**
 * Type-safe animation names
 * Maps to CSS classes in animations.css
 */
export type AnimationType =
	| 'fade-in'
	| 'fade-in-up'
	| 'fade-in-down'
	| 'fade-in-left'
	| 'fade-in-right'
	| 'zoom-in'
	| 'zoom-out'
	| 'zoom-in-up'
	| 'zoom-in-left'
	| 'zoom-in-right'
	| 'flip'
	| 'flip-x'
	| 'slide-rotate'
	| 'bounce-in';

/**
 * Calculate rootMargin for IntersectionObserver from offset or custom rootMargin
 * @param offset - Viewport offset (0-100). 0 = bottom trigger, 100 = top trigger
 * @param rootMargin - Custom rootMargin string (takes precedence over offset)
 * @returns rootMargin string for IntersectionObserver
 */
export function calculateRootMargin(offset?: number, rootMargin?: string): string {
	return rootMargin ??
		(offset !== undefined ? `-${100 - offset}% 0px -${offset}% 0px` : '-10% 0px -10% 0px');
}
