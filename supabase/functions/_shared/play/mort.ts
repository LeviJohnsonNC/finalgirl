export const mortLocationMinors: Readonly<Record<string,string>> = {"USS Konrad":"Slippery", "Sunnydaze Mall":"Twisted Bond", "Pesadilla Verde":"Rivermaster"};
import type { PlayEvent } from "./events.ts";

export const MORT = "Mort the Teenage Dirtbag";
export const MORT_MODULE = "mort";
export const MORT_MAX_HEALTH = 26;
export const MORT_MAX_BLOODLUST = 8;
export const MORT_TRAITS = [
  "Mask or facepaint",
  "Series of origin",
  "Height",
  "Favorite board game style",
  "Favorite horror movie genre",
  "Favorite horror movie villain",
  "Favorite VRG game",
] as const;
export const MORT_SUSPECTS = [
  {
    id: "razorface",
    name: "Razorface",
    traits: [
      "Facepaint",
      "Series 3",
      "Average",
      "Abstract",
      "Gothic",
      "Vampires",
      "Popcorn Dice",
    ],
    health: 8,
    action:
      "Targets the nearest victim or Final Girl, moves, then attacks twice.",
  },
  {
    id: "krampus",
    name: "Krampus",
    traits: [
      "Mask",
      "Special",
      "Average",
      "Solo",
      "Psychological",
      "Zombies",
      "Final Girl",
    ],
    health: 8,
    action:
      "Targets the nearest victim or Final Girl, moves twice, then attacks.",
  },
  {
    id: "hans",
    name: "Hans",
    traits: [
      "Mask",
      "Series 1",
      "Tall",
      "Solo",
      "Slasher",
      "Psychopaths",
      "Hostage Negotiator",
    ],
    health: 10,
    action:
      "Move toward the Final Girl, then attack the nearest victim or Final Girl.",
  },
  {
    id: "hunter",
    name: "H.U.N.T.E.R.",
    traits: [
      "Facepaint",
      "Series 3",
      "Tall",
      "Multiplayer",
      "Comedy Horror",
      "Extraterrestrials",
      "The Revenant Society",
    ],
    health: 10,
    action: "Targets the Final Girl, moves, then attacks twice.",
  },
  {
    id: "tormentor",
    name: "Tormentor",
    traits: [
      "Mask",
      "Series 3",
      "Short",
      "Party",
      "Slasher",
      "Ghosts",
      "Gateway Island",
    ],
    health: 6,
    action:
      "Move toward the Final Girl, then attack the nearest victim or Final Girl twice.",
  },
  {
    id: "geppetto",
    name: "Geppetto",
    traits: [
      "Facepaint",
      "Series 1",
      "Average",
      "Multiplayer",
      "Supernatural",
      "Ghosts",
      "Detective: City of Angels",
    ],
    health: 8,
    action:
      "Targets the nearest victim or Final Girl, moves, then attacks twice.",
  },
  {
    id: "wolf",
    name: "Big Bad Wolf",
    traits: [
      "Mask",
      "Series 2",
      "Tall",
      "Party",
      "Gothic",
      "Vampires",
      "Dragon Clans",
    ],
    health: 8,
    action:
      "Targets the nearest victim or Final Girl, moves and attacks, then repeats.",
  },
  {
    id: "ratchet",
    name: "Ratchet Lady",
    traits: [
      "Facepaint",
      "Series 2",
      "Short",
      "Multiplayer",
      "Supernatural",
      "Psychopaths",
      "Saloon Tycoon",
    ],
    health: 6,
    action:
      "Targets the nearest victim or Final Girl, moves, then attacks twice.",
  },
  {
    id: "fright",
    name: "Dr. Fright",
    traits: [
      "Facepaint",
      "Series 1",
      "Short",
      "Abstract",
      "Psychological",
      "Extraterrestrials",
      "Garden Guests",
    ],
    health: 8,
    action: "Targets the Final Girl, moves, then attacks twice.",
  },
  {
    id: "baghead",
    name: "Baghead",
    traits: [
      "Mask",
      "Series 2",
      "Tall",
      "Solo",
      "Comedy Horror",
      "Zombies",
      "If I’m Going Down",
    ],
    health: 12,
    action:
      "Targets the nearest victim or Final Girl, moves, then attacks the number shown below.",
  },
] as const;
export type Suspect = (typeof MORT_SUSPECTS)[number]["id"];
export const MORT_POWERS = [
  {
    id: "anonymous",
    name: "Anonymous Terror",
    effect: "At the Finale, count each missing clue twice.",
  },
  {
    id: "paranoia",
    name: "Relentless Paranoia",
    effect: "Saving an Informant gives no Horror reduction.",
  },
  {
    id: "whispers",
    name: "Toxic Whispers",
    effect:
      "Roll one fewer die for Interrogate or Coerce, to a minimum of one.",
  },
  {
    id: "snitches",
    name: "Snitches Get Stitches",
    effect:
      "After replacing suspects with Informants, roll. On 1–4, kill one of those new Informants.",
    epic: true,
  },
] as const;
type Power = (typeof MORT_POWERS)[number]["id"];
export const MORT_MINORS = [
  {
    id: "notorious",
    name: "Notorious Reputation",
    effect:
      "In the Panic phase, suspects and Informants sharing your space panic.",
  },
  {
    id: "stockholm",
    name: "Stockholm Syndrome",
    effect:
      "Informants move with a suspect sharing their space. While sharing it, they cannot follow you or be saved.",
  },
  {
    id: "quick",
    name: "Quick Slash",
    effect: "The Final Girl loses one Health whenever you reveal a clue.",
  },
] as const;
type Minor = (typeof MORT_MINORS)[number]["id"];
export const MORT_TERRORS = [
  {
    name: "Everybody’s a Suspect",
    quantity: 3,
    effect:
      "Draw a suspect token to resolve a victim-targeting Killer action. If nobody was attacked, raise Horror.",
  },
  {
    name: "I Want to See What Your Insides Look Like!",
    quantity: 2,
    effect:
      "Draw a suspect token to resolve a Final Girl-targeting Killer action. If nobody was attacked, raise Horror.",
  },
  {
    name: "Pandemonium",
    quantity: 2,
    effect: "Panic all suspects and Informants, then raise Horror twice.",
  },
  {
    name: "Do You Like Scary Movies?",
    quantity: 1,
    effect:
      "Discard Interrogate and Coerce from your hand. If you discard neither, raise Bloodlust twice.",
  },
  {
    name: "A Mask in the Crowd",
    quantity: 1,
    effect:
      "If there are Victims, draw a suspect token and place the suspect with the largest group, favoring Informants in ties, then attack. Otherwise redraw Terror.",
  },
  {
    name: "Meta Massacre",
    quantity: 1,
    effect: "Draw and resolve the printed suspect attack four times total.",
  },
  {
    name: "Cosplay Photo Op",
    quantity: 1,
    effect:
      "Move yourself and all Victims one space toward their nearest suspect. If you share a space with a suspect, lose three Time. Raise Horror.",
  },
  {
    name: "Trade-Off",
    quantity: 1,
    effect:
      "Choose one printed penalty and a reward from a different column, then draw for a suspect action.",
  },
  {
    name: "Swarm of Masks",
    quantity: 1,
    effect:
      "Draw three times, each time moving the indicated suspect toward another suspect. Raise Horror for each shared suspect space, up to three.",
  },
  ...MORT_MINORS.map((minor) => ({
    name: minor.name,
    quantity: 1,
    effect: minor.effect,
  })),
];
export const MORT_ATTACK = [1, 1, 1, 2, 2, 2, 3, 3, 3];
export const MORT_MOVE = [1, 1, 1, 2, 2, 2, 2, 3, 3];
export type MortCommand =
  | {
      kind: "begin";
      clues: number[];
      excluded: Suspect[];
      discarded: Suspect[];
      informants: number;
    }
  | {
      kind: "clue";
      number: number;
      excluded: Suspect[];
      source: "interrogate" | "coerce" | "manual";
      trait?: number;
      value?: string;
      discard?: Minor | "location";
    }
  | { kind: "exclude"; suspect: Suspect }
  | { kind: "draw"; suspect: Suspect }
  | { kind: "return-token" }
  | {
      kind: "informant";
      result: "saved" | "killed" | "coerced";
      lowerHorror?: boolean;
    }
  | { kind: "power"; power: Power | null }
  | { kind: "minor"; minor: Minor; active: boolean }
  | {
      kind: "reveal";
      suspect: Suspect;
      route: "clues" | "terror";
      missing?: number;
      power: Power;
    }
  | { kind: "location-minor"; location: string; active: boolean }
  | { kind: "advance"; track: "horror" | "bloodlust" };
