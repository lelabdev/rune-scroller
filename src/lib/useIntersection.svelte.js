/**
 * Composable for handling IntersectionObserver logic
 * Reduces duplication between animation components
 */

/**
 * Factory function to create intersection observer composables
 * Eliminates duplication between useIntersection and useIntersectionOnce
 * @param {import('./types.js').IntersectionOptions} [options={}] - IntersectionObserver configuration
 * @param {((entry: IntersectionObserverEntry, isVisible: boolean) => void) | undefined} onIntersect - Callback handler for intersection changes
 * @param {boolean} [once=false] - Whether to trigger only once
 * @returns {import('./types.js').UseIntersectionReturn}
 */
function createIntersectionObserver(options = {}, onIntersect = undefined, once = false) {
	const { threshold = 0.5, rootMargin = '-10% 0px -10% 0px', root = null } = options;

	let element = $state(null);
	let isVisible = $state(false);
	let hasTriggeredOnce = false;
	/** @type {IntersectionObserver | null} */
	let observer = null;

	$effect(() => {
		if (!element) return;

		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// For once-only behavior, check if already triggered
					if (once && hasTriggeredOnce) return;

					isVisible = entry.isIntersecting;
					if (onIntersect) {
						onIntersect(entry, entry.isIntersecting);
					}

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
		set element(value) {
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
 * @param {import('./types.js').IntersectionOptions} [options={}] - IntersectionObserver configuration
 * @param {(isVisible: boolean) => void} [onVisible] - Optional callback when visibility changes
 * @returns {import('./types.js').UseIntersectionReturn}
 */
export function useIntersection(options = {}, onVisible) {
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
 * @param {import('./types.js').IntersectionOptions} [options={}] - IntersectionObserver configuration
 * @returns {import('./types.js').UseIntersectionReturn}
 */
export function useIntersectionOnce(options = {}) {
	return createIntersectionObserver(options, () => {}, true);
}
