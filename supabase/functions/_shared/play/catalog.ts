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
const hans = wiki("Hans_the_Butcher");
const camp = wiki("Camp_Happy_Trails");
const rules =
  "https://gamers-hq.de/media/pdf/ca/8a/9f/FG_S2_FeatureFilmRules-compressed_2.pdf";
export const PLAY_CARDS: readonly PlayCard[] = [
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
  ...[
    "Unholy Rage",
    "Unholy Speed",
    "Dark Feast",
    "Hans wants me. He's always wanted me.",
    "He just came out of nowhere!",
    "He just keeps coming!",
    "He kept swinging his hammer and killing and killing...",
    "He wants fresh blood!",
    "He's just...standing there!",
    "Horrific Hammer Rush",
  ].map((name) => ({
    name,
    kind: "terror" as const,
    killer: "Hans",
    source: hans,
  })),
  {
    name: "Taking Souvenirs",
    kind: "terror",
    killer: "Hans",
    effect:
      "With no Victims, replace this card. Otherwise target a Victim, move twice and attack twice. Each Victim killed this Killer phase adds one extra Bloodlust.",
    source: wiki("Taking_Souvenirs"),
  },
  ...[
    "I fell asleep. What did I miss?",
    "Maybe things are starting to go our way!",
    "That girl, What's-Her-Name... She can help us!",
    "What's that noise? Let's go and see!",
    "You can't save us... No one can!",
  ].map((name) => ({
    name,
    kind: "terror" as const,
    location: "Camp Happy Trails",
    source: camp,
  })),
  ...[
    "Boyfriend",
    "Clingy Campers",
    "Dark Waters",
    "Deathwish",
    "Fresh Meat",
    "Girlfriend",
    "Secret Tunnel",
    "Star Crossed Lovers",
    "Stubborn Kids",
    "Vengeance",
  ].map((name) => ({
    name,
    kind: "event" as const,
    location: "Camp Happy Trails",
    source: camp,
  })),
  {
    name: "Fire!",
    kind: "terror",
    location: "Camp Happy Trails",
    effect:
      "A die selects the Cabins (1–2), Utility Shed (3–4) or Dock (5–6). Fire kills the Victims there, destroys that space’s Items and deals one damage to you or Enemies there.",
    source: wiki("%22Fire%21%22"),
  },
  {
    name: "Run for your life!",
    kind: "terror",
    location: "Camp Happy Trails",
    effect:
      "With no Victims, replace this card. Otherwise panic Victims outside your space, target the Final Girl or a Victim and attack, then target a Victim and move.",
    source: wiki("%22Run_for_your_life%21%22"),
  },
  {
    name: "Let's go see if the rumors are true!",
    kind: "terror",
    location: "Camp Happy Trails",
    effect:
      "Add two Victims where the Killer originally started, raise Horror by one, then draw an Event.",
    source: wiki("%22Let%27s_go_see_if_the_rumors_are_true%21%22"),
  },
  {
    name: "Fire!",
    kind: "event",
    location: "Maple Lane",
    effect:
      "A die selects the Boyfriend’s House (1–3) or Smalley’s House (4–6). Fire kills Victims there or panicking into it; you or Enemies there take one damage. The burning house cannot be entered or searched.",
    source: wiki("Fire%21"),
  },
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
  "Camp Happy Trails": [
    "Cabins",
    "Dock",
    "Utility Shed",
    "Cliff",
    "Firepit",
    "Lake",
    "Makeout Point",
  ],
  Buddyland: [
    "Arcade",
    "Party Room",
    "Kitchen",
    "Prize Counter",
    "Janitor’s Closet",
    "Bathroom",
    "Jungle Gym",
    "Ball Pit",
  ],
};
// These labels record a player's observation, never infer which form is active.
export function playMechanisms(selection: {
  killer: string;
  location: string;
}) {
  return [
    "Killer attack",
    "Minion attack",
    ...(selection.location === "Station 2891" ? ["Frostbite"] : []),
    ...(selection.killer === "The Organism"
      ? ["Fast Organism", "Tough Organism", "Strong Organism"]
      : []),
    "Location hazard",
    "Other",
  ];
}
