/**
 * Converts a route file path (e.g. `/src/routes/(group)/privacy/+page.svelte`) to its URL pathname.
 * Returns null for dynamic routes, which can't be listed without knowing their params.
 */
export function routeFileToPathname(file: string): string | null {
	const segments = file
		.replace(/^\/?src\/routes/, '')
		.split('/')
		.slice(0, -1) // drop the +page.svelte filename
		.filter((segment) => segment && !/^\(.+\)$/.test(segment)); // drop route groups

	if (segments.some((segment) => segment.includes('['))) return null;
	return '/' + segments.join('/');
}

/** Pathnames of every static page route in the app, sorted. */
export function getPagePathnames(): string[] {
	const files = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'));
	return files
		.map(routeFileToPathname)
		.filter((pathname): pathname is string => pathname !== null)
		.sort();
}

const escapeXml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

export function buildSitemap(origin: string, pathnames: string[]): string {
	const urls = pathnames
		.map(
			(pathname) => `\t<url>\n\t\t<loc>${escapeXml(new URL(pathname, origin).href)}</loc>\n\t</url>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
