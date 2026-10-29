import header from '@/assets/play/banners/konrad.webp';
import armed from '@/assets/play/konrad/airlock-armed.webp';
import type {ModuleArt} from './ModuleArtwork';
/** Preflight-only map. Remaining owner photographs must be mapped before handoff. */
export const konradArt = (id:string):ModuleArt => ({src:id==='header'?header:armed,fit:'slice',position:'50% center'});
