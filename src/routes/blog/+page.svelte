<script lang="ts">
	import { Rss } from '@lucide/svelte';
	import { PostList } from '#lib/components/index.ts';
	import { FEED_PATH } from '#lib/feed.ts';
	import { getPosts } from '#lib/posts.ts';
	import { routes } from '#lib/routes.ts';

	const title = 'Blog | Julie Mužina';
	const { description } = routes['/blog'];

	const posts = getPosts();
</script>

<svelte:head>
	<title>{title}</title>
	<meta content={description} name="description" />
	<meta content={title} property="og:title" />
	<meta content={description} property="og:description" />
</svelte:head>

<section aria-labelledby="blog-heading" class="flex flex-col gap-6 max-w-prose">
	<div class="flex flex-col items-start gap-1">
		<h1 class="text-2xl text-primary-600 dark:text-primary-100" id="blog-heading">Blog</h1>
		<a class="inline-flex items-center gap-1" href={FEED_PATH} type="application/atom+xml">
			<Rss aria-hidden="true" size={16} />
			Subscribe
		</a>
	</div>

	{#if posts.length}
		<PostList headingLevel={2} {posts} />
	{:else}
		<p>No posts yet. Check back soon.</p>
	{/if}
</section>
