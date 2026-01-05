import { setCSSVariables, setupAnimationElement, createSentinel } from './dom-utils.js';
import { createManagedObserver, disconnectObserver } from './observer-utils.js';

/**
 * Svelte action for scroll animations using an invisible sentinel element
 * Trigger animations when the sentinel enters the viewport instead of the element itself
 *
 * @param {HTMLElement} element - The element to animate
 * @param {import('./types.js').RuneScrollerOptions} [options] - Animation options (animation type, duration, and repeat)
 * @returns {{ update: (newOptions?: import('./types.js').RuneScrollerOptions) => void, destroy: () => void }} Svelte action object
 *
 * @example
 * ```svelte
 * <!-- One-time animation -->
 * <div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
 *   Content
 * </div>
 *
 * <!-- Repeat animation on every scroll -->
 * <div use:runeScroller={{ animation: 'fade-in-up', duration: 1000, repeat: true }}>
 *   Content
 * </div>
 * ```
 */
export function runeScroller(element, options) {
	// SSR Guard: Return no-op action when running on server
	if (typeof window === 'undefined') {
		return {
			update: () => {},
			destroy: () => {}
		};
	}

	// Setup animation classes and CSS variables
	if (options?.animation) {
		setupAnimationElement(element, options.animation);
	}

	if (options?.duration !== undefined) {
		setCSSVariables(element, options.duration);
	}

	// Force reflow to ensure initial transform is applied before observer triggers
	void element.offsetHeight;

	// Create a wrapper div around the element to position the sentinel
	// This prevents breaking the parent's flex/grid flow
	const wrapper = document.createElement('div');
	wrapper.style.cssText = 'position:relative;display:block;width:100%;margin:0;padding:0';

	// Insert the wrapper before the element
	element.insertAdjacentElement('beforebegin', wrapper);
	wrapper.appendChild(element);

	// Create the invisible sentinel (or visible if debug=true)
	// Positioned absolutely relative to the wrapper
	const sentinel = createSentinel(element, options?.debug, options?.offset);
	wrapper.appendChild(sentinel);

	// Observe the sentinel with cleanup tracking
	const state = { isConnected: true };
	const { observer } = createManagedObserver(
		sentinel,
		(entries) => {
			const isIntersecting = entries[0].isIntersecting;
			if (isIntersecting) {
				// Add the is-visible class to trigger animation
				element.classList.add('is-visible');
				// Disconnect if not in repeat mode
				if (!options?.repeat) {
					disconnectObserver(observer, state);
				}
			} else if (options?.repeat) {
				// In repeat mode, remove the class when the sentinel exits
				element.classList.remove('is-visible');
			}
		},
		{ threshold: 0 }
	);

	return {
		update(newOptions) {
			if (newOptions?.animation) {
				element.setAttribute('data-animation', newOptions.animation);
			}
			if (newOptions?.duration) {
				setCSSVariables(element, newOptions.duration);
			}
			// Update repeat option
			if (newOptions?.repeat !== undefined && newOptions.repeat !== options?.repeat) {
				options = { ...options, repeat: newOptions.repeat };
			}
		},
		destroy() {
			disconnectObserver(observer, state);
			sentinel.remove();
			// Unwrap element (move it out of wrapper)
			const parent = wrapper.parentElement;
			if (parent) {
				wrapper.insertAdjacentElement('beforebegin', element);
			}
			wrapper.remove();
		}
	};
}
