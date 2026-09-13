<script lang="ts">
	import { Envelope, Github, Linkedin } from '@boxicons/svelte';
</script>

<footer>
	<ul class="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
		<li>
			<a
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
				aria-label="LinkedIn"
				href="https://linkedin.com/in/jmuzina"
				rel="noreferrer noopener"
				target="_blank"
			>
				<Linkedin />
			</a>
		</li>
		<li>
			<a aria-label="Email" href="mailto:jmuzina@pm.me" rel="noreferrer noopener" target="_blank">
				<!--				envelope icon is slightly misaligned by default -->
				<Envelope class="mbs-1" />
			</a>
		</li>
	</ul>
</footer>

<style>
	@reference 'tailwindcss';

	a {
		@apply inline-flex;
		color: var(--primary-50);
	}
</style>
