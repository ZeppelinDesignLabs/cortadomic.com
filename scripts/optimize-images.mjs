/**
 * Image optimization for cortadomic.com
 *
 * Walks public/images/, and for every source raster image (jpg/jpeg/png):
 *   1. Resizes the original down to MAX_WIDTH if larger
 *   2. Re-encodes the original at sensible quality (JPEG or PNG)
 *   3. Emits sibling .webp and .avif files at the same dimensions
 *
 * Idempotent: skips a derivative if its source mtime hasn't changed since the
 * derivative was generated (tracked via .image-cache.json next to this script).
 *
 * Usage:
 *   npm run optimize:images          # process new/changed only
 *   npm run optimize:images -- --force   # rebuild everything
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const CACHE_FILE = path.join(__dirname, '.image-cache.json');

const MAX_WIDTH = 2000;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 78;
const AVIF_QUALITY = 55;

const FORCE = process.argv.includes('--force');

const SOURCE_EXTS = new Set(['.jpg', '.jpeg', '.png']);
const SKIP_NAMES = new Set([
  'apple-touch-icon.png',
  'favicon-32x32.png',
  'favicon.svg',
]);

async function loadCache() {
  try {
    return JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n');
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimizeOne(srcPath, cache) {
  const rel = path.relative(ROOT, srcPath).replace(/\\/g, '/');
  const ext = path.extname(srcPath).toLowerCase();
  if (!SOURCE_EXTS.has(ext)) return null;
  if (SKIP_NAMES.has(path.basename(srcPath))) return null;

  const stat = await fs.stat(srcPath);
  const cached = cache[rel];
  if (!FORCE && cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return { rel, skipped: true };
  }

  const baseNoExt = srcPath.slice(0, -ext.length);
  const webpPath = `${baseNoExt}.webp`;
  const avifPath = `${baseNoExt}.avif`;

  const buffer = await fs.readFile(srcPath);
  const image = sharp(buffer, { failOn: 'none' }).rotate();
  const meta = await image.metadata();
  const needsResize = (meta.width || 0) > MAX_WIDTH;
  const pipeline = needsResize ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true }) : image;

  const isPng = ext === '.png';
  const reencodedBuffer = isPng
    ? await pipeline.clone().png({ compressionLevel: 9, palette: true }).toBuffer()
    : await pipeline.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true }).toBuffer();

  if (reencodedBuffer.length < buffer.length || needsResize) {
    await fs.writeFile(srcPath, reencodedBuffer);
  }

  const webpBuffer = await pipeline.clone().webp({ quality: WEBP_QUALITY }).toBuffer();
  await fs.writeFile(webpPath, webpBuffer);

  const avifBuffer = await pipeline.clone().avif({ quality: AVIF_QUALITY, effort: 4 }).toBuffer();
  await fs.writeFile(avifPath, avifBuffer);

  const newStat = await fs.stat(srcPath);
  cache[rel] = {
    mtimeMs: newStat.mtimeMs,
    size: newStat.size,
    width: needsResize ? MAX_WIDTH : meta.width,
    height: needsResize && meta.width && meta.height ? Math.round((meta.height / meta.width) * MAX_WIDTH) : meta.height,
  };

  return {
    rel,
    skipped: false,
    originalSize: buffer.length,
    newSize: newStat.size,
    webpSize: webpBuffer.length,
    avifSize: avifBuffer.length,
    resized: needsResize,
    width: cache[rel].width,
  };
}

async function main() {
  const cache = await loadCache();
  const files = [];
  for await (const f of walk(IMAGES_DIR)) files.push(f);

  let totalOrig = 0;
  let totalNew = 0;
  let processed = 0;
  let skipped = 0;
  const rows = [];

  for (const f of files) {
    try {
      const result = await optimizeOne(f, cache);
      if (!result) continue;
      if (result.skipped) {
        skipped++;
        continue;
      }
      processed++;
      totalOrig += result.originalSize;
      totalNew += result.newSize + result.webpSize + result.avifSize;
      rows.push(result);
    } catch (err) {
      console.error(`! ${path.relative(ROOT, f)}: ${err.message}`);
    }
  }

  await saveCache(cache);

  rows.sort((a, b) => b.originalSize - a.originalSize);
  for (const r of rows) {
    const ext = path.extname(r.rel).toUpperCase().slice(1);
    const resizeNote = r.resized ? ` -> ${r.width}px` : '';
    console.log(
      `${r.rel}${resizeNote}\n` +
      `  ${ext}:  ${fmtBytes(r.originalSize)} -> ${fmtBytes(r.newSize)}` +
      `   WEBP: ${fmtBytes(r.webpSize)}   AVIF: ${fmtBytes(r.avifSize)}`
    );
  }

  console.log('');
  console.log(`Processed: ${processed}   Skipped (cached): ${skipped}`);
  if (processed > 0) {
    console.log(`Original total:           ${fmtBytes(totalOrig)}`);
    console.log(`Optimized + WebP + AVIF:  ${fmtBytes(totalNew)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
