import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const images = [];
function visit(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, item.name);
    if (item.isDirectory()) visit(file);
    else if (/\.(png|jpe?g|webp)$/i.test(file)) images.push(file);
  }
}
visit('src/assets');
// Collection display faces stay self-hosted and bounded, just like the artwork.
for (const item of readdirSync('src/assets/fonts/collection')) {
  if (!item.endsWith('.woff2')) continue;
  const file = join('src/assets/fonts/collection', item), bytes = readFileSync(file);
  if (bytes.subarray(0,4).toString() !== 'wOF2' || bytes.length > 80 * 1024) throw new Error('Invalid or oversized Collection font: ' + file);
}
if (!images.length) throw new Error('No artwork found. A build with missing artwork is not a release check.');
for (const file of images) {
  const bytes = readFileSync(file);
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216;
  const webp = bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (bytes.length < 32 || !(png || jpeg || webp)) throw new Error('Invalid or stubbed artwork: ' + file);
  if (/\/(?:groves|inkanyamba)\/wrath-[1-5]\.webp$/.test(file) && bytes.length > 120 * 1024) throw new Error('Wrath background exceeds 120KiB: ' + file);
  if (/\/groves\/site-(?:burial|shrine|holy)\.webp$/.test(file) && bytes.length > 520 * 1024) throw new Error('Sacred-space atlas exceeds 520KiB: ' + file);
  if (file.endsWith('/inkanyamba/heroes.webp') && bytes.length > 620 * 1024) throw new Error('Inkanyamba hero atlas exceeds 620KiB: ' + file);
  if (file.endsWith('/groves/sites.webp') && bytes.length > 750 * 1024) throw new Error('Sacred-space state atlas exceeds 750KiB: ' + file);
  if (file.includes('/collection-scenes/') && bytes.length > 200 * 1024) throw new Error('Collection background exceeds 200KiB: ' + file);
  if (file.includes('/collection-thumbnails/') && bytes.length > 96 * 1024) throw new Error('Collection cover exceeds 96KiB: ' + file);
  if (file.includes('/collection-portraits/') && bytes.length > 30 * 1024) throw new Error('Collection portrait exceeds 30KiB: ' + file);
}
console.log(`Verified ${images.length} original artwork files.`);
