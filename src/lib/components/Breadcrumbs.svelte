<script lang="ts">
	import { page } from '$app/state';
	import { ChevronRight } from '@lucide/svelte';
	import { buildBreadcrumbs } from '#lib/breadcrumbs.ts';
	import { getRouteLabel } from '#lib/routes.ts';

	const crumbs = $derived(buildBreadcrumbs(page.url.pathname, getRouteLabel));
</script>

{#if crumbs.length}
	<nav aria-label="Breadcrumb" class="mb-6 text-sm">
		<ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
			{#each crumbs as crumb, i (crumb.href)}
				{@const isCurrent = i === crumbs.length - 1}
				<li class="flex items-center gap-x-1.5">
					{#if i > 0}
						<ChevronRight aria-hidden="true" class="shrink-0 text-surface-600-400" size={14} />
					{/if}
					<a
						aria-current={isCurrent ? 'page' : undefined}
						class={isCurrent ? 'text-surface-700-300 visited:text-surface-700-300' : undefined}
						href={crumb.href}
					>
						{crumb.label}
					</a>
				</li>
			{/each}
		</ol>
	</nav>
{/if}
