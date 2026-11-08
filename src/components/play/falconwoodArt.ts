import header from '@/assets/play/banners/falconwood.webp';
import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob('../../assets/play/photos/falconwood/*.webp', {eager: true, import: 'default'}) as Record<string, string>;
export function falconwoodArt(id: string, thumbnail = false): ModuleArt {
  const image = photos[`../../assets/play/photos/falconwood/${id}.webp`];
  const thumb = thumbnail && photos[`../../assets/play/photos/falconwood/${id}-thumb.webp`];
  return {src: id === 'header' ? header : thumb || image, fit: 'slice', position: id === 'header' ? '65% 56%' : '50% 42%'};
}
