import { expect, test } from '@playwright/test';

const OPT_OUT_KEY = 'matomo-opt-out';

test('analytics opt-out persists across reloads and can be undone', async ({ page }) => {
	await page.goto('/privacy');
	const checkbox = page.getByLabel('Do not record my visits');
	await expect(checkbox).not.toBeChecked();

	// opting out reloads the page so an already-loaded tracker is dropped
	await Promise.all([page.waitForEvent('load'), checkbox.click()]);
	await expect(checkbox).toBeChecked();
	expect(await page.evaluate((key) => localStorage.getItem(key), OPT_OUT_KEY)).toBe('1');

	await checkbox.click();
	await expect(checkbox).not.toBeChecked();
	expect(await page.evaluate((key) => localStorage.getItem(key), OPT_OUT_KEY)).toBeNull();
});

test(
	'without JavaScript it explains that nothing is tracked',
	{ tag: '@no-js' },
	async ({ page }) => {
		await page.goto('/privacy');
		// getByText never matches inside <noscript>, so target the rendered paragraph directly
		const message = page.locator('#opt-out noscript p');
		await expect(message).toBeVisible();
		await expect(message).toContainText('JavaScript is disabled, so no analytics');
		await expect(page.getByLabel('Do not record my visits')).toBeHidden();
	}
);
