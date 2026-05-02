/**
 * Rune Scroller - Lightweight scroll animations for Svelte 5
 *
 * Main entry point exporting all public APIs
 *
 * @module rune-scroller
 */

// Import CSS animations automatically
import './animations.css';

// Main action (default export - recommended)
import { runeScroller } from './runeScroller.js';
export default runeScroller;
export { runeScroller };

// Animation utilities
export { ANIMATION_TYPES, calculateRootMargin } from './animations.js';

// Composables
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte.js';
