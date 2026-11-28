import { expect, test } from '@playwright/test';
import { getPagePaths, openNavIfCollapsed, pathDepth, tabKey, urlFor } from './helpers';

test.describe('main navigation', () => {
	test('every nav link is reachable from every page', async ({ page, request }) => {
		const paths = await getPagePaths(request);
		await page.goto('/');
		const hrefs = await page
			.locator('#main-nav a')
			.evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
		expect(hrefs.length).toBeGreaterThan(0);
		// one page load per (page × link), plus the home link: budget grows with the site
		test.setTimeout(15_000 + paths.length * (hrefs.length + 1) * 4_000);

		for (const from of paths) {
			for (const href of hrefs) {
				await test.step(`${from} → ${href}`, async () => {
					await page.goto(from);
					await openNavIfCollapsed(page);
					await page.locator(`#main-nav a[href="${href}"]`).click();
					await expect(page).toHaveURL(urlFor(href));
					await expect(page.locator(`#main-nav a[href="${href}"]`)).toHaveAttribute(
						'aria-current',
						'page'
					);
				});
			}

			await test.step(`${from} → home via site name`, async () => {
				await page.goto(from);
				await page
					.getByRole('banner')
					.getByRole('link', { name: /^Julie Mužina/ })
					.click();
				await expect(page).toHaveURL(urlFor('/'));
			});
		}
	});

	test('footer links to the privacy page', async ({ page }) => {
		await page.goto('/');
		// phones get an icon link, wider screens a text link; exactly one is shown
		await page.locator('footer a[href="/privacy"]:visible').click();
		await expect(page).toHaveURL(urlFor('/privacy'));
	});

	test('skip link moves focus to the main content', async ({ page, browserName }) => {
		await page.goto('/');
		await page.keyboard.press(tabKey(browserName));
		await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
		await page.keyboard.press('Enter');
		await expect(page.locator('#main-content')).toBeFocused();
	});
});

test.describe('mobile menu', () => {
	test.beforeEach(async ({ page, isMobile }) => {
		test.skip(!isMobile, 'the menu only collapses on small screens');
		await page.goto('/');
	});

	test('starts collapsed and toggles open and closed', async ({ page }) => {
		const toggle = page.getByRole('button', { name: 'Menu' });
		const firstLink = page.locator('#main-nav a').first();

		await expect(toggle).toBeVisible();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(toggle).toHaveCSS('cursor', 'pointer');
		await expect(firstLink).toBeHidden();

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(firstLink).toBeVisible();

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(firstLink).toBeHidden();
	});

	test('Escape closes the menu and returns focus to the toggle', async ({ page }) => {
		const toggle = page.getByRole('button', { name: 'Menu' });
		await toggle.click();
		await page.locator('#main-nav a').first().focus();
		await page.keyboard.press('Escape');

		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(toggle).toBeFocused();
		await expect(page.locator('#main-nav a').first()).toBeHidden();
	});

	test('Escape with focus outside the menu leaves it alone', async ({ page }) => {
		const toggle = page.getByRole('button', { name: 'Menu' });
		await toggle.click();
		const main = page.locator('#main-content');
		await main.focus();
		await page.keyboard.press('Escape');

		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(main).toBeFocused();
	});
});

test('wide screens show nav links inline without a toggle', async ({ page, isMobile }) => {
	test.skip(isMobile, 'desktop only');
	await page.goto('/');
	await expect(page.locator('#nav-toggle')).toBeHidden();
	await expect(page.locator('#main-nav a').first()).toBeVisible();

	// right after the site name, not pushed to the header's far end
	const nav = (await page.locator('#main-nav').boundingBox())!;
	const name = (await page.getByRole('link', { name: 'Julie Mužina' }).boundingBox())!;
	const gap = nav.x - (name.x + name.width);
	expect(gap).toBeGreaterThanOrEqual(0);
	expect(gap).toBeLessThanOrEqual(32);
});

test(
	'without JavaScript the nav links are shown and the toggle is hidden',
	{ tag: '@no-js' },
	async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('#nav-toggle')).toBeHidden();
		// the attribute, not just CSS, so tools that ignore styles skip its "Menu" label too
		await expect(page.locator('#nav-toggle')).toHaveAttribute('hidden');
		for (const link of await page.locator('#main-nav a').all()) await expect(link).toBeVisible();
	}
);

test('breadcrumbs appear only on nested pages', async ({ page, request }) => {
	for (const path of await getPagePaths(request)) {
		await test.step(path, async () => {
			await page.goto(path);
			const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
			if (pathDepth(path) < 2) {
				await expect(breadcrumb).toHaveCount(0);
				return;
			}
			await expect(breadcrumb).toBeVisible();
			await expect(breadcrumb.getByRole('link').first()).toHaveAttribute('href', '/');
			await expect(breadcrumb.getByRole('link').last()).toHaveAttribute('aria-current', 'page');
			await expect(breadcrumb.getByRole('link').last()).toHaveAttribute('href', path);
		});
	}
});
