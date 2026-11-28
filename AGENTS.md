# AGENTS.md

Rules for AI coding agents working on this repo. If a request conflicts with a rule, ask
before acting.

## Read first

- [ARCHITECTURE.md](ARCHITECTURE.md): stack, code layout, deploys.
- The files you'll change and their tests. Check `src/lib/` for an existing helper before
  writing one.
- Skills live in `.github/skills/`, each linked from `.claude/skills/` for Claude Code. To
  review a change, follow [code-review](.github/skills/code-review/SKILL.md).

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
pnpm lint:build      # vale, with spelling, on the built HTML (after build); CI runs this
pnpm lint:fix        # fix what the linters can
pnpm fix             # lint:fix, then check + lint to report what's left
pnpm test            # test:unit (node) + test:component (in Chromium, Firefox, WebKit)
pnpm exec vitest run <file>  # one Node spec; a browser spec: pnpm test:component <file>
pnpm test:e2e        # playwright against the built site; first: pnpm exec playwright install chromium firefox webkit
pnpm test:e2e:visual # screenshot diffs in the Playwright Docker image; :update rewrites baselines
pnpm build           # prerender to build/; fails on broken internal links
```

New scripts follow `task`, `task:scope`, `task:mode` (e.g. `test:unit:watch`), and scripts
call each other with `pnpm run`.

`test:e2e` serves the build on a port derived from the checkout's path and fails if something
already listens there. Set `E2E_PORT` to pick another port.

Locally, `test:component` and `test:e2e` run two workers, so suites in parallel worktrees
don't starve each other. **A timeout is a failure.** Report it with its output like any other.
Don't rerun until it passes, and don't raise a timeout or the worker count to get green. If
you think load caused it, say what else was running.

## Sandbox and environment

Every command runs in the sandbox. `.claude/settings.json` turns off the unsandboxed retry,
so `dangerouslyDisableSandbox` does nothing. Only its `excludedCommands` run outside, and
only when the call is that command alone, written as listed: no pipe, redirect, `cd` or
`&&` around it. Anything else that can't run in the sandbox is a finding to report, not a
step to work around.

- **Browser tests run outside the sandbox.** Seatbelt stops Chromium and WebKit from
  launching, so `pnpm test`, `pnpm test:component` and `pnpm test:e2e` are excluded. Run
  them as plain commands, with arguments if needed (`pnpm test:component <file>`,
  `pnpm test:e2e --project desktop-chromium`). A pipe, redirect or `&&` keeps the call
  sandboxed, where the browsers crash and a run can hang beyond your reach. `test:unit` and
  Node specs run sandboxed. If a browser test fails with a sandbox error anyway, report it.
  Don't skip it.
- **Install without scripts.** `pnpm install` writes the shared pnpm store, which stays out
  of the sandbox on purpose, so don't report this as friction. Run exactly
  `pnpm install --frozen-lockfile --ignore-scripts`, which is excluded, then
  `pnpm run prepare`. A new worktree has no `node_modules`, so it needs this first. Without
  `--ignore-scripts`, install would run `prepare` (`svelte-kit sync`) outside the sandbox,
  and that loads `vite.config.ts` and code under `src/`. After a Playwright upgrade, run
  exactly `pnpm exec playwright install chromium firefox webkit`.
- **Node 26.10 is pinned** (`devEngines`). With another Node on `PATH`, pnpm downloads 26.10.
  Use `pnpm exec`, not `npx`, which runs the system Node.
- **Don't hunt for or kill processes.** A sandboxed command can't see or signal processes it
  didn't start. Playwright starts and stops its own preview server and fails rather than
  reuse one, so a busy port means another checkout's run: set `E2E_PORT` or report it.
- **GitHub is outside the sandbox.** Sandboxed commands can't reach it. `git push`,
  `git fetch`, `git pull` and `gh` are excluded, so run them as plain commands. A push
  written another way (`/usr/bin/git push`, `sh -c 'git push'`) stays sandboxed and fails.
- **Visual baselines come from CI.** `pnpm test:e2e:visual` needs Docker, which agents
  can't run. When screenshots differ, CI's visual job uploads the updated baselines as the
  `visual-baselines` artifact. With Julie's approval to push, fetch them with
  `gh run download <run-id> -n visual-baselines -D e2e/visual.spec.ts-snapshots`. A
  screenshot diff is a failing test until Julie says otherwise: one the change doesn't
  explain is a bug to report, not a baseline to update. Commit fetched baselines only after
  Julie has looked at the `visual-diff` report and approved the change, and say so in the
  commit message. Julie runs the Docker suite locally; on Apple Silicon it needs Docker
  Desktop's Rosetta setting, because Chromium crashes under QEMU.
- **Temp files:** `$TMPDIR` differs between sandboxed and excluded commands. When a task
  mixes them, share files through the absolute path of the session scratchpad.
- **Worktrees:** use Claude Code's built-in ones (`.claude/worktrees/<name>/`). They branch
  from the current `HEAD` (`worktree.baseRef` in `.claude/settings.json`), and the sandbox
  lets the session write them. Plain `git worktree add` can't run: the sandbox keeps
  `.git/worktrees` read-only. `git worktree remove` is excluded, for removing a worktree
  once Julie approves its work (see [Git](#git)).
- **Commit unsigned.** Julie signs her own commits with GPG, but `gpg` can't reach its agent
  from the sandbox. When asked to commit, use `git -c commit.gpgsign=false commit`, and
  `git rebase --no-gpg-sign` for a rebase, because `-c commit.gpgsign=false` doesn't reach
  `rebase --continue`. Both run sandboxed.

## How to work

- **Do only what was asked.** No drive-by refactors, renames, reformatting or extra
  features. Mention other problems you find; don't fix them.
- **Don't trade the project for the task.** Quality rots when each task steps around what's
  wrong to get itself done. If something is unwieldy, contradictory or broken for a
  visitor, a developer or an agent (rules that conflict, docs that don't match the code, a
  check that can't fail, a step that needs a workaround every time), don't push past it
  quietly. Report what you hit and what it cost, even if you worked around it, so Julie can
  ask for a fix or for a brief to hand to another agent. A finished task that hides a
  problem is worse than one that surfaces it.
- **Make the smallest change that works.** No speculative abstractions or options. Three
  similar lines beat a premature helper.
- **Read before editing.** Don't guess at an API, class name or URL. Check
  `node_modules`, the docs or the compiled output.
- **Verify, then report.** Done means `check`, `lint` (touched files), `test`, `build`
  and the relevant e2e tests pass, and visual changes have been checked in light, dark
  and mobile. Report failures and skipped steps. Never weaken or delete a test to make it
  pass.
- **Ask before anything hard to undo:** new dependencies, deleting files, CI or deploy
  changes, commits, pushes. `.claude/settings.json` prompts for commits, pushes, `pnpm add`,
  GitHub writes through `gh` (PRs, issues, runs, `gh api`) and file edits to CI,
  `package.json` and the lockfile, and sandboxed commands can't write
  those files (so `pnpm lint:fix` can't fix them: apply what `pnpm lint` reports with the
  Edit tool). These catch the usual forms, not every one, so the rule is still yours to keep.

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
  first paint, so nothing flashes. A control that does nothing until its own script runs
  also gets the `hidden` attribute, which that script removes, so it never shows without
  its behavior (see the nav toggle).
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

- **Keyboard first.** Everything is operable by keyboard with a visible focus ring: the
  site ring, the `focus-ring` utility. Escape closes a disclosure only when focus is inside it, then returns
  focus to its toggle.
- **The focus ring is a default in `@layer components`**, not `base`, where preflight's
  `:-moz-focusring { outline: auto }` can win in Firefox, so elements get it without a
  class. The Tab test in `e2e/a11y.spec.ts`
  fails any other ring that isn't on its allowlist.
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
  behavior in `e2e/`. A component mount does run inline scripts, but on client-rendered
  markup with no `app.html` (so no `.js` class), and the test only sees the markup after
  the script changed it. Only e2e loads the prerendered HTML a visitor gets.
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
  history (e.g. "Add blog index page"). An agent's commit, or a message it drafts, also gets
  a body that explains why. Julie's own commits may have none.
- **No co-author trailers.** Never add `Co-Authored-By` or any other attribution line to a
  commit message.
- **A worktree task ends in a commit, and the worktree stays until Julie approves it.**
  When Julie asks for work in a worktree, that request is also the ask to commit:
  1. Make a built-in worktree. It starts from the current `HEAD`; if the task names another
     base (`dev` when none is named), run `git reset --hard <base>` in the new worktree
     before any work.
  2. Do and verify the work there. Leave the main checkout alone: don't switch its branch or
     change its files, because another session may be using it.
  3. Commit unsigned on the worktree's branch (see
     [Sandbox and environment](#sandbox-and-environment)). Don't push.
  4. Keep the worktree, so Julie can review and run the work in it. Only after she says the
     work is OK, remove it with `git worktree remove <path>`. That keeps the branch, which
     she can then check out in the main checkout. Never delete the branch.
