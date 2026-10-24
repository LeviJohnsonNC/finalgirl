/** Standard Dr. Fright: owner photos IMG_9345–IMG_9349. No inferred Terror cards. */
export const FRIGHT_SOURCE = "Owner photos IMG_9345–IMG_9349 (standard mode)";
export const FRIGHT_VISUAL =
  "Dr. Fright is a grotesque stocky middle-aged man with scarred pockmarked skin, milky-white eyes, thinning disheveled brown hair, ragged mustard-yellow work clothes and a rusty three-tined pitchfork. He is the supernatural Dream Doctor, not a farmer or masked slasher. Preserve the selected physical Location. The Boiler Room is the Final Girl’s dream state, not a place to transport ordinary Victims. Never expose an unresolved Boiler Room card or invent a recorded attack or injury.";
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
}
export interface FrightObservation {
  id?: string;
  kind: string;
  moduleData?: { module: string; changes: Record<string, unknown> };
  momentType?: string;
  killerCard?: string;
}
export type FrightState = FrightSnapshot & { eventId: string };
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseFright(value: unknown): FrightSnapshot | null {
  if (typeof value !== "string" || value.length > 2400) return null;
  try {
    const s = JSON.parse(value) as FrightSnapshot;
    if (
      !s ||
      Object.keys(s).sort().join() !==
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
type Action = {
  command: FrightCommand;
  direction?: Direction;
  effect?: string;
};
/** Raw history is used ONLY to reuse previously dealt randomness after Undo. Never render it. */
export function frightTransition(
  current: FrightState | null,
  action: Action,
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
  const forced = frightCards(entries).finale?.id === "face-your-fright";
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
    next.sleep = forced ? "asleep" : "awake";
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
  const expected = frightTransition(
    current,
    {
      command: proposed.command,
      direction: path[path.length - 1] as Direction,
      effect: added.length === 1 ? added[0] : undefined,
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
    ...(cards.power ? { power: cards.power.id } : {}),
    ...(cards.finale ? { finale: cards.finale.id } : {}),
  };
}
export function describeFright(snapshot: FrightSnapshot) {
  switch (snapshot.command) {
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
