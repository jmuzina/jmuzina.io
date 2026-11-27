/*
 * The heading's own text is the link (as on MDN) rather than a separate "link to section" icon,
 * so screen readers' heading lists keep the plain heading text, and the target is large.
 * Hand-rolled instead of rehype-slug/autolink-headings, which clash with mdsvex 0.12's old unified.
 */

type HastNode = {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
	value?: string;
};

const HEADING = /^h[2-6]$/;

// Tailwind scans this file, so these classes are generated. `not-prose` stops typography from
// coloring the link like body links.
const LINK_CLASSES = [
	'heading-anchor',
	'group',
	'not-prose',
	'text-inherit',
	'no-underline',
	'hover:underline',
	'decoration-2',
	'underline-offset-4'
];
// Touch screens can't hover, so the # cue would never appear there without the media query.
const ICON_CLASSES = [
	'ms-1.5',
	'text-brand-light',
	'dark:text-brand-dark',
	'opacity-0',
	'group-hover:opacity-100',
	'group-focus-visible:opacity-100',
	'in-target:opacity-100',
	'[@media(hover:none)]:opacity-100'
];

const textOf = (node: HastNode): string =>
	node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('');

const containsLink = (node: HastNode): boolean =>
	node.tagName === 'a' || (node.children ?? []).some(containsLink);

export function slugify(text: string): string {
	return text
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/[\s-]+/g, '-');
}

export type TocHeading = { depth: number; id: string; text: string };

// h4+ would make the contents list too long to scan.
const TOC_DEPTHS = new Set([2, 3]);

type VFile = { data: { fm?: Record<string, unknown> } };

export function headingAnchors() {
	return (tree: HastNode, file?: VFile) => {
		// mdsvex hands `file.data.fm` to the layout as props (and exports it as `metadata`), so
		// writing here is how the table of contents gets its headings.
		const headings: TocHeading[] = [];
		if (file) {
			file.data.fm ??= {};
			file.data.fm.headings = headings;
		}

		// Per document: repeated headings get -1, -2… Checked against every id issued, since a
		// suffixed id can equal another heading's plain slug ("Example" twice, then "Example 1").
		const used = new Set<string>();
		const uniqueId = (text: string) => {
			const base = slugify(text) || 'section';
			let id = base;
			for (let n = 1; used.has(id); n++) id = `${base}-${n}`;
			used.add(id);
			return id;
		};

		const anchor = (heading: HastNode) => {
			heading.properties ??= {};
			const text = textOf(heading).trim();
			const id = (heading.properties.id as string | undefined) ?? uniqueId(text);
			heading.properties.id = id;

			const depth = Number(heading.tagName!.slice(1));
			if (TOC_DEPTHS.has(depth)) headings.push({ depth, id, text });

			if (containsLink(heading)) return;

			heading.children = [
				{
					type: 'element',
					tagName: 'a',
					properties: { href: `#${id}`, className: LINK_CLASSES },
					children: [
						...(heading.children ?? []),
						{
							type: 'element',
							tagName: 'span',
							properties: { ariaHidden: 'true', className: ICON_CLASSES },
							children: [{ type: 'text', value: '#' }]
						}
					]
				}
			];
		};

		const found: HastNode[] = [];
		const visit = (node: HastNode) => {
			for (const child of node.children ?? []) {
				if (child.type === 'element' && HEADING.test(child.tagName ?? '')) found.push(child);
				else visit(child);
			}
		};
		visit(tree);
		// before any are generated, so a heading earlier in the post can't take a later one's id
		for (const heading of found) {
			if (typeof heading.properties?.id === 'string') used.add(heading.properties.id);
		}
		found.forEach(anchor);
	};
}
