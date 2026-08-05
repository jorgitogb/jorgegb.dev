import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { transform } from '@astrojs/compiler'

const pagesDir = new URL('../src/pages', import.meta.url).pathname

const pages = readdirSync(pagesDir)
  .filter((file) => file.endsWith('.astro'))
  .map((file) => join(pagesDir, file))

describe('Astro page smoke tests', () => {
  for (const page of pages) {
    describe(page, () => {
      it('must compile without diagnostics and export a default component', async () => {
        const source = readFileSync(page, 'utf8')
        const result = await transform(source, { filename: page })

        assert.equal(
          result.diagnostics.length,
          0,
          `compiler reported diagnostics: ${JSON.stringify(result.diagnostics)}`,
        )
        assert.ok(
          result.code.includes('export default'),
          'compiled code must include a default export',
        )
      })
    })
  }
})
