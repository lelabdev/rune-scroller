import { setCSSVariables, setupAnimationElement, createSentinel } from './dom-utils.js';

/**
 * Action pour animer un élément au scroll avec un sentinel invisible juste en dessous
 *
 * @param {HTMLElement} element - L'élément à animer
 * @param {import('./types.js').RuneScrollerOptions} [options] - Options d'animation (animation type, duration, et repeat)
 * @returns {{ update: (newOptions?: import('./types.js').RuneScrollerOptions) => void, destroy: () => void }} Objet action Svelte
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
export function runeScroller(element, options) {
	// Setup animation classes et variables CSS
	if (options?.animation) {
		setupAnimationElement(element, options.animation);
	}

	if (options?.duration !== undefined) {
		setCSSVariables(element, options.duration);
	}

	// Force reflow to ensure initial transform is applied before observer triggers
	void element.offsetHeight;

	// Créer un wrapper div autour de l'élément pour le sentinel en position absolute
	// Ceci évite de casser le flex/grid flow du parent
	const wrapper = document.createElement('div');
	wrapper.style.cssText = 'position:relative;display:block;width:100%;margin:0;padding:0';

	// Insérer le wrapper avant l'élément
	element.insertAdjacentElement('beforebegin', wrapper);
	wrapper.appendChild(element);

	// Créer le sentinel invisible (ou visible si debug=true)
	// Sentinel positioned absolutely relative to wrapper
	const sentinel = createSentinel(element, options?.debug, options?.offset);
	wrapper.appendChild(sentinel);

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
			if (observerConnected) {
				observer.disconnect();
			}
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
