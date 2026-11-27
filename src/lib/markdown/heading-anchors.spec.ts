import { describe, expect, it } from 'vitest';
import { headingAnchors, slugify } from './heading-anchors';

type Node = Parameters<ReturnType<typeof headingAnchors>>[0];

const text = (value: string): Node => ({ type: 'text', value });
const el = (tagName: string, children: Node[], properties = {}): Node => ({
	type: 'element',
	tagName,
	properties,
	children
});
const run = (...children: Node[]) => {
	const tree: Node = { type: 'root', children };
	headingAnchors()(tree);
	return tree.children!;
};

describe('slugify', () => {
	it('lowercases, strips punctuation and accents, and hyphenates', () => {
		expect(slugify('Héllo, World!')).toBe('hello-world');
		expect(slugify('  Two   spaces -- and dashes ')).toBe('two-spaces-and-dashes');
		expect(slugify('`code` in a heading')).toBe('code-in-a-heading');
	});
});

describe('headingAnchors', () => {
	it('wraps heading text in a link to its own fragment, with a hidden # cue', () => {
		const [h2] = run(el('h2', [text('Getting started')]));
		expect(h2.properties?.id).toBe('getting-started');

		const [link] = h2.children!;
		expect(link.tagName).toBe('a');
		expect(link.properties).toMatchObject({
			href: '#getting-started',
			className: expect.arrayContaining(['heading-anchor', 'not-prose'])
		});
		expect(link.children![0]).toEqual(text('Getting started'));
		expect(link.children![1].properties).toMatchObject({ ariaHidden: 'true' });
	});

	it('covers h2 to h6 but leaves h1 (the post title) alone', () => {
		const nodes = run(el('h1', [text('Title')]), el('h6', [text('Deep')]));
		expect(nodes[0].properties?.id).toBeUndefined();
		expect(nodes[1].properties?.id).toBe('deep');
	});

	it('finds nested headings', () => {
		const [section] = run(el('section', [el('h3', [text('Inside')])]));
		expect(section.children![0].properties?.id).toBe('inside');
	});

	it('gives repeated headings unique ids', () => {
		const ids = run(
			el('h2', [text('Notes')]),
			el('h2', [text('Notes')]),
			el('h3', [text('!!')])
		).map((h) => h.properties?.id);
		expect(ids).toEqual(['notes', 'notes-1', 'section']);
	});

	it('never reuses an id, even when a suffixed one matches a later heading', () => {
		const ids = run(
			el('h2', [text('Example')]),
			el('h2', [text('Example')]),
			el('h2', [text('Example 1')])
		).map((h) => h.properties?.id);
		expect(ids).toEqual(['example', 'example-1', 'example-1-1']);
	});

	it('does not generate an id that a later heading already has', () => {
		const ids = run(el('h2', [text('Setup')]), el('h2', [text('Other')], { id: 'setup' })).map(
			(h) => h.properties?.id
		);
		expect(ids).toEqual(['setup-1', 'setup']);
	});

	it('keeps an existing id', () => {
		const [h2] = run(el('h2', [text('Custom')], { id: 'my-id' }));
		expect(h2.properties?.id).toBe('my-id');
		expect(h2.children![0].properties?.href).toBe('#my-id');
	});

	it('does not nest links: headings containing a link only get an id', () => {
		const inner = el('a', [text('Svelte')], { href: 'https://svelte.dev' });
		const [h2] = run(el('h2', [text('Why '), inner]));
		expect(h2.properties?.id).toBe('why-svelte');
		expect(h2.children).toEqual([text('Why '), inner]);
	});

	it('collects h2 and h3 headings (without the # cue) for the table of contents', () => {
		const tree: Node = {
			type: 'root',
			children: [
				el('h2', [text('Intro')]),
				el('h3', [text('Detail')]),
				el('h4', [text('Too deep')])
			]
		};
		const file: { data: { fm?: Record<string, unknown> } } = { data: { fm: { title: 'Post' } } };
		headingAnchors()(tree, file);
		expect(file.data.fm).toEqual({
			title: 'Post',
			headings: [
				{ depth: 2, id: 'intro', text: 'Intro' },
				{ depth: 3, id: 'detail', text: 'Detail' }
			]
		});
	});

	it('creates the frontmatter when a post has none', () => {
		const file: { data: { fm?: Record<string, unknown> } } = { data: {} };
		headingAnchors()({ type: 'root', children: [el('h2', [text('Only')])] }, file);
		expect(file.data.fm?.headings).toEqual([{ depth: 2, id: 'only', text: 'Only' }]);
	});
});
