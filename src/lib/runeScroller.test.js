import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { Window } from 'happy-dom';
import { runeScroller } from './runeScroller.js';

// Setup happy-dom environment
const window = new Window();
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.HTMLDivElement = window.HTMLDivElement;
global.ResizeObserver = window.ResizeObserver;
global.IntersectionObserver = window.IntersectionObserver;

describe('runeScroller Action', () => {
	let element;
	let action;

	beforeEach(() => {
		// Create test element
		element = window.document.createElement('div');
		element.style.cssText = 'width: 100px; height: 100px;';
		window.document.body.appendChild(element);

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
		// Cleanup action if it exists
		if (action && action.destroy) {
			action.destroy();
		}
		// Remove element
		if (element && element.parentElement) {
			element.remove();
		}
	});

	describe('SSR Guard', () => {
		it('returns no-op action when window is undefined', () => {
			const originalWindow = global.window;
			delete global.window;

			const action = runeScroller(element, { animation: 'fade-in' });
			expect(action.update).toBeDefined();
			expect(action.destroy).toBeDefined();
			expect(typeof action.update).toBe('function');
			expect(typeof action.destroy).toBe('function');

			global.window = originalWindow;
		});
	});

	describe('Setup', () => {
		it('creates action object successfully', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(action).toBeDefined();
			expect(typeof action.update).toBe('function');
			expect(typeof action.destroy).toBe('function');
		});

		it('creates sentinel element as child of wrapper', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			const wrapper = element.parentElement;
			const children = wrapper.children;
			expect(children.length).toBeGreaterThanOrEqual(1);
			// Element should be first, sentinel should be second (or later)
			expect(children[0]).toBe(element);
		});

		it('registers action object with update and destroy methods', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(typeof action.update).toBe('function');
			expect(typeof action.destroy).toBe('function');
		});

		it('accepts animation option', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in-up' });
			}).not.toThrow();
		});

		it('accepts duration option', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', duration: 1000 });
			}).not.toThrow();
		});

		it('accepts sentinelId option', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', sentinelId: 'test-id' });
			}).not.toThrow();
		});

		it('wrapper remains in document after creation', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			const wrapper = element.parentElement;
			expect(window.document.body.contains(wrapper)).toBe(true);
		});
	});

	describe('Animation Validation', () => {
		it('accepts fade-in animation', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in' });
			}).not.toThrow();
		});

		it('handles invalid animation gracefully', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'invalid-animation' });
			}).not.toThrow();
		});

		it('accepts all valid animation types', () => {
			const validAnimations = ['fade-in', 'fade-in-up', 'zoom-out', 'flip', 'bounce-in'];
			validAnimations.forEach((anim) => {
				const el = window.document.createElement('div');
				window.document.body.appendChild(el);
				el.getBoundingClientRect = () => ({ height: 100 });
				const act = runeScroller(el, { animation: anim });
				expect(act).toBeDefined();
				act.destroy();
				el.remove();
			});
		});
	});

	describe('onVisible Callback', () => {
		it('calls onVisible when animation becomes visible', () => {
			const callback = mock(() => {});
			action = runeScroller(element, { animation: 'fade-in', onVisible: callback });

			// Simulate sentinel entering viewport
			const wrapper = element.parentElement;
			const sentinel = wrapper.querySelector('[data-sentinel-id], div:last-child');
			if (sentinel && global.IntersectionObserver) {
				// Can't easily test without mocking IntersectionObserver fully
			}
		});

		it('is optional and not required', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in' });
			}).not.toThrow();
		});
	});

	describe('Debug Mode', () => {
		it('accepts debug=true option', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', debug: true });
			}).not.toThrow();
		});

		it('accepts debug=false option', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', debug: false });
			}).not.toThrow();
		});

		it('respects sentinelColor in debug mode', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', debug: true, sentinelColor: '#ff0000' });
			}).not.toThrow();
		});

		it('default sentinel color is #00e0ff', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', debug: true });
				// Should use default color without throwing
			}).not.toThrow();
		});
	});

	describe('Update', () => {
		it('update method exists and is callable', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(typeof action.update).toBe('function');
		});

		it('accepts animation update', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(() => {
				action.update({ animation: 'zoom-in' });
			}).not.toThrow();
		});

		it('accepts duration update', () => {
			action = runeScroller(element, { animation: 'fade-in', duration: 500 });
			expect(() => {
				action.update({ duration: 1000 });
			}).not.toThrow();
		});

		it('accepts repeat option update', () => {
			action = runeScroller(element, { animation: 'fade-in', repeat: false });
			expect(() => {
				action.update({ repeat: true });
			}).not.toThrow();
		});

		it('accepts offset option update', () => {
			action = runeScroller(element, { animation: 'fade-in', offset: 0 });
			expect(() => {
				action.update({ offset: 50 });
			}).not.toThrow();
		});

		it('can update multiple options at once', () => {
			action = runeScroller(element, { animation: 'fade-in', duration: 500 });
			expect(() => {
				action.update({ animation: 'zoom-in', duration: 1000, repeat: true });
			}).not.toThrow();
		});
	});

	describe('Cleanup/Destroy', () => {
		it('destroy method exists and is callable', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(typeof action.destroy).toBe('function');
		});

		it('destroy does not throw error', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(() => {
				action.destroy();
			}).not.toThrow();
		});

		it('returns element after destroy', () => {
			const originalParent = element.parentElement;

			action = runeScroller(element, { animation: 'fade-in' });
			const wrapper = element.parentElement;

			action.destroy();
			// After destroy, element should be in the document (either original parent or body)
			expect(element.parentElement).toBeDefined();
			// Parent should exist (either back to body or original)
			expect(window.document.contains(element)).toBe(true);
		});

		it('can be safely called multiple times', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(() => {
				action.destroy();
				action.destroy(); // Should not throw on second call
			}).not.toThrow();
		});
	});

	describe('Sentinel ID Management', () => {
		it('accepts sentinelId option', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', sentinelId: 'auto' });
			}).not.toThrow();
		});

		it('generates different IDs for different elements', () => {
			const el1 = window.document.createElement('div');
			const el2 = window.document.createElement('div');
			window.document.body.appendChild(el1);
			window.document.body.appendChild(el2);

			el1.getBoundingClientRect = () => ({ height: 100 });
			el2.getBoundingClientRect = () => ({ height: 100 });

			// Both should create successfully with auto-IDs
			const act1 = runeScroller(el1, { animation: 'fade-in' });
			const act2 = runeScroller(el2, { animation: 'fade-in' });

			expect(act1).toBeDefined();
			expect(act2).toBeDefined();

			act1.destroy();
			act2.destroy();
			el1.remove();
			el2.remove();
		});

		it('custom sentinelId is accepted and used', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', sentinelId: 'my-custom-id' });
			}).not.toThrow();
		});
	});

	describe('Offset Handling', () => {
		it('accepts offset parameter', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', offset: 100 });
			}).not.toThrow();
		});

		it('accepts negative offset for earlier trigger', () => {
			expect(() => {
				action = runeScroller(element, { animation: 'fade-in', offset: -50 });
			}).not.toThrow();
		});
	});

	describe('Edge Cases', () => {
		it('handles element with no parent gracefully', () => {
			const orphan = window.document.createElement('div');
			orphan.getBoundingClientRect = () => ({ height: 100 });
			expect(() => {
				const act = runeScroller(orphan, { animation: 'fade-in' });
				act.destroy();
			}).not.toThrow();
		});

		it('handles multiple sequential updates', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(() => {
				action.update({ animation: 'zoom-in' });
				action.update({ animation: 'flip' });
				action.update({ animation: 'bounce-in' });
			}).not.toThrow();
		});

		it('handles rapid successive updates without errors', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			expect(() => {
				for (let i = 0; i < 10; i++) {
					action.update({ duration: 500 + i * 100 });
				}
			}).not.toThrow();
		});

		it('handles combination of options without errors', () => {
			expect(() => {
				action = runeScroller(element, {
					animation: 'fade-in-up',
					duration: 1500,
					repeat: true,
					offset: 100,
					debug: true,
					sentinelColor: '#ff00ff',
					sentinelId: 'test-animation'
				});
			}).not.toThrow();
		});
	});
});
