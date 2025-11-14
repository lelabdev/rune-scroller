// Type definitions (centralized)
export type {
	RuneScrollerOptions,
	AnimateOptions,
	IntersectionOptions,
	UseIntersectionReturn
} from './types';
export type { AnimationType } from './animations';

// Main action (default export)
export { runeScroller as default } from './runeScroller.svelte';

// Component export
export { default as RuneScroller } from './RuneScroller.svelte';

// Alternative actions
export { animate } from './animate.svelte';

// Composables
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte';

// Utilities
export { calculateRootMargin } from './animations';
