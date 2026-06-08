# Tasks — Projects Section

- [ ] T1 — Create `src/lib/projects.ts` with `fetchGitHubRepos()` and `fetchNpmPackages()` functions plus types. Covers: R6, R7, R8.
- [ ] T2 — Add `#projects` section to `src/pages/index.astro` rendering up to 4 repos and 2 packages using terminal-prompt-style cards. Covers: R1, R2, R3, R9, R10.
- [ ] T3 — Create `src/pages/projects.astro` with full list of repos and packages, "GitHub Projects" and "npm Packages" subheadings, and View All button on homepage. Covers: R4, R5, R10, R12.
- [ ] T4 — Add "Projects" link to the nav bar in `index.astro`, `publications.astro`, and `wishlist.astro`. Covers: R11.
- [ ] T5 — Run `./init.sh` and verify all checks pass (0 test failures, Astro check passes). Covers: all.

## Traceability

| Requirement | Test (manual / `init.sh`) |
|-------------|--------------------------|
| R1 | Visual: homepage renders #projects section between publications and connect |
| R2 | Visual: 4 repo cards with name, description, language, stars, link |
| R3 | Visual: 2 npm cards with name, description, downloads, link |
| R4 | Click "View All Projects" → navigates to /projects |
| R5 | /projects shows all repos + packages in two groups |
| R6 | Fetch happens at build time (verify by checking for API calls in build log) |
| R7 | Inject invalid token → build passes with fallback link |
| R8 | Block npm API → build passes with fallback link |
| R9 | Cards use `.card` class, monospace font, sharp corners |
| R10 | Desktop 2-col, mobile 1-col |
| R11 | "Projects" link present in nav on all pages |
| R12 | /projects has header, footer, nav, theme toggle |
