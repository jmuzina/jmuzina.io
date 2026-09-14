import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		vitePreprocess(),
		// 3. Add mdsvex to the preprocessor pipeline
		mdsvex({
			extensions: ['.md', '.svx']
		})
	],
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()]
});
