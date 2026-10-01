<script lang="ts">
	import { page } from '$app/state';
	import type { Component } from 'svelte';

	type NavItem = {
		key: string;
		label: string;
		icon: Component;
		href: string;
	};

	const navItems: NavItem[] = [];

	const isHome = $derived(page.url.pathname === '/');
</script>

<div class="relative flex items-center gap-x-4 sm:gap-x-6">
	<img
		alt=""
		class="rounded-full shrink-0 size-16 sm:size-[75px]"
		src="/assets/julie-100.jpeg"
		width="75"
	/>

	<div>
		<h1 class="text-2xl">
			<a
				aria-current={isHome ? 'page' : undefined}
				aria-label={isHome ? undefined : 'Julie Mužina – home'}
				class="text-brand-light dark:text-primary-300 no-underline hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm after:absolute after:inset-0 after:content-['']"
				href="/"
			>
				Julie Mužina
			</a>
		</h1>
		<p>Builder of things</p>
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
	ul a {
		&[aria-current='page'] {
			background: var(--color-secondary-800);
		}
	}
</style>
