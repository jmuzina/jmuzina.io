import { error } from '@sveltejs/kit';
import {
	htmlToMarkdown,
	markdownPath,
	pathnameFromMarkdownParam,
	postToMarkdown
} from '#lib/page-markdown.ts';
import { getPosts } from '#lib/posts.ts';
import { getPagePathnames, routeFileToPathname } from '#lib/sitemap.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getPagePathnames().map((pathname) => ({ path: markdownPath(pathname).slice(1, -'.md'.length) }));

const postSources = Object.fromEntries(
	Object.entries(
		import.meta.glob<string>('/src/routes/blog/*/+page.md', {
			query: '?raw',
			import: 'default',
			eager: true
		})
	).map(([file, source]) => [routeFileToPathname(file), source])
);

export const GET: RequestHandler = async ({ params, fetch }) => {
	const pathname = pathnameFromMarkdownParam(params.path);
	const post = getPosts().find(({ path }) => path === pathname);

	let markdown: string;
	if (post) {
		markdown = postToMarkdown(post, postSources[pathname]);
	} else {
		const response = await fetch(pathname);
		if (!response.ok) error(404);
		markdown = htmlToMarkdown(await response.text());
	}
	return new Response(markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
