import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [vitePreprocess(), mdsvex({ extensions: ['.md', '.svx'] })],
	kit: {
		adapter: adapter({ precompress: true }),
		prerender: {
			origin: process.env.SITE_ORIGIN || 'https://jmuzina.io'
		}
	}
};

export default config;
