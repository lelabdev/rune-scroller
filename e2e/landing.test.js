import { test, expect } from '@playwright/test';

/**
 * Integration tests against the live rune-scroller-site dev server.
 * Run `bun dev --host 0.0.0.0` in ~/dev/rune-scroller-site before these tests.
 */

const LANDING = process.env.LANDING_URL || 'http://localhost:5173';

test.describe('Landing page integration', () => {
	test.beforeEach(async ({ page }) => {
		page.on('console', (msg) => {
			if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
		});
		await page.goto(LANDING);
		await page.waitForTimeout(1500);
	});

	test('hydrates 40 animated elements', async ({ page }) => {
		const count = await page.$$eval('[data-animation]', (els) => els.length);
		expect(count).toBeGreaterThanOrEqual(30);
	});

	test('hero elements are visible without scrolling', async ({ page }) => {
		const visible = await page.$$eval(
			'[data-animation].is-visible',
			(els) => els.length
		);
		expect(visible).toBeGreaterThan(0);
	});

	test('below-fold elements start hidden', async ({ page }) => {
		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(300);

		const hidden = await page.$$eval(
			'[data-animation]:not(.is-visible)',
			(els) => els.length
		);
		expect(hidden).toBeGreaterThan(0);
	});

	test('scrolling triggers hidden animations', async ({ page }) => {
		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(300);

		const beforeCount = await page.$$eval(
			'[data-animation].is-visible',
			(els) => els.length
		);

		await page.evaluate(async () => {
			const delay = (ms) => new Promise((r) => setTimeout(r, ms));
			for (let i = 0; i < 10; i++) {
				window.scrollTo(0, (document.body.scrollHeight / 10) * i);
				await delay(200);
			}
			window.scrollTo(0, document.body.scrollHeight);
		});
		await page.waitForTimeout(500);

		const afterCount = await page.$$eval(
			'[data-animation].is-visible',
			(els) => els.length
		);

		expect(afterCount).toBeGreaterThan(beforeCount);
	});

	test('all animations become visible after full scroll', async ({ page }) => {
		await page.evaluate(async () => {
			const delay = (ms) => new Promise((r) => setTimeout(r, ms));
			for (let i = 0; i < 15; i++) {
				window.scrollTo(0, (document.body.scrollHeight / 15) * i);
				await delay(200);
			}
			window.scrollTo(0, document.body.scrollHeight);
		});
		await page.waitForTimeout(800);

		const total = await page.$$eval('[data-animation]', (els) => els.length);
		const visible = await page.$$eval(
			'[data-animation].is-visible',
			(els) => els.length
		);

		expect(visible).toBeGreaterThanOrEqual(Math.floor(total * 0.8));
	});

	test('animation types used on landing are valid', async ({ page }) => {
		const pageAnimations = await page.$$eval('[data-animation]', (els) =>
			[...new Set(els.map((el) => el.getAttribute('data-animation')))]
		);

		const mod = await page.evaluate(async () => {
			const m = await import('http://localhost:3210/dist/index.js');
			return m.ANIMATION_TYPES;
		});

		for (const anim of pageAnimations) {
			expect(mod).toContain(anim);
		}
	});

	test('scroll-animate class is on all animated elements', async ({ page }) => {
		const withoutClass = await page.$$eval(
			'[data-animation]:not(.scroll-animate)',
			(els) => els.length
		);
		expect(withoutClass).toBe(0);
	});

	test('no console errors from rune-scroller', async ({ page }) => {
		const errors = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') errors.push(msg.text());
		});

		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(500);

		const rsErrors = errors.filter((e) =>
			e.includes('rune-scroller')
		);
		expect(rsErrors).toHaveLength(0);
	});
});
