<script lang="ts">
	let { id, variant }: { id: string; variant: 'keystroke' | 'autofill-aware' | 'submit' } =
		$props();

	const captions = {
		keystroke: 'Demo: the button waits for a keystroke',
		'autofill-aware': 'Demo: the button waits for input or autofill',
		submit: 'Demo: the button is always enabled'
	};
	const validates = $derived(variant !== 'keystroke');
</script>

<figure class="not-prose my-6 rounded-md border border-surface-200-800 p-4">
	<figcaption class="mb-4 font-semibold">{captions[variant]}</figcaption>

	<p class="js:hidden">This demo needs JavaScript. The code above shows what it does.</p>

	<div class="hidden js:block" data-login-demo={variant}>
		<p class="mb-4 text-sm text-surface-600-400">
			Use your password manager with a made-up login, or press Simulate autofill to fill it by
			script, as an extension would.
		</p>
		<!-- form.submit() skips the submit handler, and a GET would put the password in the URL.
		     Outside a <dialog>, method="dialog" submits nowhere. -->
		<form class="flex flex-col gap-3" method="dialog" novalidate>
			<label class="label" for="{id}-email">
				<span class="label-text">Email</span>
				<input
					class="input"
					id="{id}-email"
					name="email"
					type="email"
					autocomplete="username"
					required
				/>
			</label>
			{#if validates}
				<p class="text-sm text-error-700 dark:text-error-300" id="{id}-email-error" hidden>
					Enter your email address.
				</p>
			{/if}

			<label class="label" for="{id}-password">
				<span class="label-text">Password</span>
				<input
					class="input"
					id="{id}-password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</label>
			{#if validates}
				<p class="text-sm text-error-700 dark:text-error-300" id="{id}-password-error" hidden>
					Enter your password.
				</p>
			{/if}

			<div class="flex flex-wrap gap-2">
				<button
					class="btn preset-outlined-surface-800-200 cursor-pointer motion-reduce:transition-none"
					type="button"
					data-simulate
				>
					Simulate autofill
				</button>
				<button
					class="btn preset-filled-primary-800-200 cursor-pointer motion-reduce:transition-none"
					type="submit"
				>
					Log in
				</button>
			</div>
			<p class="text-sm" role="status"></p>
		</form>

		<p class="mt-4 mb-2 text-sm font-semibold">What the page saw</p>
		<p class="mb-2 text-sm text-surface-600-400">
			Newest first. Shows how many characters the page can read, never the value. Nothing leaves
			this page.
		</p>
		<ol class="font-mono text-xs" data-log></ol>
	</div>

	<script>
		(function () {
			var root = document.currentScript.parentNode.querySelector('[data-login-demo]');
			var variant = root.getAttribute('data-login-demo');
			var form = root.querySelector('form');
			var fields = [form.elements.email, form.elements.password];
			var button = form.querySelector('[type="submit"]');
			var simulate = form.querySelector('[data-simulate]');
			var status = form.querySelector('[role="status"]');
			var log = root.querySelector('[data-log]');
			var MAX_ENTRIES = 12;

			// Throws in browsers that don't know the selector
			function isAutofilled(field) {
				try {
					return field.matches(':autofill');
				} catch (e) {
					return false;
				}
			}

			function record(source, field, trusted) {
				var entry = document.createElement('li');
				entry.textContent =
					source +
					' ' +
					field.name +
					': ' +
					field.value.length +
					' chars' +
					(isAutofilled(field) ? ', :autofill' : '') +
					(trusted === false ? ', untrusted' : '');
				log.insertBefore(entry, log.firstChild);
				while (log.children.length > MAX_ENTRIES) log.removeChild(log.lastChild);
			}

			fields.forEach(function (field) {
				['keydown', 'keyup', 'input', 'change', 'animationstart'].forEach(function (type) {
					field.addEventListener(type, function (event) {
						record(type, field, event.isTrusted);
					});
				});
			});

			// Built-in fill on load may fire no events at all, so take a look without one.
			window.addEventListener('load', function () {
				setTimeout(function () {
					fields.forEach(function (field) {
						record('1 s after load', field);
					});
				}, 1000);
			});

			simulate.addEventListener('click', function () {
				[
					[fields[0], 'reader@example.com'],
					[fields[1], 'correct horse battery staple']
				].forEach(function (pair) {
					pair[0].value = pair[1];
					pair[0].dispatchEvent(new Event('input', { bubbles: true }));
					pair[0].dispatchEvent(new Event('change', { bubbles: true }));
				});
				status.textContent = 'Filled by script, no key presses.';
			});

			if (variant === 'keystroke') {
				button.disabled = true;
				form.addEventListener('keyup', function () {
					button.disabled = !fields.every(function (field) {
						return field.value;
					});
				});
			}

			if (variant === 'autofill-aware') {
				var update = function () {
					button.disabled = !fields.every(function (field) {
						return field.value !== '' || isAutofilled(field);
					});
				};
				form.addEventListener('input', update);
				form.addEventListener('change', update);
				form.addEventListener('animationstart', update);
				update();
			}

			form.addEventListener('submit', function (event) {
				event.preventDefault();
				var firstInvalid = null;

				if (variant !== 'keystroke') {
					fields.forEach(function (field) {
						var valid = field.checkValidity();
						var error = document.getElementById(field.id + '-error');
						error.hidden = valid;
						field.setAttribute('aria-invalid', String(!valid));
						// A description pointing at a hidden element is still read out
						if (valid) field.removeAttribute('aria-describedby');
						else field.setAttribute('aria-describedby', error.id);
						if (!valid && !firstInvalid) firstInvalid = field;
					});
				}

				if (firstInvalid) {
					status.textContent = '';
					firstInvalid.focus();
					return;
				}
				fields.forEach(function (field) {
					record('submit', field);
				});
				status.textContent = 'Logged in. (Not really: nothing was sent.)';
			});
		})();
	</script>
</figure>

<style>
	/* A built-in fill on page load can fire no events. Starting an animation is the one signal
	   the page gets, through animationstart. */
	input:autofill {
		animation-name: autofill-detected;
	}

	@keyframes autofill-detected {
		from {
		}
		to {
		}
	}
</style>
