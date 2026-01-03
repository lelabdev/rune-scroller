/**
 * Rune Scroller - Lightweight scroll animations for Svelte 5
 *
 * Main entry point exporting all public APIs
 *
 * @module rune-scroller
 */

// Main action (default export - recommended)
export { runeScroller as default } from './runeScroller.svelte.js';

// Alternative actions
export { animate } from './animate.svelte.js';

// Composables
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte.js';

// Utilities
export { calculateRootMargin } from './animations.js';
