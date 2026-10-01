<script lang="ts">
	import { Envelope, Github, Linkedin } from '@boxicons/svelte';
	import { commitDate, commitSha, shortSha, githubRepoUrl } from '$lib/build-info';

	const formattedDate = commitDate
		? new Date(commitDate).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			})
		: '';
</script>

<footer
	class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400 lg:flex-col lg:items-start lg:gap-y-2"
>
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2 lg:flex-col lg:items-start">
		<ul class="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
			<li>
				<a
					class="inline-flex text-inherit hover:text-brand-light dark:hover:text-brand-dark"
					aria-label="GitHub"
					href="https://github.com/jmuzina"
					rel="noreferrer noopener"
					target="_blank"
				>
					<Github />
				</a>
			</li>
			<li>
				<a
					class="inline-flex text-inherit hover:text-brand-light dark:hover:text-brand-dark"
					aria-label="LinkedIn"
					href="https://linkedin.com/in/jmuzina"
					rel="noreferrer noopener"
					target="_blank"
				>
					<Linkedin />
				</a>
			</li>
			<li>
				<a
					class="inline-flex text-inherit hover:text-brand-light dark:hover:text-brand-dark"
					aria-label="Email"
					href="mailto:jmuzina@jmuzina.io"
					rel="noreferrer noopener"
					target="_blank"
				>
					<!--				envelope icon is slightly misaligned by default -->
					<Envelope class="mbs-1" />
				</a>
			</li>
		</ul>

		<div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
			<a
				class="inline-flex text-inherit hover:text-brand-light dark:hover:text-brand-dark"
				href="/privacy">Privacy</a
			>
		</div>
	</div>

	{#if commitDate || commitSha}
		<div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-right lg:text-left">
			<span>Last updated</span>
			{#if formattedDate}
				<time datetime={commitDate}>{formattedDate}</time>
			{/if}
			{#if commitSha}
				(<a
					aria-label="Commit {shortSha} on GitHub"
					class="inline-flex font-mono text-inherit hover:text-brand-light dark:hover:text-brand-dark underline decoration-dotted underline-offset-2"
					href="{githubRepoUrl}/commit/{commitSha}"
					rel="noreferrer noopener"
					target="_blank">{shortSha}</a
				>)
			{/if}
		</div>
	{/if}
</footer>
