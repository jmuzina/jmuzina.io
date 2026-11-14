import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Footer from './Footer.svelte';
import { commitDate, commitSha, shortSha, githubRepoUrl } from '#lib/build-info.ts';

describe('Footer.svelte', () => {
	it('should render social navigation links', async () => {
		render(Footer);

		expect(page.getByRole('link', { name: 'GitHub' })).toBeDefined();
		expect(page.getByRole('link', { name: 'LinkedIn' })).toBeDefined();
		expect(page.getByRole('link', { name: 'Email' })).toBeDefined();
	});

	it('should link to the privacy page', async () => {
		render(Footer);

		// phones get a shield icon, wider screens the word; both are rendered (no CSS in tests)
		const privacyLinks = page.getByRole('link', { name: 'Privacy' }).elements();
		expect(privacyLinks).toHaveLength(2);
		for (const link of privacyLinks) expect(link.getAttribute('href')).toBe('/privacy');
	});

	it('should credit the logo designer', async () => {
		render(Footer);

		const creditLink = page.getByRole('link', { name: 'Diana Mužina' });
		expect(creditLink.element().getAttribute('href')).toBe('https://dianamuzina.com');
		// first and last name must stay separated (\s also matches the &nbsp; used here)
		expect(creditLink.element().textContent?.replace(/\s+/g, ' ')).toBe('Diana Mužina');
	});

	it('should render last updated info and commit link', async () => {
		render(Footer);

		if (commitSha) {
			// phones (date) and wider screens (short SHA) each render their own commit link;
			// Tailwind isn't loaded in component tests, so check both rather than visibility
			const commitLinks = document.querySelectorAll(
				`a[href="${githubRepoUrl}/commit/${commitSha}"]`
			);
			expect(commitLinks).toHaveLength(2);
			expect(page.getByRole('link', { name: `Commit ${shortSha} on GitHub` })).toBeDefined();
		}

		if (commitDate) {
			expect(page.getByText('Updated')).toBeDefined();
		}
	});
});
