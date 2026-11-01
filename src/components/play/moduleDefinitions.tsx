import {MarrekControls} from './MarrekControls';
import marrekBanner from '@/assets/play/banners/marrek.webp';
import {marrekState,marrekExits} from '@/lib/play/marrekWarehouse';
import {TormentorControls} from './TormentorControls';
import {tormentorState} from '@/lib/play/tormentor';
import tormentorBanner from '@/assets/play/banners/tormentor.webp';
import {ShadyAcresControls} from './ShadyAcresControls';
import {shadyArt} from './shadyAcresArt';
import {shadyState,shadyChildrenCount} from '@/lib/play/shadyAcres';
import { GrimlashControls } from './GrimlashControls';
import { grimlashArt } from './grimlashArt';
import { harvestLevel } from '@/lib/play/grimlash';
import { KonradControls } from './KonradControls';
import { konradArt } from './konradArt';
import { konradState, konradToggle, KONRAD_FUNCTIONS, KONRAD_SHAFTS } from '@/lib/play/konrad';
import { EvomorphControls } from './EvomorphControls';
import evomorphBanner from '@/assets/play/banners/evomorph.webp';
import { CreechControls } from './CreechControls';
import creechBanner from '@/assets/play/banners/creech.webp';
import { PoltergeistControls } from './PoltergeistControls';
import { moduleBanners } from "./moduleBanners";
import { GrovesControls } from "./GrovesControls";
import { InkanyambaControls } from "./InkanyambaControls";
import { MapleControls } from "./MapleControls";
import { MAPLE_HOUSES, MAPLE_EXITS, MAPLE_PEOPLE } from "../../../supabase/functions/_shared/play/maple";
import { CarnivalControls } from "./CarnivalControls";
import { carnivalSummary } from "@/lib/play/modules";
import { GeppettoControls } from "./GeppettoControls";
import { geppettoPuppetCounts } from "@/lib/play/modules";
import { summarizePlay, type PlayEvent } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import {
  BUDDIES,
  SPECIAL_VICTIMS,
} from "../../../supabase/functions/_shared/play/buddyland";
import {
  CAMP_VICTIMS,
  HANS_MINOR_POWERS,
} from "../../../supabase/functions/_shared/play/camp";
import { BuddylandControls } from "./BuddylandControls";
import { CampControls } from "./CampControls";
import type { ModuleArt } from "./ModuleArtwork";
import { FrightControls } from "./FrightControls";

export interface ControlsProps {
  blocked?: boolean;
  setupScenario?: string | null;
  startingEvent?: string | null;
  killer: string;
  location: string;
  finalGirl: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
}
type State = ReturnType<typeof moduleState>;
export type SharedControlCapability =
  | "objective"
  | "minor-effect"
  | "character"
  | "event"
  | "reveals"
  | "minor-power";
