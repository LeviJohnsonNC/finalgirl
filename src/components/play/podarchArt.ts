import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob<string>('../../assets/play/photos/podarchs/*.webp', { eager: true, query: '?url', import: 'default' });
export function podarchArt(id: string, thumbnail = false): ModuleArt {
  const base = '../../assets/play/photos/podarchs/' + id;
  return { src: (thumbnail && photos[base + '-thumb.webp']) || photos[base + '.webp'], fit:'slice', position:id === 'assimilation' ? '50% 12%' : '50% 43%' };
}
