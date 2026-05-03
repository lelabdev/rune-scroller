/**
 * Rune Scroller - Lightweight scroll animations for Svelte 5
 *
 * Main entry point exporting all public APIs
 *
 * @module rune-scroller
 */

// Note: CSS must be imported separately by the user:
//   import 'rune-scroller/animations.css'
// This avoids SSR issues with automatic CSS imports in Node/edge runtimes.

// Main action (default export - recommended)
import { runeScroller } from "./runeScroller.js";
export default runeScroller;
export { runeScroller };
export { runeScroller as rs };

// Composables
export {
  useIntersection,
  useIntersectionOnce,
} from "./useIntersection.svelte.js";

// Utilities
export { calculateRootMargin, ANIMATION_TYPES } from "./animations.js";
