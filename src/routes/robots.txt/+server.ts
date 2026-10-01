import type { RequestHandler } from './$types';

export const prerender = true;

// url.origin is kit.prerender.origin at build time (see svelte.config.js)
export const GET: RequestHandler = ({ url }) =>
	new Response(
		`# allow crawling everything by default
User-agent: *
Disallow:

Sitemap: ${new URL('/sitemap.xml', url.origin).href}
`,
		{ headers: { 'Content-Type': 'text/plain' } }
	);
