/**
 * Rune Scroller - Lightweight scroll animations for Svelte 5
 *
 * Main entry point exporting all public APIs
 *
 * @module rune-scroller
 */

// Main action (default export - recommended)
import { runeScroller } from './runeScroller.js';
export default runeScroller;
export { runeScroller };

// Alternative actions
export { animate } from './animate.js';

// Composables
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte.js';

// Utilities
export { calculateRootMargin } from './animations.js';
