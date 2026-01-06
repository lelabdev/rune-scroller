/**
 * Mock Svelte 5 Runes for testing useIntersection composables
 * Allows testing reactive state and effects without Svelte runtime
 */

class ReactiveValue {
	constructor(initialValue) {
		this._value = initialValue;
		this._subscribers = new Set();
	}

	get value() {
		return this._value;
	}

	set value(newValue) {
		if (this._value !== newValue) {
			this._value = newValue;
			this._subscribers.forEach((fn) => fn(newValue));
		}
	}

	subscribe(fn) {
		this._subscribers.add(fn);
		return () => this._subscribers.delete(fn);
	}
}

// Global state management for mocks
let effects = [];
let effectCleanups = [];

export const mockSvelteRunes = {
	effects,
	effectCleanups,

	install() {
		// Mock $state
		global.$state = (initialValue) => {
			return new ReactiveValue(initialValue);
		};

		// Mock $effect
		global.$effect = (fn) => {
			const cleanup = fn();
			effects.push(fn);
			effectCleanups.push(cleanup);
			return cleanup;
		};

		// Mock $effect.pre
		global.$effect.pre = (fn) => {
			const cleanup = fn();
			effects.push(fn);
			effectCleanups.push(cleanup);
			return cleanup;
		};

		// Mock $derived
		global.$derived = (expression) => {
			return expression;
		};

		// Mock $derived.by
		global.$derived.by = (fn) => {
			return fn();
		};

		this.reset();
	},

	uninstall() {
		if (typeof global !== 'undefined') {
			delete global.$state;
			delete global.$effect;
			delete global.$derived;
		}
	},

	reset() {
		// Run all cleanups
		effectCleanups.forEach((cleanup) => {
			if (typeof cleanup === 'function') {
				try {
					cleanup();
				} catch (e) {
					// Silently ignore cleanup errors
				}
			}
		});

		effects.length = 0;
		effectCleanups.length = 0;
	},

	getEffects() {
		return effects;
	},

	runCleanups() {
		effectCleanups.forEach((cleanup) => {
			if (typeof cleanup === 'function') {
				try {
					cleanup();
				} catch (e) {
					// Silently ignore cleanup errors
				}
			}
		});
	},

	createState(initialValue) {
		return new ReactiveValue(initialValue);
	}
};

export default mockSvelteRunes;
