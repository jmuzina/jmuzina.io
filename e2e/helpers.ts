import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';

// best-practice carries the structural rules (heading-order, region, landmark-*), which have no
// WCAG tag. Keep in sync with the vitest axe suites (src/routes/a11y.svelte.spec.ts,
// src/lib/components/Breadcrumbs.svelte.spec.ts).
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// From the built sitemap, so new pages and posts are tested without touching the tests. Its locs
// carry the production origin, hence pathname only.
export async function getPagePaths(request: APIRequestContext): Promise<string[]> {
	const xml = await (await request.get('/sitemap.xml')).text();
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
}

export async function openNavIfCollapsed(page: Page) {
	const toggle = page.locator('#nav-toggle');
	if ((await toggle.isVisible()) && (await toggle.getAttribute('aria-expanded')) !== 'true') {
		await toggle.click();
	}
}

export const pathDepth = (path: string) => path.split('/').filter(Boolean).length;

export const urlFor = (path: string) =>
	new RegExp(`^https?://[^/]+${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

export async function getPostPath(request: APIRequestContext): Promise<string | undefined> {
	return (await getPagePaths(request)).find((path) => /^\/blog\/[^/]+$/.test(path));
}

/** Safari only Tabs to links with "Press Tab to highlight each item" on; users press Option+Tab. */
export const tabKey = (browserName: string) => (browserName === 'webkit' ? 'Alt+Tab' : 'Tab');

export type FocusRing = { width: string; offset: string; color: string };

// The `focus-ring` utility's ring in the page's color scheme, read from a probe. Its outline-style
// is inline because an outline that isn't drawn may report a 0 width.
export async function getSiteFocusRing(page: Page): Promise<FocusRing> {
	return page.evaluate(() => {
		const probe = document.createElement('span');
		probe.className = 'focus-ring';
		probe.style.outlineStyle = 'solid';
		document.body.append(probe);
		const cs = getComputedStyle(probe);
		const ring = { width: cs.outlineWidth, offset: cs.outlineOffset, color: cs.outlineColor };
		probe.remove();
		return ring;
	});
}

export async function expectSiteFocusRing(locator: Locator, ring: FocusRing) {
	await expect(locator).toHaveCSS('outline-style', 'solid');
	await expect(locator).toHaveCSS('outline-width', ring.width);
	await expect(locator).toHaveCSS('outline-offset', ring.offset);
	await expect(locator).toHaveCSS('outline-color', ring.color);
}
