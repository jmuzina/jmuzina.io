<script lang="ts">
	import { Envelope, Github, Linkedin } from '@boxicons/svelte';
	import { HouseHeart, MapPin } from '@lucide/svelte';
</script>

<div class="flex flex-col gap-8">
	<section>
		<h2 class="text-2xl">Hi, I'm Julie!</h2>
		<p>I build things. Step on in.</p>

		<div class="flex flex-col sm:flex-row gap-x-4 gap-y-0.5 text-sm text-primary-950-50">
			<div class="flex items-center gap-1">
				<MapPin class="text-current" size="16" />
				New York, New York
			</div>
			<div class="flex items-center gap-1">
				<HouseHeart size="16" />
				Cleveland, Ohio
			</div>
		</div>
	</section>
	<section>
		<h2 class="text-xl">Under construction</h2>
		<p>
			I'm current rebuilding my portfolio from scratch! I've learned a lot since I built <a
				href="https://dev.jmuzina.io/"
				target="_blank">the old version</a
			> and want to build something fresher.
		</p>

		<p>
			Still, I <i>already</i> prefer the style of this one despite the details it is missing. For now,
			here's some other places to find me:
		</p>
		<ul class="container flex flex-wrap gap-x-2 gap-y-2 text-sm">
			<!--			todo update resume is tragically out of date -->
			<!--			<li>-->
			<!--				<a href="#">-->
			<!--					<div class="card preset-filled-surface-100-900 p-4 flex items-center gap-4"-->
			<!--					>-->
			<!--						<FileUser />-->
			<!--						CV-->
			<!--					</div>-->
			<!--				</a>-->
			<!--			</li>-->
			<li>
				<a
					class="card bg-primary-50 text-primary-contrast-50 p-2 flex items-center gap-2"
					href="https://github.com/jmuzina"
				>
					<Github />
					GitHub
				</a>
			</li>
			<li>
				<a
					class="card bg-primary-50 text-primary-contrast-50 p-2 flex items-center gap-2"
					href="https://linkedin.com/in/jmuzina"
				>
					<Linkedin />
					LinkedIn
				</a>
			</li>
			<li>
				<a
					class="card bg-primary-50 text-primary-contrast-50 p-2 flex items-center gap-2"
					href="mailto:jmuzina@pm.me"
				>
					<Envelope />
					Email
				</a>
			</li>
		</ul>
	</section>
</div>
