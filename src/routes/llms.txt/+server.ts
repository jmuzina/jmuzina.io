import { buildLlmsTxt } from '#lib/llms.ts';
import { getPosts } from '#lib/posts.ts';
import { getRouteLabel } from '#lib/routes.ts';
import { getPagePathnames } from '#lib/sitemap.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

const posts = getPosts();
const pages = getPagePathnames()
	.filter((path) => !posts.some((post) => post.path === path))
	.map((path) => ({ path, label: getRouteLabel(path)! }));

// url.origin is paths.origin at build time (see vite.config.ts)
export const GET: RequestHandler = ({ url }) =>
	new Response(buildLlmsTxt(url.origin, pages, posts), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
