import banner from '@/assets/play/banners/hunter.webp';
import type { ModuleArt } from './ModuleArtwork';
import portrait from '@/assets/characters/ai/the-hunter.png';
import type { HunterState } from '@/lib/play/hunter';
const photos=import.meta.glob<string>('/src/assets/play/photos/hunter/*.webp',{eager:true,query:'?url',import:'default'});
export function hunterArt(id:string,thumbnail=false):ModuleArt {
 if(id==='header')return {src:banner,fit:'slice',position:'79% 0%'};
 if(id==='mark-v-parts-3')id='mark-v';
 const root='/src/assets/play/photos/hunter/';
 return {src:(thumbnail&&photos[`${root}${id}-thumb.webp`])||photos[`${root}${id}.webp`]||portrait,fit:'slice',position:id==='header'?'79% 25%':'50% 35%'};
}
export function hunterModelArt(s:HunterState):ModuleArt {
 return hunterArt(s.phase==='mark-x'?'mark-x':s.phase==='mark-v'?`mark-v-parts-${Math.min(3,s.remaining??3)}`:'mark-v-parts-0');
}
export function hunterPartArt(id:number,installed:boolean):ModuleArt {
 return hunterArt(`part-${((id-1)%4)+1}${installed?'-installed':''}`);
}
