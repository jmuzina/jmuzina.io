import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ precompress: true }),
		prerender: {
			origin: process.env.SITE_ORIGIN || 'https://jmuzina.io'
		}
	}
};

export default config;
