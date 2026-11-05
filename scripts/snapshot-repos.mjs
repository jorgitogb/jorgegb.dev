// Regenerates src/data/repos-snapshot.json from the GitHub API.
// The site falls back to it when the build-time API call fails (rate limits).
// Usage: pnpm snapshot:repos   (GITHUB_TOKEN optional)
import { writeFileSync } from 'node:fs'

const USER = 'jorgitogb'
const headers = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'jorgegb.dev-snapshot' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated&type=owner`, { headers })
if (!res.ok) throw new Error(`GitHub API returned ${res.status}`)

const repos = (await res.json())
  .filter((r) => !r.fork && !r.archived)
  .map((r) => ({
    name: r.name,
    description: r.description,
    htmlUrl: r.html_url,
    homepage: r.homepage,
    stargazersCount: r.stargazers_count,
    language: r.language,
  }))
  .sort((a, b) => b.stargazersCount - a.stargazersCount)

const out = new URL('../src/data/repos-snapshot.json', import.meta.url)
writeFileSync(out, JSON.stringify(repos, null, 2) + '\n')
console.log(`Wrote ${repos.length} repos to src/data/repos-snapshot.json`)
