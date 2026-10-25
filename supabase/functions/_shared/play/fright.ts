/** Standard Dr. Fright: owner photos IMG_9345–IMG_9349. Terror deck verified from IMG_9350; starting Action confirmed by owner. */
export const FRIGHT_SOURCE =
  "Owner photos IMG_9345–IMG_9350 (standard mode); starting Action confirmed by owner October 24, 2026";
export const FRIGHT_VISUAL =
  "Dr. Fright is a grotesque stocky middle-aged man with scarred pockmarked skin, milky-white eyes, thinning disheveled brown hair, ragged mustard-yellow work clothes and a rusty three-tined pitchfork. He is the supernatural Dream Doctor, not a farmer or masked slasher. Preserve the selected physical Location. The tracked Boiler Room sequence belongs to the Final Girl. Victims remain in the physical Location while experiencing their own private nightmares. Never expose an unresolved Boiler Room card or invent a recorded attack or injury.";
export const FRIGHT_POWERS = [
  {
    id: "pitchfork-assault",
    name: "Pitchfork Assault",
    effect:
      "Each time Dr. Fright damages the Final Girl, increase Horror by one. Record damage and Horror separately.",
  },
  {
    id: "frightmare-inevitable",
    name: "The Frightmare Is Inevitable",
    effect:
      "Dr. Fright may attack the Final Girl even while she is Awake. This does not let her attack him while Awake.",
  },
  {
    id: "never-really-dead",
    name: "Never Really Dead",
    effect:
      "When revealed, replace Dr. Fright’s black Final Health token with a white one from the reserve. If he loses his last Health, reveal three black Final Health tokens from the reserve and restore his Health accordingly. Resolve the physical tokens and record the resulting Health explicitly.",
  },
  {
    id: "shock-factor",
    name: "Shock Factor",
    epic: true,
    effect:
      "A Victim who would panic is killed instead, up to three per turn. Choose and record the actual casualties; no automatic changes to victim totals or Bloodlust.",
  },
] as const;
export const FRIGHT_FINALES = [
  {
    id: "face-your-fright",
    name: "Face Your Fright",
    effect:
      "When revealed, fall Asleep if Awake. While this Finale is in play, remain Asleep for the rest of the game and reset the Boiler Room immediately on exiting it. Killer Action: target the closest Final Girl or Victim, move, then attack.",
  },
  {
    id: "time-to-die",
    name: "Time to Die",
    effect:
      "During Upkeep, if Awake, lose two Health and fall Asleep. Killer Action: target the Final Girl, move, then attack twice. Resolve Health loss physically and record falling Asleep explicitly.",
  },
  {
    id: "everyone-must-die",
    name: "Everyone Must Die",
    effect:
      "When revealed, remove Dr. Fright from the board and place him on this Finale. While Asleep, the Final Girl may attack him from any space. Killer Action: choose and kill two Victims automatically; if none remain, the Final Girl loses four Health. Record actual outcomes separately.",
  },
] as const;

/** Starting action has no movement symbol (owner confirmation, October 24). */
export const FRIGHT_STARTING_ACTION =
  "Target the closest Final Girl or Victim, then attack. No movement.";