interface Definition {
  capabilities: readonly SharedControlCapability[];
  id: "marrek" | "tormentor" | "shady-acres" | "grimlash" | "konrad" | "evomorph" | "creech" | "poltergeist" | "groves" | "inkanyamba" | "billy" | "hans" | "buddyland" | "camp" | "geppetto" | "carnival" | "fright" | "maple";
  owner: "killer" | "location";
  match: string;
  title: string;
  art: ModuleArt;
  summary: (state: State) => string;
  Controls: (props: ControlsProps) => React.ReactNode;
}
const peopleSummary = (
  state: State,
  ids: readonly { id: string }[],
  prefix: string,
  active: string,
) => {
  const recorded = ids.filter(
    (person) => state[`${prefix}.${person.id}`] !== undefined,
  );
  if (!recorded.length) return "No people recorded";
  const count = recorded.filter(
    (person) => state[`${prefix}.${person.id}`] === active,
  ).length;
  return `${count} in play · ${recorded.length} recorded`;
};
// Adding a module registers its owner, artwork and controls here. Location
// never determines the killer's controls (and vice versa).
export const moduleDefinitions: Definition[] = [
 {id:'marrek',owner:'location',match:'Marrek Warehouse',title:'Inside Marrek Warehouse',art:{src:marrekBanner,fit:'slice',position:'50% 42%'},capabilities:['character','event'],summary:state=>{const s=marrekState(state),exits=Object.values(marrekExits(s));return `${exits.filter(v=>v===true).length}/3 locked · ${exits.some(v=>v===null)?'partly recorded':s.withZipp?'Zipp with you':'Physical locks'}`;},Controls:p=><MarrekControls {...p}/>},
 {id:'tormentor',owner:'killer',match:'The Tormentor',title:'The Tormentor',art:{src:tormentorBanner,fit:'slice',position:'70% 9%'},capabilities:['reveals'],summary:state=>{const s=tormentorState(state),active=Object.values(s.traps).filter(t=>t.status==='active');return `${s.presence==='unknown'?'Presence not recorded':s.presence==='on-board'?'On the board':'Unseen'} · ${s.pendingSetup?'Starting trap not recorded':!s.known?'Trap list incomplete':`${active.length} active trap${active.length===1?'':'s'}`}`;},Controls:p=><TormentorControls {...p}/>},
 {id:'shady-acres',owner:'location',match:'Shady Acres',title:'Inside Shady Acres',art:shadyArt('header'),capabilities:['character','event'],summary:state=>{const s=shadyState(state),n=shadyChildrenCount(s);return `${n===null?'Children not fully recorded':`${n}/3 Children on board`} · ${s.curses.length?s.curses.filter(c=>c.status==='active').length+' Curse'+(s.curses.filter(c=>c.status==='active').length===1?'':'s')+' in play':s.initialized?'No Curses revealed':'Curses not recorded'}`;},Controls:props=><ShadyAcresControls {...props}/>},
 {id:'grimlash',owner:'killer',match:'Grimlash',title:'Grimlash · The Old One',art:grimlashArt('header'),capabilities:['reveals','minor-power'],summary:s=>`Harvest Madness ${s.position===undefined?'not recorded':harvestLevel(s.position)===4?'Skull':`Level ${harvestLevel(s.position)} · ${s.position}/10`}`,Controls:p=><GrimlashControls {...p}/>},
 {id:"konrad",owner:"location",match:"USS Konrad",title:"Aboard USS Konrad",art:konradArt("header"),capabilities:["character","event","minor-power"],summary:state=>{const s=konradState(state);
 const describe=(keys:string[],noun:string)=>{const values=keys.map(key=>konradToggle(s,key)),known=values.filter(v=>v!==undefined);return known.length?`${known.filter(Boolean).length}/${known.length} ${noun}${known.length<keys.length?' (partly recorded)':''}`:`${noun.replace(/ (on|open)$/,'')} not recorded`;};
 return describe(KONRAD_FUNCTIONS.map(f=>`system:${f.id}`),'systems on')+' · '+describe(KONRAD_SHAFTS.map(id=>`shaft:${id}`),'shafts open');
},Controls:props=><KonradControls {...props}/>},
 {id:'evomorph',owner:'killer',match:'Evomorph',title:'The Evomorph',art:{src:evomorphBanner,fit:'slice',position:'65% center'},capabilities:['reveals','minor-power'],summary:state=>`${state.stage?String(state.stage).replace(/^./,s=>s.toUpperCase()):'Stage not recorded'} · ${state.presence==='vanished'?'Hidden':state.presence==='on-board'?'Visible':'Presence not recorded'}`,Controls:props=><EvomorphControls {...props}/>},
 {id:'creech',owner:'location',match:'Creech Manor',title:'Inside Creech Manor',art:{src:creechBanner,fit:'slice',position:'70% center'},capabilities:['character','event'],summary:state=>`Ladder: ${state.ladder??'not recorded'} · Helicopter: ${state['helicopter.used']===true?'used':state['event.helicopter']==='active'?'available':'not recorded'}`,Controls:props=><CreechControls {...props}/>},
  {id:'poltergeist',owner:'killer',match:'Poltergeist',title:'The Poltergeist',art:moduleBanners.poltergeist,capabilities:['objective','minor-effect','reveals'],summary:state=>`Carolyn: ${state.carolyn===undefined?'not recorded':String(state.carolyn).replace(/-/g,' ')} · Mr. Floppy: ${state.floppy===undefined?'not recorded':String(state.floppy).replace(/-/g,' ')}`,Controls:props=><PoltergeistControls {...props}/>},
  {id:"groves",owner:"location",match:"Sacred Groves",title:"Inside Sacred Groves",art: moduleBanners.groves,capabilities:["character","event"],summary:state=>`Divine Wrath ${typeof state.wrath === "number" ? `${state.wrath}/10` : "not recorded"}${state.finaleRevealed ? " · Finale active" : ""}`,Controls:props=><GrovesControls {...props}/>},
  {id:"inkanyamba",owner:"killer",match:"Inkanyamba",title:"Inkanyamba · The Avenger",art: moduleBanners.inkanyamba,capabilities:["reveals","minor-power"],summary:state=>`Killer Wrath ${typeof state.wrath === "number" ? `${state.wrath}/10` : "not recorded"}`,Controls:props=><InkanyambaControls {...props}/>},
  { id:"maple", owner:"location", match:"Maple Lane", title:"Inside Maple Lane", art: moduleBanners.maple, capabilities:["character","event"], summary:state=>{
    const known=MAPLE_HOUSES.filter(h=>typeof state[`house.${h.id}`]==="boolean");
    const searched=known.filter(h=>state[`house.${h.id}`]===true).length;
    const blocked=MAPLE_EXITS.filter(e=>state[`exit.${e}`]===true).length;
    const knownExits=MAPLE_EXITS.filter(e=>typeof state[`exit.${e}`]==="boolean").length;
    const present=MAPLE_PEOPLE.filter(p=>state[`person.${p.id}`]==="in-play").length;
    return `${known.length?`${searched}/${known.length} recorded Houses searched`:"House searches not recorded"} · ${knownExits?`${blocked} blocked Exits (${knownExits}/4 recorded)`:"Exit status not recorded"}${state.fire&&state.fire!=="none"?" · Fire active":""}${present?` · ${present} people in play`:""}`;
  },Controls:props=><MapleControls {...props}/> },
  {id:"fright",owner:"killer",match:"Dr. Fright",title:"Dr. Fright · The Dream Doctor",art: moduleBanners.fright,capabilities:["reveals","minor-power"],summary:state=>state.sleep?`${state.sleep === "unknown"?"Sleep state not recorded":state.sleep === "asleep"?"Asleep":"Awake"}${state.mode === "digital"?` · Boiler Room ${state.progress}/4`:" · Physical cards"}`:"Sleep state not recorded",Controls:props=><FrightControls {...props}/>},
  {
    id: "geppetto",
    capabilities: ["reveals", "minor-power"],
    owner: "killer",
    match: "Geppetto",
    title: "Geppetto & his Puppets",
    art: moduleBanners.geppetto,
    summary: (state) => {
      const c = geppettoPuppetCounts(state);
      return c.recorded
        ? `${c.onBoard} on board · ${c.ready} ready · ${c.exhausted} exhausted`
        : "Puppet tray not recorded";
    },
    Controls: (props) => <GeppettoControls {...props} />,
  },
  {
    id: "billy",
    capabilities: ["reveals", "minor-power"],
    owner: "killer",
    match: "Billy the Bear",
    title: "Billy & his Buddies",
    art: moduleBanners.billy,
    summary: (state) => {
      const active = BUDDIES.filter(
        (b) => state[`buddy.${b.id}.status`] === "active",
      ).length;
      const recorded = BUDDIES.filter(b => state[`buddy.${b.id}.status`] !== undefined).length;
      const sources = [1, 2, 3, 4, 5].filter((id) =>
        ["active", "inactive"].includes(String(state[`source.${id}.status`])),
      );
      const on = sources.filter(
        (id) => state[`source.${id}.status`] === "active",
      ).length;
      return `${recorded ? `${active} ${active === 1 ? "Buddy" : "Buddies"} in play (${recorded}/${BUDDIES.length} recorded)` : "Buddies not recorded"} · ${sources.length ? `${on}/${sources.length} sources on` : "Sources not recorded"}`;
    },
    Controls: (props) => (
      <BuddylandControls {...props} part="killer" embedded />
    ),
  },
  {
    id: "hans",
    capabilities: ["reveals", "minor-power"],
    owner: "killer",
    match: "Hans",
    title: "Hans the Butcher",
    art: moduleBanners.hans,
    summary: (state) =>
      HANS_MINOR_POWERS.map((power) => {
        const health = state[`minor.${power.id}.health`];
        return `${power.name}: ${health === undefined ? "not recorded" : `${health}/2`}`;
      }).join(" · "),
    Controls: (props) => <CampControls {...props} part="killer" />,
  },
  {
    id: "buddyland",
    capabilities: ["character"],
    owner: "location",
    match: "Buddyland",
    title: "Inside Buddyland",
    art: moduleBanners.buddyland,
    summary: (state) =>
      peopleSummary(state, SPECIAL_VICTIMS, "victim", "on-board"),
    Controls: (props) => (
      <BuddylandControls {...props} part="location" embedded />
    ),
  },
  {
    id: "camp",
    capabilities: ["character", "event"],
    owner: "location",
    match: "Camp Happy Trails",
    title: "Inside Camp Happy Trails",
    art: moduleBanners.camp,
    summary: (state) => {
      const active = Object.entries(state).filter(
        ([key, value]) => key.startsWith("event.") && value === "active",
      ).length;
      return `${peopleSummary(state, CAMP_VICTIMS, "victim", "in-play")} · ${active} active effects`;
    },
    Controls: (props) => <CampControls {...props} part="location" />,
  },
  {
    id: "carnival",
    capabilities: ["character", "event"],
    owner: "location",
    match: "Carnival of Blood",
    title: "Inside Carnival of Blood",
    art: moduleBanners.carnival,
    summary: carnivalSummary,
    Controls: (props) => <CarnivalControls {...props} />,
  },
];
