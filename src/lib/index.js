/**
 * Rune Scroller — framework-neutral scroll animation core.
 *
 * This entry point is free of any framework runtime. It exposes `animate`, a
 * plain DOM API that works in Vanilla JS and in adapters for any framework.
 * Svelte consumers should import the action and composables from
 * `rune-scroller/svelte`.
 *
 * @module rune-scroller
 */

// Note: CSS must be imported separately by the user:
//   import 'rune-scroller/animations.css'
// This avoids SSR issues with automatic CSS imports in Node/edge runtimes.

// Core DOM API (default export — recommended for Vanilla JS)
import { animate } from "./animate.js";
export default animate;
export { animate };

// Utilities
export { calculateRootMargin, ANIMATION_TYPES } from "./animations.js";

// Public JSDoc types for TypeScript consumers.
export * from "./types.js";
