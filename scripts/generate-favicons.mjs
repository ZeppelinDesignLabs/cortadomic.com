/**
 * Regenerate favicon derivatives from public/favicon-32x32.png
 * (Zeppelin Design Labs black-Z-on-orange mark).
 */
import toIco from 'to-ico';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public/favicon-32x32.png');
const png16 = await sharp(src).resize(16, 16).png().toBuffer();
const png32 = readFileSync(src);

writeFileSync(path.join(root, 'public/favicon.ico'), await toIco([png16, png32]));
await sharp(src)
  .resize(180, 180, { kernel: sharp.kernel.nearest })
  .png()
  .toFile(path.join(root, 'public/apple-touch-icon.png'));

console.log('favicon.ico and apple-touch-icon.png written');
