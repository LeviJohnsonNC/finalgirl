/** Standard-mode owner references IMG_9338–IMG_9343. Paraphrased companion
 * references, never an automatic board, combat or inventory engine. */
import type { ModuleState, ModuleValue } from "./modules.ts";
export const CARNIVAL_SOURCE =
  "Owner photos IMG_9338–IMG_9343 (Carnival board, rules and cards)";
export const CARNIVAL_ROOMS = [
  "Animal Cages",
  "Clown Car",
  "Forest of Horrors",
  "House of Mirrors",
  "The Big Top",
  "Things to Astonish",
] as const;
export const CARNIVAL_VISUAL =
  "A working but sinister traveling carnival: red-and-cream striped Big Top, House of Mirrors, Forest of Horrors wooded attraction, Clown Car, Animal Cages and Things to Astonish sideshow. Muddy paths, lanterns and faded carnival paint. Keep the selected Killer’s identity independent. Zappo is a small carnival monkey, not a Victim. A Werewolf exists only if Full Moon was recorded. Illustrate only established traps, people and outcomes.";
export const CARNIVAL_TRAPS = [
  {
    id: "blades",
    name: "Spinning Floor Blade Trap",
    effect:
      "Roll two dice. Each 1–4 deals one damage; each 5–6 allows you to move one space.",
  },
  {
    id: "rope",
    name: "Rope Trap",
    effect: "Discard one Action card at random.",
  },
  {
    id: "acid",
    name: "Acid Pitfall Trap",
    effect: "Lose one Health (unpreventable Health loss, not attack damage).",
  },
] as const;
export const CARNIVAL_ITEM_TRAPS = [
  {
    id: "cobra",
    name: "Hidden Cobra Trap",
    effect:
      "Place beside the Final Girl. During Upkeep lose one Health. The next time you recover Health, discard this card instead of recovering Health.",
  },
  {
    id: "bear",
    name: "Steel Bear Trap",
    effect:
      "Lose one Health. Spend two Time to remove the trap from your leg; you cannot move again until you do. Discard it once removed.",
  },
  {
    id: "gas",
    name: "Knockout Gas Trap",
    effect:
      "Immediately end the Action phase and set Time to zero. Recover one Health from a good rest, then discard this card.",
  },
] as const;
export const CARNIVAL_EVENTS = [
  {
    id: "animal-panic",
    name: "Animal Panic!",
    effect:
      "Each time Horror increases, roll dice equal to the new Horror level. For each success, you may move a Victim one space. For every two dice that are not successes, kill one Victim.",
  },
  {
    id: "clowns",
    name: "Clowns Everywhere",
    effect:
      "During Upkeep, panic Victims in The Big Top and adjacent spaces. Any who panic into a space with an Enemy are killed immediately.",
  },
  {
    id: "sibling",
    name: '"Did you follow me here?"',
    effect:
      "Place four new Victims at The Big Top, including your younger Sibling. While the Sibling shares your space, spend two Time to reroll one die. If the Sibling dies, add two Bloodlust. Discard this Event when the Sibling leaves play.",
  },
  {
    id: "cart",
    name: "Employee Transport",
    effect:
      "Place the Golf Cart in any corner space. During Upkeep, you and/or up to two Victims sharing its space may drive it up to two spaces along the outer path only. When driving into an Enemy’s space, you may discard the Cart to deal three damage to that Enemy. Discard this Event when the Cart is discarded.",
  },
  {
    id: "full-moon",
    name: "Full Moon",
    effect:
      "The farthest Victim becomes the Werewolf. It will not follow you and cannot be targeted, saved or killed. During Upkeep panic it, then deal two damage to one target in its space, prioritizing Victim, then Final Girl, then Minion, then Killer.",
  },
  {
    id: "dangerous",
    name: '"How dangerous can it be?"',
    effect:
      "During Upkeep, each Victim moves one space toward the closest Trap token.",
  },
  {
    id: "not-real",
    name: "It's Not Real",
    effect:
      "Place four new Victims at the House of Mirrors and the Skull token at the Forest of Horrors. Victims in or entering the Forest of Horrors are killed immediately.",
  },
  {
    id: "mirrors",
    name: "Mirrors Everywhere",
    effect:
      "When you attack with one or more Victims in your space, one Victim dies for each 1 you roll.",
  },
  {
    id: "fiance",
    name: '"Run! I\'ll hold them off!"',
    effect:
      "The closest Victim is your Fiancé. If an Enemy would enter your space while the Fiancé is there, kill the Fiancé instead and the Enemy stays put. If the Fiancé is killed by a trap, increase Horror by five. Discard this Event when the Fiancé leaves play.",
  },
  {
    id: "junk",
    name: "So Much Junk",
    effect:
      "Find Zappo and put him in your backpack; reset Item decks if necessary. If you lose him, roll one fewer die (minimum one) on Search Action cards for the rest of the game.",
  },
] as const;
export const CARNIVAL_PEOPLE = [
  { id: "sibling", name: "Sibling", event: "sibling" },
  { id: "fiance", name: "Fiancé", event: "fiance" },
] as const;
export const CARNIVAL_SETUPS = [
  "Ring Around the Rosie",
  "Center Stage",
  "Boxed In",
  "No Laughing Matter",
  "Late for the Show",
].map((name) => ({
  name,
  description:
    "Use the printed Setup card: its Final Girl and Killer symbols show starting spaces, and its numbers show Victim placements. Follow the Carnival Item-deck setup separately.",
}));
export const CARNIVAL_ITEMS = [
  {
    name: "Disguise & Makeup Kit",
    effect:
      "When an Enemy specifically targets the Final Girl, you may use this to treat yourself as a Victim. That Enemy targets the nearest Victim instead.",
  },
  {
    name: "Old Revolver",
    effect:
      "Range one; adds one damage. It can only modify the Weak Attack Action card and requires one hand.",
  },
  {
    name: "Energy Drink",
    effect:
      "Discard during the Action phase to gain three Time or move one space.",
  },
  {
    name: "First Aid Kit",
    effect:
      "Whenever an Action card recovers Health, recover one additional Health. Requires one hand.",
  },
  {
    name: "Pepper Spray",
    effect:
      "If the Killer is in your space, discard this to immediately end the Killer phase, ignoring all remaining movement, attacks and other effects. Requires one hand.",
  },
  {
    name: "Zappo the Carnival Monkey",
    effect:
      "You may resolve a Search card from up to two spaces away from a Search space. If you use Zappo and reveal an Item Trap, he flees: ignore that trap’s effects and discard Zappo. This does not protect against Terror Traps.",
  },
  {
    name: "Crystal Ball",
    effect:
      "Once per Action phase roll a die: on 1–4 nothing happens; on 5–6 look at the next Terror card and put it on the top or bottom of the Terror deck.",
  },
  {
    name: "Aluminum Bat",
    effect:
      "Range zero; adds one damage; requires two hands. When it damages the Killer, you may immediately discard one Minor Dark Power, including its remaining Health markers.",
  },
  {
    name: "Super Lucky Dice",
    effect:
      "Reroll any or all dice, then roll one die: on 1–4 discard this item; on 5–6 keep it.",
  },
  {
    name: "Bullwhip",
    effect:
      "Range zero; adds one damage; requires one hand. After damaging an Enemy with it, you may move that Enemy one space.",
  },
  {
    name: "Found Footage",
    effect:
      "Discard to cancel the effects of one Item Trap or Terror Trap card. For a Terror Trap card, discard the entire card without applying ANY of its effects. This does not remove a trap token already on the board.",
  },
  { name: "Knife", effect: "Range zero; adds one damage; requires one hand." },
  {
    name: "Knife Bandolier",
    effect:
      "Range zero or one; adds one damage; requires one hand. You may divide its damage among Enemies in range. Track its four uses on the physical card.",
  },
  {
    name: "Telescoping 10' Pole",
    effect:
      "Requires two hands. Once per Action phase skip one space while moving. No effects trigger in the skipped space, and no Victims may follow you into or beyond it.",
  },
  {
    name: "Mysterious Pills",
    effect:
      "Discard during the Action phase to lower Horror by two or recover two Health.",
  },
  {
    name: "Strongman Hammer",
    effect:
      "Range zero; adds three damage; requires two hands. You need at least four Health to attack with it and cannot carry it in your backpack. After resolving its attack, lose one Health and immediately end the Action phase.",
  },
  {
    name: "Trashcan Lid",
    effect:
      "Requires one hand. Ignore one damage per use; track its three uses on the physical card.",
  },
  {
    name: "Throwing Axe",
    effect:
      "Range zero or one; adds one damage; requires one hand. You may attack an Enemy in an adjacent space; if you do, discard after the attack.",
  },
] as const;
export const CARNIVAL_TERRORS = [
  {
    name: "Welcome to the Greatest Show",
    effect:
      "Draw and resolve an Event. Move all Victims one space closer to The Big Top. Place the Killer at The Big Top. Target the closest Final Girl or Victim, attack, then move.",
  },
  {
    name: '"Is this a prop?"',
    effect:
      "Draw and resolve an Event. Discard a random Item; if you have none, discard the top card of the nearest Item deck. Target the closest Final Girl or Victim, move and attack.",
  },
  {
    name: '"How did the tiger get loose?"',
    effect:
      "With no Victims, discard and resolve the next Terror card. Otherwise panic all Victims, then target a Victim, move and attack. In Animal Cages and adjacent spaces, kill all Victims; Enemies there take one damage, and the Final Girl loses one Health if there.",
  },
  {
    name: "Misty Ambush",
    effect:
      "Panic Victims at or adjacent to Forest of Horrors. A Victim rolling 1 is killed. If any Victim died, increase Horror by one; otherwise resolve the next Terror card.",
  },
  {
    name: '"I’m all wrapped up and I can’t get free!"',
    effect:
      "Target the Final Girl, move and attack. Place the Rope Trap in her space and immediately apply it to her and all Victims there. If a Walk or Sprint card was discarded, increase Horror by two.",
  },
  {
    name: '"How can there be so many traps?!"',
    effect:
      "With no discarded Item Trap cards, discard and resolve the next Terror card. Otherwise shuffle all facedown Item-deck cards with discarded Item Traps, distribute evenly back among the Item decks and replace their faceup Items on top. Target the closest Final Girl or Victim, move and attack; increase Horror by one.",
  },
  {
    name: '"Where the hell did the blades come from?"',
    effect:
      "Place the Spinning Floor Blade Trap in your space and immediately apply it to you and all Victims there. Increase Horror by one for each 1–4 rolled.",
  },
  {
    name: '"It burns, it burns!"',
    effect:
      "Place the Acid Trap in your space, immediately apply it to you and all Victims there, then increase Horror by two.",
  },
].map((c) => ({
  ...c,
  location: "Carnival of Blood",
  source: CARNIVAL_SOURCE,
}));

