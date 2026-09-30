<svelte:head>
	<script
		defer
		src="https://jmuzina.io/matomo/index.php?module=CoreAdminHome&action=optOutJS&divId=matomo-opt-out&language=auto&showIntro=1"
	></script>
</svelte:head>

<article class="flex flex-col gap-4 max-w-prose">
	<a class="text-sm text-gray-500 dark:text-gray-300 hover:underline self-start" href="/"
		>← Back to home</a
	>
	<h2 class="text-2xl text-primary-600 dark:text-primary-100">Privacy</h2>

	<section class="flex flex-col gap-2">
		<h3 class="text-xl">Analytics</h3>
		<p>
			I use a self-hosted instance of <a
				href="https://matomo.org"
				rel="noreferrer noopener"
				target="_blank">Matomo</a
			> to understand how the site is used (which pages are read, where people come from). It is configured
			to be as minimal as possible:
		</p>
		<ul class="list-disc ps-6">
			<li>No cookies or identifiers are stored on your device.</li>
			<li>IP addresses are anonymized by removing the last two bytes before storage.</li>
			<li>If your browser sends a "Do Not Track" signal, you are not tracked.</li>
			<li>
				Data is never shared with, or sold to, third parties, and is not used for advertising.
			</li>
		</ul>
		What is collected:
		<ul class="list-disc ps-6">
			<li>pages visited</li>
			<li>time of visit</li>
			<li>referring site (host name only)</li>
			<li>browser</li>
			<li>operating system</li>
			<li>screen resolution</li>
			<li>language</li>
			<li>an approximate location (country) derived from your anonymized IP address</li>
		</ul>
		<p>Legal basis: legitimate interest in understanding and improving this site.</p>
	</section>

	<section class="flex flex-col gap-2">
		<h3 class="text-xl">Server logs</h3>
		<p>
			The server hosting this site keeps short-lived access logs (IP address, requested URL, time,
			browser) to keep the site secure and working. These logs are deleted automatically after 14
			days.
		</p>
	</section>

	<section class="flex flex-col gap-2">
		<h3 class="text-xl">Retention</h3>
		<p>
			Raw analytics data is deleted automatically after 6 months. Only aggregated, anonymous reports
			(e.g. "N visits to this page in March") are kept beyond that.
		</p>
	</section>

	<section class="flex flex-col gap-2">
		<h3 class="text-xl">Where data is stored</h3>
		<p>
			The site and the analytics service run on a server provided by OVHcloud, located in Virginia,
			USA.
		</p>
	</section>

	<section class="flex flex-col gap-2">
		<h3 class="text-xl">Your rights</h3>
		<p>
			Depending on where you live, you may have the right to access, correct, or delete data about
			you, to restrict or object to its processing, and to lodge a complaint with your local data
			protection authority. Because the stored data is anonymized and cookieless, I usually cannot
			link it back to you, but feel free to get in touch.
		</p>
	</section>

	<section class="flex flex-col gap-2">
		<h3 class="text-xl">Who is responsible</h3>
		<p>
			This site is run by Julie Mužina. For any privacy question or request, email
			<a href="mailto:jmuzina@jmuzina.io">jmuzina@jmuzina.io</a>.
		</p>
	</section>

	<section class="flex flex-col gap-2" id="opt-out">
		<h3 class="text-xl">Opt out</h3>
		<p>You can opt out of tracking below:</p>
		<div id="matomo-opt-out"></div>
		<noscript>
			<p>
				JavaScript is disabled, so no analytics are collected from your visit. You can also enable
				"Do Not Track" in your browser.
			</p>
		</noscript>
	</section>
</article>
