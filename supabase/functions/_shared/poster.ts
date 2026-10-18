// Rasterize typography BEFORE upload/late attachment. A scrapbook image is a
// complete poster, not artwork that depends on a surviving browser overlay.
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';
import { POSTER_SERIF, POSTER_CONDENSED } from './posterFonts.ts';
import { cleanType } from './prompts.ts';

const decode = (value: string): Uint8Array => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const serif = decode(POSTER_SERIF), condensed = decode(POSTER_CONDENSED);

export interface PosterCopy { title: string; tagline: string }

/** No crop: preserve every pixel if a provider ignores the portrait request. */
export async function composePoster(bytes: Uint8Array, copy: PosterCopy): Promise<Uint8Array> {
  let art: Image;
  if (bytes[0] === 82 && bytes[1] === 73 && bytes[8] === 87 && bytes[9] === 69) {
    const { decodeWebp } = await import('./webp.ts');
    const pixels = await decodeWebp(bytes);
    art = new Image(pixels.width, pixels.height);
    art.bitmap.set(pixels.data);
  } else art = await Image.decode(bytes);
  // Bound both work and output size. The provider image is never a URL fetch.
  const width = 1000, height = 1500;
  const image = new Image(width, height).fill(0x09090aff);
  const scale = Math.min(width / art.width, height / art.height);
  art = resample(art, Math.max(1, Math.round(art.width * scale)), Math.max(1, Math.round(art.height * scale)));
  image.composite(art, Math.floor((width - art.width) / 2), Math.floor((height - art.height) / 2));

  // Quiet typography zones with a smooth photographic burn, not opaque boxes.
  for (let y = 0; y < height; y++) {
    const top = Math.max(0, 1 - y / 210) * 0.7;
    const bottom = Math.max(0, (y - 1020) / 480) * 0.94;
    const shade = 1 - Math.max(top, bottom);
    if (shade === 1) continue;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      image.bitmap[i] *= shade; image.bitmap[i + 1] *= shade; image.bitmap[i + 2] *= shade;
    }
  }
  async function fitted(text: string, font: Uint8Array, initial: number, maxWidth: number, color: number) {
    let glyphs = await Image.renderText(font, initial, text, color);
    if (glyphs.width > maxWidth) glyphs = await Image.renderText(font, Math.floor(initial * maxWidth / glyphs.width), text, color);
    return glyphs;
  }
  const tagline = await fitted(cleanType(copy.tagline, 70), condensed, 31, 830, 0xe7dfcbff);
  image.composite(tagline, Math.floor((width - tagline.width) / 2), 88);

  // Prefer two intentional title lines over crushing a long title to tiny type.
  const title = cleanType(copy.title, 32) || 'THE LAST NIGHT';
  const words = title.split(/\s+/);
  let lines = [title];
  if (title.length > 15 && words.length > 1) {
    let split = 1;
    for (let i = 2; i < words.length; i++) {
      if (Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length) <
        Math.abs(words.slice(0, split).join(' ').length - words.slice(split).join(' ').length)) split = i;
    }
    lines = [words.slice(0, split).join(' '), words.slice(split).join(' ')];
  }
  const glyphs = await Promise.all(lines.map(line => fitted(line, serif, lines.length === 1 ? 126 : 103, 880, 0xd84c39ff)));
  let y = 1345 - glyphs.reduce((sum, g) => sum + g.height + 12, 0);
  for (const line of glyphs) {
    // Offset ink shadow gives the warm red lettering weight against busy art.
    const shadow = line.clone();
    for (let i = 0; i < shadow.bitmap.length; i += 4) {
      shadow.bitmap[i] = 0; shadow.bitmap[i + 1] = 0; shadow.bitmap[i + 2] = 0; shadow.bitmap[i + 3] *= 0.6;
    }
    image.composite(shadow, Math.floor((width - line.width) / 2) + 2, y + 3);
    image.composite(line, Math.floor((width - line.width) / 2), y);
    y += line.height + 12;
  }
  // Minimal fictional studio billing, no invented real-person credits.
  for (const [text, y] of [['A DEAD LETTER PICTURES PRODUCTION', 1390], ['AN ORIGINAL NIGHTMARE  •  THE FINAL GIRL ARCHIVE', 1424]] as const) {
    const credit = await fitted(text.replace('•', '-'), condensed, 20, 780, 0xa59e8bff);
    image.composite(credit, Math.floor((width - credit.width) / 2), y);
  }
  return await image.encode(1);
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
