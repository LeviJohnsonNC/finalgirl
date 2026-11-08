import banner from '@/assets/play/banners/slayer.webp';
import portrait from '@/assets/casting-killers/slayer.webp';
import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob<string>('/src/assets/play/photos/slayer/*.webp', {eager:true, query:'?url', import:'default'});
const root = '/src/assets/play/photos/slayer/';

export function slayerArt(id: string, thumbnail = false): ModuleArt {
  if (id === 'header') return {src:banner, fit:'slice', position:'68% 39%'};
  const src = (thumbnail && photos[`${root}${id}-thumb.webp`]) || photos[`${root}${id}.webp`] || portrait;
  return {src, fit:'slice', position:'50% 49%'};
}
