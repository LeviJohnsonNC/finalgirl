// Optimize reviewed independent sources; no repainting, stretching or contact-sheet crops.
// Usage: node scripts/import-grimlash-art.mjs /absolute/generated_images
import {readFileSync,writeFileSync,mkdirSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const folder='src/assets/play/photos/grimlash',manifestPath=join(folder,'manifest.json');
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const upperFocal=new Set(["flaming-eyes", "burning-sickle", "rite-of-the-corrupted", "rite-of-the-old-one", "fields-of-madness", "hunger-of-the-old-gods", "ancient-abomination", "withered-harbinger", "god-of-blood-and-grain", "consumes-all", "death-followed", "bleed-upon-the-earth", "bad-moon", "scarecrow"]);
const sourceDirectory=process.argv[2];if(!sourceDirectory)throw Error('Supply the reviewed generated source directory');
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const entry of manifest){
 // Supplied backgrounds and approved likeness edits have dedicated import workflows.
 if(['user-supplied','approved-reference','approved-reference-edit','card-concept-edit'].includes(entry.sourceKind))continue;
 const source=join(sourceDirectory,entry.source),native=execFileSync('magick',['identify','-format','%w %h',source],{encoding:'utf8'}).split(' ').map(Number);
 entry.nativeWidth=native[0];entry.nativeHeight=native[1];entry.sourceSha256=hash(readFileSync(source));
 const targets=entry.id==='identity'?[['identity','src/assets/characters/ai/grimlash.png',768,768],['portrait','src/assets/collection-portraits/ai/grimlash.webp',256,256]]:entry.id==='header'?[['scene','src/assets/play/banners/grimlash.webp',1280,720]]:[['scene',join(folder,entry.id+'.webp'),1280,720],...(!entry.id.startsWith('madness-')?[['thumbnail',join(folder,'thumbs',entry.id+'.webp'),320,180]]:[])];
 for(const[kind,path,width,height]of targets){
  mkdirSync(path.slice(0,path.lastIndexOf('/')),{recursive:true});const budget=(kind==='thumbnail'?35:kind==='identity'?1500:kind==='portrait'?30:160)*1024;let bytes,quality;
  for(quality of(kind==='identity'?[85]:kind==='thumbnail'?[80,75,70]:[85,82,78,74,70])){execFileSync('magick',[source,'-auto-orient','-resize',`${width}x${height}^`,'-gravity','center','-extent',`${width}x${height}`,'-strip','-quality',String(quality),path]);bytes=readFileSync(path);if(bytes.length<=budget)break;}
  if(bytes.length>budget)throw Error('Photo exceeds budget: '+path);entry[kind]={path,width,height,quality,bytes:statSync(path).size,sha256:hash(bytes)};
 }
 entry.position=entry.id==='header'||entry.id.startsWith('madness-')?'75% 5%':upperFocal.has(entry.id)?'50% 5%':'50% center';entry.crop='Center to native 16:9; no stretch or upscaling. Identity square; Collection 256px.';
}
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');console.log('Optimized generated sources; preserved user-supplied overrides');