export const FRIGHT_MINOR_POWERS = [
  {
    id: "hellish-pursuit",
    name: "Hellish Pursuit",
    health: 2,
    effect:
      "While Asleep, resolve one additional Boiler Room card at the end of the Killer phase, if able.",
  },
  {
    id: "endless-sleep",
    name: "Endless Sleep",
    health: 1,
    effect:
      "When revealed, fall Asleep. While active, remain Asleep and reset the Boiler Room immediately after exiting it.",
  },
] as const;
export type FrightMinor = (typeof FRIGHT_MINOR_POWERS)[number]["id"];
/** Explicit, player-ended reminders: there is no automatic phase engine. */
export const FRIGHT_CONDITIONS = [
  {
    id: "blurred-reality",
    name: "Blurred Reality",
    effect:
      "Until the next Killer phase, you and Dr. Fright may damage each other even while Awake.",
  },
  {
    id: "better-lock-the-door",
    name: "Better Lock the Door",
    effect:
      "During the next Action phase, you may not enter a Search space occupied by a Victim.",
  },
  {
    id: "marked-for-death",
    name: "Marked for Death",
    effect:
      "Until the next Killer phase, all Victims in your space immediately panic.",
  },
  {
    id: "better-stay-up-late",
    name: "Better Stay Up Late",
    effect:
      "If drawn while Awake: roll one fewer die for Horror rolls during the next Action phase, minimum one die.",
  },
  {
    id: "never-sleep-again",
    name: "Never Sleep Again",
    effect:
      "If already Asleep and you declined the optional reset: resolve one additional Boiler Room card at the end of this Killer phase.",
  },
] as const;
export type FrightCondition = (typeof FRIGHT_CONDITIONS)[number]["id"];
export const FRIGHT_TERRORS = [
  {
    id: "blurred-reality",
    name: "Blurred Reality",
    effect:
      FRIGHT_CONDITIONS[0].effect +
      " Then target the closest Final Girl or Victim, move and attack.",
  },
  {
    id: "better-lock-the-door",
    name: "Better Lock the Door",
    effect:
      "Target the Final Girl and move. Then target the closest Final Girl or Victim and attack. " +
      FRIGHT_CONDITIONS[1].effect,
  },
  {
    id: "marked-for-death",
    name: "Marked for Death",
    effect:
      FRIGHT_CONDITIONS[2].effect +
      " Target the Final Girl and move, then target the closest Final Girl or Victim and attack. If Dr. Fright did not attack you and you are Awake, fall Asleep.",
  },
  {
    id: "im-so-sleepy",
    name: "I’m So Sleepy...",
    effect:
      "If Awake, roll a die; fall Asleep if the result is below the current Horror level. If Asleep instead, resolve one Boiler Room card and increase Horror by one if it damages you. Then target the closest Victim and move.",
  },
  {
    id: "better-stay-up-late",
    name: "Better Stay Up Late",
    effect:
      FRIGHT_CONDITIONS[3].effect +
      " If drawn while Asleep instead, immediately resolve all remaining Boiler Room cards. Then target the closest Final Girl or Victim, move and attack.",
  },
  {
    id: "slash-her",
    name: "Slash Her",
    effect:
      "Target the closest Final Girl or Victim and attack. Then target the closest Final Girl or Victim, move and attack. Panic every Victim outside a Search space.",
  },
  {
    id: "already-dead",
    name: "Didn’t You Know They Were Already Dead?",
    effect:
      "If no Victims have been saved or your Final Girl card has been flipped, replace this card with the next Terror card. Otherwise remove one Victim from a Saved Victim space on your Final Girl card, then target the closest Victim, move and attack. Removing a saved Victim is not automatically a new death.",
  },
  {
    id: "own-fingers",
    name: "OMG... He’s Slicing Off His Own Fingers!",
    effect:
      "Target the closest Final Girl or Victim and move twice. Dr. Fright takes one damage unless he has only a Final Health token remaining. If he took damage, increase Horror by three, then panic the Final Girl and all Victims in his space.",
  },
  {
    id: "youre-dead",
    name: "But You Can’t Be Here... You’re Dead!",
    effect:
      "With zero dead Victims, fall Asleep; with one to three, add one Bloodlust; with four or more, add two Bloodlust. Then target the closest Final Girl or Victim, move and attack.",
  },
  {
    id: "grab-your-crucifix",
    name: "Grab Your Crucifix",
    effect:
      "You may discard a Crucifix you possess to ignore the rest of this card. Otherwise target the closest Final Girl or Victim, move and attack, then repeat that complete action. Selecting this card does not establish Crucifix possession or use.",
  },
  {
    id: "never-sleep-again",
    name: "Never Sleep Again",
    effect:
      "Increase Horror by one, then fall Asleep. If already Asleep, you may reset the Boiler Room deck; if you decline, resolve one additional Boiler Room card at the end of the Killer phase.",
  },
  {
    id: "disgusting",
    name: "Ewwwww! He’s Disgusting!",
    effect: "Increase Horror by two.",
  },
  {
    id: "if-this-is-a-dream",
    name: "But If This Is a Dream Then I Can...",
    effect:
      "If Awake, replace this card with the next Terror card. Otherwise you may add one Bloodlust to choose one: take the top Item from any deck, move to any space, or gain four Time.",
  },
  {
    id: "frankys-coming",
    name: "Franky’s Coming for You",
    effect:
      "With no Victims on the board, replace this card with the next Terror card. Otherwise target the closest Victim and move. If Dr. Fright shares a space with a Victim, increase Horror by two; otherwise increase it by one.",
  },
  ...FRIGHT_MINOR_POWERS.map((p) => ({
    id: p.id,
    name: p.name,
    effect: p.effect,
  })),
].map((card) => ({
  ...card,
  killer: "Dr. Fright",
  source: "Owner photo IMG_9350.jpg",
}));

