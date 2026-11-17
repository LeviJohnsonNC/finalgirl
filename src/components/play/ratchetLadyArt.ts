import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob<string>('../../assets/play/photos/ratchet-lady/*.webp', {
  eager: true, query: '?url', import: 'default',
});

export function ratchetLadyArt(id: string, thumb = false): ModuleArt {
  const prefix = '../../assets/play/photos/ratchet-lady/';
  const src = (thumb ? photos[prefix + id + '-thumb.webp'] : undefined) ??
    photos[prefix + id + '.webp'] ?? photos[prefix + 'banner.webp'];
  return { src, fit: 'slice', position: id === 'banner' ? '68% 22%' : '50% 46%' };
}
