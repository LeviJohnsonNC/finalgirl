import { FALCONWOOD } from "./falconwood.ts";
import { FALCONWOOD_EVENTS, FALCONWOOD_ITEMS, FALCONWOOD_MISSION_ITEMS, FALCONWOOD_ROLES, FALCONWOOD_SOURCE, FALCONWOOD_SPACES, FALCONWOOD_TERRORS } from "./falconwoodCatalog.ts";
import {MALL,MALL_EVENTS,MALL_TERRORS,MALL_ITEMS,MALL_SPACES,MALL_SOURCE} from './sunnydazeCatalog.ts';
import { SLAYER, SLAYER_SOURCE, SLAYER_TERRORS } from "./slayer.ts";
import { HUNTER, HUNTER_SOURCE, HUNTER_TERRORS } from './hunter.ts';
import { WINGARD, WINGARD_EVENTS, WINGARD_TERRORS, WINGARD_ITEMS, WINGARD_PEOPLE, WINGARD_SPACES, WINGARD_SOURCE } from './wingardCatalog.ts';
import { WOODS, WOODS_SOURCE, WOODS_EVENTS, WOODS_TERRORS, WOODS_ITEMS, WOODS_PEOPLE, WOODS_SPACES } from "./storybookWoods.ts";
import { INTRUDERS, INTRUDER_SOURCE, INTRUDER_TERRORS } from "./intruders.ts";
import { WOLF, WOLF_SOURCE, WOLF_TERRORS } from "./bigBadWolf.ts";
import {MARREK_TERRORS,MARREK_EVENTS,MARREK_ITEMS,MARREK_PEOPLE,MARREK_SPACES,MARREK_SOURCE} from './marrekWarehouse.ts';
import {TORMENTOR_TERRORS,TORMENTOR_TRAPS,TORMENTOR_SOURCE} from './tormentor.ts';
import {SHADY_EVENTS,SHADY_TERRORS,SHADY_ITEMS,SHADY_PEOPLE,SHADY_SPACES,SHADY_SOURCE} from './shadyAcres.ts';
import { GRIMLASH_TERRORS } from './grimlash.ts';
import { KONRAD_ITEMS, KONRAD_EVENTS, KONRAD_TERRORS, KONRAD_SPACES, KONRAD_PEOPLE, KONRAD_SOURCE } from './konradCatalog.ts';
import { EVOMORPH_TERRORS } from './evomorph.ts';
import { CREECH_ITEMS, CREECH_EVENTS, CREECH_TERRORS, CREECH_SPACES, CREECH_PEOPLE, CREECH_SOURCE } from './creech.ts';
import { POLTERGEIST_ITEMS, POLTERGEIST_TERRORS } from './poltergeist.ts';
import { GROVES_EVENTS, GROVES_ITEMS, GROVES_PEOPLE, GROVES_SPACES, GROVES_SOURCE, GROVES_TERRORS } from "./groves.ts";
import { INKANYAMBA_TERRORS } from "./inkanyamba.ts";
import { FRIGHT_TERRORS } from "./fright.ts";
import { MAPLE_TERRORS, MAPLE_EVENTS, MAPLE_ITEMS, MAPLE_PEOPLE, MAPLE_HOUSES, MAPLE_STREETS, MAPLE_SOURCE } from "./maple.ts";
import { CARNIVAL_TERRORS, CARNIVAL_EVENTS, CARNIVAL_ITEMS, CARNIVAL_ROOMS, CARNIVAL_TRAPS, CARNIVAL_ITEM_TRAPS, CARNIVAL_PEOPLE, CARNIVAL_SOURCE } from './carnival.ts';
import { GEPPETTO_TERRORS } from './geppetto.ts';
import {
  BUDDYLAND_EVENTS,
  BUDDYLAND_TERRORS,
  BUDDYLAND_ROOMS,
  BUDDYLAND_ITEMS,
  SPECIAL_VICTIMS,
} from "./buddyland.ts";
import {
  CAMP_EVENTS,
  CAMP_TERRORS,
  CAMP_ROOMS,
  CAMP_ITEMS,
  CAMP_VICTIMS,
  HANS_TERRORS,
} from "./camp.ts";
/** Researched 2026-10-18. Facts only, summaries paraphrased; provenance per record.
 * A name-only record never supplies an invented effect to the model.
 * This is a narrative companion catalog, not an executable rules engine. */
