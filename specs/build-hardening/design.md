# Design — Build Hardening

## Files
- `init.sh` — add `rm -rf dist`, `pnpm astro build`, existence checks for the 5 expected HTML pages, run smoke tests.
- `tests/smoke.test.ts` — new file, `node:test`, compiles each page with `@astrojs/compiler` and asserts a default export.
- `package.json` — add `"test:smoke": "node --test tests/smoke.test.ts"`; keep `test` as a placeholder but call `test:smoke` from it.

## Signatures
```bash
# inside init.sh
rm -rf dist
pnpm astro build
for page in index blog projects publications wishlist; do
  if [ "$page" = "index" ]; then
    target="dist/index.html"
  else
    target="dist/$page/index.html"
  fi
  [[ -f "$target" ]] || fail "missing $target"
done
pnpm test
```

```ts
// tests/smoke.test.ts
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { transform } from '@astrojs/compiler'

const pagesDir = new URL('../src/pages', import.meta.url).pathname

const pages = readdirSync(pagesDir)
  .filter((file) => file.endsWith('.astro'))
  .map((file) => join(pagesDir, file))

for (const page of pages) {
  describe(page, () => {
    it('must compile without diagnostics and export a default component', async () => {
      const source = readFileSync(page, 'utf8')
      const result = await transform(source, { filename: page })
      assert.equal(result.diagnostics.length, 0)
      assert.ok(result.code.includes('export default'))
    })
  })
}
```

## Decisions
- `node:test` over Vitest: zero new dependencies, matches the "minimal dependencies" rule in `docs/architecture.md`.
- `rm -rf dist` in `init.sh`: keeps the harness honest; old `dist/` from previous sessions masked missing pages in this audit.
- Build runs after type-check: type errors fail before spending build time.

## Rejected alternatives
- Playwright e2e in `init.sh`: too heavy for a personal site; defer to a separate spec if needed later.
- Vitest: adds a dependency; `node:test` is sufficient here.
- Snapshot tests for built HTML: brittle, coupling the test to the rendered output unnecessarily.
