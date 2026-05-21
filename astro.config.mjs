import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { serializeSitemapItem } from './src/lib/sitemap-images.mjs';

export default defineConfig({
  site: 'https://www.cortadomic.com',
  trailingSlash: 'ignore',
  redirects: {
    '/spec-and-documents': '/compare/',
    '/specifications-and-documentation': '/compare/',
    '/home': '/',
    '/wp-content/uploads/2021/04/CORTADO-MKIII-DATASHEET.pdf': '/docs/cortado-mkiii-datasheet.pdf',
    '/wp-content/uploads/2025/08/CORTADO-MKIII-OWNERS-GUIDE.pdf': '/docs/cortado-mkiii-owners-guide.pdf',
    '/wp-content/uploads/2021/04/Cortado-MkIII-Contact-Microphone-Dimensions-1.pdf': '/docs/cortado-mkiii-dimensions.pdf',
  },
  integrations: [
    sitemap({
      serialize: serializeSitemapItem,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
