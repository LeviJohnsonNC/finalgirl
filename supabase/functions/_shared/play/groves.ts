/** Sacred Groves, standard mode. Owner photos IMG_9368–9373, 2026-10-25.
 * Facts are shared by browser and edge bundles. No movement/inventory simulator. */
import { atonementWrath } from "./inkanyamba.ts";
import type { ModuleState, ModuleValue, ModuleObservation } from "./modules.ts";
export const GROVES_SOURCE =
  "Owner photos IMG_9368–IMG_9373 (2026-10-25), standard mode; Final Girl official FAQ, Slaughter in the Groves";
export const GROVES_VISUAL =
  "Sacred Groves is a tropical heritage tourist park around a lake: an old walled Burial Ground with gravestones and a stone cross, a gnarled root Sacred Shrine, upright dark standing stones at the Holy Groves, a Welcome Center, Lost & Found and Groundskeeper's Shed. Tourist trails, bridges, visitor huts, green forest and ancient stone. The selected killer is independent. Divine Wrath is divine displeasure, not proof of physical lightning, fire or injury. Do not turn Fire and Brimstone's victim-count modifier into a wildfire or invent a casualty.";
export const HOLY_MAN_PROVISIONAL =
  "Provisional interpretation: without Inkanyamba, apply the entire 10-point increase to Divine Wrath, capped at 10. No explicit official ruling has been found for this allocation.";
export const GROVES_FINALE =
  "After the Finale's Killer Action is completed during each Killer phase, Unleash Divine Wrath, THEN increase Divine Wrath by 1. A Finale reveal does not itself resolve this sequence.";
export const GROVES_UNLEASH = [
  "Lose 1 Time; then increase Divine Wrath by 1.",
  "Lose 2 Time.",
  "Increase Horror by 1.",
  "Discard 1 random Action card.",
  "Lose 4 Time.",
  "Increase Horror by 2.",
  "Discard 1 random Action card; increase Horror by 1; lose 2 Time.",
  "Discard 2 random Action cards; then lose 5 Time.",
  "Increase Horror by 2; then lose 4 Time.",
  "Discard ALL Action cards except Atonement; decrease Divine Wrath by the number discarded.",
] as const;
/** Seven printed rows, bottom aligned, beginning at Bloodlust 0. Not a killer maximum. */
export const GROVES_BLOODLUST = [
  "Increase Divine Wrath by the number of Victims at Sacred spaces.",
  "No additional location effect.",
  "Unleash Divine Wrath.",
  "Increase Divine Wrath by the number of Victims at Sacred spaces.",
  "No additional location effect.",
  "Unleash Divine Wrath.",
  "Increase Divine Wrath by the number of Victims at Sacred spaces; then Unleash Divine Wrath.",
] as const;
/** Coordinates are diagram aids from the photographed board, not official names for unnamed spaces. */
export const GROVES_SPACES = [
  {
    id: "nw",
    name: "Northwest trail",
    short: "NW",
    x: 10,
    y: 20,
    type: "trail",
  },
  { id: "north", name: "North trail", short: "N", x: 26, y: 8, type: "trail" },
  {
    id: "rocks",
    name: "Northern rocks",
    short: "Rocks",
    x: 50,
    y: 19,
    type: "trail",
  },
  {
    id: "north-exit",
    name: "Northeast Exit",
    short: "Exit NE",
    x: 67,
    y: 6,
    type: "exit",
  },
  {
    id: "shed",
    name: "Groundskeeper's Shed",
    short: "Shed",
    x: 87,
    y: 12,
    type: "search",
  },
  {
    id: "upper-shore",
    name: "Northeast shore",
    short: "NE shore",
    x: 77,
    y: 32,
    type: "trail",
  },
  { id: "east", name: "East trail", short: "E", x: 91, y: 46, type: "trail" },
  {
    id: "lower-east",
    name: "Southeast trail",
    short: "SE",
    x: 94,
    y: 67,
    type: "trail",
  },
  {
    id: "south-exit",
    name: "Southeast Exit",
    short: "Exit SE",
    x: 90,
    y: 91,
    type: "exit",
  },
  {
    id: "south-shore",
    name: "Southern shore",
    short: "S shore",
    x: 73,
    y: 88,
    type: "trail",
  },
  {
    id: "lost",
    name: "Lost & Found",
    short: "Lost",
    x: 52,
    y: 94,
    type: "search",
  },
  { id: "south", name: "South trail", short: "S", x: 29, y: 93, type: "trail" },
  {
    id: "sw",
    name: "Southwest trail",
    short: "SW",
    x: 12,
    y: 77,
    type: "trail",
  },
  {
    id: "west-exit",
    name: "West Exit",
    short: "Exit W",
    x: 4,
    y: 55,
    type: "exit",
  },
  {
    id: "welcome",
    name: "Welcome Center",
    short: "Welcome",
    x: 21,
    y: 54,
    type: "search",
  },
  {
    id: "burial",
    name: "Burial Ground",
    short: "Burial",
    x: 34,
    y: 31,
    type: "sacred",
  },
  {
    id: "shrine",
    name: "Sacred Shrine",
    short: "Shrine",
    x: 34,
    y: 75,
    type: "sacred",
  },
  {
    id: "central",
    name: "Central clearing",
    short: "Clearing",
    x: 53,
    y: 57,
    type: "trail",
  },
  {
    id: "holy",
    name: "Holy Groves",
    short: "Groves",
    x: 76,
    y: 67,
    type: "sacred",
  },
] as const;
export const GROVES_SACRED = GROVES_SPACES.filter((s) => s.type === "sacred");
export const GROVES_EDGES: readonly (readonly [string, string])[] = [
  ["nw", "north"],
  ["nw", "burial"],
  ["nw", "welcome"],
  ["north", "rocks"],
  ["north", "burial"],
  ["rocks", "north-exit"],
  ["rocks", "burial"],
  ["rocks", "upper-shore"],
  ["rocks", "central"],
  ["north-exit", "upper-shore"],
  ["shed", "upper-shore"],
  ["upper-shore", "east"],
  ["upper-shore", "holy"],
  ["east", "holy"],
  ["east", "lower-east"],
  ["lower-east", "holy"],
  ["lower-east", "south-exit"],
  ["south-exit", "south-shore"],
  ["south-shore", "holy"],
  ["south-shore", "lost"],
  ["lost", "central"],
  ["lost", "shrine"],
  ["lost", "south"],
  ["south", "shrine"],
  ["south", "sw"],
  ["sw", "shrine"],
  ["sw", "welcome"],
  ["west-exit", "welcome"],
  ["shrine", "central"],
  ["burial", "central"],
];
export const grovesSpaceName = (id: unknown) =>
  GROVES_SPACES.find((s) => s.id === id)?.name ??
  (id === "none" ? "Not placed" : "Not recorded");
