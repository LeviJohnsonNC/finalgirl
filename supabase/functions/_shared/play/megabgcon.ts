import { BOOTHS, BOOTH_EFFECTS, BOOTH_EVENTS, CON_EVENTS, CON_PEOPLE, MEGABGCON, MEGABGCON_MODULE, type Booth } from "./megabgconCatalog.ts";
import { MORT, mortParent, mortState, mortTrackerChanges } from "./mort.ts";
import { HUNTER, HUNTER_MODULE, hunterHasReveal, hunterState } from "./hunter.ts";
import type { PlayEvent, PlaySummary } from "./events.ts";

type Impact = "victim" | "bloodlust";
type Person = (typeof CON_PEOPLE)[number]["id"];
type EventId = (typeof CON_EVENTS)[number]["id"];
type BoothEvent = (typeof BOOTH_EVENTS)[number]["id"];
type BoothEffect = (typeof BOOTH_EFFECTS)[number]["id"];
type Life = "saved" | "killed" | "left";
export type ConCommand =
  | { kind: "upkeep"; booth: Booth; result: "arrival" | BoothEvent; accident?: Impact; killer: string }
  | { kind: "lookup"; booth: Booth }
  | { kind: "token"; token: BoothEffect; booth: Booth | null }
  | { kind: "event"; event: EventId; active: boolean }
  | { kind: "lunch-end" }
  | { kind: "person"; person: Person; booth?: Booth; role?: "friend" | "enemy" }
  | { kind: "person-outcome"; person: Person; outcome: Life; killer: string }
  | { kind: "swag"; booths: [Booth, Booth, Booth] }
  | { kind: "swag-outcome"; slot: number; outcome: Life; killer: string }
  | { kind: "buggy"; status: "active" | "spent" | "clear"; target?: "killer" | "tabletop"; killer?: string };

export type ConAction = ConCommand & { previous: string };
type Entry = Pick<PlayEvent, "moduleData" | "mortAction" | "megabgconAction"> & { id?: string; kind: string; momentType?: string; mortTokenPlaced?: boolean };
type RecordedUpkeep = Extract<ConCommand, { kind: "upkeep" }>;
type PersonRecord = Extract<ConCommand, { kind: "person" }> & { status: "active" | Life };
export type ConState = ReturnType<typeof megabgconState>;

export function megabgconState(entries: readonly Entry[]) {
  const state = {
    previous: "root",
    upkeep: undefined as (RecordedUpkeep & { id: string }) | undefined,
    effects: {} as Partial<Record<BoothEffect, Booth>>,
    ongoing: {} as Partial<Record<EventId, boolean>>,
    people: {} as Partial<Record<Person, PersonRecord>>,
    lunch: undefined as number | undefined,
    swag: [] as { booth: Booth; status: "active" | Life }[],
    buggy: undefined as "active" | "spent" | undefined,
    lookup: undefined as Booth | undefined,
  };
  for (const entry of entries) {
    const a = entry.megabgconAction;
    if (!a || !entry.id) continue;
    state.previous = entry.id;
    switch (a.kind) {
      case "upkeep":
        state.upkeep = { ...a, id: entry.id };
        if (isBoothEffect(a.result)) state.effects[a.result] = a.booth;
        break;
      case "lookup": state.lookup = a.booth; break;
      case "token":
        if (a.booth) state.effects[a.token] = a.booth;
        else delete state.effects[a.token];
        break;
      case "event":
        state.ongoing[a.event] = a.active;
        if (a.event === "lunch") state.lunch = a.active ? 2 : 0;
        break;
      case "lunch-end": state.lunch = Math.max(0, (state.lunch ?? 0) - 1); break;
      case "person": state.people[a.person] = { ...a, status: "active" }; break;
      case "person-outcome": {
        const person = state.people[a.person];
        if (person) state.people[a.person] = { ...person, status: a.outcome };
        break;
      }
      case "swag": state.swag = a.booths.map(booth => ({ booth, status: "active" })); break;
      case "swag-outcome":
        if (state.swag[a.slot]) state.swag[a.slot].status = a.outcome;
        break;
      case "buggy": state.buggy = a.status === "clear" ? undefined : a.status; break;
    }
  }
  return state;
}

