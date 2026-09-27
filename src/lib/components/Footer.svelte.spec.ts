import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Footer from './Footer.svelte';
import { commitDate, commitSha, shortSha, githubRepoUrl } from '$lib/build-info';

describe('Footer.svelte', () => {
	it('should render social navigation links', async () => {
		render(Footer);

		expect(page.getByRole('link', { name: 'GitHub' })).toBeDefined();
		expect(page.getByRole('link', { name: 'LinkedIn' })).toBeDefined();
		expect(page.getByRole('link', { name: 'Email' })).toBeDefined();
	});

	it('should render last updated info and commit link', async () => {
		render(Footer);

		if (commitSha) {
			const commitLink = page.getByRole('link', { name: `Commit ${shortSha} on GitHub` });
			expect(commitLink).toBeDefined();
			expect(commitLink.element().getAttribute('href')).toBe(
				`${githubRepoUrl}/commit/${commitSha}`
			);
		}

		if (commitDate) {
			expect(page.getByText('Last updated')).toBeDefined();
		}
	});
});
