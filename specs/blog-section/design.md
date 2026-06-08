# Design — Blog Section

## Files created/modified

| File | Action | Role |
|------|--------|------|
| `src/data/blog-posts.ts` | Create | Typed array of 3 mock blog posts with tech/science topics |
| `src/pages/index.astro` | Edit | Add `#blog` section between projects and connect sections; add "Blog" nav link |
| `src/pages/blog.astro` | Create | Dedicated `/blog` page listing all posts |
| `src/pages/publications.astro` | Edit | Add "Blog" link to nav (→ `/blog`) |
| `src/pages/projects.astro` | Edit | Add "Blog" link to nav (→ `/blog`) |
| `src/pages/wishlist.astro` | Edit | Add "Blog" link to nav (→ `/blog`) |

## Types (`src/data/blog-posts.ts`)

```typescript
export type BlogPost = {
  slug: string
  title: string
  date: string       // ISO format: "2026-06-01"
  description: string
  tags: string[]
  content: string    // At least 2 paragraphs
}

export const posts: BlogPost[]
```

## Mock posts

| # | Title | Tags |
|---|-------|------|
| 1 | "Implementing FAIR Data Principles in Research Pipelines" | `#FAIR`, `#data`, `#reproducibility` |
| 2 | "Building Reproducible Computational Workflows with Containers" | `#docker`, `#workflows`, `#openscience` |
| 3 | "Why Open Science Infrastructure Matters for the Next Decade" | `#openscience`, `#infrastructure`, `#policy` |

Each post has 2+ paragraphs of realistic, substantive content.

## Card design

Homepage card (3 most recent, 2-col grid):
```
┌──────────────────────────────────┐
│  2026-06-01                       │
│  Implementing FAIR Data…          │ ← title (may truncate)
│  A look at how FAIR principles…   │ ← short description (1-2 lines)
│  #FAIR  #data  #reproducibility   │ ← tags
└──────────────────────────────────┘
```

Blog page card (all posts, full list):
```
┌──────────────────────────────────┐
│  2026-06-01                       │
│  Implementing FAIR Data…          │
│  A look at how FAIR principles…   │ ← longer description
│  #FAIR  #data  #reproducibility   │
│  [Read more →]                    │ ← link placeholder
└──────────────────────────────────┘
```

Note: For mock posts with inline content, "Read more →" links to `#` or a placeholder — individual post pages are out of scope. The content field exists in the data type for future use.

## Design decisions

| Decision | Choice | Rejected alternative |
|----------|--------|----------------------|
| Data storage | Static typed array in `src/data/blog-posts.ts` | Astro content collections (future concern; overkill for mock data) |
| Nav behavior | Homepage → `#blog` (anchor), inner pages → `/blog` (page) | Always `/blog` (loses scroll-to-section on homepage) |
| Section placement | After Projects, before Connect | Before Publications (breaks logical flow of work → writing) |
| Post content | Inline markdown strings in data file | Separate .md files (adds file overhead for 3 mocks) |
| Individual post pages | Out of scope for this feature | Each post gets a `/blog/:slug` page (valid future extension with content collections) |

## Navigation update

All four existing page templates duplicate the full nav markup. The "Blog" link goes to `#blog` on the homepage (desktop + mobile) and to `/blog` on child pages.

## Section alternation

The homepage alternates section backgrounds on alternating sections. The blog section should start with `bg-surface` to match the pattern from the adjacent projects section.
