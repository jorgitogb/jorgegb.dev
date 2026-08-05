# Design — Mobile & Accessibility

## Files
- `src/layouts/Layout.astro` — add skip link, move theme script to head, system-pref fallback, single shared script.
- `src/pages/index.astro`, `blog.astro`, `projects.astro`, `publications.astro`, `wishlist.astro` — brand `<h1>` becomes `<span>`, `aria-expanded`/`aria-controls` on mobile button, delete the per-page `<script>`.
- `src/styles/global.css` — `:focus-visible` rule, `prefers-reduced-motion` block, tap-target min size.
- `src/pages/index.astro` — image attrs on `profile.jpg`, max-width constraint.
- `src/pages/blog.astro` — fix `href="#"` to `/blog#{slug}`.

## Signatures / contracts
- Mobile menu button: `aria-expanded` toggles `"true"`/`"false"` in lockstep with `mobileMenu.classList.toggle("hidden")`.
- Single shared `<script>` in `Layout`, `is:inline`, runs after `DOMContentLoaded`.
- Theme init: `localStorage.getItem('theme') ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')`.

## Decisions
- Single `Layout` script, not per-page: dedupes about 80 lines, eliminates drift, no functional change.
- Skip link as visually hidden until focus: uses Tailwind's `sr-only` and `not-sr-only` utilities.
- Reduced motion via media query, not JS: pure CSS, respects user preference without JavaScript.

## Rejected alternatives
- Replace nav with a `<details>` element: keyboard UX is worse and exposes no current state.
- Use `headlessui` menu: requires a React dependency for a 4-link dropdown, overkill.
- Move the skip link to a separate component: premature; one anchor in `Layout` is enough.
