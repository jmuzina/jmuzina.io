import { getPosts } from '#lib/posts.ts';
import { buildSitemap, getPagePathnames } from '#lib/sitemap.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

// Only posts carry a date that's accurate; a wrong lastmod teaches crawlers to ignore it.
const lastModified = Object.fromEntries(
	getPosts().map((post) => [post.path, (post.updated ?? post.date).slice(0, 10)])
);

// url.origin is paths.origin at build time (see vite.config.ts)
export const GET: RequestHandler = ({ url }) =>
	new Response(buildSitemap(url.origin, getPagePathnames(), lastModified), {
		headers: { 'Content-Type': 'application/xml' }
	});
