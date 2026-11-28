<script lang="ts">
	import { page } from '$app/state';
	import { ArrowRight, Mail } from '@lucide/svelte';
	import { PostList } from '#lib/components/index.ts';
	import { currentRole } from '#lib/experience.ts';
	import { getPosts } from '#lib/posts.ts';
	import { personJsonLd } from '#lib/seo.ts';
	import { routes } from '#lib/routes.ts';

	const posts = getPosts();
	const recentPosts = posts.slice(0, 3);

	const title = 'Julie Mužina | Making things a little better';
	const { description } = routes['/'];
</script>

<svelte:head>
	<title>{title}</title>
	<meta content={description} name="description" />
	<meta content={title} property="og:title" />
	<meta content={description} property="og:description" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped in personJsonLd -->
	{@html personJsonLd(page.url.origin)}
</svelte:head>

<div class="my-auto flex flex-col gap-12">
	<section
		aria-labelledby="intro-heading"
		class="flex max-w-none flex-col gap-6 sm:flex-row sm:items-center sm:gap-12"
	>
		<img
			alt="Portrait of Julie Mužina"
			class="size-32 shrink-0 rounded-full sm:size-48"
			height="396"
			src="/assets/julie.jpeg"
			width="400"
		/>
		<div>
			<h1 class="mb-4 text-4xl font-bold sm:text-5xl" id="intro-heading">Hi, I'm Julie.</h1>
			<p class="text-xl sm:text-2xl">
				I like making sense of things: how they work, why they are the way they are, and how they
				could be a little better.
			</p>
			<p>
				I started out modding games, found my way to building websites for the communities around
				them, and now I'm a {currentRole}. Lately I'm getting back into building things just for
				fun, starting with this (a new personal site, from the ground-up!).
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

	{#if recentPosts.length}
		<!-- sm:ps-60 = the portrait (size-48) plus the gap (gap-12), so this lines up with the intro text -->
		<section aria-labelledby="recent-heading" class="flex flex-col gap-4 sm:ps-60">
			<h2 class="text-2xl text-primary-600 dark:text-primary-100" id="recent-heading">
				Recent writing
			</h2>
			<PostList headingLevel={3} posts={recentPosts} />
			{#if posts.length > recentPosts.length}
				<a class="inline-flex items-center gap-1 self-start" href="/blog">
					All posts
					<ArrowRight aria-hidden="true" size={16} />
				</a>
			{/if}
		</section>
	{/if}
</div>
