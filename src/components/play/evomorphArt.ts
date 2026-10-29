import portrait from '@/assets/characters/ai/evomorph.png';
import type { ModuleArt } from './ModuleArtwork';
const photos=import.meta.glob<string>('/src/assets/play/photos/evomorph/*.webp',{eager:true,query:'?url',import:'default'});
/** Stable entity IDs precede display sorting. Development reference is removed at release. */
export function evomorphArt(id:string):ModuleArt {
  return {src:photos[`/src/assets/play/photos/evomorph/${id}.webp`]??portrait,fit:'slice',position:'65% center'};
}
