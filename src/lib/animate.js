import { calculateRootMargin } from './animations.js';
import { setCSSVariables, setupAnimationElement } from './dom-utils.js';
import { createManagedObserver, disconnectObserver } from './observer-utils.js';

/**
 * Svelte action for scroll animations
 * Triggers animation once when element enters viewport
 *
 * @param {HTMLElement} node - The element to animate
 * @param {import('./types.js').AnimateOptions} [options={}] - Animation configuration
 * @returns {{ update: (newOptions: import('./types.js').AnimateOptions) => void, destroy: () => void }}
 *
 * @example
 * ```svelte
 * <div use:animate={{ animation: 'fade-up', duration: 1000 }}>
 *   Content
 * </div>
 * ```
 */
export const animate = (node, options = {}) => {
	// SSR Guard: Return no-op action when running on server
	if (typeof window === 'undefined') {
		return {
			update: () => {},
			destroy: () => {}
		};
	}

	let {
		animation = 'fade-in',
		duration = 800,
		delay = 0,
		offset,
		threshold = 0,
		rootMargin
	} = options;

	// Calculate rootMargin from offset (0-100%)
	let finalRootMargin = calculateRootMargin(offset, rootMargin);

	// Setup animation with utilities
	setupAnimationElement(node, animation);
	setCSSVariables(node, duration, delay);

	// Track if animation has been triggered
	let animated = false;
	const state = { isConnected: true };

	// Create IntersectionObserver for one-time animation
	const { observer } = createManagedObserver(
		node,
		(entries) => {
			entries.forEach((entry) => {
				// Trigger animation once when element enters viewport
				if (entry.isIntersecting && !animated) {
					node.classList.add('is-visible');
					animated = true;
					// Stop observing after animation triggers
					disconnectObserver(observer, state);
				}
			});
		},
		{
			threshold,
			rootMargin: finalRootMargin
		}
	);

	return {
		update(newOptions) {
			const {
				duration: newDuration,
				delay: newDelay,
				animation: newAnimation,
				offset: newOffset,
				threshold: newThreshold,
				rootMargin: newRootMargin
			} = newOptions;

			// Update CSS properties
			if (newDuration !== undefined) {
				duration = newDuration;
				setCSSVariables(node, duration, newDelay ?? delay);
			}
			if (newDelay !== undefined && newDelay !== delay) {
				delay = newDelay;
				setCSSVariables(node, duration, delay);
			}
			if (newAnimation && newAnimation !== animation) {
				animation = newAnimation;
				node.setAttribute('data-animation', newAnimation);
			}

			// Recreate observer if threshold or rootMargin changed
			if (newThreshold !== undefined || newOffset !== undefined || newRootMargin !== undefined) {
				disconnectObserver(observer, state);
				threshold = newThreshold ?? threshold;
				offset = newOffset ?? offset;
				rootMargin = newRootMargin ?? rootMargin;
				finalRootMargin = calculateRootMargin(offset, rootMargin);

				if (!animated) {
					const newObserver = new IntersectionObserver(
						(entries) => {
							entries.forEach((entry) => {
								if (entry.isIntersecting && !animated) {
									node.classList.add('is-visible');
									animated = true;
									disconnectObserver(newObserver, state);
								}
							});
						},
						{ threshold, rootMargin: finalRootMargin }
					);
					newObserver.observe(node);
					state.isConnected = true;
				}
			}
		},

		destroy() {
			disconnectObserver(observer, state);
		}
	};
};
