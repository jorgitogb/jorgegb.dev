# OpenCode Agent Instructions

## Project Overview
This is a personal portfolio website built with Astro, React, TypeScript, and Tailwind CSS v4. The site is hosted at https://jorgegb.dev. Features a terminal/TUI aesthetic with dark mode toggle.

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Architecture
- Main entrypoint: `src/pages/index.astro`
- Layout component: `src/layouts/Layout.astro`
- Global styles: `src/styles/global.css`
- All source files in `src/` directory

## Pages
- `/` - Homepage (index.astro)
- `/publications` - Publications list
- `/wishlist` - Wishlist

## Framework Details
- Built with Astro static site generator
- Uses React JSX with `jsxImportSource: "react"`
- TypeScript configured with React JSX support
- Tailwind CSS v4 with @theme using CSS variables for dark/light mode

## Theme Toggle Implementation
- Dark/light mode uses CSS-only approach with `.dark` class on HTML element
- Manual toggle button with sun/moon icons and localStorage persistence
- Theme state toggled via JavaScript: `document.documentElement.classList.toggle("dark")`
- localStorage stores: `localStorage.setItem("theme", "dark"|"light")`

## CSS Fallback for Theme Icons
**Important**: Tailwind's `dark:` variant requires `@custom-variant dark (&)` in CSS. If icons don't swap correctly, use CSS fallback rules in `src/styles/global.css`:

```
/* Fallback theme toggle icon visibility */
#sun-icon { display: none !important; }
html.dark #sun-icon { display: block !important; }
#moon-icon { display: block !important; }
html.dark #moon-icon { display: none !important; }
```

## Key Implementation Details
- Use CSS variables (var(--background), var(--surface), etc. in @theme, not hardcoded hex values
- Avoid Tailwind's dark: prefix - use CSS-only .dark class approach instead

## Development Workflow
1. Run `npm install` to install dependencies
2. Run `npm run dev` to start local development server
3. Build with `npm run build` for production
4. Preview build with `npm run preview`

## Important Notes
- No integrations configured in astro.config.mjs
- Uses default Astro structure with minimal configuration
- All source code is in the `src/` directory
- Sun icon: center circle + 8 rays (all in one SVG)
- Moon icon: classic crescent path (no rays)