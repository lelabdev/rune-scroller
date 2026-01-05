/**
 * Set CSS custom properties on an element
 * @param {HTMLElement} element - Target DOM element
 * @param {number} [duration] - Animation duration in milliseconds
 * @param {number} [delay=0] - Animation delay in milliseconds
 * @returns {void}
 */
export function setCSSVariables(element, duration, delay = 0) {
	if (duration !== undefined) {
		element.style.setProperty('--duration', `${duration}ms`);
	}
	element.style.setProperty('--delay', `${delay}ms`);
}

/**
 * Setup animation element with required classes and attributes
 * @param {HTMLElement} element - Target DOM element
 * @param {import('./animations.js').AnimationType} animation - Animation type to apply
 * @returns {void}
 */
export function setupAnimationElement(element, animation) {
	element.classList.add('scroll-animate');
	element.setAttribute('data-animation', animation);
}

/**
 * Create sentinel element for observer-based triggering
 * Positioned absolutely relative to element (no layout impact)
 * Automatically repositions when element is resized via ResizeObserver
 * @param {HTMLElement} element - Reference element (used to position sentinel)
 * @param {boolean} [debug=false] - If true, shows the sentinel as a visible line for debugging
 * @param {number} [offset=0] - Offset in pixels from element bottom (negative = above element)
 * @returns {{ sentinel: HTMLElement, cleanup: () => void }} Object with sentinel element and cleanup function
 */
export function createSentinel(element, debug = false, offset = 0) {
	const sentinel = document.createElement('div');

	const updatePosition = () => {
		const rect = element.getBoundingClientRect();
		const sentinelTop = rect.height + offset;
		sentinel.style.top = `${sentinelTop}px`;
	};

	// Initial position
	updatePosition();

	// Apply styling (debug or hidden)
	const baseStyles =
		'position:absolute;left:0;right:0;height:1px;margin:0;padding:0;box-sizing:border-box;pointer-events:none';
	if (debug) {
		sentinel.style.cssText = `${baseStyles};height:3px;background:#00e0ff;z-index:999;visibility:visible`;
		sentinel.setAttribute('data-sentinel-debug', 'true');
	} else {
		sentinel.style.cssText = `${baseStyles};visibility:hidden`;
	}

	// Track element resize and reposition sentinel automatically
	const resizeObserver = new ResizeObserver(updatePosition);
	resizeObserver.observe(element);

	// Return sentinel and cleanup function
	return {
		sentinel,
		cleanup: () => {
			resizeObserver.disconnect();
		}
	};
}