export const carnivalEvent = (id: string) =>
  CARNIVAL_EVENTS.find((e) => e.id === id);
export function validCarnivalField(key: string, value: unknown) {
  if (value !== null && typeof value !== "string" && typeof value !== "boolean")
    return false;
  if (/^trap\.(blades|rope|acid)\.status$/.test(key))
    return value === null || ["not-placed", "placed"].includes(String(value));
  if (/^trap\.(blades|rope|acid)\.space$/.test(key))
    return value === null || (typeof value === "string" && value.length <= 100);
  if (/^event\.[a-z-]+$/.test(key) && carnivalEvent(key.slice(6)))
    return value === null || ["active", "ended"].includes(String(value));
  if (/^person\.(sibling|fiance)$/.test(key))
    return (
      value === null || ["in-play", "saved", "killed"].includes(String(value))
    );
  if (key === "werewolf") return value === null || value === "in-play";
  if (key === "cart")
    return value === null || ["available", "discarded"].includes(String(value));
  if (key === "zappo")
    return value === null || ["with-you", "lost"].includes(String(value));
  if (key === "searchPenalty")
    return value === null || typeof value === "boolean";
  if (/^condition\.(cobra|bear)$/.test(key))
    return value === null || ["active", "cleared"].includes(String(value));
  if (key === "lastTerrorTrap")
    return value === null || CARNIVAL_TRAPS.some((t) => t.id === value);
  if (key === "terrorTrapOutcome")
    return (
      value === null || ["placed", "canceled-footage"].includes(String(value))
    );
  if (key === "lastEncounter")
    return value === null || CARNIVAL_ITEM_TRAPS.some((t) => t.name === value);
  if (key === "encounterOutcome")
    return (
      value === null ||
      ["resolved", "canceled-footage", "avoided-zappo"].includes(String(value))
    );
  return false;
}
export const initialCarnivalTraps = (): Record<string, ModuleValue> =>
  Object.fromEntries(
    CARNIVAL_TRAPS.map((t) => [`trap.${t.id}.status`, "not-placed"]),
  );
