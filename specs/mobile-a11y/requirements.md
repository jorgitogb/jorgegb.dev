# Requirements — Mobile & Accessibility

## R1
The system MUST render the brand "jorgegb.dev" in the header as a `<span>` (not `<h1>`) on every page so each page has exactly one `<h1>` in its main content.

## R2
The system MUST add a "Skip to content" link as the first focusable element in `<body>` of `Layout.astro`, visible only on focus, that jumps focus to `<main>` via an `id="main"` target.

## R3
The system MUST add `aria-expanded` and `aria-controls="mobile-menu-dropdown"` to the mobile menu toggle button on every page, reflecting open/closed state on click.

## R4
WHEN a user clicks a link inside the open mobile menu, the system MUST close the menu.

## R5
The system MUST add a global `:focus-visible` outline rule in `global.css` (2px solid `var(--primary-blue)`, 2px offset) so keyboard focus is always visible.

## R6
The system MUST increase the tap target of the theme toggle and mobile menu buttons to a minimum 44x44 CSS pixels (e.g. wrap the icon in `p-3` or use `min-w-[44px] min-h-[44px]`).

## R7
The system MUST add `@media (prefers-reduced-motion: reduce)` rules in `global.css` that disable transitions and `transform: translateY` on hover.

## R8
The system MUST update the theme-init inline script in `Layout.astro` to read `window.matchMedia('(prefers-color-scheme: dark)').matches` as a fallback when no `localStorage` value exists.

## R9
The system MUST move the theme-init inline script from `<body>` to `<head>` and mark it `is:inline` to eliminate the dark-mode flash on load.

## R10
The system MUST replace the per-page `<script>` block duplicated across 4 pages with a single `<script>` in `Layout.astro`.

## R11
The system MUST add `loading="lazy"`, `decoding="async"`, and explicit `width`/`height` to the `<img>` tag rendering `/profile.jpg` on the homepage.

## R12
The system MUST constrain `profile.jpg` to `max-w-[16rem]` so it does not exceed 256px on any viewport.

## R13
The system MUST fix the broken "Read more" link in `src/pages/blog.astro` to point to `/blog#{slug}`.

## R14
The system MUST remove "React" from the footer copy "Built with Astro, React, and TypeScript" on every page, leaving "Built with Astro and TypeScript".

## R15
IF a user has `prefers-reduced-motion: reduce` set, the system MUST not animate the mobile menu open/close (instant show/hide).
