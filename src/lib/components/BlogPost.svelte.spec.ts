import axe from 'axe-core';
import { createRawSnippet } from 'svelte';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { commands, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import '../../app.css';
import appHtml from '../../app.html?raw';
import BlogPost from './BlogPost.svelte';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/blog/a-post') } }));

describe('BlogPost.svelte', () => {
	// after the body: finishing a post is when a reader decides to subscribe
	it('links to the feed after the post', async () => {
		const children = createRawSnippet(() => ({ render: () => '<p>Post body</p>' }));
		await render(BlogPost, {
			title: 'A post',
			date: '2026-01-01T00:00:00.000Z',
			description: 'Some things',
			children
		});

		const link = page.getByRole('link', { name: 'Subscribe' });
		await expect.element(link).toHaveAttribute('href', '/feed.xml');
		const body = page.getByText('Post body').element();
		expect(body.compareDocumentPosition(link.element())).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
	});

	describe('inline code in a link', () => {
		beforeAll(() => {
			// theme tokens resolve from the <html> attributes, as in prod
			const htmlTag = new DOMParser().parseFromString(appHtml, 'text/html').documentElement;
			for (const { name, value } of htmlTag.attributes) {
				document.documentElement.setAttribute(name, value);
			}
		});
		afterEach(() => commands.emulateColorScheme('light'));

		// Skeleton tints <code> with the brand color, and inside a link the text is the brand color too
		it.each(['light', 'dark'] as const)('keeps its contrast in %s mode', async (colorScheme) => {
			await commands.emulateColorScheme(colorScheme);
			const children = createRawSnippet(() => ({
				render: () => '<p>See <a href="/a"><code>:autofill</code></a> and <code>input</code>.</p>'
			}));
			await render(BlogPost, {
				title: 'A post',
				date: '2026-01-01T00:00:00.000Z',
				description: 'Some things',
				children
			});

			const { violations } = await axe.run(document, { runOnly: ['color-contrast'] });
			expect(violations.flatMap((v) => v.nodes.map((n) => n.html))).toEqual([]);
		});
	});
});