/** Activating an Event records its immediate linked state once, in one observation.
 * No positions, dice, casualties, stats or item-deck operations are inferred. */
export function activateCarnivalEvent(
  id: string,
  state: ModuleState,
): Record<string, ModuleValue> | null {
  if (!carnivalEvent(id) || state[`event.${id}`] === "active") return null;
  if (
    (id === "sibling" || id === "fiance") &&
    ["saved", "killed"].includes(String(state[`person.${id}`]))
  )
    return null;
  if (id === "cart" && state.cart === "discarded") return null;
  const changes: Record<string, ModuleValue> = { [`event.${id}`]: "active" };
  if (
    (id === "sibling" || id === "fiance") &&
    state[`person.${id}`] === undefined
  )
    changes[`person.${id}`] = "in-play";
  if (id === "full-moon" && state.werewolf === undefined)
    changes.werewolf = "in-play";
  if (id === "cart" && state.cart === undefined) changes.cart = "available";
  if (id === "junk" && state["event.junk"] === undefined)
    changes.zappo = "with-you";
  return changes;
}
export function carnivalStartingObservations(
  name?: string | null,
): Record<string, ModuleValue> {
  const event = CARNIVAL_EVENTS.find((e) => e.name === name);
  return {
    ...initialCarnivalTraps(),
    ...(event ? activateCarnivalEvent(event.id, {}) : {}),
  };
}
export function carnivalActorChanges(
  key: string,
  value: ModuleValue,
  state: ModuleState,
): Record<string, ModuleValue> {
  const changes: Record<string, ModuleValue> = { [key]: value };
  if (
    (key === "person.sibling" || key === "person.fiance") &&
    (value === "saved" || value === "killed")
  )
    changes[`event.${key.slice(7)}`] = "ended";
  if (
    key.startsWith("person.") &&
    value === "in-play" &&
    state[`event.${key.slice(7)}`] !== undefined
  )
    changes[`event.${key.slice(7)}`] = "active";
  if (
    key === "cart" &&
    value === "available" &&
    state["event.cart"] !== undefined
  )
    changes["event.cart"] = "active";
  if (key === "cart" && value === "discarded") changes["event.cart"] = "ended";
  if (key === "zappo" && value === "lost" && state["event.junk"] !== undefined)
    changes.searchPenalty = true;
  return changes;
}
export function carnivalItemEncounter(
  id: string,
  outcome: "resolved" | "canceled-footage" | "avoided-zappo",
  state: ModuleState,
): Record<string, ModuleValue> | null {
  const trap = CARNIVAL_ITEM_TRAPS.find((t) => t.id === id);
  if (!trap || (outcome === "avoided-zappo" && state.zappo !== "with-you"))
    return null;
  const changes: Record<string, ModuleValue> = {
    lastEncounter: trap.name,
    encounterOutcome: outcome,
  };
  if (outcome === "resolved" && id !== "gas")
    changes[`condition.${id}`] = "active";
  if (outcome === "avoided-zappo")
    Object.assign(changes, carnivalActorChanges("zappo", "lost", state));
  return changes;
}
export function carnivalSummary(state: ModuleState) {
  const placed = CARNIVAL_TRAPS.filter(
    (t) => state[`trap.${t.id}.status`] === "placed",
  ).length;
  const recorded = CARNIVAL_TRAPS.some(
    (t) => state[`trap.${t.id}.status`] !== undefined,
  );
  const active = CARNIVAL_EVENTS.filter(
    (e) => state[`event.${e.id}`] === "active",
  ).length;
  return `${recorded ? `${placed} traps placed` : "Traps not recorded"} · ${active} active Events${state.searchPenalty === true ? " · Search −1 die" : ""}`;
}
export function carnivalStoryFacts(state: ModuleState) {
  const lines: string[] = [];
  if (state.searchPenalty === true)
    lines.push("So Much Junk: lasting Search penalty −1 die, minimum 1.");
  for (const p of CARNIVAL_PEOPLE)
    if (state[`person.${p.id}`])
      lines.push(`${p.name}: ${state[`person.${p.id}`]}.`);
  for (const key of ["werewolf", "zappo", "cart"] as const)
    if (state[key])
      lines.push(
        `${key === "werewolf" ? "Werewolf (cannot be saved/killed)" : key === "zappo" ? "Zappo" : "Golf Cart"}: ${state[key]}.`,
      );
  const traps = CARNIVAL_TRAPS.filter(
    (t) => state[`trap.${t.id}.status`] === "placed",
  ).map(
    (t) =>
      `${t.name.replace(" Trap", "")}${state[`trap.${t.id}.space`] ? ` at ${String(state[`trap.${t.id}.space`]).slice(0, 45)}` : ""}`,
  );
  if (traps.length)
    lines.push(`Persistent traps: ${traps.join(", ")}; Enemies ignore tokens.`);
  for (const key of ["cobra", "bear"])
    if (state[`condition.${key}`] === "active")
      lines.push(
        `${key === "cobra" ? "Hidden Cobra" : "Steel Bear Trap"} attached.`,
      );
  const events = CARNIVAL_EVENTS.filter(
    (e) => state[`event.${e.id}`] === "active",
  );
  if (events.length)
    lines.push(
      `Active Carnival Events: ${events.map((e) => e.name).join("; ")}.`,
    );
  if (state.lastTerrorTrap && state.terrorTrapOutcome === "canceled-footage")
    lines.push(
      `${CARNIVAL_TRAPS.find((t) => t.id === state.lastTerrorTrap)?.name} card canceled with Found Footage; existing tokens unchanged.`,
    );
  if (state.lastEncounter)
    lines.push(
      `Latest Item Trap: ${state.lastEncounter}, ${state.encounterOutcome}.`,
    );
  return lines;
}
