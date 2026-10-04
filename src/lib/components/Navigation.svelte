<script lang="ts">
	import { page } from '$app/state';
	import { Briefcase } from '@lucide/svelte';
	import type { Component } from 'svelte';

	type NavItem = {
		key: string;
		label: string;
		icon: Component;
		href: string;
	};

	const navItems: NavItem[] = [
		{ key: 'experience', label: 'Experience', icon: Briefcase, href: '/experience' }
	];

	const isHome = $derived(page.url.pathname === '/');
</script>

<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
	<div class="relative flex items-center gap-x-3">
		<!-- homepage already shows the portrait -->
		{#if !isHome}
			<img alt="" class="size-10 shrink-0 rounded-full" src="/assets/julie-100.jpeg" width="40" />
		{/if}
		<h1 class="text-xl">
			<a
				aria-current={isHome ? 'page' : undefined}
				aria-label={isHome ? undefined : 'Julie Mužina – home'}
				class="text-brand-light dark:text-primary-300 no-underline hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm after:absolute after:inset-0 after:content-['']"
				href="/"
			>
				Julie Mužina
			</a>
		</h1>
	</div>

	{#if navItems.length}
		<nav aria-label="Main">
			<ul class="flex items-center gap-x-2">
				{#each navItems as navItem (navItem.key)}
					<li>
						<a
							class="flex items-center gap-1.5 px-3 py-1.5 no-underline"
							href={navItem.href}
							aria-current={navItem.href === page.url.pathname ? 'page' : undefined}
						>
							<navItem.icon aria-hidden="true" size={16} />
							<span>{navItem.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</div>

<style>
	ul a[aria-current='page'] {
		text-decoration: underline;
		text-underline-offset: 0.35em;
		text-decoration-thickness: 2px;
	}
</style>
