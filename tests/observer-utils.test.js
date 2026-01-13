import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { createManagedObserver, disconnectObserver } from '../src/lib/observer-utils.js';

describe('Observer Utilities', () => {
	let window;
	let document;
	let testElement;
	let observer;

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
		if (observer) {
			observer.disconnect();
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
			observer = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5 }
			);

			expect(observer).toBeDefined();
			expect(observer.observer).toBeInstanceOf(IntersectionObserver);
		});

		it('observes target element immediately', () => {
			let observeCalled = false;
			const mockObserver = new IntersectionObserver(() => {
				observeCalled = true;
			});

			window.IntersectionObserver = mockObserver;

			observer = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5 }
			);

			expect(observeCalled).toBe(true);
		});

		it('returns correct structure', () => {
			observer = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5 }
			);

			expect(observer.observer).toBeDefined();
			expect(observer.isConnected).toBe(true);
		});

		it('handles threshold option', () => {
			observer = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.25 }
			);

			expect(observer.observer).toBeDefined();
		});

		it('handles rootMargin option', () => {
			const rootMargin = '-10% 0px';
			observer = createManagedObserver(
				testElement,
				() => {},
				{ rootMargin }
			);

			expect(observer.observer).toBeDefined();
		});

		it('handles root option', () => {
			const root = document.createElement('div');
			observer = createManagedObserver(
				testElement,
				() => {},
				{ root }
			);

			expect(observer.observer).toBeDefined();
		});

		it('handles both options', () => {
			observer = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5, rootMargin: '-20% 0px', root }
			);

			expect(observer.observer).toBeDefined();
		});
	});

	describe('disconnectObserver', () => {
		it('disconnects observer', () => {
			const mockObserver = {
				disconnect: vi.fn(),
			};

			const state = { isConnected: true };

			disconnectObserver(mockObserver, state);

			expect(mockObserver.disconnect).toHaveBeenCalledTimes(1);
			expect(state.isConnected).toBe(false);
		});

		it('does nothing if already disconnected', () => {
			const mockObserver = {
				disconnect: vi.fn(),
			};

			const state = { isConnected: false };

			expect(() => {
				disconnectObserver(mockObserver, state);
			}).not.toThrow();

			expect(mockObserver.disconnect).toHaveBeenCalledTimes(0);
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
			observer = createManagedObserver(
				testElement,
				() => {},
				{ threshold: 0.5 }
			);

			expect(observer.isConnected).toBe(true);
			expect(observer.observer).toBeDefined();

			disconnectObserver(observer, { isConnected: observer.isConnected });

			expect(observer.isConnected).toBe(false);
		});
	});
});
