# Tasks — Mobile & Accessibility

- [x] T1 — Change brand text in all 4 page headers from `<h1>` to `<span>`, keeping the same classes. Covers: R1.
- [x] T2 — Add skip-to-content link in `Layout.astro` (first child of `<body>`), with `id="main"` on `<main>`. Covers: R2.
- [x] T3 — Add `aria-expanded="false"` and `aria-controls="mobile-menu-dropdown"` to mobile menu buttons in all 4 pages; toggle `aria-expanded` on click in the shared script. Covers: R3.
- [x] T4 — In the shared script, add `mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')))`. Covers: R4, R15.
- [x] T5 — Add `:focus-visible` global rule in `global.css`. Covers: R5.
- [x] T6 — Add `min-w-[44px] min-h-[44px]` to theme toggle and mobile menu buttons in all 4 pages. Covers: R6.
- [x] T7 — Add `prefers-reduced-motion` block in `global.css` zeroing transition and hover transform. Covers: R7, R15.
- [x] T8 — Move theme-init inline script to `<head>` and add `matchMedia` fallback. Covers: R8, R9.
- [x] T9 — Delete per-page `<script>` blocks in all 4 pages; add one `<script is:inline>` in `Layout.astro` that handles theme, menu, and close-on-link-click. Covers: R10.
- [x] T10 — Add `loading="lazy"`, `decoding="async"`, `width="256"`, `height="256"`, and `max-w-[16rem]` to `profile.jpg` `<img>` in `index.astro`. Covers: R11, R12.
- [x] T11 — Replace `href="#"` with `href={`/blog#${post.slug}`}` in `blog.astro`. Covers: R13.
- [x] T12 — Change footer "Built with Astro, React, and TypeScript" to "Built with Astro and TypeScript" in all 4 pages. Covers: R14.
- [x] T13 — Run `./init.sh`; manual smoke test in DevTools mobile emulator (375x667, 768x1024) for: skip link visible on Tab, focus ring on every interactive, menu toggles `aria-expanded`, menu closes on link tap, no FOUC on dark reload, reduced-motion disables lift on hover. Covers: all.

## Traceability
| R | Test |
|---|------|
| R1 | `grep -r '<h1' src/pages` returns only one match per page in `<main>` |
| R2 | Tab from `/` shows the skip link; Enter jumps focus to `<main>` |
| R3 | DevTools: mobile menu button has `aria-expanded` that toggles on click |
| R4 | Open menu, click a link, menu hides |
| R5 | Tab through any page; visible 2px outline on each focusable |
| R6 | DevTools: button bounding box is at least 44x44 |
| R7, R15 | DevTools: emulate `prefers-reduced-motion: reduce`; no transition or lift animation |
| R8, R9 | Clear localStorage, set OS to dark, reload; page is dark on first paint with no white flash |
| R10 | `grep -c '<script' src/pages/*.astro` returns exactly one match in `Layout.astro` only |
| R11, R12 | DevTools: image has `loading="lazy"`; rendered width is at most 256px |
| R13 | Click "Read more" on a blog card; URL has the slug fragment, no 404 |
| R14 | `grep -r "React" src/pages` returns 0 matches |
