import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';
import { composePoster } from './poster.ts';
import { posterLayouts, POSTER_FACES, POSTER_LAYOUTS, type PosterDesign } from './posterDesign.ts';

Deno.test('complete poster is a bounded PNG with preserved central artwork and baked lettering', async () => {
  const input = new Image(200, 300).fill(0x486882ff);
  const encoded = await input.encode();
  const a = await composePoster(encoded, { title: 'THE LAST BIRTHDAY', tagline: 'NOBODY GETS TO GO HOME.' });
  const b = await composePoster(encoded, { title: 'BUDDYLAND', tagline: 'A SECOND TEST OF THE LETTERING.' });
  assertEquals([...a.slice(0,8)], [137,80,78,71,13,10,26,10]);
  const poster = await Image.decode(a), alternate = await Image.decode(b);
  assertEquals([poster.width,poster.height],[1000,1500]);
  assertEquals([...poster.bitmap.slice((700*1000+500)*4,(700*1000+500)*4+4)],[72,104,130,255]);
  assert(poster.bitmap.some((v: number,i: number)=>v!==alternate.bitmap[i]));
});
Deno.test('JPEG art can be filed as a complete PNG poster; corrupt art fails before storage', async () => {
  const input = new Image(200,300).fill(0x486882ff);
  const bytes = await composePoster(await input.encodeJPEG(90), {title:'THE LAST NIGHT',tagline:'AN EMPTY ROOM REMEMBERS.'});
  assertEquals([...bytes.slice(0,4)],[137,80,78,71]);
  let failed=false;
  try { await composePoster(new Uint8Array([1,2,3]),{title:'TEST',tagline:'TEST'}); } catch {failed=true;}
  assert(failed);
});

Deno.test('WebP gateway output also becomes a complete PNG poster', async () => {
  const bytes=Uint8Array.from(atob('UklGRjIAAABXRUJQVlA4ICYAAACQAQCdASoCAAMAAUAmJQBOl0AAhgAA/u7T38UApHDnfm+x7TAAAA=='),c=>c.charCodeAt(0));
  const poster=await composePoster(bytes,{title:'THE LAST NIGHT',tagline:'AN EMPTY ROOM REMEMBERS.'});
  assertEquals([...poster.slice(0,4)],[137,80,78,71]);
});

Deno.test('every display face renders complete punctuation and all layouts preserve the central painting', async()=>{
 const input=new Image(200,300).fill(0x486882ff), bytes=await input.encode();
 const fingerprints=new Set<string>();
 for(let i=0;i<POSTER_FACES.length;i++) {
  const design:PosterDesign={layout:POSTER_LAYOUTS[i%4],face:POSTER_FACES[i],palette:i%2?'electric':'bone'};
  const result=await composePoster(bytes,{title:i===4?'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW':"NIGHT'S END - PART 2",tagline:"DON'T LOOK BACK. WHO'S STILL THERE?"},design,{finalGirl:'Alice',killer:'Poltergeist',location:'Creech Manor'});
  const image=await Image.decode(result);
  assertEquals([image.width,image.height],[1000,1500]);
  const pixel=(700*1000+500)*4;
  assertEquals([...image.bitmap.slice(pixel,pixel+4)],[72,104,130,255]);
  fingerprints.add([...new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(result).buffer))].join(','));
  for(const y of [500,650,800]) for(const x of [100,300,700,900]) assertEquals(image.getPixelAt(x+1,y+1),0x486882ff);
 }
 assertEquals(fingerprints.size,5);
});
Deno.test('print ink stays in its reserved boxes; paper treatment and wrong-ratio art never crop or stretch the source',async()=>{
 const source=new Image(300,180).fill(0x486882ff);
 // Distinct source edge bars must survive the contain fit, including landscape input.
 for(let y=1;y<=180;y++){source.setPixelAt(1,y,0xff0000ff);source.setPixelAt(300,y,0x00ff00ff);}
 const bytes=await source.encode();
 for(const layout of POSTER_LAYOUTS) {
  const image=await Image.decode(await composePoster(bytes,{title:'THE HOUSE AT MIDNIGHT',tagline:'A VERY LONG TAGLINE STILL HAS TO FIT ITS RESERVED SPACE CORRECTLY.'},{layout,face:'slash',palette:'ochre'}));
  const frame=posterLayouts[layout].art, scale=Math.min(frame.width/300,frame.height/180);
  const top=frame.y+Math.floor((frame.height-Math.round(180*scale))/2), y=top+Math.round(90*scale);
  assert(image.getPixelAt(frame.x+1,y+1)!==0x486882ff);
  assert(image.getPixelAt(frame.x+frame.width,y+1)!==0x486882ff);
  if(layout==='marquee'||layout==='inset') assert(image.getPixelAt(1,1)!==0x09090aff);
  // The center remains exactly the source color after fitting, never flattened or distorted.
  assertEquals(image.getPixelAt(501,y+1),0x486882ff);
 }
});
