import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { posts } from '../src/data/blog-posts.ts'

describe('blog posts data', () => {
  it('has at least one post', () => {
    assert.ok(posts.length > 0, 'expected at least one blog post')
  })

  it('every post has all required non-empty fields', () => {
    for (const post of posts) {
      for (const field of [
        'slug',
        'title',
        'date',
        'description',
        'content',
      ] as const) {
        assert.equal(
          typeof post[field],
          'string',
          `${post.slug || '(unknown)'}: ${field} must be a string`,
        )
        assert.ok(
          post[field].trim().length > 0,
          `${post.slug || '(unknown)'}: ${field} must not be empty`,
        )
      }
      assert.ok(
        Array.isArray(post.tags) && post.tags.length > 0,
        `${post.slug}: tags must be a non-empty array`,
      )
      for (const tag of post.tags) {
        assert.ok(
          typeof tag === 'string' && tag.trim().length > 0,
          `${post.slug}: every tag must be a non-empty string`,
        )
      }
    }
  })

  it('slugs are unique and URL-safe', () => {
    const slugs = posts.map((post) => post.slug)
    assert.equal(
      new Set(slugs).size,
      slugs.length,
      'duplicate blog post slugs found',
    )
    for (const slug of slugs) {
      assert.match(slug, /^[a-z0-9-]+$/, `slug is not URL-safe: ${slug}`)
    }
  })

  it('dates are valid ISO calendar dates', () => {
    for (const post of posts) {
      assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/, `${post.slug}: bad date`)
      const [y, m, d] = post.date.split('-').map(Number)
      const asDate = new Date(Date.UTC(y, m - 1, d))
      assert.equal(
        asDate.toISOString().slice(0, 10),
        post.date,
        `${post.slug}: ${post.date} is not a real calendar date`,
      )
    }
  })
})
