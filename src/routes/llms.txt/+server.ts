import { buildLlmsTxt } from '#lib/llms.ts';
import { getPosts } from '#lib/posts.ts';
import { routes } from '#lib/routes.ts';
import { getPagePathnames } from '#lib/sitemap.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

const posts = getPosts();
const pages = getPagePathnames()
	.filter((path) => !posts.some((post) => post.path === path))
	.map((path) => ({ path, label: routes[path].label, description: routes[path].description }));

// url.origin is paths.origin at build time (see vite.config.ts)
export const GET: RequestHandler = ({ url }) =>
	new Response(buildLlmsTxt(url.origin, routes['/'].description, pages, posts), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
