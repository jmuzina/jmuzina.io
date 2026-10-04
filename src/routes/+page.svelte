<script lang="ts">
	import { Mail } from '@lucide/svelte';
	const title = 'Julie Mužina – Making things a little better';
	const description =
		"Julie Mužina's personal site. Trying to make sense of things, and to make them a little better.";
</script>

<svelte:head>
	<title>{title}</title>
	<meta content={description} name="description" />
	<meta content={title} property="og:title" />
	<meta content={description} property="og:description" />
</svelte:head>

<section
	aria-labelledby="intro-heading"
	class="my-auto flex max-w-none flex-col gap-6 sm:flex-row sm:items-center sm:gap-12"
>
	<img
		alt="Portrait of Julie Mužina"
		class="size-32 shrink-0 rounded-full sm:size-48"
		height="396"
		src="/assets/julie.jpeg"
		width="400"
	/>
	<div>
		<h2 class="mb-4 text-4xl font-bold sm:text-5xl" id="intro-heading">Hi, I'm Julie.</h2>
		<p class="text-xl sm:text-2xl">
			I like making sense of things: how they work, why they are the way they are, and how they
			could be a little better.
		</p>
		<p>
			I started out modding games, found my way to building websites for the communities around
			them, and now write software for a living. Lately I'm getting back into building things just
			for fun, starting with this (a new personal site, from the ground-up!). It's early days, so
			there's more to come.
		</p>
		<!-- Swap to "More about me" (/about) when ready -->
		<a
			class="mt-4 inline-flex items-center gap-2 rounded-full border border-current px-4 py-2 no-underline"
			href="mailto:jmuzina@jmuzina.io"
		>
			<Mail aria-hidden="true" size={18} />
			Say hello
		</a>
	</div>
</section>