const isBooth = (value: unknown): value is Booth => BOOTHS.some(booth => booth === value);
const isBoothEffect = (value: unknown): value is BoothEffect => BOOTH_EFFECTS.some(token => token.id === value);
const isLife = (value: unknown): value is Life => value === "saved" || value === "killed" || value === "left";
const person = (id: Person) => CON_PEOPLE.find(item => item.id === id);
const namedKiller = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.length <= 100;

export function validConAction(value: unknown): value is ConAction {
  if (!value || typeof value !== "object") return false;
  const a = value as ConAction;
  if (typeof a.previous !== "string" || !(a.previous === "root" || /^[a-f\d-]{36}$/i.test(a.previous))) return false;
  switch (a.kind) {
    case "upkeep": return isBooth(a.booth) && namedKiller(a.killer) &&
      (a.result === "arrival" || BOOTH_EVENTS.some(card => card.id === a.result)) &&
      (a.result === "accident" ? a.accident === "victim" || a.accident === "bloodlust" : a.accident === undefined);
    case "lookup": return isBooth(a.booth);
    case "token": return isBoothEffect(a.token) && (a.booth === null || isBooth(a.booth));
    case "event": return ["food-trucks", "nervous", "lunch", "tickets", "stampede"].includes(a.event) && typeof a.active === "boolean";
    case "lunch-end": return true;
    case "person": {
      const source = person(a.person);
      return !!source && (source.booth ? isBooth(a.booth) : a.booth === undefined) &&
        (a.person === "bad-boy" ? a.role === "friend" || a.role === "enemy" : a.role === undefined);
    }
    case "person-outcome": return !!person(a.person) && isLife(a.outcome) && namedKiller(a.killer);
    case "swag": return Array.isArray(a.booths) && a.booths.length === 3 && a.booths.every(isBooth) && new Set(a.booths).size === 3;
    case "swag-outcome": return Number.isInteger(a.slot) && a.slot >= 0 && a.slot <= 2 && isLife(a.outcome) && namedKiller(a.killer);
    case "buggy": return a.status === "spent"
      ? (a.target === "tabletop" || a.target === "killer") && namedKiller(a.killer)
      : (a.status === "active" || a.status === "clear") && a.target === undefined && a.killer === undefined;
    default: return false;
  }
}

export function conFinaleRevealed(killer: string, entries: readonly Entry[]) {
  if (killer === MORT) return !!mortState(entries).reveal;
  if (killer === HUNTER) {
    const fields = Object.assign({}, ...entries.filter(e => e.moduleData?.module === HUNTER_MODULE).map(e => e.moduleData!.changes));
    if (hunterHasReveal(hunterState(fields), "finale")) return true;
  }
  return entries.some(event => event.kind === "moment" && event.momentType === "finale");
}

export function canConDamageKiller(killer: string, progress: Pick<PlaySummary, "entries" | "killerHealth">) {
  if (!progress.killerHealth || ["Poltergeist", "The Organism", "The Intruders"].includes(killer)) return false;
  return killer !== MORT || !!mortState(progress.entries).reveal;
}

export function canRecordCon(a: ConAction, progress: Pick<PlaySummary, "entries" | "killerHealth">) {
  if (!validConAction(a)) return false;
  const con = megabgconState(progress.entries);
  if (con.previous !== a.previous) return false;
  switch (a.kind) {
    case "upkeep": return !conFinaleRevealed(a.killer, progress.entries);
    case "token": return con.effects[a.token] !== (a.booth ?? undefined);
    case "event": return a.event === "lunch" ? !!con.lunch !== a.active : con.ongoing[a.event] !== a.active;
    case "lunch-end": return (con.lunch ?? 0) > 0;
    case "person": return con.people[a.person]?.status !== "active";
    case "person-outcome": return con.people[a.person]?.status === "active";
    case "swag": return !con.swag.some(token => token.status === "active");
    case "swag-outcome": return con.swag[a.slot]?.status === "active";
    case "buggy":
      if (a.status === "clear") return !!con.buggy;
      if (a.status === "active") return !con.buggy;
      return con.buggy === "active" && (a.target !== "killer" || canConDamageKiller(a.killer!, progress));
    default: return true;
  }
}

