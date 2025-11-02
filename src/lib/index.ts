// Main action (default export)
export { runeScroller as default } from './runeScroller.svelte';
export type { RuneScrollerOptions } from './runeScroller.svelte';

// Alternative actions
export { animate } from './animate.svelte';
export type { AnimateOptions } from './animate.svelte';

// Composables
export { useIntersection, useIntersectionOnce } from './useIntersection.svelte';
export type { IntersectionOptions, UseIntersectionReturn } from './useIntersection.svelte';

// Utilities
export { calculateRootMargin } from './animations';
export type { AnimationType } from './animations';
