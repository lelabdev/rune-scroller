import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { runeScroller } from './runeScroller.js';
import { animate } from './animate.js';
import { createTestElement, createTestElements } from './__test-helpers__/dom.js';

/**
 * Robustness tests for animation library
 * Tests: memory leaks, error handling, edge cases, scalability
 */
describe('Robustness Tests', () => {
	let window;
	let document;

	beforeEach(() => {
		window = new Window();
		document = window.document;

		global.window = window;
		global.document = document;
		global.HTMLElement = window.HTMLElement;
		global.HTMLDivElement = window.HTMLDivElement;
		global.IntersectionObserver = window.IntersectionObserver;
		global.ResizeObserver = window.ResizeObserver;
		global.getComputedStyle = () => ({ animation: 'fade-in', getPropertyValue: () => '' });

		document.body.style.cssText = 'width: 1024px; height: 5000px; margin: 0; padding: 0;';
	});

	afterEach(() => {
		delete global.window;
		delete global.document;
		delete global.getComputedStyle;
	});

	describe('Memory & Scalability', () => {
		it('handles 100+ animations without errors', () => {
			const elements = createTestElements(100, { document });
			elements.forEach((el) => document.body.appendChild(el));

			expect(() => {
				const actions = elements.map((el, i) =>
					runeScroller(el, { animation: 'fade-in' })
				);
				actions.forEach(a => a.destroy());
			}).not.toThrow();

			elements.forEach(el => el.remove());
		});

		it('handles alternating animations without memory issues', () => {
			const elements = createTestElements(50, { document });
			elements.forEach((el) => document.body.appendChild(el));

			expect(() => {
				elements.forEach((el, i) => {
					const type = i % 2 === 0 ? 'runeScroller' : 'animate';
					const action = type === 'runeScroller'
						? runeScroller(el, { animation: 'fade-in' })
						: animate(el, { animation: 'zoom-in' });
					action.destroy();
				});
			}).not.toThrow();

			elements.forEach(el => el.remove());
		});

		it('handles rapid animation creation/destruction', () => {
			const el = createTestElement({ id: 'stress-test', document });
			document.body.appendChild(el);

			expect(() => {
				for (let i = 0; i < 50; i++) {
					const action = runeScroller(el, {
						animation: 'fade-in',
						duration: 300 + i * 10
					});
					action.destroy();
				}
			}).not.toThrow();

			el.remove();
		});
	});

	describe('Error Handling', () => {
		it('handles null/undefined element gracefully', () => {
			expect(() => {
				runeScroller(undefined, { animation: 'fade-in' });
			}).toThrow();
		});

		it('handles destroyed element without crashing', () => {
			const el = createTestElement({ id: 'destroyed', document });
			document.body.appendChild(el);

			const action = runeScroller(el, { animation: 'fade-in' });
			el.remove();

			// Should still be safe to destroy
			expect(() => {
				action.destroy();
			}).not.toThrow();
		});

		it('handles multiple destroy calls safely', () => {
			const el = createTestElement({ id: 'multi-destroy', document });
			document.body.appendChild(el);

			const action = runeScroller(el, { animation: 'fade-in' });

			expect(() => {
				action.destroy();
				action.destroy();
				action.destroy();
				action.destroy();
			}).not.toThrow();

			el.remove();
		});

		it('handles invalid animation types gracefully', () => {
			const el = createTestElement({ id: 'invalid-anim', document });
			document.body.appendChild(el);

			expect(() => {
				const action = runeScroller(el, { animation: 'nonexistent-animation' });
				action.destroy();
			}).not.toThrow();

			el.remove();
		});

		it('handles update on destroyed action', () => {
			const el = createTestElement({ id: 'update-destroyed', document });
			document.body.appendChild(el);

			const action = runeScroller(el, { animation: 'fade-in' });
			action.destroy();

			// Updating destroyed action should not crash
			expect(() => {
				action.update({ duration: 1000 });
			}).not.toThrow();

			el.remove();
		});
	});

	describe('Edge Cases', () => {
		it('handles element with no dimensions', () => {
			const el = document.createElement('div');
			document.body.appendChild(el);

			expect(() => {
				const action = runeScroller(el, { animation: 'fade-in' });
				action.destroy();
			}).not.toThrow();

			el.remove();
		});

		it('handles element with display: none', () => {
			const el = createTestElement({ id: 'hidden', document });
			el.style.display = 'none';
			document.body.appendChild(el);

			expect(() => {
				const action = runeScroller(el, { animation: 'fade-in' });
				action.destroy();
			}).not.toThrow();

			el.remove();
		});

		it('handles element with transform applied', () => {
			const el = createTestElement({ id: 'transformed', document });
			el.style.transform = 'rotate(45deg) scale(0.5)';
			document.body.appendChild(el);

			expect(() => {
				const action = runeScroller(el, { animation: 'fade-in' });
				action.destroy();
			}).not.toThrow();

			el.remove();
		});

		it('handles deeply nested elements', () => {
			let parent = document.body;
			for (let i = 0; i < 10; i++) {
				const div = document.createElement('div');
				parent.appendChild(div);
				parent = div;
			}

			const el = createTestElement({ id: 'deep', document });
			parent.appendChild(el);

			expect(() => {
				const action = runeScroller(el, { animation: 'fade-in' });
				action.destroy();
			}).not.toThrow();
		});

		it('handles extreme option values', () => {
			const el = createTestElement({ id: 'extreme', document });
			document.body.appendChild(el);

			expect(() => {
				const action = runeScroller(el, {
					animation: 'fade-in',
					duration: 999999,
					offset: -99999,
					delay: 0
				});
				action.destroy();
			}).not.toThrow();

			el.remove();
		});
	});

	describe('Concurrent Operations', () => {
		it('handles animations created in tight loop', () => {
			const elements = [];
			expect(() => {
				for (let i = 0; i < 30; i++) {
					const el = createTestElement({ id: `loop-${i}`, document });
					document.body.appendChild(el);
					elements.push(el);
					runeScroller(el, { animation: 'fade-in' });
				}
				elements.forEach(el => el.remove());
			}).not.toThrow();
		});

		it('handles mixed operation sequences', () => {
			const el = createTestElement({ id: 'mixed', document });
			document.body.appendChild(el);

			expect(() => {
				const action = runeScroller(el, { animation: 'fade-in' });
				action.update({ animation: 'zoom-in' });
				action.update({ duration: 1000 });
				action.update({ animation: 'flip' });
				action.destroy();
				// Try operations after destroy
				action.update({ duration: 500 });
				action.destroy();
			}).not.toThrow();

			el.remove();
		});
	});

	describe('Performance', () => {
		it('completes 100 animations setup within reasonable time', () => {
			const elements = createTestElements(100, { document });
			elements.forEach((el) => document.body.appendChild(el));

			const startTime = Date.now();

			const actions = elements.map((el) =>
				runeScroller(el, { animation: 'fade-in' })
			);

			const setupTime = Date.now() - startTime;

			// Should complete setup in reasonable time (< 5 seconds)
			expect(setupTime).toBeLessThan(5000);

			actions.forEach(a => a.destroy());
			elements.forEach(el => el.remove());
		});

		it('handles 100 updates efficiently', () => {
			const el = createTestElement({ id: 'perf-test', document });
			document.body.appendChild(el);

			const action = runeScroller(el, { animation: 'fade-in' });

			const startTime = Date.now();

			for (let i = 0; i < 100; i++) {
				action.update({ duration: 500 + i * 5 });
			}

			const updateTime = Date.now() - startTime;

			// Should handle 100 updates efficiently (< 2 seconds)
			expect(updateTime).toBeLessThan(2000);

			action.destroy();
			el.remove();
		});
	});

	describe('SSR Compatibility', () => {
		it('returns no-op action when window is undefined', () => {
			const originalWindow = global.window;
			delete global.window;

			const el = createTestElement({ id: 'ssr', document });
			const action = runeScroller(el, { animation: 'fade-in' });

			expect(typeof action.update).toBe('function');
			expect(typeof action.destroy).toBe('function');

			// Should not throw
			action.update({ duration: 1000 });
			action.destroy();

			global.window = originalWindow;
		});
	});
});
