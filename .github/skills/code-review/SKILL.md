---
name: code-review
description: Review a diff, branch or pull request on jmuzina.io against AGENTS.md. Use when asked to review code, a PR or changes before merging. Reports findings with file and line; does not edit files.
---

# Code review

Review the change against [AGENTS.md](../../../AGENTS.md), which is the source of truth. This
skill lists what to look for and how to report it. If the two disagree, AGENTS.md wins.

Don't edit files, commit or push. Report findings; the author fixes them.

## 1. Get the change

- No target given: the current branch against `dev`, plus uncommitted work:
  `git diff dev...HEAD` and `git diff HEAD`.
- A PR number: `gh pr diff <n>` and `gh pr view <n>` for the description.
- A branch or path: diff it against `dev`.

Read [ARCHITECTURE.md](../../../ARCHITECTURE.md), then each changed file in full, not just
the hunks. Read the tests for each changed file. Before claiming an API, class or token
doesn't exist, check `node_modules`, `src/app.css` or the build output.

## 2. Run the checks

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
pnpm test:e2e   # when markup, styles, inline scripts, routes or posts changed
```

Report every failure with its output. If a browser test or e2e fails with EPERM, report the
sandbox restriction; don't count it as a pass. A passing run doesn't end the review: most of
the list below is invisible to the tooling.

## 3. Look for these

Each item is a way a change can pass CI and still break a rule.

### Invariants

- **Svelte code expected to run in the browser.** Runes, `onclick`, `bind:` and lifecycle
  hooks do nothing client side because CSR is off. Interactivity must be an inline
  `<script>` nested inside an element. A top-level `<script>` is the component script and
  never reaches the browser.
- **`export const csr = true`** anywhere. Needs Julie's approval, a comment saying why and a
  row in the ARCHITECTURE.md CSR table. Never in a layout.
- **Broken without JavaScript.** JS-only controls not hidden with the `js:` variant (and
  the `hidden` attribute, when the control does nothing until its script runs), or
  content only reachable through a script. Native `<details>`, links and forms come first.
- **Third-party requests:** CDNs, web fonts, embeds, external images, trackers, cookies.
- **Analytics or data collection changes** without a matching edit to
  `src/routes/privacy/+page.svelte`.
- **Posts that need code.** A new post must not require edits outside its own folder.

### Routes and posts

- A new page missing from `src/lib/routes.ts`, a `<title>` not shaped
  `Page | Julie Mužina`, or not exactly one `<h1>`.
- A `<title>` added to `app.html`.
- A post missing `title`, `date` or `description`, an `image` without `imageAlt`, or
  sections starting below `##`.
- A post that imports `BlogPost.svelte`, or a relative mdsvex `layout` path.

### Styling

- Hex, `rgb()` or arbitrary color values instead of `renewed-orchid` tokens.
- Light/dark pair classes that aren't mirrored shades (`bg-surface-100-800` doesn't exist;
  pairs are 50/950, 100/900, 200/800, ...).
- A `<style>` block or CSS file that restates what utilities can do.
- State handled with scripts or extra classes where a variant (`group-open:`,
  `peer-aria-*`, `in-target:`, `js:`) would do.
- `sticky` or `fixed` without `tall:` and matching scroll padding.
- `<button>` or `<summary>` without `cursor-pointer`.
- Animation or transition without `motion-reduce:`.

### Accessibility

Reason it through for keyboard, screen reader, 400% zoom and touch. Axe passing isn't enough.

- No visible focus ring, or a ring that differs from the site ring (the `focus-ring`
  utility) without an entry in the Tab test's allowlist in `e2e/a11y.spec.ts`.
- Toggles without `aria-expanded` and `aria-controls`, or whose accessible name changes
  with state.
- `role="menu"` on navigation, missing `aria-current`, icons without `aria-hidden="true"`.
- Escape that closes a disclosure when focus is outside it, or doesn't return focus to the
  toggle.
- A `role="status"` region created at the moment it gets text, so nothing is announced.
- Targets under 24x24 px. Text contrast under 4.5:1 in either scheme.

### Tests

- A behavior change with no test, or a test at the wrong level: logic in
  `src/**/*.spec.ts`, components in `*.svelte.spec.ts`, inline scripts and cross-page
  behavior in `e2e/`.
- A test that was weakened, skipped or deleted to get green.
- A test that can't fail: it checks the easy case (the last list entry, an in-page `#hash`
  jump, a section that already scrolls to the top). Ask for the mutation-check result if
  the author didn't report one.
- A hard-coded list of pages that can go stale. Tests must read `sitemap.xml`,
  `getPagePathnames()` or the route manifest.
- `importOriginal` of `#lib/posts.ts` in a browser test.

### Code and scope

- Changes beyond what was asked: drive-by refactors, renames, reformatting, extra options.
- A new helper that duplicates one in `src/lib/`, or an abstraction with one caller.
- New dependencies in `package.json`, or CI and deploy changes, without the author saying
  they were approved.
- Comments that say what instead of why, JSDoc that restates a name, dead or commented-out
  code, `TODO` without an issue number.

### Writing

Vale only covers root Markdown, `src` and `e2e`, so check other files (including
`.github/`) by hand.

- British spelling, em dashes or en dashes, filler or hype in docs, comments and UI text.
- New or changed copy in Julie's voice (pages, posts, bio) that wasn't requested, or new
  personal details about Julie.
- Commit subjects that aren't short, imperative and sentence case, or an agent's commit
  without a body that says why. Julie's own commits may have no body.

## 4. Report

Confirm each finding against the code before reporting it. Drop anything you can't point
to a line for.

Group findings by severity, most severe first:

- **Blocking:** a bug, a failing check, or a broken invariant.
- **Should fix:** a rule in AGENTS.md broken without breaking an invariant, or a missing
  test.
- **Nit:** style or wording that tooling doesn't catch.

For each: `file:line`, what is wrong, why it matters here, and the fix in a sentence. End
with the check results and anything you couldn't verify (skipped e2e, visual checks in
light, dark and mobile). Say so plainly when there are no findings.
