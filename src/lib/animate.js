import { calculateRootMargin } from './animations.js';
import { setCSSVariables, setupAnimationElement } from './dom-utils.js';

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
	let observerConnected = true;

	// Create IntersectionObserver for one-time animation
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				// Trigger animation once when element enters viewport
				if (entry.isIntersecting && !animated) {
					node.classList.add('is-visible');
					animated = true;
					// Stop observing after animation triggers
					observer.unobserve(node);
					observerConnected = false;
				}
			});
		},
		{
			threshold,
			rootMargin: finalRootMargin
		}
	);

	observer.observe(node);

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
				if (observerConnected) {
					observer.disconnect();
					observerConnected = false;
				}
				threshold = newThreshold ?? threshold;
				offset = newOffset ?? offset;
				rootMargin = newRootMargin ?? rootMargin;
				finalRootMargin = calculateRootMargin(offset, rootMargin);

				if (!animated) {
					observer.observe(node);
					observerConnected = true;
				}
			}
		},

		destroy() {
			if (observerConnected) {
				observer.disconnect();
			}
		}
	};
};