export const grovesEdgeId = (edge: readonly string[]) =>
  [...edge].sort().join("~");
export const grovesEdgeName = (id: unknown) =>
  typeof id === "string" && id.includes("~")
    ? id.split("~").map(grovesSpaceName).join(" ↔ ")
    : id === "none"
      ? "Retrieved"
      : "Not recorded";
export const GROVES_SETUPS: readonly {
  name: string;
  girl: string;
  killer: string;
  victims: Record<string, number>;
}[] = [
  {
    name: "Dueling Tour Guides",
    girl: "south-exit",
    killer: "shed",
    victims: {
      burial: 1,
      shrine: 1,
      rocks: 4,
      lost: 4,
      "upper-shore": 1,
      "south-shore": 1,
    },
  },
  {
    name: "Family Day",
    girl: "central",
    killer: "sw",
    victims: {
      north: 2,
      welcome: 2,
      burial: 2,
      shrine: 2,
      "upper-shore": 2,
      "south-shore": 2,
    },
  },
  {
    name: "Mob O' Tourists",
    girl: "welcome",
    killer: "south-exit",
    victims: {
      burial: 1,
      shrine: 1,
      rocks: 1,
      "upper-shore": 1,
      central: 6,
      lost: 1,
    },
  },
  {
    name: "Swamp Thing",
    girl: "central",
    killer: "holy",
    victims: {
      north: 1,
      rocks: 2,
      shed: 2,
      east: 1,
      "lower-east": 1,
      lost: 2,
      shrine: 1,
      burial: 1,
      sw: 1,
    },
  },
  {
    name: "Worship Service",
    girl: "sw",
    killer: "central",
    victims: {
      nw: 1,
      north: 1,
      "upper-shore": 2,
      east: 2,
      "lower-east": 2,
      holy: 2,
      "south-shore": 2,
    },
  },
];
export function grovesSetupDescription(s: (typeof GROVES_SETUPS)[number]) {
  return `Final Girl: ${grovesSpaceName(s.girl)}. Killer: ${grovesSpaceName(s.killer)}. Victims: ${Object.entries(
    s.victims,
  )
    .map(([id, n]) => `${n} at ${grovesSpaceName(id)}`)
    .join(
      "; ",
    )}. Positional labels identify unnamed spaces; use the matching diagram.`;
}
export const GROVES_EVENTS = [
  {
    id: "guide",
    name: "The Tour Guide",
    effect:
      "The closest Victim to you becomes the Tour Guide. Once per turn, when you move at least one space, move one additional space if the Guide accompanies the entire movement. If killed, increase Divine Wrath by 6. Discard this Event when the Guide leaves play.",
  },
  {
    id: "closed",
    name: "Closed for Maintenance",
    effect:
      "When revealed, you MAY discard all Action cards except Atonement to close one Sacred space. Place Closed there; redistribute its Victims evenly among adjacent spaces of your choice. Victims cannot enter it for any reason; you and Enemies can still move in and out. Declining places no token.",
  },
  {
    id: "loud",
    name: "Loud and Obnoxious",
    effect: "Whenever Divine Wrath increases, increase it by an additional 1.",
  },
  {
    id: "tourist",
    name: "The Uber Tourist",
    effect:
      "The Victim farthest from the Killer becomes the Uber Tourist. Whenever the Killer chooses a target, choose him instead. If saved, decrease your choice of Divine or Killer Wrath by 4. If killed, increase Divine Wrath by 4. Discard this Event when he leaves play.",
  },
  {
    id: "flash",
    name: "Flash Photography",
    effect:
      "Whenever at least one Victim in your space panics, discard one random Action card.",
  },
  {
    id: "fire",
    name: "Fire and Brimstone",
    effect:
      "Roll a die and place its token: 1–2 Burial Ground, 3–4 Sacred Shrine, 5–6 Holy Groves. Each Victim at that space counts as TWO Victims when calculating Divine Wrath increases.",
  },
  {
    id: "bloodshed",
    name: "Unholy Bloodshed",
    effect:
      "Whenever at least one Victim is killed at a Sacred space, Unleash Divine Wrath.",
  },
  {
    id: "hallowed",
    name: "Hallowed Ground",
    effect:
      "Roll a die and place its token: 1–2 Burial Ground, 3–4 Sacred Shrine, 5–6 Holy Groves. Whenever you end the Action phase at that space, gain 2 Time.",
  },
  {
    id: "holy-man",
    name: "The Holy Man",
    effect:
      "The Victim farthest from the Killer becomes the Holy Man. He will not follow you. Each Upkeep, move him one space toward the Killer. When sharing the Killer's space, immediately remove him. If you share his space, decrease both Wraths TO 1. Otherwise increase the two Wraths by a TOTAL of 10, allocated as you choose. Discard this Event when he leaves play.",
  },
  {
    id: "failure",
    name: "The Gods Hate Failure",
    effect:
      "Whenever you completely fail a Horror roll, after conversions and rerolls, increase Divine Wrath by 1.",
  },
] as const;
export const GROVES_PEOPLE = [
  { id: "guide", name: "The Tour Guide" },
  { id: "tourist", name: "The Uber Tourist" },
  { id: "holy-man", name: "The Holy Man" },
] as const;
export const GROVES_FICKLENESS =
  "Place beside Divine Wrath. At the END of Upkeep, make a Horror roll: 2+ successes decrease your choice of Divine or Killer Wrath by 1; one success has no effect; no successes Unleashes Divine Wrath, then increases it by the number of Victims at Sacred spaces. During the Action phase you may spend 3 Time to discard this card.";
