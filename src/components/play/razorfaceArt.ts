import type { AfflictionId } from '../../../supabase/functions/_shared/play/razorface';
import banner from '../../assets/casting-killers/razorface.webp';
import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob<string>('../../assets/play/photos/razorface/*.webp', {
  eager: true, query: '?url', import: 'default',
});

export function razorfaceArt(id: string, thumb = false): ModuleArt {
  return {src: (thumb ? photos[`../../assets/play/photos/razorface/${id}-thumb.webp`] : undefined) ??
    photos[`../../assets/play/photos/razorface/${id}.webp`] ?? banner, fit:'slice', position:id === 'banner' ? '68% center' : 'center'};
}

export function razorfaceAfflictionArt(id: AfflictionId, purged: boolean): ModuleArt {
  if (id === 'experience-unbound') return razorfaceArt(purged ? id : 'experience-unbound-afflicted');
  return razorfaceArt(purged ? `${id}-purged` : id);
}
