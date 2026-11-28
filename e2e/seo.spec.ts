import { expect, test, type Locator, type Page } from '@playwright/test';
import { getPagePaths, urlFor } from './helpers';

const markdownHref = (page: Page) =>
	page.locator('head link[rel="alternate"][type="text/markdown"]').getAttribute('href');

const isPost = (path: string) => /^\/blog\/[^/]+$/.test(path);

// exactly one: a duplicate tag leaves crawlers to pick, and they don't agree on which
async function only(head: Locator, selector: string, attribute: string) {
	const tag = head.locator(selector);
	await expect(tag, selector).toHaveCount(1);
	const value = await tag.getAttribute(attribute);
	expect(value, selector).toMatch(/\S/);
	return value!;
}

test('every page has its own canonical URL, description and link preview', async ({
	page,
	request
}) => {
	for (const path of await getPagePaths(request)) {
		await test.step(path, async () => {
			await page.goto(path);
			const head = page.locator('head');

			const canonical = await only(head, 'link[rel="canonical"]', 'href');
			expect(canonical).toMatch(urlFor(path));
			expect(await only(head, 'meta[property="og:url"]', 'content')).toBe(canonical);

			await only(head, 'meta[name="description"]', 'content');
			await only(head, 'meta[property="og:title"]', 'content');
			await only(head, 'meta[property="og:description"]', 'content');
			await only(head, 'meta[property="og:image:alt"]', 'content');
			await only(head, 'meta[name="twitter:card"]', 'content');
			expect(await only(head, 'meta[property="og:type"]', 'content')).toBe(
				isPost(path) ? 'article' : 'website'
			);

			// the tag carries the production origin, so fetch it from the server under test
			const image = new URL(await only(head, 'meta[property="og:image"]', 'content'));
			const response = await request.get(image.pathname);
			expect(response.status(), image.pathname).toBe(200);
			expect(response.headers()['content-type']).toMatch(/^image\//);

			expect(await only(head, 'link[rel="alternate"][type="application/atom+xml"]', 'href')).toBe(
				'/feed.xml'
			);
		});
	}
});

test('every post describes itself as a blog posting', async ({ page, request }) => {
	const paths = await getPagePaths(request);
	const sitemap = await (await request.get('/sitemap.xml')).text();
	const posts = paths.filter(isPost);
	test.skip(!posts.length, 'no posts yet');

	for (const path of posts) {
		await test.step(path, async () => {
			await page.goto(path);
			const head = page.locator('head');
			const jsonLd = head.locator('script[type="application/ld+json"]');
			await expect(jsonLd).toHaveCount(1);
			const data = JSON.parse((await jsonLd.textContent())!);

			expect(data['@type']).toBe('BlogPosting');
			expect(data.headline).toBe((await page.locator('h1').textContent())!.trim());
			expect(data.url).toBe(await only(head, 'link[rel="canonical"]', 'href'));
			expect(data.image).toBe(await only(head, 'meta[property="og:image"]', 'content'));
			expect(data.datePublished).toBe(
				await only(head, 'meta[property="article:published_time"]', 'content')
			);
			expect(data.datePublished).toBe(
				await page.locator('article header time').first().getAttribute('datetime')
			);

			// one modified date, everywhere it's stated
			const modified = page.locator('head meta[property="article:modified_time"]');
			if (await modified.count()) {
				expect(data.dateModified).toBe(await modified.getAttribute('content'));
				await expect(page.locator('article header time').nth(1)).toHaveAttribute(
					'datetime',
					data.dateModified
				);
			} else {
				expect(data.dateModified).toBe(data.datePublished);
			}
			expect(sitemap).toContain(
				`<loc>${data.url}</loc>\n\t\t<lastmod>${data.dateModified.slice(0, 10)}</lastmod>`
			);
		});
	}
});

// Its fields copy what the pages show, so they're checked against those pages.
test('the home page describes Julie as a person, and no other page does', async ({
	page,
	request
}) => {
	for (const path of await getPagePaths(request)) {
		await test.step(path, async () => {
			await page.goto(path);
			const types = [];
			for (const block of await page.locator('script[type="application/ld+json"]').all()) {
				types.push(JSON.parse((await block.textContent())!)['@type']);
			}
			expect(types.filter((type) => type === 'Person')).toHaveLength(path === '/' ? 1 : 0);
		});
	}

	await page.goto('/');
	const head = page.locator('head');
	const jsonLd = head.locator('script[type="application/ld+json"]');
	await expect(jsonLd).toHaveCount(1);
	const person = JSON.parse((await jsonLd.textContent())!);
	expect(person.url).toBe(await only(head, 'link[rel="canonical"]', 'href'));
	expect(person.image).toBe(await only(head, 'meta[property="og:image"]', 'content'));

	const footer = page.locator('footer');
	const profiles = [];
	for (const name of ['GitHub', 'LinkedIn']) {
		profiles.push(await footer.getByRole('link', { name, exact: true }).getAttribute('href'));
	}
	expect(person.sameAs).toEqual(profiles);

	await page.goto('/experience');
	const section = (name: string) =>
		page.locator('section').filter({ has: page.getByRole('heading', { level: 2, name }) });

	const currentJob = section('Experience')
		.getByRole('listitem')
		.filter({ hasText: 'Present' })
		.getByRole('heading', { level: 3 });
	await expect(currentJob).toHaveCount(1);
	await expect(currentJob).toHaveText(`${person.jobTitle} at ${person.worksFor.name}`);
	await expect(currentJob.getByRole('link')).toHaveAttribute('href', person.worksFor.url);

	const school = section('Education').getByRole('heading', { level: 3 }).getByRole('link');
	await expect(school).toHaveCount(1);
	await expect(school).toHaveText(person.alumniOf.name);
	await expect(school).toHaveAttribute('href', person.alumniOf.url);
});

test('the feed lists every post', async ({ request }) => {
	const posts = (await getPagePaths(request)).filter(isPost);
	const response = await request.get('/feed.xml');
	expect(response.status()).toBe(200);

	const xml = await response.text();
	const entries = [...xml.matchAll(/<entry>[\s\S]*?<id>([^<]+)<\/id>/g)].map(
		(match) => new URL(match[1]).pathname
	);
	expect(entries.sort()).toEqual(posts.sort());
});

test('the blog links to the feed', async ({ page, request }) => {
	await page.goto('/blog');
	const href = await page.getByRole('link', { name: 'Subscribe' }).getAttribute('href');
	expect(href).toBe('/feed.xml');
	expect((await request.get(href!)).status()).toBe(200);
});

test('llms.txt lists and describes every page, and shares the home page summary', async ({
	page,
	request
}) => {
	const response = await request.get('/llms.txt');
	expect(response.status()).toBe(200);
	const txt = await response.text();

	const entries = Object.fromEntries(
		[...txt.matchAll(/^- \[.+?\]\(([^)]+)\)(?:: (.*))?$/gm)].map((match) => [
			new URL(match[1]).pathname,
			match[2]
		])
	);
	const descriptions: Record<string, string> = {};
	for (const path of await getPagePaths(request)) {
		await page.goto(path);
		const description = await page.locator('head meta[name="description"]').getAttribute('content');
		descriptions[(await markdownHref(page))!] = description!.replace(/\s+/g, ' ').trim();
	}
	expect(entries).toEqual(descriptions);

	await page.goto('/');
	const description = await page.locator('head meta[name="description"]').getAttribute('content');
	expect(txt).toContain(`\n> ${description}\n`);
});