export function conOutcome(a: ConAction) {
  if (a.kind === "upkeep" && a.accident === "victim")
    return { kind: "killed", room: a.booth, eventCard: "Tragic Accident" } as const;
  if (a.kind === "person-outcome" && a.outcome !== "left")
    return { kind: a.outcome, victim: person(a.person)!.person, eventCard: person(a.person)!.name };
  if (a.kind === "swag-outcome" && a.outcome !== "left")
    return { kind: a.outcome, victim: "SWAG attendee", eventCard: "SWAG Roulette" };
}

function raisesConBloodlust(a: ConAction) {
  return a.kind === "upkeep" && a.accident === "bloodlust" ||
    a.kind === "person-outcome" && a.outcome === "killed" && a.person === "designer";
}

export function conTrackedFields(a: ConAction) {
  const fields = new Set<"killerHealth" | "bloodlust" | "finalGirlHealth" | "finalHorrorLevel">();
  if (raisesConBloodlust(a)) {
    fields.add("bloodlust");
    if ("killer" in a && a.killer === MORT) fields.add("finalHorrorLevel");
  }
  if (a.kind === "person-outcome" && a.person === "bad-boy") {
    fields.add("finalHorrorLevel");
    fields.add("finalGirlHealth");
    if (a.killer === MORT) fields.add("bloodlust");
  }
  if (a.kind === "buggy" && a.target === "killer") fields.add("killerHealth");
  return fields;
}

export function conTrackerChanges(a: ConAction, progress: Pick<PlaySummary, "entries" | "bloodlust" | "killerHealth" | "finalGirlHealth" | "finalHorrorLevel">) {
  const changes: Partial<Pick<PlaySummary, "bloodlust" | "killerHealth" | "finalGirlHealth" | "finalHorrorLevel">> = {};
  let token = false;
  let time = 0;
  let terror = 0;
  if (raisesConBloodlust(a) && progress.bloodlust !== undefined && "killer" in a) {
    if (a.killer === MORT) {
      const previous = mortState(progress.entries);
      const next = mortTrackerChanges({ kind: "advance", track: "bloodlust", parent: mortParent(progress.entries) }, previous, progress);
      changes.bloodlust = next.bloodlust;
      changes.finalHorrorLevel = next.finalHorrorLevel;
      token = next.horrorToken && !previous.horrorToken;
      time = next.time;
      terror = next.terror;
    } else {
      const caps: Record<string, number> = {
        "The Organism": 7, "The Ratchet Lady": 8, "The Intruders": 10, [HUNTER]: 10,
        "The Tormentor": 6, Grimlash: 8, Evomorph: 10, Hans: 10, "Dr. Fright": 9,
        Inkanyamba: 8, Geppetto: 8, Poltergeist: 8,
      };
      const max = caps[a.killer ?? ""];
      if (max !== undefined && progress.bloodlust < max) changes.bloodlust = progress.bloodlust + 1;
    }
  }
  if (a.kind === "person-outcome" && a.person === "bad-boy") {
    const role = megabgconState(progress.entries).people[a.person]?.role;
    if (role === "enemy" && a.outcome === "saved" && progress.finalGirlHealth !== undefined)
      changes.finalGirlHealth = Math.max(0, progress.finalGirlHealth - 1);
    if (role === "friend" && progress.finalHorrorLevel !== undefined && a.outcome !== "left") {
      if (a.killer === MORT) {
        const previous = mortState(progress.entries);
        const first = a.outcome === "killed" ? mortTrackerChanges({ kind: "advance", track: "horror", parent: mortParent(progress.entries) }, previous, progress) : undefined;
        if (first) {
          const second = mortTrackerChanges({ kind: "advance", track: "horror", parent: mortParent(progress.entries) }, { ...previous, horrorToken: first.horrorToken }, first);
          changes.bloodlust = second.bloodlust;
          changes.finalHorrorLevel = second.finalHorrorLevel;
          token = second.horrorToken && !previous.horrorToken;
          time = first.time + second.time;
          terror = first.terror + second.terror;
        } else {
          changes.finalHorrorLevel = Math.max(0, progress.finalHorrorLevel - 2);
          time = -Math.max(0, 2 - progress.finalHorrorLevel);
        }
      } else {
        changes.finalHorrorLevel = Math.max(0, Math.min(7, progress.finalHorrorLevel + (a.outcome === "saved" ? -2 : 2)));
      }
    }
  }
  if (a.kind === "buggy" && a.target === "killer" && progress.killerHealth !== undefined)
    changes.killerHealth = Math.max(0, progress.killerHealth - 2);
  return { changes, token, time, terror };
}

