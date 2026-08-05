# Requirements — Build Hardening

## R1
The system MUST add a "Build" step to `init.sh` between type-check and the test block, running `pnpm astro build` and failing the script on a non-zero exit.

## R2
The system MUST verify that after a successful build, `dist/index.html`, `dist/blog/index.html`, `dist/projects/index.html`, `dist/publications/index.html`, and `dist/wishlist/index.html` all exist.

## R3
The system MUST add a smoke test file `tests/smoke.test.ts` using `node:test` (zero new dependencies) that imports each of the 5 page modules and asserts each exports a default Astro component.

## R4
The system MUST delete the stale `dist/` directory at the start of every `init.sh` run so the build artifact reflects the current source.

## R5
IF `pnpm astro build` exits non-zero, THEN `init.sh` MUST exit non-zero and print the Astro error block to stderr.

## R6
The system MUST ensure `astro check` is invoked in `init.sh` step 4 and fails on any `.astro` type error.

## R7
The system MUST add a `package.json` script `test:smoke` that runs `node --test tests/smoke.test.ts` and wire it into `init.sh`.
