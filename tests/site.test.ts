import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Built-site assertions. Run after `astro build` (`pnpm test` wires this).
// These read dist/ files only — no network, fully deterministic.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const pages = [
  '',
  'blog',
  'projects',
  'publications',
  'wishlist',
  'research/supplier-data',
]

function htmlFor(page: string): string {
  const candidates =
    page === ''
      ? [join(dist, 'index.html')]
      : [join(dist, `${page}.html`), join(dist, page, 'index.html')]
  const file = candidates.find((c) => existsSync(c))
  assert.ok(
    file,
    `missing built page for /${page} (looked for ${candidates.join(' / ')}) — run "astro build" first`,
  )
  return readFileSync(file, 'utf8')
}

function allTags(html: string, tag: string, attr: string): string[] {
  const tags = html.match(new RegExp(`<${tag}[^>]*${attr}[^>]*>`, 'g')) ?? []
  return tags
}

function attrValue(tag: string, attr: string): string | null {
  const m = tag.match(new RegExp(`${attr}="([^"]*)"`))
  return m ? m[1] : null
}

function titles(html: string): string[] {
  return [...html.matchAll(/<title>([^<]*)<\/title>/g)].map((m) =>
    m[1].trim(),
  )
}

function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
}

function ids(html: string): Set<string> {
  return new Set(
    [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]),
  )
}

function jsonLdBlocks(html: string): string[] {
  return [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => m[1])
}

/** Resolve a site-absolute path to a dist file. Accepts both directory
 *  (dist/<page>/index.html) and file (dist/<page>.html) output styles. */
function resolves(localPath: string): boolean {
  if (localPath === '/') return existsSync(join(dist, 'index.html'))
  const clean = localPath.replace(/\/+$/, '')
  if (existsSync(join(dist, `${clean}.html`))) return true
  if (existsSync(join(dist, clean, 'index.html'))) return true
  return existsSync(join(dist, clean))
}

/** npm package cards in a page: the package name (from "npm i <name>") and
 *  the "View on npm →" links that follow it, up to the next card. */
function npmCards(html: string): Array<{ name: string; links: string[] }> {
  const starts = [...html.matchAll(/npm i ([^<\s]+)/g)]
  return starts.map((m, i) => {
    const chunk = html.slice(m.index, starts[i + 1]?.index)
    const links = [...chunk.matchAll(/<a\b[^>]*>\s*View on npm →\s*<\/a>/g)]
    return { name: m[1], links: links.map((l) => attrValue(l[0], 'href') ?? '') }
  })
}

const NO_NPM_CARDS =
  'no npm cards in this build (npm registry unreachable at build time)'

/** npm cards on the pages that list packages (`/` and `/projects`). */
function builtNpmCards(built: Array<{ page: string; html: string }>) {
  return built
    .filter((b) => b.page === '' || b.page === 'projects')
    .flatMap(({ page, html }) =>
      npmCards(html).map((card) => ({ page, ...card })),
    )
}

