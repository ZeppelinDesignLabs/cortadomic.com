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
