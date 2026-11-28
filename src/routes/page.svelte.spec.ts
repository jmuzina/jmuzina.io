import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Post } from '#lib/posts.ts';
import Page from './+page.svelte';

const mockPosts = vi.hoisted(() => ({ posts: [] as Post[] }));
// a plain factory: importing the real module would eagerly load every post (and its layout)
vi.mock('#lib/posts.ts', () => ({ getPosts: () => mockPosts.posts }));
vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/') } }));

const post = (n: number): Post => ({
	title: `Post ${n}`,
	date: `2026-0${n}-01T00:00:00.000Z`,
	description: `About post ${n}`,
	path: `/blog/post-${n}`
});

describe('/+page.svelte', () => {
	afterEach(() => (mockPosts.posts = []));

	it('should render the page h1', async () => {
		await render(Page);

		// tbd if i even need tests for a portfolio website :)
		const headings = page.getByRole('heading', { level: 1 });
		expect(headings.length).toBeGreaterThan(0);
	});

	it('leaves out recent writing when there are no posts', async () => {
		await render(Page);
		expect(page.getByRole('heading', { name: 'Recent writing' }).elements()).toHaveLength(0);
		expect(page.getByRole('link', { name: 'All posts' }).elements()).toHaveLength(0);
	});

	it('leaves out the "All posts" link when every post is already shown', async () => {
		mockPosts.posts = [post(3), post(2), post(1)];
		await render(Page);
		expect(page.getByRole('heading', { level: 3 }).elements()).toHaveLength(3);
		expect(page.getByRole('link', { name: 'All posts' }).elements()).toHaveLength(0);
	});

	it('shows the three newest posts and links to the rest', async () => {
		// getPosts() returns newest first
		mockPosts.posts = [post(5), post(4), post(3), post(2), post(1)];
		await render(Page);

		await expect
			.element(page.getByRole('heading', { level: 2, name: 'Recent writing' }))
			.toBeVisible();
		const titles = page.getByRole('heading', { level: 3 }).elements();
		expect(titles.map((h) => h.textContent?.trim())).toEqual(['Post 5', 'Post 4', 'Post 3']);
		expect(page.getByRole('link', { name: 'Post 5' }).element().getAttribute('href')).toBe(
			'/blog/post-5'
		);
		expect(page.getByRole('link', { name: 'All posts' }).element().getAttribute('href')).toBe(
			'/blog'
		);
	});
});
