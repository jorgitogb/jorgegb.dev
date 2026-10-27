export type PostMeta = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
}

export function blogPostingLd(post: PostMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    description: post.description,
    url: `https://jorgegb.dev/blog/${post.slug}`,
    keywords: post.tags.join(', '),
    author: {
      '@type': 'Person',
      name: 'Jorge Garcia Brizuela',
      url: 'https://jorgegb.dev',
    },
  }
}
