---
title: Nobody typed your password
date: 2026-12-01
description: Why some login buttons stay disabled after a password manager fills the form, and which layer of the web should fix it.
---

<script>
	import LoginDemo from './LoginDemo.svelte';
</script>

**Draft notes**
DRAFT. Not for publishing as is.

- Bracketed [Draft: ...] notes are instructions to self. Delete them as you write.
- Everything marked "Verify" came from research notes, not from my own testing.
- Fix the date and add `updated` if the test results change after publishing.
- Working titles: "Nobody typed your password", "The login button that waits for a
  keystroke", "Who broke the login button?"

[Draft: Hook, two or three sentences. The moment: the manager fills both fields, you click
Log in, nothing happens. You type a space, delete it, and the button wakes up. End on the
question the post answers: whose bug is this?]

[Draft: GIF or short screen recording of it happening. Needs alt text that describes the
sequence, and a still fallback for `prefers-reduced-motion`.]

[Draft: Thesis in one or two sentences. Every layer (site, browser, password manager,
framework) is acting sensibly for its own reasons. The bug lives in the gaps between them.
Today the site is the only layer that can fix it.]

## What the site is doing

[Draft: Show the pattern, then argue it's reasonable from the site's side before taking it
apart. The designer wants "you can't submit yet." The developer turns "has the user entered
something?" into "has a key been pressed?"]

```html
<form id="login">
	<label for="email">Email</label>
	<input id="email" type="email" autocomplete="username" />

	<label for="password">Password</label>
	<input id="password" type="password" autocomplete="current-password" />

	<button type="submit" disabled>Log in</button>
</form>

<script>
	const form = document.getElementById('login');
	const button = form.querySelector('button');

	form.addEventListener('keyup', () => {
		button.disabled = !(form.email.value && form.password.value);
	});
</script>
```

[Draft: Lead-in. The demo says how to try it (own manager or the simulate button) and how
the two differ. Here, add what readers who use their own manager need: most won't have a
login saved for this site, so type anything, let the manager save it, then reload. Things
to point out: the simulate button leaves Log in disabled; Cmd+V or Ctrl+V enables it
(the `keyup` after the paste), but right-click paste doesn't.]

<LoginDemo id="keystroke-demo" variant="keystroke" />

[Draft: Point out the proxy. A keystroke stands in for "the user entered something." That
link held when everyone typed. Autofill breaks it.]

[Draft: The pattern was questionable before password managers enter the story. GOV.UK
Design System: "Disabled buttons have poor contrast and can confuse some users, so avoid
them if possible." A disabled button doesn't say why it's disabled, and often can't be
focused, so keyboard and screen reader users may never find it.]

[Draft: Enter doesn't save you. Implicit submission goes through the form's default button,
and a disabled default button blocks it.]

## A keystroke isn't input

[Draft: The conceptual core. List every way text gets into a field, and note which ones
fire key events. Maybe a small table.]

| How the text arrived                     | Key events?      | `input` event? | Page can read it?      |
| ---------------------------------------- | ---------------- | -------------- | ---------------------- |
| Typing on a keyboard                     | yes              | yes            | yes                    |
| Paste (shortcut)                         | the shortcut     | yes            | yes                    |
| Paste (right-click or long-press)        | no               | yes            | yes                    |
| Voice dictation, switch access           | [Verify]         | [Verify]       | yes                    |
| Built-in manager, you picked an account  | no               | [Verify]       | yes                    |
| Built-in manager, filled on page load    | no               | [Verify]       | not until you interact |
| Extension manager (1Password, Bitwarden) | faked, if at all | faked          | yes                    |

[Draft: Accessibility angle here, briefly. Keystroke gating doesn't only fail power users. It
fails anyone who doesn't enter text with a keyboard.]

## Two kinds of password manager

[Draft: Frame it as inside the browser vs. outside it. This distinction explains everything
in the test results.]

### Inside the browser

[Draft: The built-in manager is the browser. It fills from inside the engine, so it can do
things page code can't: show a value while hiding it from the page, mark the field as
autofilled (`:autofill`), and decide which events fire and when.]

[Draft: Fill on load vs. fill on select. Chrome and Firefox fill on load by default (Firefox:
`signon.autofillForms`). Safari: Verify. Extensions mostly fill on select.]

[Draft: The security story, the most interesting part of the post. Chromium doesn't expose
autofilled-on-load passwords to JavaScript until the user interacts with the page, and later
did the same for the username. Threat: a page silently harvesting credentials from a hidden
form or iframe. Cite the Chromium change and the Firefox bug that states the rationale.
Contrast: Firefox closed a request to hide autofilled passwords from JS entirely as
WONTFIX.]

```js
// Chrome, page just loaded, built-in manager has filled the form, nothing clicked yet.
// You can see dots in the field.
document.getElementById('password').value; // ''
document.getElementById('password').matches(':autofill'); // true
```

[Draft: Replace the comments above with real output from the test page, with the Chrome
version.]

### Outside the browser

[Draft: An extension fills from a content script. To the page, it's more JavaScript that sets
`.value` and dispatches events. It has to impersonate a person, and it can't do it
convincingly, because script-made events are marked `isTrusted: false`.]

```js
password.value = 'correct horse battery staple';
password.dispatchEvent(new Event('input', { bubbles: true }));
password.dispatchEvent(new Event('change', { bubbles: true }));

password.addEventListener('keyup', (event) => {
	console.log(event.isTrusted); // false for anything the extension dispatches
});
```

[Draft: Quote 1Password support on simulating events, and the user request for a "typing
only" mode. Point: an arms race the manager can't win.]

### The framework in the middle

[Draft: React's value tracker. A plain `.value` write updates React's tracked value, so the
`input` event that follows looks like no change and React drops it. Managers have to call the
native setter. Some do, some don't. Keep this short; it's a fourth layer, not the main
story.]

```js
// React ignores this: its tracker already holds the new value.
input.value = 'hunter2';
input.dispatchEvent(new Event('input', { bubbles: true }));

// React sees this one.
const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
setValue.call(input, 'hunter2');
input.dispatchEvent(new Event('input', { bubbles: true }));
```

[Draft: Optional aside: the reverse problem, React setting `defaultValue` on controlled
inputs once stopped Firefox saving form history. Cut if the post runs long.]

## What I found

[Draft: The centerpiece and the part only I can write. Build the test page first. Record
browser and extension versions and the test date. Present findings as "as of December
2026".]

[Draft: Test page logs, per field: `keydown`, `keyup`, `input`, `change`, `animationstart`
on `:autofill`, Chrome's `autofill` event (if in the origin trial), `isTrusted` for each,
`.value.length` (never the value), and `matches(':autofill')`. Consider hosting it on the
site as an interactive demo: inline script, with a no-JS fallback that explains what it
does.]

```js
const events = ['keydown', 'keyup', 'input', 'change', 'animationstart', 'autofill'];

for (const field of form.querySelectorAll('input')) {
	for (const type of events) {
		field.addEventListener(type, (event) => {
			log({
				field: field.id,
				type,
				trusted: event.isTrusted,
				length: field.value.length,
				autofill: field.matches(':autofill')
			});
		});
	}
}
```

[Draft: Every `?` is a result to fill in from the test page.]

<div class="overflow-x-auto **:whitespace-nowrap rounded-md outline-solid outline-1 outline-offset-1 outline-primary-700-300 not-focus-visible:outline-hidden" role="region" aria-label="Test results" tabindex="0">

| Browser | Manager and mode             | Key events | `input` | `change` | Value readable | `:autofill` | `autofill` event |
| ------- | ---------------------------- | ---------- | ------- | -------- | -------------- | ----------- | ---------------- |
| Chrome  | Built-in, on load, untouched | ?          | ?       | ?        | ?              | ?           | ?                |
| Chrome  | Built-in, after one click    | ?          | ?       | ?        | ?              | ?           | ?                |
| Chrome  | Built-in, picked account     | ?          | ?       | ?        | ?              | ?           | ?                |
| Chrome  | 1Password                    | ?          | ?       | ?        | ?              | ?           | ?                |
| Chrome  | Bitwarden                    | ?          | ?       | ?        | ?              | ?           | ?                |
| Firefox | Built-in, on load            | ?          | ?       | ?        | ?              | ?           | ?                |
| Firefox | Built-in, picked account     | ?          | ?       | ?        | ?              | ?           | ?                |
| Firefox | 1Password                    | ?          | ?       | ?        | ?              | ?           | ?                |
| Firefox | Bitwarden                    | ?          | ?       | ?        | ?              | ?           | ?                |
| Safari  | Built-in                     | ?          | ?       | ?        | ?              | ?           | ?                |
| Safari  | 1Password                    | ?          | ?       | ?        | ?              | ?           | ?                |

</div>

[Draft: Questions only the tests can answer. Each answer is a small finding worth a
paragraph.]

- Does clicking a disabled button count as the interaction that releases Chrome's hidden
  value?
- Does Safari fill on load?
- Does Firefox's on-load fill fire `change` on the username field, or only the password?
  (There's an open bug saying only the password.)
- Does Chrome's `autofill` event fire for extension fills, or only for built-in ones?
- Does the empty-keyframes `animationstart` trick still work in each browser?

## Where the fix belongs

[Draft: Walk the layers from least to most responsible. One short subsection each, or one
paragraph each if that reads better.]

### Users

[Draft: The space-and-delete trick works, but it's folklore. Nobody should need to know it,
and it fails the accessibility test.]

### Password managers

[Draft: Stuck downstream. Better keystroke imitation is a workaround. They can't make their
events trusted.]

### Browsers

[Draft: Browsers can't stop sites relying on proxies, but they can give sites a real signal.]

- `:autofill`: tells the page "the browser filled this" even when `.value` reads `''`. Only
  covers built-in fills. [Verify: the research said Firefox blocks Baseline, but Firefox has
  shipped `:autofill` since version 86. Find out what the blocker is.]
- Chrome's `autofill` event, in origin trial from Chrome 147. [Verify: version, date, and
  whether it fires for third-party managers.]
- Letting extensions be autofill providers. This already exists on phones: iOS credential
  provider extensions, Android's autofill framework (Chrome 135 honors it natively). Not on
  desktop. Firefox bug for a WebExtension API has sat open for years. If the browser did all
  filling, every manager would fail the same predictable way, and `:autofill` would cover
  them all.

[Draft: Note that even the provider model doesn't fix a keystroke-gated form. A browser fill
doesn't press keys either. It only makes the failure consistent.]

### Sites and design systems

[Draft: The actual fix, and the cheapest. Design systems and component libraries have the
most leverage: one fix reaches every form built with them.]

## The fix

[Draft: Keep this short. The punchline: if the button is never disabled, the problem
disappears. Clicking it is the user interaction that releases Chrome's hidden value, so
validating on submit just works. Verify that with the test page.]

```html
<form id="login" novalidate>
	<label for="email">Email</label>
	<input id="email" type="email" autocomplete="username" required aria-describedby="email-error" />
	<p id="email-error" hidden>Enter your email address.</p>

	<label for="password">Password</label>
	<input
		id="password"
		type="password"
		autocomplete="current-password"
		required
		aria-describedby="password-error"
	/>
	<p id="password-error" hidden>Enter your password.</p>

	<button type="submit">Log in</button>
</form>

<script>
	const form = document.getElementById('login');

	form.addEventListener('submit', (event) => {
		let firstInvalid = null;

		for (const field of [form.email, form.password]) {
			const error = document.getElementById(`${field.id}-error`);
			const valid = field.checkValidity();
			error.hidden = valid;
			field.setAttribute('aria-invalid', String(!valid));
			firstInvalid ??= valid ? null : field;
		}

		if (firstInvalid) {
			event.preventDefault();
			firstInvalid.focus();
		}
	});
</script>
```

[Draft: Same saved login as the first demo, so readers can compare the two logs side by
side.]

<LoginDemo id="submit-demo" variant="submit" />

[Draft: Or drop `novalidate` and let the browser's own validation messages do it. Mention
both; pick one for the post.]

[Draft: If a stakeholder insists on gating, the least broken version.]

```js
function hasValue(field) {
	return field.value !== '' || field.matches(':autofill');
}

function updateSubmit() {
	button.disabled = ![form.email, form.password].every(hasValue);
}

form.addEventListener('input', updateSubmit);
form.addEventListener('change', updateSubmit);
// Built-in fills on page load may fire neither event. See the CSS below.
form.addEventListener('animationstart', updateSubmit);
updateSubmit();
```

```css
input:autofill {
	animation-name: autofill-detected;
}

@keyframes autofill-detected {
	from {
	}
	to {
	}
}
```

[Draft: Stress that `hasValue` trusts `:autofill` without reading the value. That's fine,
because the button only gates the click. Validation still runs on submit.]

[Draft: Point out what the demo shows: Simulate autofill enables the button here, unlike the
first demo. A built-in fill on page load should too, through `animationstart`. Report
whether it did in each browser.]

<LoginDemo id="autofill-aware-demo" variant="autofill-aware" />

## What's coming

[Draft: Two or three paragraphs, not a full section. Save the rest for a follow-up post.]

- Passkeys and WebAuthn conditional UI: no typed secret, no event to fake. Adoption numbers
  are from the FIDO Alliance, which promotes passkeys; "enabled on at least one account" is
  a low bar. Passwords still carry most logins.
- How many people this hits: around 40% store passwords in the browser's built-in manager
  (NordPass 2026), and built-in fill on load is the hardest case in the table. True
  hand-typers aren't affected.
- Desktop credential provider APIs, and the Linux gap: no OS-level autofill framework, so a
  browser extension API is the only route.

## Back to the button

[Draft: Close on the hook. The space you typed and deleted was a fake keystroke for a form
that wanted proof of a person. Every layer was reasonable; the fix is one `disabled`
attribute.]

**Draft notes**
Sources to cite (find and check each link before publishing):

- [GOV.UK Design System, Button component](https://design-system.service.gov.uk/components/button/): disabled buttons guidance
- Chromium code review: autofilled passwords hidden from JS until user interaction (~2014)
- Chromium change: same rule for the username field
- Firefox bug: rationale for interaction gating (iframes, pop-ups, hidden forms)
- Firefox bug: request to hide autofilled passwords from JS entirely, WONTFIX
- Firefox bug: on-load fill fires change on password but not email/text (open)
- Firefox bug: make signon.autofillForms = false the default (open, parity-safari)
- Firefox WebExtensions bug: API for extensions to provide login info (open)
- WebKit bug: autofill dispatching change but not input
- 1Password community/support threads: event simulation timing, "typing only" mode
- React issue: value tracker swallowing dispatched input events
- React issue: `defaultValue` on controlled inputs breaking Firefox form history
- [MDN: `:autofill`](https://developer.mozilla.org/en-US/docs/Web/CSS/:autofill)
- [MDN: `Event.isTrusted`](https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted)
- web-features / Baseline status for :autofill
- Chrome developer blog: autofill event origin trial
- Android Developers blog: Chrome native autofill service support (Chrome 135)
- Apple developer docs: credential provider extensions
- W3C WebAuthn issue: extensions monkey-patching navigator.credentials
- web.dev: passkey form autofill (conditional UI)
- FIDO Alliance 2026 consumer report
- Security.org password manager survey
- NordPass 2026 research
- NSF-funded university study on password manager use (77% used a PM, 60% built-in)
