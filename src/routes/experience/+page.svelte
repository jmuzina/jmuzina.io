<script lang="ts">
	import { Experience } from '#lib/components/index.ts';
	import { routes } from '#lib/routes.ts';
	const title = 'Experience | Julie Mužina';
	const { description } = routes['/experience'];
</script>

<svelte:head>
	<title>{title}</title>
	<meta content={description} name="description" />
	<meta content={title} property="og:title" />
	<meta content={description} property="og:description" />
</svelte:head>

<!-- The visible "Experience" and "Education" headings are siblings (h2), so name the page itself
     for screen reader and heading navigation without repeating one of them visually. -->
<h1 class="sr-only">Experience and education</h1>
<Experience />
