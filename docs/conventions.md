# Conventions

> Style, naming, and formatting rules for this project.

## Language

# Conventions (Node / TypeScript)

> Style, naming, and formatting rules for Node.js and TypeScript projects.

## Formatting

- Use Prettier for auto-formatting.
- Indent with 2 spaces.
- Single quotes for strings.
- Trailing commas in multi-line collections.
- No semicolons (Prettier default).

## Naming

- Functions and variables: `camelCase`.
- Classes and types: `PascalCase`.
- Interfaces: `PascalCase` (no `I` prefix).
- Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for module-level.
- Files: `kebab-case.ts` (e.g., `user-service.ts`).

## TypeScript

- Strict mode enabled.
- Use `type` over `interface` for simple shapes.
- Prefer `unknown` over `any`.
- Use `satisfies` for type narrowing where possible.
- Explicit return types for exported functions.

## Imports

- Group: external → internal → relative. One blank line between groups.
- Use `import type` for type-only imports.
- Sort alphabetically within each group.

## Errors

- Use custom error classes extending `Error`.
- Catch specific errors, not `try/catch` with `any`.
- Use Result types or error objects, not thrown exceptions in business logic.

## Testing

- Use Vitest or Jest as the test runner.
- Test file names: `<module>.test.ts`.
- Test function names: `describe('ModuleName') / it('should <behavior>')`.
- Use `vi.fn()` or `jest.fn()` for mocks.
- Use `tmp` directory for filesystem tests.

## Git

- Conventional commits: `feat(module): description`.
- Branch naming: `feat/description`, `fix/description`.


# Conventions (Astro)

> Component patterns, islands, content collections, routing, and testing for Astro projects.

## File types

- `.astro` — UI components with frontmatter + template + scoped styles.
- `.md` / `.mdx` — Content files (posts, docs) in `src/content/`.
- `.ts` / `.js` — Utilities, helpers, server-side logic only.

## Component structure

- One component per file, file named after the component in `PascalCase.astro`.
- Place components in `src/components/`.
- Co-locate related styles in the same `.astro` file's `<style>` block.

## Frontmatter

- The `---` block runs at build time — server-side only by default.
- Use `Astro.props` to receive props from parent components.
- Import other components in frontmatter: `import Card from './Card.astro'`.
- Use `Astro.glob()` or `getCollection()` for content queries in frontmatter.

## Islands and client directives

- Astro components are static HTML by default — zero JS shipped.
- Add interactivity with `client:*` directives on framework components:
  - `client:load` — hydrate immediately.
  - `client:idle` — hydrate when browser is idle.
  - `client:visible` — hydrate when scrolled into view.
  - `client:media` — hydrate when a CSS media query matches.
- Use React, Vue, Svelte, or Solid components inside `.astro` files.

## Routing

- File-based routing in `src/pages/`.
- `[slug].astro` for dynamic routes, `[...slug].astro` for catch-all.
- `getStaticPaths()` returns the list of static paths for SSG.
- Use `Astro.url` and `Astro.request` in server mode.

## Content Collections

- Store content in `src/content/<collection>/`.
- Define schemas with `defineCollection` + Zod in `src/content/config.ts`.
- Query with `getCollection('blog')` or `getEntry('blog', 'my-post')`.
- Render with the Content component.

## Layouts

- Place reusable page layouts in `src/layouts/`.
- Layout wraps page content and provides head, body, nav, footer.
- Pass slot for page-specific content.

## Images

- Use Image from `astro:assets` for optimized images.
- Picture for responsive picture elements.
- Place static images in `public/` or import from `src/assets/`.
- Avoid raw img tags — Astro optimizes automatically.

## Styling

- style in .astro files is scoped by default.
- Tailwind CSS via `@astrojs/tailwind` integration.
- Global styles: use style is:global sparingly.
- CSS custom properties for theming in :root.

## Testing

- Run `astro check` for type checking the full project.
- Use `vitest` for unit/logic tests (not `.astro` component tests).
- Place tests in `src/__tests__/` or `*.test.ts` next to the source.
- E2E: Playwright with `astro build && astro preview`.

## Performance

- Static output (`output: 'static'`) for maximum performance.
- Server output (`output: 'server'`) for dynamic routes.
- Use `transition:animate` for view transitions between pages.
- Lazy-load below-the-fold content with `client:visible`.

## Git

- Conventional commits: `feat(blog): add new post`.
- Branch naming: `feat/content-collection`, `fix/routing-slug`.


## Formatting

- Indent with spaces (2 for YAML/JSON, 4 for Python, 2 for TypeScript).
- Trailing commas in multi-line arrays and objects.
- Single quotes for strings in Python, double quotes in TypeScript.
- No semicolons in TypeScript (Prettier default).

## Comments

- One-line comments for "why", not "what".
- No comment blocks longer than 3 lines.
- TODO format: `// TODO(username): description — ticket/issue`.

## Imports

- Group: stdlib → external → internal. One blank line between groups.
- No wildcard imports.
- Sort alphabetically within each group.

## Git

- Conventional commits: `<type>(<scope>): <subject>`.
- Types: feat, fix, docs, refactor, test, chore, perf, ci, build.
- Max 72 characters in the subject line.
- No commits directly to `main`. Use branches and PRs.

## Tests

- One assertion per test where possible.
- Test names describe behavior: `should <expected> when <condition>`.
- Use temp directories, not mocks, for filesystem tests.
- Clean up after tests (temp dirs, env vars).
