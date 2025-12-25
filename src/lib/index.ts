// Type definitions (centralized)
export type {
	RuneScrollerOptions,
	AnimateOptions,
	IntersectionOptions,
	UseIntersectionReturn
} from './types';
export type { AnimationType } from './animations';

// Main action (default export)
export { runeScroller as default } from './runeScroller.svelte.js';

// Alternative actions
export { animate } from './animate.svelte.js';

// Composables
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte.js';

// Utilities
export { calculateRootMargin } from './animations';
