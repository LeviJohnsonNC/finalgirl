// Import Levi's eleven numbered Harvest Madness originals without repainting.
// Usage: node scripts/import-harvest-madness-art.mjs /absolute/numbered-originals
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join,basename} from 'node:path';
const directory=process.argv[2];if(!directory)throw Error('Supply the numbered original PNG directory');
const manifestPath='src/assets/play/photos/grimlash/manifest.json';
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const sources=new Map();
for(const name of readdirSync(directory)){
 const match=/-(\d+)\.png$/i.exec(name);if(!match)continue;const stage=Number(match[1]);if(stage<0||stage>10)continue;
 if(sources.has(stage))throw Error('Duplicate Madness source '+stage);sources.set(stage,join(directory,name));
}
if(sources.size!==11)throw Error('Exactly one original for each position 0–10 is required');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(let stage=0;stage<=10;stage++){
 const source=sources.get(stage),entry=manifest.find(e=>e.id==='madness-'+stage);
 const native=execFileSync('magick',['identify','-format','%w %h',source],{encoding:'utf8'}).trim().split(' ').map(Number);
 if(native[0]<1280||native[1]<720)throw Error('Refusing to upscale '+source);
 const path='src/assets/play/photos/grimlash/madness-'+stage+'.webp';let bytes,quality;
 for(quality of [85,82,78,74,70]){execFileSync('magick',[source,'-auto-orient','-resize','1280x720^','-gravity','North','-extent','1280x720','-strip','-quality',String(quality),path]);bytes=readFileSync(path);if(bytes.length<=160*1024)break;}
 if(bytes.length>160*1024)throw Error('Madness image exceeds budget: '+path);
 Object.assign(entry,{source:basename(source),sourceKind:'user-supplied',nativeWidth:native[0],nativeHeight:native[1],sourceSha256:hash(readFileSync(source)),scene:{path,width:1280,height:720,quality,bytes:bytes.length,sha256:hash(bytes)},position:'20% 0%',protectedSubject:{left:.18,top:.02,right:.30,bottom:.23},crop:'Top-aligned native widescreen resize; no stretch or upscaling. Responsive cover anchors left/top; clear artwork space protects the scarecrow head above controls.'});
}
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');console.log('Imported eleven numbered Harvest Madness backgrounds');

