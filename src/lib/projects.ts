export type GitHubRepo = {
  name: string
  description: string | null
  htmlUrl: string
  homepage: string | null
  stargazersCount: number
  language: string | null
}

export type NpmPackage = {
  name: string
  description: string | null
  version: string
  weeklyDownloads: number
  repositoryUrl: string | null
}

const GITHUB_USERNAME = 'jorgitogb'
const NPM_AUTHOR = 'jorgegb'

const DEFAULT_FETCH_TIMEOUT_MS = 8_000

function readEnv(name: string): string | undefined {
  return process.env[name]
}

function fetchTimeoutMs(): number {
  const parsed = Number(readEnv('PROJECTS_FETCH_TIMEOUT_MS'))
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_FETCH_TIMEOUT_MS
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'jorgegb.dev-build',
  }
  const token = readEnv('GITHUB_TOKEN')
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

// Per-process memo: index.astro and projects.astro request the same URLs,
// so fetch each at most once per build.
const cache = new Map<string, Promise<unknown>>()

/** Test hook: clear the per-build response cache. */
export function resetProjectsCache(): void {
  cache.clear()
}

function cached<T>(key: string, loader: () => Promise<T[]>): Promise<T[]> {
  const hit = cache.get(key)
  if (hit) return hit as Promise<T[]>
  const pending = loader()
  cache.set(key, pending)
  return pending
}

function isRateLimited(status: number): boolean {
  return status === 403 || status === 429
}

// Curated one-liners for repos/packages whose registry metadata has no
// description. Keyed by exact repo or package name.
const PROJECT_BLURBS: Record<string, string> = {
  'jorgegb.dev':
    'Personal portfolio website of a software developer at a plant science institute.',
  sradi_metadata_to_schemaorg:
    'Extracts dataset metadata from CKAN and converts it to Schema.org JSON-LD.',
  fairweaver:
    'Visual demo tool to inspect Schema.org, ARC RO-Crate and FAIRagro metadata in the browser.',
}

export function describeProject(
  name: string,
  apiDescription: string | null,
  language: string | null,
): string {
  if (apiDescription && apiDescription.trim().length > 0) return apiDescription
  const curated = PROJECT_BLURBS[name]
  if (curated) return curated
  if (language && language.trim().length > 0) {
    return `An open-source ${language.trim()} project by Jorge García Brizuela.`
  }
  return 'An open-source project by Jorge García Brizuela.'
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  return cached<GitHubRepo>('github-repos', async () => {
    const url =
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`
    try {
      const res = await fetch(url, {
        headers: githubHeaders(),
        signal: AbortSignal.timeout(fetchTimeoutMs()),
      })
      if (!res.ok) {
        if (isRateLimited(res.status)) {
          console.error(
            `GitHub API rate-limited (HTTP ${res.status}). Set the GITHUB_TOKEN env var to raise the quota; deploying with an empty project list.`,
          )
        } else {
          console.warn(`GitHub API returned ${res.status}`)
        }
        return []
      }
      const data = (await res.json()) as Array<{
        name: string
        description: string | null
        html_url: string
        homepage: string | null
        stargazers_count: number
        language: string | null
        fork: boolean
        archived: boolean
      }>
      return data
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
    } catch (err) {
      console.warn('Failed to fetch GitHub repos:', err)
      return []
    }
  })
}

export async function fetchNpmPackages(): Promise<NpmPackage[]> {
  return cached<NpmPackage>('npm-packages', async () => {
    const url =
      `https://registry.npmjs.org/-/v1/search?text=maintainer:${NPM_AUTHOR}&size=50`
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(fetchTimeoutMs()),
      })
      if (!res.ok) {
        console.warn(`npm registry returned ${res.status}`)
        return []
      }
      const data = (await res.json()) as {
        objects: Array<{
          package: {
            name: string
            description: string | null
            version: string
            links: { repository?: string; homepage?: string }
          }
          downloads: { weekly: number }
        }>
      }
      return data.objects
        .map((o) => ({
          name: o.package.name,
          description: o.package.description,
          version: o.package.version,
          weeklyDownloads: o.downloads.weekly ?? 0,
          repositoryUrl:
            o.package.links?.repository ?? o.package.links?.homepage ?? null,
        }))
        .sort((a, b) => b.weeklyDownloads - a.weeklyDownloads)
    } catch (err) {
      console.warn('Failed to fetch npm packages:', err)
      return []
    }
  })
}
