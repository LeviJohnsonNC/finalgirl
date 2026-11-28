import header from '@/assets/play/banners/pesadilla-verde.webp';
import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob<string>('../../assets/play/photos/pesadilla/*.webp', {
  eager: true, import: 'default',
});
export function pesadillaArt(name: string): ModuleArt {
  if (name === 'header') return { src: header, position: '50% 53%' };
  return { src: photos[`../../assets/play/photos/pesadilla/${name}.webp`] ?? header, position: name.startsWith('patrol') ? '50% 22%' : '50% 48%' };
}
