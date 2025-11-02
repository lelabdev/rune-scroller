/**
 * Centralized type definitions for Rune Scroller library
 * All types are defined here for consistency and ease of maintenance
 */

import type { AnimationType } from './animations';

/**
 * Options for the runeScroller action
 * Sentinel-based scroll animation triggering
 */
export interface RuneScrollerOptions {
	animation?: AnimationType;
	duration?: number;
	repeat?: boolean;
	debug?: boolean;  // Show sentinel as visible red line for debugging
}

/**
 * Options for the animate action
 * Direct DOM node animation control with threshold/offset support
 */
export interface AnimateOptions {
	animation?: AnimationType;
	duration?: number;
	delay?: number;
	offset?: number;
	threshold?: number;
	rootMargin?: string;
}

/**
 * Configuration options for IntersectionObserver
 * Used by useIntersection and useIntersectionOnce composables
 */
export interface IntersectionOptions {
	threshold?: number | number[];
	rootMargin?: string;
	root?: Element | null;
}

/**
 * Return type for useIntersection and useIntersectionOnce composables
 * Provides reactive element reference and visibility state
 */
export interface UseIntersectionReturn {
	element: HTMLElement | null;
	isVisible: boolean;
}
