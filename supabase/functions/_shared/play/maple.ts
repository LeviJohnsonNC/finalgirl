/** Verified owner photographs IMG_9351–IMG_9356, 2026-10-24.
 * See docs/imports/maple-lane.md. References and explicit observations only.
 * Convince outcome faces and per-type physical token supply are not verified. */
export const MAPLE_SOURCE =
  "Owner photos IMG_9351–IMG_9356 (Maple Lane location sheet, board and cards)";
export const MAPLE_VISUAL =
  "Maple Lane, Spring Hill: an ordinary American suburban crossroads at night, twelve detached houses in four quadrants, lawns, driveways, amber porch lights, cool moonlight, sidewalks and an empty intersection. Suspicious neighbors behind curtains; mundane domestic safety becoming frightening. Only two houses have official names: the Boyfriend’s House in the northeast and the Smalley’s House in the southwest. Independently selected Killer; no dream imagery or Dr. Fright unless he is actually selected.";
export const MAPLE_HOUSES = [
  { id: "nw-west", name: "NW · West house", quadrant: "NW" },
  { id: "nw-north", name: "NW · North house", quadrant: "NW" },
  { id: "nw-inner", name: "NW · Inner house", quadrant: "NW" },
  { id: "ne-boyfriend", name: "The Boyfriend’s House", quadrant: "NE" },
  { id: "ne-inner", name: "NE · Inner house", quadrant: "NE" },
  { id: "ne-east", name: "NE · East house", quadrant: "NE" },
  { id: "sw-west", name: "SW · West house", quadrant: "SW" },
  { id: "sw-smalley", name: "The Smalley’s House", quadrant: "SW" },
  { id: "sw-south", name: "SW · South house", quadrant: "SW" },
  { id: "se-inner", name: "SE · Inner house", quadrant: "SE" },
  { id: "se-south", name: "SE · South house", quadrant: "SE" },
  { id: "se-east", name: "SE · East house", quadrant: "SE" },
] as const;
export const MAPLE_STREETS = [
  { id: "north-exit", name: "North Exit" },
  { id: "north-inner", name: "North Street" },
  { id: "west-exit", name: "West Exit" },
  { id: "west-inner", name: "West Street" },
  { id: "intersection", name: "Intersection" },
  { id: "east-inner", name: "East Street" },
  { id: "east-exit", name: "East Exit" },
  { id: "south-inner", name: "South Street" },
  { id: "south-exit", name: "South Exit" },
] as const;
export const MAPLE_EXITS = ["north", "east", "south", "west"] as const;
export const MAPLE_SETUPS = [
  "Block Party",
  "Playtime",
  "A Quiet Place",
  "Maple Lane",
  "Revenge",
] as const;
export const MAPLE_EVENTS = [
  {
    id: "commotion",
    name: "What’s Going on Over There?",
    effect: "Place one new Victim on each Exit. Discard this Event.",
  },
  {
    id: "kopp",
    name: "Officer Kopp",
    effect:
      "Place the Cop Car on a chosen Exit. Each Upkeep, move it one space toward the opposite Exit. Victims sharing its space move with it and are saved when they reach that Exit. Remove the car and discard the Event when it reaches the exit.",
  },
  {
    id: "fire",
    name: "Fire!",
    effect:
      "Roll a die: 1–3 burns the Boyfriend’s House; 4–6 burns the Smalley’s House. Victims there or panicking into it are killed. You or Enemies there take one damage. The burning house cannot be entered or searched.",
  },
  {
    id: "july",
    name: "It’s the 4th of July!",
    effect:
      "Move all Victims inside Houses into their adjacent Street spaces. Discard this Event.",
  },
  {
    id: "party",
    name: "Party in the Burbs!",
    effect:
      "Add four new Victims to any House already containing a Victim. If none does, put them at the Intersection. Discard this Event.",
  },
  {
    id: "rain",
    name: "It’s Raining",
    effect:
      "Panic Victims in the Intersection. Then move every Victim on a Street to its adjacent House. Discard this Event.",
  },
  {
    id: "construction",
    name: "Under Construction",
    effect:
      "Roll a die and place a Roadblock at an Exit: 1 West, 2 East, 3 North, 4 South, 5 East or West, 6 North or South. Victims cannot be saved at that Exit. This does not prohibit movement.",
  },
  {
    id: "neighbors",
    name: "Friendly Neighbors",
    effect: "Roll one additional die when resolving Convince Action cards.",
  },
  {
    id: "smalleys",
    name: "The Smalleys",
    effect:
      "Place two Special Victims in the Smalley’s House. Each killed Smalley adds one extra Bloodlust, in addition to the normal victim-death increase. Discard when neither remains on the board.",
  },
  {
    id: "boyfriend",
    name: "Boyfriend",
    effect:
      "Place the Special Victim in the Boyfriend’s House. When the Killer would target you, it instead targets Boyfriend. Each Upkeep, move him two spaces toward you; then lose two Time if he shares your space. Discard when he leaves play.",
  },
] as const;
export const MAPLE_PEOPLE = [
  { id: "boyfriend", name: "Boyfriend", event: "boyfriend" },
  { id: "smalley-1", name: "Smalley 1", event: "smalleys" },
  { id: "smalley-2", name: "Smalley 2", event: "smalleys" },
] as const;
export const MAPLE_TERRORS = [
  {
    name: "It’s Too Quiet...",
    effect:
      "Increase Horror by one. Target the Final Girl and resolve two Move icons. If the Killer shares her space, increase Horror by one again.",
  },
  {
    name: "It Came Right Through the Yard!",
    effect:
      "Target the closest Final Girl or Victim, move and attack. If the Killer is in a House, move it to another House in that quadrant containing a Victim. Target the closest Final Girl or Victim and attack, then draw an Event.",
  },
  {
    name: "I Said Don’t Look Back!",
    effect:
      "If no Exit contains a Victim, replace this Terror card. Otherwise place the Killer on an Exit containing at least one Victim, then target the closest Final Girl or Victim and attack.",
  },
  {
    name: "They Told Us to Hide!",
    effect:
      "Increase Horror by one. Add one Victim to every House not connected to an Exit, then draw an Event.",
  },
  {
    name: "Road Closed for Construction",
    effect:
      "Place a Roadblock on the Exit closest to the Final Girl. Victims cannot be saved there. Draw an Event.",
  },
  {
    name: "They Just Got Hit by a Car!",
    effect:
      "If no Street has Victims, replace this Terror card. Otherwise kill one chosen Street Victim, then target the closest Victim, move and attack.",
  },
  {
    name: "We Are All Gonna Die!",
    effect:
      "Twice, target the closest Victim, move and attack. If no Victims were killed, increase Bloodlust twice.",
  },
  {
    name: "Did You Hear What Happened on Maple Lane?",
    effect: "Draw an Event, then another Event, then the next Terror card.",
  },
].map((card) => ({
  ...card,
  location: "Maple Lane",
  source: "Owner photo IMG_9354.jpg",
}));
export const MAPLE_ITEMS = [
  {
    id: "crucifix",
    name: "Crucifix",
    copies: 3,
    effect:
      "Discard to ignore a Horror increase OR stop an Enemy’s movement when it is adjacent.",
  },
  {
    id: "bow",
    name: "Archery Bow",
    copies: 1,
    effect:
      "Range 1–2, one damage, three uses. Use without an Action card: spend two Time to shoot at a Street space within range.",
  },
  {
    id: "rifle",
    name: "Rifle",
    copies: 1,
    effect:
      "Range 1–3, two damage, two uses. Use without an Action card. Spend one Time for a Horror Roll; success deals two damage to one Enemy on a Street within range.",
  },
  {
    id: "pitchfork",
    name: "Pitchfork",
    copies: 1,
    effect:
      "Range 0, one damage. Discard at any time to prevent damage from one attack; this is not unpreventable Health loss.",
  },
  {
    id: "lid",
    name: "Trashcan Lid",
    copies: 1,
    effect: "Three uses. Ignore one damage per use.",
  },
  {
    id: "megaphone",
    name: "Megaphone",
    copies: 1,
    effect:
      "Once per Action phase, move any Victim one space. Then the Killer targets the Final Girl and moves; there is no Attack icon.",
  },
  {
    id: "machete",
    name: "Machete",
    copies: 1,
    effect:
      "Range 0, two damage. Victims do not follow while the Machete is in your hand.",
  },
  {
    id: "drink",
    name: "Energy Drink",
    copies: 1,
    effect:
      "Discard during the Action phase to gain three Time OR move one space.",
  },
  {
    id: "dice",
    name: "Lucky Dice",
    copies: 1,
    effect: "Discard to reroll any or all of your dice.",
  },
  {
    id: "fireworks",
    name: "Fireworks",
    copies: 1,
    effect:
      "Spend two Time to place the token in your space or an adjacent non-House space. Whenever the Killer chooses a target it chooses Fireworks instead. Remove the token when the Killer enters its space.",
  },
  {
    id: "odds",
    name: "Odds and Ends",
    copies: 1,
    effect:
      "Three uses. While in a House, place a Booby Trap there, at most one per House. When an Enemy moves into it, discard the trap token and deal two damage to that Enemy.",
  },
  { id: "knife", name: "Knife", copies: 1, effect: "Range 0, one damage." },
  {
    id: "bicycle",
    name: "Bicycle",
    copies: 1,
    effect:
      "When taking the card, place Bicycle in the adjacent Street. With empty hands and sharing its space, once per turn move yourself and Bicycle to any other Street.",
  },
  {
    id: "bible",
    name: "Bible",
    copies: 1,
    effect:
      "Roll two additional dice when resolving Convince, not two automatic successes.",
  },
] as const;
export type MapleValue = string | number | boolean | null;
export type MapleState = Record<string, MapleValue>;
const member = (list: readonly { id: string }[], value: unknown) =>
  list.some((x) => x.id === value);