export interface PlayCard {
  name: string;
  kind: "terror" | "event";
  killer?: string;
  location?: string;
  effect?: string;
  source: string;
}
const wiki = (page: string) => `https://finalgirl.fandom.com/wiki/${page}`;
const station = wiki("Station_2891");
const rules =
  "https://gamers-hq.de/media/pdf/ca/8a/9f/FG_S2_FeatureFilmRules-compressed_2.pdf";
export const PLAY_CARDS: readonly PlayCard[] = [
 ...FALCONWOOD_TERRORS.map(card => ({...card,kind:"terror" as const,location:FALCONWOOD,source:FALCONWOOD_SOURCE})),
 ...FALCONWOOD_EVENTS.map(card => ({...card,kind:"event" as const,location:FALCONWOOD,source:FALCONWOOD_SOURCE})),
 ...MALL_EVENTS.map(card=>({...card,kind:"event" as const,location:MALL,source:MALL_SOURCE})),
 ...MALL_TERRORS.map(card=>({...card,kind:"terror" as const,location:MALL,source:MALL_SOURCE})),
  ...SLAYER_TERRORS.map(card => ({...card, kind:"terror" as const, killer:SLAYER, source:SLAYER_SOURCE})),
  ...HUNTER_TERRORS.map(card=>({...card,kind:"terror" as const,killer:HUNTER,source:HUNTER_SOURCE})),
  ...INTRUDER_TERRORS.map(card => ({...card, kind:"terror" as const, killer:INTRUDERS, source:INTRUDER_SOURCE})),
  ...WOLF_TERRORS.map(card => ({ ...card, kind: "terror" as const, killer: WOLF, source: WOLF_SOURCE })),
 ...WOODS_TERRORS.map(card => ({...card,kind:"terror" as const,location:WOODS,source:WOODS_SOURCE})),
 ...WOODS_EVENTS.map(card => ({...card,kind:"event" as const,location:WOODS,source:WOODS_SOURCE})),
 ...WINGARD_TERRORS.map(({fatal:_fatal,...card})=>({...card,kind:'terror' as const,location:WINGARD,source:WINGARD_SOURCE})),
 ...WINGARD_EVENTS.map(card=>({...card,kind:'event' as const,location:WINGARD,source:WINGARD_SOURCE})),
 ...MARREK_TERRORS.map(c=>({...c,kind:'terror' as const})),
 ...MARREK_EVENTS.map(c=>({...c,kind:'event' as const,location:'Marrek Warehouse',source:MARREK_SOURCE})),
 ...SHADY_TERRORS.map(c=>({...c,kind:'terror' as const})),
 ...SHADY_EVENTS.map(c=>({...c,kind:'event' as const,location:'Shady Acres',source:SHADY_SOURCE})),
  ...TORMENTOR_TERRORS.map(c=>({...c,kind:'terror' as const,killer:'The Tormentor',source:TORMENTOR_SOURCE})),
  ...GRIMLASH_TERRORS.map(c=>({...c,kind:'terror' as const})),
  ...KONRAD_TERRORS.map(c=>({...c,kind:"terror" as const})),
  ...KONRAD_EVENTS.map(c=>({...c,kind:"event" as const,location:"USS Konrad",source:KONRAD_SOURCE})),
  ...EVOMORPH_TERRORS.map(c=>({...c,kind:"terror" as const})),
  ...CREECH_TERRORS.map(c=>({...c,kind:"terror" as const})),
  ...CREECH_EVENTS.map(c=>({...c,kind:"event" as const,location:"Creech Manor",source:CREECH_SOURCE})),
  ...POLTERGEIST_TERRORS.map(card=>({...card,kind:"terror" as const})),
  ...GROVES_TERRORS.map(c=>({...c,kind:"terror" as const})),
  ...GROVES_EVENTS.map(c=>({...c,kind:"event" as const,location:"Sacred Groves",source:GROVES_SOURCE})),
  ...INKANYAMBA_TERRORS.map(card => ({...card, kind:"terror" as const})),
  ...FRIGHT_TERRORS.map(card => ({...card, kind: "terror" as const})),
  ...MAPLE_TERRORS.map(card=>({...card,kind:"terror" as const})),
  ...MAPLE_EVENTS.map(card=>({...card,kind:"event" as const,location:"Maple Lane",source:MAPLE_SOURCE})),
  ...CARNIVAL_TERRORS.map(card=>({...card,kind:"terror" as const})),
  ...CARNIVAL_EVENTS.map(card=>({...card,kind:"event" as const,location:"Carnival of Blood",source:CARNIVAL_SOURCE})),
  ...GEPPETTO_TERRORS.map(card => ({...card, kind: "terror" as const})),
  ...BUDDYLAND_TERRORS.map((card) => ({
    ...card,
    kind: "terror" as const,
    source: "Owner photo IMG_9309.jpg",
  })),
  ...BUDDYLAND_EVENTS.map((card) => ({
    ...card,
    kind: "event" as const,
    location: "Buddyland",
    source: "Owner photo IMG_9311.jpg",
  })),
  ...[
    "It's happy hour!",
    "It's not safe in here!",
    "Tell me where it is!",
    "What supplies are in the chopper?",
    "We can't stay here",
  ].map((name) => ({
    name,
    kind: "terror" as const,
    location: "Station 2891",
    source: station,
  })),
  {
    name: "The generator is out.",
    kind: "terror",
    location: "Station 2891",
    effect:
      "Frostbite remains through the next Upkeep. Draw two Events, then target the Final Girl or a Victim, move and attack. Resolve Frostbite and helicopter movement.",
    source: wiki("%22The_generator_is_out.%22"),
  },
  {
    name: "They... just left.",
    kind: "terror",
    location: "Station 2891",
    effect:
      "With no Victims, replace this card. Otherwise remove one normal Victim, preferring outdoors, and add one Bloodlust. Target a Victim and move, then resolve Frostbite and helicopter movement.",
    source: wiki("%22They..._just_left.%22"),
  },
  {
    name: "We'll be dead by morning.",
    kind: "terror",
    location: "Station 2891",
    effect:
      "Choose two Horror or one Bloodlust, then panic all Victims or yourself. Target the Final Girl or a Victim and move. Resolve Frostbite and helicopter movement.",
    source: wiki("%22We%27ll_be_dead_by_morning.%22"),
  },
  ...[
    "Chow time!",
    "Comms Specialist",
    "Don't worry! We're here to help!",
    "Heavy Storm",
    "Hidden Weapons Cache",
    "Someone pulled the fire alarm!",
    "There's been an accident in the lab!",
    "What's up doc?",
    "Who goes there?",
  ].map((name) => ({
    name,
    kind: "event" as const,
    location: "Station 2891",
    source: station,
  })),
  {
    name: "Pair up!",
    kind: "event",
    location: "Station 2891",
    effect:
      "Redistribute lone Victims in pairs through Kitchen, Radio Room, Rec Room and Lab. Add a Victim if needed to complete the last pair, then discard the Event.",
    source: `${rules}#page=11`,
  },
  ...HANS_TERRORS.map((card) => ({ ...card, kind: "terror" as const })),
  ...CAMP_TERRORS.map((card) => ({ ...card, kind: "terror" as const })),
  ...CAMP_EVENTS.map((card) => ({
    ...card,
    kind: "event" as const,
    location: "Camp Happy Trails",
    source: "Owner photo IMG_9324.jpg",
  })),
  // One sample is visible in the published rulebook; icons beyond the quoted
  // conditional are not inferred from incomplete PDF text extraction.
  {
    name: "Who can we trust?",
    kind: "terror",
    killer: "The Organism",
    source: `${rules}#page=14`,
  },
];
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[“”"'’!?.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
export function applicablePlayCards(
  selection: { killer: string; location: string; mission?: string | null },
  kind: PlayCard["kind"],
) {
  return PLAY_CARDS.filter(
    (card) =>
      card.kind === kind &&
      (card.location !== FALCONWOOD || card.name !== "Survive the Hunt" || selection.mission === "Survive the Hunt") &&
      (card.killer === selection.killer ||
        card.location === selection.location),
  ).sort((a, b) => a.name.localeCompare(b.name));
}
export function findPlayCard(
  selection: { killer: string; location: string; mission?: string | null },
  kind: PlayCard["kind"],
  name = "",
) {
  const key = selection.location === WOODS && kind === "event" && normalize(name) === "troll bridge"
    ? "toll bridge" : normalize(name);
  return applicablePlayCards(selection, kind).find(
    (card) => normalize(card.name) === key,
  );
}
/** Context-only Woods cards stay searchable as rules and accept historical free text. */
export function suggestedDeathCards(selection: {killer:string;location:string;mission?:string|null}, kind: "terror" | "event") {
  return applicablePlayCards(selection, kind).filter(card => {
    if (card.location === FALCONWOOD && kind === "event") return ["Head Researcher", "Conspiracy Theorist"].includes(card.name);
    if(card.location===WINGARD)return kind==='event'
      ? ['Booby Traps','Escape Attempt','Marked for Death','Loser Boyfriend'].includes(card.name)
      : WINGARD_TERRORS.some(terror=>terror.fatal && terror.name===card.name);
    if(card.location===WOODS)return kind==='event' ? card.name==='Pied Piper' : WOODS_TERRORS.some(terror=>'death' in terror && terror.name===card.name);
    return true;
  });
}
export function playCardContext(
  selection: { killer: string; location: string; mission?: string | null },
  terrorCard?: string,
  eventCard?: string,
) {
  return (
    [
      ["terror", terrorCard],
      ["event", eventCard],
    ] as const
  ).flatMap(([kind, name]) => {
    const card = findPlayCard(selection, kind, name);
    return card?.effect ? [{ kind, name: card.name, effect: card.effect }] : [];
  });
}
export const PLAY_ROOMS: Record<string, readonly string[]> = {
 [FALCONWOOD]:FALCONWOOD_SPACES,
 [WOODS]: WOODS_SPACES.map(space => space.name),
 [MALL]:MALL_SPACES,
 [WINGARD]:WINGARD_SPACES,
 'Marrek Warehouse':MARREK_SPACES.map(s=>s.name),
 'Shady Acres':SHADY_SPACES.map(s=>s.name),
  "Sacred Groves": GROVES_SPACES.filter(s=>s.type === "sacred" || s.type === "search").map(s=>s.name),
  "Maple Lane": [...MAPLE_HOUSES,...MAPLE_STREETS].map(s=>s.name),
  "Carnival of Blood": CARNIVAL_ROOMS,
  "Station 2891": [
    "Commander's Hut",
    "Supply Closet",
    "Tool Shed",
    "Kitchen",
    "Lab",
    "Radio Room",
    "Rec Room",
    "Armory",
    "Hallway",
    "Helipad",
    "Outside",
  ],
  "USS Konrad": [...KONRAD_SPACES],
  "Creech Manor": CREECH_SPACES.map(s=>s.name),
  "Camp Happy Trails": CAMP_ROOMS,
  Buddyland: [...BUDDYLAND_ROOMS],
};
// These labels record a player's observation, never infer which form is active.
export function playMechanisms(selection: {
  killer: string;
  location: string;
}) {
  return [
    "Killer attack",
    ...(selection.location==='Marrek Warehouse'?['Rack fall','Booby Trap']:[]),
    ...(selection.killer==='The Tormentor'?TORMENTOR_TRAPS.filter(c=>c.deck==='victim').map(c=>c.name):[]),
    ...(selection.location==='Shady Acres'?['Child attack','Abduction','Ancient Curse','Decaying Earth','Omen of Blood']:[]),
    ...(selection.killer === "Evomorph" ? ["Ambush", "Acid Blood", "Razor Tail"] : []),
    ...(selection.killer==='Poltergeist'?['Clown Doll','Behemoth','Flying objects','Lightning']:[]),
    ...(selection.killer === "Inkanyamba" ? ["Killer Wrath", "Dark Lightning"] : []),
    "Minion attack",
    ...(selection.killer === "Billy the Bear"
      ? ["Animatronic attack", "Short circuit"]
      : []),
    ...(selection.location === "Buddyland" ? ["Tragic Collapse"] : []),
    ...(selection.location === "Camp Happy Trails"
      ? ["Dark Waters", "Fire", "Star Crossed Lovers"]
      : []),
    ...(selection.location === "Station 2891" ? ["Frostbite"] : []),
    ...(selection.killer === "The Organism"
      ? ["Fast Organism", "Tough Organism", "Strong Organism"]
      : []),
    ...(selection.location === "Carnival of Blood" ? [...CARNIVAL_TRAPS, ...CARNIVAL_ITEM_TRAPS].map(t=>t.name) : []),
    ...(selection.location === "Maple Lane" ? ["Fire", "Booby Trap", "Street traffic"] : []),
    ...(selection.location==='USS Konrad'?['Crusher','Incinerator','Airlock','Self Destruct','Hull breach','Gas leak','Faulty Wiring','Garbage Day']:[]),
    ...(selection.location==='Creech Manor'?['Attic Skull','Window fall','Living trees']:[]),
    ...(selection.location===MALL?['Railing fall','Store wall knockback','Escalator']:[]),
    "Location hazard",
    "Other",
  ];
}

/** Only the selected Location supplies Items and Special Victim roles. */
export function playItems(
  location: string,
): readonly { name: string; effect: string }[] {
  return location === FALCONWOOD ? FALCONWOOD_ITEMS : location === MALL ? MALL_ITEMS : location === WOODS ? WOODS_ITEMS : location === WINGARD ? WINGARD_ITEMS : location === "Marrek Warehouse" ? MARREK_ITEMS : location === "Shady Acres" ? SHADY_ITEMS : location === "USS Konrad" ? KONRAD_ITEMS : location === "Creech Manor" ? CREECH_ITEMS : location === "Sacred Groves" ? GROVES_ITEMS : location === "Maple Lane" ? MAPLE_ITEMS : location === "Carnival of Blood" ? CARNIVAL_ITEMS : location === "Camp Happy Trails"
    ? CAMP_ITEMS
    : location === "Buddyland"
      ? BUDDYLAND_ITEMS
      : [];
}
export function playVictims(location: string): readonly { name: string }[] {
  return location === FALCONWOOD ? FALCONWOOD_ROLES : location===MALL?[{name:'Bart the Mall Cop'},{name:'The Savior’s Girl'}]:location === WOODS ? WOODS_PEOPLE : location === WINGARD ? WINGARD_PEOPLE : location === "Marrek Warehouse" ? MARREK_PEOPLE : location === "Shady Acres" ? SHADY_PEOPLE : location === "USS Konrad" ? KONRAD_PEOPLE : location === "Creech Manor" ? CREECH_PEOPLE : location === "Sacred Groves" ? GROVES_PEOPLE : location === "Maple Lane" ? MAPLE_PEOPLE : location === "Carnival of Blood" ? CARNIVAL_PEOPLE : location === "Camp Happy Trails"
    ? CAMP_VICTIMS
    : location === "Buddyland"
      ? SPECIAL_VICTIMS
      : [];
}

/** Location-only callers keep their existing catalogs. Killer Items follow the killer. */
export function selectionItems(selection:{killer:string;location:string;mission?:string|null}) {
  const missionItem = selection.location === FALCONWOOD
    ? FALCONWOOD_MISSION_ITEMS.filter(item => item.name === (selection.mission === 'Missing Friend' ? 'Spell Book' : selection.mission === 'Survive the Hunt' ? 'Telekinesis' : ''))
    : [];
  return [...playItems(selection.location), ...missionItem,...(selection.killer==='Poltergeist'?POLTERGEIST_ITEMS:[])];
}
