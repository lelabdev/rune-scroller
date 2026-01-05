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
 * @param {import('./types.js').AnimationType} animation - Animation type to apply
 * @returns {void}
 */
export function setupAnimationElement(element, animation) {
	element.classList.add('scroll-animate');
	element.setAttribute('data-animation', animation);
}

/**
 * Create sentinel element for observer-based triggering
 * Positioned absolutely relative to element (no layout impact)
 * @param {HTMLElement} element - Reference element (used to position sentinel)
 * @param {boolean} [debug=false] - If true, shows the sentinel as a visible line for debugging
 * @param {number} [offset=0] - Offset in pixels from element bottom (negative = above element)
 * @returns {HTMLElement} The created sentinel element
 */
export function createSentinel(element, debug = false, offset = 0) {
	const sentinel = document.createElement('div');
	const rect = element.getBoundingClientRect();
	const elementHeight = rect.height;
	const sentinelTop = elementHeight + offset;

	if (debug) {
		sentinel.style.cssText =
			`position:absolute;top:${sentinelTop}px;left:0;right:0;height:3px;background:#00e0ff;margin:0;padding:0;box-sizing:border-box;z-index:999;pointer-events:none`;
		sentinel.setAttribute('data-sentinel-debug', 'true');
	} else {
		sentinel.style.cssText =
			`position:absolute;top:${sentinelTop}px;left:0;right:0;height:1px;visibility:hidden;margin:0;padding:0;box-sizing:border-box;pointer-events:none`;
	}

	return sentinel;
}
