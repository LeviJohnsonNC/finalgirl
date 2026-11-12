import char from '@/assets/play/photos/station-2891/char.webp';
import thule from '@/assets/play/photos/station-2891/thule.webp';
import happyHour from '@/assets/play/photos/station-2891/terror-happy-hour.webp';
import notSafe from '@/assets/play/photos/station-2891/terror-not-safe.webp';
import tellMe from '@/assets/play/photos/station-2891/terror-tell-me.webp';
import generator from '@/assets/play/photos/station-2891/terror-generator.webp';
import theyLeft from '@/assets/play/photos/station-2891/terror-they-left.webp';
import cantStay from '@/assets/play/photos/station-2891/terror-cant-stay.webp';
import byMorning from '@/assets/play/photos/station-2891/terror-by-morning.webp';
import chopperSupplies from '@/assets/play/photos/station-2891/terror-chopper-supplies.webp';
import doctorPresent from '@/assets/play/photos/station-2891/doctor.webp';
import doctorSaved from '@/assets/play/photos/station-2891/doctor-saved.webp';
import doctorKilled from '@/assets/play/photos/station-2891/doctor-killed.webp';
import chefPresent from '@/assets/play/photos/station-2891/chef.webp';
import chefSaved from '@/assets/play/photos/station-2891/chef-saved.webp';
import chefKilled from '@/assets/play/photos/station-2891/chef-killed.webp';
import commsPresent from '@/assets/play/photos/station-2891/comms.webp';
import commsSaved from '@/assets/play/photos/station-2891/comms-saved.webp';
import commsKilled from '@/assets/play/photos/station-2891/comms-killed.webp';
import skidozerParked from '@/assets/play/photos/station-2891/skidozer-parked.webp';
import skidozerInUse from '@/assets/play/photos/station-2891/skidozer-in-use.webp';
import labIntact from '@/assets/play/photos/station-2891/lab-intact.webp';
import labBreached from '@/assets/play/photos/station-2891/lab-breached.webp';
import storm from '@/assets/play/photos/station-2891/heavy-storm.webp';
import cache from '@/assets/play/photos/station-2891/cache-hidden.webp';
import armory from '@/assets/play/photos/station-2891/armory.webp';
import airport from '@/assets/play/photos/station-2891/airport.webp';
import banner from '@/assets/play/photos/station-2891/banner.webp';
import departure from '@/assets/play/photos/station-2891/departure.webp';
import flight from '@/assets/play/photos/station-2891/flight.webp';
import frostbite from '@/assets/play/photos/station-2891/frostbite.webp';
import helipad from '@/assets/play/photos/station-2891/helipad.webp';
import type { ModuleArt } from './ModuleArtwork';

export const stationArt = {
  airport: {src:airport,position:'50% 58%'},
  banner: {src:banner,position:'62% 60%'},
  station: {src:departure,position:'70% 49%'},
  air: {src:flight,position:'55% 49%'},
  frostbite: {src:frostbite,position:'67% center'},
  helipad: {src:helipad,position:'60% 52%'},
  skidozerParked: {src:skidozerParked,position:'center'},
  skidozerInUse: {src:skidozerInUse,position:'center'},
  labIntact: {src:labIntact,position:'center'},
  labBreached: {src:labBreached,position:'center'},
  storm: {src:storm,position:'center'},
  cache: {src:cache,position:'center'},
  armory: {src:armory,position:'center'},
} satisfies Record<string,ModuleArt>;

export const stationCrewArt = {
  doctor: {present:{src:doctorPresent,position:'64% center'},saved:{src:doctorSaved,position:'64% center'},killed:{src:doctorKilled,position:'64% center'}},
  chef: {present:{src:chefPresent,position:'64% center'},saved:{src:chefSaved,position:'64% center'},killed:{src:chefKilled,position:'64% center'}},
  comms: {present:{src:commsPresent,position:'64% center'},saved:{src:commsSaved,position:'64% center'},killed:{src:commsKilled,position:'64% center'}},
} satisfies Record<string,Record<string,ModuleArt>>;

export const stationAllyArt = {
  char:{src:char,position:'64% center'},
  thule:{src:thule,position:'64% center'},
} satisfies Record<string,ModuleArt>;

export const stationTerrorArt = {
  'happy-hour': {src:happyHour,position:'62% center'},
  'not-safe': {src:notSafe,position:'62% center'},
  'tell-me': {src:tellMe,position:'62% center'},
  'generator': {src:generator,position:'62% center'},
  'they-left': {src:theyLeft,position:'62% center'},
  'cant-stay': {src:cantStay,position:'62% center'},
  'by-morning': {src:byMorning,position:'62% center'},
  'chopper-supplies': {src:chopperSupplies,position:'62% center'},
} satisfies Record<string,ModuleArt>;
