import { defineConfig } from 'vitest/config';
import { defineBrowserCommand, playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineGitInfo, svelteOptions } from './vite.config.ts';

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
	plugins: [tailwindcss(), sveltekit(svelteOptions)],
	test: {
		name: 'client',
		browser: {
			enabled: true,
			provider: playwright(),
			commands: { emulateColorScheme },
			instances: [
				{ browser: 'chromium', headless: true },
				{ browser: 'firefox', headless: true },
				{ browser: 'webkit', headless: true }
			]
		},
		include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
		exclude: ['src/lib/server/**']
	}
});
