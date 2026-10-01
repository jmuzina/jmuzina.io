import { defineConfig } from 'vitest/config';
import { defineBrowserCommand, playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineGitInfo } from './vite.config';

/**
 * Testing helper that lets tests change color scheme
 * Mimics users changing their preferred color scheme
 */
const emulateColorScheme = defineBrowserCommand<['light' | 'dark']>(
	async ({ page }, colorScheme) => {
		await page.emulateMedia({ colorScheme });
	}
);

export default defineConfig({
	define: defineGitInfo,
	plugins: [tailwindcss(), sveltekit()],
	test: {
		name: 'client',
		browser: {
			enabled: true,
			provider: playwright(),
			commands: { emulateColorScheme },
			instances: [
				{
					browser: 'chromium',
					headless: true
				}
			]
		},
		include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
		exclude: ['src/lib/server/**']
	}
});
