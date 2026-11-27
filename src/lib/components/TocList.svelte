<script lang="ts">
	import type { TocItem } from '#lib/toc.ts';
	import TocList from './TocList.svelte';

	let { items, nested = false }: { items: TocItem[]; nested?: boolean } = $props();
</script>

<ul class={nested ? 'ms-3' : undefined}>
	{#each items as item (item.id)}
		<li>
			<!-- aria-current is set at runtime by BlogPost's scroll script -->
			<a
				class="block border-s-2 border-transparent py-1.5 ps-3 pe-2 text-sm leading-snug no-underline text-surface-700-300 hover:underline aria-[current=true]:border-current aria-[current=true]:text-brand-light dark:aria-[current=true]:text-brand-dark"
				href="#{item.id}"
			>
				{item.text}
			</a>
			{#if item.children.length}
				<TocList items={item.children} nested />
			{/if}
		</li>
	{/each}
</ul>
