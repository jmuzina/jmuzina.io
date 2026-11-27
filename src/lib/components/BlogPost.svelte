<!-- Nothing imports this: mdsvex applies it to every post (svelteOptions in vite.config.ts). -->
<script lang="ts">
	import { page } from '$app/state';
	import { ChevronRight, Rss } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { FEED_PATH } from '#lib/feed.ts';
	import { formatPostDate } from '#lib/format.ts';
	import type { PostMetadata } from '#lib/posts.ts';
	import { blogPostingJsonLd } from '#lib/seo.ts';
	import { buildTocTree, MIN_TOC_HEADINGS } from '#lib/toc.ts';
	import TocList from './TocList.svelte';

	let { children, ...metadata }: PostMetadata & { children: Snippet } = $props();
	const { title, date, updated, description, headings = [] } = $derived(metadata);

	const pageTitle = $derived(`${title} | Julie Mužina`);
	const toc = $derived(buildTocTree(headings));
	const showToc = $derived(headings.length >= MIN_TOC_HEADINGS);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta content={pageTitle} property="og:title" />
	<meta content={description} name="description" />
	<meta content={description} property="og:description" />
	<meta content={date} property="article:published_time" />
	{#if updated}
		<meta content={updated} property="article:modified_time" />
	{/if}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped in blogPostingJsonLd -->
	{@html blogPostingJsonLd({ ...metadata, path: page.url.pathname }, page.url.origin)}
</svelte:head>

<!-- The contents column spans the title and body rows so it starts level with the title and
     stays sticky to the end. -->
<article
	class="lg:grid lg:grid-cols-[minmax(0,65ch)_minmax(12rem,16rem)] lg:justify-between lg:gap-x-12"
>
	<header class="mb-8 flex max-w-prose flex-col gap-2 lg:col-start-1 lg:row-start-1">
		<h1 class="text-3xl text-primary-600 sm:text-4xl dark:text-primary-100">{title}</h1>
		<div class="text-sm text-surface-600-400">
			<time datetime={date}>{formatPostDate(date)}</time>
			{#if updated}
				<span aria-hidden="true">·</span>
				Updated <time datetime={updated}>{formatPostDate(updated)}</time>
			{/if}
		</div>
		<p class="text-lg text-surface-700-300">{description}</p>
	</header>

	{#if showToc}
		<!-- before the body in the DOM, so keyboard users reach the contents first -->
		<aside
			class="hidden tall:lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block tall:lg:max-h-[calc(100svh-4rem)] lg:self-start tall:lg:overflow-y-auto tall:lg:overscroll-contain"
		>
			<nav aria-labelledby="toc-sidebar-label" data-toc>
				<p class="mb-2 ps-3 text-sm font-semibold" id="toc-sidebar-label">On this page</p>
				<TocList items={toc} />
			</nav>
		</aside>

		<!-- native <details>, so it still opens and closes without JS -->
		<nav
			aria-label="On this page"
			class="toc-mobile not-prose -mx-6 mb-6 border-y border-surface-200-800 bg-surface-50-950 px-6 tall:sticky tall:top-0 tall:z-10 lg:hidden"
			data-toc
		>
			<details class="group">
				<summary
					class="flex min-h-[2.75rem] cursor-pointer list-none items-center gap-3 text-sm outline-1 -outline-offset-2 outline-primary-700-300 outline-solid not-focus-visible:outline-hidden [&::-webkit-details-marker]:hidden"
				>
					<span class="flex shrink-0 items-center gap-1 font-semibold">
						On this page
						<ChevronRight
							aria-hidden="true"
							class="transition-[rotate] duration-150 group-open:rotate-90 motion-reduce:transition-none"
							size={16}
						/>
					</span>
					<!-- decorative: the section being read, so the button's name stays "On this page" -->
					<span
						aria-hidden="true"
						class="toc-current truncate text-surface-700-300 group-open:invisible"
					></span>
				</summary>
				<div class="max-h-[60svh] overflow-y-auto overscroll-contain pb-3">
					<TocList items={toc} />
				</div>
			</details>
		</nav>
	{/if}

	<div
		class="prose dark:prose-invert max-w-prose lg:col-start-1 lg:row-start-2 prose-headings:font-semibold prose-headings:scroll-mt-4 prose-a:text-brand-light dark:prose-a:text-brand-dark prose-a:underline-offset-2 prose-a:hover:text-secondary-900 dark:prose-a:hover:text-secondary-100 prose-code:before:content-none prose-code:after:content-none"
	>
		{@render children()}
	</div>

	<footer
		class="mt-12 max-w-prose border-t border-surface-200-800 pt-6 lg:col-start-1 lg:row-start-3"
	>
		<a class="inline-flex items-center gap-1" href={FEED_PATH} type="application/atom+xml">
			<Rss aria-hidden="true" size={16} />
			Subscribe
		</a>
	</footer>

	<!-- Always rendered: screen readers only announce a live region that existed before its text
	     changed (WCAG 4.1.3). -->
	<p
		class="tall:fixed inset-x-0 bottom-6 z-20 mx-auto w-fit rounded-container corner-shape-container bg-surface-950-50 px-4 py-2 text-sm text-surface-50-950 empty:sr-only"
		id="heading-link-status"
		role="status"
	></p>

	<script>
		(function () {
			// No preventDefault: the normal jump puts the #fragment in the address bar too.
			var status = document.getElementById('heading-link-status');
			var timer;
			document.querySelectorAll('.heading-anchor').forEach(function (link) {
				link.addEventListener('click', function () {
					if (!navigator.clipboard) return;
					navigator.clipboard.writeText(link.href).then(
						function () {
							status.textContent = 'Link to section copied';
							clearTimeout(timer);
							timer = setTimeout(function () {
								status.textContent = '';
							}, 3000);
						},
						function () {}
					);
				});
			});

			var tocLinks = Array.prototype.slice.call(document.querySelectorAll('[data-toc] a'));
			if (!tocLinks.length) return;
			var mobile = document.querySelector('.toc-mobile details');
			var summary = mobile && mobile.querySelector('summary');
			var currentLabel = document.querySelector('.toc-current');
			// a mistyped or cut-off link (#100%, #caf%C3) throws, and would stop the wiring below
			function elementForHash(hash) {
				try {
					return document.getElementById(decodeURIComponent(hash.slice(1)));
				} catch (e) {
					return document.getElementById(hash.slice(1));
				}
			}
			var headings = [];
			tocLinks.forEach(function (link) {
				var heading = elementForHash(link.hash);
				if (heading && headings.indexOf(heading) < 0) headings.push(heading);
			});

			// A section you jump to stays current until you scroll yourself. Otherwise a section near
			// the end, which can't scroll to the top, loses to the "scrolled to the bottom" rule below
			// and the last section gets marked instead.
			var pinned = null;
			var pinnedY = null;
			function pinTo(hash) {
				var target = elementForHash(hash);
				pinned = headings.indexOf(target) >= 0 ? target : null;
				pinnedY = null;
				schedule();
			}

			var scheduled = false;
			function update() {
				scheduled = false;
				var current = null;
				if (pinned) {
					// recorded on the first frame after the jump, once the browser has scrolled
					if (pinnedY === null) pinnedY = window.scrollY;
					if (Math.abs(window.scrollY - pinnedY) < 2) current = pinned;
					else pinned = null;
				}
				if (!current) current = sectionAtScrollPosition();

				var label = '';
				tocLinks.forEach(function (link) {
					if (current && link.hash === '#' + encodeURIComponent(current.id)) {
						link.setAttribute('aria-current', 'true');
						label = link.textContent.trim();
					} else link.removeAttribute('aria-current');
				});
				if (currentLabel) currentLabel.textContent = label;
			}
			function sectionAtScrollPosition() {
				// a heading becomes current once it scrolls up to just under the sticky bar (or the top)
				var barBottom =
					summary && summary.offsetParent ? summary.getBoundingClientRect().bottom : 0;
				var line = Math.max(barBottom, 0) + 48;
				var root = document.documentElement;
				var scrollable = root.scrollHeight > window.innerHeight + 2;
				var atBottom = scrollable && window.innerHeight + window.scrollY >= root.scrollHeight - 2;
				if (atBottom) return headings[headings.length - 1];
				var current = null;
				for (var i = 0; i < headings.length; i++) {
					if (headings[i].getBoundingClientRect().top > line) break;
					current = headings[i];
				}
				return current;
			}
			function schedule() {
				if (scheduled) return;
				scheduled = true;
				requestAnimationFrame(update);
			}
			window.addEventListener('scroll', schedule, { passive: true });
			window.addEventListener('resize', schedule);
			// contents entries and heading links; clicking the current #hash again fires no hashchange
			document.addEventListener('click', function (event) {
				var link = event.target.closest && event.target.closest('a[href^="#"]');
				if (link) pinTo(link.hash);
			});
			window.addEventListener('hashchange', function () {
				pinTo(location.hash);
			});
			// a shared #section link: deferred so app.html's jump script has scrolled first
			if (location.hash) pinTo(location.hash);
			else schedule();

			if (!mobile) return;
			function close() {
				mobile.open = false;
			}
			mobile.querySelectorAll('a').forEach(function (link) {
				link.addEventListener('click', close);
			});
			document.addEventListener('click', function (event) {
				if (mobile.open && !mobile.contains(event.target)) close();
			});
			// only while focus is in it, so it can't take another widget's Escape
			document.addEventListener('keydown', function (event) {
				if (event.key !== 'Escape' || !mobile.open) return;
				if (!mobile.contains(document.activeElement)) return;
				close();
				summary.focus();
			});
		})();
	</script>
</article>

<style>
	/* Scroll padding belongs on <html>, which no class in this component can reach. It keeps
	   #fragment jumps and keyboard focus out from under the sticky bar (WCAG 2.4.11). */
	@media (width < 64rem) and (min-height: 32rem) {
		:global(html:has(.toc-mobile)) {
			scroll-padding-block-start: 4rem;
		}
	}
</style>