export type MortAction = MortCommand & { parent: string };
export type MortState = {
  known: boolean;
  clues: number[];
  excluded: Suspect[];
  unfiled: Suspect[];
  discarded: Suspect[];
  informants: number;
  locationMinor?: string;
  active?: Suspect;
  power?: Power;
  powerRevealed?: boolean;
  minors: Minor[];
  horrorToken: boolean;
  reveal?: {
    suspect: Suspect;
    missing: number;
    effective: number;
    route: "clues" | "terror";
  };
};
const suspectIds: readonly string[] = MORT_SUSPECTS.map((s) => s.id);
const isSuspect = (v: unknown): v is Suspect =>
  typeof v === "string" && suspectIds.includes(v);
const isPower = (v: unknown): v is Power => MORT_POWERS.some((p) => p.id === v);
const isMinor = (v: unknown): v is Minor => MORT_MINORS.some((p) => p.id === v);
const count = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const unique = (v: unknown, canUse: (x: unknown) => boolean, max: number) =>
  Array.isArray(v) &&
  v.length <= max &&
  new Set(v).size === v.length &&
  v.every(canUse);
export const newMort = (): MortState => ({
  known: true,
  clues: [],
  excluded: [],
  unfiled: [],
  discarded: [],
  informants: 0,
  minors: [],
  horrorToken: false,
});
export const mortParent = (entries: readonly PlayEvent[]) =>
  [...entries].reverse().find((e) => e.moduleData?.module === MORT_MODULE)
    ?.id ?? "root";
