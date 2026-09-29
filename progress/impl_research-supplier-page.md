# Implementation report — research-supplier-page

Status: implemented and verified against `origin/master` (`9ccaccf`).
Feature id: **6** (ids 1-5 are taken upstream). `feature_list.json` status: `in_progress`.

## Rebase note

The first attempt at this feature was built on a base that was 5 commits behind
`origin/master`. Those commits landed `seo-meta`, `mobile-a11y` and `build-hardening`,
which made part of that work redundant or wrong. All of it was discarded and redone
against the current base:

| First attempt | Now |
|---|---|
| Added `title` / `description` props to `Layout` | Upstream already provides them — only `lang` was added |
| Edited hand-written `public/sitemap.xml` | File is deleted upstream; `@astrojs/sitemap` emits `dist/sitemap-0.xml` |
| Added `header h1 { font-size: 1.25rem }` to `global.css` | Header logo is now a `<span>` — rule unnecessary, not applied |
| Feature `id: 3` | Renumbered to `id: 6` (collided with `build-hardening`) |
| Page copied the old header + a duplicate inline theme script | Rewritten from the post-`mobile-a11y` `wishlist.astro`; no inline script, `<main id="main">` |
| "No test framework" premise | `node --test` smoke tests now exist and `require_tests_to_close` is true |

## What changed

- `src/layouts/Layout.astro` — `lang?: string` (default `'en'`) → `<html lang={lang}>`.
- `src/pages/research/supplier-data.astro` — new page; German body copy, `WebPage` JSON-LD,
  header/footer matching the current base, scoped `<style>` block.
- `src/pages/{index,publications,projects,blog,wishlist}.astro` — "Research" nav link,
  desktop row + mobile dropdown (12 links across 6 pages).
- `src/pages/{all 6}.astro` — `#mobile-menu-btn`: `flex` → `max-lg:flex` (R23).
- `tests/smoke.test.ts` — recursive `readdirSync`; `@astrojs/compiler` declared.
- `init.sh` — `research/supplier-data` added to the `dist/` checks.
- `feature_list.json` — feature id 6, `in_progress`.
- `.gitignore` — `/pnpm-workspace.yaml`.
- Untracked: `.astro/settings.json` (gitignored, timestamp-only churn).

## Verification evidence

### `./init.sh` — exit 0

```
[OK]    feature_list.json valid (6 features)
[OK]    Specs present for sdd features with non-pending status
[OK]    Astro type checks pass        (0 errors, 0 warnings)
[OK]    Astro build succeeded
[OK]    dist/research/supplier-data/index.html exists
ℹ tests 6   ℹ pass 6   ℹ fail 0
[OK]    Environment ready. You can start working.
```

### Built HTML (static parse of `dist/`)

- `lang="de"`; `title` and `meta description` exact; `link[rel=canonical]` and `og:url` both
  `https://jorgegb.dev/research/supplier-data`; `robots = index, follow`; `twitter:card = summary_large_image`.
- Exactly one `<h1>` inside `<main>`; header logo is `<span class="text-xl">`.
- `<ul>` = 5 `<li>`; `<ol>` = 5 `<li>` numbered 1-5.
- Exactly one `mailto:` (`me@jorgegb.dev`) and one LinkedIn URL.
- Exactly 2 `<script>` tags: Layout's shared theme script + the `WebPage` JSON-LD.
- `skip-link` present, `<main id="main">` present.
- Other 5 pages keep their own titles (`Jorge GB — …`, `Blog — …`, `Projects — …`,
  `Scientific Publications — …`, `Wishlist — …`) and `lang="en"`.
- `href="/research/supplier-data"` appears **12 times** (6 pages × desktop + mobile).
- Forbidden-content scan (newsletter / pricing / testimonial / demo / chatbot / analytics /
  `<form>` / automation wording): **no hits**.
- `dist/sitemap-0.xml` contains `https://jorgegb.dev/research/supplier-data/`;
  `public/sitemap.xml` is absent.

### Headless Chromium (Playwright, real build served over HTTP)

```
36/36 passed
```

- **Overflow**: `scrollWidth ≤ innerWidth` at 375, 768, 1024, 1440 for all 6 pages (24 checks).
- **Mobile menu**: opens, exposes the Research link, sets `aria-expanded=true`.
- **Layout metrics** on the new page at 1440: `lang=de`, logo `20px`, badge
  `padding 4.8px 11.2px` + `1px solid rgb(59,130,246)`, prose `width 768px` centred
  (`x=336`), `h1` margin-top `16px`, `h2` `44px`, list `gap 12px`, 5 question numbers in
  `rgb(59,130,246)`, header `position: sticky`, 1 `h1` in `main`.
- **Dark mode**: `html.dark` set, body `rgb(2,6,23)` / text `rgb(226,232,240)`.
- **Homepage at 1024**: `Research=2`, `scrollWidth=1024` (no overflow).

### R23 regression check (`#mobile-menu-btn` display)

```
w=375   hamburger=flex   desktopNav=none   overflow=false
w=1023  hamburger=flex   desktopNav=none   overflow=false
w=1024  hamburger=none   desktopNav=flex   overflow=false
w=1440  hamburger=none   desktopNav=flex   overflow=false
```

Before the fix, `hamburger=flex` at 1024 and 1440 (the cascade conflict), and the homepage
measured `scrollWidth 1031 > innerWidth 1024`.

## Known issues deliberately left alone

- `package-lock.json` is stale upstream (missing `@astrojs/sitemap`); not touched.
- `package.json`'s `pnpm.onlyBuiltDependencies` is no longer read by pnpm 12 (it warns);
  `pnpm-workspace.yaml` now carries `allowBuilds` and is gitignored.
- `global.css`'s unlayered reset still inverts Tailwind's margin/padding layering site-wide.
- `.astro/content.d.ts` and `.astro/types.d.ts` remain tracked (only `.astro/settings.json`
  was untracked, as agreed).
