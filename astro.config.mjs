import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

const site = 'https://jorgegb.dev';

// @astrojs/sitemap strips the slash from the home <loc> when trailingSlash is
// 'never'. The home canonical is `${site}/`, so put it back.
// Must come after sitemap() in `integrations`: hooks run in array order.
const homeSitemapSlash = () => ({
  name: 'home-sitemap-slash',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const file = fileURLToPath(new URL('./sitemap-0.xml', dir));
      const xml = await readFile(file, 'utf8');
      await writeFile(
        file,
        xml.replace(`<loc>${site}</loc>`, `<loc>${site}/</loc>`),
      );
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site,
  // Emit /projects.html instead of /projects/index.html so served URLs match
  // internal hrefs (/projects) and canonicals with no redirect hop, and so
  // a future 404.html is picked up as the Pages not-found page.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ lastmod: new Date() }), homeSitemapSlash()],

  vite: {
    plugins: [tailwindcss()],
  },
});