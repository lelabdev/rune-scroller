import type { AnimationType } from './animations';

export interface RuneScrollerOptions {
	animation?: AnimationType;
	duration?: number;
}

/**
 * Action pour animer un élément au scroll avec un sentinel invisible juste en dessous
 * @param element - L'élément à animer
 * @param options - Options d'animation (animation type et duration)
 * @returns Objet action Svelte
 *
 * @example
 * ```svelte
 * <div use:runeScroller={{ animation: 'fade-in-up', duration: 1000 }}>
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
			if (entries[0].isIntersecting) {
				// Ajouter la classe is-visible à l'élément
				element.classList.add('is-visible');
				observer.disconnect();
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
		},
		destroy() {
			observer.disconnect();
			sentinel.remove();
		}
	};
}
