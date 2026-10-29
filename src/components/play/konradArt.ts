import armed from '@/assets/play/konrad/airlock-armed.webp';
import type {ModuleArt} from './ModuleArtwork';
/** Preflight-only map. Remaining owner photographs must be mapped before handoff. */
export const konradArt = (id:string):ModuleArt => ({src:armed,fit:'slice',position:id==='header'?'center 45%':'center'});
