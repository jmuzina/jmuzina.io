<script lang="ts">
	import { page } from '$app/state';
	import { Menu, X } from '@lucide/svelte';
	import { getAriaCurrent, navRoutes } from '#lib/routes.ts';
	import JmMark from './JmMark.svelte';

	const isHome = $derived(page.url.pathname === '/');
</script>

<div class="flex flex-wrap items-center gap-x-6 gap-y-2">
	<div class="relative flex items-center gap-x-3">
		<!-- decorative: the name link beside it carries the accessible label -->
		<JmMark class="size-10 shrink-0" />
		<!-- not an <h1>: each page's own <h1> must name it, not the site name repeated everywhere -->
		<div class="text-xl">
			<a
				aria-current={isHome ? 'page' : undefined}
				aria-label={isHome ? undefined : 'Julie Mužina | home'}
				class="no-underline hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm after:absolute after:inset-0 after:content-['']"
				href="/"
			>
				Julie Mužina
			</a>
		</div>
	</div>

	{#if navRoutes.length}
		<!-- csr is off, so the inline script below drives this. Without JS it stays hidden and the
		     links show. -->
		<button
			aria-controls="main-nav"
			aria-expanded="false"
			class="peer group ml-auto hidden js:max-md:inline-flex cursor-pointer rounded-md p-2.5 text-brand-light dark:text-brand-dark hover:text-secondary-900 dark:hover:text-secondary-100 outline-solid outline-1 outline-offset-1 outline-primary-700-300 not-focus-visible:outline-hidden"
			id="nav-toggle"
			type="button"
		>
			<Menu aria-hidden="true" class="group-aria-expanded:hidden" size={24} />
			<X aria-hidden="true" class="hidden group-aria-expanded:block" size={24} />
			<span class="sr-only">Menu</span>
		</button>

		<!-- hidden via the toggle's own aria-expanded, so what's shown and what assistive tech is
		     told can't drift apart -->
		<nav
			aria-label="Main"
			class="w-full md:w-auto js:max-md:peer-aria-[expanded=false]:hidden"
			id="main-nav"
		>
			<ul class="flex flex-col gap-y-1 md:flex-row md:items-center md:gap-x-2">
				{#each navRoutes as navRoute (navRoute.href)}
					<li>
						<!-- an ::after bar, because text-decoration can't underline the icon -->
						<a
							aria-current={getAriaCurrent(navRoute.href, page.url.pathname)}
							class="relative inline-flex items-center gap-1.5 px-3 py-1.5 no-underline after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 aria-[current]:after:bg-current"
							href={navRoute.href}
						>
							{#if navRoute.icon}
								<navRoute.icon aria-hidden="true" size={16} />
							{/if}
							<span>{navRoute.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<script>
			(function () {
				var button = document.getElementById('nav-toggle');
				var nav = document.getElementById('main-nav');
				var isOpen = function () {
					return button.getAttribute('aria-expanded') === 'true';
				};

				button.addEventListener('click', function () {
					button.setAttribute('aria-expanded', String(!isOpen()));
				});

				// Escape closes the menu, but only while focus is in it, so it can't steal focus
				// (or another widget's Escape) from elsewhere on the page.
				document.addEventListener('keydown', function (event) {
					if (event.key !== 'Escape' || !isOpen()) return;
					if (!button.contains(event.target) && !nav.contains(event.target)) return;
					button.setAttribute('aria-expanded', 'false');
					button.focus();
				});
			})();
		</script>
	{/if}
</div>
