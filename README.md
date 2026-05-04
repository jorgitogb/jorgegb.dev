---
name: "jorgegb.dev"
version: "0.0.2"
---

# jorgegb.dev

Personal portfolio website showcasing my work as a software developer at a plant science institute.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Build for production: `npm run build`
5. Preview build: `npm run preview`

## Project Structure

- `src/` - Source files
  - `pages/` - Astro pages (index, publications, wishlist)
  - `layouts/` - Layout components
  - `styles/` - Global CSS with Tailwind v4
- `public/` - Static assets (logo.svg, robots.txt, sitemap.xml)
- `astro.config.mjs` - Astro configuration
- `tsconfig.json` - TypeScript configuration

## Technologies Used

- Astro (static site generator)
- React
- TypeScript
- Tailwind CSS v4 (with @theme CSS variables)

## Features

- Dark/light mode toggle with localStorage persistence
- Terminal/TUI aesthetic
- SEO optimized (robots.txt, sitemap.xml, JSON-LD schema)