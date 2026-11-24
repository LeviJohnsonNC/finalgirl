import banner from '../../assets/casting-killers/razorface.webp';
import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob<string>('../../assets/play/photos/razorface/*.webp', {
  eager: true, query: '?url', import: 'default',
});

export function razorfaceArt(id: string, thumb = false): ModuleArt {
  return {src: (thumb ? photos[`../../assets/play/photos/razorface/${id}-thumb.webp`] : undefined) ??
    photos[`../../assets/play/photos/razorface/${id}.webp`] ?? banner, fit:'slice', position:id === 'banner' ? '68% center' : 'center'};
}
