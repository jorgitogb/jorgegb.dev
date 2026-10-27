import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type BlogPost = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  content: string
}

// Plain reader for src/content/blog/*.md, so the pages and the node tests
// (which cannot import `astro:content`) share one list of posts.
const dir = join(process.cwd(), 'src/content/blog')

function readPost(file: string): BlogPost {
  const raw = readFileSync(join(dir, file), 'utf8')
  const [, frontmatter, content] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!
  const field = (name: string) =>
    JSON.parse(frontmatter.match(new RegExp(`^${name}: (.*)$`, 'm'))![1])
  return {
    slug: file.replace(/\.md$/, ''),
    title: field('title'),
    date: field('date'),
    description: field('description'),
    tags: field('tags'),
    content: content.trim(),
  }
}

export const posts: BlogPost[] = readdirSync(dir)
  .filter((file) => file.endsWith('.md'))
  .map(readPost)
  .sort((a, b) => b.date.localeCompare(a.date))