export function mortMatches(state: MortState, trait: number, value: string) {
  return MORT_SUSPECTS.filter(
    (s) =>
      (!state.excluded.includes(s.id) || state.unfiled.includes(s.id)) &&
      s.traits[trait] === value,
  ).map((s) => s.id);
}
export function validMortAction(input: unknown): input is MortAction {
  if (!input || typeof input !== "object") return false;
  const a = input as MortAction;
  if (typeof a.parent !== "string" || a.parent.length > 36) return false;
  switch (a.kind) {
    case "begin":
      return (
        unique(a.clues, (n) => count(n, 1, 5), 5) &&
        unique(a.excluded, isSuspect, 9) &&
        unique(a.discarded, isSuspect, 9) &&
        a.discarded.every((id) => a.excluded.includes(id)) &&
        count(a.informants, 0, a.excluded.length)
      );
    case "clue":
      return (
        count(a.number, 1, 5) &&
        ["interrogate", "coerce", "manual"].includes(a.source) &&
        unique(a.excluded, isSuspect, 9) &&
        a.excluded.length > 0 &&
        (a.discard === undefined ||
          a.discard === "location" ||
          isMinor(a.discard)) &&
        (a.trait === undefined
          ? a.value === undefined
          : count(a.trait, 0, 6) &&
            MORT_SUSPECTS.some((s) => s.traits[a.trait!] === a.value))
      );
    case "draw":
    case "exclude":
      return isSuspect(a.suspect);
    case "return-token":
      return true;
    case "informant":
      return (
        ["saved", "killed", "coerced"].includes(a.result) &&
        (a.lowerHorror === undefined ||
          (a.result === "saved" && typeof a.lowerHorror === "boolean"))
      );
    case "power":
      return a.power === null || isPower(a.power);
    case "minor":
      return isMinor(a.minor) && typeof a.active === "boolean";
    case "reveal":
      return (
        isSuspect(a.suspect) &&
        ["clues", "terror"].includes(a.route) &&
        (a.missing === undefined || count(a.missing, 0, 5)) &&
        isPower(a.power)
      );
    case "location-minor":
      return (
        Object.prototype.hasOwnProperty.call(mortLocationMinors, a.location) &&
        typeof a.active === "boolean"
      );
    case "advance":
      return a.track === "horror" || a.track === "bloodlust";
    default:
      return false;
  }
}
type MortObservation = Pick<PlayEvent, "moduleData" | "mortAction"> & {
  mortTokenPlaced?: boolean;
};
export function mortState(
  entries: readonly MortObservation[],
  fresh = false,
): MortState {
  let s = { ...newMort(), known: fresh };
  for (const e of entries) {
    if (e.moduleData?.module !== MORT_MODULE) {
      if (e.mortTokenPlaced) s = { ...s, horrorToken: true };
      continue;
    }
    if (!e.mortAction) {
      s = newMort();
      continue;
    }
    const a = e.mortAction;
    switch (a.kind) {
      case "begin":
        s = {
          ...s,
          known: true,
          clues: a.clues,
          excluded: a.excluded,
          discarded: a.discarded,
          informants: a.informants,
        };
        break;
      case "clue": {
        const newlyExcluded = a.excluded.filter(
          (id) => !s.excluded.includes(id),
        );
        s = {
          ...s,
          clues: [...s.clues, a.number],
          excluded: [...s.excluded, ...newlyExcluded],
          unfiled: s.unfiled.filter((id) => !a.excluded.includes(id)),
          informants:
            s.informants + newlyExcluded.length - Number(a.source === "coerce"),
          locationMinor: a.discard === "location" ? undefined : s.locationMinor,
          minors: s.minors.filter((m) => m !== a.discard),
        };
        break;
      }
      case "exclude":
        s = {
          ...s,
          excluded: [...s.excluded, a.suspect],
          unfiled: [...s.unfiled, a.suspect],
          informants: s.informants + 1,
        };
        break;
      case "draw":
        s = s.excluded.includes(a.suspect)
          ? { ...s, discarded: [...s.discarded, a.suspect] }
          : { ...s, active: a.suspect };
        break;
      case "return-token":
        s = { ...s, active: undefined };
        break;
      case "informant":
        s = { ...s, informants: s.informants - 1 };
        break;
      case "power":
        s = { ...s, power: a.power ?? undefined, powerRevealed: true };
        break;
      case "location-minor":
        s = { ...s, locationMinor: a.active ? a.location : undefined };
        break;
      case "minor":
        s = {
          ...s,
          minors: a.active
            ? [...s.minors, a.minor]
            : s.minors.filter((m) => m !== a.minor),
        };
        break;
      case "reveal": {
        const missing = a.missing ?? 5 - s.clues.length;
        s = {
          ...s,
          known: true,
          reveal: {
            suspect: a.suspect,
            missing,
            effective: missing * (a.power === "anonymous" ? 2 : 1),
            route: a.route,
          },
          power: a.power,
          powerRevealed: true,
          active: undefined,
          locationMinor: undefined,
          minors: [],
          informants: 0,
        };
        break;
      }
    }
    if (e.mortTokenPlaced === true) s = { ...s, horrorToken: true };
  }
  return s;
}
export function canRecordMort(
  a: MortAction,
  state: MortState,
  entries: readonly PlayEvent[],
) {
  if (!validMortAction(a) || a.parent !== mortParent(entries)) return false;
  if (a.kind === "begin")
    return (
      !state.known &&
      !state.reveal &&
      (a.clues.length !== 5 || a.excluded.length === 9)
    );
  if (a.kind === "power")
    return !state.reveal && a.power !== (state.power ?? null);
  if (a.kind === "advance") return true;
  if (a.kind === "reveal" && !state.known)
    return (
      a.route === "terror" &&
      a.missing !== undefined &&
      a.missing > 0 &&
      (!state.power || state.power === a.power)
    );
  if (!state.known || state.reveal) return false;
  switch (a.kind) {
    case "clue": {
      if (state.active) return false;
      const total = new Set([...state.excluded, ...a.excluded]).size;
      return (
        !state.clues.includes(a.number) &&
        a.excluded.every(
          (id) => !state.excluded.includes(id) || state.unfiled.includes(id),
        ) &&
        total <= 9 &&
        (state.clues.length !== 4 || total === 9) &&
        (a.source !== "coerce" || state.informants > 0) &&
        (!a.discard ||
          (a.source !== "manual" &&
            (a.discard === "location"
              ? !!state.locationMinor
              : state.minors.includes(a.discard)))) &&
        (a.trait === undefined ||
          (mortMatches(state, a.trait, a.value!).length === a.excluded.length &&
            mortMatches(state, a.trait, a.value!).every((id) =>
              a.excluded.includes(id),
            )))
      );
    }
    case "exclude":
      return (
        state.excluded.length < 9 &&
        !state.excluded.includes(a.suspect) &&
        state.active !== a.suspect
      );
    case "draw":
      return !state.active && !state.discarded.includes(a.suspect);
    case "return-token":
      return state.active !== undefined;
    case "informant":
      return (
        state.informants > 0 && !(a.lowerHorror && state.power === "paranoia")
      );
    case "location-minor":
      return (state.locationMinor === a.location) !== a.active;
    case "minor":
      return state.minors.includes(a.minor) !== a.active;
    case "reveal":
      return (
        !state.active &&
        !state.excluded.includes(a.suspect) &&
        (!state.power || state.power === a.power) &&
        (a.missing === undefined || a.missing === 5 - state.clues.length) &&
        (a.route === "clues"
          ? state.clues.length === 5 && state.excluded.length === 9
          : state.clues.length < 5)
      );
  }
}
export const MORT_FINALE_GUIDANCE: Record<Suspect, string> = {
  razorface: "On reveal, take one Health loss per missing clue.",
  krampus:
    "On reveal, raise Horror once per missing clue. In Upkeep, raise Horror if a die roll exceeds your Horror level.",
  hans: "Increase Attack by two per missing clue.",
  hunter: "On reveal, discard one random Item per missing clue.",
  tormentor:
    "After resetting Time in Planning, lose one Time per missing clue, to a minimum of two.",
  geppetto:
    "On reveal, move one Victim per missing clue into your space, then take damage for every Victim now there.",
  wolf: "Increase Movement by one per missing clue.",
  ratchet: "Add two to starting Health per missing clue.",
  fright:
    "On reveal, remove both Rest cards and a zero-cost Action card of your choice per missing clue.",
  baghead: "Make one attack plus half the missing clue count, rounded up.",
};

