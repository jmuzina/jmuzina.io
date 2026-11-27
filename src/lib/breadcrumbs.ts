export type Crumb = { href: string; label: string };

// Shallower pages are already in the main nav; one crumb would just repeat it.
export const MIN_BREADCRUMB_DEPTH = 2;

const humanize = (segment: string) => {
	const words = decodeURIComponent(segment).replace(/[-_]+/g, ' ').trim();
	return words.charAt(0).toUpperCase() + words.slice(1);
};

export function buildBreadcrumbs(
	pathname: string,
	getLabel: (href: string) => string | undefined
): Crumb[] {
	const segments = pathname.split('/').filter(Boolean);
	if (segments.length < MIN_BREADCRUMB_DEPTH) return [];

	const hrefs = ['/', ...segments.map((_, i) => `/${segments.slice(0, i + 1).join('/')}`)];
	return hrefs.map((href, i) => ({
		href,
		label: getLabel(href) ?? (i === 0 ? 'Home' : humanize(segments[i - 1]))
	}));
}
