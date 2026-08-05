# Design — SEO Meta

## Files
- `astro.config.mjs` — add `integrations: [sitemap()]` from `@astrojs/sitemap`.
- `src/layouts/Layout.astro` — accept new props, render per-page title/desc/og/twitter, JSON-LD slots, theme-color, apple-touch-icon.
- `src/pages/index.astro`, `blog.astro`, `projects.astro`, `publications.astro`, `wishlist.astro` — pass unique props to `Layout`.
- `public/robots.txt` — update sitemap URL.
- Delete `public/sitemap.xml`.
- Add `scripts/build-og.mjs` (one-time) to generate `public/og-default.png` using `sharp`.
- `package.json` — add `sharp` as a dev dependency.

## Signatures
```ts
interface Props {
  title?: string
  description?: string
  canonicalUrl: string
  ogType?: 'profile' | 'website' | 'article'
  ogImage?: { url: string; width: number; height: number; alt?: string }
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}
```

## Decisions
- `@astrojs/sitemap` over hand-maintained XML: auto-generates from `src/pages/`, no drift.
- Props over per-page `<head>` overrides: keeps the head in one place; layout remains the single source of meta.
- JSON-LD via slot prop, not string interpolation: avoids escaping bugs and gets type-checking at build.
- OG default image generated at build time by `sharp` from `public/profile.jpg`: no manual asset updates, consistent image.

## Rejected alternatives
- Inject meta via a separate `<SEO>` component: adds an unnecessary layer since `Layout` already owns the head.
- Hand-write `sitemap.xml`: same as today; will rot (already missing `/blog` and `/projects`).
- `astro-seo` package: extra dependency, no real win over built-in prop forwarding.
- Ship a static `og-default.png`: better to generate from the existing profile image to keep it in sync.
