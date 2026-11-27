import { describe, expect, it } from 'vitest';
import { getPosts } from './posts';
import { buildSitemap, getPagePathnames, routeFileToPathname } from './sitemap';

describe('routeFileToPathname', () => {
	it('maps the root page to /', () => {
		expect(routeFileToPathname('/src/routes/+page.svelte')).toBe('/');
	});

	it('maps nested pages and strips route groups', () => {
		expect(routeFileToPathname('/src/routes/privacy/+page.svelte')).toBe('/privacy');
		expect(routeFileToPathname('/src/routes/(legal)/privacy/+page.svelte')).toBe('/privacy');
	});

	it('maps markdown pages', () => {
		expect(routeFileToPathname('/src/routes/blog/first-post/+page.md')).toBe('/blog/first-post');
	});

	it('skips dynamic routes', () => {
		expect(routeFileToPathname('/src/routes/blog/[slug]/+page.svelte')).toBeNull();
	});
});

describe('getPagePathnames', () => {
	it('finds the app pages', () => {
		expect(getPagePathnames()).toEqual(expect.arrayContaining(['/', '/blog', '/privacy']));
	});

	// can only fail once a post exists; skipped (not falsely passing) until then
	it.skipIf(getPosts().length === 0)('finds Markdown posts', () => {
		expect(getPagePathnames()).toEqual(expect.arrayContaining(getPosts().map((post) => post.path)));
	});
});

describe('buildSitemap', () => {
	it('lists absolute URLs for each pathname', () => {
		const xml = buildSitemap('https://jmuzina.io', ['/', '/privacy']);
		expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(xml).toContain('<loc>https://jmuzina.io/</loc>');
		expect(xml).toContain('<loc>https://jmuzina.io/privacy</loc>');
	});

	it('dates only the pathnames given a last-modified date', () => {
		const xml = buildSitemap('https://jmuzina.io', ['/', '/blog/post'], {
			'/blog/post': '2026-03-01'
		});
		expect(xml).toContain(
			'<loc>https://jmuzina.io/blog/post</loc>\n\t\t<lastmod>2026-03-01</lastmod>\n'
		);
		expect(xml.match(/<lastmod>/g)).toHaveLength(1);
	});

	it('escapes XML special characters', () => {
		const xml = buildSitemap('https://jmuzina.io', ["/a&b'c"]);
		expect(xml).toContain('<loc>https://jmuzina.io/a&amp;b&apos;c</loc>');
	});
});
