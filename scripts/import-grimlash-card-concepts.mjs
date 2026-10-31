// Rebuild nine independently directed card photographs; preserve the identity and other scenes.
// Usage: node scripts/import-grimlash-card-concepts.mjs /absolute/stable-id-to-original-png.json
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
const concepts={
 'flaming-eyes':['50% 50%','Oblique extreme close-up of burning carved eyes behind cracked window glass.'],
 'burning-sickle':['50% 50%','The complete curved flaming harvest blade and root-claw grip are the foreground subject.'],
 'rite-of-the-corrupted':['50% 65%','Roots creep around an adult wrist and spoiled corn in an ordinary kitchen.'],
 'rite-of-the-old-one':['50% 30%','Low-angle ancient oak offering; Grimlash performs the rite in side/back view.'],
 'fields-of-madness':['50% 50%','A disorienting corn corridor and conflicting shadows; no killer portrait.'],
 'hunger-of-the-old-gods':['50% 10%','A ravenous side-profile creature bends into spilling grain; claws and grain dominate.'],
 'ancient-abomination':['50% 15%','An inhuman low crawling silhouette and root claws force through ancient stonework.'],
 'withered-harbinger':['50% 0%','Rear view in motion leaving a trail of withered stalks.'],
 'god-of-blood-and-grain':['50% 55%','An elongated root claw pours golden grain and a small dark crimson harvest tribute.'],
};
if(!process.argv[2])throw Error('Supply the nine stable-ID to source-PNG paths');
const sources=JSON.parse(readFileSync(process.argv[2],'utf8'));
if(Object.keys(sources).length!==Object.keys(concepts).length||Object.keys(concepts).some(id=>!sources[id]))throw Error('Exactly nine directed card originals are required');
const manifestPath='src/assets/play/photos/grimlash/manifest.json',manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const reference=manifest.find(e=>e.id==='identity').identityReference;
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const[id,[position,concept]]of Object.entries(concepts)){
 const entry=manifest.find(e=>e.id===id),source=sources[id];
 const [nativeWidth,nativeHeight]=execFileSync('magick',['identify','-format','%w %h',source],{encoding:'utf8'}).trim().split(' ').map(Number);
 if(nativeWidth<1280||nativeHeight<720)throw Error('Refusing to upscale '+id);
 for(const[kind,width,height,budget]of [['scene',1280,720,160],['thumbnail',320,180,35]]){
  const path='src/assets/play/photos/grimlash/'+(kind==='thumbnail'?'thumbs/':'')+id+'.webp';let bytes,quality;
  for(quality of(kind==='thumbnail'?[80,75,70]:[85,82,78,74,70])){
   execFileSync('magick',[source,'-auto-orient','-resize',`${width}x${height}^`,'-gravity','center','-extent',`${width}x${height}`,'-strip','-quality',String(quality),path]);
   bytes=readFileSync(path);if(bytes.length<=budget*1024)break;
  }
  if(bytes.length>budget*1024)throw Error('Card concept image exceeds budget: '+path);
  entry[kind]={path,width,height,quality,bytes:bytes.length,sha256:hash(bytes)};
 }
 Object.assign(entry,{source:basename(source),sourceKind:'card-concept-edit',sourceSha256:hash(readFileSync(source)),nativeWidth,nativeHeight,identityReference:reference,position,concept,crop:'Native widescreen crop, no stretch or upscaling. Card-specific focal point protects the principal prop/action in wide heroes and small choices.'});
}
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('Imported nine independent card concepts and their chooser thumbnails');
