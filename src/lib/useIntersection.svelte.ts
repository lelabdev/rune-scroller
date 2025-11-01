import { onMount } from 'svelte';

/**
 * Composable for handling IntersectionObserver logic
 * Reduces duplication between animation components
 */

export interface IntersectionOptions {
	threshold?: number | number[];
	rootMargin?: string;
	root?: Element | null;
}

export interface UseIntersectionReturn {
	element: HTMLElement | null;
	isVisible: boolean;
}

/**
 * Factory function to create intersection observer composables
 * Eliminates duplication between useIntersection and useIntersectionOnce
 * @param options - IntersectionObserver configuration
 * @param onIntersect - Callback handler for intersection changes
 * @param once - Whether to trigger only once (default: false)
 */
function createIntersectionObserver(
	options: IntersectionOptions = {},
	onIntersect: (entry: IntersectionObserverEntry, isVisible: boolean) => void,
	once: boolean = false
) {
	const { threshold = 0.5, rootMargin = '-10% 0px -10% 0px', root = null } = options;

	let element: HTMLElement | null = $state(null);
	let isVisible = $state(false);
	let hasTriggeredOnce = false;
	let observer: IntersectionObserver | null = null;

	onMount(() => {
		if (!element) return;

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// For once-only behavior, check if already triggered
					if (once && hasTriggeredOnce) return;

					isVisible = entry.isIntersecting;
					onIntersect(entry, entry.isIntersecting);

					// Unobserve after first trigger if once=true
					if (once && entry.isIntersecting) {
						hasTriggeredOnce = true;
						observer?.unobserve(entry.target);
					}
				});
			},
			{
				threshold,
				rootMargin,
				root
			}
		);

		observer.observe(element);

		return () => {
			observer?.disconnect();
		};
	});

	return {
		get element() {
			return element;
		},
		set element(value: HTMLElement | null) {
			element = value;
		},
		get isVisible() {
			return isVisible;
		}
	};
}

/**
 * Track element visibility with IntersectionObserver
 * Updates isVisible whenever visibility changes
 * @param options - IntersectionObserver configuration
 * @param onVisible - Optional callback when visibility changes
 */
export function useIntersection(
	options: IntersectionOptions = {},
	onVisible?: (isVisible: boolean) => void
) {
	return createIntersectionObserver(
		options,
		(_entry, isVisible) => {
			onVisible?.(isVisible);
		},
		false
	);
}

/**
 * Track element visibility once (until first trigger)
 * Unobserves after first visibility
 * @param options - IntersectionObserver configuration
 */
export function useIntersectionOnce(options: IntersectionOptions = {}) {
	return createIntersectionObserver(options, () => {}, true);
}
