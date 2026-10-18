import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';
import { composePoster } from './poster.ts';

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
