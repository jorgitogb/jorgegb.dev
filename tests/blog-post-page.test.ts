import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Built-site assertions for the first blog post. Run after `astro build`.

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const slug = 'vertical-slice-development'

function frontmatterField(field: string): string {
  const md = readFileSync(join(root, 'src/content/blog', `${slug}.md`), 'utf8')
  const m = md.match(new RegExp(`^${field}: "(.*)"$`, 'm'))
  assert.ok(m, `${slug}.md: no ${field} in frontmatter`)
  return m[1]
}

function postHtml(): string {
  const file = join(root, 'dist', 'blog', `${slug}.html`)
  assert.ok(
    existsSync(file),
    `missing built page for /blog/${slug} (looked for ${file}) — run "astro build" first`,
  )
  return readFileSync(file, 'utf8')
}

describe(`/blog/${slug}`, () => {
  it('shows the title as h1, the date and a link back to /blog', () => {
    const html = postHtml()
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
      m[1].replace(/<[^>]+>/g, '').trim(),
    )
    assert.deepEqual(h1s, [frontmatterField('title')], 'h1 should be the post title')
    assert.ok(html.includes(frontmatterField('date')), 'post date is not shown')
    assert.ok(
      /<a\b[^>]*href="\/blog"[^>]*>[^<]*All posts/.test(html),
      'no "← All posts" link to /blog',
    )
  })

  it('renders the Markdown body as HTML with no raw Markdown left', () => {
    const html = postHtml()
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? ''
    assert.ok(/<h2[\s>]/.test(main), 'no <h2> in the post body')
    assert.ok(/<p[\s>]/.test(main), 'no <p> in the post body')
    assert.ok(/<pre[\s>]/.test(main), 'no code block in the post body')
    const text = main.replace(/<[^>]+>/g, '\n')
    assert.ok(!/^\s*#{1,6} /m.test(text), 'raw Markdown heading ("## ") left in the body')
    assert.ok(!text.includes('**'), 'raw Markdown bold ("**") left in the body')
  })

  it('has its own title, description, canonical and og:type=article', () => {
    const html = postHtml()
    const meta = (attr: string, value: string) =>
      html.match(new RegExp(`<meta[^>]*${attr}="${value}"[^>]*content="([^"]*)"`))?.[1]
    const canonical = `https://jorgegb.dev/blog/${slug}`
    assert.equal(
      html.match(/<title>([^<]*)<\/title>/)?.[1].trim(),
      `${frontmatterField('title')} — Jorge GB`,
      'title',
    )
    assert.equal(meta('name', 'description'), frontmatterField('description'), 'description')
    assert.deepEqual(
      [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/g)].map((m) => m[1]),
      [canonical],
      'canonical',
    )
    assert.equal(meta('property', 'og:url'), canonical, 'og:url')
    assert.equal(meta('property', 'og:type'), 'article', 'og:type')
  })

  it('has exactly one BlogPosting JSON-LD with the canonical url, date and an author', () => {
    const blocks = [
      ...postHtml().matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ].map((m) => JSON.parse(m[1]))
    const postings = blocks.filter((b) => b['@type'] === 'BlogPosting')
    assert.equal(postings.length, 1, 'expected exactly one BlogPosting')
    const [posting] = postings
    assert.equal(posting.url, `https://jorgegb.dev/blog/${slug}`, 'url')
    assert.equal(posting.datePublished, frontmatterField('date'), 'datePublished')
    assert.ok(posting.author?.name, 'author.name')
  })

  it('starts at the h1 and never skips a heading level', () => {
    const levels = [...postHtml().matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))
    const list = levels.map((l) => `h${l}`).join(' ')
    assert.equal(levels[0], 1, `first heading is h${levels[0]}, expected h1 (headings: ${list})`)
    for (let i = 1; i < levels.length; i++) {
      assert.ok(levels[i] <= levels[i - 1] + 1, `h${levels[i - 1]} is followed by h${levels[i]} (headings: ${list})`)
    }
  })
})