export const DIRECTIONS = ["U", "D", "L", "R"] as const;
export type Direction = (typeof DIRECTIONS)[number];
export const DIRECTION_NAMES: Record<Direction, string> = {
  U: "up",
  D: "down",
  L: "left",
  R: "right",
};
export const REVEAL_NAMES: Record<Direction, string> = {
  U: "bottom",
  D: "top",
  L: "right",
  R: "left",
};
export const QUADRANTS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;
export type Point = { x: number; y: number };
export const STEP: Record<Direction, Point> = {
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
};
const cells: Point[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];
const covers = (p: Point, cell: Point) =>
  p.x <= cell.x && p.y <= cell.y && p.x + 2 > cell.x && p.y + 2 > cell.y;
/** Every slide moves the cover AND previously exposed cards; unresolved cards stay put.
 * Unit = half a card. Higher cards occlude lower cards, including quarter reveals. */
export function boilerGeometry(path: string) {
  let cover: Point = { x: 0, y: 0 };
  const cards: Point[] = [];
  for (const direction of path as Iterable<Direction>) {
    if (!STEP[direction] || cards.length === 4) return null;
    const step = STEP[direction];
    cover = { x: cover.x + step.x, y: cover.y + step.y };
    for (const card of cards) {
      card.x += step.x;
      card.y += step.y;
    }
    if (cells.every((cell) => [cover, ...cards].some((p) => covers(p, cell))))
      return null;
    cards.push({ x: 0, y: 0 });
  }
  const visible = cards.map((card, i) =>
    cells.flatMap((cell, q) =>
      [cover, ...cards.slice(0, i)].some((p) =>
        covers(p, { x: card.x + cell.x, y: card.y + cell.y }),
      )
        ? []
        : [q],
    ),
  );
  return { cover, cards, visible };
}
export const legalDirections = (path: string) =>
  path.length >= 4
    ? []
    : DIRECTIONS.filter((d) => boilerGeometry(path + d) !== null);
export function validDeal(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-3]{4}$/.test(value) &&
    new Set(value).size === 4
  );
}
/** Uniform rejection sampling, avoiding modulo bias. Called only for a committed new deal. */
export function shuffleBoilerRoom() {
  const cards = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const max = 256 - (256 % (i + 1));
    let n: number;
    do {
      n = crypto.getRandomValues(new Uint8Array(1))[0];
    } while (n >= max);
    const j = n % (i + 1);
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.join("");
}
export function boilerAttack(deal: string, path: string) {
  const geometry = boilerGeometry(path);
  return (
    validDeal(deal) &&
    Boolean(
      path.length &&
        geometry?.visible[path.length - 1].includes(
          Number(deal[path.length - 1]),
        ),
    )
  );
}

export const FRIGHT_COMMANDS = [
  "setup",
  "digital",
  "physical",
  "awake",
  "asleep",
  "slide",
  "defended",
  "reset",
  "effect",
  "minor",
  "condition",
  "reshuffle",
] as const;
export type FrightCommand = (typeof FRIGHT_COMMANDS)[number];
export interface FrightSnapshot {
  v: 1;
  parent: string;
  command: FrightCommand;
  mode: "digital" | "physical";
  sleep: "awake" | "asleep" | "unknown";
  cycle: number;
  deal: string;
  reserve: string;
  path: string;
  pending: boolean;
  lastPath: string;
  lastDeal: string;
  effects: string[];
  minor?: Partial<Record<FrightMinor, number>>;
  conditions?: Partial<Record<FrightCondition, boolean>>;
}
export interface FrightObservation {
  id?: string;
  kind: string;
  moduleData?: { module: string; changes: Record<string, unknown> };
  momentType?: string;
  killerCard?: string;
}
export type FrightState = FrightSnapshot & { eventId: string };
/** A safe completed trip stays on the table until the player chooses Awake.
 * The prepared next shuffle remains concealed, just like the existing reserve. */
