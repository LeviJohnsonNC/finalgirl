import header from '@/assets/play/banners/sunnydaze.webp';
import type {ModuleArt} from './ModuleArtwork';
const photos=import.meta.glob<string>('/src/assets/play/photos/sunnydaze/*.webp',{eager:true,query:'?url',import:'default'});
export function mallArt(id:string):ModuleArt{if(id==='header')return {src:header,fit:'slice',position:'70% 50%'};const src=photos[`/src/assets/play/photos/sunnydaze/${id}.webp`];if(!src)throw new Error(`Missing Mall photograph: ${id}`);return {src,fit:'slice',position:id.startsWith('savior-trust-')?'50% 20%':id==='savior'?'65% 15%':id==='savior-exited'?'65% 12%':id.endsWith('-killed')?'80% 40%':id.startsWith('savior')||id.startsWith('bart')||id.startsWith('girl')?'65% 30%':'50% 45%'};}
