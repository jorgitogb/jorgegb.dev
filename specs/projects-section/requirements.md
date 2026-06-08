# Requirements — Projects Section

## R1
The system MUST add a `#projects` section on the homepage between the publications and connect sections.

## R2
WHEN the homepage renders, the projects section MUST show up to 4 GitHub repositories sorted by star count descending, each displayed as a card with name, description, primary language, star count, and a link to the repository.

## R3
WHEN the homepage renders, the projects section MUST show up to 2 npm packages sorted by weekly downloads descending, each displayed as a card with name, description, weekly download count, and a link to the npm package page.

## R4
WHEN the user clicks "View All Projects" on the homepage, the system MUST navigate to a dedicated `/projects` page.

## R5
The dedicated `/projects` page MUST render all GitHub repositories (excluding forks and archived repos) as cards with the same structure as R2, plus grouping into "GitHub Projects" and "npm Packages" subsections.

## R6
The system MUST fetch project data from the GitHub API (`GET /users/{username}/repos`) and the npm registry search API at build time in the Astro frontmatter.

## R7
IF the GitHub API returns an error or rate-limits the request, THEN the system MUST gracefully degrade — show an empty state with a "Check my GitHub profile" link, and continue building without crashing.

## R8
IF the npm registry API returns an error, THEN the system MUST gracefully degrade — show an empty state with a "Check my npm profile" link, and continue building without crashing.

## R9
WHILE rendering, each project or package card MUST use the existing `.card`, `.btn`, and terminal aesthetic classes (`font-mono`, sharp corners) to match the site's visual identity.

## R10
The projects section and page MUST match the responsive grid pattern of the rest of the site — 2 columns on desktop (md:grid-cols-2), single column on mobile.

## R11
The nav bar on the homepage and all child pages MUST include a "Projects" link pointing to `/projects`.

## R12
WHERE the dedicated `/projects` page is rendered, it MUST include the same header, footer, nav, and theme toggle as the publications and wishlist pages.
