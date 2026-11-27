import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Post } from '#lib/posts.ts';
import Page from './+page.svelte';

const mockPosts = vi.hoisted(() => ({ posts: [] as Post[] }));
// a plain factory: importing the real module would eagerly load every post (and its layout)
vi.mock('#lib/posts.ts', () => ({ getPosts: () => mockPosts.posts }));

describe('/blog/+page.svelte', () => {
	afterEach(() => (mockPosts.posts = []));

	it('shows the page heading', async () => {
		await render(Page);
		await expect.element(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
	});

	// before any posts too, so readers can subscribe for the first one
	it('links to the feed', async () => {
		await render(Page);
		const link = page.getByRole('link', { name: 'Subscribe' });
		await expect.element(link).toHaveAttribute('href', '/feed.xml');
	});

	it('says so when there are no posts', async () => {
		await render(Page);
		await expect.element(page.getByText('No posts yet.')).toBeVisible();
		expect(page.getByRole('list').elements()).toHaveLength(0);
	});

	it('lists posts with links, dates and descriptions', async () => {
		mockPosts.posts = [
			{
				title: 'Second post',
				date: '2026-03-02T00:00:00.000Z',
				description: 'More things',
				path: '/blog/second-post'
			},
			{
				title: 'First post',
				date: '2026-01-01T00:00:00.000Z',
				description: 'Some things',
				path: '/blog/first-post'
			}
		];
		const { container } = await render(Page);

		const items = container.querySelectorAll('ol > li');
		expect(items).toHaveLength(2);

		const link = page.getByRole('link', { name: 'Second post' });
		expect(link.element().getAttribute('href')).toBe('/blog/second-post');
		await expect.element(page.getByText('More things')).toBeVisible();

		const time = items[0].querySelector('time')!;
		expect(time.getAttribute('datetime')).toBe('2026-03-02T00:00:00.000Z');
		expect(time.textContent?.trim()).toBe('Mar 2, 2026');
		expect(page.getByText('No posts yet.').elements()).toHaveLength(0);
	});
});
