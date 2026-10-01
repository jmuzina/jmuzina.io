import { describe, expect, it } from 'vitest';
import { buildSitemap, getPagePathnames, routeFileToPathname } from './sitemap';

describe('routeFileToPathname', () => {
	it('maps the root page to /', () => {
		expect(routeFileToPathname('/src/routes/+page.svelte')).toBe('/');
	});

	it('maps nested pages and strips route groups', () => {
		expect(routeFileToPathname('/src/routes/privacy/+page.svelte')).toBe('/privacy');
		expect(routeFileToPathname('/src/routes/(legal)/privacy/+page.svelte')).toBe('/privacy');
	});

	it('skips dynamic routes', () => {
		expect(routeFileToPathname('/src/routes/blog/[slug]/+page.svelte')).toBeNull();
	});
});

describe('getPagePathnames', () => {
	it('finds the app pages', () => {
		expect(getPagePathnames()).toEqual(expect.arrayContaining(['/', '/privacy']));
	});
});

describe('buildSitemap', () => {
	it('lists absolute URLs for each pathname', () => {
		const xml = buildSitemap('https://jmuzina.io', ['/', '/privacy']);
		expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(xml).toContain('<loc>https://jmuzina.io/</loc>');
		expect(xml).toContain('<loc>https://jmuzina.io/privacy</loc>');
	});
});
