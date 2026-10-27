@AGENTS.md

## Conventions

- Blog posts are Markdown files in `src/content/blog/`, with a collection defined in `src/content.config.ts`. The post page is `src/pages/blog/[slug].astro`.
- `src/data/blog-posts.ts` reads those files with `node:fs` for the `/blog` and home pages and for the node tests, because tests can't import `astro:content`.
- Post body styling is the hand-written `.prose` rules in `src/styles/global.css`; no typography plugin.
- Shared UI pieces live in `src/components/` (e.g. `BlogCard.astro`); small helpers in `src/lib/`.
