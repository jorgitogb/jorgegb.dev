# Review — research-supplier-page

Reviewer: single agent (the `reviewer` subagent is unavailable on this plan tier, so the
review was executed directly and scripted against the build output plus headless Chromium).

Evidence: `progress/impl_research-supplier-page.md`, a scripted parse of `dist/**`, and
Playwright measurements of the real build served over HTTP. Base: `origin/master` at `9ccaccf`.

## Traceability report

| Req | Result | Evidence |
|-----|--------|----------|
| R1 | ✅ | `dist/research/supplier-data/index.html` emitted; listed by `init.sh` |
| R2 | ✅ | Parsed `<main>` text contains all German markers; zero English body-copy markers |
| R3 | ✅ | `research-badge` occurs before `<h1>`; renders as a bordered mono chip |
| R4 | ✅ | Exactly one `<h1>` inside `<main>` with the exact headline; header logo is a `<span>` |
| R5 | ✅ | "Ich untersuche derzeit … Excel- oder CSV-Datei ankommen." |
| R6 | ✅ | `<ul>` contains exactly 5 `<li>` |
| R7 | ✅ | Exact string `Ich verkaufe aktuell kein Produkt.` present |
| R8 | ✅ | `<ol>` = 5 `<li>` numbered `1,2,3,4,5`, all visible without interaction |
| R9 | ✅ | "Wenn Sie eine anonymisierte Beispieldatei bereitstellen können…" |
| R10 | ✅ | `mailto:` list = `['mailto:me@jorgegb.dev']`; exactly one LinkedIn URL — the existing profile |
| R11 | ✅ | `<title>` = `Supplierdaten aus Excel/CSV – Research \| Jorge` |
| R12 | ✅ | `meta description` = the exact specified string |
| R13 | ✅ | `<html lang="de">` via the new `lang` prop |
| R14 | ✅ | `link[rel=canonical]` **and** `og:url` = `https://jorgegb.dev/research/supplier-data` |
| R15 | ✅ | `meta robots` = `index, follow` (from `Layout`) |
| R16 | ✅ | 6 pages × 2 nav positions = 12 `href="/research/supplier-data"`; browser confirms 2 per page |
| R17 | ✅ | Other 5 pages keep their own titles and `lang="en"` |
| R18 | ✅ | `.section`, `.container`, `.card`, `var(--primary-blue)`; verified light **and** dark |
| R19 | ✅ | No newsletter / pricing / testimonial / demo / chatbot / analytics / `<form>` wording |
| R20 | ✅ | Chromium at 375/768/1024/1440: `scrollWidth ≤ innerWidth` on **all 6 pages**; no keyframe animations |
| R21 | ✅ | `dist/sitemap-0.xml` contains the new `<loc>`; `public/sitemap.xml` absent |
| R22 | ✅ | `./init.sh` exit 0: astro check 0 errors, build OK, 6 artifacts, **6/6 smoke tests** |
| R23 | ✅ | `#mobile-menu-btn` display `flex` at 375/1023, `none` at 1024/1440; desktop nav `none` at 375/1023, `flex` at 1024/1440 |

**All tasks completed:** ✅ (T1–T8 all `[x]`)

## Verdict
APPROVED

## Notes

1. **R4 is now satisfied cleanly.** The earlier attempt had to work around a second `<h1>`
   (the header logo). On this base the logo is a `<span>`, so the page's headline is its only
   `<h1>` — verified as `main h1 count=1`.

2. **R23 is a pre-existing bug, fixed as a prerequisite.** `origin/master` shipped
   `#mobile-menu-btn` with both `lg:hidden` and an unprefixed `flex`; the built CSS emits
   `.flex` after `.lg\:hidden`, so the hamburger was visible on desktop at ≥1024px on **every**
   page (confirmed before the change). Adding a 9th desktop nav item pushed the homepage to
   `scrollWidth 1031 > 1024`. Verified that removing only the Research link returned it to
   exactly 1024, and that hiding only the button also returned it to 1024 — i.e. the nav item
   and the broken media query were jointly responsible. The user approved fixing the media
   query rather than shrinking the nav gap.

3. **Scope kept tight.** Deliberately untouched: `global.css` (the unlayered reset still
   inverts Tailwind's margin/padding layering site-wide), `astro.config.mjs`, stale
   `package-lock.json`, and the still-tracked `.astro/content.d.ts` / `.astro/types.d.ts`.

4. **Two test-harness fixes were required**, not optional: the smoke test's non-recursive
   `readdirSync` would have skipped `src/pages/research/` entirely, and `@astrojs/compiler`
   (imported directly by that test) was never declared, so a clean `pnpm install` under
   pnpm 12 left `ERR_MODULE_NOT_FOUND`. Both are now fixed — `require_tests_to_close`
   in `feature_list.json` is satisfied by real coverage of the new page.

5. **Open for the human:** `<title>` uses `Supplierdaten …` while the `<h1>` and meta
   description use natural German `Lieferantendaten`. Left as specified.
