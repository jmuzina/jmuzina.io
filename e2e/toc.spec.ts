import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { AXE_TAGS, getPostPath, tabKey } from './helpers';

const tocNav = (page: Page) => page.getByRole('navigation', { name: 'On this page' });
const mobileSummary = (page: Page) => page.locator('.toc-mobile summary');

async function stickyBottom(page: Page) {
	const summary = mobileSummary(page);
	if (!(await summary.isVisible())) return 0;
	const box = (await summary.boundingBox())!;
	return box.y + box.height;
}

let postPath: string | undefined;
test.beforeEach(async ({ request }) => {
	postPath ??= await getPostPath(request);
	test.skip(!postPath, 'no posts yet');
});

test.describe('section links', () => {
	let id: string;
	const target = (page: Page) => page.locator(`[id="${id}"]`);

	test.beforeEach(async ({ page }) => {
		await page.goto(postPath!);
		// mid-page on purpose: the last section can't scroll up to the top of the viewport
		id = (await page.locator('article :is(h2, h3)[id]').nth(1).getAttribute('id'))!;
	});

	async function expectAtSection(page: Page) {
		await expect(target(page)).toBeInViewport();
		expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
		const { y } = (await target(page).boundingBox())!;
		expect(y).toBeGreaterThanOrEqual(await stickyBottom(page));
		expect(y).toBeLessThan(page.viewportSize()!.height / 2);
	}

	test('opening one lands on that section, clear of the sticky bar', async ({ page }) => {
		// about:blank first, so this is a fresh document load rather than an in-page jump
		await page.goto('about:blank');
		await page.goto(`${postPath}#${id}`);
		await expectAtSection(page);
	});

	test('reopening one after scrolling away jumps back to the section', async ({ page }) => {
		await page.goto(`${postPath}#${id}`);
		await page.evaluate(() => window.scrollTo(0, 0));
		await page.reload();
		await expectAtSection(page);
	});

	test('going Back to one returns to where the reader was, not the section', async ({ page }) => {
		await page.goto('about:blank');
		await page.goto(`${postPath}#${id}`);
		await expectAtSection(page);
		const y = await page.evaluate(() => {
			window.scrollTo(0, document.documentElement.scrollHeight);
			// keeps the page out of the back/forward cache, so Back loads it again
			addEventListener('unload', () => {});
			return window.scrollY;
		});
		await page.goto('/');
		await page.goBack();
		const navigationType = () =>
			page.evaluate(
				() => (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type
			);
		expect(await navigationType()).toBe('back_forward');
		await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(Math.round(y));
	});
});

test('a #fragment that does not exist leaves the page at the top', async ({ page }) => {
	await page.goto(`${postPath}#no-such-section`);
	expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('a malformed #fragment breaks no script', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	// a stray % is not a valid escape, so decoding it throws
	await page.goto(`${postPath}#100%`);
	await page.goto(`${postPath}#caf%C3`);
	expect(errors).toEqual([]);
});

test.describe('wide screens', () => {
	test.beforeEach(({ isMobile }) => test.skip(isMobile, 'sidebar is for wide screens'));

	test('list every section and mark the one being read', async ({ page }) => {
		await page.goto(postPath!);
		await expect(mobileSummary(page)).toBeHidden();

		const nav = tocNav(page);
		await expect(nav).toBeVisible();
		const sections = await page.locator('article :is(h2, h3)[id]').count();
		await expect(nav.getByRole('link')).toHaveCount(sections);

		const last = nav.getByRole('link').last();
		await last.click();
		await expect(last).toHaveAttribute('aria-current', 'true');
		await expect(nav.locator('[aria-current="true"]')).toHaveCount(1);
	});

	// Sections near the end can't scroll to the top, so they're the ones that used to lose out.
	test('clicking any entry marks that entry, even near the end of the post', async ({ page }) => {
		await page.goto(postPath!);
		const nav = tocNav(page);
		for (const link of await nav.getByRole('link').all()) {
			await link.click();
			await expect(link).toHaveAttribute('aria-current', 'true');
			await expect(nav.locator('[aria-current="true"]')).toHaveCount(1);
		}
	});

	test("a heading's own link marks that section", async ({ page }) => {
		await page.goto(postPath!);
		const hash = (await tocNav(page).getByRole('link').nth(-2).getAttribute('href'))!;
		await page.locator(`article ${hash} a`).click();
		await expect(tocNav(page).locator(`a[href="${hash}"]`)).toHaveAttribute('aria-current', 'true');
	});

	test('a shared link to a section near the end marks that section', async ({ page }) => {
		await page.goto(postPath!);
		const hash = (await tocNav(page).getByRole('link').nth(-2).getAttribute('href'))!;
		await page.goto('about:blank');
		await page.goto(`${postPath}${hash}`);
		await expect(tocNav(page).locator(`a[href="${hash}"]`)).toHaveAttribute('aria-current', 'true');
	});

	test('the sidebar and copy notice are pinned only in a tall enough window', async ({ page }) => {
		const positions = () =>
			page
				.locator('article aside, #heading-link-status')
				.evaluateAll((els) => els.map((el) => getComputedStyle(el).position));
		await page.goto(postPath!);
		// empty, the notice is sr-only (absolute), so give it the text it shows after a copy
		const showNotice = () =>
			page.locator('#heading-link-status').evaluate((el) => (el.textContent = 'Copied'));
		await showNotice();
		expect(await positions()).toEqual(['sticky', 'fixed']);

		// a wide window at high zoom, or a landscape phone
		await page.setViewportSize({ width: 1280, height: 400 });
		await showNotice();
		expect(await positions()).toEqual(['static', 'static']);
	});

	test('scrolling yourself after a jump goes back to tracking the scroll position', async ({
		page
	}) => {
		await page.goto(postPath!);
		const link = tocNav(page).getByRole('link').nth(-2);
		await link.click();
		await expect(link).toHaveAttribute('aria-current', 'true');

		await page.evaluate(() => window.scrollTo(0, 0));
		await expect(link).not.toHaveAttribute('aria-current', 'true');
	});
});

test.describe('small screens', () => {
	test.beforeEach(({ isMobile }) => test.skip(!isMobile, 'disclosure is for small screens'));

	test('starts collapsed, opens, jumps to a section and closes', async ({ page }) => {
		await page.goto(postPath!);
		const nav = tocNav(page);
		const summary = mobileSummary(page);
		const firstLink = nav.getByRole('link').first();

		await expect(summary).toHaveCSS('cursor', 'pointer');
		await expect(firstLink).toBeHidden();
		await summary.click();
		await expect(firstLink).toBeVisible();

		const link = nav.getByRole('link').last();
		const text = (await link.textContent())!.trim();
		const hash = (await link.getAttribute('href'))!;
		await link.click();

		await expect(page).toHaveURL(new RegExp(`${hash}$`));
		await expect(firstLink).toBeHidden();
		const heading = page.locator(`article ${hash}`);
		await expect(heading).toBeInViewport();
		expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(await stickyBottom(page));
		await expect(page.locator('.toc-current')).toHaveText(text);
	});

	test('Escape closes it and returns focus to the toggle', async ({ page }) => {
		await page.goto(postPath!);
		const summary = mobileSummary(page);
		await summary.click();
		await tocNav(page).getByRole('link').first().focus();
		await page.keyboard.press('Escape');

		await expect(tocNav(page).getByRole('link').first()).toBeHidden();
		await expect(summary).toBeFocused();
	});

	test('Escape with focus outside it leaves it open', async ({ page }) => {
		await page.goto(postPath!);
		await mobileSummary(page).click();
		const main = page.locator('#main-content');
		await main.focus();
		await page.keyboard.press('Escape');

		await expect(tocNav(page).getByRole('link').first()).toBeVisible();
		await expect(main).toBeFocused();
	});

	test('clicking outside closes it', async ({ page }) => {
		await page.goto(postPath!);
		await mobileSummary(page).click();
		await page.locator('article h1').click();
		await expect(tocNav(page).getByRole('link').first()).toBeHidden();
	});

	test('the bar names the section you jumped to, even near the end of the post', async ({
		page
	}) => {
		await page.goto(postPath!);
		// not getByRole: it skips the links while the list is closed, and would count none
		const count = await tocNav(page).locator('a').count();
		expect(count).toBeGreaterThan(0);
		for (let i = 0; i < count; i++) {
			await mobileSummary(page).click();
			const link = tocNav(page).getByRole('link').nth(i);
			const text = (await link.textContent())!.trim();
			await link.click();
			await expect(page.locator('.toc-current')).toHaveText(text);
		}
	});

	test('is named "On this page" whatever section is shown', async ({ page }) => {
		await page.goto(postPath!);
		await page.evaluate(() => window.scrollBy(0, 1500));
		await expect(page.locator('.toc-current')).not.toBeEmpty();
		// the current-section text is decorative, so the toggle's name doesn't change
		await expect(mobileSummary(page)).toHaveAccessibleName('On this page');
	});

	for (const colorScheme of ['light', 'dark'] as const) {
		test(`open list has no axe violations in ${colorScheme} mode`, async ({ page }) => {
			await page.emulateMedia({ colorScheme });
			await page.goto(postPath!);
			await mobileSummary(page).click();
			const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
			expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
		});
	}

	// A jump puts the section right at the bar, and Tab carries on from the section (WCAG 2.4.11).
	test('Tab after jumping to any section from the list lands clear of the sticky bar', async ({
		page,
		browserName
	}) => {
		await page.goto(postPath!);
		// not getByRole: it skips the links while the list is closed, and would count none
		const count = await tocNav(page).locator('a').count();
		expect(count).toBeGreaterThan(0);
		const covered: string[] = [];
		for (let i = 0; i < count; i++) {
			await mobileSummary(page).click();
			const link = tocNav(page).getByRole('link').nth(i);
			const hash = (await link.getAttribute('href'))!;
			await link.press('Enter');
			await expect(page).toHaveURL(new RegExp(`${hash}$`));
			await page.keyboard.press(tabKey(browserName));
			await expect(page.locator(`article ${hash} a`)).toBeFocused();
			const overlaps = await page.evaluate(() => {
				const a = document.activeElement!.getBoundingClientRect();
				const b = document.querySelector('.toc-mobile')!.getBoundingClientRect();
				return a.top < b.bottom && a.bottom > b.top;
			});
			if (overlaps) covered.push(hash);
		}
		expect(covered).toEqual([]);
	});

	// Shift+Tab scrolls each stop in at the top edge, where the bar is.
	test('keyboard focus never lands under the sticky bar, tabbing either way', async ({
		page,
		browserName
	}) => {
		await page.goto(postPath!);
		const covered: string[] = [];
		for (const [direction, key] of [
			['forward', tabKey(browserName)],
			['back', `Shift+${tabKey(browserName)}`]
		]) {
			for (let presses = 0; presses < 300; presses++) {
				await page.keyboard.press(key);
				const focus = await page.evaluate((mark) => {
					const el = document.activeElement;
					// past either end of the page, or wrapped round to a stop already checked
					if (!el || el === document.body || el.hasAttribute(mark)) return null;
					el.setAttribute(mark, '');
					const bar = document.querySelector('.toc-mobile')!;
					const a = el.getBoundingClientRect();
					const b = bar.getBoundingClientRect();
					const overlaps =
						a.top < b.bottom && a.bottom > b.top && a.left < b.right && a.right > b.left;
					return { name: el.outerHTML.slice(0, 80), covered: overlaps && !bar.contains(el) };
				}, `data-tabbed-${direction}`);
				if (!focus) break;
				if (focus.covered) covered.push(`${direction}: ${focus.name}`);
			}
		}
		expect(covered).toEqual([]);
	});
});

test('without JavaScript the list still opens', { tag: '@no-js' }, async ({ page }) => {
	await page.goto(postPath!);
	await mobileSummary(page).click();
	await expect(tocNav(page).getByRole('link').first()).toBeVisible();
});
