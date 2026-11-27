# AGENTS.md

Rules for AI coding agents working on this repo. If a request conflicts with a rule, ask
before acting.

## Read first

- [ARCHITECTURE.md](ARCHITECTURE.md): stack, code layout, deploys.
- The files you'll change and their tests. Check `src/lib/` for an existing helper before
  writing one.
- Skills live in `.github/skills/`. To review a change, follow
  [code-review](.github/skills/code-review/SKILL.md).

## Invariants

No change may give these up.

- **No framework JavaScript ships.** Pages are prerendered static HTML with CSR off.
  Interactive pieces (mobile menu, table of contents, section-link copy) are small inline
  scripts over plain HTML, and the site works with JavaScript disabled.
- **Accessibility is tested.** Every page passes axe WCAG 2.2 AA in light and dark mode.
  E2E covers keyboard, focus and the no-JS fallback in Chrome, Firefox and Safari on desktop, plus Android and iPhone.
- **Analytics stay private.** Self-hosted, cookieless Matomo with anonymized IPs, Do Not
  Track honored, opt-out available, as stated on the
  [privacy page](src/routes/privacy/+page.svelte).
- **Posts are Markdown only.** Publishing a post never requires a code change. It does
  change screenshots (the post, the home page and the blog index), so commit the updated
  visual baselines with it.
- **One design system.** All styling comes from Tailwind and Skeleton tokens (the
  `renewed-orchid` theme).

## Commands

```bash
pnpm dev             # dev server
pnpm check           # svelte-kit sync + svelte-check + tsc; must pass
pnpm lint            # prettier, eslint, markdownlint-cli2, vale; CI runs this
pnpm lint:fix        # fix what the linters can
pnpm fix             # lint:fix, then check + lint to report what's left
pnpm test            # test:unit (node) + test:component (in Chromium, Firefox, WebKit)
pnpm test:e2e        # playwright against the built site; first: pnpm exec playwright install chromium firefox webkit
pnpm test:e2e:visual # screenshot diffs in the Playwright Docker image; :update rewrites baselines
pnpm build           # prerender to build/; fails on broken internal links
```

New scripts follow `task`, `task:scope`, `task:mode` (e.g. `test:unit:watch`), and scripts
call each other with `pnpm run`.

Browser tests and `test:e2e` bind local ports. If they fail with EPERM, report the sandbox
restriction. Don't skip them.

## How to work

- **Do only what was asked.** No drive-by refactors, renames, reformatting or extra
  features. Mention other problems you find; don't fix them.
- **Make the smallest change that works.** No speculative abstractions or options. Three
  similar lines beat a premature helper.
- **Read before editing.** Don't guess at an API, class name or URL. Check
  `node_modules`, the docs or the compiled output.
- **Verify, then report.** Done means `check`, `lint` (touched files), `test`, `build`
  and the relevant e2e tests pass, and visual changes have been checked in light, dark
  and mobile. Report failures and skipped steps. Never weaken or delete a test to make it
  pass.
- **Ask before anything hard to undo:** new dependencies, deleting files, CI or deploy
  changes, commits, pushes.

## Architecture

- **CSR is off, so no Svelte code runs in the browser.** Runes, `onclick` and lifecycle
  hooks only affect the server render. Use a plain inline `<script>`, nested inside an
  element (Svelte treats a top-level `<script>` as the component script).