export function mortFinale(
  reveal: NonNullable<MortState["reveal"]>,
  bloodlust: number,
) {
  const suspect = MORT_SUSPECTS.find((s) => s.id === reveal.suspect)!;
  const missing = reveal.effective;
  const effects: Record<Suspect, string> = {
    razorface: `On reveal, lose ${missing} Health.`,
    krampus: `On reveal, raise Horror ${missing} times. In Upkeep, roll a die and raise Horror if the roll exceeds your Horror level.`,
    hans: `Add ${2 * missing} to Mort’s Attack.`,
    hunter: `On reveal, discard ${missing} random Items.`,
    tormentor: `After resetting Time in Planning, lose ${missing} Time, to a minimum of 2.`,
    geppetto: `On reveal, move ${missing} Victims to your space. Then take damage equal to the Victims in your space.`,
    wolf: `Add ${missing} to Mort’s Movement.`,
    ratchet: `Starting Health includes ${2 * missing} additional Health from missing clues.`,
    fright: `On reveal, remove Short Rest and Long Rest. Also remove ${missing} zero-cost Action cards of your choice.`,
    baghead: `Mort attacks ${1 + Math.ceil(missing / 2)} times.`,
  };
  return {
    suspect,
    health: suspect.health + (suspect.id === "ratchet" ? 2 * missing : 0),
    attack: MORT_ATTACK[bloodlust] + (suspect.id === "hans" ? 2 * missing : 0),
    movement: MORT_MOVE[bloodlust] + (suspect.id === "wolf" ? missing : 0),
    effect: effects[suspect.id],
  };
}
export function mortFacts(entries: readonly MortObservation[]) {
  const s = mortState(entries);
  if (!s.reveal)
    return s.known
      ? `Mort’s disguise is unconfirmed. ${s.clues.length} clues were recorded.`
      : "";
  return `Confirmed disguise: Mort as ${mortFinale(s.reveal, 0).suspect.name}. ${s.reveal.missing} clues remained unrevealed.`;
}
export function mortOwnsLog(
  killer: string,
  log: readonly PlayEvent[],
  location?: string,
) {
  return log.every((event) => {
    const action = event?.mortAction;
    if (
      location &&
      action?.kind === "location-minor" &&
      action.location !== location
    )
      return false;
    return (
      killer === MORT ||
      (event?.moduleData?.module !== MORT_MODULE && !event?.mortReference)
    );
  });
}

