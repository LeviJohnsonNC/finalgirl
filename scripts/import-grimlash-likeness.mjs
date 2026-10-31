// Rebuild only the audited pumpkin-head replacements from independent originals.
// Usage: node scripts/import-grimlash-likeness.mjs /absolute/sources.json
// sources.json maps each revised stable ID below to its original PNG path.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
const ids=['identity','header','flaming-eyes','burning-sickle','rite-of-the-corrupted','rite-of-the-old-one','fields-of-madness','hunger-of-the-old-gods','ancient-abomination','withered-harbinger','god-of-blood-and-grain','consumes-all','death-followed','bleed-upon-the-earth','bad-moon'];
if(!process.argv[2])throw Error('Supply the audited stable-ID to original-PNG map');
const sources=JSON.parse(readFileSync(process.argv[2],'utf8'));
if(Object.keys(sources).length!==ids.length||ids.some(id=>!sources[id]))throw Error('Exactly the fifteen audited replacement sources are required');
const manifestPath='src/assets/play/photos/grimlash/manifest.json',manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const reference={source:'Flaming Pumpkin Grimlash in Twilight.png',sha256:hash(readFileSync(sources.identity))};
for(const id of ids){
 const entry=manifest.find(e=>e.id===id),source=sources[id];
 const [nativeWidth,nativeHeight]=execFileSync('magick',['identify','-format','%w %h',source],{encoding:'utf8'}).trim().split(' ').map(Number);
 if(nativeWidth<(id==='identity'?768:1280)||nativeHeight<(id==='identity'?768:720))throw Error('Refusing to upscale '+id);
 const targets=id==='identity'?[['identity','src/assets/characters/ai/grimlash.png',768,768,1500],['portrait','src/assets/collection-portraits/ai/grimlash.webp',256,256,30]]:[['scene',id==='header'?'src/assets/play/banners/grimlash.webp':'src/assets/play/photos/grimlash/'+id+'.webp',1280,720,160],...(id==='header'?[]:[['thumbnail','src/assets/play/photos/grimlash/thumbs/'+id+'.webp',320,180,35]])];
 for(const[kind,path,width,height,budget]of targets){
  let bytes,quality;
  for(quality of(kind==='identity'?[85]:kind==='thumbnail'?[80,75,70]:[85,82,78,74,70])){
   execFileSync('magick',[source,'-auto-orient','-resize',`${width}x${height}^`,'-gravity','North','-extent',`${width}x${height}`,'-strip','-quality',String(quality),path]);
   bytes=readFileSync(path);if(bytes.length<=budget*1024)break;
  }
  if(bytes.length>budget*1024)throw Error('Likeness derivative exceeds budget: '+path);
  entry[kind]={path,width,height,quality,bytes:bytes.length,sha256:hash(bytes)};
 }
 if(id==='header')entry.protectedSubject={left:.68,top:.20,right:.77,bottom:.34};
 Object.assign(entry,{source:id==='identity'?reference.source:basename(source),sourceKind:id==='identity'?'approved-reference':'approved-reference-edit',nativeWidth,nativeHeight,sourceSha256:hash(readFileSync(source)),identityReference:reference,position:id==='header'?'75% 20%':'50% 5%',crop:'Top-aligned native crop, no stretch or upscaling. Complete pumpkin face and stem preserved; approved coat and root ribs. Identity uses upper square of the approved full-body photograph.'});
}
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('Imported fifteen reference-matched Grimlash originals and their production derivatives');
