import { buildSitemap, getPagePathnames } from '$lib/sitemap';
import type { RequestHandler } from './$types';

export const prerender = true;

// url.origin is kit.prerender.origin at build time (see svelte.config.js)
export const GET: RequestHandler = ({ url }) =>
	new Response(buildSitemap(url.origin, getPagePathnames()), {
		headers: { 'Content-Type': 'application/xml' }
	});
