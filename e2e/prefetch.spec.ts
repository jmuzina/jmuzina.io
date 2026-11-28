import { expect, test, type BrowserContext, type Page } from '@playwright/test';

// The Matomo snippet only loads the tracker on jmuzina.io, so one test browses that name through a
// route to the preview server. Anything the route misses resolves to this machine, not production.
test.use({
	launchOptions: { args: ['--host-resolver-rules=MAP jmuzina.io localhost'] }
});

test.skip(
	({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
	'speculation rules are Chromium-only, and on phones moderate eagerness goes by scrolling, not hover'
);

function recordPrefetches(context: BrowserContext): string[] {
	const paths: string[] = [];
	context.on('request', (request) => {
		const purpose = request.headers()['sec-purpose'] ?? '';
		if (purpose.includes('prefetch')) paths.push(new URL(request.url()).pathname);
	});
	return paths;
}

// On desktop, moderate eagerness acts on a hover only after 200ms, and moving on cancels it.
async function hover(page: Page, href: string) {
	await page.locator(`a[href="${href}"]:visible`).first().hover();
	await page.waitForTimeout(500);
}

test('hovering a link to a page prefetches it', async ({ page }) => {
	const prefetched = recordPrefetches(page.context());
	await page.goto('/');
	await hover(page, '/blog');
	await expect.poll(() => prefetched).toContain('/blog');
});

test('links to the feed and to Markdown copies are not prefetched', async ({ page }) => {
	const prefetched = recordPrefetches(page.context());
	await page.goto('/blog');
	// No page links its Markdown copy yet (only <link rel="alternate">, which rules don't match).
	await page.evaluate(() => {
		const link = document.createElement('a');
		link.href = '/blog.md';
		link.textContent = 'Markdown';
		document.querySelector('main')!.prepend(link);
	});

	await hover(page, '/feed.xml');
	await hover(page, '/blog.md');
	// A page hovered last bounds the wait: once it is prefetched, the others would have been too.
	await hover(page, '/privacy');
	await expect.poll(() => prefetched).toContain('/privacy');
	expect(prefetched).not.toContain('/feed.xml');
	expect(prefetched).not.toContain('/blog.md');
});

test('a prefetched page runs no scripts, so analytics count only real visits', async ({
	page,
	baseURL
}) => {
	const trackerLoads: string[] = [];
	// The preview server refuses other Host headers, so its pages are fetched and passed on.
	await page.context().route('https://jmuzina.io/**', async (route) => {
		const { pathname, search } = new URL(route.request().url());
		if (pathname.startsWith('/matomo/')) {
			trackerLoads.push(pathname);
			return route.fulfill({ contentType: 'text/javascript', body: '' });
		}
		return route.fulfill({ response: await route.fetch({ url: baseURL + pathname + search }) });
	});
	const prefetched = recordPrefetches(page.context());
	const origin = 'https://jmuzina.io';

	await page.goto(`${origin}/`);
	await expect.poll(() => trackerLoads).toHaveLength(1);

	await hover(page, '/blog');
	await expect.poll(() => prefetched).toContain('/blog');
	// A prefetched page that ran its scripts would load the tracker as soon as its HTML arrived.
	await page.waitForTimeout(1_000);
	expect(trackerLoads).toHaveLength(1);

	await page.locator('a[href="/blog"]:visible').first().click();
	await expect(page).toHaveURL(`${origin}/blog`);
	await expect.poll(() => trackerLoads).toHaveLength(2);
});

// Under Playwright, Chromium requests a prerender but never runs the page, so the test above can't
// catch a switch to prerendering.
test('pages are only prefetched, never prerendered', async ({ page }) => {
	await page.goto('/');
	const rules = await page
		.locator('script[type="speculationrules"]')
		.evaluateAll((scripts) =>
			scripts.map((script) => Object.keys(JSON.parse(script.textContent!)))
		);
	expect(rules).toEqual([['prefetch']]);
});
