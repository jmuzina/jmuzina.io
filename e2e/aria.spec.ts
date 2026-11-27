// Locks the roles, names and states screen readers rely on, which axe only checks exist. Templates
// match partially, so content and nav entries can change without touching this file.
import { expect, test } from '@playwright/test';
import { getPagePaths } from './helpers';

test('every page has the same named landmarks', async ({ page, request, isMobile }) => {
	for (const path of await getPagePaths(request)) {
		await test.step(path, async () => {
			await page.goto(path);
			await expect(page.locator('body')).toMatchAriaSnapshot(`
				- link "Skip to main content"
				- banner:
				  - link /^Julie Mužina/
				- main
				- contentinfo:
				  - list:
				    - listitem:
				      - link "GitHub"
				    - listitem:
				      - link "LinkedIn"
				    - listitem:
				      - link "Email"
				  - link "Diana Mužina"
			`);
			// phones start with the menu collapsed behind its toggle
			await expect(page.getByRole('banner')).toMatchAriaSnapshot(
				isMobile ? '- button "Menu" [expanded=false]' : '- navigation "Main":\n  - list'
			);
		});
	}
});

test('the open mobile menu is announced as expanded with the main navigation', async ({
	page,
	isMobile
}) => {
	test.skip(!isMobile, 'the menu only collapses on small screens');
	await page.goto('/');
	await page.getByRole('button', { name: 'Menu' }).click();
	await expect(page.getByRole('banner')).toMatchAriaSnapshot(`
		- button "Menu" [expanded]
		- navigation "Main":
		  - list
	`);
});

test('posts have a breadcrumb trail, a titled article and a date', async ({ page, request }) => {
	const posts = (await getPagePaths(request)).filter((path) => /^\/blog\/[^/]+$/.test(path));
	test.skip(!posts.length, 'no posts yet');
	for (const path of posts) {
		await test.step(path, async () => {
			await page.goto(path);
			await expect(page.getByRole('main')).toMatchAriaSnapshot(`
				- navigation "Breadcrumb":
				  - list
				- article:
				  - heading [level=1]
				  - time
			`);
		});
	}
});