test('every page has a Markdown copy with the same heading', async ({ page, request }) => {
	for (const path of await getPagePaths(request)) {
		await test.step(path, async () => {
			await page.goto(path);
			const href = await markdownHref(page);
			expect(href).toMatch(/\.md$/);
			const response = await request.get(href!);
			expect(response.status()).toBe(200);
			expect(response.headers()['content-type']).toMatch(/^text\/markdown/);

			const h1 = (await page.locator('h1').textContent())!.trim();
			// code samples can hold `#` lines, comments and scripts
			const markdown = (await response.text()).replace(
				/^ {0,3}((`|~)\2{2,})[\s\S]*?^ {0,3}\1\2*[ \t]*$/gm,
				''
			);
			expect(markdown.match(/^# .*$/gm)).toEqual([`# ${h1}`]);
			expect(markdown.replace(/(`+)[\s\S]*?\1/g, '')).not.toMatch(/<!--|<script/i);
		});
	}
});

test('opening the feed in a browser shows its posts as links', async ({ page, request }) => {
	const posts = (await getPagePaths(request)).filter(isPost);
	await page.goto('/feed.xml');
	await expect(page).toHaveTitle('Feed | Julie Mužina');
	await expect(page.getByRole('heading', { level: 1, name: 'Blog feed' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Back to the blog' })).toHaveAttribute(
		'href',
		'/blog'
	);

	const links = page.getByRole('heading', { level: 2 }).getByRole('link');
	await expect(links).toHaveCount(posts.length);
	// the Atom copy of each post stays hidden
	await expect(page.locator('entry').first()).toBeHidden();
	test.skip(!posts.length, 'no posts yet');
	await links.first().click();
	await expect(page).toHaveURL(urlFor(posts[0]));
});
