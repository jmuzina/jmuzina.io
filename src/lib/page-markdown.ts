import { fromHtml } from 'hast-util-from-html';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import { formatPostDate } from './format';
import type { Post } from './posts';

// The llms.txt convention: the page URL plus .md, and index.html.md for a directory URL.
export const markdownPath = (pathname: string) =>
	pathname === '/' ? '/index.html.md' : `${pathname}.md`;

export const pathnameFromMarkdownParam = (param: string) =>
	param === 'index.html' ? '/' : `/${param}`;

type HastNode = {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
};

// comments are Svelte's hydration markers
const isNoise = (node: HastNode) =>
	node.type === 'comment' ||
	['script', 'style', 'svg'].includes(node.tagName ?? '') ||
	node.properties?.ariaHidden === 'true';

function clean(node: HastNode): HastNode {
	if (!node.children) return node;
	return { ...node, children: node.children.filter((child) => !isNoise(child)).map(clean) };
}

function findMain(node: HastNode): HastNode | undefined {
	if (node.tagName === 'main') return node;
	for (const child of node.children ?? []) {
		const main = findMain(child);
		if (main) return main;
	}
}

export function htmlToMarkdown(html: string): string {
	const main = findMain(fromHtml(html) as HastNode);
	if (!main) throw new Error('page has no <main>');
	const root = { type: 'root', children: clean(main).children };
	return toMarkdown(toMdast(root as Parameters<typeof toMdast>[0]), { bullet: '-' });
}

// From the post's own source: the author's Markdown, rather than a round trip through HTML.
export function postToMarkdown(post: Post, source: string): string {
	const body = source
		.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
		// Svelte's blocks start a line; ones in code fences or inline code are examples to keep.
		.replace(
			/^ {0,3}((`|~)\2{2,})[\s\S]*?^ {0,3}\1\2*[ \t]*$|^ {0,3}<(script|style)\b[\s\S]*?<\/\3>\s*/gm,
			(match, fence) => (fence ? match : '')
		)
		.trim();
	const dates = post.updated
		? `Published ${formatPostDate(post.date)}. Updated ${formatPostDate(post.updated)}.`
		: `Published ${formatPostDate(post.date)}.`;
	return `# ${post.title}\n\n${dates}\n\n${post.description}\n\n${body}\n`;
}
