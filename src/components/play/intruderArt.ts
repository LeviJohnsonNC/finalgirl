import banner from "@/assets/play/banners/intruders.webp";
import type { INTRUDER_ROSTER, INTRUDER_POWERS, INTRUDER_FINALES, INTRUDER_MINORS, INTRUDER_TERRORS } from '@/lib/play/intruders';
import type {ModuleArt} from './ModuleArtwork';

const art=import.meta.glob<string>('../../assets/play/photos/intruders/*.webp',{eager:true,import:'default',query:'?url'});
type PhotoId = 'header' | (typeof INTRUDER_ROSTER | typeof INTRUDER_POWERS | typeof INTRUDER_FINALES | typeof INTRUDER_MINORS | typeof INTRUDER_TERRORS)[number]['id'];
export function intruderArt(id:PhotoId,thumbnail=false):ModuleArt {
  const path='../../assets/play/photos/intruders/';
  return {
    src:id==='header'?banner:(thumbnail&&art[path+id+'-thumb.webp'])||art[path+id+'.webp'],
    fit:'slice',
    position:id==='header'?'50% 29%':'center',
  };
}
