import { describe, expect, it } from 'vitest';
import {
	htmlToMarkdown,
	markdownPath,
	pathnameFromMarkdownParam,
	postToMarkdown
} from './page-markdown';
import type { Post } from './posts';

describe('markdownPath', () => {
	it('appends .md, or index.html.md for the root', () => {
		expect(markdownPath('/')).toBe('/index.html.md');
		expect(markdownPath('/blog')).toBe('/blog.md');
		expect(markdownPath('/blog/a-post')).toBe('/blog/a-post.md');
	});

	it('round-trips through the route param', () => {
		for (const pathname of ['/', '/blog', '/blog/a-post']) {
			const param = markdownPath(pathname).slice(1, -'.md'.length);
			expect(pathnameFromMarkdownParam(param)).toBe(pathname);
		}
	});
});

describe('htmlToMarkdown', () => {
	it("converts only the page's main content", () => {
		const html = `<html><head><title>T</title></head><body>
			<nav><a href="/">Home</a></nav>
			<main><h1>Title</h1><p>Some <strong>bold</strong> text and <a href="/blog">a link</a>.</p>
			<ul><li>one</li><li>two</li></ul></main>
			<footer>Footer</footer></body></html>`;
		expect(htmlToMarkdown(html)).toBe(
			'# Title\n\nSome **bold** text and [a link](/blog).\n\n- one\n- two\n'
		);
	});

	it('drops scripts, icons, decorative text and hydration comments', () => {
		const html = `<main><!--[--><h1>Title</h1>
			<a href="/feed.xml"><svg><path d="M0 0"/></svg>Subscribe</a>
			<span aria-hidden="true">·</span>
			<script>alert(1)</script><style>p{}</style><!--]--></main>`;
		expect(htmlToMarkdown(html)).toBe('# Title\n\n[Subscribe](/feed.xml)\n');
	});

	it('fails without a main element', () => {
		expect(() => htmlToMarkdown('<p>Nothing</p>')).toThrow('page has no <main>');
	});
});

describe('postToMarkdown', () => {
	const post: Post = {
		title: 'A post',
		date: '2026-01-01T00:00:00.000Z',
		description: 'About it',
		path: '/blog/a-post'
	};
	const source = `---
title: A post
date: 2026-01-01
description: About it
---

<script lang="ts">
	const answer = 42;
</script>

Opening paragraph.

## A section
`;

	it('puts the title, date and description above the body, without frontmatter or scripts', () => {
		expect(postToMarkdown(post, source)).toBe(
			'# A post\n\nPublished Jan 1, 2026.\n\nAbout it\n\nOpening paragraph.\n\n## A section\n'
		);
	});

	it('keeps scripts and styles that are code examples', () => {
		const examples = `Load it with \`<script src>\`.

\`\`\`\`md
\`\`\`
<script>
	go();
</script>
\`\`\`\`

~~~svelte
<style>p {}</style>
~~~`;
		expect(postToMarkdown(post, `${source}\n${examples}\n`)).toBe(
			`# A post\n\nPublished Jan 1, 2026.\n\nAbout it\n\nOpening paragraph.\n\n## A section\n\n${examples}\n`
		);
	});

	it('gives the updated date when there is one', () => {
		expect(postToMarkdown({ ...post, updated: '2026-02-01T00:00:00.000Z' }, source)).toContain(
			'Published Jan 1, 2026. Updated Feb 1, 2026.'
		);
	});
});
