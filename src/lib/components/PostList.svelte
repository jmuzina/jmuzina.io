<script lang="ts">
	import { formatPostDate } from '#lib/format.ts';
	import type { Post } from '#lib/posts.ts';

	// The level must follow the page's outline: h2 under the blog's h1, h3 under a section's h2.
	let { posts, headingLevel }: { posts: Post[]; headingLevel: 2 | 3 } = $props();
</script>

<ol class="flex flex-col gap-6">
	{#each posts as post (post.path)}
		<li>
			<article class="flex flex-col gap-1">
				<svelte:element
					this={`h${headingLevel}`}
					class={headingLevel === 2 ? 'text-xl' : 'text-lg'}
				>
					<a href={post.path}>{post.title}</a>
				</svelte:element>
				<time class="text-sm text-surface-600-400" datetime={post.date}>
					{formatPostDate(post.date)}
				</time>
				<p>{post.description}</p>
			</article>
		</li>
	{/each}
</ol>
