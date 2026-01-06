/**
 * DOM Test Helpers
 * Utilities for creating test elements, verifying animations, and measuring performance
 */

/**
 * Create a test element with default styles
 * @param {Object} options - Configuration options
 * @param {string} options.width - Width (default: '100px')
 * @param {string} options.height - Height (default: '100px')
 * @param {string} options.id - Element ID
 * @param {string} options.className - Additional CSS classes
 * @param {Document} options.document - Document to use (for testing)
 * @returns {HTMLElement}
 */
export function createTestElement(options = {}) {
	const {
		width = '100px',
		height = '100px',
		id = null,
		className = '',
		document: doc = typeof document !== 'undefined' ? document : global.document
	} = options;

	const element = doc.createElement('div');
	element.style.cssText = `
		width: ${width};
		height: ${height};
		background: #ccc;
		position: relative;
	`;

	if (id) element.id = id;
	if (className) element.className = className;

	element.textContent = `Test ${id || 'Element'}`;

	// Mock getBoundingClientRect
	if (!element.getBoundingClientRect) {
		element.getBoundingClientRect = () => ({
			width: parseInt(width),
			height: parseInt(height),
			top: 0,
			left: 0,
			bottom: parseInt(height),
			right: parseInt(width),
			x: 0,
			y: 0,
			toJSON: () => ({})
		});
	}

	// Mock offsetHeight
	Object.defineProperty(element, 'offsetHeight', {
		configurable: true,
		value: parseInt(height)
	});

	return element;
}

/**
 * Create multiple test elements
 * @param {number} count - Number of elements to create
 * @param {Object} options - Element options (passed to createTestElement)
 * @returns {HTMLElement[]}
 */
export function createTestElements(count, options = {}) {
	const elements = [];
	for (let i = 0; i < count; i++) {
		elements.push(
			createTestElement({
				...options,
				id: options.id ? `${options.id}-${i}` : `element-${i}`
			})
		);
	}
	return elements;
}

/**
 * Get sentinel element from animated element's wrapper
 * @param {HTMLElement} element - The animated element
 * @returns {HTMLElement|null}
 */
export function getSentinel(element) {
	const wrapper = element.parentElement;
	if (!wrapper) return null;

	// Sentinel is typically the last child or has data-sentinel-id attribute
	const sentinel = wrapper.querySelector('[data-sentinel-id]');
	if (sentinel) return sentinel;

	// Fallback: find child that is not the element
	for (let i = 0; i < wrapper.children.length; i++) {
		if (wrapper.children[i] !== element) {
			return wrapper.children[i];
		}
	}

	return null;
}

/**
 * Check if element has animation applied
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export function hasAnimation(element) {
	return (
		element.classList.contains('scroll-animate') &&
		element.hasAttribute('data-animation')
	);
}

/**
 * Check if animation is active (is-visible)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export function isAnimating(element) {
	return element.classList.contains('is-visible');
}

/**
 * Get animation type from element
 * @param {HTMLElement} element - Element to check
 * @returns {string|null}
 */
export function getAnimationType(element) {
	return element.getAttribute('data-animation');
}

/**
 * Get CSS variable value from element
 * @param {HTMLElement} element - Element to check
 * @param {string} variableName - Variable name (with or without --)
 * @returns {string|null}
 */
export function getCSSVariable(element, variableName) {
	const name = variableName.startsWith('--') ? variableName : `--${variableName}`;
	return element.style.getPropertyValue(name);
}

/**
 * Create a mock ResizeObserver
 * @param {Function} callback - Callback function
 * @returns {Object}
 */
export function createMockResizeObserver(callback) {
	const observedElements = new Set();

	return {
		observe(element) {
			observedElements.add(element);
		},

		unobserve(element) {
			observedElements.delete(element);
		},

		disconnect() {
			observedElements.clear();
		},

		// Testing API: trigger resize
		trigger(element) {
			if (observedElements.has(element)) {
				callback([
					{
						target: element,
						contentRect: element.getBoundingClientRect()
					}
				]);
			}
		},

		triggerAll() {
			observedElements.forEach((element) => {
				this.trigger(element);
			});
		}
	};
}

/**
 * Setup a test environment with mocked DOM APIs
 * @param {Object} options - Configuration
 * @returns {Object} - Setup context with window, document, cleanup
 */
export function setupTestDOM(options = {}) {
	const { width = 1024, height = 768 } = options;

	// Already have a global document in test environment (happy-dom)
	const doc = typeof document !== 'undefined' ? document : global.document;
	const win = typeof window !== 'undefined' ? window : global.window;

	if (doc && doc.body) {
		doc.body.style.cssText = `width: ${width}px; height: ${height}px; margin: 0; padding: 0;`;
	}

	return {
		window: win,
		document: doc,
		body: doc?.body,
		cleanup() {
			// Clean up any test elements
			if (doc && doc.body) {
				doc.body.innerHTML = '';
			}
		}
	};
}

/**
 * Measure animation performance
 * @param {Function} fn - Function to measure
 * @returns {Object} - Performance metrics
 */
export function measurePerformance(fn) {
	const start = Date.now();
	const startMemory = process.memoryUsage().heapUsed;

	const result = fn();

	const end = Date.now();
	const endMemory = process.memoryUsage().heapUsed;

	return {
		duration: end - start,
		memory: endMemory - startMemory,
		result
	};
}

/**
 * Create spacer element for pagination
 * @param {number} height - Height in pixels
 * @param {Document} doc - Document reference
 * @returns {HTMLElement}
 */
export function createSpacer(height = 500, doc = global.document) {
	const spacer = doc.createElement('div');
	spacer.style.cssText = `height: ${height}px; background: #f0f0f0;`;
	spacer.textContent = `Spacer (${height}px)`;
	return spacer;
}

/**
 * Add element to DOM
 * @param {HTMLElement} element - Element to add
 * @param {HTMLElement} parent - Parent element (default: body)
 */
export function appendElement(element, parent = global.document?.body) {
	if (parent) {
		parent.appendChild(element);
	}
}

/**
 * Remove element from DOM
 * @param {HTMLElement} element - Element to remove
 */
export function removeElement(element) {
	if (element?.parentElement) {
		element.remove();
	}
}

/**
 * Clone element for comparison
 * @param {HTMLElement} element - Element to clone
 * @returns {Object} - Element state snapshot
 */
export function snapshotElement(element) {
	return {
		classList: Array.from(element.classList),
		attributes: {
			'data-animation': element.getAttribute('data-animation'),
			'data-sentinel-id': element.getAttribute('data-sentinel-id')
		},
		styles: {
			'--duration': element.style.getPropertyValue('--duration'),
			'--delay': element.style.getPropertyValue('--delay')
		},
		isVisible: element.classList.contains('is-visible')
	};
}

export default {
	createTestElement,
	createTestElements,
	getSentinel,
	hasAnimation,
	isAnimating,
	getAnimationType,
	getCSSVariable,
	createMockResizeObserver,
	setupTestDOM,
	measurePerformance,
	createSpacer,
	appendElement,
	removeElement,
	snapshotElement
};
