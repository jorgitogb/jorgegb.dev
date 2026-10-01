import { describe, it, afterEach, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  describeProject,
  fetchGitHubRepos,
  fetchNpmPackages,
  resetProjectsCache,
} from '../src/lib/projects.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  resetProjectsCache()
})

afterEach(() => {
  globalThis.fetch = originalFetch
  delete process.env.GITHUB_TOKEN
  delete process.env.PROJECTS_FETCH_TIMEOUT_MS
})

type CapturedInit = { headers?: unknown; signal?: unknown }

function stubFetch(handler: (url: string, init?: CapturedInit) => unknown) {
  globalThis.fetch = (async (input: unknown, init?: CapturedInit) => {
    const url = typeof input === 'string' ? input : String(input)
    return handler(url, init)
  }) as typeof fetch
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('fetchGitHubRepos', () => {
  const apiRepos = [
    {
      name: 'starred',
      description: 'most stars',
      html_url: 'https://github.com/jorgitogb/starred',
      homepage: null,
      stargazers_count: 10,
      language: 'TypeScript',
      fork: false,
      archived: false,
    },
    {
      name: 'plain',
      description: null,
      html_url: 'https://github.com/jorgitogb/plain',
      homepage: 'https://example.com',
      stargazers_count: 1,
      language: null,
      fork: false,
      archived: false,
    },
    {
      name: 'a-fork',
      description: 'fork',
      html_url: 'https://github.com/jorgitogb/a-fork',
      homepage: null,
      stargazers_count: 999,
      language: null,
      fork: true,
      archived: false,
    },
    {
      name: 'old-archived',
      description: 'archived',
      html_url: 'https://github.com/jorgitogb/old-archived',
      homepage: null,
      stargazers_count: 500,
      language: null,
      fork: false,
      archived: true,
    },
  ]

  it('filters forks/archived, maps fields, sorts by stars desc', async () => {
    const seen: string[] = []
    stubFetch((url) => {
      seen.push(url)
      return jsonResponse(apiRepos)
    })

    const repos = await fetchGitHubRepos()

    assert.equal(repos.length, 2)
    assert.equal(repos[0].name, 'starred')
    assert.equal(repos[0].stargazersCount, 10)
    assert.equal(repos[0].htmlUrl, 'https://github.com/jorgitogb/starred')
    assert.equal(repos[0].language, 'TypeScript')
    assert.equal(repos[1].name, 'plain')
    assert.equal(repos[1].description, null)
    assert.equal(repos[1].homepage, 'https://example.com')
    assert.equal(seen.length, 1)
    assert.match(seen[0], /api\.github\.com/)
  })

  it('returns [] on non-ok responses (e.g. rate-limited 403)', async () => {
    stubFetch(() => jsonResponse({ message: 'API rate limit exceeded' }, 403))
    assert.deepEqual(await fetchGitHubRepos(), [])
  })

  it('returns [] when fetch throws (offline DNS)', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed')
    })
    assert.deepEqual(await fetchGitHubRepos(), [])
  })

  it('returns [] when the payload shape drifts', async () => {
    stubFetch(() => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    }))
    assert.deepEqual(await fetchGitHubRepos(), [])
  })

  it('fetches each URL at most once per process (shared by both pages)', async () => {
    let calls = 0
    stubFetch(() => {
      calls += 1
      return jsonResponse([])
    })

    const first = await fetchGitHubRepos()
    const second = await fetchGitHubRepos()

    assert.equal(calls, 1)
    assert.deepEqual(first, [])
    assert.deepEqual(second, [])
  })

  it('sends the GITHUB_TOKEN as a Bearer header when set', async () => {
    process.env.GITHUB_TOKEN = 'secret-token'
    let seenHeaders: Record<string, string> = {}
    stubFetch((_url, init) => {
      seenHeaders = (init?.headers ?? {}) as Record<string, string>
      return jsonResponse([])
    })

    await fetchGitHubRepos()

    assert.equal(seenHeaders.Authorization, 'Bearer secret-token')
    assert.equal(seenHeaders.Accept, 'application/vnd.github.v3+json')
  })

  it('omits the Authorization header when no token is set', async () => {
    let seenHeaders: Record<string, string> = {}
    stubFetch((_url, init) => {
      seenHeaders = (init?.headers ?? {}) as Record<string, string>
      return jsonResponse([])
    })

    await fetchGitHubRepos()

    assert.ok(!('Authorization' in seenHeaders))
  })

  it('gives up after PROJECTS_FETCH_TIMEOUT_MS instead of hanging the build', async () => {
    process.env.PROJECTS_FETCH_TIMEOUT_MS = '30'
    stubFetch((_url, init) => {
      const signal = init?.signal as AbortSignal | undefined
      assert.ok(signal instanceof AbortSignal, 'fetch must receive a signal')
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () =>
          reject(new DOMException('The operation was aborted.', 'TimeoutError')),
        )
      })
    })

    const started = Date.now()
    const repos = await fetchGitHubRepos()
    const elapsed = Date.now() - started

    assert.deepEqual(repos, [])
    assert.ok(elapsed < 2000, `took too long without a timeout: ${elapsed}ms`)
  })
})