const countIncrease =
  "Increase Divine Wrath by the number of Victims at Sacred spaces.";
const desecrate = (site: string) =>
  `${countIncrease} Unleash Divine Wrath. Place two new Victims at ${site}; then move all adjacent Victims there.`;
export const GROVES_TERRORS = [
  {
    name: '"If I Climb on Top of That Statue I Can Get a Killer Selfie!"',
    effect: desecrate("Burial Ground"),
  },
  {
    name: "Rage of the Gods",
    effect: `Draw an Event. ${countIncrease} Place the Killer at the Sacred space with the most Victims; if no Sacred space has Victims, place the Killer in your space, even if Victims remain elsewhere. Target the closest Final Girl or Victim and attack twice.`,
  },
  {
    name: '"No One Will Notice if I Break Off One of These Pretty Branches..."',
    effect: desecrate("Holy Groves"),
  },
  {
    name: "Tourist Trap",
    effect: `Move all Victims adjacent to a Sacred space into it. ${countIncrease} Target the closest Final Girl or Victim; move; attack.`,
  },
  {
    name: "Fury of the Gods",
    effect: `Draw an Event. ${countIncrease} Unleash Divine Wrath. ${countIncrease}`,
  },
  {
    name: '"Let Me Just Carve My Initials Right Here..."',
    effect: desecrate("Sacred Shrine"),
  },
  { name: "Fickleness of the Gods", effect: GROVES_FICKLENESS },
  {
    name: "Punishment of the Gods",
    effect:
      "Unleash Divine Wrath twice in succession. Target the Final Girl; move; attack. Draw an Event.",
  },
].map((c) => ({
  ...c,
  quantity: 1,
  location: "Sacred Groves",
  source: GROVES_SOURCE,
}));
export const GROVES_ITEMS = [
  {
    name: "Prayer Book",
    effect: "Two uses. When playing Atonement, add one success to your roll.",
  },
  {
    name: "Aluminum Bat",
    effect:
      "Range 0, +1 damage, two hands. Whenever you damage the Killer with it, you may immediately discard a Minor Dark Power, including remaining Health on that card.",
  },
  {
    name: "Incense",
    effect:
      "Whenever Killer or Divine Wrath increases, increase it by one less, with a minimum increase of 1.",
  },
  {
    name: "Ceremonial Dagger",
    effect:
      "Range 0, +1 damage, one hand. Whenever you damage the Killer, decrease your choice of Killer or Divine Wrath by 1.",
  },
  {
    name: "Energy Drink",
    effect:
      "Discard during the Action phase to choose: gain 3 Time OR move one space.",
  },
  {
    name: "Shaman's Bones",
    effect:
      "One hand, three uses. Look at the next Terror card and put it on top or bottom of the Terror deck.",
  },
  {
    name: "Airhorn",
    effect:
      "Spend 1 Time to panic all Victims in your space or an adjacent space.",
  },
  {
    name: "Out of Order Signs",
    effect:
      "Two tokens. Spend 1 Time to place or retrieve a token on a connection between your space and an adjacent one. Victims will not pass unless following you.",
  },
  {
    name: "Tribal Mask",
    effect:
      "Whenever you receive damage, decrease your choice of Killer or Divine Wrath by the damage received.",
  },
  {
    name: "Whip",
    effect:
      "Range 0, +1 damage, one hand. When you damage an Enemy with the Whip, you may move it one space.",
  },
  {
    name: "First Aid Kit",
    effect:
      "One hand. Every time an Action card recovers Health, recover one additional Health.",
  },
  {
    name: "Pepper Spray",
    effect:
      "One hand. If the Killer shares your space, discard to immediately end the Killer phase; ignore remaining movement, attacks and other effects.",
  },
  {
    name: "War Club",
    effect:
      "Range 0, +1 damage, two hands. Whenever you inflict damage with it, decrease your choice of Killer or Divine Wrath by the damage inflicted.",
  },
  { name: "Trashcan Lid", effect: "One hand, three uses. Ignore one damage." },
  {
    name: "Old Rifle",
    effect:
      "Range 1–2, no damage modifier, two hands. Only modifies Weak Attack. At a Sacred space, add 2 to maximum range.",
  },
  {
    name: "Map",
    effect:
      "Discard during the Action phase. For EACH Item deck, either turn a facedown top card faceup, or remove a faceup top card from the game and reveal the next card.",
  },
  {
    name: "Mysterious Pills",
    effect:
      "Discard during the Action phase to choose: reduce Horror by 1 OR recover 2 Health.",
  },
].map((c) => ({ ...c, copies: 1 }));
const inList = (value: unknown, list: readonly unknown[]) =>
  value === null || list.includes(value);
