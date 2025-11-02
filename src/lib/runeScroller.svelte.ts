import type { RuneScrollerOptions } from './types';
import { setCSSVariables, setupAnimationElement, createSentinel } from './dom-utils.svelte';

/**
 * Action pour animer un élément au scroll avec un sentinel invisible juste en dessous
 * @param element - L'élément à animer
 * @param options - Options d'animation (animation type, duration, et repeat)
 * @returns Objet action Svelte
 *
 * @example
 * ```svelte
 * <!-- Animation une seule fois -->
 * <div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
 *   Content
 * </div>
 *
 * <!-- Animation répétée à chaque scroll -->
 * <div use:runeScroller={{ animation: 'fade-in-up', duration: 1000, repeat: true }}>
 *   Content
 * </div>
 * ```
 */
export function runeScroller(element: HTMLElement, options?: RuneScrollerOptions) {
	// Setup animation classes et variables CSS
	if (options?.animation || options?.duration) {
		setupAnimationElement(element, options.animation!);
		setCSSVariables(element, options.duration);
	}

	// Créer le sentinel invisible (ou visible si debug=true)
	// Sentinel positioned absolutely relative to parent (stays fixed while element animates)
	const sentinel = createSentinel(element, options?.debug);
	const parent = element.parentElement;
	if (parent) {
		// Ensure parent has position context for absolute positioning
		const parentPosition = window.getComputedStyle(parent).position;
		if (parentPosition === 'static') {
			parent.style.position = 'relative';
		}
		// Insert sentinel after element, positioned absolutely
		element.insertAdjacentElement('afterend', sentinel);
	}

	// Observer le sentinel avec cleanup tracking
	let observerConnected = true;
	const observer = new IntersectionObserver(
		(entries) => {
			const isIntersecting = entries[0].isIntersecting;
			if (isIntersecting) {
				// Ajouter la classe is-visible à l'élément
				element.classList.add('is-visible');
				// Déconnecter si pas en mode repeat
				if (!options?.repeat) {
					observer.disconnect();
					observerConnected = false;
				}
			} else if (options?.repeat) {
				// En mode repeat, retirer la classe quand le sentinel sort
				element.classList.remove('is-visible');
			}
		},
		{ threshold: 0 }
	);

	observer.observe(sentinel);

	return {
		update(newOptions?: RuneScrollerOptions) {
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
			if (observerConnected) {
				observer.disconnect();
			}
			sentinel.remove();
		}
	};
}
