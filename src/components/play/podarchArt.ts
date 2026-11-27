import type { ModuleArt } from './ModuleArtwork';

const photos = import.meta.glob<string>('../../assets/play/photos/podarchs/*.webp', { eager: true, query: '?url', import: 'default' });

const focalPoints: Record<string, string> = {
  assimilation: '50% 12%',
  'assimilation-empty': '50% 42%',
  banner: '50% 55%',
  docile: '50% 18%',
  hostile: '50% 16%',
  urgency: '50% 0%',
  leader: '50% 0%',
};

export function podarchArt(id: string, thumbnail = false): ModuleArt {
  const base = '../../assets/play/photos/podarchs/' + id;
  const thumb = thumbnail && photos[base + '-thumb.webp'];
  return {
    src: thumb || photos[base + '.webp'],
    fit: 'slice',
    position: thumb ? '50% 43%' :
      focalPoints[id] ?? (id.startsWith('assimilation-') ? '55% 13%' : '50% 43%'),
  };
}
