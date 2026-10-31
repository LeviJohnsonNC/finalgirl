import header from '@/assets/play/banners/grimlash.webp';
import type { ModuleArt } from './ModuleArtwork';
const photos=import.meta.glob<{default:string}>('../../assets/play/photos/grimlash/**/*.webp',{eager:true});
const upperFocal=new Set(["flaming-eyes", "burning-sickle", "rite-of-the-corrupted", "rite-of-the-old-one", "fields-of-madness", "hunger-of-the-old-gods", "ancient-abomination", "withered-harbinger", "god-of-blood-and-grain", "consumes-all", "death-followed", "bleed-upon-the-earth", "bad-moon", "scarecrow"]);
const conceptFocal:Record<string,string>={'flaming-eyes':'50% 50%','burning-sickle':'50% 50%','rite-of-the-corrupted':'50% 65%','rite-of-the-old-one':'50% 30%','fields-of-madness':'50% 50%','hunger-of-the-old-gods':'50% 10%','ancient-abomination':'50% 15%','withered-harbinger':'50% 0%','god-of-blood-and-grain':'50% 55%'};
/** Stable source IDs survive alphabetical display sorting. Known cards never borrow another owner's art. */
export function grimlashArt(id:string,thumbnail=false):ModuleArt {
 if(id==='header')return {src:header,fit:'slice',position:'75% 20%'};
 const src=photos[`../../assets/play/photos/grimlash/${thumbnail?'thumbs/':''}${id}.webp`]?.default;
 if(!src)throw new Error(`Missing reviewed Grimlash photograph: ${id}${thumbnail?' thumbnail':''}`);
 return {src,fit:'slice',position:id.startsWith('madness-')?'20% 0%':conceptFocal[id]??(upperFocal.has(id)?'50% 5%':'50% center')};
}
