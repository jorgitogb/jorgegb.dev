import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { posts } from '../src/data/blog-posts.ts'

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

function anchors(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0])
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

  it('sitemap <loc> entries equal the canonicals of the built pages', () => {
    const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8')
    const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1])
    const canonicals = built.map(
      ({ html }) => attrValue(allTags(html, 'link', 'rel="canonical"')[0], 'href')!,
    )
    assert.deepEqual([...locs].sort(), [...canonicals].sort())
  })

  it('every sitemap <url> has a <lastmod> with a valid date', () => {
    const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8')
    const urls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1])
    assert.ok(urls.length > 0, 'sitemap has no <url> entries')
    for (const url of urls) {
      const lastmod = url.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1]
      assert.ok(lastmod, `no <lastmod> in ${url}`)
      assert.ok(!Number.isNaN(Date.parse(lastmod)), `invalid <lastmod> "${lastmod}"`)
    }
  })

  it('every page has og:site_name "jorgegb.dev"', () => {
    for (const { page, html } of built) {
      const tags = allTags(html, 'meta', 'property="og:site_name"')
      assert.equal(tags.length, 1, `/${page}: expected 1 og:site_name`)
      assert.equal(attrValue(tags[0], 'content'), 'jorgegb.dev', `/${page}: og:site_name`)
    }
  })

  it('every page has twitter:site "@jorge_garciab"', () => {
    for (const { page, html } of built) {
      const tags = allTags(html, 'meta', 'name="twitter:site"')
      assert.equal(tags.length, 1, `/${page}: expected 1 twitter:site`)
      assert.equal(attrValue(tags[0], 'content'), '@jorge_garciab', `/${page}: twitter:site`)
    }
  })

  it('og:locale is en_US, or de_DE on the lang="de" page', () => {
    for (const { page, html } of built) {
      const lang = html.match(/<html[^>]*\slang="([^"]*)"/)?.[1]
      const tags = allTags(html, 'meta', 'property="og:locale"')
      assert.equal(tags.length, 1, `/${page}: expected 1 og:locale`)
      assert.equal(
        attrValue(tags[0], 'content'),
        lang === 'de' ? 'de_DE' : 'en_US',
        `/${page}: og:locale`,
      )
    }
  })

  it('og:image:alt describes the image, not the page title', () => {
    for (const { page, html } of built) {
      const tags = allTags(html, 'meta', 'property="og:image:alt"')
      assert.equal(tags.length, 1, `/${page}: expected 1 og:image:alt`)
      assert.equal(
        attrValue(tags[0], 'content'),
        'Portrait of Jorge García Brizuela',
        `/${page}: og:image:alt`,
      )
    }
  })

  it('every title except home ends with " — Jorge GB"', () => {
    for (const { page, html } of built.filter((b) => b.page !== '')) {
      assert.ok(
        titles(html)[0].endsWith(' — Jorge GB'),
        `/${page}: title "${titles(html)[0]}" does not end with " — Jorge GB"`,
      )
    }
    const german = built.find((b) => b.page === 'research/supplier-data')!
    assert.equal(titles(german.html)[0], 'Lieferantendaten aus Excel/CSV — Jorge GB')
  })

  it('the home support button reads "Support me on Ko-fi" and opens Ko-fi', () => {
    const home = built.find((b) => b.page === '')!.html
    const kofi = anchors(home)
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
      for (const anchor of anchors(html)) {
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

describe('home page sections', () => {
  let main = ''

  before(() => {
    main = htmlFor('').match(/<main\b[\s\S]*<\/main>/)?.[0] ?? ''
    assert.ok(main, 'no <main> on /')
  })

  it('adjacent sections have different background classes', () => {
    const sections = [...main.matchAll(/<section\b[^>]*>/g)].map((m) => ({
      id: attrValue(m[0], 'id') ?? 'hero',
      bg: (attrValue(m[0], 'class') ?? '')
        .split(/\s+/)
        .filter((c) => c.startsWith('bg-'))
        .join(' '),
    }))
    assert.ok(sections.length > 1, 'expected several sections in <main>')
    for (let i = 1; i < sections.length; i++) {
      assert.notEqual(
        sections[i].bg,
        sections[i - 1].bg,
        `#${sections[i - 1].id} and #${sections[i].id} share "${sections[i].bg}"`,
      )
    }
  })

  it('the hero and its container have no vertical padding utility besides .section', () => {
    const hero = main.match(/<section\b[^>]*>\s*<div\b[^>]*>/)?.[0] ?? ''
    assert.ok(hero, 'no hero section with a container in <main>')
    const padding = [...hero.matchAll(/\bclass="([^"]*)"/g)]
      .flatMap((m) => m[1].split(/\s+/))
      .filter((c) => /^(?:[\w-]+:)*-?p[ytb]-/.test(c))
    assert.deepEqual(padding, [], 'hero has extra vertical padding')
  })

  const ALERT_STROKES = ['M12 8v4', 'M12 16h.01']

  function buttonIcon(href: string): string | undefined {
    const anchor = anchors(main)
      .find((a) => attrValue(a, 'href') === href)
    assert.ok(anchor, `no link to ${href} in <main>`)
    return anchor.match(/<svg\b[\s\S]*?<\/svg>/)?.[0]
  }

  it('the Wishlist button has a decorative icon that is not the alert glyph', () => {
    const icon = buttonIcon('/wishlist')
    assert.ok(icon, 'Wishlist button has no icon')
    for (const stroke of ALERT_STROKES) {
      assert.ok(!icon.includes(stroke), `Wishlist icon still draws "${stroke}"`)
    }
    assert.match(icon, /<svg\b[^>]*aria-hidden="true"/, 'icon is not aria-hidden')
  })

  it('the Ko-fi button has a decorative icon without alert strokes', () => {
    const icon = buttonIcon('https://ko-fi.com/jorgegb')
    assert.ok(icon, 'Ko-fi button has no icon')
    for (const stroke of ALERT_STROKES) {
      assert.ok(!icon.includes(stroke), `Ko-fi icon still draws "${stroke}"`)
    }
    assert.match(icon, /<svg\b[^>]*aria-hidden="true"/, 'icon is not aria-hidden')
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

  it('declares no canonical and no og:url', () => {
    assert.deepEqual(allTags(html, 'link', 'rel="canonical"'), [])
    assert.deepEqual(allTags(html, 'meta', 'property="og:url"'), [])
  })
})

describe('WCAG AA contrast', () => {
  const AA = 4.5
  let css = ''

  before(() => {
    const file = readdirSync(join(dist, '_astro')).find((f) => f.endsWith('.css'))
    assert.ok(file, 'no built CSS in dist/_astro')
    css = readFileSync(join(dist, '_astro', file), 'utf8')
  })

  // Hex tokens of one theme, from the standalone `:root{…}` / `.dark{…}` rules.
  function tokens(theme: 'light' | 'dark'): Record<string, string> {
    const selector = theme === 'light' ? ':root' : '.dark'
    const body =
      css.match(new RegExp(`(?:^|})${selector.replace('.', '\\.')}\\{([^}]*)\\}`))?.[1] ?? ''
    assert.ok(body, `no ${selector} rule in the built CSS`)
    return Object.fromEntries(
      [...body.matchAll(/(--[\w-]+):(#[0-9a-f]{3,6})\b/g)].map((m) => [m[1], m[2]]),
    )
  }

  function luminance(hex: string): number {
    const h = hex.length === 4 ? [...hex.slice(1)].map((c) => c + c).join('') : hex.slice(1)
    const [r, g, b] = [0, 2, 4].map((i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
  }

  function assertAA(fg: string, bg: string, what: string) {
    const ratio = contrast(fg, bg)
    assert.ok(ratio >= AA, `${what}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1`)
  }

  // Token name a plain `a{color:var(--x)}` rule uses.
  function linkToken(selector: string): string {
    const name = css.match(new RegExp(`(?:^|})${selector}\\{color:var\\((--[\\w-]+)\\)`))?.[1]
    assert.ok(name, `no "${selector}" colour rule using a token`)
    return name
  }

  // One declaration of a rule; the dark theme's `.dark <selector>` rule wins when it has one.
  function findDeclaration(selector: string, prop: string, theme: 'light' | 'dark') {
    const find = (sel: string) => {
      const body =
        css.match(new RegExp(`(?:^|})${sel.replace(/\./g, '\\.')}\\{([^}]*)\\}`))?.[1] ?? ''
      return body.match(new RegExp(`(?:^|;)${prop}:([^;]+)`))?.[1]
    }
    return (theme === 'dark' && find(`.dark ${selector}`)) || find(selector)
  }

  function declaration(selector: string, prop: string, theme: 'light' | 'dark'): string {
    const value = findDeclaration(selector, prop, theme)
    assert.ok(value, `no ${prop} on ${selector} (${theme})`)
    return value
  }

  // Border colour of a button: its own `border-color`, else the colour of `.btn`'s border shorthand.
  function borderColor(selector: string, theme: 'light' | 'dark'): string {
    const own = findDeclaration(selector, 'border-color', theme)
    return own ?? declaration('.btn', 'border', theme).split(' ').pop()!
  }

  function resolve(value: string, theme: 'light' | 'dark'): string {
    const name = value.match(/^var\((--[\w-]+)\)$/)?.[1]
    return name ? tokens(theme)[name] : value
  }

  for (const theme of ['light', 'dark'] as const) {
    it(`text links reach ${AA}:1 on background, surface and muted (${theme})`, () => {
      const t = tokens(theme)
      const name = linkToken('a')
      for (const bg of ['--background', '--surface', '--muted-surface']) {
        assertAA(t[name], t[bg], `${theme}: ${name} on ${bg}`)
      }
    })

    it(`text link hover reaches ${AA}:1 on background, surface and muted (${theme})`, () => {
      const t = tokens(theme)
      const name = linkToken('a:hover')
      for (const bg of ['--background', '--surface', '--muted-surface']) {
        assertAA(t[name], t[bg], `${theme}: ${name} on ${bg}`)
      }
    })

    it(`the primary button label reaches ${AA}:1 on its fill and hover fill (${theme})`, () => {
      for (const state of ['.btn-primary', '.btn-primary:hover']) {
        const label = resolve(declaration(state, 'color', theme), theme)
        const fill = resolve(declaration(state, 'background-color', theme), theme)
        assertAA(label, fill, `${theme}: ${state} label on fill`)
      }
    })

    it(`the secondary button label reaches ${AA}:1 and its border matches its fill (${theme})`, () => {
      for (const state of ['.btn-secondary', '.btn-secondary:hover']) {
        const label = resolve(declaration(state, 'color', theme), theme)
        const fill = resolve(declaration(state, 'background-color', theme), theme)
        assertAA(label, fill, `${theme}: ${state} label on fill`)
      }
      const fill = resolve(declaration('.btn-secondary', 'background-color', theme), theme)
      const border = resolve(borderColor('.btn-secondary', theme), theme)
      assert.equal(border, fill, `${theme}: .btn-secondary border ${border} differs from its fill ${fill}`)
    })

    it(`the primary button border matches its fill (${theme})`, () => {
      const fill = resolve(declaration('.btn-primary', 'background-color', theme), theme)
      const border = resolve(borderColor('.btn-primary', theme), theme)
      assert.equal(border, fill, `${theme}: .btn-primary border ${border} differs from its fill ${fill}`)
    })
  }

  it(`star counts use the star token, which reaches ${AA}:1 on the card surface`, () => {
    for (const page of ['', 'projects']) {
      const spans = [...htmlFor(page).matchAll(/<span class="([^"]*)">★/g)].map((m) => m[1])
      assert.ok(spans.length > 0, `/${page || ''}: no star counts found`)
      for (const classes of spans) {
        assert.ok(classes.includes('text-star'), `/${page}: star count has classes "${classes}", expected text-star`)
        assert.ok(!/\btext-yellow-/.test(classes), `/${page}: star count still uses a text-yellow-* class`)
      }
    }
    for (const theme of ['light', 'dark'] as const) {
      const t = tokens(theme)
      assert.ok(t['--star'], `no --star token (${theme})`)
      assertAA(t['--star'], t['--surface'], `${theme}: --star on surface`)
    }
  })

  it(`weekly downloads use the downloads token, which reaches ${AA}:1 on the card surface`, () => {
    for (const page of ['', 'projects']) {
      const spans = [...htmlFor(page).matchAll(/<span class="([^"]*)">↓/g)].map((m) => m[1])
      assert.ok(spans.length > 0, `/${page}: no weekly downloads found`)
      for (const classes of spans) {
        assert.ok(classes.includes('text-downloads'), `/${page}: weekly downloads have classes "${classes}", expected text-downloads`)
        assert.ok(!/\btext-green-/.test(classes), `/${page}: weekly downloads still use a text-green-* class`)
      }
    }
    for (const theme of ['light', 'dark'] as const) {
      const t = tokens(theme)
      assert.ok(t['--downloads'], `no --downloads token (${theme})`)
      assertAA(t['--downloads'], t['--surface'], `${theme}: --downloads on surface`)
    }
  })
})

describe('heading levels', () => {
  const builtPages = [...pages.map(htmlFor), readFileSync(join(dist, '404.html'), 'utf8')]
  const labels = [...pages.map((p) => `/${p}`), '/404']

  function headingLevels(html: string): number[] {
    return [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
  }

  it('starts at the h1 and never skips a level on any page', () => {
    builtPages.forEach((html, i) => {
      const levels = headingLevels(html)
      assert.equal(levels[0], 1, `${labels[i]}: first heading is h${levels[0]}, expected h1`)
      for (let j = 1; j < levels.length; j++) {
        assert.ok(
          levels[j] <= levels[j - 1] + 1,
          `${labels[i]}: h${levels[j - 1]} is followed by h${levels[j]} (headings: ${levels.map((l) => `h${l}`).join(' ')})`,
        )
      }
    })
  })

  it('makes "GitHub Projects" and "npm Packages" h2 on /projects', () => {
    const html = htmlFor('projects')
    for (const title of ['GitHub Projects', 'npm Packages']) {
      assert.match(
        html,
        new RegExp(`<h2[^>]*>\\s*${title}\\s*</h2>`),
        `/projects: "${title}" is not an h2`,
      )
    }
  })

  it('makes every card title h2 on /publications and /wishlist', () => {
    for (const page of ['publications', 'wishlist']) {
      const levels = headingLevels(htmlFor(page))
      assert.ok(levels.length > 1, `/${page}: no card titles found`)
      assert.deepEqual(
        levels.slice(1),
        levels.slice(1).map(() => 2),
        `/${page}: card titles are not all h2 (headings: ${levels.map((l) => `h${l}`).join(' ')})`,
      )
    }
  })
})

describe('blog placeholders', () => {
  it('shows none of the three placeholder post titles on /blog or /', () => {
    const placeholderTitles = [
      'Implementing FAIR Data Principles in Research Pipelines',
      'Building Reproducible Computational Workflows with Containers',
      'Why Open Science Infrastructure Matters for the Next Decade',
    ]
    for (const page of ['blog', '']) {
      const html = htmlFor(page)
      for (const title of placeholderTitles) {
        assert.ok(
          !html.includes(title),
          `/${page}: still shows placeholder post "${title}"`,
        )
      }
    }
  })

  it('shows "coming soon" on /blog exactly when there are no posts', () => {
    const main = htmlFor('blog').match(/<main[\s\S]*<\/main>/)?.[0] ?? ''
    assert.equal(
      /first post coming soon\./i.test(main),
      posts.length === 0,
      `/blog: "First post coming soon." should be shown exactly when posts is empty (posts: ${posts.length})`,
    )
  })

  it('shows "coming soon" and no "View All Posts" in the home Blog section exactly when there are no posts', () => {
    const section =
      htmlFor('').match(/<section id="blog"[\s\S]*?<\/section>/)?.[0] ?? ''
    assert.ok(section, '/: no #blog section found')
    const empty = posts.length === 0
    assert.equal(
      /first post coming soon\./i.test(section),
      empty,
      `/: #blog "First post coming soon." should be shown exactly when posts is empty (posts: ${posts.length})`,
    )
    assert.equal(
      section.includes('View All Posts'),
      !empty,
      `/: #blog "View All Posts" should be shown exactly when there are posts (posts: ${posts.length})`,
    )
  })

  it('lists one BlogPosting in the /blog JSON-LD per post', () => {
    const types = jsonLdBlocks(htmlFor('blog')).map((b) => JSON.parse(b)['@type'])
    assert.ok(types.includes('CollectionPage'), '/blog: no CollectionPage JSON-LD')
    assert.equal(
      types.filter((t) => t === 'BlogPosting').length,
      posts.length,
      `/blog: BlogPosting JSON-LD entries should equal posts (posts: ${posts.length})`,
    )
  })

  it('says "first post coming soon" in the /blog meta description exactly when there are no posts', () => {
    const tag = allTags(htmlFor('blog'), 'meta', 'name="description"')[0]
    const description = attrValue(tag, 'content') ?? ''
    assert.equal(
      /first post coming soon/i.test(description),
      posts.length === 0,
      `/blog: meta description "${description}" should say "first post coming soon" exactly when posts is empty (posts: ${posts.length})`,
    )
  })
})
