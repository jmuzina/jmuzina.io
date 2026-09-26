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
</script>

<div class="flex flex-wrap gap-x-4 sm:gap-x-8 gap-y-4 items-start">
	<!-- shrink-0 ensures the image never squishes below 100px before wrapping -->
	<img alt="" class="rounded-full shrink-0" src="/assets/julie.jpeg" width="100" />

	<!-- flex-1 takes remaining space, min-w-[220px] forces it to wrap when cramped -->
	<div class="flex-1 min-w-[220px]">
		<a class="text-brand-light dark:text-primary-300" href="/">
			<h1 class="text-2xl">Julie Mužina</h1>
		</a>

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
	a {
		&[aria-current='page'] {
			background: var(--color-secondary-800);
		}
	}
</style>