describe('fetchNpmPackages', () => {
  const searchBody = {
    objects: [
      {
        package: {
          name: '@jorgegb/popular',
          description: 'popular package',
          version: '2.0.0',
          links: { repository: 'https://github.com/jorgitogb/popular' },
        },
        downloads: { weekly: 100 },
      },
      {
        package: {
          name: '@jorgegb/homepage-only',
          description: null,
          version: '0.1.0',
          links: { homepage: 'https://example.com/pkg' },
        },
        downloads: { weekly: 5 },
      },
      {
        package: {
          name: '@jorgegb/no-links',
          description: 'no links at all',
          version: '1.0.0',
          links: {},
        },
        downloads: { weekly: 50 },
      },
    ],
  }

  it('maps fields, falls back on links, sorts by downloads desc', async () => {
    const seen: string[] = []
    stubFetch((url) => {
      seen.push(url)
      return jsonResponse(searchBody)
    })

    const pkgs = await fetchNpmPackages()

    assert.equal(pkgs.length, 3)
    assert.equal(pkgs[0].name, '@jorgegb/popular')
    assert.equal(pkgs[0].weeklyDownloads, 100)
    assert.equal(
      pkgs[0].repositoryUrl,
      'https://github.com/jorgitogb/popular',
    )
    assert.equal(pkgs[1].name, '@jorgegb/no-links')
    assert.equal(pkgs[1].repositoryUrl, null)
    assert.equal(pkgs[2].name, '@jorgegb/homepage-only')
    assert.equal(pkgs[2].repositoryUrl, 'https://example.com/pkg')
    assert.equal(seen.length, 1)
    assert.match(seen[0], /registry\.npmjs\.org/)
  })

  it('treats missing weekly downloads as 0', async () => {
    stubFetch(() =>
      jsonResponse({
        objects: [
          {
            package: {
              name: '@jorgegb/new',
              description: null,
              version: '0.0.1',
              links: {},
            },
            downloads: {},
          },
        ],
      }),
    )

    const pkgs = await fetchNpmPackages()
    assert.equal(pkgs.length, 1)
    assert.equal(pkgs[0].weeklyDownloads, 0)
  })

  it('returns [] on non-ok responses', async () => {
    stubFetch(() => jsonResponse({ error: 'Service Unavailable' }, 503))
    assert.deepEqual(await fetchNpmPackages(), [])
  })

  it('returns [] when fetch throws', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed')
    })
    assert.deepEqual(await fetchNpmPackages(), [])
  })
})

describe('describeProject', () => {
  it('prefers the live API description', () => {
    assert.equal(
      describeProject('anything', 'Live description', 'Python'),
      'Live description',
    )
  })

  it('falls back to the curated blurb for known repos', () => {
    assert.equal(
      describeProject('sradi_metadata_to_schemaorg', null, 'Python'),
      'Extracts dataset metadata from CKAN and converts it to Schema.org JSON-LD.',
    )
    assert.equal(
      describeProject('fairweaver', null, 'Python'),
      'Visual demo tool to inspect Schema.org, ARC RO-Crate and FAIRagro metadata in the browser.',
    )
    assert.equal(
      describeProject('jorgegb.dev', null, 'Astro'),
      'Personal portfolio website of a software developer at a plant science institute.',
    )
  })

  it('ignores blank API descriptions', () => {
    assert.equal(
      describeProject('fairweaver', '   ', 'Python'),
      'Visual demo tool to inspect Schema.org, ARC RO-Crate and FAIRagro metadata in the browser.',
    )
  })

  it('falls back to a language-based line for unknown projects', () => {
    assert.equal(
      describeProject('brand-new-repo', null, 'Rust'),
      'An open-source Rust project by Jorge García Brizuela.',
    )
    assert.equal(
      describeProject('mystery', null, null),
      'An open-source project by Jorge García Brizuela.',
    )
  })

  it('never emits the "No description" placeholder', () => {
    for (const [name, desc, lang] of [
      ['a', null, null],
      ['b', '', 'Go'],
      ['fairweaver', null, null],
    ] as Array<[string, string | null, string | null]>) {
      assert.ok(
        !describeProject(name, desc, lang).includes('No description'),
      )
    }
  })
})
