import type { TocHeading } from './markdown/heading-anchors';

export type TocItem = TocHeading & { children: TocItem[] };

// A one-entry contents list is just noise.
export const MIN_TOC_HEADINGS = 2;

export function buildTocTree(headings: TocHeading[]): TocItem[] {
	const tree: TocItem[] = [];
	for (const heading of headings) {
		const item: TocItem = { ...heading, children: [] };
		const parent = tree.at(-1);
		if (parent && heading.depth > parent.depth) parent.children.push(item);
		else tree.push(item);
	}
	return tree;
}
