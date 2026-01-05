import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { runeScroller } from './runeScroller.js';

/**
 * Integration tests for runeScroller sentinel positioning
 * Tests verify that the sentinel is positioned correctly and animations trigger properly
 */
describe('runeScroller Integration Tests - Sentinel Positioning', () => {
	let window;
	let document;
	let element;
	let action;

	beforeEach(() => {
		// Create a fresh window with proper viewport dimensions
		window = new Window({
			width: 1024,
			height: 768,
			url: 'http://localhost:3000'
		});
		document = window.document;

		// Set up global objects
		global.window = window;
		global.document = document;
		global.HTMLElement = window.HTMLElement;
		global.HTMLDivElement = window.HTMLDivElement;
		global.ResizeObserver = window.ResizeObserver;
		global.IntersectionObserver = window.IntersectionObserver;

		// Mock getComputedStyle
		global.getComputedStyle = () => ({
			animation: 'fade-in 800ms ease-out',
			getPropertyValue: () => ''
		});

		// Create body with proper sizing
		document.body.style.cssText = 'width: 1024px; height: 2000px; margin: 0; padding: 0;';

		// Create test element in the middle of a long page
		element = document.createElement('div');
		element.style.cssText = `
			width: 100%;
			height: 200px;
			background: red;
			position: relative;
		`;
		element.textContent = 'Test Element';

		// Position element way down the page (below viewport)
		const spacer = document.createElement('div');
		spacer.style.cssText = 'height: 1000px; background: blue;';
		document.body.appendChild(spacer);
		document.body.appendChild(element);
	});

	afterEach(() => {
		if (action && action.destroy) {
			action.destroy();
		}
		if (element && element.parentElement) {
			element.remove();
		}
		delete global.window;
		delete global.document;
		delete global.getComputedStyle;
	});

	describe('Sentinel Positioning', () => {
		it('creates a wrapper with position:relative', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			const wrapper = element.parentElement;
			const styles = window.getComputedStyle(wrapper);

			expect(wrapper).toBeDefined();
			expect(wrapper.style.position).toBe('relative');
		});

		it('positions sentinel absolutely relative to wrapper', () => {
			// Mock getBoundingClientRect to return correct dimensions
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 100,
				top: 1000,  // Element is 1000px down the page
				left: 0,
				bottom: 1200,
				right: 100,
				x: 0,
				y: 1000,
				toJSON: () => {}
			});

			action = runeScroller(element, { animation: 'fade-in', debug: false });
			const wrapper = element.parentElement;

			// Find sentinel by looking for a child that is not the element
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			expect(sentinel).toBeDefined();
			expect(sentinel.style.position).toBe('absolute');
			// Sentinel should be positioned at element height + offset
			// With element height 200 and offset 0, sentinel should be at top: 200px
			expect(sentinel.style.top).toContain('200px');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});

		it('sentinel should be invisible when debug is false', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 100,
				top: 1000,
				left: 0,
				bottom: 1200,
				right: 100,
				x: 0,
				y: 1000,
				toJSON: () => {}
			});

			action = runeScroller(element, { animation: 'fade-in', debug: false });
			const wrapper = element.parentElement;
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			expect(sentinel.style.visibility).toBe('hidden');
			expect(sentinel.style.height).toBe('1px');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});

		it('sentinel should be visible when debug is true', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 100,
				top: 1000,
				left: 0,
				bottom: 1200,
				right: 100,
				x: 0,
				y: 1000,
				toJSON: () => {}
			});

			action = runeScroller(element, { animation: 'fade-in', debug: true });
			const wrapper = element.parentElement;
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			expect(sentinel.style.visibility).not.toBe('hidden');
			expect(sentinel.textContent).toContain('sentinel');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});

		it('respects offset option when positioning sentinel', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 100,
				top: 1000,
				left: 0,
				bottom: 1200,
				right: 100,
				x: 0,
				y: 1000,
				toJSON: () => {}
			});

			action = runeScroller(element, { animation: 'fade-in', offset: -100, debug: false });
			const wrapper = element.parentElement;
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			// With offset -100, sentinel should be at top: 100px (200 - 100)
			expect(sentinel.style.top).toContain('100px');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});
	});

	describe('Sentinel DOM Structure', () => {
		it('sentinel is child of wrapper, not sibling', () => {
			action = runeScroller(element, { animation: 'fade-in', debug: true });
			const wrapper = element.parentElement;
			const sentinel = wrapper.querySelector('[data-sentinel-id]');

			expect(sentinel.parentElement).toBe(wrapper);
		});

		it('element remains first child of wrapper', () => {
			action = runeScroller(element, { animation: 'fade-in' });
			const wrapper = element.parentElement;

			expect(wrapper.children[0]).toBe(element);
		});

		it('wrapper has correct structure for flexbox parent', () => {
			const flexContainer = document.createElement('div');
			flexContainer.style.cssText = 'display: flex; flex-direction: column;';

			const item = document.createElement('div');
			item.style.cssText = 'width: 100px; height: 100px;';

			flexContainer.appendChild(item);
			document.body.appendChild(flexContainer);

			action = runeScroller(item, { animation: 'fade-in' });
			const wrapper = item.parentElement;

			// Wrapper should have width: 100% and display: block
			expect(wrapper.style.display).toBe('block');
			expect(wrapper.style.width).toBe('100%');

			flexContainer.remove();
		});
	});

	describe('Sentinel ID Tracking', () => {
		it('applies auto-generated sentinel ID to both element and sentinel', () => {
			action = runeScroller(element, { animation: 'fade-in', debug: true });
			const wrapper = element.parentElement;

			// Find sentinel by looking for a child that is not the element
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			expect(element.getAttribute('data-sentinel-id')).toBeDefined();
			expect(sentinel).toBeDefined();
			expect(sentinel.getAttribute('data-sentinel-id')).toBeDefined();
			expect(element.getAttribute('data-sentinel-id')).toBe(sentinel.getAttribute('data-sentinel-id'));
		});

		it('applies custom sentinel ID when provided', () => {
			action = runeScroller(element, { animation: 'fade-in', sentinelId: 'custom-sentinel', debug: true });
			const wrapper = element.parentElement;

			// Find sentinel by looking for a child that is not the element
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			expect(element.getAttribute('data-sentinel-id')).toBe('custom-sentinel');
			expect(sentinel.getAttribute('data-sentinel-id')).toBe('custom-sentinel');
			expect(sentinel.textContent).toContain('custom-sentinel');
		});
	});

	describe('Cleanup and Unwrapping', () => {
		it('removes wrapper and restores element to original parent on destroy', () => {
			const originalParent = element.parentElement;
			action = runeScroller(element, { animation: 'fade-in' });
			const wrapper = element.parentElement;

			expect(wrapper.parentElement).toBe(originalParent);

			action.destroy();

			// After destroy, element should no longer have a wrapper parent
			const newParent = element.parentElement;
			expect(newParent).not.toBe(wrapper);
			expect(wrapper.parentElement).toBeNull();
		});

		it('sentinel is removed on destroy', () => {
			action = runeScroller(element, { animation: 'fade-in', debug: true });
			const wrapper = element.parentElement;
			const sentinelId = element.getAttribute('data-sentinel-id');

			// Find the sentinel before destroy
			const sentinelBeforeDestroy = Array.from(wrapper.children).find(child => child !== element);
			expect(sentinelBeforeDestroy).toBeDefined();

			action.destroy();

			// After destroy, element should be restored to original parent
			const newParent = element.parentElement;
			expect(newParent).not.toBe(wrapper);

			// Element should still have the ID (for tracking purposes)
			expect(element.getAttribute('data-sentinel-id')).toBe(sentinelId);

			// Wrapper should be completely removed
			expect(wrapper.parentElement).toBeNull();
		});
	});
});
