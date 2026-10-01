import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://jorgegb.dev',
  // Emit /projects.html instead of /projects/index.html so served URLs match
  // internal hrefs (/projects) and canonicals with no redirect hop, and so
  // a future 404.html is picked up as the Pages not-found page.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});