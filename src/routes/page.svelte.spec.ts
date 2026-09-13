import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h2', async () => {
		render(Page);

		// tbd if i even need tests for a portfolio website :)
		const headings = page.getByRole('heading', { level: 2 });
		expect(headings.length).toBeGreaterThan(0);
	});
});
