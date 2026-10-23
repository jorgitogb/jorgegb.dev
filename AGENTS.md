# AGENTS.md — jorgegb.dev

Personal landing page, live at https://jorgegb.dev. Static Astro site with Tailwind v4, deployed to Cloudflare Workers static assets.

## Workflow: vertical slices

This repo uses **vertical slices + user stories + AI pair programming**, not Spec-Driven Development.

- Board: the vault note `02-Projects/Dev/Jorgegb-Dev/Backlog.md`
- Project note, with product and constraints: `02-Projects/Dev/Jorgegb-Dev/Jorgegb-Dev.md`
- Skills: `/backlog` → `/story` → `/pair`. Rules: `~/.claude/rules/vertical-slices.md`
- One story at a time, on a branch `story/US-NNN-<slug>`, squash-merged into `master`.

Read `## Product & constraints` in the project note before starting a story.

## Verification

Run `./init.sh` at the start of a session and before calling anything done. It checks the environment, runs `astro check` and `astro build`, checks the build artifacts and runs the tests. It must end green.

## Hard rules

- Never push or merge to the `production` branch, run `wrangler deploy` or change Cloudflare settings without Jorge's explicit OK.
- Never break the contact links, the existing URLs (`/`, `/publications`, `/projects`, `/blog`, `/wishlist`, `/research/supplier-data`, the 404 page) or their SEO.
- Never commit unless Jorge says so.

## Conventions

See `CLAUDE.md`.
