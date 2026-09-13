<script lang="ts">
	import { MapPin } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	type Job = {
		company: string;
		title: string;
		location: string;
		websiteUrl?: string;
		startDate: Date;
		endDate?: Date;
		description: string | Snippet;
	};
	type Education = {
		institution: string;
		location: string;
		websiteUrl?: string;
		program: string;
		startDate: Date;
		endDate?: Date;
		grade: string;
		honors?: string;
	};
	const jobs: Job[] = [
		{
			company: 'Canonical',
			title: 'Software Engineer',
			websiteUrl: 'https://canonical.com',
			location: 'Remote',
			startDate: new Date('2024-04-26'),
			description:
				'Architecting a new internal platform and contributing to department-wide initiatives in accessibility and developer experience.'
		},
		{
			company: 'Brooksource',
			title: 'Software Developer',
			websiteUrl: 'https://brooksource.com/',
			location: 'Cleveland, Ohio',
			startDate: new Date('2023-11-20'),
			endDate: new Date('2024-04-23'),
			description:
				'Modernized and enhanced product inventory web applications used by <a href="https://www.sherwin-williams.com/" rel="noopener noreferrer" target="_blank">Sherwin-Williams</a>\' global salesforce.'
		},
		{
			company: 'Comsat Architects',
			title: 'Software Developer',
			websiteUrl: 'https://comsat-architects.com/',
			location: 'Rocky River, Ohio',
			startDate: new Date('2022-07-20'),
			endDate: new Date('2024-11-17'),
			description:
				'Developed mission planning and data visualization\n' +
				'applications for <a href="https://nasa.gov" rel="noopener noreferrer" target="_blank">NASA</a>.'
		},
		{
			company: 'Medical Mutual',
			title: 'ETL Developer Intern',
			websiteUrl: 'https://www.medmutual.com/',
			location: 'Brooklyn, Ohio',
			startDate: new Date('2022-05-26'),
			endDate: new Date('2022-07-12'),
			description: 'Extracted business intelligence to provide insights to business analysts.'
		},
		{
			company: 'Reworld',
			title: 'Game Developer Intern',
			location: 'Remote',
			startDate: new Date('2020-11-01'),
			endDate: new Date('2022-07-20'),
			description:
				'Developed 2 multiplayer games built on an experimental engine. Provided Lua lectures, programming advice, and answered technical questions for newer game developer interns.'
		},
		{
			company: 'Kent State University',
			title: 'Research Assistant',
			websiteUrl: 'https://www.kent.edu/cs',
			location: 'Kent, Ohio',
			startDate: new Date('2020-04-01'),
			endDate: new Date('2020-09-20'),
			description: 'Analyzed & reported on efficacy of distributed network consensus algorithms.'
		}
	].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

	const educations: Education[] = [
		{
			institution: 'Kent State University',
			location: 'Kent, Ohio',
			websiteUrl: 'https://kent.edu',
			program: 'B.S, Computer Science',
			startDate: new Date('2018-08-01'),
			endDate: new Date('2022-05-26'),
			grade: '3.868',
			honors: 'Magna Cum Laude'
		}
	].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
</script>

<!-- Master grid container wrapping both sections -->
<div class="grid sm:grid-cols-[auto_1fr]">
	<section class="col-span-full grid grid-cols-subgrid">
		<h2 class="col-span-full text-2xl text-primary-600 dark:text-primary-100">Experience</h2>
		<ul
			class="col-span-full grid grid-cols-subgrid border-s-1 border-s-gray-500 dark:border-s-gray-600 ms-0.5"
		>
			{#each jobs as job, i (i)}
				<li
					class="grid grid-cols-subgrid col-span-full gap-x-8 ms-4 border-bs-gray-300 dark:border-bs-gray-700 not-first:border-bs-1"
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
								<a href={job.websiteUrl} target="_blank" rel="noreferrer noopener">
									{job.company}</a
								>
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
					class="grid grid-cols-subgrid col-span-full gap-x-8 ms-4 border-bs-gray-300 dark:border-bs-gray-700 not-first:border-bs-1"
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
								<a href={education.websiteUrl} target="_blank" rel="noopener noreferrer"
									>{education.institution}</a
								>
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

<style>
	@reference 'tailwindcss';
	li:not(:first-child) {
		@apply pbs-2;
	}

	section:not(:last-of-type) {
		@apply mbe-2;
	}
</style>
