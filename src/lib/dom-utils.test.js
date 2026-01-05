import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { setCSSVariables, setupAnimationElement, createSentinel } from './dom-utils.js';

// Setup happy-dom environment
const window = new Window();
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.HTMLDivElement = window.HTMLDivElement;
global.ResizeObserver = window.ResizeObserver;

describe('DOM Utilities', () => {
	let testElement;

	beforeEach(() => {
		// Create a test element in the happy-dom DOM
		testElement = window.document.createElement('div');
		testElement.style.cssText = 'width: 100px; height: 100px;';
		window.document.body.appendChild(testElement);

		// Mock offsetHeight (element intrinsic height, not affected by CSS transforms)
		Object.defineProperty(testElement, 'offsetHeight', {
			configurable: true,
			value: 100
		});

		// Mock getBoundingClientRect for all tests (returns 100px height by default)
		testElement.getBoundingClientRect = () => ({
			height: 100,
			width: 0,
			top: 0,
			left: 0,
			bottom: 100,
			right: 0,
			x: 0,
			y: 0,
			toJSON: () => {}
		});
	});

	afterEach(() => {
		// Clean up
		if (testElement && testElement.parentElement) {
			testElement.remove();
		}
	});

	describe('setCSSVariables', () => {
		it('sets --duration CSS variable', () => {
			setCSSVariables(testElement, 1000);
			expect(testElement.style.getPropertyValue('--duration')).toBe('1000ms');
		});

		it('sets --delay CSS variable with default 0', () => {
			setCSSVariables(testElement);
			expect(testElement.style.getPropertyValue('--delay')).toBe('0ms');
		});

		it('sets both --duration and --delay', () => {
			setCSSVariables(testElement, 500, 100);
			expect(testElement.style.getPropertyValue('--duration')).toBe('500ms');
			expect(testElement.style.getPropertyValue('--delay')).toBe('100ms');
		});

		it('sets --delay without --duration', () => {
			setCSSVariables(testElement, undefined, 50);
			expect(testElement.style.getPropertyValue('--delay')).toBe('50ms');
			// --duration should not be set if undefined
			expect(testElement.style.getPropertyValue('--duration')).toBe('');
		});

		it('handles zero values', () => {
			setCSSVariables(testElement, 0, 0);
			expect(testElement.style.getPropertyValue('--duration')).toBe('0ms');
			expect(testElement.style.getPropertyValue('--delay')).toBe('0ms');
		});
	});

	describe('setupAnimationElement', () => {
		it('adds scroll-animate class', () => {
			setupAnimationElement(testElement, 'fade-in');
			expect(testElement.classList.contains('scroll-animate')).toBe(true);
		});

		it('sets data-animation attribute', () => {
			setupAnimationElement(testElement, 'fade-in-up');
			expect(testElement.getAttribute('data-animation')).toBe('fade-in-up');
		});

		it('sets correct animation type', () => {
			setupAnimationElement(testElement, 'zoom-in');
			expect(testElement.getAttribute('data-animation')).toBe('zoom-in');
		});

		it('handles different animation types', () => {
			const animations = ['fade-in', 'zoom-out', 'flip', 'bounce-in'];
			animations.forEach((anim) => {
				const el = window.document.createElement('div');
				window.document.body.appendChild(el);
				setupAnimationElement(el, anim);
				expect(el.getAttribute('data-animation')).toBe(anim);
				el.remove();
			});
		});

		it('adds class even if already has other classes', () => {
			testElement.classList.add('existing-class');
			setupAnimationElement(testElement, 'fade-in');
			expect(testElement.classList.contains('existing-class')).toBe(true);
			expect(testElement.classList.contains('scroll-animate')).toBe(true);
		});
	});

	describe('createSentinel', () => {
		it('creates a div element', () => {
			const { element: sentinel } = createSentinel(testElement);
			expect(sentinel).toBeInstanceOf(HTMLDivElement);
			expect(sentinel.tagName).toBe('DIV');
		});

		it('sets position:absolute', () => {
			const { element: sentinel } = createSentinel(testElement);
			expect(sentinel.style.position).toBe('absolute');
		});

		it('creates hidden sentinel by default', () => {
			const { element: sentinel } = createSentinel(testElement);
			expect(sentinel.style.visibility).toBe('hidden');
			expect(sentinel.getAttribute('data-sentinel-debug')).toBeNull();
		});

		it('creates visible sentinel when debug=true', () => {
			const { element: sentinel } = createSentinel(testElement, true);
			expect(sentinel.style.visibility).not.toBe('hidden');
			expect(sentinel.getAttribute('data-sentinel-debug')).toBe('true');
		});

		it('uses custom sentinelColor in debug mode', () => {
			const { element: sentinel } = createSentinel(testElement, true, 0, '#ff0000');
			// happy-dom preserves hex format, not converting to rgb
			expect(sentinel.style.backgroundColor).toBe('#ff0000');
		});

		it('uses default sentinelColor #00e0ff', () => {
			const { element: sentinel } = createSentinel(testElement, true);
			// happy-dom preserves hex format, not converting to rgb
			expect(sentinel.style.backgroundColor).toBe('#00e0ff');
		});

		it('sets debugLabel as text content in debug mode', () => {
			const { element: sentinel } = createSentinel(testElement, true, 0, '#00e0ff', 'fade-in');
			expect(sentinel.textContent).toBe('fade-in');
		});

		it('shows sentinelId as text if no debugLabel provided', () => {
			const { element: sentinel } = createSentinel(testElement, true, 0, '#00e0ff', '', 'test-id');
			expect(sentinel.textContent).toBe('test-id');
		});

		it('generates auto-ID when not provided', () => {
			const { element: sentinel1 } = createSentinel(testElement);
			const { element: sentinel2 } = createSentinel(testElement);
			expect(sentinel1.getAttribute('data-sentinel-id')).toMatch(/^sentinel-\d+$/);
			expect(sentinel2.getAttribute('data-sentinel-id')).toMatch(/^sentinel-\d+$/);
			// IDs should be different
			expect(sentinel1.getAttribute('data-sentinel-id')).not.toBe(sentinel2.getAttribute('data-sentinel-id'));
		});

		it('uses custom sentinelId when provided', () => {
			const { element: sentinel } = createSentinel(testElement, false, 0, '#00e0ff', '', 'custom-id');
			expect(sentinel.getAttribute('data-sentinel-id')).toBe('custom-id');
		});

		it('always sets data-sentinel-id attribute', () => {
			const { element: sentinel1 } = createSentinel(testElement);
			const { element: sentinel2 } = createSentinel(testElement, false, 0, '#00e0ff', '', 'my-id');
			expect(sentinel1.hasAttribute('data-sentinel-id')).toBe(true);
			expect(sentinel2.hasAttribute('data-sentinel-id')).toBe(true);
		});

		it('respects offset parameter', () => {
			const { element: sentinel } = createSentinel(testElement, false, 50);
			expect(sentinel.style.top).toBe('150px');
		});

		it('handles negative offset (trigger earlier)', () => {
			const { element: sentinel } = createSentinel(testElement, false, -25);
			expect(sentinel.style.top).toBe('75px');
		});

		it('sets correct positioning for debug sentinel', () => {
			const { element: sentinel } = createSentinel(testElement, true, 0, '#00e0ff');
			expect(sentinel.style.position).toBe('absolute');
			expect(sentinel.style.left).toBe('0px');
			expect(sentinel.style.right).toBe('0px');
			expect(sentinel.style.height).toBe('3px');
		});

		it('sets correct positioning for hidden sentinel', () => {
			const { element: sentinel } = createSentinel(testElement, false, 0);
			expect(sentinel.style.position).toBe('absolute');
			expect(sentinel.style.height).toBe('1px');
		});

		it('sets pointer-events:none to prevent interaction', () => {
			const { element: sentinel } = createSentinel(testElement, true);
			expect(sentinel.style.pointerEvents).toBe('none');
		});

		it('multiple sentinels have incrementing IDs', () => {
			const ids = [];
			for (let i = 0; i < 3; i++) {
				const { id } = createSentinel(testElement);
				ids.push(id);
			}
			expect(ids[0]).not.toBe(ids[1]);
			expect(ids[1]).not.toBe(ids[2]);
		});
	});
});