export function mortEventKind(a: MortAction) {
  if (a.kind === "informant" && a.result !== "coerced") return a.result;
  return "module";
}

export function mortTrackerChanges(
  a: MortAction,
  state: MortState,
  trackers: {
    bloodlust?: number;
    finalHorrorLevel?: number;
    finalGirlHealth?: number;
    killerHealth?: number;
  },
) {
  let { bloodlust, finalHorrorLevel, finalGirlHealth, killerHealth } = trackers;
  let horrorToken = state.horrorToken || bloodlust === MORT_MAX_BLOODLUST;
  let time = 0,
    terror = 0;
  const raiseBloodlust = () => {
    if (bloodlust === undefined) return;
    if (bloodlust >= MORT_MAX_BLOODLUST) {
      if (horrorToken) raiseHorror();
      else if (finalHorrorLevel !== undefined)
        finalHorrorLevel = Math.min(7, finalHorrorLevel + 1);
      terror++;
      return;
    }
    bloodlust++;
    if (bloodlust === 5) terror++;
    if (bloodlust === 6) raiseHorror();
    if (bloodlust === 8) horrorToken = true;
  };
  const raiseHorror = () => {
    if (finalHorrorLevel === undefined) return;
    if (finalHorrorLevel < 7) finalHorrorLevel++;
    else if (horrorToken) time++;
    else raiseBloodlust();
  };
  if (a.kind === "advance") {
    if (a.track === "horror") raiseHorror();
    else raiseBloodlust();
  }
  if (a.kind === "informant") {
    if (a.result === "killed") {
      raiseBloodlust();
      raiseHorror();
    }
    if (a.result === "saved" && a.lowerHorror && finalHorrorLevel !== undefined)
      finalHorrorLevel = Math.max(0, finalHorrorLevel - 1);
  }
  if (
    a.kind === "clue" &&
    state.minors.includes("quick") &&
    finalGirlHealth !== undefined
  )
    finalGirlHealth = Math.max(0, finalGirlHealth - 1);
  if (a.kind === "reveal") {
    const missing = a.missing ?? 5 - state.clues.length;
    const effective = missing * (a.power === "anonymous" ? 2 : 1);
    killerHealth = mortFinale({ ...a, missing, effective }, 0).health;
    if (a.suspect === "razorface" && finalGirlHealth !== undefined)
      finalGirlHealth = Math.max(0, finalGirlHealth - effective);
    if (a.suspect === "krampus")
      for (let i = 0; i < effective; i++) raiseHorror();
  }
  return {
    bloodlust,
    finalHorrorLevel,
    finalGirlHealth,
    killerHealth,
    horrorToken,
    time,
    terror,
  };
}

