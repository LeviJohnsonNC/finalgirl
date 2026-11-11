import banner from '@/assets/play/banners/organism.webp';
import type { ModuleArt } from './ModuleArtwork';

const position:Record<string,string> = {
  five:'50% 56%',
  absorbed:'50% 48%',
  'destroying-tests':'50% 68%',
  survive:'50% 48%',
  vulnerable:'50% 47%',
};
const photos = import.meta.glob('/src/assets/play/photos/organism/*.webp', {eager:true,import:'default',query:'?url'}) as Record<string,string>;

export function organismArt(id:string,thumbnail=false):ModuleArt {
  const file = (name:string) => photos[`/src/assets/play/photos/organism/${name}.webp`];
  if(id==='header') return {src:banner,fit:'slice',position:'66% 42%'};
  return {src:(thumbnail?file(id+'-thumb'):undefined)??file(id),fit:'slice',position:position[id]??'50% 37%'};
}
