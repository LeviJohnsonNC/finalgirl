import airport from '@/assets/play/photos/station-2891/airport.webp';
import banner from '@/assets/play/photos/station-2891/banner.webp';
import departure from '@/assets/play/photos/station-2891/departure.webp';
import flight from '@/assets/play/photos/station-2891/flight.webp';
import frostbite from '@/assets/play/photos/station-2891/frostbite.webp';
import helipad from '@/assets/play/photos/station-2891/helipad.webp';
import type { ModuleArt } from './ModuleArtwork';

export const stationArt = {
  airport: {src:airport,position:'65% center'},
  banner: {src:banner,position:'62% 60%'},
  station: {src:departure,position:'70% 49%'},
  air: {src:flight,position:'55% 49%'},
  frostbite: {src:frostbite,position:'67% center'},
  helipad: {src:helipad,position:'60% 52%'},
} satisfies Record<string,ModuleArt>;