export function describeMort(a: MortAction) {
  const name = (id: Suspect) => MORT_SUSPECTS.find((s) => s.id === id)!.name;
  switch (a.kind) {
    case "begin":
      return "Recorded the tabletop investigation";
    case "clue":
      return `Clue ${a.number} · ruled out ${a.excluded.map(name).join(", ")}`;
    case "exclude":
      return `Ruled out ${name(a.suspect)}`;
    case "draw":
      return `Drew ${name(a.suspect)} from the suspect bag`;
    case "return-token":
      return "Returned the suspect token";
    case "informant":
      return `${a.result === "coerced" ? "Coerced" : a.result === "saved" ? "Saved" : "Killed"} an Informant`;
    case "power":
      return a.power
        ? `Dark Power · ${MORT_POWERS.find((p) => p.id === a.power)!.name}`
        : "Cleared the recorded Dark Power";
    case "minor":
      return `${a.active ? "Revealed" : "Discarded"} ${MORT_MINORS.find((p) => p.id === a.minor)!.name}`;
    case "reveal":
      return `Mort revealed · ${name(a.suspect)}`;
    case "location-minor":
      return `${a.active ? "Revealed" : "Discarded"} ${mortLocationMinors[a.location]}`;
    case "advance":
      return a.track === "horror" ? "Increased Horror" : "Increased Bloodlust";
  }
}

export function mortSummary(entries: readonly PlayEvent[], fresh = false) {
  const s = mortState(entries, fresh);
  if (s.reveal) return `Revealed · ${mortFinale(s.reveal, 0).suspect.name}`;
  return s.known
    ? `${s.clues.length}/5 clues · ${10 - s.excluded.length} suspects`
    : "Investigation not recorded";
}