export function boilerAwaitingWake(state: FrightSnapshot, forced = false) {
  return (
    !forced &&
    state.mode === "digital" &&
    state.sleep === "asleep" &&
    !state.path &&
    state.lastPath.length === 4 &&
    !boilerAttack(state.lastDeal, state.lastPath)
  );
}
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseFright(value: unknown): FrightSnapshot | null {
  if (typeof value !== "string" || value.length > 2400) return null;
  try {
    const s = JSON.parse(value) as FrightSnapshot;
    if (
      !s ||
      Object.keys(s)
        .filter((k) => k !== "minor" && k !== "conditions")
        .sort()
        .join() !==
        "command,cycle,deal,effects,lastDeal,lastPath,mode,parent,path,pending,reserve,sleep,v" ||
      s.v !== 1 ||
      !(s.parent === "root" || uuid.test(s.parent)) ||
      !FRIGHT_COMMANDS.includes(s.command) ||
      !["digital", "physical"].includes(s.mode) ||
      !["awake", "asleep", "unknown"].includes(s.sleep) ||
      !Number.isInteger(s.cycle) ||
      s.cycle < 0 ||
      s.cycle > 999 ||
      typeof s.pending !== "boolean" ||
      typeof s.path !== "string" ||
      !/^[UDLR]{0,4}$/.test(s.path) ||
      !boilerGeometry(s.path) ||
      !(
        (s.lastPath === "" && s.lastDeal === "") ||
        (typeof s.lastPath === "string" &&
          /^[UDLR]{4}$/.test(s.lastPath) &&
          boilerGeometry(s.lastPath) &&
          validDeal(s.lastDeal))
      ) ||
      !Array.isArray(s.effects) ||
      s.effects.length > 20 ||
      new Set(s.effects).size !== s.effects.length ||
      s.effects.some(
        (key) =>
          typeof key !== "string" ||
          !/^[0-9a-f-]{36}:(face-your-fright|everyone-must-die|never-really-dead)$/.test(
            key,
          ),
      )
    )
      return null;
    if (
      s.minor !== undefined &&
      (!s.minor ||
        typeof s.minor !== "object" ||
        Array.isArray(s.minor) ||
        Object.entries(s.minor).some(([id, value]) => {
          const card = FRIGHT_MINOR_POWERS.find((p) => p.id === id);
          return (
            !card ||
            !Number.isInteger(value) ||
            value < 0 ||
            value > card.health
          );
        }))
    )
      return null;
    if (
      s.conditions !== undefined &&
      (!s.conditions ||
        typeof s.conditions !== "object" ||
        Array.isArray(s.conditions) ||
        Object.entries(s.conditions).some(
          ([id, value]) =>
            !FRIGHT_CONDITIONS.some((c) => c.id === id) ||
            typeof value !== "boolean",
        ))
    )
      return null;
    if (
      s.mode === "digital"
        ? !validDeal(s.deal) || !validDeal(s.reserve) || s.sleep === "unknown"
        : s.deal !== "" ||
          s.reserve !== "" ||
          s.path !== "" ||
          s.pending ||
          s.lastPath !== ""
    )
      return null;
    if (s.pending && (s.sleep !== "asleep" || !boilerAttack(s.deal, s.path)))
      return null;
    if (s.path.length === 4 && !s.pending) return null;
    if (s.sleep !== "asleep" && (s.path || s.pending)) return null;
    return s;
  } catch {
    return null;
  }
}
export function validFrightChanges(changes: Record<string, unknown>) {
  return (
    Object.keys(changes).length === 1 && parseFright(changes.snapshot) !== null
  );
}
/** Parent links make later dependent steps inactive when any earlier step is undone. */
export function frightState(
  entries: readonly FrightObservation[],
): FrightState | null {
  let current: FrightState | null = null;
  for (const e of entries) {
    if (e.kind !== "module" || e.moduleData?.module !== "fright" || !e.id)
      continue;
    const snapshot = parseFright(e.moduleData.changes.snapshot);
    if (snapshot && snapshot.parent === (current?.eventId ?? "root"))
      current = { ...snapshot, eventId: e.id };
  }
  return current;
}
export function frightCards(entries: readonly FrightObservation[]) {
  const power = entries.find(
    (e) => e.kind === "moment" && e.momentType === "dark-power",
  );
  const finale = entries.find(
    (e) => e.kind === "moment" && e.momentType === "finale",
  );
  return {
    power: FRIGHT_POWERS.find((c) => c.name === power?.killerCard),
    finale: FRIGHT_FINALES.find((c) => c.name === finale?.killerCard),
    powerEvent: power?.id,
    finaleEvent: finale?.id,
  };
}
export function initialFright(): FrightSnapshot {
  return {
    v: 1,
    parent: "root",
    command: "setup",
    mode: "physical",
    sleep: "awake",
    cycle: 0,
    deal: "",
    reserve: "",
    path: "",
    pending: false,
    lastPath: "",
    lastDeal: "",
    effects: [],
  };
}
export type FrightAction = {
  command: FrightCommand;
  direction?: Direction;
  effect?: string;
  minor?: FrightMinor;
  health?: number | null;
  condition?: FrightCondition;
  active?: boolean | null;
};
/** Raw history is used ONLY to reuse previously dealt randomness after Undo. Never render it. */
export function frightTransition(
  current: FrightState | null,
  action: FrightAction,
  raw: readonly FrightObservation[],
  entries: readonly FrightObservation[],
  shuffle: (kind?: "deal" | "reserve") => string = shuffleBoilerRoom,
): FrightSnapshot | null {
  const { eventId: _id, ...base } = current ?? {
    ...initialFright(),
    sleep: "unknown" as const,
    eventId: "root",
  };
  const next: FrightSnapshot = {
    ...base,
    parent: current?.eventId ?? "root",
    command: action.command,
    effects: [...base.effects],
  };
  const forced = frightForcedSleep(entries);
  const history = raw.flatMap((e) =>
    e.moduleData?.module === "fright"
      ? ([parseFright(e.moduleData.changes.snapshot)].filter(
          Boolean,
        ) as FrightSnapshot[])
      : [],
  );
  const fresh = (cycle: number, deal?: string) => {
    const prior = history.find(
      (s) =>
        s.mode === "digital" && s.cycle === cycle && (!deal || s.deal === deal),
    );
    next.cycle = cycle;
    next.deal = deal ?? prior?.deal ?? shuffle("deal");
    next.reserve = prior?.reserve ?? shuffle("reserve");
    next.path = "";
    next.pending = false;
    next.lastPath = "";
    next.lastDeal = "";
  };
  const finish = () => {
    const path = next.path;
    fresh(base.cycle + 1, base.reserve);
    next.lastPath = path;
    next.lastDeal = base.deal;
    next.sleep = forced || action.command === "slide" ? "asleep" : "awake";
  };
  if (base.pending && action.command !== "defended") return null;
  switch (action.command) {
    case "setup":
      return null;
    case "digital":
      if (base.mode === "digital" || base.sleep === "asleep") return null;
      next.mode = "digital";
      next.sleep = forced ? "asleep" : "awake";
      fresh(base.cycle + 1);
      break;
    case "physical":
      if (base.mode !== "digital" || base.sleep !== "awake" || base.path)
        return null;
      next.mode = "physical";
      next.deal = "";
      next.reserve = "";
      next.lastPath = "";
      next.lastDeal = "";
      break;
    case "awake":
      if (forced || base.sleep === "awake") return null;
      // A deliberate wake ends a partial digital trip atomically. Promote the
      // already shuffled reserve; Undo must reuse it rather than reroll it.
      if (base.mode === "digital" && base.path)
        fresh(base.cycle + 1, base.reserve);
      next.sleep = "awake";
      break;
    case "asleep":
      if (base.sleep === "asleep") return null;
      next.sleep = "asleep";
      next.lastPath = "";
      next.lastDeal = "";
      break;
    case "slide":
      if (
        base.mode !== "digital" ||
        base.sleep !== "asleep" ||
        boilerAwaitingWake(base, forced) ||
        !action.direction ||
        !legalDirections(base.path).includes(action.direction)
      )
        return null;
      next.path += action.direction;
      next.pending = boilerAttack(base.deal, next.path);
      if (next.path.length === 4 && !next.pending) finish();
      break;
    case "defended":
      if (!base.pending) return null;
      next.pending = false;
      if (next.path.length === 4) finish();
      break;
    case "reset":
      if (base.sleep === "unknown") return null;
      next.sleep = "asleep";
      if (base.mode === "digital") fresh(base.cycle + 1);
      break;
    case "minor": {
      const card = FRIGHT_MINOR_POWERS.find((p) => p.id === action.minor);
      if (
        !card ||
        action.health === undefined ||
        (action.health !== null &&
          (!Number.isInteger(action.health) ||
            action.health < 0 ||
            action.health > card.health)) ||
        base.minor?.[card.id] === (action.health ?? undefined)
      )
        return null;
      next.minor = { ...base.minor };
      if (action.health === null) delete next.minor[card.id];
      else next.minor[card.id] = action.health;
      if (
        card.id === "endless-sleep" &&
        (action.health ?? 0) > 0 &&
        (base.minor?.[card.id] ?? 0) === 0
      )
        next.sleep = "asleep";
      // A forced completion already promoted the next deck. Removing the lock
      // must not redisplay the previous completed trip as an unacknowledged wake.
      if (
        card.id === "endless-sleep" &&
        (action.health ?? 0) === 0 &&
        (base.minor?.[card.id] ?? 0) > 0 &&
        !base.path
      ) {
        next.lastPath = "";
        next.lastDeal = "";
      }
      if (!Object.keys(next.minor).length) delete next.minor;
      break;
    }
    case "condition": {
      const card = FRIGHT_CONDITIONS.find((p) => p.id === action.condition);
      if (
        !card ||
        action.active === undefined ||
        (action.active !== null && typeof action.active !== "boolean") ||
        base.conditions?.[card.id] === (action.active ?? undefined)
      )
        return null;
      next.conditions = { ...base.conditions };
      if (action.active === null) delete next.conditions[card.id];
      else next.conditions[card.id] = action.active;
      if (!Object.keys(next.conditions).length) delete next.conditions;
      break;
    }
    case "reshuffle":
      if (base.mode !== "digital" || base.sleep !== "asleep") return null;
      fresh(base.cycle + 1, base.reserve);
      if (base.conditions?.["never-sleep-again"])
        next.conditions = { ...base.conditions, "never-sleep-again": false };
      break;
    case "effect": {
      const cards = frightCards(entries);
      const available = [
        `${cards.finaleEvent}:${cards.finale?.id}`,
        `${cards.powerEvent}:${cards.power?.id}`,
      ];
      if (
        !action.effect ||
        !available.includes(action.effect) ||
        base.effects.includes(action.effect) ||
        !/:(face-your-fright|everyone-must-die|never-really-dead)$/.test(
          action.effect,
        )
      )
        return null;
      next.effects.push(action.effect);
      if (action.effect.endsWith(":face-your-fright")) next.sleep = "asleep";
      break;
    }
  }
  return parseFright(JSON.stringify(next));
}
/** Durable write boundary: a stale render or forged full snapshot cannot skip a card,
 * acknowledge an absent attack or replace a deal that is already in raw history. */
