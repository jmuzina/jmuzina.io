import { describe, expect, it } from 'vitest';
import { getPosts } from './posts';
import { getAriaCurrent, getRouteLabel, navRoutes, routes } from './routes';
import { getPagePathnames } from './sitemap';

describe('routes', () => {
	it('has an entry for every page route except blog posts', () => {
		const postPaths = new Set(getPosts().map((post) => post.path));
		const missing = getPagePathnames().filter(
			(pathname) => !(pathname in routes) && !postPaths.has(pathname)
		);
		expect(missing, 'add these pages to src/lib/routes.ts').toEqual([]);
	});

	it('labels every page and post', () => {
		for (const pathname of getPagePathnames()) expect(getRouteLabel(pathname)).toBeTruthy();
	});

	it('derives nav routes with their hrefs', () => {
		expect(navRoutes.map((route) => route.href)).toContain('/experience');
		expect(navRoutes.every((route) => route.nav)).toBe(true);
	});
});

describe('getAriaCurrent', () => {
	it('marks the exact page', () => {
		expect(getAriaCurrent('/experience', '/experience')).toBe('page');
	});

	it('marks the section for nested pages', () => {
		expect(getAriaCurrent('/blog', '/blog/some-post')).toBe('true');
	});

	it('ignores unrelated and prefix-only matches', () => {
		expect(getAriaCurrent('/blog', '/experience')).toBeUndefined();
		expect(getAriaCurrent('/blog', '/blogroll')).toBeUndefined();
	});

	it('never marks home as the section of every page', () => {
		expect(getAriaCurrent('/', '/experience')).toBeUndefined();
		expect(getAriaCurrent('/', '/')).toBe('page');
	});
});
