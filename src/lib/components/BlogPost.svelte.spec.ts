import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
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
});
