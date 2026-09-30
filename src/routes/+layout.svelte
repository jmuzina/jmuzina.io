<script lang="ts">
	import favicon from '$lib/assets/favicon.ico';
	import '../app.css';
	import { page } from '$app/state';
	import { Footer, Navigation } from '$lib/components';

	let { children } = $props();

	// page.url.origin is kit.prerender.origin at build time (see svelte.config.js)
	const canonicalUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	const ogImageUrl = $derived(new URL('/assets/julie-100.jpeg', page.url.origin).href);

	const matomoSiteId = $derived.by(() => {
		if (page.url.origin === 'https://jmuzina.io') return '1';
		if (page.url.origin === 'https://dev.jmuzina.io') return '2';
		return null;
	});
</script>

<svelte:head>
	<link href={favicon} rel="icon" />
	<link href={canonicalUrl} rel="canonical" />
	<meta content={canonicalUrl} property="og:url" />
	<meta content={ogImageUrl} property="og:image" />
	{#if matomoSiteId}
		<script data-matomo-site-id={matomoSiteId}>
			var _paq = (window._paq = window._paq || []);
			_paq.push(['disableCookies']);
			_paq.push(['setDoNotTrack', true]);
			_paq.push(['trackPageView']);
			_paq.push(['enableLinkTracking']);
			(function () {
				var u = '//jmuzina.io/matomo/';
				_paq.push(['setTrackerUrl', u + 'matomo.php']);
				_paq.push(['setSiteId', document.currentScript.dataset.matomoSiteId]);
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
	class="text-primary-contrast-950 no-visited-color sr-only focus-within:not-sr-only focus-within:absolute inset-s-2 inset-bs-4 z-10 bg-surface-800"
	href="#main-content"
>
	Skip to main content
</a>

<div
	class="grid md:h-screen grid-cols-1 lg:grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] lg:grid-rows-[1fr_auto]"
>
	<header
		class="p-8 bg-surface-100-900 border-surface-200-800 border-be lg:border-be-0 lg:border-e"
	>
		<Navigation />
	</header>
	<main
		class="outline-none overflow-auto min-h-0 row-span-2 w-full p-8 lg:px-16"
		id="main-content"
		tabindex="-1"
	>
		<div class="container">
			{@render children()}
		</div>
	</main>
	<div
		class="p-8 lg:pbs-0 bg-surface-100-900 border-surface-200-800 border-bs lg:border-bs-0 lg:border-e"
	>
		<Footer />
	</div>
</div>
