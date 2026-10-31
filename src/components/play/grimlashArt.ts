import identity from '@/assets/characters/ai/grimlash.png';
import type { ModuleArt } from './ModuleArtwork';
const photos=import.meta.glob<{default:string}>('../../assets/play/photos/grimlash/*.webp',{eager:true});
/** Stable IDs, never catalog/display indices. Prototype identity fallback removed at art completion. */
export function grimlashArt(id:string):ModuleArt {return {src:photos[`../../assets/play/photos/grimlash/${id}.webp`]?.default??identity,fit:'slice',position:'65% center'};}
