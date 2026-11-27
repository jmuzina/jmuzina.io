import type { TocHeading } from './markdown/heading-anchors';
import { routeFileToPathname } from './sitemap';

export type PostMetadata = {
	title: string;
	/** an ISO string: mdsvex serializes YAML dates */
	date: string;
	/** an ISO string, for a meaningful edit after publishing */
	updated?: string;
	description: string;
	/** a path under static/, for link previews */
	image?: string;
	imageAlt?: string;
	/** not written by authors: added at build time by the heading-anchors plugin */
	headings?: TocHeading[];
};

export type Post = PostMetadata & { path: string };

const REQUIRED_FIELDS = ['title', 'date', 'description'] as const;

// The exact form mdsvex gives an unquoted YAML date. Anything else (a quoted "2026-11-20",
// "Nov 20 2026") would reach the feed, sitemap and post order as-is.
const isIsoDate = (value: unknown) =>
	typeof value === 'string' && !isNaN(Date.parse(value)) && new Date(value).toISOString() === value;

// Thrown at build time, so a post missing what search results and link previews need can't ship.
function validate(file: string, metadata: PostMetadata) {
	for (const field of REQUIRED_FIELDS) {
		if (!metadata[field]) throw new Error(`${file}: frontmatter needs a "${field}"`);
	}
	for (const field of ['date', 'updated'] as const) {
		if (metadata[field] != null && !isIsoDate(metadata[field])) {
			throw new Error(`${file}: frontmatter "${field}" must be an unquoted date, like 2026-11-20`);
		}
	}
	if (metadata.image && !metadata.imageAlt) {
		throw new Error(`${file}: frontmatter needs an "imageAlt" to describe its "image"`);
	}
}

export function toPosts(modules: Record<string, PostMetadata>): Post[] {
	return Object.entries(modules)
		.map(([file, metadata]) => {
			validate(file, metadata);
			return { ...metadata, path: routeFileToPathname(file) };
		})
		.filter((post): post is Post => post.path !== null)
		.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPosts(): Post[] {
	return toPosts(
		import.meta.glob<PostMetadata>('/src/routes/blog/*/+page.md', {
			eager: true,
			import: 'metadata'
		})
	);
}
