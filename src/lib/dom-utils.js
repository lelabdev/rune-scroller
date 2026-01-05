/**
 * Global counter for auto-generating sentinel IDs
 * @type {number}
 */
let sentinelCounter = 0;

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
 * @param {string} [sentinelColor='#00e0ff'] - Color for debug sentinel
 * @param {string} [debugLabel] - Label text to display on sentinel (e.g., animation name)
 * @param {string} [sentinelId] - Unique identifier for sentinel (auto-generated if not provided)
 * @returns {{ element: HTMLElement, id: string }} The created sentinel element and its ID
 */
export function createSentinel(element, debug = false, offset = 0, sentinelColor = '#00e0ff', debugLabel = '', sentinelId) {
	const sentinel = document.createElement('div');
	// Use offsetHeight instead of getBoundingClientRect for accurate dimensions
	// getBoundingClientRect returns transformed dimensions (affected by scale, etc)
	// offsetHeight returns the actual element height independent of CSS transforms
	const elementHeight = element.offsetHeight;
	const sentinelTop = elementHeight + offset;

	// Generate auto-ID if not provided
	if (!sentinelId) {
		sentinelCounter++;
		sentinelId = `sentinel-${sentinelCounter}`;
	}

	// Always set the data-sentinel-id attribute
	sentinel.setAttribute('data-sentinel-id', sentinelId);

	if (debug) {
		sentinel.style.cssText =
			`position:absolute;top:${sentinelTop}px;left:0;right:0;height:3px;background:${sentinelColor};margin:0;padding:2px 4px;box-sizing:border-box;z-index:999;pointer-events:none;display:flex;align-items:center;font-size:10px;color:#000;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`;
		sentinel.setAttribute('data-sentinel-debug', 'true');
		// Show ID in debug mode (or debugLabel if provided)
		if (debugLabel) {
			sentinel.textContent = debugLabel;
		} else {
			sentinel.textContent = sentinelId;
		}
	} else {
		sentinel.style.cssText =
			`position:absolute;top:${sentinelTop}px;left:0;right:0;height:1px;visibility:hidden;margin:0;padding:0;box-sizing:border-box;pointer-events:none`;
	}

	return { element: sentinel, id: sentinelId };
}

/**
 * Check if CSS animations are loaded and warn if not
 * @returns {boolean} True if CSS appears to be loaded
 */
export function isCSSLoaded() {
	if (typeof document === 'undefined') return true;
	const style = getComputedStyle(document.documentElement);
	return style.getPropertyValue('--duration') !== undefined || style.getPropertyValue('--delay') !== undefined;
}

/**
 * Warn if CSS is not loaded
 * @returns {void}
 */
export function checkAndWarnIfCSSNotLoaded() {
	if (typeof document === 'undefined') return;
	// Try to detect if animations.css is loaded by checking for animation classes
	const test = document.createElement('div');
	test.className = 'scroll-animate is-visible';
	test.style.position = 'absolute';
	test.style.opacity = '0';
	document.body.appendChild(test);
	const computed = getComputedStyle(test);
	const hasAnimation = computed.animation !== 'none' && computed.animation !== '';
	test.remove();

	if (!hasAnimation) {
		console.warn(
			'[rune-scroller] CSS animations not found. Make sure to import the animations:\n' +
			'  import "rune-scroller/animations.css";\n' +
			'Documentation: https://github.com/lelabdev/rune-scroller#installation'
		);
	}
}
