# Design — Projects Section

## Files created/modified

| File | Action | Role |
|------|--------|------|
| `src/lib/projects.ts` | Create | Shared module: types + build-time data fetching from GitHub and npm APIs |
| `src/pages/index.astro` | Edit | Add `#projects` section between publications and connect sections; add "Projects" nav link |
| `src/pages/projects.astro` | Create | Dedicated `/projects` page following the same pattern as `publications.astro` |
| `src/pages/publications.astro` | Edit | Add "Projects" link to nav |
| `src/pages/wishlist.astro` | Edit | Add "Projects" link to nav |

## Types (`src/lib/projects.ts`)

```typescript
export type GitHubRepo = {
  name: string
  description: string | null
  htmlUrl: string
  homepage: string | null
  stargazersCount: number
  language: string | null
  fork: boolean
  archived: boolean
}

export type NpmPackage = {
  name: string
  description: string | null
  version: string
  weeklyDownloads: number
  repositoryUrl: string | null
}

export interface GitHubResponse {
  items: Array<{
    name: string
    description: string | null
    html_url: string
    homepage: string | null
    stargazers_count: number
    language: string | null
    fork: boolean
    archived: boolean
  }>
}
```

## Data fetching

### GitHub
- URL: `https://api.github.com/users/jorgitogb/repos?per_page=100&sort=updated`
- Filter: `fork === false && archived === false`
- Sort by: `stargazers_count` descending
- Fields used: name, description, html_url, stargazers_count, language
- Fetch in Astro frontmatter via built-in `fetch()`

### npm
- URL: `https://registry.npmjs.org/-/v1/search?text=author:jorgegb&size=50`
- Parse: extract `objects[].package` fields
- Filter: valid packages with a name
- Sort by: `weeklyDownloads` descending
- Fetch in Astro frontmatter

### Shared export

```typescript
export async function fetchGitHubRepos(): Promise<GitHubRepo[]>
export async function fetchNpmPackages(): Promise<NpmPackage[]>
```

Both functions handle errors gracefully — return `[]` on failure instead of throwing.

## Card design

GitHub repo card:
```
┌──────────────────────────────────┐
│  $ gh repo {name}               │ ← prompt-style with star count badge
│  {description}                   │
│  {language} badge    ★ {stars}  │
│  [View on GitHub]               │ ← btn btn-primary
└──────────────────────────────────┘
```

npm package card:
```
┌──────────────────────────────────┐
│  $ npm i {name}                 │ ← prompt-style with download badge
│  {description}                   │
│  ↓ {downloads}/week   v{ver}   │
│  [View on npm]                  │ ← btn btn-primary
└──────────────────────────────────┘
```

Both card types use existing `.card` class. Language badges use `text-primary-blue` or similar inline colors.

## Design decisions

| Decision | Choice | Rejected alternative |
|----------|--------|----------------------|
| Data fetching location | Astro frontmatter (build time) | Client-side fetch (adds JS overhead, requires loading states) |
| Data freshness | On every build | Manual data file (stale, requires human to update) |
| Card layout | Unified terminal-prompt style | Separate styles for GitHub vs npm (inconsistent) |
| Error handling | Return `[]` and show fallback link | Throw and break build (worse UX) |
| Filtering | Exclude forks + archived repos | Show all repos (cluttered) |
| Number shown on homepage | 4 repos + 2 packages | Fixed 6 mixed items (simpler mental model) |

## Navigation update

All three existing pages (`index.astro`, `publications.astro`, `wishlist.astro`) duplicate the full nav markup. Each needs a "Projects" nav link added between "Publications" and "Wishlist". Refactoring the nav into a shared component is desirable but out of scope for this feature.
