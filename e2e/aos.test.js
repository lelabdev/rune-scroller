import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3210';

/**
 * Navigate to AOS test page, replace #content, then load AOS module + run script
 */
async function setupAOSPage(page, { html, initScript = 'init();' } = {}) {
	await page.goto(`${BASE}/aos.html`);

	// Replace content if custom HTML provided
	if (html) {
		await page.evaluate((h) => {
			const content = document.getElementById('content');
			content.innerHTML = h;
		}, html);
	}

	// Load AOS module and run init
	await page.evaluate(`(async () => {
		const AOS = await import('${BASE}/dist/aos.js');
		window.AOS = AOS.default;
		window.init = AOS.init;
		window.refresh = AOS.refresh;
		window.refreshHard = AOS.refreshHard;
		window.disable = AOS.disable;
		window.destroy = AOS.destroy;
		${initScript}
	})()`);

	await page.waitForTimeout(150);
}

async function scrollToTarget(page) {
	await page.evaluate(() => window.scrollTo(0, window.innerHeight));
	await page.waitForTimeout(300);
}

// ============================================================
// AOS init()
// ============================================================

test.describe('AOS init()', () => {
	test('processes data-aos elements', async ({ page }) => {
		await setupAOSPage(page);
		const attr = await page.$eval('[data-aos]', (el) => el.getAttribute('data-animation'));
		expect(attr).toBe('fade-up');
	});

	test('adds aos-init class', async ({ page }) => {
		await setupAOSPage(page);
		const hasClass = await page.$eval('[data-aos]', (el) => el.classList.contains('aos-init'));
		expect(hasClass).toBe(true);
	});

	test('triggers animation on scroll', async ({ page }) => {
		await setupAOSPage(page);
		await scrollToTarget(page);
		const hasClass = await page.$eval('[data-aos]', (el) => el.classList.contains('is-visible'));
		expect(hasClass).toBe(true);
	});
});

// ============================================================
// AOS data attributes
// ============================================================

test.describe('AOS data attributes', () => {
	test('data-aos-duration sets --duration', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade" data-aos-duration="800">Item</div>',
		});
		const duration = await page.$eval('[data-aos]', (el) => el.style.getPropertyValue('--duration'));
		expect(duration).toBe('800ms');
	});

	test('data-aos-delay sets --delay', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade" data-aos-delay="300">Item</div>',
		});
		const delay = await page.$eval('[data-aos]', (el) => el.style.getPropertyValue('--delay'));
		expect(delay).toBe('300ms');
	});

	test('data-aos-easing sets --easing', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade" data-aos-easing="linear">Item</div>',
		});
		const easing = await page.$eval('[data-aos]', (el) => el.style.getPropertyValue('--easing'));
		expect(easing).toBe('linear');
	});

	test('data-aos-offset=0 is respected (not treated as falsy)', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade" data-aos-offset="0">Item</div>',
		});
		// Element should have scroll-animate class (runeScroller was applied)
		const hasClass = await page.$eval('[data-aos]', (el) => el.classList.contains('scroll-animate'));
		expect(hasClass).toBe(true);
	});

	test('data-aos-once prevents re-animation', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade-up" data-aos-once="true">Item</div>',
		});

		await scrollToTarget(page);
		let hasClass = await page.$eval('[data-aos]', (el) => el.classList.contains('is-visible'));
		expect(hasClass).toBe(true);

		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(200);
		hasClass = await page.$eval('[data-aos]', (el) => el.classList.contains('is-visible'));
		expect(hasClass).toBe(true);
	});

	test('data-aos-mirror reverses animation on exit', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade-up" data-aos-mirror="true">Item</div>',
		});

		await scrollToTarget(page);
		let hasClass = await page.$eval('[data-aos]', (el) => el.classList.contains('is-visible'));
		expect(hasClass).toBe(true);

		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(200);
		hasClass = await page.$eval('[data-aos]', (el) => el.classList.contains('is-visible'));
		expect(hasClass).toBe(false);
	});
});

// ============================================================
// Multiple elements
// ============================================================

test.describe('multiple elements', () => {
	test('animates all data-aos elements', async ({ page }) => {
		await setupAOSPage(page, {
			html: `
				<div class="item" data-aos="fade-up">Item 1</div>
				<div class="item" data-aos="zoom-in">Item 2</div>
				<div class="item" data-aos="slide-left">Item 3</div>
			`,
		});

		await scrollToTarget(page);
		await page.waitForTimeout(300);

		const classes = await page.$$eval('[data-aos]', (els) =>
			els.map((el) => ({
				anim: el.getAttribute('data-animation'),
				visible: el.classList.contains('is-visible'),
			}))
		);

		expect(classes).toHaveLength(3);
		for (const c of classes) {
			expect(c.visible).toBe(true);
		}
		expect(classes[0].anim).toBe('fade-up');
		expect(classes[1].anim).toBe('zoom-in');
		expect(classes[2].anim).toBe('slide-left');
	});
});

// ============================================================
// AOS global options
// ============================================================

test.describe('AOS global options', () => {
	test('init({ duration: 600 }) applies to all elements', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade">Item</div>',
			initScript: 'init({ duration: 600 });',
		});
		const duration = await page.$eval('[data-aos]', (el) => el.style.getPropertyValue('--duration'));
		expect(duration).toBe('600ms');
	});

	test('init({ offset: 200 }) triggers earlier than default', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade">Item</div>',
			initScript: 'init({ offset: 200 });',
		});
		// With offset:200, rootMargin is "200px 0px 0px 0px" — viewport top extends 200px up
		// Scroll partially — less than full viewport height
		await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.8));
		await page.waitForTimeout(300);
		const hasClass = await page.$eval('[data-aos]', (el) => el.classList.contains('is-visible'));
		expect(hasClass).toBe(true);
	});
});

// ============================================================
// disable / destroy
// ============================================================

test.describe('disable and destroy', () => {
	test('disable removes data-aos attributes', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade-up">Item</div>',
		});

		await page.evaluate(() => window.disable());
		const attr = await page.$eval('.item', (el) => el.getAttribute('data-aos'));
		expect(attr).toBeNull();
	});

	test('destroy cleans up observers', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade-up">Item</div>',
		});

		await page.evaluate(() => window.destroy());
		const bodyEasing = await page.$eval('body', (el) => el.getAttribute('data-aos-easing'));
		expect(bodyEasing).toBeNull();
	});
});

// ============================================================
// refreshHard
// ============================================================

test.describe('refreshHard', () => {
	test('re-processes elements after DOM changes', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade-up">Item 1</div>',
		});

		await page.evaluate(() => {
			const div = document.createElement('div');
			div.className = 'item';
			div.setAttribute('data-aos', 'zoom-in');
			div.textContent = 'Dynamic Item';
			document.getElementById('content').appendChild(div);
			window.refreshHard();
		});

		await page.waitForTimeout(100);

		const allAnimated = await page.$$eval('[data-animation]', (els) => els.length);
		expect(allAnimated).toBe(2);
	});
});

// ============================================================
// Legacy animation names
// ============================================================

test.describe('legacy animation names', () => {
	test('fade-in maps to correct animation', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade-in">Item</div>',
		});
		const attr = await page.$eval('[data-aos]', (el) => el.getAttribute('data-animation'));
		expect(attr).toBe('fade');
	});

	test('fade-in-up maps to fade-up', async ({ page }) => {
		await setupAOSPage(page, {
			html: '<div class="item" data-aos="fade-in-up">Item</div>',
		});
		const attr = await page.$eval('[data-aos]', (el) => el.getAttribute('data-animation'));
		expect(attr).toBe('fade-up');
	});
});
