# Tasks — Research Supplier Data Page

- [x] T1 — Add an optional `lang?: string` prop (default `'en'`) to `src/layouts/Layout.astro` and render `<html lang={lang}>`. `title`, `description`, `canonicalUrl`, `ogType`, `ogImage` and `jsonLd` already exist upstream (`seo-meta`) and are reused as-is. Covers: R13, R17.
- [x] T2 — Create `src/pages/research/supplier-data.astro` with the German content, badge, headline, bullet list, statement, 5 questions, invitation, and contact links. Covers: R1–R10, R18–R20.
- [x] T3 — Add the "Research" nav link (desktop row + mobile dropdown) to `index.astro`, `publications.astro`, `projects.astro`, `blog.astro`, `wishlist.astro`. Covers: R16.
- [x] T4 — Verify the new URL appears in the `@astrojs/sitemap` output (`dist/sitemap-0.xml`); leave `public/sitemap.xml` deleted. Covers: R21.
- [x] T5 — Add the feature to `feature_list.json` (id 6 — ids 1-5 are taken upstream) and keep `specs/` in sync. Covers: process.
- [x] T6 — Run `./init.sh` and `pnpm astro build`, then verify the built HTML for the new route's title, description, canonical, lang, robots, JSON-LD, and the 12 nav links across the 6 pages. Covers: R22, R11–R17.
- [x] T7 — Make `tests/smoke.test.ts` walk `src/pages/` recursively so the new `research/` subdirectory is covered, declare its `@astrojs/compiler` import as a devDependency, and add `research/supplier-data` to the `dist/` checks in `init.sh`. Covers: R22, process (`require_tests_to_close`).
- [x] T8 — Fix the mobile menu button's cascade conflict (`lg:hidden … flex` → `lg:hidden … max-lg:flex`) on all 6 pages so the hamburger is hidden ≥1024px. Covers: R20, R23.

## Traceability

| Requirement | Verification (`./init.sh` / build inspection / headless Chromium) |
|-------------|--------------------------------------------------------|
| R1 | `dist/research/supplier-data/index.html` exists after build |
| R2 | Parsed `<main>` text: German markers present, no English body-copy markers |
| R3 | `research-badge` span occurs before `<h1>` in the built HTML |
| R4 | Exactly one `<h1>` inside `<main>` with the exact headline |
| R5 | Intro paragraph present in built HTML |
| R6 | `<ul>` with exactly 5 `<li>` |
| R7 | Exact string "Ich verkaufe aktuell kein Produkt." |
| R8 | `<ol>` with exactly 5 `<li>` numbered 1-5, no interaction required |
| R9 | Sentence about anonymisierte Beispieldatei present |
| R10 | `mailto:` list = `['mailto:me@jorgegb.dev']`, LinkedIn profile URL — exactly one each |
| R11 | `<title>` in built HTML |
| R12 | `meta[name="description"]` in built HTML |
| R13 | `<html lang="de">` in built HTML |
| R14 | `link[rel="canonical"]` + `og:url` in built HTML |
| R15 | `meta[name="robots"]` = `index, follow` (provided by `Layout`) |
| R16 | 6 built pages × 2 nav positions = 12 `href="/research/supplier-data"` |
| R17 | Built pages keep their own titles (`Jorge GB — …`, `Blog — …`, …) and `lang="en"` |
| R18 | Uses `.section`, `.container`, `.card`, `var(--primary-blue)`; verified light **and** dark |
| R19 | No `newsletter` / `pricing` / `testimonial` / `chat` / analytics / `<form>` in the new page |
| R20 | Headless Chromium at 375 / 768 / 1024 / 1440: `scrollWidth ≤ innerWidth` on all 6 pages |
| R21 | `dist/sitemap-0.xml` contains the new `<loc>`; `public/sitemap.xml` absent |
| R22 | `./init.sh` exit 0 (astro check + build + 6 artifact checks + 6 smoke tests) |
| R23 | `getComputedStyle('#mobile-menu-btn').display` = `none` at 1024/1440, `flex` at 375/1023; desktop nav = `flex` at 1024/1440, `none` at 375/1023 |
