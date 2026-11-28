import { expect, test } from '@playwright/test';
import { getPagePaths, tabKey } from './helpers';

test('every page has one title and one h1, inside main', async ({ page, request }) => {
	for (const path of await getPagePaths(request)) {
		await test.step(path, async () => {
			await page.goto(path);
			// a second <title> (e.g. a static one in app.html) would come first and win
			await expect(page.locator('head title')).toHaveCount(1);
			expect(await page.title()).toMatch(/\S/);
			await expect(page.locator('h1')).toHaveCount(1);
			await expect(page.locator('main h1')).toHaveCount(1);
		});
	}
});

test.describe('blog posts', () => {
	const postPath = (paths: string[]) => paths.find((path) => /^\/blog\/[^/]+$/.test(path));

	test('are listed on the blog index and render with the post layout', async ({
		page,
		request
	}) => {
		const path = postPath(await getPagePaths(request));
		test.skip(!path, 'no posts yet');

		await page.goto('/blog');
		const link = page.locator(`main a[href="${path}"]`);
		const title = (await link.textContent())!.trim();
		await link.click();

		await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
		await expect(page).toHaveTitle(`${title} | Julie Mužina`);
		await expect(page.locator('article header time').first()).toHaveAttribute(
			'datetime',
			/^\d{4}-\d{2}-\d{2}/
		);

		const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
		await expect(breadcrumb.getByRole('link')).toHaveText(['Home', 'Blog', title]);
	});

	test('headings link to their own fragment and copy it', async ({
		page,
		context,
		request,
		browserName
	}) => {
		const path = postPath(await getPagePaths(request));
		test.skip(!path, 'no posts yet');
		// only Chromium lets tests grant clipboard access
		if (browserName === 'chromium') {
			await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		}
		await page.goto(path!);

		const heading = page.locator('article h2[id]').first();
		test.skip((await heading.count()) === 0, 'post has no sections');
		const id = (await heading.getAttribute('id'))!;
		const link = heading.getByRole('link');

		// the heading's accessible name is just its text; the # cue is hidden from AT
		const name = (await heading
			.locator('.heading-anchor')
			.evaluate((a) => a.firstChild?.textContent))!;
		await expect(page.getByRole('heading', { level: 2, name, exact: true })).toHaveCount(1);
		await expect(link).toHaveAttribute('href', `#${id}`);

		await link.click();
		await expect(page).toHaveURL(new RegExp(`${path}#${id}$`));
		await expect(heading).toBeInViewport();

		if (browserName === 'chromium') {
			await expect(page.locator('#heading-link-status')).toHaveText('Link to section copied');
			expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
				new RegExp(`${path}#${id}$`)
			);
		}
	});

	test('heading links are reachable and visibly focused by keyboard', async ({
		page,
		request,
		browserName
	}) => {
		const path = postPath(await getPagePaths(request));
		test.skip(!path, 'no posts yet');
		await page.goto(path!);

		// press the key a reader would, until focus lands on a heading link
		const link = page.locator('article .heading-anchor').first();
		const isFocused = () => link.evaluate((el) => el === document.activeElement);
		for (let presses = 0; presses < 50 && !(await isFocused()); presses++) {
			await page.keyboard.press(tabKey(browserName));
		}
		await expect(link).toBeFocused();
		await expect(link).not.toHaveCSS('outline-style', 'none');
		await expect(link.locator('span[aria-hidden="true"]')).toHaveCSS('opacity', '1');
	});

	test('highlight code blocks with theme colors', async ({ page, request }) => {
		const path = postPath(await getPagePaths(request));
		test.skip(!path, 'no posts yet');
		await page.goto(path!);

		const block = page.locator('pre[class*="language-"]').first();
		test.skip((await block.count()) === 0, 'post has no code blocks');
		const keyword = block.locator('.token.keyword').first();
		const plain = await block.evaluate((pre) => getComputedStyle(pre).color);
		await expect(keyword).not.toHaveCSS('color', plain);
	});

	test('hovering a link recolors only that link', async ({ page, request, isMobile }) => {
		test.skip(isMobile, 'touch screens have no hover');
		const path = postPath(await getPagePaths(request));
		test.skip(!path, 'no posts yet');
		await page.goto(path!);

		const link = page.locator('article .prose p a').first();
		test.skip((await link.count()) === 0, 'post has no links in its text');
		const rest = await link.evaluate((a) => getComputedStyle(a).color);

		await page.locator('article .prose p:not(:has(a))').first().hover();
		await expect(link).toHaveCSS('color', rest);
		await link.hover();
		await expect(link).not.toHaveCSS('color', rest);
	});
});
