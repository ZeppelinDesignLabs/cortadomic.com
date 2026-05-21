/**
 * Generate 1200×630 Open Graph card images from hero sources.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/images/og');

const cards = [
  { out: 'og-home.jpg', src: 'public/images/products/mkiii-hero-34.jpg' },
  { out: 'og-mkiii.jpg', src: 'public/images/products/mkiii-hero-inhand.jpg' },
  { out: 'og-xe.jpg', src: 'public/images/products/xe-2.png' },
];

await mkdir(outDir, { recursive: true });

for (const card of cards) {
  const srcPath = path.join(root, card.src);
  await sharp(srcPath)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(path.join(outDir, card.out));
  console.log('Wrote', card.out);
}
