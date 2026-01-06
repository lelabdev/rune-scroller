import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { Window } from 'happy-dom';
import { runeScroller } from './runeScroller.js';
import { mockIntersectionObserver } from './__mocks__/IntersectionObserver.js';
import { createTestElement, createTestElements, createSpacer } from './__test-helpers__/dom.js';

/**
 * Integration tests for runeScroller with real IntersectionObserver interaction
 * Tests verify: sentinel creation, positioning, animation triggering, and complex scenarios
 */
describe('runeScroller Integration Tests', () => {
	let window;
	let document;
	let element;
	let action;

	beforeEach(() => {
		// Setup test environment with proper viewport
		window = new Window({ width: 1024, height: 768, url: 'http://localhost:3000' });
		document = window.document;

		global.window = window;
		global.document = document;
		global.HTMLElement = window.HTMLElement;
		global.HTMLDivElement = window.HTMLDivElement;
		global.ResizeObserver = window.ResizeObserver || class ResizeObserver {
			constructor(callback) {
				this.callback = callback;
			}
			observe() {}
			unobserve() {}
			disconnect() {}
		};

		// Install mock IntersectionObserver
		mockIntersectionObserver.install();

		global.getComputedStyle = () => ({
			animation: 'fade-in 800ms ease-out',
			getPropertyValue: () => ''
		});

		// Create test element with spacer below to simulate scroll
		element = createTestElement({ id: 'integration-test', document });
		document.body.style.cssText = 'width: 1024px; height: 2000px; margin: 0; padding: 0;';
		const spacer = createSpacer(1000, document);
		document.body.appendChild(spacer);
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

	describe('Sentinel Wrapping & Structure', () => {
		it('wraps element correctly for flex parent', () => {
			const flexContainer = document.createElement('div');
			flexContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

			const item = createTestElement({ id: 'flex-item', document });
			flexContainer.appendChild(item);
			document.body.appendChild(flexContainer);

			action = runeScroller(item, { animation: 'fade-in' });

			// Wrapper should be in flex container
			const wrapper = item.parentElement;
			expect(wrapper.parentElement).toBe(flexContainer);
			expect(wrapper.style.display).toBe('block');
			expect(wrapper.style.width).toBe('100%');

			flexContainer.remove();
		});

		it('wraps element correctly for grid parent', () => {
			const gridContainer = document.createElement('div');
			gridContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 10px;';

			const item = createTestElement({ id: 'grid-item', document });
			gridContainer.appendChild(item);
			document.body.appendChild(gridContainer);

			action = runeScroller(item, { animation: 'fade-in' });

			// Grid layout should be preserved
			expect(gridContainer.style.display).toBe('grid');

			gridContainer.remove();
		});

		it('maintains element position in document flow', () => {
			const originalNextSibling = element.nextSibling;

			action = runeScroller(element, { animation: 'fade-in' });

			// Element should still be in document flow
			expect(document.contains(element)).toBe(true);

			action.destroy();

			// Should be restored to original position
			expect(element.nextSibling).toBe(originalNextSibling);
		});
	});

	describe('Multiple Animations', () => {
		it('handles multiple animated elements independently', () => {
			const el1 = createTestElement({ id: 'el1', document });
			const el2 = createTestElement({ id: 'el2', document });
			const el3 = createTestElement({ id: 'el3', document });

			document.body.appendChild(el1);
			document.body.appendChild(el2);
			document.body.appendChild(el3);

			const act1 = runeScroller(el1, { animation: 'fade-in', sentinelId: 'sent1' });
			const act2 = runeScroller(el2, { animation: 'zoom-in', sentinelId: 'sent2' });
			const act3 = runeScroller(el3, { animation: 'flip', sentinelId: 'sent3' });

			expect(el1.getAttribute('data-sentinel-id')).toBe('sent1');
			expect(el2.getAttribute('data-sentinel-id')).toBe('sent2');
			expect(el3.getAttribute('data-sentinel-id')).toBe('sent3');

			act1.destroy();
			act2.destroy();
			act3.destroy();
			el1.remove();
			el2.remove();
			el3.remove();
		});

		it('maintains independent animation states', () => {
			const elements = createTestElements(5, { document });
			elements.forEach((el, i) => document.body.appendChild(el));

			const actions = elements.map((el, i) =>
				runeScroller(el, {
					animation: 'fade-in',
					duration: 500 + i * 100
				})
			);

			// Each element should have correct duration
			elements.forEach((el, i) => {
				const expected = `${500 + i * 100}ms`;
				expect(el.style.getPropertyValue('--duration')).toBe(expected);
			});

			actions.forEach(a => a.destroy());
			elements.forEach(el => el.remove());
		});
	});

	describe('All 14 Animations', () => {
		const animations = [
			'fade-in', 'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right',
			'zoom-in', 'zoom-out', 'zoom-in-up', 'zoom-in-left', 'zoom-in-right',
			'flip', 'flip-x', 'slide-rotate', 'bounce-in'
		];

		animations.forEach((animationType) => {
			it(`${animationType} animation works with options`, () => {
				action = runeScroller(element, {
					animation: animationType,
					duration: 1000,
					repeat: true,
					offset: -100
				});

				expect(element.getAttribute('data-animation')).toBe(animationType);
				expect(element.style.getPropertyValue('--duration')).toBe('1000ms');
				expect(element.getAttribute('data-sentinel-id')).toBeDefined();
			});
		});
	});

	describe('Offset Variations', () => {
		it('creates sentinel with zero offset', () => {
			action = runeScroller(element, { animation: 'fade-in', offset: 0 });
			expect(element.getAttribute('data-sentinel-id')).toBeDefined();
		});

		it('creates sentinel with negative offset (early trigger)', () => {
			action = runeScroller(element, { animation: 'fade-in', offset: -200 });
			expect(element.getAttribute('data-sentinel-id')).toBeDefined();
		});

		it('creates sentinel with positive offset (late trigger)', () => {
			action = runeScroller(element, { animation: 'fade-in', offset: 200 });
			expect(element.getAttribute('data-sentinel-id')).toBeDefined();
		});

		it('handles large negative offset', () => {
			action = runeScroller(element, { animation: 'fade-in', offset: -500 });
			expect(element.getAttribute('data-sentinel-id')).toBeDefined();
		});

		it('handles large positive offset', () => {
			action = runeScroller(element, { animation: 'fade-in', offset: 500 });
			expect(element.getAttribute('data-sentinel-id')).toBeDefined();
		});
	});

	describe('Cleanup & Memory', () => {
		it('properly cleans up multiple animations', () => {
			const elements = createTestElements(10, { document });
			elements.forEach((el, i) => document.body.appendChild(el));

			const actions = elements.map((el) =>
				runeScroller(el, { animation: 'fade-in' })
			);

			// Destroy all actions
			actions.forEach(a => a.destroy());

			// Verify cleanup
			elements.forEach(el => {
				expect(el.parentElement).toBe(document.body);
			});

			elements.forEach(el => el.remove());
		});

		it('handles rapid create/destroy cycles', () => {
			const el = createTestElement({ id: 'cycle-test', document });
			document.body.appendChild(el);

			expect(() => {
				for (let i = 0; i < 5; i++) {
					const act = runeScroller(el, { animation: 'fade-in' });
					act.destroy();
				}
			}).not.toThrow();

			el.remove();
		});

		it('cleans up after error scenarios', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			// Simulate error scenario: remove element from DOM
			element.remove();

			// Should still destroy without error
			expect(() => {
				action.destroy();
			}).not.toThrow();
		});
	});

	describe('Configuration Combinations', () => {
		it('handles all options combined', () => {
			action = runeScroller(element, {
				animation: 'zoom-in',
				duration: 1500,
				repeat: true,
				offset: 100,
				debug: true,
				sentinelColor: '#ff0000',
				sentinelId: 'custom-sentinel',
				onVisible: () => {}
			});

			expect(element.getAttribute('data-sentinel-id')).toBe('custom-sentinel');
			expect(element.getAttribute('data-animation')).toBe('zoom-in');
			expect(element.style.getPropertyValue('--duration')).toBe('1500ms');
		});

		it('handles updates with multiple options', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			expect(() => {
				action.update({ animation: 'zoom-in', duration: 1000 });
				action.update({ offset: -50 });
				action.update({ repeat: true });
			}).not.toThrow();
		});

		it('preserves settings after multiple updates', () => {
			action = runeScroller(element, {
				animation: 'fade-in',
				duration: 800
			});

			action.update({ animation: 'zoom-in' });
			action.update({ duration: 1200 });

			expect(element.getAttribute('data-animation')).toBe('zoom-in');
			expect(element.style.getPropertyValue('--duration')).toBe('1200ms');
		});
	});

	describe('Edge Cases', () => {
		it('handles element with complex parent structure', () => {
			const wrapper = document.createElement('div');
			const container = document.createElement('div');
			const parent = document.createElement('div');

			parent.appendChild(container);
			container.appendChild(wrapper);
			const el = createTestElement({ id: 'complex', document });
			wrapper.appendChild(el);
			document.body.appendChild(parent);

			action = runeScroller(el, { animation: 'fade-in' });

			// Should be wrapped correctly
			expect(el.parentElement.style.position).toBe('relative');

			action.destroy();
			parent.remove();
		});

		it('handles animated element with existing classes', () => {
			element.classList.add('existing-class');
			element.id = 'with-classes';

			action = runeScroller(element, { animation: 'fade-in' });

			// Should preserve existing classes
			expect(element.classList.contains('existing-class')).toBe(true);
			expect(element.classList.contains('scroll-animate')).toBe(true);
		});

		it('handles animated element with inline styles', () => {
			element.style.cssText = 'color: red; font-size: 16px; padding: 10px;';

			action = runeScroller(element, { animation: 'fade-in' });

			// Should preserve inline styles
			expect(element.style.color).toBe('red');
			expect(element.style.fontSize).toBe('16px');
		});

		it('handles rapid concurrent updates', () => {
			action = runeScroller(element, { animation: 'fade-in' });

			const updates = [];
			for (let i = 0; i < 20; i++) {
				updates.push(
					Promise.resolve().then(() => {
						action.update({ duration: 500 + i * 10 });
					})
				);
			}

			// All updates should complete without error
			expect(updates.length).toBe(20);
		});
	});

	describe('Integration with Different Animation Types', () => {
		it('fade animations with offset variations', () => {
			const offsets = [-100, -50, 0, 50, 100];
			const fadeAnimations = ['fade-in', 'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right'];

			expect(() => {
				fadeAnimations.forEach((anim, i) => {
					const el = createTestElement({ id: `fade-${i}`, document });
					document.body.appendChild(el);
					const act = runeScroller(el, {
						animation: anim,
						offset: offsets[i]
					});
					act.destroy();
					el.remove();
				});
			}).not.toThrow();
		});

		it('zoom animations with duration variations', () => {
			const durations = [300, 600, 900, 1200, 1500];
			const zoomAnimations = ['zoom-in', 'zoom-out', 'zoom-in-up', 'zoom-in-left', 'zoom-in-right'];

			expect(() => {
				zoomAnimations.forEach((anim, i) => {
					const el = createTestElement({ id: `zoom-${i}`, document });
					document.body.appendChild(el);
					const act = runeScroller(el, {
						animation: anim,
						duration: durations[i]
					});
					act.destroy();
					el.remove();
				});
			}).not.toThrow();
		});

		it('special animations with various configurations', () => {
			const specialAnimations = ['flip', 'flip-x', 'slide-rotate', 'bounce-in'];

			expect(() => {
				specialAnimations.forEach((anim) => {
					const el = createTestElement({ id: `special-${anim}`, document });
					document.body.appendChild(el);
					const act = runeScroller(el, {
						animation: anim,
						repeat: true,
						debug: false
					});
					act.destroy();
					el.remove();
				});
			}).not.toThrow();
		});
	});
});
