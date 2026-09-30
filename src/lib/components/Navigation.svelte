<script lang="ts">
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import { HouseHeart, MapPin } from '@lucide/svelte';

	type NavItem = {
		key: string;
		label: string;
		icon: Component;
		href: string;
	};

	const navItems: NavItem[] = [];

	const isHome = $derived(page.url.pathname === '/');
</script>

<div class="flex flex-col gap-y-4 items-start">
	<!-- photo + name form a single home link (logo pattern) -->
	<a
		aria-current={isHome ? 'page' : undefined}
		aria-label={isHome ? undefined : 'Julie Mužina – home'}
		class="group flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-8 text-brand-light dark:text-primary-300 focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
		href="/"
	>
		<!-- shrink-0 ensures the image never squishes below 100px -->
		<img alt="" class="rounded-full shrink-0" src="/assets/julie.jpeg" width="100" />
		<h1 class="text-2xl group-hover:underline group-focus-visible:underline">Julie Mužina</h1>
	</a>

	<div>
		<p>Builder of things</p>

		<div class="flex flex-col sm:flex-row gap-x-4 gap-y-0.5 text-sm text-primary-950-50 mt-2">
			<div class="flex items-center gap-1">
				<MapPin class="text-current" size="16" />
				New York
			</div>
			<div class="flex items-center gap-1">
				<HouseHeart size="16" />
				Cleveland
			</div>
		</div>
	</div>
</div>

{#if navItems.length}
	<ul class="mr-auto">
		{#each navItems as navItem (navItem.key)}
			<li>
				<a
					class="text-primary-50-950 flex items-center gap-1 px-2 py-2"
					href={navItem.href}
					aria-current={navItem.href === page.url.pathname ? 'page' : undefined}
				>
					<navItem.icon size="sm" />
					<span class="">{navItem.label}</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	@reference "tailwindcss";
	ul a {
		&[aria-current='page'] {
			background: var(--color-secondary-800);
		}
	}
</style>
