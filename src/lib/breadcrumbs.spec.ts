import { describe, expect, it } from 'vitest';
import { buildBreadcrumbs } from './breadcrumbs';

const labels: Record<string, string> = { '/': 'Home', '/blog': 'Blog' };
const getLabel = (href: string) => labels[href];

describe('buildBreadcrumbs', () => {
	it('is empty for home and top-level pages', () => {
		expect(buildBreadcrumbs('/', getLabel)).toEqual([]);
		expect(buildBreadcrumbs('/privacy', getLabel)).toEqual([]);
		expect(buildBreadcrumbs('/blog/', getLabel)).toEqual([]);
	});

	it('links every level from home down to a nested page', () => {
		expect(buildBreadcrumbs('/blog/first-post', getLabel)).toEqual([
			{ href: '/', label: 'Home' },
			{ href: '/blog', label: 'Blog' },
			{ href: '/blog/first-post', label: 'First post' }
		]);
	});

	it('handles deeper pages and trailing slashes', () => {
		expect(buildBreadcrumbs('/blog/2026/my_post/', getLabel).map((c) => [c.href, c.label])).toEqual(
			[
				['/', 'Home'],
				['/blog', 'Blog'],
				['/blog/2026', '2026'],
				['/blog/2026/my_post', 'My post']
			]
		);
	});

	it('prefers known labels over the URL segment', () => {
		const crumbs = buildBreadcrumbs('/blog/first-post', (href) =>
			href === '/blog/first-post' ? 'My First Post!' : getLabel(href)
		);
		expect(crumbs.at(-1)?.label).toBe('My First Post!');
	});

	it('falls back to "Home" when the root has no label', () => {
		expect(buildBreadcrumbs('/a/b', () => undefined)[0]).toEqual({ href: '/', label: 'Home' });
	});

	it('decodes encoded segments', () => {
		expect(buildBreadcrumbs('/blog/caf%C3%A9-notes', getLabel).at(-1)?.label).toBe('Café notes');
	});
});
