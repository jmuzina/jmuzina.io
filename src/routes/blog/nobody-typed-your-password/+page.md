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

- Reader: people who build forms and design systems. Cut whatever doesn't help them build a
  login form that works with every password manager.
- Bracketed [Draft: ...] notes are instructions to self. Delete them as you write.
- Everything marked "Verify" came from research notes, not from my own testing.
- The date is a placeholder. Set it once "What I found" is written, and move it rather than
  publish with thin findings: they're the only part of the post nobody else has. Add
  `updated` if the results change after publishing.
- Title: "Nobody typed your password". It names the mechanism, not the symptom.
- Stakes figure: pick one primary source and say exactly what it measures. "Stores passwords
  in the browser" (NordPass, around 40%) and "uses a manager, and of those, the built-in one"
  (NSF-funded study, 77% and 60%) are different numbers. NordPass sells a password manager,
  so prefer the study if it measures the built-in share.
- One demo, under "What the site is doing". Its mode comes from a query string
  (`?mode=keystroke`, the default, `?mode=submit`, `?mode=autofill-aware`), because a hash
  change doesn't reload the page and fill on load needs a reload. Its own links switch modes;
  later sections link to it as `?mode=submit#demo`, so the reload lands on the demo with the
  same saved login.

Test plan, in order. Stop and rethink the post if test 1 fails.

1. Chrome fills the form on page load, then you click an enabled Log in. Does the submit
   handler see the password? Does native `required` validation pass on that click, or does it
   check before the click releases the value? The fix depends on both.
2. Built-in fill on page load in each browser: which events fire, and when the value
   becomes readable. Does Safari fill on load at all?
3. Do managers offer to save a login when submit is canceled and the page doesn't
   navigate? The reader instructions under the demo depend on it.
