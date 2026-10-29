// Rasterize typography BEFORE upload/late attachment. A scrapbook image is a
// complete poster, not artwork that depends on a surviving browser overlay.
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';
import { POSTER_SERIF, POSTER_CONDENSED } from './posterFonts.ts';
import { cleanType } from './prompts.ts';
import { POSTER_DISPLAY_FONTS } from './posterDisplayFonts.ts';
import { fallbackPosterDesign, parsePosterDesign, posterLayouts, posterPalettes, type PosterCopy, type PosterCast, type PosterDesign, type PrintBox } from './posterDesign.ts';
export type { PosterCopy } from './posterDesign.ts';

const decode = (value: string): Uint8Array => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const serif = decode(POSTER_SERIF), condensed = decode(POSTER_CONDENSED);

const displayFonts = Object.fromEntries(Object.entries(POSTER_DISPLAY_FONTS).map(([key, value]) => [key, decode(value)]));
const fontFor = (face: PosterDesign['face']) => face === 'serif' ? serif : displayFonts[face];

/** No crop: preserve every pixel if a provider ignores the portrait request. */
export async function composePoster(bytes: Uint8Array, copy: PosterCopy, proposed?: PosterDesign, cast: PosterCast = {}): Promise<Uint8Array> {
  let art: Image;
  if (bytes[0] === 82 && bytes[1] === 73 && bytes[8] === 87 && bytes[9] === 69) {
    const { decodeWebp } = await import('./webp.ts');
    const pixels = await decodeWebp(bytes);
    art = new Image(pixels.width, pixels.height);
    art.bitmap.set(pixels.data);
  } else art = await Image.decode(bytes);
  const design = parsePosterDesign(proposed) ?? fallbackPosterDesign(copy.title + '|' + copy.tagline);
  const layout = posterLayouts[design.layout], colors = posterPalettes[design.palette];
  const image = new Image(1000, 1500).fill(layout.paper ? colors.paper : 0x09090aff);
  const frame = layout.art;
  image.composite(new Image(frame.width, frame.height).fill(0x09090aff), frame.x, frame.y);
  const scale = Math.min(frame.width / art.width, frame.height / art.height);
  art = resample(art, Math.max(1, Math.round(art.width * scale)), Math.max(1, Math.round(art.height * scale)));
  image.composite(art, frame.x + Math.floor((frame.width-art.width)/2), frame.y + Math.floor((frame.height-art.height)/2));

  // Burn only the chosen print zones. Never darken the same top/bottom areas on every layout.
  shadeZone(image, layout.title, frame, .68, 90);
  shadeZone(image, layout.tagline, frame, .5, 45);
  if (design.layout !== 'marquee') shadeZone(image, layout.credits, frame, .8, 45);
  const title = cleanType(copy.title,32) || 'THE LAST NIGHT';
  await drawType(image, title, fontFor(design.face), layout.title, colors.ink, layout.align, true, colors.edge);
  await drawType(image, cleanType(copy.tagline,70) || 'AN ORIGINAL NIGHTMARE', condensed, layout.tagline, 0xf3e8caff, layout.align);
  const credits = posterBilling(cast, design.layout);
  const creditColor = design.layout === 'marquee' ? 0x25221eff : 0xe3d9c5ff;
  const rowHeight = Math.floor(layout.credits.height / credits.length);
  for (let i=0;i<credits.length;i++) {
    await drawType(image, credits[i], condensed, { ...layout.credits, y:layout.credits.y+i*rowHeight, height:rowHeight }, creditColor, layout.align);
  }
  // A fine printed keyline belongs to the inset paper treatment, never the scene itself.
  if (design.layout === 'inset') {
    const keyline = 0x695b45ff;
    for (const y of [17,1481]) for(let x=17;x<983;x++) image.setPixelAt(x+1,y+1,keyline);
    for (const x of [17,982]) for(let y=17;y<1482;y++) image.setPixelAt(x+1,y+1,keyline);
  }
  return await image.encode(1);
}

/** Cast labels are selected characters; crew are the archive's fictional studio credits. */
export function posterBilling(cast: PosterCast, layout: PosterDesign['layout'] = 'basement'): string[] {
  const girl = cleanType(cast.finalGirl || 'THE FINAL GIRL',40), killer = cleanType(cast.killer || 'THE THREAT',40);
  const location = cleanType(cast.location || 'DEAD LETTER',40);
  if(layout==='crown') return [
    `STARRING ${girl} AND ${killer}`,
    'MUSIC BY ELLIS CRANE - PRODUCED BY MARA VOSS - DIRECTED BY R.J. CRAVEN',
    `A ${location} PICTURES RELEASE`,
  ];
  if(layout==='marquee') return [
    `STARRING ${girl} - ${killer}`,
    'MARA VOSS PRESENTS - MUSIC BY ELLIS CRANE - DIRECTED BY R.J. CRAVEN',
    `A ${location} PRODUCTION`,
  ];
  return [
    `STARRING ${girl} AND ${killer}`,
    'MUSIC BY ELLIS CRANE - EDITED BY VANCE LUNDY',
    'PRODUCED BY MARA VOSS - DIRECTED BY R.J. CRAVEN',
    `A ${location} PICTURES RELEASE`,
  ];
}

