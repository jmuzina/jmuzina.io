import { describe, expect, it } from 'vitest';
import { buildTocTree } from './toc';

const h = (depth: number, id: string) => ({ depth, id, text: id });

describe('buildTocTree', () => {
	it('nests each h3 under the h2 before it', () => {
		const tree = buildTocTree([h(2, 'a'), h(3, 'a1'), h(3, 'a2'), h(2, 'b')]);
		expect(tree.map((item) => [item.id, item.children.map((child) => child.id)])).toEqual([
			['a', ['a1', 'a2']],
			['b', []]
		]);
	});

	it('keeps an h3 with no preceding h2 at the top level', () => {
		expect(buildTocTree([h(3, 'intro'), h(2, 'a')]).map((item) => item.id)).toEqual(['intro', 'a']);
	});

	it('is empty for a post without headings', () => {
		expect(buildTocTree([])).toEqual([]);
	});
});
