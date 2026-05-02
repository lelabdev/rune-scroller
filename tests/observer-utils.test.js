import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { createManagedObserver, disconnectObserver } from '../src/lib/observer-utils.js';

describe('Observer Utilities', () => {
	let window;
	let document;
	let testElement;
	let result;

	beforeEach(() => {
		window = new Window();
		document = window.document;
		global.window = window;
		global.document = document;
		global.HTMLElement = window.HTMLElement;
		global.HTMLDivElement = window.HTMLDivElement;
		global.IntersectionObserver = window.IntersectionObserver;

		testElement = document.createElement('div');
		testElement.style.cssText = 'width: 100px; height: 100px;';
		document.body.appendChild(testElement);
	});

	afterEach(() => {
		if (result?.observer) {
			result.observer.disconnect();
		}
		if (testElement?.parentElement) {
			testElement.remove();
		}
		delete global.window;
		delete global.document;
		delete global.HTMLElement;
		delete global.HTMLDivElement;
		delete global.IntersectionObserver;
	});

	describe('createManagedObserver', () => {
		it('creates IntersectionObserver instance', () => {
			result = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5 }
			);

			expect(result).toBeDefined();
			expect(result.observer).toBeDefined();
			expect(result.observer).toBeInstanceOf(IntersectionObserver);
		});

		it('observes target element immediately', () => {
			let observeCalled = false;
			const RealObserver = global.IntersectionObserver;
			global.IntersectionObserver = class extends RealObserver {
				constructor(cb, opts) {
					super(cb, opts);
					observeCalled = true;
				}
			};

			result = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5 }
			);

			expect(observeCalled).toBe(true);
			global.IntersectionObserver = RealObserver;
		});

		it('returns correct structure', () => {
			result = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5 }
			);

			expect(result.observer).toBeDefined();
			expect(result.isConnected).toBe(true);
		});

		it('handles threshold option', () => {
			result = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.25 }
			);

			expect(result.observer).toBeDefined();
		});

		it('handles rootMargin option', () => {
			const rootMargin = '-10% 0px';
			result = createManagedObserver(
				testElement,
				() => {},
				{ rootMargin }
			);

			expect(result.observer).toBeDefined();
		});

		it('handles root option', () => {
			const root = document.createElement('div');
			result = createManagedObserver(
				testElement,
				() => {},
				{ root }
			);

			expect(result.observer).toBeDefined();
		});

		it('handles both options', () => {
			const root = document.createElement('div');
			result = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5, rootMargin: '-20% 0px', root }
			);

			expect(result.observer).toBeDefined();
		});
	});

	describe('disconnectObserver', () => {
		it('disconnects observer', () => {
			let disconnectCalled = 0;
			const mockObserver = {
				disconnect: () => { disconnectCalled++; }
			};

			const state = { isConnected: true };

			disconnectObserver(mockObserver, state);

			expect(disconnectCalled).toBe(1);
			expect(state.isConnected).toBe(false);
		});

		it('does nothing if already disconnected', () => {
			let disconnectCalled = 0;
			const mockObserver = {
				disconnect: () => { disconnectCalled++; }
			};

			const state = { isConnected: false };
			expect(() => {
				disconnectObserver(mockObserver, state);
			}).not.toThrow();

			expect(disconnectCalled).toBe(0);
			expect(state.isConnected).toBe(false);
		});

		it('handles null observer', () => {
			const state = { isConnected: true };

			expect(() => {
				disconnectObserver(null, state);
			}).not.toThrow();

			expect(state.isConnected).toBe(true);
		});

		it('handles undefined observer', () => {
			const state = { isConnected: true };

			expect(() => {
				disconnectObserver(undefined, state);
			}).not.toThrow();

			expect(state.isConnected).toBe(true);
		});
	});

	describe('Integration Tests', () => {
		it('complete lifecycle with real observer', () => {
			result = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5 }
			);

			expect(result.isConnected).toBe(true);
			expect(result.observer).toBeDefined();

			const state = { isConnected: true };
			disconnectObserver(result.observer, state);

			expect(state.isConnected).toBe(false);
		});
	});
});
