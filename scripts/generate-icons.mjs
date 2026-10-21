// One-off: crops the kitten photo into PWA icons. Run with `npm run icons`.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SOURCE = 'src/assets/kitten.jpg';
const OUT_DIR = 'public/icons';
const BLUSH_PINK = '#F7AEB8';

const { width, height } = await sharp(SOURCE).metadata();
const side = Math.min(width, height);
// Same focus as the on-screen photo (object-position: center 30%)
const square = {
  left: Math.round((width - side) / 2),
  top: Math.round((height - side) * 0.3),
  width: side,
  height: side,
};

await mkdir(OUT_DIR, { recursive: true });

async function plain(size, name) {
  await sharp(SOURCE).extract(square).resize(size, size).png().toFile(`${OUT_DIR}/${name}`);
}

await plain(192, 'icon-192.png');
await plain(512, 'icon-512.png');
await plain(180, 'apple-touch-icon.png');

// Maskable: kitten at 80% inside the safe zone, on the brand pink
const inner = Math.round(512 * 0.8);
const kitten = await sharp(SOURCE).extract(square).resize(inner, inner).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: BLUSH_PINK } })
  .composite([{ input: kitten, gravity: 'center' }])
  .png()
  .toFile(`${OUT_DIR}/icon-maskable-512.png`);

console.log('Icons written to', OUT_DIR);
