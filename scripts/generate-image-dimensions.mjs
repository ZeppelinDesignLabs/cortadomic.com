/**
 * Scan public/images and write src/data/image-dimensions.json for Picture CLS hints.
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesRoot = path.join(root, 'public/images');
const outFile = path.join(root, 'src/data/image-dimensions.json');

const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

async function walk(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full, acc);
    else if (exts.has(path.extname(ent.name).toLowerCase())) acc.push(full);
  }
  return acc;
}

const files = await walk(imagesRoot);
const dimensions = {};

for (const file of files) {
  const rel = '/' + path.relative(path.join(root, 'public'), file).replace(/\\/g, '/');
  if (rel.endsWith('.avif') || rel.endsWith('.webp')) continue;
  try {
    const meta = await sharp(file).metadata();
    if (meta.width && meta.height) dimensions[rel] = { width: meta.width, height: meta.height };
  } catch {
    /* skip */
  }
}

await fs.mkdir(path.dirname(outFile), { recursive: true });
await fs.writeFile(outFile, JSON.stringify(dimensions, null, 2));
console.log(`Wrote ${Object.keys(dimensions).length} entries to image-dimensions.json`);
