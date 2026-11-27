import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Example, { metadata } from './test-fixtures/example.md';

// Guards the mdsvex wiring in vite.config.ts (svelteOptions), which a dependency merge once dropped.
describe('mdsvex', () => {
	it('exposes frontmatter as metadata', () => {
		expect(metadata.title).toBe('Example post');
	});

	it('adds the heading list for the table of contents', () => {
		expect(metadata.headings).toEqual([
			{ depth: 2, id: 'getting-started', text: 'Getting started' }
		]);
	});

	it('renders markdown, script expressions and highlighted code', () => {
		const { body } = render(Example);
		expect(body).toContain('<strong>bold</strong>');
		expect(body).toContain('the answer is 42');
		expect(body).toMatch(/<pre class="language-ts">/);
		expect(body).toContain('<span class="token keyword">const</span>');
	});

	it('links headings to their own fragment', () => {
		const { body } = render(Example);
		expect(body).toMatch(
			/<h2 id="getting-started"><a href="#getting-started" class="heading-anchor [^"]*">Getting started<span aria-hidden="true" class="[^"]*">#<\/span><\/a><\/h2>/
		);
	});
});
