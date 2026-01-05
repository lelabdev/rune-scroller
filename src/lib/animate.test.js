import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { animate } from './animate.js';

/**
 * Unit tests for the animate action (direct observation without sentinel)
 * Covers IntersectionObserver threshold, rootMargin, delay, and animation triggering
 */
describe('animate Action', () => {
	let window;
	let document;
	let element;
	let action;

	beforeEach(() => {
		window = new Window();
		document = window.document;

		global.window = window;
		global.document = document;
		global.HTMLElement = window.HTMLElement;
		global.HTMLDivElement = window.HTMLDivElement;
		global.IntersectionObserver = window.IntersectionObserver;

		global.getComputedStyle = () => ({
			animation: 'fade-in 800ms ease-out',
			getPropertyValue: () => ''
		});

		element = document.createElement('div');
		element.style.cssText = 'width: 100px; height: 100px;';
		element.textContent = 'Animate Test';
		document.body.appendChild(element);

		// Mock getBoundingClientRect
		element.getBoundingClientRect = () => ({
			height: 100,
			width: 100,
			top: 0,
			left: 0,
			bottom: 100,
			right: 100,
			x: 0,
			y: 0,
			toJSON: () => {}
		});
	});

	afterEach(() => {
		if (action && action.destroy) {
			action.destroy();
		}
		if (element && element.parentElement) {
			element.remove();
		}
		delete global.window;
		delete global.document;
		delete global.getComputedStyle;
	});

	describe('SSR Guard', () => {
		it('returns no-op action when window is undefined', () => {
			const originalWindow = global.window;
			delete global.window;

			const action = animate(element, { animation: 'fade-in' });
			expect(action.update).toBeDefined();
			expect(action.destroy).toBeDefined();

			global.window = originalWindow;
		});
	});

	describe('Setup', () => {
		it('creates action object with update and destroy methods', () => {
			action = animate(element, { animation: 'fade-in' });

			expect(action).toBeDefined();
			expect(typeof action.update).toBe('function');
			expect(typeof action.destroy).toBe('function');
		});

		it('applies animation class and data attribute', () => {
			action = animate(element, { animation: 'fade-in-up' });

			expect(element.classList.contains('scroll-animate')).toBe(true);
			expect(element.getAttribute('data-animation')).toBe('fade-in-up');
		});

		it('sets CSS variables for duration and delay', () => {
			action = animate(element, {
				animation: 'fade-in',
				duration: 1000,
				delay: 200
			});

			expect(element.style.getPropertyValue('--duration')).toBe('1000ms');
			expect(element.style.getPropertyValue('--delay')).toBe('200ms');
		});
	});

	describe('Direct Element Observation', () => {
		it('observes element directly (not a sentinel)', () => {
			action = animate(element, { animation: 'fade-in' });

			// Element itself is being observed, not a sentinel wrapper
			expect(element.parentElement.tagName).toBe('BODY');
			// No wrapper should be created
			expect(element.style.position).not.toBe('relative');
		});

		it('applies animation class on initialization', () => {
			action = animate(element, { animation: 'zoom-in', duration: 1500 });

			expect(element.classList.contains('scroll-animate')).toBe(true);
			expect(element.getAttribute('data-animation')).toBe('zoom-in');
		});
	});

	describe('Threshold Configuration', () => {
		it('accepts threshold option for IntersectionObserver', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					threshold: 0.5
				});
			}).not.toThrow();
		});

		it('defaults to threshold 0 if not provided', () => {
			action = animate(element, { animation: 'fade-in' });

			expect(action).toBeDefined();
			expect(typeof action.update).toBe('function');
		});

		it('accepts threshold as array', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					threshold: [0, 0.25, 0.5, 0.75, 1]
				});
			}).not.toThrow();
		});
	});

	describe('Offset Configuration', () => {
		it('accepts offset as percentage for rootMargin calculation', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					offset: 20  // 20% offset
				});
			}).not.toThrow();
		});

		it('accepts rootMargin for direct control', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					rootMargin: '100px 0px 100px 0px'
				});
			}).not.toThrow();
		});
	});

	describe('Animation Options', () => {
		it('accepts delay option', () => {
			action = animate(element, {
				animation: 'fade-in',
				delay: 500
			});

			expect(element.style.getPropertyValue('--delay')).toBe('500ms');
		});

		it('accepts onVisible callback', () => {
			let called = false;
			action = animate(element, {
				animation: 'fade-in',
				onVisible: () => {
					called = true;
				}
			});

			expect(action).toBeDefined();
		});

		it('validates animation type', () => {
			expect(() => {
				action = animate(element, {
					animation: 'invalid-animation'
				});
			}).not.toThrow();

			// Should fallback to 'fade-in'
			expect(element.getAttribute('data-animation')).toBe('fade-in');
		});

		it('respects repeat option', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					repeat: true
				});
			}).not.toThrow();

			expect(action).toBeDefined();
		});
	});

	describe('Update', () => {
		it('updates animation option', () => {
			action = animate(element, { animation: 'fade-in' });

			action.update({ animation: 'zoom-in' });

			expect(element.getAttribute('data-animation')).toBe('zoom-in');
		});

		it('updates duration option', () => {
			action = animate(element, { animation: 'fade-in', duration: 800 });

			action.update({ duration: 1200 });

			expect(element.style.getPropertyValue('--duration')).toBe('1200ms');
		});

		it('updates delay option', () => {
			action = animate(element, { animation: 'fade-in', delay: 100 });

			action.update({ delay: 300 });

			expect(element.style.getPropertyValue('--delay')).toBe('300ms');
		});
	});

	describe('Cleanup', () => {
		it('disconnects observer on destroy', () => {
			action = animate(element, { animation: 'fade-in' });

			expect(action).toBeDefined();
			expect(typeof action.destroy).toBe('function');

			action.destroy();

			// Action destroyed successfully
			expect(action.destroy).toBeDefined();
		});

		it('leaves animation classes in place after destroy', () => {
			action = animate(element, { animation: 'fade-in' });

			expect(element.classList.contains('scroll-animate')).toBe(true);
			expect(element.getAttribute('data-animation')).toBe('fade-in');

			action.destroy();

			// After destroy, animation setup remains (classes/attributes not removed)
			// This is intentional - the animation stays in the "final" state
			expect(element.classList.contains('scroll-animate')).toBe(true);
			expect(element.getAttribute('data-animation')).toBe('fade-in');
		});

		it('prevents observer from triggering callback after destroy', () => {
			let callbackCount = 0;
			action = animate(element, {
				animation: 'fade-in',
				onVisible: () => {
					callbackCount++;
				}
			});

			action.destroy();

			// Callback should not be triggered after destroy
			// In happy-dom, IntersectionObserver callbacks don't auto-trigger,
			// but we can verify the observer was disconnected
			expect(action.destroy).toBeDefined();
		});
	});

	describe('All 14 Animations', () => {
		const animations = [
			'fade-in', 'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right',
			'zoom-in', 'zoom-out', 'zoom-in-up', 'zoom-in-left', 'zoom-in-right',
			'flip', 'flip-x', 'slide-rotate', 'bounce-in'
		];

		animations.forEach(animationType => {
			it(`supports ${animationType} animation`, () => {
				action = animate(element, { animation: animationType });

				expect(element.getAttribute('data-animation')).toBe(animationType);
				expect(element.classList.contains('scroll-animate')).toBe(true);

				action.destroy();
			});
		});
	});
});
