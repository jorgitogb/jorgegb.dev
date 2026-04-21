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

## Framework Details
- Built with Astro static site generator
- Uses React JSX with `jsxImportSource: "react"`
- TypeScript configured with React JSX support
- Tailwind CSS v4 with @theme using CSS variables for dark/light mode

## Key Implementation Details
- Dark/light mode uses CSS-only approach with `.dark` class on HTML element
- Manual toggle button with sun/moon icons and localStorage persistence
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