import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
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
  if (/\/groves\/wrath-[1-5]\.webp$/.test(file) && bytes.length > 120 * 1024) throw new Error('Divine Wrath background exceeds 120KiB: ' + file);
  if (/\/inkanyamba\/wrath-[1-5]\.webp$/.test(file) && bytes.length > 200 * 1024) throw new Error('Photographic Killer Wrath background exceeds 200KiB: ' + file);
  if (/\/bloodlust\/level-(?:[0-9]|10)\.webp$/.test(file) && bytes.length > 160 * 1024) throw new Error('Bloodlust photograph exceeds 160KiB: ' + file);
  if (/\/groves\/site-(?:burial|shrine|holy)\.webp$/.test(file) && bytes.length > 520 * 1024) throw new Error('Sacred-space atlas exceeds 520KiB: ' + file);
  if (file.endsWith('/inkanyamba/heroes.webp') && bytes.length > 620 * 1024) throw new Error('Inkanyamba hero atlas exceeds 620KiB: ' + file);
  if (file.endsWith('/groves/sites.webp') && bytes.length > 750 * 1024) throw new Error('Sacred-space state atlas exceeds 750KiB: ' + file);
  if (file.includes('/play/banners/') && bytes.length > 160 * 1024) throw new Error('Play banner exceeds 160KiB: ' + file);
  if (file.includes('/play/photos/') && bytes.length > 160 * 1024) throw new Error('Play photograph exceeds 160KiB: ' + file);
  if (file.includes('/play/final-girl-health/') && bytes.length > 160 * 1024) throw new Error('Health photograph exceeds 160KiB: ' + file);
  if (file.includes('/collection-scenes/') && bytes.length > 200 * 1024) throw new Error('Collection background exceeds 200KiB: ' + file);
  if (file.includes('/collection-thumbnails/') && bytes.length > 96 * 1024) throw new Error('Collection cover exceeds 96KiB: ' + file);
  if (file.includes('/collection-portraits/') && bytes.length > 30 * 1024) throw new Error('Collection portrait exceeds 30KiB: ' + file);
}
const healthDirectory = 'src/assets/play/final-girl-health';
const healthManifest = JSON.parse(readFileSync(join(healthDirectory, 'manifest.json'), 'utf8'));
const healthPaths = new Set();
for (const entry of healthManifest) {
  const sourceHash = createHash('sha256').update(readFileSync(entry.original)).digest('hex');
  if (sourceHash !== entry.originalSha256) throw new Error('Original portrait changed: ' + entry.name);
  for (const state of ['healthy', 'critical']) {
    const file = join(healthDirectory, `${entry.slug}-${state}.webp`), metadata = entry[state];
    if (!metadata?.source || !/^exec-[a-f0-9-]+\.png$/.test(metadata.source)) throw new Error('Missing health-photo provenance: ' + file);
    const bytes = readFileSync(file);
    if (metadata.sha256 !== createHash('sha256').update(bytes).digest('hex')) throw new Error('Health-photo manifest mismatch: ' + file);
    if (Math.max(metadata.width, metadata.height) !== 768 || Math.min(metadata.width, metadata.height) < 500) throw new Error('Invalid health-photo resolution: ' + file);
    if (healthPaths.has(file)) throw new Error('Duplicate health photograph: ' + file);
    healthPaths.add(file);
  }
}
if (images.filter(file => file.startsWith(healthDirectory + '/')).length !== healthPaths.size) throw new Error('Unmapped health photograph');
const posterFontDirectory = 'supabase/functions/_shared/poster-fonts';
const posterFontSource = readFileSync('supabase/functions/_shared/posterDisplayFonts.ts', 'utf8');
const posterFontManifest = JSON.parse(readFileSync(join(posterFontDirectory,'manifest.json'),'utf8'));
let posterFontBytes = 0;
for (const font of posterFontManifest) {
  const encoded = posterFontSource.match(new RegExp('"'+font.key+'": "([A-Za-z0-9+/=]+)"'))?.[1];
  if (!encoded) throw new Error('Missing poster font: '+font.key);
  const bytes = Buffer.from(encoded,'base64');
  if (bytes.length !== font.bytes || bytes.length>128*1024 || bytes.readUInt32BE(0)!==0x00010000 || createHash('sha256').update(bytes).digest('hex')!==font.sha256) throw new Error('Invalid poster font: '+font.key);
  const license = readFileSync(join(posterFontDirectory,font.key+'-LICENSE.txt'));
  if (createHash('sha256').update(license).digest('hex')!==font.licenseSha256) throw new Error('Poster font license changed: '+font.key);
  posterFontBytes += bytes.length;
}
if (posterFontManifest.length!==4 || new Set(posterFontManifest.map(font=>font.key)).size!==4 || posterFontBytes>256*1024) throw new Error('Invalid poster font collection');
console.log(`Verified ${images.length} original artwork files.`);
