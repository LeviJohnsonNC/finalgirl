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

// USS Konrad uses independent native landscapes, never enlarged contact-sheet cells.
const konradDirectory='src/assets/play/photos/konrad';
const konradPhotos=JSON.parse(readFileSync(join(konradDirectory,'manifest.json'),'utf8'));
const konradAliases=JSON.parse(readFileSync(join(konradDirectory,'aliases.json'),'utf8'));
const konradExpected=['header',...['upper-left','upper-right','lower-left','lower-right'].flatMap(s=>['inactive','active'].map(v=>`shaft-${s}-${v}`)),'crusher-inactive','crusher-active','incinerator-inactive','incinerator-active','airlock-inactive','airlock-armed','airlock-released','self-destruct-inactive','self-destruct-start','self-destruct-middle','self-destruct-explosion','captain','jonas','orphan','faulty-wiring','good-cookin','cramped-pods','cluttered-shafts','emergency-override','slippery','loader-parked','loader-powered','loader-equipped','loader-lost','beacon','breach',...['captain','jonas','orphan'].flatMap(id=>['saved','killed'].map(state=>`${id}-${state}`))];
function konradWebpDimensions(bytes){
 for(let offset=12;offset+8<=bytes.length;){
  const kind=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4),start=offset+8;
  if(kind==='VP8X')return [bytes.readUIntLE(start+4,3)+1,bytes.readUIntLE(start+7,3)+1];
  if(kind==='VP8 ')return [bytes.readUInt16LE(start+6)&0x3fff,bytes.readUInt16LE(start+8)&0x3fff];
  if(kind==='VP8L'){const bits=bytes.readUInt32LE(start+1);return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1];}
  offset=start+size+(size%2);
 }
 throw new Error('Missing WebP dimensions');
}
if(konradPhotos.length!==konradExpected.length||new Set(konradPhotos.map(p=>p.id)).size!==konradExpected.length||konradExpected.some(id=>!konradPhotos.some(p=>p.id===id)))throw new Error('Incomplete USS Konrad photograph manifest');
const konradFiles=new Set(),konradSources=new Set();
for(const p of konradPhotos){
 const b=readFileSync(p.file),[width,height]=konradWebpDimensions(b);
 if(p.width!==width||p.height!==height||p.nativeWidth<1536||p.nativeHeight<864||width>p.nativeWidth||height>p.nativeHeight||width<1074||height<600||b.length>160*1024||p.bytes!==b.length||p.sha256!==createHash('sha256').update(b).digest('hex'))throw new Error('Invalid USS Konrad landscape: '+p.id);
 if(!/^exec-[a-f0-9-]+\.png$/.test(p.source)||konradSources.has(p.source)||konradFiles.has(p.file))throw new Error('Non-independent USS Konrad photograph: '+p.id);
 konradSources.add(p.source);konradFiles.add(p.file);
}
if(Object.keys(konradAliases).length!==9||Object.entries(konradAliases).some(([id,target])=>konradExpected.includes(id)||!konradExpected.includes(target)))throw new Error('Invalid USS Konrad aliases');
if(images.filter(p=>p.startsWith(konradDirectory+'/')).length!==40)throw new Error('Unmapped USS Konrad runtime image');
console.log('Verified 41 independent USS Konrad photographs and 9 explicit neutral aliases.');

/** Evomorph has twelve independent landscapes, never a shared portrait fallback. */
const evomorphDirectory='src/assets/play/photos/evomorph';
const evomorphManifest=JSON.parse(readFileSync(join(evomorphDirectory,'manifest.json'),'utf8'));
const evomorphExpected=['hatchling','youngling','sideswipe','shadow-dread','dead-silence','symbiotic-camouflage','acid-blood','razor-claws','razor-tail','perfect-organism','blitz-of-death','death-in-the-dark'];
const evomorphHashes=new Set(), evomorphSources=new Set();
if(evomorphManifest.length!==evomorphExpected.length)throw new Error('Incomplete Evomorph photography');
for(const id of evomorphExpected){
 const photo=evomorphManifest.find(p=>p.id===id);
 if(!photo||photo.file!==id+'.webp'||!/^exec-[a-f0-9-]+\.png$/.test(photo.source))throw new Error('Missing Evomorph source: '+id);
 const bytes=readFileSync(join(evomorphDirectory,photo.file)),hash=createHash('sha256').update(bytes).digest('hex');
 if(bytes.length!==photo.bytes||bytes.length>160*1024||hash!==photo.sha256||photo.width!==1280||photo.height!==720||photo.sourceWidth<photo.width||photo.sourceHeight<photo.height)throw new Error('Invalid Evomorph photograph: '+id);
 if(evomorphHashes.has(hash)||evomorphSources.has(photo.source))throw new Error('Reused Evomorph photograph: '+id);
 evomorphHashes.add(hash);evomorphSources.add(photo.source);
}
if(images.filter(file=>file.startsWith(evomorphDirectory+'/')).length!==evomorphExpected.length)throw new Error('Unmapped Evomorph photograph');
