import type { AnimationType } from './animations';

/**
 * Set CSS custom properties on an element
 * @param element - Target DOM element
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 */
export function setCSSVariables(
	element: HTMLElement,
	duration?: number,
	delay: number = 0
): void {
	if (duration !== undefined) {
		element.style.setProperty('--duration', `${duration}ms`);
	}
	element.style.setProperty('--delay', `${delay}ms`);
}

/**
 * Setup animation element with required classes and attributes
 * @param element - Target DOM element
 * @param animation - Animation type to apply
 */
export function setupAnimationElement(element: HTMLElement, animation: AnimationType): void {
	element.classList.add('scroll-animate');
	element.setAttribute('data-animation', animation);
}

/**
 * Create sentinel element for observer-based triggering
 * Positioned absolutely below element (no layout impact)
 * @param element - Reference element (used to position sentinel at its bottom)
 * @param debug - If true, shows the sentinel as a visible line for debugging
 * @returns The created sentinel element
 */
export function createSentinel(element: HTMLElement, debug: boolean = false): HTMLElement {
	const sentinel = document.createElement('div');

	// Get element dimensions to position sentinel at its bottom
	const rect = element.getBoundingClientRect();
	const elementHeight = rect.height;

	if (debug) {
		// Debug mode: visible primary color line (cyan #00e0ff)
		sentinel.style.cssText =
			`position:absolute;top:${elementHeight}px;left:0;right:0;height:3px;background:#00e0ff;margin:0;padding:0;box-sizing:border-box;z-index:999;pointer-events:none`;
		sentinel.setAttribute('data-sentinel-debug', 'true');
	} else {
		// Production: invisible positioned absolutely (no layout impact)
		sentinel.style.cssText =
			`position:absolute;top:${elementHeight}px;left:0;right:0;height:1px;visibility:hidden;margin:0;padding:0;box-sizing:border-box;pointer-events:none`;
	}

	return sentinel;
}
