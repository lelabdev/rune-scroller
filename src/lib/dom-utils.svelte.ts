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
 * Create and inject invisible sentinel element for observer-based triggering
 * Positioned absolutely at the bottom of the element to avoid breaking flex/grid layouts
 * @param element - Reference element (sentinel will be positioned inside it)
 * @returns The created sentinel element
 */
export function createSentinel(element: HTMLElement): HTMLElement {
	const sentinel = document.createElement('div');
	// Position sentinel at the bottom of the element without affecting layout flow
	// Uses absolute positioning so it doesn't break flex/grid, and pointer-events:none to prevent interactions
	sentinel.style.cssText =
		'position:absolute;bottom:0;left:0;right:0;height:20px;visibility:hidden;pointer-events:none';

	// Ensure element has position context for absolute positioning
	if (element.style.position === '' || element.style.position === 'static') {
		element.style.position = 'relative';
	}

	element.appendChild(sentinel);
	return sentinel;
}
