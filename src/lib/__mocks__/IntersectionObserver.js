/**
 * Mock IntersectionObserver for testing
 * Allows manual triggering of intersection events for animation testing
 */

const observers = new Map();
let observerId = 0;

export class IntersectionObserverMock {
	constructor(callback, options = {}) {
		this.id = observerId++;
		this.callback = callback;
		this.options = options;
		this.observedElements = new Set();
		this.isConnected = true;

		observers.set(this.id, this);
	}

	observe(element) {
		if (!this.isConnected) return;
		this.observedElements.add(element);
	}

	unobserve(element) {
		this.observedElements.delete(element);
	}

	disconnect() {
		this.isConnected = false;
		this.observedElements.clear();
		observers.delete(this.id);
	}

	// Testing API: Manually trigger intersection
	trigger(element, isIntersecting) {
		if (!this.observedElements.has(element)) return;

		const entry = {
			target: element,
			isIntersecting,
			intersectionRatio: isIntersecting ? 1 : 0,
			boundingClientRect: element.getBoundingClientRect?.() || {},
			intersectionRect: isIntersecting ? { top: 0, height: 100 } : {},
			rootBounds: { top: 0, height: window.innerHeight || 768 },
			time: Date.now(),
			toJSON: () => ({})
		};

		this.callback([entry], this);
	}
}

// Global API
export const mockIntersectionObserver = {
	observers: new Map(),
	lastObserver: null,

	install() {
		global.IntersectionObserver = IntersectionObserverMock;
		this.reset();
	},

	uninstall() {
		if (typeof global !== 'undefined') {
			delete global.IntersectionObserver;
		}
	},

	reset() {
		observers.forEach((obs) => obs.disconnect());
		observers.clear();
		observerId = 0;
		this.lastObserver = null;
		this.observers.clear();
	},

	// Get the last created observer
	getLastCreated() {
		if (observers.size === 0) return null;
		const ids = Array.from(observers.keys());
		return observers.get(ids[ids.length - 1]);
	},

	// Get all observers
	getAll() {
		return Array.from(observers.values());
	},

	// Trigger intersection on an element
	trigger(element, isIntersecting) {
		const matchingObservers = Array.from(observers.values()).filter((obs) =>
			obs.observedElements.has(element)
		);

		matchingObservers.forEach((obs) => obs.trigger(element, isIntersecting));
	},

	// Trigger intersection on all observed elements
	triggerAll(isIntersecting) {
		observers.forEach((obs) => {
			obs.observedElements.forEach((element) => {
				obs.trigger(element, isIntersecting);
			});
		});
	},

	// Get observer for specific element
	getObserverFor(element) {
		return Array.from(observers.values()).find((obs) =>
			obs.observedElements.has(element)
		);
	}
};

export default IntersectionObserverMock;
