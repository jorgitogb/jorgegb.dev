# Tasks — SEO Meta

- [x] T1 — Add `@astrojs/sitemap` and `sharp` to `package.json` and wire the sitemap integration in `astro.config.mjs`. Delete `public/sitemap.xml`. Update `public/robots.txt`. Covers: R7, R8, R9.
- [x] T2 — Extend `Layout.astro` Props interface and head block to consume `title`, `description`, `ogType`, `ogImage`, `jsonLd`, emit per-page meta, theme-color, apple-touch-icon. Covers: R1, R2, R3, R6, R10, R11.
- [x] T3 — Pass unique props from each of the 5 pages to `Layout`. Covers: R4, R5.
- [x] T4 — Add `WebSite` JSON-LD on homepage, `CollectionPage` on `/blog` and `/projects`, `BlogPosting` per post, `ScholarlyArticle` per publication. Covers: R12, R13.
- [x] T5 — Add `scripts/build-assets.mjs` that resizes `public/profile.jpg` to 1200x630 and writes `public/og-default.png`, and renders `public/logo.svg` to 180x180 `public/apple-touch-icon.png`; run it and commit the PNGs. Covers: R11, R14.
- [x] T6 — Run `./init.sh` and `pnpm astro build`; confirm all 5 pages emit, `dist/sitemap-index.xml` exists, and `dist/sitemap-0.xml` lists 5 URLs. Covers: R7, R8, R9.

## Traceability
| R | Test |
|---|------|
| R1, R2, R3, R6 | `pnpm astro build`; inspect each page's `<head>` for unique title, description, og, and twitter tags |
| R4, R5 | Same inspection per route |
| R7, R8, R9 | `dist/sitemap-0.xml` lists `/`, `/blog`, `/projects`, `/publications`, `/wishlist` |
| R10 | Grep rendered HTML for both `theme-color` media queries |
| R11 | Grep for `apple-touch-icon` link |
| R12, R13 | Grep for `application/ld+json` per page; validate the JSON parses |
| R14 | `ls public/og-default.png`; rendered HTML has `<meta property="og:image" content="...og-default.png">` when the prop is omitted |
