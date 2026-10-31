import header from '@/assets/play/banners/shady-acres.webp';
import type { ModuleArt } from './ModuleArtwork';
const scenes=import.meta.glob<string>('/src/assets/play/photos/shady-acres/**/*.webp',{eager:true,import:'default'});
const naturalFields=new Set(['field-west','field-southwest','field-south','field-north','field-inner-east','field-outer-east']);
export function shadyArt(id:string,thumbnail=false):ModuleArt {
 if(id.endsWith('-field')&&naturalFields.has(id.slice(0,-6)))id=id.slice(0,-6)+'-base';
 const src=scenes[`/src/assets/play/photos/shady-acres/${thumbnail?'thumbs/':''}${id}.webp`];
 if(id==='header')return {src:header,fit:'slice',position:'50% 35%'};
 if(!src)throw new Error('Missing Shady Acres photograph: '+id);
 return {src,fit:'slice',position:'50% 35%'};
}
