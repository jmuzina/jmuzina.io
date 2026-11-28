<script lang="ts">
	import { Experience } from '#lib/components/index.ts';
	const title = 'Experience | Julie Mužina';
	const description =
		'Professional & Academic history of Julie Mužina (currently a software engineer at Canonical).';
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