- **CSR on a route needs Julie's approval.** Never site-wide, never to avoid a small
  inline script. Only for real app behavior (e.g. an interactive map). Once approved:
  - set `export const csr = true` in the route's `+page.ts`, with a comment saying why
  - add the route and reason to the table in
    [ARCHITECTURE.md](ARCHITECTURE.md#client-side-rendering-is-off)
  - keep the route prerendered and usable without JavaScript
  - verify links into and out of it still do full page loads with correct focus and
    scroll, and the e2e suite passes
- **Everything works without JavaScript.** Start from native HTML (`<details>`, links,
  forms). Hide JS-only UI with the `js:` variant; `app.html` sets the `.js` class before
  first paint, so nothing flashes.
- **New pages go in `src/lib/routes.ts`.** Nav and breadcrumbs read it, and
  `routes.spec.ts` fails without an entry. Each page sets `<title>Page | Julie Mužina</title>`
  and has exactly one `<h1>`.
- **Posts live at `src/routes/blog/<slug>/+page.md`** with `title`, `date` and
  `description` frontmatter. mdsvex applies `BlogPost.svelte` by folder name; never import
  it. mdsvex `layout` paths must be absolute. See the
  [blog README](src/routes/blog/README.md).
- **No `<title>` in `app.html`.** Browsers use the first one, so it would override every
  page's title.

## Styling

- **Utilities first.** Use Tailwind/Skeleton theme tokens and light/dark pair classes
  (`bg-surface-100-900`). Pairs exist only for mirrored shades (50/950, 100/900, 200/800,
  ...); otherwise use `text-x dark:text-y`. No hex values or hand-picked colors.
- **State goes in variants:** `peer-aria-*`, `group-open:`, `in-target:`, `empty:`,
  `motion-reduce:`, and the custom `js:` and `tall:`.
- **CSS only when classes can't reach the target:** generated markup that needs a full
  stylesheet (`src/prism.css`, written with `@apply`), or an element outside the
  component (e.g. `html:has(...)`). A `<style>` block that restates utilities gets
  deleted.
- **Gate sticky and fixed UI with `tall:`** and reserve its space with scroll padding, so
  it never covers the screen at high zoom or hides focused content.
- **Buttons and summaries get `cursor-pointer`.** Tailwind 4 resets it.

## Accessibility

WCAG 2.2 AA is the minimum.

- **Keyboard first.** Everything is operable by keyboard with a visible focus ring (reuse
  the link style). Escape closes a disclosure only when focus is inside it, then returns
  focus to its toggle.
- **Real names, roles and states.** Native elements first. Toggles get
  `aria-expanded`/`aria-controls` and a stable accessible name. Use `aria-current` for
  "you are here". Decorative icons get `aria-hidden="true"`. No `role="menu"` on
  navigation.
- **Announce changes** in a `role="status"` region that exists before its text changes.
- **Respect user settings.** Animations behind `motion-reduce:`. Targets at least 24x24
  px. Contrast at least 4.5:1 in both color schemes.
- **Axe is not enough.** Reason through keyboard, screen reader, zoom and touch behavior.

## Testing

- **Every behavior change gets a test at the right level:** logic in
  `src/**/*.spec.ts`, components in `*.svelte.spec.ts`, inline-script and cross-page
  behavior in `e2e/`. Component tests can't run inline scripts.
- **Mutation-check every new test.** Break the code it covers (revert the fix, flip a
  condition, change a limit), run the test and confirm it fails for the right reason, then
  restore the code and confirm it passes. Report the result.
- **Test the case that breaks, not the easy one.** Exercise every entry of a list, not
  just the last; a section near the end of a post, not one that scrolls cleanly to the
  top; a fresh page load, not an in-page `#hash` jump.
- **Say when a test can't fail yet.** If current content can't trigger the bug (e.g. a post
  long enough to avoid the edge case), keep the test and report that it passes either
  way.
- **No page list that can go stale unnoticed.** A new page must be tested automatically or
  fail a test. E2E reads `sitemap.xml`; unit tests use `getPagePathnames()` or the route
  manifest, or assert that their list matches it.
- **Mock narrowly.** Don't `importOriginal` `#lib/posts.ts` in browser tests; its glob
  loads every post.

## Code and comments

- **Comments explain why, never what.** Keep one only if a reader would otherwise be
  confused or "fix" the code. No JSDoc that restates a name, no "used by X" notes.
- **Match the surrounding code** in naming, structure and formatting. Run Prettier on the
  files you touch. If it changes whitespace inside inline links, confirm the rendered text
  is unchanged.
- **No dead code**, commented-out code, or `TODO` without an issue number.

## Writing

Applies to docs, comments, commit messages and UI text. Vale enforces the first two rules
and flags filler (`.vale/styles/Site/`); commit messages are on you. Vale also
spell-checks Markdown: fix real typos, and add genuine terms (product names, jargon) to
`.vale/styles/config/vocabularies/Site/accept.txt`.

- **American English** (color, behavior, honor).
- **No em dashes or en dashes.** Use a period, comma, colon or "to".
- **Write like an engineer.** Lead with the point. No filler, hype or restating.

## Dependencies, privacy and content

- **No new dependencies without asking.** Prefer the platform and what's installed.
- **No third-party requests:** no CDNs, web fonts, embeds, trackers or cookies. Analytics
  is the self-hosted Matomo in `+layout.svelte`. Any change to data collection must update
  the [privacy page](src/routes/privacy/+page.svelte).
- **Don't write or edit published copy in Julie's voice** (pages, posts, bio) unless
  asked. Placeholder text must be unmistakable (e.g. lorem ipsum). Never add personal
  details about Julie beyond what's already on the site.

## Git

- **Don't commit or push unless asked.** Branch off `dev` (deploys to dev.jmuzina.io);
  `main` is production.
- **One logical change per commit.** Short, imperative, sentence-case subject matching the
  history (e.g. "Add blog index page"), and a body that explains why.