const peopleStates = ["in-play", "saved", "killed", "removed"];
export function validMapleField(key: string, value: unknown): boolean {
  const [group, id] = key.split(".");
  const values = (options: readonly unknown[]) =>
    value === null || options.includes(value);
  if (
    group === "house" &&
    key.split(".").length === 2 &&
    member(MAPLE_HOUSES, id)
  )
    return values([true, false]);
  if (
    group === "trap" &&
    key.split(".").length === 2 &&
    member(MAPLE_HOUSES, id)
  )
    return values(["placed", "triggered", "not-placed"]);
  if (
    group === "exit" &&
    key.split(".").length === 2 &&
    MAPLE_EXITS.some((x) => x === id)
  )
    return values([true, false]);
  if (
    group === "person" &&
    key.split(".").length === 2 &&
    member(MAPLE_PEOPLE, id)
  )
    return values(peopleStates);
  if (
    group === "event" &&
    key.split(".").length === 2 &&
    member(MAPLE_EVENTS, id)
  )
    return values(["active", "ended"]);
  if (key === "fire") return values(["none", "ne-boyfriend", "sw-smalley"]);
  if (key === "fireworks" || key === "bicycle")
    return values([
      "none",
      ...(key === "fireworks" ? ["spent"] : []),
      ...MAPLE_STREETS.map((s) => s.id),
    ]);
  if (key === "cop.status") return values(["absent", "on-route", "exited"]);
  if (key === "cop.origin") return values(MAPLE_EXITS);
  if (key === "cop.step") return values([0, 1, 2, 3, 4]);
  return false;
}
export function maplePersonChange(
  state: MapleState,
  id: string,
  value: string | null,
): MapleState {
  const person = MAPLE_PEOPLE.find((p) => p.id === id);
  if (!person || !validMapleField(`person.${id}`, value)) return {};
  return mapleLinkedChange(state, { [`person.${id}`]: value });
}
/** Recalculate linked card status against the durable state, not a stale render. */
export function mapleLinkedChange(
  state: MapleState,
  changes: MapleState,
): MapleState {
  const result = { ...changes },
    next = { ...state, ...changes };
  for (const event of ["boyfriend", "smalleys"]) {
    const members = MAPLE_PEOPLE.filter((p) => p.event === event);
    if (
      !members.some((p) =>
        Object.prototype.hasOwnProperty.call(changes, `person.${p.id}`),
      )
    )
      continue;
    const present = members.some((p) => next[`person.${p.id}`] === "in-play");
    const complete = members.every(
      (p) => typeof next[`person.${p.id}`] === "string",
    );
    result[`event.${event}`] = present ? "active" : complete ? "ended" : null;
  }
  return result;
}
export function mapleStartingObservations(
  startingEvent?: string | null,
): MapleState[] {
  const baseline: MapleState = Object.fromEntries(
    MAPLE_HOUSES.map((h) => [`house.${h.id}`, false]),
  );
  const props: MapleState = {
    fire: "none",
    fireworks: "none",
    bicycle: "none",
    "cop.status": "absent",
    ...Object.fromEntries(MAPLE_EXITS.map((e) => [`exit.${e}`, false])),
    ...Object.fromEntries(
      MAPLE_HOUSES.map((h) => [`trap.${h.id}`, "not-placed"]),
    ),
  };
  const event = MAPLE_EVENTS.find(
    (e) => e.name.replace(/’/g, "'") === startingEvent?.replace(/’/g, "'"),
  );
  const selected: MapleState = {};
  if (
    event &&
    [
      "neighbors",
      "boyfriend",
      "smalleys",
      "fire",
      "construction",
      "kopp",
    ].includes(event.id)
  ) {
    selected[`event.${event.id}`] = "active";
    for (const person of MAPLE_PEOPLE.filter((p) => p.event === event.id))
      selected[`person.${person.id}`] = "in-play";
    // The card is known; its roll/placement has not yet been recorded.
    if (event.id === "fire") props.fire = null;
    if (event.id === "kopp") props["cop.status"] = null;
    if (event.id === "construction")
      for (const exit of MAPLE_EXITS) props[`exit.${exit}`] = null;
  }
  return [baseline, props, ...(Object.keys(selected).length ? [selected] : [])];
}
export function copRoute(origin: string): readonly string[] {
  const opposite: Record<string, string> = {
    north: "south",
    south: "north",
    east: "west",
    west: "east",
  };
  return opposite[origin]
    ? [
        `${origin}-exit`,
        `${origin}-inner`,
        "intersection",
        `${opposite[origin]}-inner`,
        `${opposite[origin]}-exit`,
      ]
    : [];
}
export function startCop(origin: string): MapleState {
  return copRoute(origin).length
    ? {
        "cop.origin": origin,
        "cop.step": 0,
        "cop.status": "on-route",
        "event.kopp": "active",
      }
    : {};
}
export function advanceCop(state: MapleState): MapleState {
  if (
    state["cop.status"] !== "on-route" ||
    !copRoute(String(state["cop.origin"])).length ||
    typeof state["cop.step"] !== "number" ||
    state["cop.step"] < 0 ||
    state["cop.step"] >= 4
  )
    return {};
  const step = state["cop.step"] + 1;
  return {
    "cop.step": step,
    "cop.status": step === 4 ? "exited" : "on-route",
    "event.kopp": step === 4 ? "ended" : "active",
  };
}
export function mapleLabel(key: string): string {
  const [group, id] = key.split(".");
  if (group === "house" || group === "trap")
    return `${MAPLE_HOUSES.find((h) => h.id === id)?.name ?? id} ${group === "house" ? "searched" : "Booby Trap"}`;
  if (group === "exit") return `${id} Exit blocked for rescue`;
  if (group === "person")
    return MAPLE_PEOPLE.find((p) => p.id === id)?.name ?? id;
  if (group === "event")
    return MAPLE_EVENTS.find((e) => e.id === id)?.name ?? id;
  return (
    (
      {
        fire: "Burning House",
        fireworks: "Fireworks",
        bicycle: "Bicycle",
        "cop.origin": "Cop Car origin",
        "cop.step": "Cop Car step",
        "cop.status": "Cop Car",
      } as Record<string, string>
    )[key] ?? key
  );
}
export function mapleValue(key: string, value: MapleValue): string {
  if (value === null) return "not recorded";
  if (key === "fire")
    return MAPLE_HOUSES.find((h) => h.id === value)?.name ?? String(value);
  if (key === "fireworks" || key === "bicycle")
    return MAPLE_STREETS.find((s) => s.id === value)?.name ?? String(value);
  return String(value);
}
/** Facts, not effects. Preserve unknowns and never insert unrecorded casualties. */
export function mapleStoryFacts(state: MapleState): string[] {
  const facts: string[] = [];
  if (typeof state.fire === "string" && state.fire !== "none")
    facts.push(`Burning: ${mapleValue("fire", state.fire)}.`);
  const blocked = MAPLE_EXITS.filter((e) => state[`exit.${e}`] === true);
  if (blocked.length)
    facts.push(
      `Rescue blocked at ${blocked.join(", ")} Exit(s); movement is not blocked.`,
    );
  for (const p of MAPLE_PEOPLE)
    if (typeof state[`person.${p.id}`] === "string")
      facts.push(`${p.name}: ${state[`person.${p.id}`]}.`);
  if (state["cop.status"] === "on-route") {
    const route = copRoute(String(state["cop.origin"]));
    const space =
      typeof state["cop.step"] === "number"
        ? route[state["cop.step"]]
        : undefined;
    facts.push(
      `Cop Car: ${MAPLE_STREETS.find((s) => s.id === space)?.name ?? "position not recorded"}; no rescues inferred.`,
    );
  } else if (state["cop.status"] === "exited")
    facts.push("Cop Car exited; victim totals remain separate.");
  for (const key of ["fireworks", "bicycle"] as const)
    if (typeof state[key] === "string" && state[key] !== "none")
      facts.push(`${mapleLabel(key)}: ${mapleValue(key, state[key])}.`);
  const traps = MAPLE_HOUSES.filter((h) => state[`trap.${h.id}`] === "placed");
  if (traps.length)
    facts.push(
      `Booby Traps: ${traps.map((h) => h.name).join(", ")}. Placement does not establish damage.`,
    );
  const houses = MAPLE_HOUSES.filter(
    (h) => typeof state[`house.${h.id}`] === "boolean",
  );
  if (houses.length)
    facts.push(
      `Houses searched: ${houses.filter((h) => state[`house.${h.id}`]).length}/${houses.length} recorded.`,
    );
  if (state["event.neighbors"] === "active")
    facts.push("Friendly Neighbors active: one extra Convince die.");
  return facts;
}
