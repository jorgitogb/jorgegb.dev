# Tasks — Blog Section

- [ ] T1 — Create `src/data/blog-posts.ts` with `BlogPost` type and 3 mock posts. Covers: R7, R8.
- [ ] T2 — Add `#blog` section to `src/pages/index.astro` rendering 3 most recent posts in terminal-style cards; add "Blog" nav link (`#blog`). Covers: R1, R2, R4, R9, R10.
- [ ] T3 — Create `src/pages/blog.astro` with full blog listing page. Covers: R3, R6, R9, R10.
- [ ] T4 — Add "Blog" nav link to `publications.astro`, `projects.astro`, `wishlist.astro` (links to `/blog`). Covers: R5.
- [ ] T5 — Run `./init.sh` and verify all checks pass. Covers: all.

## Traceability

| Requirement | Test (manual / `init.sh`) |
|-------------|--------------------------|
| R1 | Visual: homepage renders #blog section between projects and connect |
| R2 | Visual: 3 post cards with title, date, description, tags |
| R3 | Click "View All Posts" → navigates to /blog |
| R4 | Visual: "Blog" link in homepage nav pointing to #blog |
| R5 | Visual: "Blog" link in child pages nav pointing to /blog |
| R6 | Visual: /blog shows all posts with "Read more →" links |
| R7 | `src/data/blog-posts.ts` exists with 3 posts |
| R8 | Each post has slug, title, date, description, tags, content |
| R9 | Cards use `.card` class, monospace font, sharp corners |
| R10 | Desktop 2-col, mobile 1-col |
