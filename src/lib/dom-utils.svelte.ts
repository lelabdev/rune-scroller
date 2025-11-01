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
 * @param element - Reference element (sentinel will be placed after it)
 * @returns The created sentinel element
 */
export function createSentinel(element: HTMLElement): HTMLElement {
	const sentinel = document.createElement('div');
	// Use cssText for efficient single-statement styling
	sentinel.style.cssText = 'height:20px;margin-top:0.5rem;visibility:hidden';
	element.parentNode?.insertBefore(sentinel, element.nextSibling);
	return sentinel;
}
