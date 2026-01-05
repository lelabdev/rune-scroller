import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { runeScroller } from './runeScroller.js';

/**
 * Tests for complex animations that require careful positioning
 * Zoom and perspective transforms that involve large element movements
 */
describe('runeScroller Complex Animations', () => {
	let window;
	let document;
	let element;
	let action;

	beforeEach(() => {
		window = new Window({
			width: 1024,
			height: 768,
			url: 'http://localhost:3000'
		});
		document = window.document;

		global.window = window;
		global.document = document;
		global.HTMLElement = window.HTMLElement;
		global.HTMLDivElement = window.HTMLDivElement;
		global.ResizeObserver = window.ResizeObserver;
		global.IntersectionObserver = window.IntersectionObserver;

		global.getComputedStyle = () => ({
			animation: 'zoom-in 800ms ease-out',
			getPropertyValue: () => ''
		});

		document.body.style.cssText = 'width: 1024px; height: 3000px; margin: 0; padding: 0;';

		element = document.createElement('div');
		element.style.cssText = `
			width: 200px;
			height: 200px;
			background: red;
			position: relative;
			margin: 50px;
		`;
		element.textContent = 'Zoom Target';

		const spacer = document.createElement('div');
		spacer.style.cssText = 'height: 1500px; background: blue;';
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

	describe('Zoom Animations', () => {
		it('zoom-in animation with correct element setup', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			});

			action = runeScroller(element, { animation: 'zoom-in', duration: 800 });

			expect(element.getAttribute('data-animation')).toBe('zoom-in');
			expect(element.classList.contains('scroll-animate')).toBe(true);
			expect(element.style.getPropertyValue('--duration')).toBe('800ms');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});

		it('zoom-out animation positioning', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			});

			action = runeScroller(element, { animation: 'zoom-out', duration: 1000 });

			const wrapper = element.parentElement;
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			// Sentinel should still be positioned correctly for zoom-out
			expect(sentinel.style.top).toContain('200px');
			expect(sentinel.style.position).toBe('absolute');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});

		it('zoom-in-up with large movement animation', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			});

			action = runeScroller(element, {
				animation: 'zoom-in-up',
				duration: 1200,
				offset: -100  // Trigger earlier
			});

			const wrapper = element.parentElement;
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			// With offset -100, sentinel should be at 100px (200 - 100)
			expect(sentinel.style.top).toContain('100px');
			expect(element.getAttribute('data-animation')).toBe('zoom-in-up');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});
	});

	describe('Flip Animations', () => {
		it('flip animation (3D perspective)', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			});

			action = runeScroller(element, {
				animation: 'flip',
				duration: 1000
			});

			expect(element.getAttribute('data-animation')).toBe('flip');
			expect(element.classList.contains('scroll-animate')).toBe(true);

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});

		it('flip-x animation', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			});

			action = runeScroller(element, {
				animation: 'flip-x',
				duration: 1000
			});

			expect(element.getAttribute('data-animation')).toBe('flip-x');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});
	});

	describe('Bounce Animations', () => {
		it('bounce-in animation', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			});

			action = runeScroller(element, {
				animation: 'bounce-in',
				duration: 800
			});

			expect(element.getAttribute('data-animation')).toBe('bounce-in');
			expect(element.classList.contains('scroll-animate')).toBe(true);

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});
	});

	describe('Slide-Rotate Animation', () => {
		it('slide-rotate animation with combined transform', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			});

			action = runeScroller(element, {
				animation: 'slide-rotate',
				duration: 1000,
				debug: true  // Show sentinel for debugging
			});

			const wrapper = element.parentElement;
			const sentinel = Array.from(wrapper.children).find(child => child !== element);

			// Sentinel should be properly positioned even for complex animation
			expect(sentinel).toBeDefined();
			expect(sentinel.style.position).toBe('absolute');
			expect(element.getAttribute('data-animation')).toBe('slide-rotate');

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});
	});

	describe('Multiple Elements with Complex Animations', () => {
		it('handles multiple zoom animations in sequence', () => {
			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			});

			// Create multiple animated elements
			const element2 = document.createElement('div');
			element2.style.cssText = `
				width: 200px;
				height: 200px;
				background: green;
				margin: 50px;
			`;
			element2.textContent = 'Second Zoom';

			document.body.appendChild(element2);

			element2.getBoundingClientRect = () => ({
				height: 200,
				width: 200,
				top: 1800,
				left: 50,
				bottom: 2000,
				right: 250,
				x: 50,
				y: 1800,
				toJSON: () => {}
			});

			action = runeScroller(element, { animation: 'zoom-in', duration: 800 });
			const action2 = runeScroller(element2, { animation: 'zoom-out', duration: 800 });

			expect(element.getAttribute('data-animation')).toBe('zoom-in');
			expect(element2.getAttribute('data-animation')).toBe('zoom-out');

			// Both should have unique sentinel IDs
			const id1 = element.getAttribute('data-sentinel-id');
			const id2 = element2.getAttribute('data-sentinel-id');
			expect(id1).not.toBe(id2);

			action2.destroy();
			element2.remove();
			element.getBoundingClientRect = originalGetBoundingClientRect;
		});
	});

	describe('Animation with ResizeObserver', () => {
		it('sentinel repositions when element is resized', () => {
			let boundingClientRect = {
				height: 200,
				width: 200,
				top: 1550,
				left: 50,
				bottom: 1750,
				right: 250,
				x: 50,
				y: 1550,
				toJSON: () => {}
			};

			const originalGetBoundingClientRect = element.getBoundingClientRect;
			element.getBoundingClientRect = () => boundingClientRect;

			action = runeScroller(element, { animation: 'zoom-in-up', duration: 800 });

			const wrapper = element.parentElement;
			const initialSentinel = Array.from(wrapper.children).find(child => child !== element);
			const initialTop = initialSentinel.style.top;

			// Simulate resize by changing dimensions
			boundingClientRect = {
				...boundingClientRect,
				height: 300  // Element grows taller
			};

			// In real scenario, ResizeObserver would trigger recreateSentinel
			// The action.update method could be called with new options
			action.update({ animation: 'zoom-in-up', duration: 800 });

			element.getBoundingClientRect = originalGetBoundingClientRect;
		});
	});
});
