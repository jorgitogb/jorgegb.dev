# Progress — Current session

## Feature in progress

- `build-hardening` (id: 3) — in_progress

## Plan

- [ ] T1 — Add `rm -rf dist` + build step to `init.sh`
- [ ] T2 — Add build + dist/sitemap existence checks in `init.sh`
- [ ] T3 — Create `tests/smoke.test.ts` using `node:test`
- [ ] T4 — Add `test:smoke` script in `package.json`
- [ ] T5 — Run `./init.sh` clean and verify all checks pass
- [ ] T6 — Mark `build-hardening` as `done`, move summary to `progress/history.md`

## Notes

- Executing order: `build-hardening` → `mobile-a11y` → `seo-meta`.
- `build-hardening` is the first feature because the new harness must verify the build before the UI specs modify the source.

## Files touched

- `feature_list.json` — `build-hardening` set to `in_progress`
- `progress/current.md` — this file
