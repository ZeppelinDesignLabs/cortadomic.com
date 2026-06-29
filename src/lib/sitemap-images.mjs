import fs from 'node:fs';
import path from 'node:path';

const siteUrl = 'https://www.cortadomic.com';

/** @type {Record<string, string[]>} */
const pageImages = {
  '/': [
    '/images/products/mkiii-hero-inhand.jpg',
    '/images/products/xe-on-guitar.jpg',
    '/images/og/og-home.jpg',
  ],
  '/products/cortado-mkiii/': [],
  '/products/cortado-xe/': [],
  '/applications/': [
    '/images/products/mkiii-basketball-court.jpg',
    '/images/products/xe-on-guitar.jpg',
  ],
  '/about/': ['/images/logos/zeppelin-logo.png'],
};

const productsDir = path.join(process.cwd(), 'src/content/products');
if (fs.existsSync(productsDir)) {
  for (const file of fs.readdirSync(productsDir).filter((f) => f.endsWith('.json'))) {
    const p = JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf-8'));
    const slugPath = `/products/${p.slug}/`;
    pageImages[slugPath] = [
      p.heroImage,
      ...(p.galleryImages || []),
      p.ogImage,
    ].filter(Boolean);
  }
}

const submissionsDir = path.join(process.cwd(), 'src/content/submissions');
if (fs.existsSync(submissionsDir)) {
  const storyImages = [];
  for (const file of fs.readdirSync(submissionsDir).filter((f) => /\.(md|mdx)$/.test(f))) {
    const raw = fs.readFileSync(path.join(submissionsDir, file), 'utf-8');
    const slug = file.replace(/\.(md|mdx)$/, '');
    const cover = raw.match(/^coverImage:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1];
    const imgs = [...raw.matchAll(/^\s*-\s*src:\s*["']?([^"'\n]+)["']?\s*$/gm)].map((m) => m[1]);
    const combined = [cover, ...imgs].filter(Boolean);
    if (combined.length) {
      pageImages[`/stories/${slug}/`] = combined;
      storyImages.push(...combined);
    }
  }
  if (storyImages.length) {
    pageImages['/stories/'] = [...new Set(storyImages)];
  }
}

/**
 * @param {import('@astrojs/sitemap').SitemapItem} item
 */
export function serializeSitemapItem(item) {
  const pathname = new URL(item.url, siteUrl).pathname.replace(/\/$/, '') || '/';
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const key = normalized === '//' ? '/' : normalized;
  const images = (pageImages[key] || pageImages[pathname] || []).map((src) => ({
    url: src.startsWith('http') ? src : `${siteUrl}${src}`,
    title: 'Cortado Mic',
  }));
  if (images.length) {
    return { ...item, images };
  }
  return item;
}
