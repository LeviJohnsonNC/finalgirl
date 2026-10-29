import type {ModuleArt} from './ModuleArtwork';
import photo0 from '@/assets/play/photos/konrad/airlock-armed.webp';
import photo1 from '@/assets/play/banners/konrad.webp';
import photo2 from '@/assets/play/photos/konrad/crusher-inactive.webp';
import photo3 from '@/assets/play/photos/konrad/incinerator-inactive.webp';
import photo4 from '@/assets/play/photos/konrad/self-destruct-inactive.webp';
import photo5 from '@/assets/play/photos/konrad/shaft-upper-left-inactive.webp';
import photo6 from '@/assets/play/photos/konrad/shaft-upper-right-inactive.webp';
import photo7 from '@/assets/play/photos/konrad/shaft-lower-left-inactive.webp';
import photo8 from '@/assets/play/photos/konrad/shaft-lower-right-inactive.webp';
import photo9 from '@/assets/play/photos/konrad/captain.webp';
import photo10 from '@/assets/play/photos/konrad/jonas.webp';
import photo11 from '@/assets/play/photos/konrad/orphan.webp';
import photo12 from '@/assets/play/photos/konrad/faulty-wiring.webp';
import photo13 from '@/assets/play/photos/konrad/good-cookin.webp';
import photo14 from '@/assets/play/photos/konrad/cramped-pods.webp';
import photo15 from '@/assets/play/photos/konrad/cluttered-shafts.webp';
import photo16 from '@/assets/play/photos/konrad/emergency-override.webp';
import photo17 from '@/assets/play/photos/konrad/slippery.webp';
import photo18 from '@/assets/play/photos/konrad/beacon.webp';
import photo19 from '@/assets/play/photos/konrad/breach.webp';
import photo20 from '@/assets/play/photos/konrad/loader-parked.webp';
import photo21 from '@/assets/play/photos/konrad/shaft-upper-left-active.webp';
import photo22 from '@/assets/play/photos/konrad/shaft-upper-right-active.webp';
import photo23 from '@/assets/play/photos/konrad/shaft-lower-left-active.webp';
import photo24 from '@/assets/play/photos/konrad/shaft-lower-right-active.webp';
import photo25 from '@/assets/play/photos/konrad/crusher-active.webp';
import photo26 from '@/assets/play/photos/konrad/incinerator-active.webp';
import photo27 from '@/assets/play/photos/konrad/self-destruct-start.webp';
import photo28 from '@/assets/play/photos/konrad/self-destruct-middle.webp';
import photo29 from '@/assets/play/photos/konrad/self-destruct-explosion.webp';
import photo30 from '@/assets/play/photos/konrad/airlock-inactive.webp';
import photo31 from '@/assets/play/photos/konrad/airlock-released.webp';
import photo32 from '@/assets/play/photos/konrad/loader-powered.webp';
import photo33 from '@/assets/play/photos/konrad/loader-lost.webp';
/** Explicit owner photographs. Unknown aliases are dim neutral motifs, never observed states. */
export const KONRAD_ART:Record<string,ModuleArt>={
 "airlock-armed":{src:photo0,fit:'slice',position:'50% center'},
 "header":{src:photo1,fit:'slice',position:'50% center'},
 "crusher-inactive":{src:photo2,fit:'slice',position:'50% center'},
 "incinerator-inactive":{src:photo3,fit:'slice',position:'50% center'},
 "self-destruct-inactive":{src:photo4,fit:'slice',position:'50% center'},
 "shaft-upper-left-inactive":{src:photo5,fit:'slice',position:'50% center'},
 "shaft-upper-right-inactive":{src:photo6,fit:'slice',position:'50% center'},
 "shaft-lower-left-inactive":{src:photo7,fit:'slice',position:'50% center'},
 "shaft-lower-right-inactive":{src:photo8,fit:'slice',position:'50% center'},
 "captain":{src:photo9,fit:'slice',position:'35% center'},
 "jonas":{src:photo10,fit:'slice',position:'35% center'},
 "orphan":{src:photo11,fit:'slice',position:'35% center'},
 "faulty-wiring":{src:photo12,fit:'slice',position:'50% center'},
 "good-cookin":{src:photo13,fit:'slice',position:'50% center'},
 "cramped-pods":{src:photo14,fit:'slice',position:'50% center'},
 "cluttered-shafts":{src:photo15,fit:'slice',position:'50% center'},
 "emergency-override":{src:photo16,fit:'slice',position:'50% center'},
 "slippery":{src:photo17,fit:'slice',position:'50% center'},
 "beacon":{src:photo18,fit:'slice',position:'50% center'},
 "breach":{src:photo19,fit:'slice',position:'50% center'},
 "loader-parked":{src:photo20,fit:'slice',position:'50% center'},
 "shaft-upper-left-active":{src:photo21,fit:'slice',position:'50% center'},
 "shaft-upper-right-active":{src:photo22,fit:'slice',position:'50% center'},
 "shaft-lower-left-active":{src:photo23,fit:'slice',position:'50% center'},
 "shaft-lower-right-active":{src:photo24,fit:'slice',position:'50% center'},
 "crusher-active":{src:photo25,fit:'slice',position:'50% center'},
 "incinerator-active":{src:photo26,fit:'slice',position:'50% center'},
 "self-destruct-start":{src:photo27,fit:'slice',position:'50% center'},
 "self-destruct-middle":{src:photo28,fit:'slice',position:'50% center'},
 "self-destruct-explosion":{src:photo29,fit:'slice',position:'50% center'},
 "airlock-inactive":{src:photo30,fit:'slice',position:'50% center'},
 "airlock-released":{src:photo31,fit:'slice',position:'50% center'},
 "loader-powered":{src:photo32,fit:'slice',position:'50% center'},
 "loader-lost":{src:photo33,fit:'slice',position:'50% center'},
 "shaft-upper-left-unknown":{src:photo5,fit:'slice',position:'50% center'},
 "shaft-upper-right-unknown":{src:photo6,fit:'slice',position:'50% center'},
 "shaft-lower-left-unknown":{src:photo7,fit:'slice',position:'50% center'},
 "shaft-lower-right-unknown":{src:photo8,fit:'slice',position:'50% center'},
 "crusher-unknown":{src:photo2,fit:'slice',position:'50% center'},
 "incinerator-unknown":{src:photo3,fit:'slice',position:'50% center'},
 "airlock-unknown":{src:photo30,fit:'slice',position:'50% center'},
 "self-destruct-unknown":{src:photo4,fit:'slice',position:'50% center'},
 "loader-unknown":{src:photo20,fit:'slice',position:'50% center'},
 "loader-equipped":{src:photo32,fit:'slice',position:'50% center'},
};
export function konradArt(id:string):ModuleArt {const art=KONRAD_ART[id];if(!art)throw new Error(`Missing USS Konrad photograph: ${id}`);return art;}
