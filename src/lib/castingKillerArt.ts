import type { CSSProperties } from 'react';
import { CHARACTER_IMAGES_AI } from '@/types/gameData';
import birds from '@/assets/casting-killers/birds.webp';
import geppetto from '@/assets/casting-killers/geppetto.webp';
import grimlash from '@/assets/casting-killers/grimlash.webp';
import mort from '@/assets/casting-killers/mort-the-teenage-dirtbag.webp';
import poltergeist from '@/assets/casting-killers/poltergeist.webp';
import razorface from '@/assets/casting-killers/razorface.webp';
import slayer from '@/assets/casting-killers/slayer.webp';
import eyeless from '@/assets/casting-killers/the-eyeless.webp';
import intruders from '@/assets/casting-killers/the-intruders.webp';
import organism from '@/assets/casting-killers/the-organism.webp';
import zombies from '@/assets/casting-killers/zombies.webp';

const portraitByKiller: Readonly<Record<string, string>> = {
  Birds: birds,
  Geppetto: geppetto,
  Grimlash: grimlash,
  'Mort the Teenage Dirtbag': mort,
  Poltergeist: poltergeist,
  Razorface: razorface,
  Slayer: slayer,
  'The Eyeless': eyeless,
  'The Intruders': intruders,
  'The Organism': organism,
  Zombies: zombies,
};

interface Crop {
  picker: string;
  slot: string;
  dossier: string;
  zoom?: number;
}

const cropByKiller: Readonly<Record<string, Crop>> = {
  'Dr. Fright': { picker: '50% 35%', slot: '50% 35%', dossier: '50% 31%', zoom: 1.11 },
  Evomorph: { picker: '16% 50%', slot: '16% 50%', dossier: '50% 16%' },
  'The Hunter': { picker: '83% 50%', slot: '83% 50%', dossier: '50% 39%' },
  Destiny: { picker: '77% 50%', slot: '77% 50%', dossier: '50% 64%' },
};

/** A casting rendition can replace only the registered photographic source.
 * Real official art and a separately selected image retain their own framing. */
export function castingKillerArt(name: string, source: string, surface: keyof Omit<Crop, 'zoom'>) {
  if (source !== CHARACTER_IMAGES_AI[name]) return { src: source };
  const portrait = portraitByKiller[name];
  if (portrait) {
    const style: CSSProperties = {
      objectPosition: '50% 42%',
      ...(name === 'The Intruders' && surface === 'picker' && { transformOrigin: '75% center' }),
    };
    return { src: portrait, portrait: true, style };
  }
  const crop = cropByKiller[name];
  if (!crop) return { src: source };
  const objectPosition = crop[surface];
  const style: CSSProperties = {
    objectPosition,
    ...(crop.zoom && surface !== 'dossier' && { scale: String(crop.zoom), transformOrigin: objectPosition }),
  };
  return { src: source, style };
}