export function validGrovesField(key: string, value: unknown): boolean {
  if (key === "wrath")
    return (
      value === null ||
      (Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 10)
    );
  if (key === "atonementTarget") return inList(value, ["divine", "killer"]);
  if (key === "holyManOutcome") return inList(value, ["blessed", "angered"]);
  if (key === "holyManProvisional") return inList(value, [true, false]);
  if (key === "fickleness") return inList(value, ["active", "ended"]);
  if (["closed", "fire", "hallowed"].includes(key))
    return inList(value, ["none", ...GROVES_SACRED.map((s) => s.id)]);
  if (/^sign\.[12]$/.test(key))
    return inList(value, ["none", ...GROVES_EDGES.map(grovesEdgeId)]);
  if (key.startsWith("event."))
    return (
      GROVES_EVENTS.some((e) => key === `event.${e.id}`) &&
      inList(
        value,
        key === "event.closed"
          ? ["active", "ended", "declined"]
          : ["active", "ended"],
      )
    );
  if (key.startsWith("person."))
    return (
      GROVES_PEOPLE.some((p) => key === `person.${p.id}`) &&
      inList(value, ["in-play", "saved", "killed", "removed", "away"])
    );
  return false;
}
export function grovesLabel(key: string) {
  return key === "wrath"
    ? "Divine Wrath"
    : key.startsWith("event.")
      ? `Event · ${GROVES_EVENTS.find((e) => key === `event.${e.id}`)?.name ?? key}`
      : key.startsWith("person.")
        ? (GROVES_PEOPLE.find((p) => key === `person.${p.id}`)?.name ?? key)
        : key.startsWith("sign.")
          ? `Out of Order ${key.slice(-1)}`
          : ((
              {
                closed: "Closed token",
                fire: "Fire and Brimstone token",
                hallowed: "Hallowed Ground token",
                fickleness: "Fickleness of the Gods",
                holyManOutcome: "Holy Man ritual",
                holyManProvisional: "Provisional Divine-only allocation",
              } as Record<string, string>
            )[key] ?? key);
}
export function grovesValue(key: string, value: ModuleValue) {
  return ["closed", "fire", "hallowed"].includes(key)
    ? grovesSpaceName(value)
    : key.startsWith("sign.")
      ? grovesEdgeName(value)
      : value === null
        ? "not recorded"
        : String(value);
}
export const clampWrath = (n: number) => Math.max(1, Math.min(10, n));
export type GrovesAction = { parent: string } & (
  | { kind: "atonement"; target: "divine" | "killer"; successes: 1 | 2 | 3 }
  | { kind: "increase"; amount: number; incense: boolean }
  | {
      kind: "outcome";
      person: "guide" | "tourist" | "holy-man";
      outcome: "saved" | "killed" | "blessed" | "angered";
      target?: "divine" | "killer";
      allocation?: number;
      incense: boolean;
    }
);
export function validGrovesAction(a: unknown): a is GrovesAction {
  if (!a || typeof a !== "object" || Array.isArray(a)) return false;
  const v = a as GrovesAction;
  if (typeof v.parent !== "string" || !/^(root|[0-9a-f-]{36})$/.test(v.parent))
    return false;
  if (v.kind === "atonement")
    return (
      Object.keys(v).every((k) =>
        ["kind", "parent", "target", "successes"].includes(k),
      ) &&
      ["divine", "killer"].includes(v.target) &&
      [1, 2, 3].includes(v.successes)
    );
  if (v.kind === "increase")
    return (
      Object.keys(v).every((k) =>
        ["kind", "parent", "amount", "incense"].includes(k),
      ) &&
      Number.isInteger(v.amount) &&
      v.amount >= 1 &&
      v.amount <= 400 &&
      typeof v.incense === "boolean"
    );
  return (
    v.kind === "outcome" &&
    Object.keys(v).every((k) =>
      [
        "kind",
        "parent",
        "person",
        "outcome",
        "target",
        "allocation",
        "incense",
      ].includes(k),
    ) &&
    GROVES_PEOPLE.some((p) => p.id === v.person) &&
    ["saved", "killed", "blessed", "angered"].includes(v.outcome) &&
    typeof v.incense === "boolean" &&
    (v.target === undefined || ["divine", "killer"].includes(v.target)) &&
    (v.allocation === undefined ||
      (Number.isInteger(v.allocation) &&
        v.allocation >= 0 &&
        v.allocation <= 10)) &&
    (v.person === "holy-man"
      ? ["blessed", "angered", "saved", "killed"].includes(v.outcome)
      : ["saved", "killed"].includes(v.outcome))
  );
}
/** Only these physical effects can change the selected killer's Wrath. */
export function canLinkGrovesAction(a: GrovesAction): boolean {
  return a.kind === "atonement"
    ? a.target === "killer"
    : a.kind === "outcome" &&
        ((a.person === "holy-man" &&
          (a.outcome === "blessed" ||
            (a.outcome === "angered" &&
              a.allocation !== undefined &&
              a.allocation < 10))) ||
          (a.person === "tourist" &&
            a.outcome === "saved" &&
            a.target === "killer"));
}
export interface GrovesResult {
  changes: Record<string, ModuleValue>;
  linkedModule?: ModuleObservation;
}
/** Explicit effect resolution only. Corrections do not call this function. */
export function resolveGrovesAction(
  a: GrovesAction,
  s: ModuleState,
  ink: ModuleState,
  killer: string,
): GrovesResult | null {
  if (!validGrovesAction(a)) return null;
  const changes: Record<string, ModuleValue> = {};
  let inkWrath: number | undefined;
  const get = (target: string) =>
    typeof (target === "divine" ? s.wrath : ink.wrath) === "number"
      ? Number(target === "divine" ? s.wrath : ink.wrath)
      : undefined;
  const set = (target: string, value: number) => {
    if (target === "divine") changes.wrath = clampWrath(value);
    else inkWrath = clampWrath(value);
  };
  const change = (
    target: "divine" | "killer",
    amount: number,
    incense = false,
  ) => {
    if (target === "killer" && killer !== "Inkanyamba") return false;
    const current = get(target);
    if (current === undefined) return false;
    const extra =
      target === "divine"
        ? Number(s["event.loud"] === "active")
        : Number(Number(ink["minor.outrageholic.health"]) > 0);
    const delta =
      amount > 0 ? Math.max(1, amount + extra - Number(incense)) : amount;
    set(target, current + delta);
    return true;
  };
  if (a.kind === "atonement") {
    if (a.target === "killer" && killer !== "Inkanyamba") return null;
    const n = get(a.target);
    if (n === undefined) return null;
    changes.atonementTarget = a.target;
    set(a.target, atonementWrath(n, a.successes));
  } else if (a.kind === "increase") {
    if (!change("divine", a.amount, a.incense)) return null;
  } else {
    if (s[`person.${a.person}`] !== "in-play") return null;
    changes[`person.${a.person}`] = ["blessed", "angered"].includes(a.outcome)
      ? "removed"
      : a.outcome;
    changes[`event.${a.person}`] = "ended";
    if (
      a.person === "guide" &&
      a.outcome === "killed" &&
      !change("divine", 6, a.incense)
    )
      return null;
    if (a.person === "tourist") {
      if (a.outcome === "killed" && !change("divine", 4, a.incense))
        return null;
      if (a.outcome === "saved" && (!a.target || !change(a.target, -4)))
        return null;
    }
    if (a.person === "holy-man" && ["blessed", "angered"].includes(a.outcome)) {
      changes.holyManOutcome = a.outcome;
      changes.holyManProvisional =
        killer !== "Inkanyamba" && a.outcome === "angered";
      if (a.outcome === "blessed") {
        set("divine", 1);
        if (killer === "Inkanyamba") set("killer", 1);
      } else if (killer !== "Inkanyamba") {
        if (!change("divine", 10, a.incense)) return null;
      } else {
        if (a.allocation === undefined) return null;
        if (a.allocation > 0 && !change("divine", a.allocation, a.incense))
          return null;
        if (
          a.allocation < 10 &&
          !change("killer", 10 - a.allocation, a.incense)
        )
          return null;
      }
    }
  }
  if (inkWrath !== undefined)
    return {
      changes,
      linkedModule: { module: "inkanyamba", changes: { wrath: inkWrath } },
    };
  return { changes };
}
export function grovesFacts(s: ModuleState): string {
  const lines: string[] = [];
  if (typeof s.wrath === "number")
    lines.push(`Divine Wrath ${s.wrath}/10 (anger, not an injury).`);
  for (const key of ["closed", "fire", "hallowed"])
    if (s[key] && s[key] !== "none")
      lines.push(`${grovesLabel(key)}: ${grovesSpaceName(s[key])}.`);
  for (const key of ["sign.1", "sign.2"])
    if (s[key] && s[key] !== "none")
      lines.push(`${grovesLabel(key)}: ${grovesEdgeName(s[key])}.`);
  for (const p of GROVES_PEOPLE)
    if (s[`person.${p.id}`]) lines.push(`${p.name}: ${s[`person.${p.id}`]}.`);
  const active: string[] = GROVES_EVENTS.filter(
    (e) => s[`event.${e.id}`] === "active",
  ).map((e) => e.name);
  if (s.fickleness === "active") active.push("Fickleness of the Gods");
  if (active.length) lines.push(`Active: ${active.join(", ")}.`);
  if (s.finaleRevealed)
    lines.push(
      "Finale revealed; Sacred Groves adds Divine Wrath instructions after the Killer Action, not proof of their resolution.",
    );
  return lines.join(" ");
}
