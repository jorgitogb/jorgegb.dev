# Requirements — Research Supplier Data Page

## R1
The system MUST serve a static page at `/research/supplier-data`, built from `src/pages/research/supplier-data.astro`.

## R2
The page MUST contain only simple, natural German text; it MUST NOT contain English body copy.

## R3
WHEN the page renders, it MUST display a small "Research" badge above the main headline, styled like the existing bordered mono chips used for tags.

## R4
The page MUST render the headline "Lieferantendaten aus Excel/CSV – Research" as its only `<h1>`.

## R5
The page MUST contain an introductory paragraph stating that the author is researching how small and medium-sized businesses handle supplier data arriving as Excel or CSV files.

## R6
The page MUST list exactly the five types of recurring work: cleaning or correcting, mapping to an internal format, converting between Excel/CSV formats, checking for missing or invalid values, and preparing data for ERP or webshop import.

## R7
The page MUST contain the explicit statement "Ich verkaufe aktuell kein Produkt."

## R8
The page MUST render exactly five numbered questions, each visible without interaction, in an ordered list that is scannable at a glance.

## R9
The page MUST mention that an anonymized example file is welcome.

## R10
The page MUST link to `mailto:me@jorgegb.dev` and to `https://www.linkedin.com/in/jorge-garcia-brizuela-b56669aa/` as the only contact methods.

## R11
WHEN the `/research/supplier-data` page renders, its `<title>` MUST be `Supplierdaten aus Excel/CSV – Research | Jorge`.

## R12
WHEN the `/research/supplier-data` page renders, its `meta[name="description"]` MUST be `Research zu manuellen Workflows mit Lieferantendaten aus Excel- und CSV-Dateien und deren Vorbereitung für ERP- oder Webshop-Importe.`

## R13
WHEN the `/research/supplier-data` page renders, `<html lang>` MUST be `de`.

## R14
WHEN the `/research/supplier-data` page renders, `link[rel="canonical"]` and `og:url` MUST both be `https://jorgegb.dev/research/supplier-data`.

## R15
WHEN the `/research/supplier-data` page renders, `meta[name="robots"]` MUST be `index, follow`.

## R16
The five existing pages (home, publications, projects, blog, wishlist) MUST each include a "Research" nav link pointing to `/research/supplier-data` in both the desktop nav and the mobile dropdown.

## R17
WHILE rendering any page other than `/research/supplier-data`, the system MUST keep each page's existing `<title>`, meta description, and `<html lang="en">` unchanged.

## R18
The page MUST reuse the existing site components and classes (`.section`, `.container`, `.card`, `.section-title`, existing font and color variables) so it matches the current visual language in both light and dark themes.

## R19
IF the page contains a newsletter form, pricing, testimonials, a demo/chat CTA, product screenshot, or analytics beyond what the site already ships, THEN the implementation MUST be rejected.

## R20
The page layout MUST remain readable and MUST NOT cause horizontal overflow at 375px, 768px, 1024px, and 1440px widths, with generous vertical whitespace and no animation other than the existing link hover transitions.

## R21
WHEN `pnpm astro build` runs, the sitemap emitted by the existing `@astrojs/sitemap` integration MUST include `https://jorgegb.dev/research/supplier-data`. The hand-written `public/sitemap.xml` MUST remain deleted, as removed by the `seo-meta` feature.

## R22
WHEN `./init.sh` and `pnpm astro build` are run after the change, they MUST both succeed, and the build MUST emit `dist/research/supplier-data/index.html`.

## R23
WHEN the viewport is ≥ 1024px, the mobile menu button MUST be hidden and the desktop nav MUST be shown; below 1024px the reverse MUST hold. The button MUST be operable in both states.

