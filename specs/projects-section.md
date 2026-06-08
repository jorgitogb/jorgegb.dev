# Spec: Projects Section

## Overview

Add a **Projects** section to the homepage and a dedicated `/projects` page, showcasing open-source GitHub repositories and published npm packages. Data fetched at build time from GitHub API and npm registry — no manual updates needed.

---

## Requirements

### R1: Homepage Section

- Add a new section between **Publications** and **Connect**
- Anchor: `#projects`
- Show top 4-6 projects (mixed GitHub + npm), sorted by stars/downloads
- Each card shows: name, description, primary language/topic, star count or download count, links to repo + live demo (if applicable)
- "View All Projects" button linking to `/projects`

### R2: Dedicated /projects Page

- Route: `/projects`
- Layout: same as `/publications` (header, nav, footer, theme toggle)
- Shows **all** projects — GitHub repos and npm packages
- Two visual groups: "GitHub Projects" and "npm Packages"
- Optional: simple filter/tabs to toggle between GitHub/npm/All

### R3: Data Sources

- **GitHub**: Fetch from `https://api.github.com/users/{username}/repos` at build time
  - Fields: name, description, html_url, homepage, stargazers_count, language, topics, fork, archived
  - Filter out: forks, archived repos, repos with < N stars (configurable)
- **npm**: Fetch from `https://registry.npmjs.org/-/v1/search?text=author:{username}` at build time
  - Fields: name, description, repository, version, weekly downloads, keywords
  - Use `npm-api` or direct registry API

### R4: Data Fetching Pattern

- Use Astro frontmatter `fetch()` — data fetched at build time, zero client JS
- Define data in a shared module: `src/lib/projects.ts` (fetch + transform + export)
- Types: `GitHubRepo`, `NpmPackage`, `Project` (unified type)

### R5: Card Design

- Follow existing terminal aesthetic (sharp corners, monospace, `.card` class)
- GitHub card: repo name as `$ gh repo {name}`, star count, language badge
- npm card: package name as `$ npm i {name}`, weekly downloads
- Consistent with existing `.prompt` and `.terminal-header` CSS classes (currently unused but available)

### R6: Responsive

- Desktop: 2-col grid (matching publications section pattern)
- Mobile: single column

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data source | API fetch at build time | Always fresh, no manual updates, Astro supports it natively |
| Fallback | Graceful degradation | If API fails at build, show empty state with "Check GitHub/npm" links |
| Sorting | Stars/downloads descending | Most impactful projects surface first |
| Card count (home) | 4-6 | Matches publications pattern (3 shown + view all) |
| Dedicated page filter | Optional tabs | Nice-to-have, can be phase 2 |

---

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/projects.ts` | **Create** | Data fetching, types, transform logic |
| `src/pages/index.astro` | **Edit** | Add #projects section |
| `src/pages/projects.astro` | **Create** | Dedicated projects page |
| `src/styles/global.css` | **Edit** | Add project-specific styles if needed |

---

## Error Handling

- If GitHub API rate-limits or fails: log warning, return empty array
- If npm API fails: log warning, return empty array
- Homepage section shows nothing if both fail (degrades gracefully)
- Dedicated page shows a "Unable to load projects" message with direct links

---

## Out of Scope (Phase 2)

- Auto-refresh / ISR (static site, rebuild triggers refresh)
- GitHub topics as filter chips
- Project screenshots / previews
- Contribution stats (PRs, issues)
- Dynamic sorting (by date, alphabetical)
