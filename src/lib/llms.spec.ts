import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from './llms';
import type { Post } from './posts';

const pages = [
	{ path: '/', label: 'Home' },
	{ path: '/experience', label: 'Experience' }
];
const post: Post = {
	title: 'A post',
	date: '2026-01-01T00:00:00.000Z',
	description: 'About it',
	path: '/blog/a-post'
};

describe('buildLlmsTxt', () => {
	it('starts with the site name and summary, then links the Markdown copy of each page and post', () => {
		expect(buildLlmsTxt('https://jmuzina.io', pages, [post])).toBe(`# Julie Mužina

> Julie Mužina's personal site. Trying to make sense of things, and to make them a little better.

## Pages
- [Home](https://jmuzina.io/index.html.md)
- [Experience](https://jmuzina.io/experience.md)

## Blog
- [A post](https://jmuzina.io/blog/a-post.md): About it
`);
	});

	it('leaves out the blog section when there are no posts', () => {
		expect(buildLlmsTxt('https://jmuzina.io', pages, [])).not.toContain('## Blog');
	});

	it('keeps titles from breaking their links and descriptions on one line', () => {
		const txt = buildLlmsTxt('https://jmuzina.io', pages, [
			{ ...post, title: 'Arrays [and] such', description: 'Two\nlines' }
		]);
		expect(txt).toContain(
			'- [Arrays \\[and\\] such](https://jmuzina.io/blog/a-post.md): Two lines\n'
		);
	});
});
