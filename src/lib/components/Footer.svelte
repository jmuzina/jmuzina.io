<script lang="ts">
	import { Envelope, Github, Linkedin, Shield } from '@boxicons/svelte';
	import { commitDate, commitSha, shortSha, githubRepoUrl } from '#lib/build-info.ts';

	const formattedDate = commitDate
		? new Date(commitDate).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			})
		: '';
</script>

<footer
	class="flex flex-wrap items-center justify-between gap-x-3 sm:gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400"
>
	<div class="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2">
		<ul class="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm *:flex">
			<li>
				<a
					class="inline-flex text-inherit hover:text-brand-light dark:hover:text-brand-dark"
					aria-label="GitHub"
					href="https://github.com/jmuzina"
					rel="noopener"
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
					rel="noopener"
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
					rel="noopener"
					target="_blank"
				>
					<Envelope />
				</a>
			</li>
			<!-- phones: privacy as an icon in this row, to keep the footer on one line -->
			<li class="sm:hidden">
				<a
					class="inline-flex text-inherit hover:text-brand-light dark:hover:text-brand-dark"
					aria-label="Privacy"
					href="/privacy"
					title="Privacy"
				>
					<Shield />
				</a>
			</li>
		</ul>

		<div
			class="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400"
		>
			<a
				class="max-sm:hidden inline-flex text-inherit hover:text-brand-light dark:hover:text-brand-dark"
				href="/privacy"
			>
				Privacy
			</a>
			<span>
				Logo by
				<a
					class="text-inherit hover:text-brand-light dark:hover:text-brand-dark underline decoration-dotted underline-offset-2"
					href="https://dianamuzina.com"
					rel="noopener"
					target="_blank"
				>
					Diana<span class="max-sm:sr-only">&nbsp;Mužina</span>
				</a>
			</span>
		</div>
	</div>

	{#if commitDate || commitSha}
		<!-- phones: just the date, linked to the commit, so the footer fits on one line -->
		<div class="sm:hidden text-sm text-gray-600 dark:text-gray-400 text-right">
			{#if commitSha}
				<a
					class="text-inherit hover:text-brand-light dark:hover:text-brand-dark underline decoration-dotted underline-offset-2"
					href="{githubRepoUrl}/commit/{commitSha}"
					rel="noopener"
					target="_blank"
				>
					<span class="sr-only">Updated</span>
					{#if formattedDate}
						<time datetime={commitDate}>{formattedDate}</time>
					{:else}
						<span class="font-mono">{shortSha}</span>
					{/if}
				</a>
			{:else}
				<span class="sr-only">Updated</span>
				<time datetime={commitDate}>{formattedDate}</time>
			{/if}
		</div>

		<div class="max-sm:hidden text-sm text-gray-600 dark:text-gray-400 text-right">
			<span>Updated</span>
			{#if formattedDate}
				<time datetime={commitDate}>{formattedDate}</time>
			{/if}
			{#if commitSha}
				(<a
					aria-label="Commit {shortSha} on GitHub"
					class="inline-flex font-mono text-inherit hover:text-brand-light dark:hover:text-brand-dark underline decoration-dotted underline-offset-2"
					href="{githubRepoUrl}/commit/{commitSha}"
					rel="noopener"
					target="_blank"
				>
					{shortSha}
				</a>)
			{/if}
		</div>
	{/if}
</footer>
