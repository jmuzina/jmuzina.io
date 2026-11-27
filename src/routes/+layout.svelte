<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { Breadcrumbs, Footer, Navigation } from '#lib/components/index.ts';
	import { FEED_PATH, FEED_TITLE } from '#lib/feed.ts';
	import { markdownPath } from '#lib/page-markdown.ts';
	import { getPosts } from '#lib/posts.ts';
	import { getSocialImage } from '#lib/seo.ts';

	let { children } = $props();

	// page.url.origin is paths.origin at build time (see vite.config.ts)
	const canonicalUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	// Here, not in the post layout: a page can't override a tag its layout already rendered.
	const post = $derived(getPosts().find(({ path }) => path === page.url.pathname));
	const image = $derived(getSocialImage(post));

	const matomoEnabled = $derived(
		page.url.origin === 'https://jmuzina.io' || page.url.origin === 'https://dev.jmuzina.io'
	);
</script>

<svelte:head>
	<link href="/favicon.ico" rel="icon" sizes="16x16" />
	<link href="/favicon.svg" rel="icon" type="image/svg+xml" />
	<link href="/apple-touch-icon.png" rel="apple-touch-icon" />
	<link href={canonicalUrl} rel="canonical" />
	<link href={FEED_PATH} rel="alternate" title={FEED_TITLE} type="application/atom+xml" />
	<link href={markdownPath(page.url.pathname)} rel="alternate" type="text/markdown" />
	<meta content={canonicalUrl} property="og:url" />
	<meta content={post ? 'article' : 'website'} property="og:type" />
	<meta content={new URL(image.src, page.url.origin).href} property="og:image" />
	<meta content={image.alt} property="og:image:alt" />
	{#if image.type}
		<meta content={image.type} property="og:image:type" />
	{/if}
	{#if image.width && image.height}
		<meta content={String(image.width)} property="og:image:width" />
		<meta content={String(image.height)} property="og:image:height" />
	{/if}
	<meta content={image.large ? 'summary_large_image' : 'summary'} name="twitter:card" />
	{#if matomoEnabled}
		<script>
			var _paq = (window._paq = window._paq || []);
			_paq.push(['disableCookies']);
			_paq.push(['setDoNotTrack', true]);
			_paq.push(['trackPageView']);
			_paq.push(['enableLinkTracking']);
			(function () {
				var host = location.hostname;
				if (host !== 'jmuzina.io' && host !== 'dev.jmuzina.io') return;
				try {
					if (localStorage.getItem('matomo-opt-out') === '1') return;
				} catch (e) {}
				var u = '//jmuzina.io/matomo/';
				_paq.push(['setTrackerUrl', u + 'matomo.php']);
				// 1 = jmuzina.io, 2 = dev.jmuzina.io
				_paq.push(['setSiteId', host === 'jmuzina.io' ? '1' : '2']);
				var d = document,
					g = d.createElement('script'),
					s = d.getElementsByTagName('script')[0];
				g.async = true;
				g.src = u + 'matomo.js';
				s.parentNode.insertBefore(g, s);
			})();
		</script>
		<!-- End Matomo Code -->
	{/if}
</svelte:head>

<a
	class="sr-only focus:not-sr-only focus:absolute inset-s-4 inset-bs-4 z-10 focus:px-4 focus:py-2 bg-surface-50-950 border border-surface-200-800 shadow-lg visited:text-brand-light dark:visited:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2"
	href="#main-content"
>
	Skip to main content
</a>

<div class="flex min-h-svh flex-col">
	<header class="px-6 py-3 lg:px-16 bg-surface-100-900 border-surface-200-800 border-be">
		<div class="container mx-auto">
			<Navigation />
		</div>
	</header>
	<main
		class="outline-none flex grow flex-col w-full px-6 py-8 lg:px-16"
		id="main-content"
		tabindex="-1"
	>
		<div class="container mx-auto flex grow flex-col">
			<Breadcrumbs />
			{@render children()}
		</div>
	</main>
	<div class="px-6 py-6 lg:px-16 bg-surface-100-900 border-surface-200-800 border-bs">
		<div class="container mx-auto">
			<Footer />
		</div>
	</div>
</div>
