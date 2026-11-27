# Blog

Each post is `src/routes/blog/<slug>/+page.md`. The folder name is the URL:
`src/routes/blog/hello-world/+page.md` publishes at `/blog/hello-world`.

## Writing a post

```markdown
---
title: Hello world
date: 2026-12-01
description: One sentence for the blog index and search results.
---

Opening paragraph.

## A section

Write Markdown. Svelte components work here too.
```

| Frontmatter   | Required | Used for                                                                |
| ------------- | -------- | ----------------------------------------------------------------------- |
| `title`       | yes      | the post's `<h1>`, page title, blog index, breadcrumb and feed          |
| `date`        | yes      | sorting (newest first) and the date shown on the post                   |
| `description` | yes      | the blog index, the page's meta description, link previews and feed     |
| `updated`     | no       | the date of a meaningful edit, shown on the post and given to search    |
| `image`       | no       | a link preview image: a path under `static/`, e.g. `/assets/blog/x.png` |
| `imageAlt`    | if image | the preview image's alt text                                            |

The build fails, naming the post, when a required field is missing.

Leave `updated` out for typo fixes: search engines stop trusting a date that changes for
nothing. A preview `image` should be 1200×630 pixels; it isn't shown on the post itself.
Without one, previews use the portrait from the home page.

Start sections at `##`. The `title` is the post's only `<h1>`.

Svelte components in a post render to static HTML; none of their code runs in the browser.
Interactive content needs a plain inline script and a no-JavaScript fallback.
The Markdown copy leaves out `<script>` blocks but keeps component tags as written.

## What every post gets

No wiring needed:

- the post layout ([`BlogPost.svelte`](../../lib/components/BlogPost.svelte))
- a link on the blog index, and an entry in the sitemap, the feed (`/feed.xml`) and `/llms.txt`
- a Markdown copy at its URL plus `.md`, made from the post's source
- link preview tags and `BlogPosting` structured data for search engines
- breadcrumbs back to the blog
- a shareable link on every `##` to `######` heading
- an "On this page" list of `##` and `###` headings, when there are at least two
- syntax highlighting for fenced code blocks (` ```ts `, ` ```svelte `, ` ```css `, etc.)

## Before publishing

Run `pnpm build && pnpm preview` and read the post in light mode, dark mode and on a
phone. Then run `pnpm test:e2e`, which finds new posts in the sitemap and checks
accessibility and navigation.