function shadeZone(image: Image, zone: PrintBox, frame: PrintBox, strength: number, fade: number) {
  const top=Math.max(frame.y,zone.y-fade), bottom=Math.min(frame.y+frame.height,zone.y+zone.height+fade);
  for(let y=top;y<bottom;y++) {
    const distance=y<zone.y ? zone.y-y : y>zone.y+zone.height ? y-zone.y-zone.height : 0;
    const shade=1-strength*(1-distance/fade);
    for(let x=frame.x;x<frame.x+frame.width;x++) {
      const i=(y*image.width+x)*4;
      image.bitmap[i]*=shade;image.bitmap[i+1]*=shade;image.bitmap[i+2]*=shade;
    }
  }
}
function splitType(text: string, threshold: number): string[] {
  const words=text.split(/\s+/);
  if(text.length<=threshold || words.length<2) return [text];
  let split=1;
  for(let i=2;i<words.length;i++) if(Math.abs(words.slice(0,i).join(' ').length-words.slice(i).join(' ').length)<
    Math.abs(words.slice(0,split).join(' ').length-words.slice(split).join(' ').length)) split=i;
  return [words.slice(0,split).join(' '),words.slice(split).join(' ')];
}
async function drawType(image: Image, text: string, font: Uint8Array, area: PrintBox, color: number, align: 'left'|'center', title=false, edge=0) {
  const lines=splitType(text,title?15:area.height>45?48:200), padding=title?16:2, gap=title?8:3;
  let size=title?195:area.height>45?33:24;
  let glyphs: Image[]=[];
  for(let pass=0;pass<6;pass++) {
    glyphs=await Promise.all(lines.map(async line=>tightInk(await Image.renderText(font,size,line,color))));
    const width=Math.max(...glyphs.map(g=>g.width))+padding*2;
    const height=glyphs.reduce((sum,g)=>sum+g.height,0)+gap*(lines.length-1)+padding*2;
    const factor=Math.min((area.width-2)/width,(area.height-2)/height,1);
    if(factor>=.99) break;
    size=Math.max(1,Math.floor(size*factor));
  }
  const height=glyphs.reduce((sum,g)=>sum+g.height,0)+gap*(lines.length-1);
  let y=area.y+Math.floor((area.height-height)/2);
  for(const glyph of glyphs) {
    const x=align==='left'?area.x+padding:area.x+Math.floor((area.width-glyph.width)/2);
    if(title) {
      const outline=recolor(glyph,edge);
      // Tight offset print edging retains ragged brush/knife shapes at thumbnail size.
      for(const [dx,dy] of [[-3,0],[3,0],[0,-3],[0,3],[3,3],[5,5]]) image.composite(outline,x+dx,y+dy);
      const shadow=recolor(glyph,0x050508cc);
      image.composite(shadow,x+7,y+8);
    } else if(area.y<1330) image.composite(recolor(glyph,0x000000cc),x+1,y+2);
    image.composite(glyph,x,y);
    y+=glyph.height+gap;
  }
}
/** Fit actual printed ink, not a font's sometimes enormous ascender/descender space. */
function tightInk(source: Image): Image {
  let left=source.width,top=source.height,right=-1,bottom=-1;
  for(let y=0;y<source.height;y++) for(let x=0;x<source.width;x++) {
    if(source.bitmap[(y*source.width+x)*4+3]===0) continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left) return source;
  const image=new Image(right-left+1,bottom-top+1);
  for(let y=0;y<image.height;y++) image.bitmap.set(source.bitmap.subarray(((y+top)*source.width+left)*4,((y+top)*source.width+right+1)*4),y*image.width*4);
  return image;
}
function recolor(source: Image, color: number): Image {
  const image=source.clone(), r=color>>>24,g=(color>>>16)&255,b=(color>>>8)&255,a=color&255;
  for(let i=0;i<image.bitmap.length;i+=4) {
    image.bitmap[i]=r;image.bitmap[i+1]=g;image.bitmap[i+2]=b;image.bitmap[i+3]*=a/255;
  }
  return image;
}

/** Bilinear downsampling avoids the aliased edges of ImageScript's nearest-neighbor resize. */
function resample(source: Image, width: number, height: number): Image {
  if (source.width === width && source.height === height) return source;
  const target = new Image(width, height);
  for (let y = 0; y < height; y++) {
    const sy = Math.max(0, Math.min(source.height - 1, (y + 0.5) * source.height / height - 0.5));
    const y0 = Math.floor(sy), y1 = Math.min(source.height - 1, y0 + 1), fy = sy - y0;
    for (let x = 0; x < width; x++) {
      const sx = Math.max(0, Math.min(source.width - 1, (x + 0.5) * source.width / width - 0.5));
      const x0 = Math.floor(sx), x1 = Math.min(source.width - 1, x0 + 1), fx = sx - x0;
      for (let c = 0; c < 4; c++) {
        const top = source.bitmap[(y0 * source.width + x0) * 4 + c] * (1 - fx) + source.bitmap[(y0 * source.width + x1) * 4 + c] * fx;
        const bottom = source.bitmap[(y1 * source.width + x0) * 4 + c] * (1 - fx) + source.bitmap[(y1 * source.width + x1) * 4 + c] * fx;
        target.bitmap[(y * width + x) * 4 + c] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
  }
  return target;
}
