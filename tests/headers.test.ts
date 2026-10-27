import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const headersFile = new URL('../dist/_headers', import.meta.url)

function catchAllRule(): string[] {
  const lines = readFileSync(headersFile, 'utf8').split('\n')
  const start = lines.findIndex((line) => line.trim() === '/*')
  assert.notEqual(start, -1, 'dist/_headers must have a /* rule')
  const rule: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (!/^\s/.test(line)) break
    rule.push(line.trim())
  }
  return rule
}

describe('security headers (dist/_headers)', () => {
  it('sets X-Content-Type-Options: nosniff on every response', () => {
    assert.ok(catchAllRule().includes('X-Content-Type-Options: nosniff'))
  })

  it('sets Referrer-Policy: strict-origin-when-cross-origin', () => {
    assert.ok(catchAllRule().includes('Referrer-Policy: strict-origin-when-cross-origin'))
  })

  it('sets Permissions-Policy denying camera, microphone and geolocation', () => {
    assert.ok(catchAllRule().includes('Permissions-Policy: camera=(), microphone=(), geolocation=()'))
  })

  it("sets Content-Security-Policy to exactly frame-ancestors 'none'", () => {
    const csp = catchAllRule().filter((line) => line.startsWith('Content-Security-Policy:'))
    assert.deepEqual(csp, ["Content-Security-Policy: frame-ancestors 'none'"])
  })

  it('does not set Strict-Transport-Security (HSTS stays in the Cloudflare dashboard)', () => {
    const hsts = readFileSync(headersFile, 'utf8')
      .split('\n')
      .filter((line) => /strict-transport-security/i.test(line))
    assert.deepEqual(hsts, [])
  })
})
