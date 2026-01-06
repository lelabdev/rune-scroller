import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { runeScroller } from './runeScroller.js';
import { animate } from './animate.js';
import { mockIntersectionObserver } from './__mocks__/IntersectionObserver.js';
import { createTestElement, createTestElements, hasAnimation, getAnimationType } from './__test-helpers__/dom.js';

/**
 * Comprehensive animation tests for all 14 animations
 * Tests: proper CSS setup, animation class application, behavior with different options
 */
describe('All 14 Animations - Comprehensive Tests', () => {
	let window;
	let document;

	const animations = [
		'fade-in',
		'fade-in-up',
		'fade-in-down',
		'fade-in-left',
		'fade-in-right',
		'zoom-in',
		'zoom-out',
		'zoom-in-up',
		'zoom-in-left',
		'zoom-in-right',
		'flip',
		'flip-x',
		'slide-rotate',
		'bounce-in'
	];

	beforeEach(() => {
		window = new Window();
		document = window.document;

		global.window = window;
		global.document = document;
		global.HTMLElement = window.HTMLElement;
		global.HTMLDivElement = window.HTMLDivElement;
		global.IntersectionObserver = window.IntersectionObserver;
		global.ResizeObserver = window.ResizeObserver || class ResizeObserver {
			constructor(callback) {
				this.callback = callback;
			}
			observe() {}
			unobserve() {}
			disconnect() {}
		};

		global.getComputedStyle = () => ({
			animation: 'fade-in 800ms ease-out',
			getPropertyValue: () => ''
		});

		document.body.style.cssText = 'width: 1024px; height: 5000px; margin: 0; padding: 0;';
		mockIntersectionObserver.install();
	});

	afterEach(() => {
		mockIntersectionObserver.reset();
		mockIntersectionObserver.uninstall();
		delete global.window;
		delete global.document;
		delete global.getComputedStyle;
	});

	describe('runeScroller - All Animations Setup', () => {
		animations.forEach((animationType) => {
			it(`${animationType}: applies animation class on init`, () => {
				const element = createTestElement({ id: `rune-${animationType}`, document });
				document.body.appendChild(element);

				const action = runeScroller(element, { animation: animationType });

				expect(hasAnimation(element)).toBe(true);
				expect(getAnimationType(element)).toBe(animationType);
				expect(element.classList.contains('scroll-animate')).toBe(true);
				expect(element.style.opacity).toBe('0');

				action.destroy();
				element.remove();
			});

			it(`${animationType}: works with custom duration`, () => {
				const element = createTestElement({ id: `rune-duration-${animationType}`, document });
				document.body.appendChild(element);

				const action = runeScroller(element, {
					animation: animationType,
					duration: 2000
				});

				expect(element.style.getPropertyValue('--duration')).toBe('2000ms');

				action.destroy();
				element.remove();
			});

			it(`${animationType}: accepts repeat option`, () => {
				const element = createTestElement({ id: `rune-repeat-${animationType}`, document });
				document.body.appendChild(element);

				const action = runeScroller(element, {
					animation: animationType,
					repeat: true
				});

				// Verify element is set up correctly with repeat option
				expect(element.classList.contains('scroll-animate')).toBe(true);
				expect(getAnimationType(element)).toBe(animationType);
				expect(element.getAttribute('data-sentinel-id')).toBeDefined();

				action.destroy();
				element.remove();
			});

			it(`${animationType}: works with offset variations`, () => {
				const offsets = [-200, -50, 0, 50, 200];

				expect(() => {
					offsets.forEach((offset, i) => {
						const element = createTestElement({
							id: `rune-offset-${animationType}-${i}`,
							document
						});
						document.body.appendChild(element);

						const action = runeScroller(element, {
							animation: animationType,
							offset
						});

						expect(element.getAttribute('data-sentinel-id')).toBeDefined();

						action.destroy();
						element.remove();
					});
				}).not.toThrow();
			});

			it(`${animationType}: can be updated to different animation`, () => {
				const element = createTestElement({ id: `rune-update-${animationType}`, document });
				document.body.appendChild(element);

				const action = runeScroller(element, { animation: animationType });
				const otherAnimation = animations[(animations.indexOf(animationType) + 1) % animations.length];

				action.update({ animation: otherAnimation });

				expect(getAnimationType(element)).toBe(otherAnimation);

				action.destroy();
				element.remove();
			});

			it(`${animationType}: maintains settings through updates`, () => {
				const element = createTestElement({ id: `rune-settings-${animationType}`, document });
				document.body.appendChild(element);

				const action = runeScroller(element, {
					animation: animationType,
					duration: 1000,
					repeat: true
				});

				action.update({ duration: 1500 });

				expect(getAnimationType(element)).toBe(animationType);
				expect(element.style.getPropertyValue('--duration')).toBe('1500ms');

				action.destroy();
				element.remove();
			});
		});
	});

	describe('animate - All Animations Setup', () => {
		animations.forEach((animationType) => {
			it(`${animationType}: applies animation class on init`, () => {
				const element = createTestElement({ id: `animate-${animationType}`, document });
				document.body.appendChild(element);

				const action = animate(element, { animation: animationType });

				expect(hasAnimation(element)).toBe(true);
				expect(getAnimationType(element)).toBe(animationType);
				expect(element.classList.contains('scroll-animate')).toBe(true);

				action.destroy();
				element.remove();
			});

			it(`${animationType}: triggers is-visible when element intersects`, () => {
				const element = createTestElement({ id: `animate-trigger-${animationType}`, document });
				document.body.appendChild(element);

				const action = animate(element, { animation: animationType });

				expect(element.classList.contains('is-visible')).toBe(false);

				// Trigger element intersection
				mockIntersectionObserver.trigger(element, true);

				expect(element.classList.contains('is-visible')).toBe(true);

				action.destroy();
				element.remove();
			});

			it(`${animationType}: works with custom duration`, () => {
				const element = createTestElement({ id: `animate-duration-${animationType}`, document });
				document.body.appendChild(element);

				const action = animate(element, {
					animation: animationType,
					duration: 1500
				});

				expect(element.style.getPropertyValue('--duration')).toBe('1500ms');

				action.destroy();
				element.remove();
			});

			it(`${animationType}: works with delay option`, () => {
				const element = createTestElement({ id: `animate-delay-${animationType}`, document });
				document.body.appendChild(element);

				const action = animate(element, {
					animation: animationType,
					duration: 800,
					delay: 300
				});

				expect(element.style.getPropertyValue('--delay')).toBe('300ms');

				action.destroy();
				element.remove();
			});

			it(`${animationType}: can be updated to different animation`, () => {
				const element = createTestElement({ id: `animate-update-${animationType}`, document });
				document.body.appendChild(element);

				const action = animate(element, { animation: animationType });
				const otherAnimation = animations[(animations.indexOf(animationType) + 1) % animations.length];

				action.update({ animation: otherAnimation });

				expect(getAnimationType(element)).toBe(otherAnimation);

				action.destroy();
				element.remove();
			});
		});
	});

	describe('Animation Combinations - Sequences', () => {
		it('multiple different animations can be set up on same page', () => {
			const elements = animations.slice(0, 5).map((anim, i) =>
				createTestElement({ id: `seq-${i}`, document })
			);
			elements.forEach(el => document.body.appendChild(el));

			const actions = elements.map((el, i) =>
				runeScroller(el, { animation: animations[i] })
			);

			// Verify all animations are set up correctly and independently
			elements.forEach((el, i) => {
				expect(getAnimationType(el)).toBe(animations[i]);
				expect(el.classList.contains('scroll-animate')).toBe(true);
				// All should start not visible
				expect(el.classList.contains('is-visible')).toBe(false);
				// All should have unique sentinel IDs
				expect(el.getAttribute('data-sentinel-id')).toBeDefined();
			});

			// Verify unique sentinel IDs
			const sentinelIds = elements.map(el => el.getAttribute('data-sentinel-id'));
			const uniqueIds = new Set(sentinelIds);
			expect(uniqueIds.size).toBe(elements.length);

			actions.forEach(a => a.destroy());
			elements.forEach(el => el.remove());
		});

		it('animations with varying durations maintain independence', () => {
			const elements = animations.slice(0, 3).map((anim, i) =>
				createTestElement({ id: `duration-seq-${i}`, document })
			);
			elements.forEach(el => document.body.appendChild(el));

			const durations = [500, 1000, 1500];
			const actions = elements.map((el, i) =>
				runeScroller(el, {
					animation: animations[i],
					duration: durations[i]
				})
			);

			elements.forEach((el, i) => {
				expect(el.style.getPropertyValue('--duration')).toBe(`${durations[i]}ms`);
			});

			actions.forEach(a => a.destroy());
			elements.forEach(el => el.remove());
		});

		it('fade animations can be mixed with zoom animations', () => {
			const fadeAnimations = animations.filter(a => a.startsWith('fade'));
			const zoomAnimations = animations.filter(a => a.startsWith('zoom'));

			expect(() => {
				const fadElem = createTestElement({ id: 'fade-mix', document });
				const zoomElem = createTestElement({ id: 'zoom-mix', document });
				document.body.appendChild(fadElem);
				document.body.appendChild(zoomElem);

				const fadeAction = runeScroller(fadElem, { animation: fadeAnimations[0] });
				const zoomAction = runeScroller(zoomElem, { animation: zoomAnimations[0] });

				expect(getAnimationType(fadElem)).toBe(fadeAnimations[0]);
				expect(getAnimationType(zoomElem)).toBe(zoomAnimations[0]);

				fadeAction.destroy();
				zoomAction.destroy();
				fadElem.remove();
				zoomElem.remove();
			}).not.toThrow();
		});

		it('special animations (flip, bounce) work alongside standard animations', () => {
			const specialAnimations = ['flip', 'flip-x', 'slide-rotate', 'bounce-in'];
			const standardAnimations = ['fade-in', 'zoom-in'];

			expect(() => {
				const elements = [...specialAnimations, ...standardAnimations].map((anim, i) =>
					createTestElement({ id: `special-${i}`, document })
				);
				elements.forEach(el => document.body.appendChild(el));

				const actions = elements.map((el, i) => {
					const animType = i < specialAnimations.length
						? specialAnimations[i]
						: standardAnimations[i - specialAnimations.length];
					return runeScroller(el, { animation: animType });
				});

				actions.forEach(a => a.destroy());
				elements.forEach(el => el.remove());
			}).not.toThrow();
		});
	});

	describe('Animation Performance With All Types', () => {
		it('can initialize all 14 animations without performance degradation', () => {
			const elements = animations.map((anim, i) =>
				createTestElement({ id: `perf-${i}`, document })
			);
			elements.forEach(el => document.body.appendChild(el));

			const startTime = Date.now();

			const actions = elements.map((el, i) =>
				runeScroller(el, { animation: animations[i] })
			);

			const initTime = Date.now() - startTime;

			// All 14 animations should initialize quickly (< 500ms total)
			expect(initTime).toBeLessThan(500);

			actions.forEach(a => a.destroy());
			elements.forEach(el => el.remove());
		});

		it('can update all 14 animations efficiently', () => {
			const elements = animations.map((anim, i) =>
				createTestElement({ id: `perf-update-${i}`, document })
			);
			elements.forEach(el => document.body.appendChild(el));

			const actions = elements.map((el, i) =>
				runeScroller(el, { animation: animations[i] })
			);

			const startTime = Date.now();

			// Update each animation to different duration
			actions.forEach((action, i) => {
				action.update({ duration: 1000 + i * 100 });
			});

			const updateTime = Date.now() - startTime;

			// Updates should be very fast (< 100ms)
			expect(updateTime).toBeLessThan(100);

			actions.forEach(a => a.destroy());
			elements.forEach(el => el.remove());
		});
	});

	describe('Animation Fallback Behavior', () => {
		it('invalid animation type falls back to fade-in', () => {
			const element = createTestElement({ id: 'fallback-test', document });
			document.body.appendChild(element);

			const action = runeScroller(element, { animation: 'invalid-animation' });

			// Should fall back to fade-in
			expect(getAnimationType(element)).toBe('fade-in');

			action.destroy();
			element.remove();
		});

		it('undefined animation defaults to fade-in', () => {
			const element = createTestElement({ id: 'fallback-undefined', document });
			document.body.appendChild(element);

			const action = runeScroller(element, {});

			expect(getAnimationType(element)).toBe('fade-in');

			action.destroy();
			element.remove();
		});
	});
});
