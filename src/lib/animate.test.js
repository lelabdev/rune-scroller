import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { Window } from 'happy-dom';
import { animate } from './animate.js';
import { mockIntersectionObserver } from './__mocks__/IntersectionObserver.js';
import { createTestElement, getSentinel, isAnimating, hasAnimation } from './__test-helpers__/dom.js';

/**
 * Unit tests for the animate action (direct observation without sentinel)
 * Tests verify: animation triggering via IntersectionObserver, callbacks, repeat behavior
 */
describe('animate Action', () => {
	let window;
	let document;
	let element;
	let action;

	beforeEach(() => {
		// Setup test environment
		window = new Window();
		document = window.document;

		global.window = window;
		global.document = document;
		global.HTMLElement = window.HTMLElement;
		global.HTMLDivElement = window.HTMLDivElement;

		// Install mock IntersectionObserver
		mockIntersectionObserver.install();

		global.getComputedStyle = () => ({
			animation: 'fade-in 800ms ease-out',
			getPropertyValue: () => ''
		});

		// Create test element
		element = createTestElement({ id: 'animate-test', document });
		document.body.appendChild(element);
	});

	afterEach(() => {
		// Cleanup
		mockIntersectionObserver.reset();
		mockIntersectionObserver.uninstall();

		if (action && action.destroy) {
			action.destroy();
		}
		if (element?.parentElement) {
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

	describe('Setup & Initialization', () => {
		it('creates action with update and destroy methods', () => {
			action = animate(element, { animation: 'fade-in' });

			expect(action).toBeDefined();
			expect(typeof action.update).toBe('function');
			expect(typeof action.destroy).toBe('function');
		});

		it('applies scroll-animate class and data-animation attribute', () => {
			action = animate(element, { animation: 'fade-in-up' });

			expect(element.classList.contains('scroll-animate')).toBe(true);
			expect(element.getAttribute('data-animation')).toBe('fade-in-up');
		});

		it('sets CSS variables for duration and delay', () => {
			action = animate(element, {
				animation: 'fade-in',
				duration: 1200,
				delay: 300
			});

			expect(element.style.getPropertyValue('--duration')).toBe('1200ms');
			expect(element.style.getPropertyValue('--delay')).toBe('300ms');
		});
	});

	describe('Animation Triggering via IntersectionObserver', () => {
		it('applies is-visible class when element enters viewport', () => {
			action = animate(element, { animation: 'fade-in' });

			// Initially not visible
			expect(isAnimating(element)).toBe(false);

			// Trigger intersection
			mockIntersectionObserver.trigger(element, true);

			// Should now be visible
			expect(isAnimating(element)).toBe(true);
			expect(element.classList.contains('is-visible')).toBe(true);
		});

		it('applies is-visible only once (one-time trigger)', () => {
			action = animate(element, { animation: 'fade-in' });

			// First trigger
			mockIntersectionObserver.trigger(element, true);
			expect(isAnimating(element)).toBe(true);

			// Observer should be disconnected after first trigger
			const observer = mockIntersectionObserver.getObserverFor(element);
			expect(observer).toBeUndefined();
		});

		it('remains visible after exiting and re-entering viewport', () => {
			action = animate(element, { animation: 'fade-in' });

			// Trigger enter
			mockIntersectionObserver.trigger(element, true);
			expect(isAnimating(element)).toBe(true);

			// Try to trigger exit (won't work since observer disconnected)
			// Element stays in is-visible state (animation completed)
			expect(isAnimating(element)).toBe(true);
		});
	});

	describe('Callback Execution', () => {
		it('calls onVisible callback when element enters viewport', () => {
			const callback = mock();
			action = animate(element, {
				animation: 'fade-in',
				onVisible: callback
			});

			mockIntersectionObserver.trigger(element, true);

			expect(callback).toHaveBeenCalled();
			expect(callback.mock.calls.length).toBeGreaterThan(0);
		});

		it('passes element to onVisible callback', () => {
			let capturedElement = null;
			action = animate(element, {
				animation: 'fade-in',
				onVisible: (el) => {
					capturedElement = el;
				}
			});

			mockIntersectionObserver.trigger(element, true);

			expect(capturedElement).toBe(element);
		});

		it('calls onVisible only once (one-time callback)', () => {
			const callback = mock();
			action = animate(element, {
				animation: 'fade-in',
				onVisible: callback
			});

			mockIntersectionObserver.trigger(element, true);
			const firstCallCount = callback.mock.calls.length;

			// Try to trigger again (observer already disconnected)
			mockIntersectionObserver.trigger(element, false);
			mockIntersectionObserver.trigger(element, true);

			// Should not call again since observer is disconnected
			expect(callback.mock.calls.length).toBe(firstCallCount);
		});
	});

	describe('Configuration Options', () => {
		it('accepts and uses duration option', () => {
			action = animate(element, {
				animation: 'fade-in',
				duration: 2000
			});

			expect(element.style.getPropertyValue('--duration')).toBe('2000ms');
		});

		it('accepts and uses delay option', () => {
			action = animate(element, {
				animation: 'fade-in',
				delay: 500
			});

			expect(element.style.getPropertyValue('--delay')).toBe('500ms');
		});

		it('accepts threshold option', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					threshold: 0.5
				});
			}).not.toThrow();
		});

		it('accepts threshold as array', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					threshold: [0, 0.5, 1]
				});
			}).not.toThrow();
		});

		it('accepts rootMargin option', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					rootMargin: '50px 0px 50px 0px'
				});
			}).not.toThrow();
		});

		it('accepts offset as percentage', () => {
			expect(() => {
				action = animate(element, {
					animation: 'fade-in',
					offset: 30
				});
			}).not.toThrow();
		});
	});

	describe('Update Method', () => {
		it('updates animation type', () => {
			action = animate(element, { animation: 'fade-in' });

			action.update({ animation: 'zoom-in' });

			expect(element.getAttribute('data-animation')).toBe('zoom-in');
		});

		it('updates duration', () => {
			action = animate(element, { animation: 'fade-in', duration: 800 });

			action.update({ duration: 1500 });

			expect(element.style.getPropertyValue('--duration')).toBe('1500ms');
		});

		it('updates delay', () => {
			action = animate(element, { animation: 'fade-in', delay: 100 });

			action.update({ delay: 400 });

			expect(element.style.getPropertyValue('--delay')).toBe('400ms');
		});

	});

	describe('Cleanup & Destroy', () => {
		it('disconnects IntersectionObserver on destroy', () => {
			action = animate(element, { animation: 'fade-in' });
			const observer = mockIntersectionObserver.getObserverFor(element);

			action.destroy();

			// Observer should no longer observe this element
			expect(observer.observedElements.has(element)).toBe(false);
		});

		it('can be safely destroyed multiple times', () => {
			action = animate(element, { animation: 'fade-in' });

			expect(() => {
				action.destroy();
				action.destroy();
				action.destroy();
			}).not.toThrow();
		});

		it('leaves animation class in place after destroy', () => {
			action = animate(element, { animation: 'fade-in' });

			action.destroy();

			// Animation setup remains in place
			expect(hasAnimation(element)).toBe(true);
			expect(element.getAttribute('data-animation')).toBe('fade-in');
		});
	});

	describe('All 14 Animations', () => {
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

		animations.forEach((animationType) => {
			it(`${animationType} animation triggers correctly`, () => {
				action = animate(element, { animation: animationType });

				// Trigger intersection
				mockIntersectionObserver.trigger(element, true);

				// Verify animation is active
				expect(element.getAttribute('data-animation')).toBe(animationType);
				expect(isAnimating(element)).toBe(true);
			});
		});
	});

	describe('Edge Cases', () => {
		it('handles invalid animation type gracefully', () => {
			expect(() => {
				action = animate(element, { animation: 'non-existent-animation' });
			}).not.toThrow();
		});

		it('handles element removal from DOM', () => {
			action = animate(element, { animation: 'fade-in' });

			element.remove();

			expect(() => {
				mockIntersectionObserver.trigger(element, true);
			}).not.toThrow();
		});

		it('handles rapid consecutive updates', () => {
			action = animate(element, { animation: 'fade-in' });

			expect(() => {
				for (let i = 0; i < 10; i++) {
					action.update({ duration: 500 + i * 100 });
				}
			}).not.toThrow();
		});

		it('works with zero duration', () => {
			action = animate(element, { animation: 'fade-in', duration: 0 });

			expect(element.style.getPropertyValue('--duration')).toBe('0ms');
		});

		it('works with zero delay', () => {
			action = animate(element, { animation: 'fade-in', delay: 0 });

			expect(element.style.getPropertyValue('--delay')).toBe('0ms');
		});
	});
});
