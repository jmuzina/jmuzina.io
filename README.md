# jmuzina.io

Source for [jmuzina.io](https://jmuzina.io), my personal site. It replaces my
[old Angular portfolio](https://github.com/jmuzina/portfolio).

Stack, code layout and deploys: [ARCHITECTURE.md](ARCHITECTURE.md).

## Running it locally

Requires Node 26, pnpm 12 and [Vale](https://docs.vale.sh/topics/installation)
(`brew install vale`). Node and pnpm are pinned; pnpm downloads the matching Node if needed.

```shell-session
pnpm install
pnpm dev
```

| Task                         | Command                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Dev server                   | `pnpm dev`                                                                           |
| Production build and preview | `pnpm build && pnpm preview`                                                         |
| Type-check                   | `pnpm check`                                                                         |
| Lint (code, Markdown, prose) | `pnpm lint`                                                                          |
| Fix everything fixable       | `pnpm fix` (then reports what's left: type errors, prose)                            |
| Unit and component tests     | `pnpm test` (or `pnpm test:unit`, `pnpm test:component`; `:watch` for either)        |
| End-to-end tests             | `pnpm test:e2e` (first time: `pnpm exec playwright install chromium firefox webkit`) |

## Credits and license

Logo by [Diana Mužina](https://dianamuzina.com).

Code is licensed under [AGPL-3.0](LICENSE).
