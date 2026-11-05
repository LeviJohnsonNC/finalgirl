import banner from '@/assets/play/banners/hunter.webp';
import type { ModuleArt } from './ModuleArtwork';
import portrait from '@/assets/characters/ai/the-hunter.png';
const photos=import.meta.glob<string>('/src/assets/play/photos/hunter/*.webp',{eager:true,query:'?url',import:'default'});
export function hunterArt(id:string,thumbnail=false):ModuleArt {
 if(id==='header')return {src:banner,fit:'slice',position:'79% 0%'};
 const root='/src/assets/play/photos/hunter/';
 return {src:(thumbnail&&photos[`${root}${id}-thumb.webp`])||photos[`${root}${id}.webp`]||portrait,fit:'slice',position:id==='header'?'79% 25%':'50% 35%'};
}
