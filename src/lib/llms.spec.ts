import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from './llms';
import type { Post } from './posts';

const pages = [
	{ path: '/', label: 'Home', description: 'The home page' },
	{ path: '/experience', label: 'Experience', description: 'Where I worked' }
];
const post: Post = {
	title: 'A post',
	date: '2026-01-01T00:00:00.000Z',
	description: 'About it',
	path: '/blog/a-post'
};

describe('buildLlmsTxt', () => {
	it('starts with the site name and summary, then links and describes the Markdown copy of each page and post', () => {
		expect(buildLlmsTxt('https://jmuzina.io', 'A summary.', pages, [post])).toBe(`# Julie Mužina

> A summary.

## Pages
- [Home](https://jmuzina.io/index.html.md): The home page
- [Experience](https://jmuzina.io/experience.md): Where I worked

## Blog
- [A post](https://jmuzina.io/blog/a-post.md): About it
`);
	});

	it('leaves out the blog section when there are no posts', () => {
		expect(buildLlmsTxt('https://jmuzina.io', 'A summary.', pages, [])).not.toContain('## Blog');
	});

	it('keeps titles from breaking their links and descriptions on one line', () => {
		const txt = buildLlmsTxt(
			'https://jmuzina.io',
			'A summary.',
			[{ path: '/privacy', label: 'Privacy [policy]', description: 'Two\nlines' }],
			[{ ...post, title: 'Arrays [and] such', description: 'Two\nlines' }]
		);
		expect(txt).toContain('- [Privacy \\[policy\\]](https://jmuzina.io/privacy.md): Two lines\n');
		expect(txt).toContain(
			'- [Arrays \\[and\\] such](https://jmuzina.io/blog/a-post.md): Two lines\n'
		);
	});
});
