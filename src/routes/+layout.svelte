<script lang="ts">
	import favicon from '$lib/assets/favicon.ico';
	import '../app.css';
	import { page } from '$app/state';
	import { Footer, Navigation } from '$lib/components';

	let { children } = $props();

	// page.url.origin is kit.prerender.origin at build time (see svelte.config.js)
	const canonicalUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	const ogImageUrl = $derived(new URL('/assets/julie.jpeg', page.url.origin).href);
</script>

<svelte:head>
	<link href={favicon} rel="icon" />
	<link href={canonicalUrl} rel="canonical" />
	<meta content={canonicalUrl} property="og:url" />
	<meta content={ogImageUrl} property="og:image" />
</svelte:head>

<a
	class="text-primary-contrast-950 no-visited-color sr-only focus-within:not-sr-only focus-within:absolute inset-s-2 inset-bs-4 z-10 bg-surface-800"
	href="#main-content"
>
	Skip to main content
</a>

<div
	class="grid md:h-screen grid-cols-1 lg:grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] lg:grid-rows-[1fr_auto] gap-x-32 gap-y-8 p-8"
>
	<header>
		<Navigation />
	</header>
	<main
		class="outline-none overflow-auto min-h-0 row-span-2 w-full"
		id="main-content"
		tabindex="-1"
	>
		<div class="container">
			{@render children()}
		</div>
	</main>
	<Footer />
</div>
