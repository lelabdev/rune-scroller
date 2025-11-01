import type { Action } from 'svelte/action';
import { calculateRootMargin, type AnimationType } from './animations';

export interface AnimateOptions {
	animation?: AnimationType;
	duration?: number;
	delay?: number;
	offset?: number;
	threshold?: number;
	rootMargin?: string;
}

/**
 * Svelte action for scroll animations
 * Triggers animation once when element enters viewport
 *
 * @example
 * ```svelte
 * <div use:animate={{ animation: 'fade-up', duration: 1000 }}>
 *   Content
 * </div>
 * ```
 */
export const animate: Action<HTMLElement, AnimateOptions> = (node, options = {}) => {
	const {
		animation = 'fade-in',
		duration = 800,
		delay = 0,
		offset,
		threshold = 0,
		rootMargin
	} = options;

	// Calculate rootMargin from offset (0-100%)
	const finalRootMargin = calculateRootMargin(offset, rootMargin);

	// Set CSS custom properties for timing
	node.style.setProperty('--duration', `${duration}ms`);
	node.style.setProperty('--delay', `${delay}ms`);

	// Add base animation class and data attribute
	node.classList.add('scroll-animate');
	node.setAttribute('data-animation', animation);

	// Track if animation has been triggered
	let animated = false;

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
		update(newOptions: AnimateOptions) {
			const {
				duration: newDuration = 800,
				delay: newDelay = 0,
				animation: newAnimation
			} = newOptions;

			// Update CSS properties
			if (newDuration !== duration) {
				node.style.setProperty('--duration', `${newDuration}ms`);
			}
			if (newDelay !== delay) {
				node.style.setProperty('--delay', `${newDelay}ms`);
			}
			if (newAnimation && newAnimation !== animation) {
				node.setAttribute('data-animation', newAnimation);
			}
		},

		destroy() {
			observer.disconnect();
		}
	};
};
