# Architecture

How the site is built, and why.

## Stack

| Layer     | Choice                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Framework | [SvelteKit 3](https://svelte.dev/docs/kit) and Svelte 5                                              |
| Output    | `adapter-static`: prerendered HTML, `csr = false`                                                    |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com/), [Skeleton 5](https://skeleton.dev/), Tailwind Typography |
| Content   | [mdsvex](https://github.com/pngwn/MDsveX) with Prism highlighting                                    |
| Icons     | [Lucide](https://lucide.dev/), [Boxicons](https://boxicons.com/)                                     |
| Tests     | Vitest (unit and in-browser components), Playwright (end-to-end and screenshots), axe-core           |
| Tooling   | pnpm 12, Node 26, ESLint, Prettier, markdownlint-cli2, Vale, Dependabot                              |
| CI/CD     | GitHub Actions: check, lint, build, test and screenshot diffs, then deploy                           |

## Client-side rendering is off

`csr = false` is set in [`src/routes/+layout.ts`](src/routes/+layout.ts). The browser gets
prerendered HTML with no Svelte runtime, router or hydration. Interactive pieces are small
inline scripts. Every link is a full page load, so focus, scroll and screen reader
announcements are native browser behavior.

Why not site-wide: it would ship framework JavaScript on every page for a few small
widgets, and the client router would have to reimplement behavior full page loads already
get right.

A route that needs real app behavior (e.g. an interactive map) can opt in with
`export const csr = true` in its `+page.ts`. The deepest setting wins. Exceptions:

| Route  | Why it needs CSR |
| ------ | ---------------- |
| (none) |                  |

## File structure

```text
src/
├── app.html               page shell
├── feed.css               styles feed.xml for people who open it in a browser
├── routes/                one folder per page
│   ├── +layout.svelte     header, breadcrumbs, footer, analytics
│   └── blog/<slug>/+page.md   blog posts, as Markdown files
└── lib/
    ├── routes.ts          list of pages (used by nav, breadcrumbs, sitemap, tests)
    ├── sitemap.ts         builds sitemap.xml from the route files
    ├── posts.ts           collects and validates post frontmatter
    ├── seo.ts             link preview image and structured data for posts
    ├── feed.ts            builds the Atom feed (feed.xml) from the posts
    ├── llms.ts            builds llms.txt, an index of the site for language models
    ├── page-markdown.ts   the Markdown copy of each page (<page>.md), for llms.txt
    ├── markdown/          blog markdown plugins
    └── components/        Svelte components
e2e/                       Playwright tests, uses sitemap to find routes to test automatically
└── visual.spec.ts-snapshots/   screenshot baselines
scripts/
├── e2e-visual.sh          runs the visual tests in the Playwright Docker image
└── e2e-visual-container.sh   the part of e2e-visual.sh that runs inside the container
```

## Deployment

GitHub Actions checks, lints, builds and tests every push. A separate visual job compares
every page in light and dark mode, on desktop Chromium and mobile WebKit, against the
committed screenshots. It runs in the Playwright Docker image, the same one
`pnpm test:e2e:visual` uses, because fonts and text rendering differ between machines.
Deploys wait for both. `dev` deploys to
[dev.jmuzina.io](https://dev.jmuzina.io) and `main` to [jmuzina.io](https://jmuzina.io).
Both serve static files from a VPS, uploaded only when the build output changed.