export function validFrightSuccessor(
  proposed: FrightSnapshot,
  raw: readonly FrightObservation[],
  entries: readonly FrightObservation[],
) {
  const current = frightState(entries);
  if (proposed.command === "setup")
    return (
      !current && JSON.stringify(proposed) === JSON.stringify(initialFright())
    );
  const path = proposed.path || proposed.lastPath;
  const added = proposed.effects.filter(
    (effect) => !current?.effects.includes(effect),
  );
  const minor = FRIGHT_MINOR_POWERS.find(
    (p) => proposed.minor?.[p.id] !== current?.minor?.[p.id],
  );
  const condition = FRIGHT_CONDITIONS.find(
    (p) => proposed.conditions?.[p.id] !== current?.conditions?.[p.id],
  );
  const expected = frightTransition(
    current,
    {
      command: proposed.command,
      direction: path[path.length - 1] as Direction,
      effect: added.length === 1 ? added[0] : undefined,
      minor: minor?.id,
      health: minor ? (proposed.minor?.[minor.id] ?? null) : undefined,
      condition: condition?.id,
      active: condition
        ? (proposed.conditions?.[condition.id] ?? null)
        : undefined,
    },
    raw,
    entries,
    (kind) => (kind === "deal" ? proposed.deal : proposed.reserve),
  );
  return Boolean(
    expected &&
      Object.keys(expected).every(
        (key) =>
          JSON.stringify(expected[key as keyof FrightSnapshot]) ===
          JSON.stringify(proposed[key as keyof FrightSnapshot]),
      ),
  );
}
export function frightForcedSleep(entries: readonly FrightObservation[]) {
  return (
    frightCards(entries).finale?.id === "face-your-fright" ||
    (frightState(entries)?.minor?.["endless-sleep"] ?? 0) > 0
  );
}
export function frightSleepReason(entries: readonly FrightObservation[]) {
  return [
    frightCards(entries).finale?.id === "face-your-fright"
      ? "Face Your Fright"
      : "",
    (frightState(entries)?.minor?.["endless-sleep"] ?? 0) > 0
      ? "Endless Sleep"
      : "",
  ]
    .filter(Boolean)
    .join(" and ");
}
/** Safe projection only. Internal deals, parents, effect IDs and paths never enter prose/cache identity. */
export function frightPublic(entries: readonly FrightObservation[]) {
  const state = frightState(entries);
  const cards = frightCards(entries);
  // Older free-text reveals must not acquire a new context/hash merely because
  // this catalog now recognizes their names. Explicit module observations opt in.
  if (!state) return undefined;
  return {
    sleep: state?.sleep ?? "unknown",
    ...(state?.sleep === "asleep" && state.mode === "digital"
      ? { boilerCardsResolved: state.path.length, attackPending: state.pending }
      : {}),
    ...Object.fromEntries(
      FRIGHT_MINOR_POWERS.filter((p) => state.minor?.[p.id] !== undefined).map(
        (p) => [`minor.${p.id}.health`, state.minor![p.id]!],
      ),
    ),
    ...Object.fromEntries(
      FRIGHT_CONDITIONS.filter((c) => state.conditions?.[c.id] === true).map(
        (c) => [`condition.${c.id}`, true],
      ),
    ),
    ...(cards.power ? { power: cards.power.id } : {}),
    ...(cards.finale ? { finale: cards.finale.id } : {}),
  };
}
export function describeFright(snapshot: FrightSnapshot) {
  switch (snapshot.command) {
    case "minor":
      return (
        "Minor Dark Power health updated: " +
        FRIGHT_MINOR_POWERS.map(
          (p) =>
            `${p.name}: ${snapshot.minor?.[p.id] === undefined ? "not recorded" : `${snapshot.minor[p.id]}/${p.health}`}`,
        ).join("; ") +
        "."
      );
    case "condition":
      return (
        "Temporary Dr. Fright effects: " +
        (FRIGHT_CONDITIONS.filter((c) => snapshot.conditions?.[c.id])
          .map((c) => c.name)
          .join(", ") || "none recorded active") +
        "."
      );
    case "reshuffle":
      return "Reset the Boiler Room while remaining Asleep.";
    case "slide":
      return `Boiler Room card ${snapshot.path.length || 4} resolved${snapshot.pending ? ": Dr. Fright attacks" : ""}.`;
    case "defended":
      return `Boiler Room attack resolved${snapshot.sleep === "awake" ? "; woke up" : ""}.`;
    case "digital":
      return "Digital Boiler Room prepared at a fresh-deck boundary.";
    case "physical":
      return "Using physical Boiler Room cards.";
    case "reset":
      return "Resolved Dr. Fright’s Bloodlust sleep/reset effect.";
    case "effect":
      return "Recorded Dr. Fright’s revealed-card effect.";
    default:
      return `Final Girl ${snapshot.sleep === "unknown" ? "sleep state not recorded" : snapshot.sleep}.`;
  }
}
