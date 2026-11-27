import { buildFeed } from '#lib/feed.ts';
import { getPosts } from '#lib/posts.ts';
import type { RequestHandler } from './$types';

export const prerender = true;

// url.origin is paths.origin at build time (see vite.config.ts)
// text/xml, not application/atom+xml: browsers download the Atom type instead of showing the
// page in feed.xml. This header only reaches `pnpm dev`. Preview and nginx pick text/xml from
// the extension. Feed readers detect Atom from the content.
export const GET: RequestHandler = ({ url }) =>
	new Response(buildFeed(url.origin, getPosts()), {
		headers: { 'Content-Type': 'text/xml' }
	});
