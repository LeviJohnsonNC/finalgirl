// Rebuild only from the original standalone generated PNGs, never thumbnails.
// node scripts/shady-acres-photos.mjs /absolute/path/to/shady-art-generated.json
import {readFileSync,writeFileSync,mkdirSync,existsSync,unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {basename,dirname} from 'node:path';
const expected=["header","child-1","child-2","child-3","sacrifice-0","sacrifice-1","sacrifice-2","sacrifice-3","omen-of-plague","decaying-earth","dark-fields","omen-of-death","malevolent-aura","chthonic-possession","omen-of-blood","gnarled-stalks","sally","sally-saved","sally-killed","ralph","ralph-saved","ralph-killed","cultist","cultist-saved","cultist-killed","hungers","festering","shadow","ravens","fields","hatred","lurks","terror-kids","terror-chow","terror-knows","terror-rows","terror-gas","terror-belong","terror-nobody","combine","field-west-base","field-west-harvested","field-southwest-base","field-southwest-harvested","field-south-base","field-south-harvested","field-north-base","field-north-harvested","field-inner-east-base","field-inner-east-harvested","field-outer-east-base","field-outer-east-harvested","hayfield-base","hayfield-field","hayfield-harvested","pasture-base","pasture-field","pasture-harvested"];
const curses=['omen-of-plague','decaying-earth','dark-fields','omen-of-death','malevolent-aura','chthonic-possession','omen-of-blood','gnarled-stalks'];
const records=JSON.parse(readFileSync(process.argv[2],'utf8'));
if(records.length!==expected.length||new Set(records.map(r=>r.id)).size!==expected.length||records.some(r=>!expected.includes(r.id)))throw Error('Expected the complete 58-source Shady Acres generation index');
const folder='src/assets/play/photos/shady-acres';
const sha=b=>createHash('sha256').update(b).digest('hex');
const derivative=(source,path,width,height,budget)=>{
 mkdirSync(dirname(path),{recursive:true});
 let quality=84;
 do {execFileSync('magick',[source,'-resize',width+'x'+height+'^','-gravity','center','-extent',width+'x'+height,'-strip','-quality',String(quality),path]);quality-=4;}while(readFileSync(path).length>budget&&quality>=44);
 const bytes=readFileSync(path);if(bytes.length>budget)throw Error('Artwork budget: '+path);
 return {path,width,height,bytes:bytes.length,sha256:sha(bytes)};
};
const manifest=expected.map(id=>{
 const r=records.find(r=>r.id===id),source=readFileSync(r.path);
 const [nativeWidth,nativeHeight]=execFileSync('magick',['identify','-format','%w %h',r.path],{encoding:'utf8'}).split(' ').map(Number);
 if(nativeWidth<1280||nativeHeight<720)throw Error('Do not upscale '+id);
 const path=id==='header'?'src/assets/play/banners/shady-acres.webp':folder+'/'+id+'.webp';
 return {id,source:basename(r.path),sourceSha256:sha(source),nativeWidth,nativeHeight,prompt:r.prompt,...(r.reference?{reference:r.reference}:{}),scene:derivative(r.path,path,1280,720,160*1024),...(curses.includes(id)?{thumbnail:derivative(r.path,folder+'/thumbs/'+id+'.webp',320,180,35*1024)}:{})};
});
const obsolete=folder+'/header.webp';if(existsSync(obsolete))unlinkSync(obsolete);
writeFileSync(folder+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Imported 58 independent scenes and 8 Curse chooser thumbnails; '+manifest.reduce((n,r)=>n+r.scene.bytes+(r.thumbnail?.bytes??0),0)+' bytes.');
