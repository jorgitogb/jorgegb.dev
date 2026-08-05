# Tasks — Build Hardening

- [x] T1 — Add `rm -rf dist` at the top of the build step in `init.sh`. Covers: R4.
- [x] T2 — Add `pnpm astro build` invocation in `init.sh` step 4 after `pnpm astro check`. Use the existing `EXIT_CODE` pattern so a non-zero build exits the script with failure. Covers: R1, R5, R6.
- [x] T3 — After build, assert existence of the 5 expected HTML files. Covers: R2.
- [x] T4 — Create `tests/smoke.test.ts` using `node:test`; compile each `src/pages/*.astro` with `@astrojs/compiler` and assert a default export with zero diagnostics. Covers: R3.
- [x] T5 — Add `test:smoke` script in `package.json`; update the `test` script to run `test:smoke` (replace the `echo` placeholder). Covers: R7.
- [x] T6 — Run `./init.sh` from a clean state; confirm 5 HTML pages emit and smoke tests pass with exit code 0. Covers: all.

## Traceability
| R | Test |
|---|---|
| R1, R5, R6 | `init.sh` exits non-zero when `pnpm astro build` is force-failed (e.g., rename `astro.config.mjs` temporarily) |
| R2 | After `./init.sh`, `ls dist/{index.html,blog,projects,publications,wishlist}/index.html` succeeds |
| R3 | `node --test tests/smoke.test.ts` passes |
| R4 | Delete `dist/`, run `./init.sh`; `dist/` is repopulated, not stale |
| R7 | `pnpm test` runs `test:smoke` |
