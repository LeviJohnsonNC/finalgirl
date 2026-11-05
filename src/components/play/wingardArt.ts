import header from '@/assets/play/banners/wingard.webp';
import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob<string>('@/assets/play/photos/wingard/*.webp', { eager:true, import:'default' });
export function wingardArt(id:string, tile = false):ModuleArt {
  const key = `/src/assets/play/photos/wingard/${id}${tile ? '-tile' : ''}.webp`;
  return {src:photos[key] ?? header, fit:id==='slingshot-blueprint'?'meet':'slice', position:id==='header' ? '62% 48%' : 'center'};
}
