import header from '@/assets/play/banners/grimlash.webp';
import type { ModuleArt } from './ModuleArtwork';
const photos=import.meta.glob<{default:string}>('../../assets/play/photos/grimlash/**/*.webp',{eager:true});
const upperFocal=new Set(["flaming-eyes", "burning-sickle", "rite-of-the-corrupted", "rite-of-the-old-one", "fields-of-madness", "hunger-of-the-old-gods", "ancient-abomination", "withered-harbinger", "god-of-blood-and-grain", "consumes-all", "death-followed", "bleed-upon-the-earth", "bad-moon", "scarecrow"]);
/** Stable source IDs survive alphabetical display sorting. Known cards never borrow another owner's art. */
export function grimlashArt(id:string,thumbnail=false):ModuleArt {
 if(id==='header')return {src:header,fit:'slice',position:'75% 5%'};
 const src=photos[`../../assets/play/photos/grimlash/${thumbnail?'thumbs/':''}${id}.webp`]?.default;
 if(!src)throw new Error(`Missing reviewed Grimlash photograph: ${id}${thumbnail?' thumbnail':''}`);
 return {src,fit:'slice',position:id.startsWith('madness-')?'75% 5%':upperFocal.has(id)?'50% 5%':'50% center'};
}
