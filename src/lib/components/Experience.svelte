<script lang="ts">
	import { MapPin } from '@lucide/svelte';
	import { educations, jobs } from '#lib/experience.ts';
</script>

<!-- Master grid container wrapping both sections -->
<div class="grid sm:grid-cols-[auto_1fr]">
	<section class="col-span-full grid grid-cols-subgrid mbe-2">
		<h2 class="col-span-full text-2xl text-primary-600 dark:text-primary-100">Experience</h2>
		<ul
			class="col-span-full grid grid-cols-subgrid border-s-1 border-s-gray-500 dark:border-s-gray-600 ms-0.5"
		>
			{#each jobs as job, i (i)}
				<li
					class="grid grid-cols-subgrid col-span-full gap-x-8 ms-4 border-bs-gray-300 dark:border-bs-gray-700 not-first:border-bs-1 not-first:pbs-2"
				>
					<div class="col-start-1 text-gray-500 dark:text-gray-300">
						{job.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
						- {job.endDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) ||
							'Present'}
					</div>
					<div class="col-start-2">
						<h3>
							{job.title} at
							{#if job.websiteUrl}
								<a href={job.websiteUrl} target="_blank" rel="noopener"> {job.company}</a>
							{:else}
								{job.company}
							{/if}
						</h3>
						<p class="inline-flex items-center gap-1 text-gray-500 dark:text-gray-300 text-sm">
							<MapPin class="text-current" size="12" />
							{job.location}
						</p>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<p>{@html job.description}</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<section class="col-span-full grid grid-cols-subgrid mt-8">
		<h2 class="col-span-full text-2xl text-primary-600 dark:text-primary-100">Education</h2>
		<ul
			class="col-span-full grid grid-cols-subgrid border-s-1 border-s-gray-500 dark:border-s-gray-600 ms-0.5"
		>
			{#each educations as education, i (i)}
				<li
					class="grid grid-cols-subgrid col-span-full gap-x-8 ms-4 border-bs-gray-300 dark:border-bs-gray-700 not-first:border-bs-1 not-first:pbs-2"
				>
					<div class="col-start-1 text-gray-500 dark:text-gray-300">
						{education.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
						- {education.endDate?.toLocaleDateString('en-US', {
							month: 'short',
							year: 'numeric'
						}) || 'Present'}
					</div>
					<div class="col-start-2">
						<h3>
							{education.program} from
							{#if education.websiteUrl}
								<a href={education.websiteUrl} target="_blank" rel="noopener">
									{education.institution}
								</a>
							{:else}
								{education.institution}
							{/if}
						</h3>
						<p class="inline-flex items-center gap-1 text-gray-500 dark:text-gray-300 text-sm">
							<MapPin class="text-current" size="12" />
							{education.location}
						</p>
						<fieldset>
							<legend class="text-gray-500 dark:text-gray-300 text-sm">Honors</legend>
							{#if education.honors}
								<p>{education.honors}</p>
							{/if}
							<legend class="text-gray-500 dark:text-gray-300 text-sm">GPA</legend>
							<p>{education.grade}</p>
						</fieldset>
					</div>
				</li>
			{/each}
		</ul>
	</section>
</div>
