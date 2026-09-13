<script lang="ts">
	import favicon from '$lib/assets/favicon.ico';
	import '../app.css';
	import { Navigation } from '$lib/components';

	let { children } = $props();
	const year = $derived(() => new Date().getFullYear());
</script>

<svelte:head>
	<link href={favicon} rel="icon" />
</svelte:head>

<a
	class="text-primary-contrast-950 no-visited-color sr-only focus-within:not-sr-only focus-within:absolute inset-s-2 inset-bs-4 z-10 bg-tertiary-800"
	href="#main-content"
>
	Skip to main content
</a>

<div class="grid grid-rows-[auto_1fr_auto]">
	<header>
		<Navigation />
	</header>
	<div class="container mx-auto">
		<main class="p-4 outline-none" id="main-content" tabindex="-1">
			{@render children()}
		</main>
	</div>
	<footer class="border-t-1 border-t-primary-900-300 pbs-2">
		<div class="footer-container mx-auto flex justify-center text-tertiary-950-50 gap-2">
			<span>© Julie Mužina {year()}</span>
			<a
				class="no-visited-color text-tertiary-950-50"
				href="https://github.com/jmuzina/jmuzina.io"
				target="_blank">Source</a
			>
		</div>
	</footer>
</div>

<style>
	.footer-container > *:not(:last-child)::after {
		content: '•';
		color: var(--text-tertiary-950-50);
		margin-left: calc(var(--spacing) * 2);
	}
</style>
