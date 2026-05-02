import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { runeScroller } from '../src/lib/runeScroller.js';
import { createTestElement, hasAnimation, getAnimationType } from './__test-helpers__/dom.js';

/**
 * Unit tests for the runeScroller action (sentinel-based animation)
 * Tests verify: animation setup, configuration, and cleanup
 * Note: Sentinel triggering tests require full IntersectionObserver integration (see integration tests)
 */
describe('runeScroller Action', () => {
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

		// Create test element
		element = createTestElement({ id: 'rune-test', document });
		document.body.appendChild(element);
	});

	afterEach(() => {
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

			const action = runeScroller(element, { animation: 'fade-in' });
			expect(action.update).toBeDefined();
			expect(action.destroy).toBeDefined();

			global.window = originalWindow;
		});
	});

	describe('Wrapping & Structure', () => {
		it('wraps element in a container', () => {
			const originalParent = element.parentElement;
			action = runeScroller(element, { animation: 'fade-in' });

			const wrapper = element.parentElement;
			expect(wrapper).toBeDefined();
			expect(wrapper).not.toBe(originalParent);
			expect(wrapper.style.position).toBe('relative');
		});

		it('keeps element in document after wrapping', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(document.contains(element)).toBe(true);
		});

		it('assigns unique sentinel IDs to multiple elements', () => {
			const el1 = createTestElement({ id: 'el1', document });
			const el2 = createTestElement({ id: 'el2', document });
			document.body.appendChild(el1);
			document.body.appendChild(el2);

			const act1 = runeScroller(el1, { animation: 'fade-in' });
			const act2 = runeScroller(el2, { animation: 'fade-in' });

			const id1 = el1.getAttribute('data-sentinel-id');
			const id2 = el2.getAttribute('data-sentinel-id');

			expect(id1).toBeDefined();
			expect(id2).toBeDefined();
			expect(id1).not.toBe(id2);

			act1.destroy();
			act2.destroy();
			el1.remove();
			el2.remove();
		});
	});

	describe('Setup & Initialization', () => {
		it('creates action with update and destroy methods', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			expect(action).toBeDefined();
			expect(typeof action.update).toBe('function');
			expect(typeof action.destroy).toBe('function');
		});

		it('applies scroll-animate class and data-animation attribute', () => {
			action = runeScroller(element, { animation: 'fade-in-up' });

			expect(hasAnimation(element)).toBe(true);
			expect(getAnimationType(element)).toBe('fade-in-up');
		});

		it('sets initial opacity to 0', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			expect(element.style.opacity).toBe('0');
		});

		it('sets CSS variables for duration', () => {
			action = runeScroller(element, {
				animation: 'fade-in',
				duration: 1500
			});

			expect(element.style.getPropertyValue('--duration')).toBe('1500ms');
		});
	});

	describe('Configuration Options', () => {
		it('accepts animation option', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'zoom-in' });
			}).not.toThrow();

			expect(getAnimationType(element)).toBe('zoom-in');
		});

		it('accepts duration option', () => {
			action = runeScroller(element, {
				animation: 'fade-in',
				duration: 2000
			});

			expect(element.style.getPropertyValue('--duration')).toBe('2000ms');
		});

		it('accepts sentinelId option', () => {
			action = runeScroller(element, {
				animation: 'fade-in',
				sentinelId: 'my-sentinel'
			});

			expect(element.getAttribute('data-sentinel-id')).toBe('my-sentinel');
		});

		it('accepts offset option', () => {
			expect(() => {
				action = runeScroller(element, {
					animation: 'fade-in',
					offset: 100
				});
			}).not.toThrow();
		});

		it('accepts repeat option', () => {
			expect(() => {
				action = runeScroller(element, {
					animation: 'fade-in',
					repeat: true
				});
			}).not.toThrow();
		});

		it('accepts debug mode', () => {
			expect(() => {
				action = runeScroller(element, {
					animation: 'fade-in',
					debug: true
				});
			}).not.toThrow();
		});

		it('accepts onVisible callback', () => {
			expect(() => {
				action = runeScroller(element, {
					animation: 'fade-in',
					onVisible: () => {}
				});
			}).not.toThrow();
		});
	});

	describe('Update Method', () => {
		it('updates animation type', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			action.update({ animation: 'zoom-in' });

			expect(getAnimationType(element)).toBe('zoom-in');
		});

		it('updates duration', () => {
			action = runeScroller(element, { animation: 'fade-in', duration: 800 });

			action.update({ duration: 1600 });

			expect(element.style.getPropertyValue('--duration')).toBe('1600ms');
		});

		it('handles multiple updates', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			expect(() => {
				action.update({ animation: 'zoom-in', duration: 1000 });
				action.update({ delay: 300 });
				action.update({ offset: -50 });
			}).not.toThrow();
		});

		it('preserves animation class after update', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			action.update({ duration: 2000 });

			expect(hasAnimation(element)).toBe(true);
		});
	});

	describe('Cleanup & Destroy', () => {
		it('destroy method exists and is callable', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			expect(typeof action.destroy).toBe('function');
			expect(() => action.destroy()).not.toThrow();
		});

		it('unwraps element on destroy', () => {
			const originalParent = element.parentElement;

			action = runeScroller(element, { animation: 'fade-in' });
			const wrapper = element.parentElement;

			expect(wrapper).not.toBe(originalParent);

			action.destroy();

			// Element should be restored to original parent
			expect(element.parentElement).toBe(originalParent);
		});

		it('removes wrapper from document', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			const wrapper = element.parentElement;

			expect(document.contains(wrapper)).toBe(true);

			action.destroy();

			expect(wrapper.parentElement).toBeNull();
		});

		it('can be destroyed multiple times safely', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			expect(() => {
				action.destroy();
				action.destroy();
				action.destroy();
			}).not.toThrow();
		});

		it('leaves element in document after destroy', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			action.destroy();

			expect(document.contains(element)).toBe(true);
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
			it(`supports ${animationType} animation`, () => {
				action = runeScroller(element, { animation: animationType });

				expect(getAnimationType(element)).toBe(animationType);
				expect(hasAnimation(element)).toBe(true);
			});
		});
	});

	describe('Edge Cases', () => {
		it('handles invalid animation type gracefully', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'invalid-anim' });
			}).not.toThrow();

			// Should fallback to fade-in
			expect(getAnimationType(element)).toBe('fade-in');
		});

		it('handles element with no initial parent', () => {
			const orphan = createTestElement({ id: 'orphan', document });

			expect(() => {
				const act = runeScroller(orphan, { animation: 'fade-in' });
				act.destroy();
			}).not.toThrow();
		});

		it('handles rapid consecutive updates', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			expect(() => {
				for (let i = 0; i < 10; i++) {
					action.update({ duration: 500 + i * 100 });
				}
			}).not.toThrow();
		});

		it('works with zero duration', () => {
			action = runeScroller(element, { animation: 'fade-in', duration: 0 });

			expect(element.style.getPropertyValue('--duration')).toBe('0ms');
		});

		it('works with zero delay when duration is provided', () => {
			action = runeScroller(element, { animation: 'fade-in', duration: 800, delay: 0 });

			expect(element.style.getPropertyValue('--delay')).toBe('0ms');
		});

		it('works with large positive offset', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', offset: 500 });
			}).not.toThrow();
		});

		it('works with large negative offset', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', offset: -200 });
			}).not.toThrow();
		});
	});

	describe('Position Preservation', () => {
		it('preserves pre-existing position:absolute on element', () => {
			const el = document.createElement('div');
			el.style.position = 'absolute';
			el.style.width = '100px';
			el.style.height = '100px';
			Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 100 });
			document.body.appendChild(el);

			action = runeScroller(el, { animation: 'fade-in' });
			expect(el.style.position).toBe('absolute');
		});

		it('preserves pre-existing position:fixed on element', () => {
			const el = document.createElement('div');
			el.style.position = 'fixed';
			el.style.width = '100px';
			el.style.height = '100px';
			Object.defineProperty(el, 'offsetHeight', { configurable: true, value: 100 });
			document.body.appendChild(el);

			action = runeScroller(el, { animation: 'fade-in' });
			expect(el.style.position).toBe('fixed');
		});
	});

	describe('Debug Mode Warnings', () => {
		it('warns in console when element has overflow:hidden and debug mode is on', () => {
			element.style.overflow = 'hidden';

			const warnings = [];
			const originalWarn = console.warn;
			console.warn = (...args) => warnings.push(args.join(' '));

			try {
				action = runeScroller(element, { animation: 'fade-in', debug: true });
				expect(warnings.some(w => w.includes('overflow'))).toBe(true);
			} finally {
				console.warn = originalWarn;
			}
		});
	});

	describe('Update Method - Additional', () => {
		it('updates data-animation attribute when animation changes', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(element.getAttribute('data-animation')).toBe('fade-in');

			action.update({ animation: 'zoom-in' });
			expect(element.getAttribute('data-animation')).toBe('zoom-in');
		});

		it('recreates sentinel when offset changes via update', () => {
			action = runeScroller(element, { animation: 'fade-in', offset: 0 });
			const sentinelId = element.getAttribute('data-sentinel-id');

			action.update({ offset: 100 });

			// Sentinel should still exist in wrapper with same ID
			const wrapper = element.parentElement;
			const sentinel = wrapper.querySelector(`[data-sentinel-id="${sentinelId}"]`);
			expect(sentinel).not.toBeNull();
		});
	});

	describe('onVisible Callback', () => {
		it('fires onVisible callback when element becomes visible', () => {
			let observerCallback = null;
			const OriginalIO = global.IntersectionObserver;

			global.IntersectionObserver = class {
				constructor(cb) { observerCallback = cb; }
				observe() {}
				disconnect() {}
			};

			let calledWith = null;
			const onVisible = (el) => { calledWith = el; };

			action = runeScroller(element, { animation: 'fade-in', onVisible });

			// Simulate intersection
			observerCallback([{ isIntersecting: true }]);

			expect(calledWith).toBe(element);

			global.IntersectionObserver = OriginalIO;
		});
	});

	describe('Orphan Element', () => {
		it('does not crash with element not in DOM', () => {
			const orphan = document.createElement('div');
			orphan.style.width = '100px';
			orphan.style.height = '100px';
			Object.defineProperty(orphan, 'offsetHeight', { configurable: true, value: 100 });

			expect(() => {
				const act = runeScroller(orphan, { animation: 'fade-in' });
				act.destroy();
			}).not.toThrow();
		});
	});

	describe('Multiple runeScroller on Same Element', () => {
		it('last call sentinel wins', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			const id1 = element.getAttribute('data-sentinel-id');

			const act2 = runeScroller(element, { animation: 'zoom-in' });
			const id2 = element.getAttribute('data-sentinel-id');

			expect(id2).toBeDefined();
			expect(id2).not.toBe(id1);

			// The element's immediate parent (wrapper2) should contain the second sentinel
			const wrapper = element.parentElement;
			const sentinel = wrapper.querySelector(`[data-sentinel-id="${id2}"]`);
			expect(sentinel).not.toBeNull();

			// Cleanup: destroy second action manually, first cleaned by afterEach
			act2.destroy();
		});
	});

	describe('Duration Edge Cases', () => {
		it('sets --duration CSS variable to 0ms when duration is 0', () => {
			action = runeScroller(element, { animation: 'fade-in', duration: 0 });
			expect(element.style.getPropertyValue('--duration')).toBe('0ms');
		});
	});
});