4. The rest of the matrix in "What I found", plus:
   - Against the keystroke form, which events does each extension fire? This decides how
     "Outside the browser" is framed.
   - Does clicking a disabled button count as the interaction that releases Chrome's hidden
     value?
   - Does Firefox's on-load fill fire `change` on the username field, or only the password?
     (There's an open bug saying only the password.)
   - Does Chrome's `autofill` event fire for extension fills, or only for built-in ones?
   - Does the empty-keyframes `animationstart` trick still work in each browser?

Record browser and extension versions and the test date. Present findings as "as of
December 2026". The demo logs `keydown`, `keyup`, `input`, `change`, `animationstart` and
`invalid` per field, with `isTrusted`, `.value.length` and `:autofill`. An `invalid` entry
with 0 chars after a click answers the second half of test 1. Add Chrome's `autofill` event
if it exists.

Research claims behind "Whose job is it?":

- Chrome's `autofill` event in an origin trial from Chrome 147. Verify. Drop its bullet if
  wrong.
- `:autofill` and Baseline. Checked 2026-11-27: web-features moved `:autofill` from Baseline
  low to not Baseline on 2026-01-29 (web-features PR 3731). Firefox matches `:autofill` only
  for autofilled username and password fields, not for other autocompleted inputs (Firefox
  bug 1923525). So Firefox is the blocker, but not for login forms. Keep the bullet and say
  that.

[Draft: Hook, two or three sentences. The moment: the manager fills both fields, you click
Log in, nothing happens. You type a space, delete it, and the button wakes up. End on the
question the post answers: whose bug is this?]

[Draft: GIF or short screen recording of it happening. Needs alt text that describes the
sequence, and a still fallback for `prefers-reduced-motion`. Show the built-in fill on page
load: it's the most surprising case, and few readers will set it up in the demo.]

[Draft: Stakes, one or two sentences, from the one source chosen in the notes above. Built-in
fill on load is the hardest case in the table. True hand-typers aren't affected.]

[Draft: Thesis in one or two sentences. Gating the button on a keystroke is a pattern that
always looked reasonable and was always fragile. Each layer (site, browser, password
manager) acts sensibly for its own reasons, and the bug lives in the gaps between them.
Today the site is the only layer that can fix it, and the fix is deleting one attribute.]

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
login saved for this site, so type anything, let the manager save it, then reload (test 3).
Say the demo has three modes, this is the first, and switching reloads the page so the
manager fills it again. Things to point out: the simulate button leaves Log in disabled;
Cmd+V or Ctrl+V enables it (the `keyup` after the paste), but right-click paste doesn't.]

<LoginDemo id="demo" />

[Draft: Point out the proxy. A keystroke stands in for "the user entered something." That
link held when everyone typed. Autofill breaks it.]

[Draft: Enter doesn't save you. Implicit submission goes through the form's default button,
and a disabled default button blocks it.]

## A keystroke isn't input

[Draft: The conceptual core. List every way text gets into a field, and note which ones
fire key events.]

| How the text arrived                     | Key events?      | `input` event? | Page can read it?      |
| ---------------------------------------- | ---------------- | -------------- | ---------------------- |
| Typing on a keyboard                     | yes              | yes            | yes                    |
| Paste (shortcut)                         | the shortcut     | yes            | yes                    |
| Paste (right-click or long-press)        | no               | yes            | yes                    |
| Voice dictation, switch access           | [Verify]         | [Verify]       | yes                    |
| Built-in manager, you picked an account  | no               | [Verify]       | yes                    |
| Built-in manager, filled on page load    | no               | [Verify]       | not until you interact |
| Extension manager (1Password, Bitwarden) | faked, if at all | faked          | yes                    |

[Draft: The post's one accessibility paragraph. Everywhere else, refer back here. Two points.
Keystroke gating fails anyone who doesn't enter text with a keyboard, not only password
manager users: the dictation, switch access and right-click paste rows. And the disabled
button was fragile before password managers enter the story. GOV.UK Design System:
"Disabled buttons have poor contrast and can confuse some users, so avoid them if possible."
A disabled button doesn't say why it's disabled, and often can't be focused, so keyboard and
screen reader users may never find it. This is the "always fragile" half of the thesis.]

## Two kinds of password manager

[Draft: Frame it as inside the browser vs. outside it. This distinction explains everything
in the test results. Keep only what explains why the fix works.]

### Inside the browser

[Draft: Lead with the security story, the most interesting part of the post. Chromium doesn't
expose autofilled-on-load passwords to JavaScript until the user interacts with the page, and
later did the same for the username. Threat: a page silently harvesting credentials from a
hidden form or iframe. Cite the Chromium change and the Firefox bug that states the
rationale. Contrast: Firefox closed a request to hide autofilled passwords from JS entirely
as WONTFIX.]

```js
// Chrome, page just loaded, built-in manager has filled the form, nothing clicked yet.
// You can see dots in the field.
document.getElementById('password').value; // ''
document.getElementById('password').matches(':autofill'); // true
```

[Draft: Replace the comments above with real output from the test page, with the Chrome
version.]

[Draft: Then why it can do that. The built-in manager is the browser. It fills from inside
the engine, so it can do things page code can't: show a value while hiding it from the page,
mark the field as autofilled (`:autofill`), and decide which events fire and when.]

[Draft: Fill on load vs. fill on select. Chrome and Firefox fill on load by default (Firefox:
`signon.autofillForms`). Safari: Verify (test 2). Extensions mostly fill on select.]

### Outside the browser

[Draft: An extension fills from a content script. To the page, it's more JavaScript that sets
`.value` and dispatches events, and it has to guess which events this site listens for.
Against the keystroke form, it fails when it guesses wrong: it fires `input` and `change`
but no key events (Simulate autofill does exactly this), or `keydown` but no `keyup`, or a
framework drops the event. Say which of these each manager hit, from "What I found".]

```js
password.value = 'correct horse battery staple';
password.dispatchEvent(new Event('input', { bubbles: true }));
password.dispatchEvent(new Event('change', { bubbles: true }));
// The keystroke-gated button stays disabled: no keyup.

password.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
// Now it enables, although all three events have isTrusted: false.
```

[Draft: Verify the comments above in the first demo's console. Showing the synthetic `keyup`
working is the point: readers will try it, and the post should get there first. The site
never checks `isTrusted`, so trust isn't why this form fails.]

[Draft: Then `isTrusted`, as the limit rather than the cause. Script-made events are always
`isTrusted: false`, so a manager can never fully pass as a person, and the few sites that
check it reject every fake. Quote 1Password support on simulating events, and the user
request for a "typing only" mode. Point: the manager is guessing per site, and can't win
for certain.]

[Draft: Two sentences on frameworks, no code. React's value tracker drops an `input` event
that follows a plain `.value` write, so managers have to call the native setter, and some
don't. Frameworks are a fourth gap the manager has to get through. Link the React issue.]

## What I found

[Draft: The centerpiece and the part only I can write. Give it room: three or four findings,
a paragraph or more each, in prose. The matrix below is reference for readers who want the
detail.

- Open with what was tested: date, browser and extension versions, OS.
- Lead with what each manager did against the keystroke form, because it answers "Outside
  the browser."
- Then when each built-in fill became readable.
- Hold test 1 (does clicking an enabled button release the value?) for "The fix," where it's
  the payoff. Point forward to it here.
- Note anything that contradicts the research notes. Those are the most useful findings.]

<details class="my-4">
<summary class="cursor-pointer rounded-md focus-ring">Full test results</summary>

<div class="mt-2 overflow-x-auto **:whitespace-nowrap rounded-md focus-ring" role="region" aria-label="Test results" tabindex="0">

| Browser | Manager and mode     | Key events | `input` | `change` | Readable before interaction | Readable after a click | `:autofill` | `autofill` event |
| ------- | -------------------- | ---------- | ------- | -------- | --------------------------- | ---------------------- | ----------- | ---------------- |
| Chrome  | Built-in, on load    | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Chrome  | Built-in, picked one | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Chrome  | 1Password            | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Chrome  | Bitwarden            | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Firefox | Built-in, on load    | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Firefox | Built-in, picked one | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Firefox | 1Password            | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Firefox | Bitwarden            | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Safari  | Built-in             | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |
| Safari  | 1Password            | ?          | ?       | ?        | ?                           | ?                      | ?           | ?                |

</div>
</details>

[Draft: Every `?` is a result to fill in from the test page. Drop the `autofill` event column
if the event doesn't exist.]

## The fix

[Draft: Keep this short. The punchline: delete `disabled` and the problem disappears. Mark
`required` on the fields and let the browser's own validation stop an empty submit. No
script.]

```html
<form id="login" method="post" action="/login">
	<label for="email">Email</label>
	<input id="email" name="email" type="email" autocomplete="username" required />

	<label for="password">Password</label>
	<input id="password" name="password" type="password" autocomplete="current-password" required />

	<button type="submit">Log in</button>
</form>
```

[Draft: The payoff for test 1. Clicking the button is the user interaction that releases
Chrome's hidden value, so validating on submit just works. Give the result with the Chrome
version. Rewrite this section if it fails.]

[Draft: Link to the demo in this mode: `?mode=submit#demo`. Same saved login, so readers can
compare its log with the keystroke mode's.]

<details class="my-4">
<summary class="cursor-pointer rounded-md focus-ring">[Draft: summary text] Custom error messages</summary>

[Draft: One sentence: if the design needs its own error messages, keep the button enabled
and validate in the submit handler.]

```html
<form id="login" method="post" action="/login" novalidate>
	<label for="email">Email</label>
	<input id="email" name="email" type="email" autocomplete="username" required />
	<p id="email-error" hidden>Enter your email address.</p>

	<label for="password">Password</label>
	<input id="password" name="password" type="password" autocomplete="current-password" required />
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
			// A description pointing at a hidden element is still read out
			if (valid) field.removeAttribute('aria-describedby');
			else field.setAttribute('aria-describedby', error.id);
			firstInvalid ??= valid ? null : field;
		}

		if (firstInvalid) {
			event.preventDefault();
			firstInvalid.focus();
		}
	});
</script>
```

</details>

[Draft: Design systems and component libraries have the most leverage: one fix reaches every
form built with them. Say it here, as the call to action for the reader.]

[Draft: Fallback, labeled as one, so it doesn't undercut the punchline. If a
stakeholder insists on gating, the least broken version.]

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

[Draft: Link to the demo in this mode: `?mode=autofill-aware#demo`. Point out what it shows:
Simulate autofill enables the button here, unlike the keystroke mode. A built-in fill on
page load should too, through `animationstart`. Report whether it did in each browser.]

## Whose job is it?

[Draft: Answers "why is this the site's job?" now that the reader has the fix. One short
paragraph per layer, least to most able to fix it. Half the length of the sections above.]

[Draft: Users. The space-and-delete trick works, but it's folklore. Nobody should need to
know it, and it leaves out everyone in the accessibility paragraph under the table. Refer
back; don't repeat it.]

[Draft: Password managers. Stuck downstream, guessing which events each site wants. They
can't make their events trusted.]

[Draft: Browsers can't stop sites relying on proxies, but they can give sites a real
signal.]

- `:autofill`: tells the page "the browser filled this" even when `.value` reads `''`. Only
  covers built-in fills. Not Baseline, because Firefox matches it only for username and
  password fields, which is all a login form needs.
- Chrome's `autofill` event, in origin trial from Chrome 147. [Verify: version, date, and
  whether it fires for third-party managers.]
- [Draft: Two sentences. Phones already let password managers fill through the OS (iOS
  credential provider extensions, Android's autofill framework), so every fill is a browser
  fill and `:autofill` would cover them all. Even that wouldn't fix a keystroke-gated form:
  a browser fill doesn't press keys either.]

[Draft: One sentence on the long term: passkeys leave no typed secret and no event to fake,
but passwords still carry most logins.]

## Back to the button

[Draft: Close on the hook. The space you typed and deleted was a fake keystroke for a form
that wanted proof of a person. The fix is deleting one `disabled` attribute.]

**Draft notes**
Sources to cite (find and check each link before publishing):

- [GOV.UK Design System, Button component](https://design-system.service.gov.uk/components/button/): disabled buttons guidance
- Chromium code review: autofilled passwords hidden from JS until user interaction (~2014)
- Chromium change: same rule for the username field
- Firefox bug: rationale for interaction gating (iframes, pop-ups, hidden forms)
- Firefox bug: request to hide autofilled passwords from JS entirely, WONTFIX
- Firefox bug: on-load fill fires change on password but not email/text (open)
- Firefox bug: make signon.autofillForms = false the default (open, parity-safari)
- [Firefox bug 1923525](https://bugzil.la/1923525): `:autofill` matches only username and password fields
- WebKit bug: autofill dispatching change but not input
- 1Password community/support threads: event simulation timing, "typing only" mode
- React issue: value tracker swallowing dispatched input events
- [MDN: `:autofill`](https://developer.mozilla.org/en-US/docs/Web/CSS/:autofill)
- [MDN: `Event.isTrusted`](https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted)
- [web-features: `:autofill`](https://github.com/web-platform-dx/web-features/blob/main/features/autofill.yml) and PR 3731 (Baseline low to not Baseline, 2026-01-29)
- Chrome developer blog: autofill event origin trial
- Android Developers blog: Chrome native autofill service support (Chrome 135)
- Apple developer docs: credential provider extensions
- Stakes: one of Security.org survey, NordPass 2026 research, NSF-funded university study on
  password manager use (77% used a PM, 60% built-in)
