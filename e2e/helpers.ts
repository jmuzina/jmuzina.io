import type { APIRequestContext, Page } from '@playwright/test';

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
