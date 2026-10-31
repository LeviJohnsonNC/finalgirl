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

// Grimlash is a complete source-ID catalog, including all physical Madness positions.
const grimFolder='src/assets/play/photos/grimlash';
const grimManifest=JSON.parse(readFileSync(join(grimFolder,'manifest.json'),'utf8'));
const grimCatalog=readFileSync('supabase/functions/_shared/play/grimlash.ts','utf8');
const grimIds=new Set(['identity','header',...Array.from({length:11},(_,i)=>`madness-${i}`),...[...grimCatalog.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1])]);
if(grimManifest.length!==48||grimIds.size!==48||new Set(grimManifest.map(e=>e.id)).size!==48||grimManifest.some(e=>!grimIds.has(e.id)))throw Error('Incomplete Grimlash source-ID artwork coverage');
if(new Set(grimManifest.map(e=>e.sourceSha256)).size!==48)throw Error('Grimlash requires independent scene sources');
const grimPaths=new Set();
for(const entry of grimManifest){
 if(!/^exec-[a-f0-9-]+\.png$/.test(entry.source)||!/^[a-f0-9]{64}$/.test(entry.sourceSha256))throw Error('Missing Grimlash provenance: '+entry.id);
 const keys=entry.id==='identity'?['identity','portrait']:entry.id==='header'||entry.id.startsWith('madness-')?['scene']:['scene','thumbnail'];
 if(entry.nativeWidth<(entry.id==='identity'?768:1280)||entry.nativeHeight<(entry.id==='identity'?768:720))throw Error('Upscaled Grimlash source: '+entry.id);
 for(const key of keys){const asset=entry[key];if(!asset||grimPaths.has(asset.path))throw Error('Missing/duplicate Grimlash derivative: '+entry.id);const b=readFileSync(asset.path);if(b.length!==asset.bytes||createHash('sha256').update(b).digest('hex')!==asset.sha256)throw Error('Grimlash digest mismatch: '+asset.path);if(key==='thumbnail'&&b.length>35*1024)throw Error('Grimlash thumbnail budget');grimPaths.add(asset.path);}
}
const actualGrim=images.filter(p=>p.startsWith(grimFolder+'/')||p==='src/assets/play/banners/grimlash.webp'||p==='src/assets/characters/ai/grimlash.png'||p==='src/assets/collection-portraits/ai/grimlash.webp');
if(actualGrim.length!==grimPaths.size||actualGrim.some(p=>!grimPaths.has(p)))throw Error('Orphan Grimlash artwork');
console.log('Verified 47 independent Grimlash scenes, identity and 35 card thumbnails.');

// Shady Acres: source IDs are stable across alphabetical UI sorting and state changes.
const shadyFolder='src/assets/play/photos/shady-acres';
const shadyManifest=JSON.parse(readFileSync(shadyFolder+'/manifest.json','utf8'));
const shadyExpected=["header","child-1","child-2","child-3","sacrifice-0","sacrifice-1","sacrifice-2","sacrifice-3","omen-of-plague","decaying-earth","dark-fields","omen-of-death","malevolent-aura","chthonic-possession","omen-of-blood","gnarled-stalks","sally","sally-saved","sally-killed","ralph","ralph-saved","ralph-killed","cultist","cultist-saved","cultist-killed","hungers","festering","shadow","ravens","fields","hatred","lurks","terror-kids","terror-chow","terror-knows","terror-rows","terror-gas","terror-belong","terror-nobody","combine","field-west-base","field-west-harvested","field-southwest-base","field-southwest-harvested","field-south-base","field-south-harvested","field-north-base","field-north-harvested","field-inner-east-base","field-inner-east-harvested","field-outer-east-base","field-outer-east-harvested","hayfield-base","hayfield-field","hayfield-harvested","pasture-base","pasture-field","pasture-harvested"];
const shadyCurses=new Set(['omen-of-plague','decaying-earth','dark-fields','omen-of-death','malevolent-aura','chthonic-possession','omen-of-blood','gnarled-stalks']);
if(shadyManifest.length!==58||new Set(shadyManifest.map(r=>r.id)).size!==58||shadyManifest.some(r=>!shadyExpected.includes(r.id)))throw Error('Incomplete Shady Acres artwork');
if(new Set(shadyManifest.map(r=>r.sourceSha256)).size!==58||new Set(shadyManifest.map(r=>r.source)).size!==58)throw Error('Shady Acres requires 58 independent sources');
const shadyPaths=new Set();
function webpDimensions(b){
 for(let at=12;at+8<=b.length;){const tag=b.toString('ascii',at,at+4),n=b.readUInt32LE(at+4),p=at+8;
  if(tag==='VP8 ')return [b.readUInt16LE(p+6)&16383,b.readUInt16LE(p+8)&16383];
  if(tag==='VP8X')return [1+b.readUIntLE(p+4,3),1+b.readUIntLE(p+7,3)];
  if(tag==='VP8L'){const bits=b.readUInt32LE(p+1);return [(bits&16383)+1,((bits>>>14)&16383)+1];}
  at=p+n+(n%2);
 }throw Error('Missing WebP image payload');
}
for(const r of shadyManifest){
 if(!/^exec-[a-f0-9-]+\.png$/.test(r.source)||!/^[a-f0-9]{64}$/.test(r.sourceSha256)||r.nativeWidth<1280||r.nativeHeight<720)throw Error('Invalid Shady Acres original: '+r.id);
 if(!!r.thumbnail!==shadyCurses.has(r.id))throw Error('Wrong Shady Acres thumbnail mapping: '+r.id);
 for(const kind of ['scene',...(r.thumbnail?['thumbnail']:[])]){
  const a=r[kind],expectedPath=kind==='thumbnail'?shadyFolder+'/thumbs/'+r.id+'.webp':r.id==='header'?'src/assets/play/banners/shady-acres.webp':shadyFolder+'/'+r.id+'.webp';
  if(!a||a.path!==expectedPath||shadyPaths.has(a.path))throw Error('Wrong Shady Acres derivative: '+r.id);
  const b=readFileSync(a.path),size=kind==='thumbnail'?[320,180]:[1280,720];
  if(b.length!==a.bytes||b.length>(kind==='thumbnail'?35:160)*1024||createHash('sha256').update(b).digest('hex')!==a.sha256||String(webpDimensions(b))!==String(size)||a.width!==size[0]||a.height!==size[1])throw Error('Invalid Shady Acres derivative: '+a.path);
  shadyPaths.add(a.path);
 }
}
const actualShady=images.filter(p=>p.startsWith(shadyFolder+'/')||p==='src/assets/play/banners/shady-acres.webp');
if(actualShady.length!==66||actualShady.some(p=>!shadyPaths.has(p)))throw Error('Orphan Shady Acres artwork');
console.log('Verified 58 independent Shady Acres scenes and 8 chooser thumbnails.');
