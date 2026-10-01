<script lang="ts">
	import { Bio, Experience } from '$lib/components';
	const title = 'Julie Mužina – Making things a little better';
	const description =
		'Making things a little better. Software engineer at Canonical, working on accessibility and developer experience.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta content={description} name="description" />
	<meta content={title} property="og:title" />
	<meta content={description} property="og:description" />
</svelte:head>

<section>
	<Bio />
</section>
<section class="lg:col-start-2">
	<Experience />
</section>
