import { describe, it, expect } from 'vitest';
import { calculateRootMargin, type AnimationType } from './animations';

describe('calculateRootMargin', () => {
	it('calculates rootMargin from offset (0-100%)', () => {
		expect(calculateRootMargin(0)).toBe('-100% 0px -0% 0px');
		expect(calculateRootMargin(50)).toBe('-50% 0px -50% 0px');
		expect(calculateRootMargin(100)).toBe('-0% 0px -100% 0px');
	});

	it('uses custom rootMargin when provided', () => {
		const custom = '-10% 0px -10% 0px';
		expect(calculateRootMargin(50, custom)).toBe(custom);
	});

	it('uses default rootMargin when nothing provided', () => {
		expect(calculateRootMargin()).toBe('-10% 0px -10% 0px');
	});

	it('prioritizes custom rootMargin over offset', () => {
		const custom = '-20% 0px';
		expect(calculateRootMargin(50, custom)).toBe(custom);
		expect(calculateRootMargin(0, custom)).toBe(custom);
	});
});

describe('AnimationType', () => {
	it('includes all expected animation types', () => {
		const validAnimations: AnimationType[] = [
			'fade-in',
			'fade-in-up',
			'fade-in-down',
			'fade-in-left',
			'fade-in-right',
			'zoom-in',
			'zoom-out',
			'zoom-in-up',
			'zoom-in-left',
			'zoom-in-right',
			'flip',
			'flip-x',
			'slide-rotate',
			'bounce-in'
		];

		// If this compiles, all types are valid
		expect(validAnimations.length).toBe(14);
	});
});
