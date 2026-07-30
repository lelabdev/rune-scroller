/**
 * Rune Scroller — Svelte integration entry point.
 *
 * Exposes the Svelte action (a thin alias over the framework-neutral
 * `animate` core) together with the rune-based intersection composables.
 * Core-only consumers should import `animate` from `rune-scroller` instead.
 *
 * @module rune-scroller/svelte
 */

// Note: CSS must be imported separately by the user:
//   import 'rune-scroller/animations.css'
// This avoids SSR issues with automatic CSS imports in Node/edge runtimes.

import { animate } from "./animate.js";

// Svelte action (default export — recommended)
export default animate;
export { animate };
export { animate as runeScroller };
export { animate as rs };

// Rune-based intersection composables
export {
  useIntersection,
  useIntersectionOnce,
} from "./useIntersection.svelte.js";

// Utilities
export { calculateRootMargin, ANIMATION_TYPES } from "./animations.js";

// Public JSDoc types for TypeScript consumers.
export * from "./types.js";
