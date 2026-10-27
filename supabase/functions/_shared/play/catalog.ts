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
  {
    name: "Fire Sale!",
    kind: "event",
    location: "Sunnydaze Mall",
    effect:
      "Move Victims adjacent to a store inside it. You, Allies and Enemies sharing a store with a Victim lose one health. Discard the Event.",
    source: wiki("Fire_Sale%21"),
  },
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
  selection: { killer: string; location: string },
  kind: PlayCard["kind"],
) {
  return PLAY_CARDS.filter(
    (card) =>
      card.kind === kind &&
      (card.killer === selection.killer ||
        card.location === selection.location),
  ).sort((a, b) => a.name.localeCompare(b.name));
}
export function findPlayCard(
  selection: { killer: string; location: string },
  kind: PlayCard["kind"],
  name = "",
) {
  return applicablePlayCards(selection, kind).find(
    (card) => normalize(card.name) === normalize(name),
  );
}
export function playCardContext(
  selection: { killer: string; location: string },
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
    "Location hazard",
    "Other",
  ];
}

/** Only the selected Location supplies Items and Special Victim roles. */
export function playItems(
  location: string,
): readonly { name: string; effect: string }[] {
  return location === "Sacred Groves" ? GROVES_ITEMS : location === "Maple Lane" ? MAPLE_ITEMS : location === "Carnival of Blood" ? CARNIVAL_ITEMS : location === "Camp Happy Trails"
    ? CAMP_ITEMS
    : location === "Buddyland"
      ? BUDDYLAND_ITEMS
      : [];
}
export function playVictims(location: string): readonly { name: string }[] {
  return location === "Sacred Groves" ? GROVES_PEOPLE : location === "Maple Lane" ? MAPLE_PEOPLE : location === "Carnival of Blood" ? CARNIVAL_PEOPLE : location === "Camp Happy Trails"
    ? CAMP_VICTIMS
    : location === "Buddyland"
      ? SPECIAL_VICTIMS
      : [];
}

/** Location-only callers keep their existing catalogs. Killer Items follow the killer. */
export function selectionItems(selection:{killer:string;location:string}) {
  return [...playItems(selection.location),...(selection.killer==='Poltergeist'?POLTERGEIST_ITEMS:[])];
}
