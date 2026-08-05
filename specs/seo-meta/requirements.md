# Requirements — SEO Meta

## R1
The system MUST accept `title`, `description`, `ogType`, and `ogImage` props on `Layout.astro` and render them as the page `<title>`, `<meta name="description">`, `<meta property="og:type">`, and `<meta property="og:image">` respectively.

## R2
WHEN `Layout.astro` renders a page, the system MUST set `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:url">`, `<meta name="twitter:title">`, `<meta name="twitter:description">`, and `<meta name="twitter:image">` to values derived from the page props and `canonicalUrl`.

## R3
The system MUST default `title` to "Jorge GB — Software Developer" and `description` to "Portfolio of Jorge García Brizuela, scientific software engineer at IPK Leibniz Institute" when the prop is omitted.

## R4
WHEN the homepage renders, the system MUST keep the existing `Person` JSON-LD and the same default `title` and `description`.

## R5
WHEN `/blog`, `/projects`, `/publications`, or `/wishlist` renders, the system MUST set a unique `title` and `description` per page (e.g. "Blog — Jorge GB", "Projects — Jorge GB", "Scientific Publications — Jorge GB", "Wishlist — Jorge GB").

## R6
WHERE the `ogImage` prop is provided, the system MUST include `og:image:width` and `og:image:height` derived from the image file.

## R7
The system MUST integrate `@astrojs/sitemap` in `astro.config.mjs` so that `/sitemap-index.xml` is generated at build time including all static pages and the homepage.

## R8
The system MUST delete the static `public/sitemap.xml` file.

## R9
The system MUST add a `public/robots.txt` line referencing the new sitemap URL `/sitemap-index.xml`.

## R10
The system MUST add `<meta name="theme-color" content="#0f172a">` for dark mode and `<meta name="theme-color" content="#f8fafc">` for light mode via a `<meta name="theme-color" media="(prefers-color-scheme: dark)" ...>` pair.

## R11
The system MUST add an `apple-touch-icon` link in `Layout.astro` pointing to `/apple-touch-icon.png` (180x180, generated from `public/logo.svg` at build time or added as a static asset).

## R12
The system MUST add a `WebSite` JSON-LD block on the homepage, a `CollectionPage` JSON-LD on `/projects` and `/blog`, and a `ScholarlyArticle` JSON-LD per item on `/publications` (one block per publication card).

## R13
The system MUST add a `BlogPosting` JSON-LD per post on `/blog` and on the homepage blog section (using `posts` from `src/data/blog-posts.ts`).

## R14
IF an `ogImage` URL is not supplied, the system MUST fall back to `https://jorgegb.dev/og-default.png` (a generated 1200x630 PNG derived from the profile image).