export function conDescription(a: ConCommand) {
  switch (a.kind) {
    case "upkeep": {
      const name = a.result === "arrival" ? "New attendee" : BOOTH_EVENTS.find(card => card.id === a.result)!.name;
      return `${name} · ${a.booth}`;
    }
    case "lookup": return `Booth drawn · ${a.booth}`;
    case "token": return `${BOOTH_EFFECTS.find(token => token.id === a.token)!.label} · ${a.booth ?? "Cleared"}`;
    case "event": return `${CON_EVENTS.find(card => card.id === a.event)!.name} · ${a.active ? "Recorded" : "Cleared"}`;
    case "lunch-end": return "Lunch Time! · Action phase ended";
    case "person": return `${person(a.person)!.person} arrived${a.role ? ` as a ${a.role}` : ""}${a.booth ? ` at ${a.booth}` : ""}`;
    case "person-outcome": return `${person(a.person)!.person} · ${a.outcome === "left" ? "Left play" : a.outcome}`;
    case "swag": return "Three sealed SWAG tokens in play";
    case "swag-outcome": return `SWAG attendee ${a.slot + 1} · ${a.outcome === "left" ? "Left play" : a.outcome}`;
    case "buggy": return a.status === "spent" ? "Medical Buggy spent after a hit" : a.status === "active" ? "Medical Buggy in play" : "Medical Buggy record cleared";
  }
}

export function conFacts(entries: readonly Entry[]) {
  const state = megabgconState(entries);
  const facts = [];
  if (state.upkeep) facts.push(conDescription(state.upkeep));
  for (const token of BOOTH_EFFECTS) if (state.effects[token.id]) facts.push(`${token.label} at ${state.effects[token.id]}`);
  for (const person of CON_PEOPLE) {
    const record = state.people[person.id];
    if (record) facts.push(`${person.person}${record.role ? ` (${record.role})` : ""} ${record.status === "active" ? "in play" : record.status}${record.booth ? ` (placed at ${record.booth})` : ""}`);
  }
  for (const event of CON_EVENTS) {
    if (event.id !== "lunch" && state.ongoing[event.id]) facts.push(`${event.name} recorded`);
  }
  if (state.lunch) facts.push(`Lunch Time! active for ${state.lunch} more Action phase(s)`);
  if (state.buggy) facts.push(`Medical Buggy ${state.buggy === "active" ? "in play" : "spent"}`);
  if (state.swag.length) facts.push(`SWAG attendees: ${state.swag.map(s => s.status === "active" ? "token sealed" : s.status).join(", ")}`);
  return facts.join(". ");
}

export function conOwnsLog(location: string | undefined, killer: string | undefined, events: readonly PlayEvent[]) {
  return events.every(e => {
    if (!e || typeof e !== "object") return false;
    if (e.moduleData?.module !== MEGABGCON_MODULE && !e.megabgconAction && !e.megabgconReference) return true;
    const a = e.megabgconAction;
    return location === MEGABGCON && (!a || !("killer" in a) || !a.killer || a.killer === killer);
  });
}