describe('built site', () => {
  const built: Array<{ page: string; html: string }> = []

  before(() => {
    assert.ok(
      existsSync(dist),
      'dist/ is missing — run "astro build" before these tests',
    )
    for (const page of pages) built.push({ page, html: htmlFor(page) })
  })

  it('every page has exactly one <h1>', () => {
    for (const { page, html } of built) {
      const count = (html.match(/<h1[\s>]/g) ?? []).length
      assert.equal(count, 1, `/${page}: expected 1 <h1>, got ${count}`)
    }
  })

  it('no page ships placeholder copy', () => {
    for (const { page, html } of built) {
      for (const marker of ['No description', 'Just for test']) {
        assert.ok(
          !html.includes(marker),
          `/${page}: contains placeholder text "${marker}"`,
        )
      }
    }
  })

  it('every #fragment link resolves to an element id in the target page', () => {
    const byPage = new Map(built.map((b) => [b.page, b.html]))
    const broken: string[] = []
    for (const { page, html } of built) {
      for (const href of hrefs(html)) {
        if (href.startsWith('http') || href.startsWith('mailto:')) continue
        const hash = href.indexOf('#')
        if (hash === -1) continue
        const filePart = href.slice(0, hash)
        const fragment = href.slice(hash + 1)
        if (!fragment) continue
        let target: string | undefined
        if (filePart === '') {
          target = html
        } else if (filePart.startsWith('/')) {
          const key = filePart.replace(/^\/+|\/+$/g, '')
          target = key === '' ? byPage.get('') : byPage.get(key)
          if (!target) {
            broken.push(`/${page}: ${href} (target page not built)`)
            continue
          }
        } else {
          continue
        }
        if (!ids(target).has(fragment)) {
          broken.push(`/${page}: ${href} (no id="${fragment}")`)
        }
      }
    }
    assert.deepEqual(broken, [], `broken fragment links:\n${broken.join('\n')}`)
  })

  it('every image declares intrinsic dimensions (no layout shift)', () => {
    const withoutDims: string[] = []
    for (const { page, html } of built) {
      for (const m of html.matchAll(/<img[^>]*>/g)) {
        const tag = m[0]
        if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) {
          withoutDims.push(`/${page}: ${tag.slice(0, 80)}`)
        }
      }
    }
    assert.deepEqual(withoutDims, [], `images without dimensions:\n${withoutDims.join('\n')}`)
  })

  it('every page has exactly one non-empty <title>', () => {
    for (const { page, html } of built) {
      const found = titles(html)
      assert.equal(found.length, 1, `/${page}: expected 1 <title>, got ${found.length}`)
      assert.ok(found[0].length > 0, `/${page}: <title> is empty`)
    }
  })

  it('every page has a non-empty meta description', () => {
    for (const { page, html } of built) {
      const tags = allTags(html, 'meta', 'name="description"')
      assert.equal(tags.length, 1, `/${page}: expected 1 meta description`)
      const content = attrValue(tags[0], 'content')
      assert.ok(
        content && content.trim().length > 0,
        `/${page}: meta description is empty`,
      )
    }
  })

  it('canonical URLs are present, absolute, and unique per page', () => {
    const seen = new Map<string, string>()
    for (const { page, html } of built) {
      const tags = allTags(html, 'link', 'rel="canonical"')
      assert.equal(tags.length, 1, `/${page}: expected 1 canonical link`)
      const href = attrValue(tags[0], 'href')
      assert.ok(
        href && href.startsWith('https://jorgegb.dev/'),
        `/${page}: canonical is not absolute: ${href}`,
      )
      const owner = seen.get(href)
      assert.ok(!owner, `duplicate canonical ${href} on /${page} and ${owner}`)
      seen.set(href, `/${page}`)
      // Canonical path must equal the served route path: any mismatch means
      // the canonical points at a redirect (e.g. missing trailing slash).
      assert.equal(
        new URL(href).pathname,
        page === '' ? '/' : `/${page}`,
        `/${page}: canonical path ${new URL(href).pathname} does not match the route`,
      )
    }
  })

  it('every page has the skip-link target id="main"', () => {
    for (const { page, html } of built) {
      assert.ok(
        hrefs(html).includes('#main'),
        `/${page}: missing skip link href="#main"`,
      )
      assert.ok(ids(html).has('main'), `/${page}: missing id="main"`)
    }
  })

  it('every JSON-LD block parses', () => {
    for (const { page, html } of built) {
      for (const block of jsonLdBlocks(html)) {
        assert.doesNotThrow(
          () => JSON.parse(block),
          `/${page}: invalid JSON-LD block`,
        )
      }
    }
  })

  it('every internal link resolves to a built file', () => {
    const broken: string[] = []
    for (const { page, html } of built) {
      for (const href of hrefs(html)) {
        if (
          href.startsWith('#') ||
          href.startsWith('http') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:')
        )
          continue
        if (!href.startsWith('/')) continue
        const localPath = href.split(/[?#]/)[0] || '/'
        if (!resolves(localPath)) broken.push(`/${page}: ${href}`)
      }
    }
    assert.deepEqual(broken, [], `broken internal links:\n${broken.join('\n')}`)
  })

  it('every built page is non-trivial HTML', () => {
    for (const { page, html } of built) {
      assert.ok(
        html.length > 1000,
        `/${page}: suspiciously small (${html.length} bytes)`,
      )
      assert.ok(
        html.includes('</html>'),
        `/${page}: missing closing </html>`,
      )
    }
  })

  it('sitemap lists every page', () => {
    const sitemapFile = join(dist, 'sitemap-0.xml')
    assert.ok(existsSync(sitemapFile), 'dist/sitemap-0.xml is missing')
    const sitemap = readFileSync(sitemapFile, 'utf8')
    for (const page of pages) {
      const expected =
        page === ''
          ? ['https://jorgegb.dev', 'https://jorgegb.dev/']
          : [
              `https://jorgegb.dev/${page}`,
              `https://jorgegb.dev/${page}/`,
            ]
      assert.ok(
        expected.some((url) => sitemap.includes(`<loc>${url}</loc>`)),
        `sitemap is missing https://jorgegb.dev/${page}`,
      )
    }
    assert.ok(
      !sitemap.includes('/404'),
      'sitemap must not list the 404 page',
    )
  })

  it('the home support button reads "Support me on Ko-fi" and opens Ko-fi', () => {
    const home = built.find((b) => b.page === '')!.html
    const kofi = [...home.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)]
      .map((m) => m[0])
      .filter((a) => attrValue(a, 'href')?.startsWith('https://ko-fi.com/'))
    assert.equal(kofi.length, 1, `expected 1 Ko-fi link on /, got ${kofi.length}`)
    const text = kofi[0]
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    assert.equal(text, 'Support me on Ko-fi')
    assert.equal(attrValue(kofi[0], 'href'), 'https://ko-fi.com/jorgegb')
  })

  it('no page mentions Buy Me A Coffee (support goes through Ko-fi)', () => {
    for (const { page, html } of built) {
      assert.ok(
        !/buy me a coffee/i.test(html),
        `/${page}: still mentions "Buy Me A Coffee"`,
      )
    }
  })

  it('every "View on npm →" link opens its own package on npmjs.com', (t) => {
    const cards = builtNpmCards(built)
    if (cards.length === 0) {
      t.skip(NO_NPM_CARDS)
      return
    }
    for (const { page, name, links } of cards) {
      for (const href of links) {
        assert.equal(
          href,
          `https://www.npmjs.com/package/${name}`,
          `/${page}: "View on npm →" for ${name} points elsewhere`,
        )
      }
    }
  })

  it('every npm card has exactly one "View on npm →" link', (t) => {
    const cards = builtNpmCards(built)
    if (cards.length === 0) {
      t.skip(NO_NPM_CARDS)
      return
    }
    for (const { page, name, links } of cards) {
      assert.equal(
        links.length,
        1,
        `/${page}: ${name} has ${links.length} "View on npm →" links, expected 1`,
      )
    }
  })

  it('a link whose text names GitHub, npm or Ko-fi opens that service', () => {
    const services: Array<[RegExp, string[]]> = [
      [/github/i, ['github.com']],
      [/\bnpm\b/i, ['npmjs.com', 'www.npmjs.com']],
      [/ko-fi/i, ['ko-fi.com']],
    ]
    for (const { page, html } of built) {
      for (const [anchor] of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
        const text = anchor.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        const hosts = services.filter(([re]) => re.test(text)).flatMap(([, h]) => h)
        if (hosts.length === 0) continue
        const href = attrValue(anchor, 'href') ?? ''
        let host = ''
        try {
          host = new URL(href).hostname
        } catch {}
        assert.ok(
          hosts.includes(host),
          `/${page}: link "${text}" points to ${href || '(no href)'}, expected ${hosts.join(' or ')}`,
        )
      }
    }
  })
})

describe('404 page', () => {
  const file = join(dist, '404.html')
  let html = ''

  before(() => {
    assert.ok(existsSync(file), 'dist/404.html is missing')
    html = readFileSync(file, 'utf8')
  })

  it('has a title, an h1, and a way back home', () => {
    assert.equal(titles(html).length, 1)
    assert.ok((html.match(/<h1[\s>]/g) ?? []).length >= 1)
    assert.ok(
      hrefs(html).includes('/'),
      '404 page has no link back to /',
    )
  })

  it('is excluded from indexing but keeps the skip-link target', () => {
    const robots = allTags(html, 'meta', 'name="robots"')
    assert.equal(robots.length, 1)
    assert.match(attrValue(robots[0], 'content') ?? '', /noindex/)
    assert.ok(ids(html).has('main'))
  })
})
