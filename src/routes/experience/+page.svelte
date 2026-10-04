<script lang="ts">
	import { Experience } from '$lib/components';
	const title = 'Experience – Julie Mužina';
	const description =
		'Profesional & Academic history of Julie Mužina (currently a software engineer at Canonical).';
</script>

<svelte:head>
	<title>{title}</title>
	<meta content={description} name="description" />
	<meta content={title} property="og:title" />
	<meta content={description} property="og:description" />
</svelte:head>

<Experience />
