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

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`,
      { headers: { Accept: 'application/vnd.github.v3+json' } },
    )
    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}`)
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
}

export async function fetchNpmPackages(): Promise<NpmPackage[]> {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=maintainer:${NPM_AUTHOR}&size=50`,
    )
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
}
