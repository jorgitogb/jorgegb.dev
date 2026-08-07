# Progress — History

> Append-only log of completed sessions. Newest entry at the bottom.

---

## 2026-08-07 — SEO, rendering, and mobile improvements

Completed three SDD features: `build-hardening`, `mobile-a11y`, `seo-meta`.

### build-hardening
- Added `rm -rf dist` and `pnpm astro build` to `init.sh` between type-check and tests.
- Added build-artifact existence checks for `dist/index.html` and the four child-page `index.html` files.
- Created `tests/smoke.test.ts` using `node:test` and `@astrojs/compiler` to compile each Astro page and assert a default export with zero diagnostics.
- Added `test:smoke` and updated `test` script in `package.json`.
- Files: `init.sh`, `package.json`, `tests/smoke.test.ts`.

### mobile-a11y
- Moved brand "jorgegb.dev" from `<h1>` to `<span>` so each page has one `<h1>`.
- Added skip-to-content link and `id="main"` targets.
- Added `aria-expanded`/`aria-controls` to mobile menu buttons and close-menu-on-link behavior.
- Added global `:focus-visible` outline, `prefers-reduced-motion` support, and 44x44 tap targets.
- Moved theme-init inline script to `<head>` with `matchMedia` fallback, eliminating FOUC.
- Deduplicated per-page scripts into a single `Layout.astro` script.
- Added `loading="lazy"`, `decoding="async"`, width/height, and `max-w-[16rem]` to `profile.jpg`.
- Fixed blog "Read more" links to `/blog#{slug}`.
- Removed misleading "React" from footer copy.
- Files: `src/layouts/Layout.astro`, `src/styles/global.css`, `src/pages/index.astro`, `src/pages/blog.astro`, `src/pages/projects.astro`, `src/pages/publications.astro`, `src/pages/wishlist.astro`.

### seo-meta
- Added `@astrojs/sitemap` integration and deleted static `public/sitemap.xml`; updated `robots.txt`.
- Made `Layout.astro` accept `title`, `description`, `ogType`, `ogImage`, and `jsonLd` props; rendered per-page title/description/OG/Twitter, theme-color, and apple-touch-icon.
- Passed unique props from each of the 5 pages.
- Added JSON-LD: `Person` + `WebSite` on homepage, `CollectionPage` + `BlogPosting` on `/blog`, `CollectionPage` on `/projects`, `ScholarlyArticle` on `/publications`.
- Created `scripts/build-assets.mjs` to generate `public/og-default.png` (1200x630) and `public/apple-touch-icon.png` (180x180) using `sharp`.
- Files: `astro.config.mjs`, `package.json`, `public/robots.txt`, `src/layouts/Layout.astro`, `src/pages/*.astro`, `scripts/build-assets.mjs`, plus generated PNGs.

### Verification
- `./init.sh` passes with 0 errors, 0 warnings, and all 5 smoke tests green.
- `pnpm astro build` emits all 5 pages and `dist/sitemap-index.xml`/`dist/sitemap-0.xml`.
- Built HTML inspected for unique per-page `<title>`, description, OG/Twitter tags, theme-color, apple-touch-icon, and JSON-LD.

