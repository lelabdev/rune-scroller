import type { AnimationType } from './animations';

export interface RuneScrollerOptions {
	animation?: AnimationType;
	duration?: number;
	repeat?: boolean;
}

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
	// Setup animation classes et variables CSS si options sont fournies
	if (options?.animation || options?.duration) {
		element.classList.add('scroll-animate');
		if (options.animation) {
			element.setAttribute('data-animation', options.animation);
		}
		if (options.duration) {
			element.style.setProperty('--duration', `${options.duration}ms`);
		}
		element.style.setProperty('--delay', '0ms');
	}

	// Créer le sentinel invisible juste en dessous
	const sentinel = document.createElement('div');
	sentinel.style.height = '20px';
	sentinel.style.margin = '0';
	sentinel.style.padding = '0';
	sentinel.style.marginTop = '0.5rem';
	sentinel.style.visibility = 'hidden';

	// Insérer le sentinel après l'élément
	element.parentNode?.insertBefore(sentinel, element.nextSibling);

	// Observer le sentinel
	const observer = new IntersectionObserver(
		(entries) => {
			const isIntersecting = entries[0].isIntersecting;
			if (isIntersecting) {
				// Ajouter la classe is-visible à l'élément
				element.classList.add('is-visible');
				// Déconnecter si pas en mode repeat
				if (!options?.repeat) {
					observer.disconnect();
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
				element.style.setProperty('--duration', `${newOptions.duration}ms`);
			}
			// Update repeat option
			if (newOptions?.repeat !== undefined && newOptions.repeat !== options?.repeat) {
				options = { ...options, repeat: newOptions.repeat };
			}
		},
		destroy() {
			observer.disconnect();
			sentinel.remove();
		}
	};
}
