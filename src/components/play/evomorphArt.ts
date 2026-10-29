import portrait from '@/assets/characters/ai/evomorph.png';
import type { ModuleArt } from './ModuleArtwork';
const photos=import.meta.glob<string>('/src/assets/play/photos/evomorph/*.webp',{eager:true,query:'?url',import:'default'});

/** Stable card IDs map to independent native photographs before display sorting. */
export function evomorphArt(id:string):ModuleArt {
  if(id==='adult')return {src:portrait,fit:'slice',position:'50% 40%'};
  // Unknown stage and Scan show an environment, never an inferred Adult.
  const photoId=['vanished','unknown','scan'].includes(id)?'dead-silence':id;
  const src=photos[`/src/assets/play/photos/evomorph/${photoId}.webp`];
  if(!src)throw new Error(`Missing Evomorph photograph: ${id}`);
  return {src,fit:'slice',position:id==='hatchling'?'50% 65%':id==='youngling'?'50% 42%':'50% center'};
}
export function evomorphStageArt(stage:unknown):ModuleArt {
  return evomorphArt(stage==='hatchling'||stage==='youngling'||stage==='adult'?stage:'unknown');
}
