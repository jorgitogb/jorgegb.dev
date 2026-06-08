# Requirements — Blog Section

## R1
The system MUST add a `#blog` section on the homepage between the projects and connect sections.

## R2
WHEN the homepage renders, the blog section MUST show the 3 most recent blog posts sorted by date descending, each displayed as a card with title, date, short description, and tags.

## R3
WHEN the user clicks "View All Posts" on the homepage, the system MUST navigate to `/blog`.

## R4
The homepage navbar MUST include a "Blog" link pointing to `#blog`.

## R5
All child pages (publications, projects, wishlist) MUST include a "Blog" link in their navbar pointing to `/blog`.

## R6
The `/blog` page MUST render all blog posts as a list, each card showing title, date, description, tags, and a "Read more →" link.

## R7
The system MUST store 3 mock blog posts in `src/data/blog-posts.ts` as a typed array, with topics spanning tech and science.

## R8
EACH mock post MUST have: slug, title, date, description, tags, and content (at least 2 paragraphs).

## R9
WHILE rendering blog post cards, the system MUST use the existing `.card` base class and terminal aesthetic (font-mono, sharp corners) to match the site's visual identity.

## R10
The blog section and page MUST match the responsive grid pattern — 2 columns on desktop (md:grid-cols-2), single column on mobile.
