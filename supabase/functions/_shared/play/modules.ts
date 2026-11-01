import {initialMarrek,validMarrekField,marrekState,marrekFacts,marrekExits,MARREK_EXITS,MARREK_VISUAL,MARREK_ITEMS} from './marrekWarehouse.ts';
import {TORMENTOR_POWERS,TORMENTOR_FINALES,TORMENTOR_TRAPS,initialTormentor,validTormentorField,tormentorState,tormentorFacts,serializeTormentor,tormentorCard} from './tormentor.ts';
import {SHADY_ITEMS,SHADY_PEOPLE,SHADY_CURSES,initialShady,validShadyField,shadyState,shadyFacts} from './shadyAcres.ts';
import { GRIMLASH_POWERS, GRIMLASH_FINALES, GRIMLASH_MINORS, GRIMLASH_HARVEST, initialGrimlash, validGrimlashField, grimlashFacts } from './grimlash.ts';
import { validKonradField, canonicalKonradSnapshot, initialKonrad, konradFacts } from './konrad.ts';
import { KONRAD_ITEMS } from './konradCatalog.ts';
import { EVOMORPH_POWERS, EVOMORPH_FINALES, EVOMORPH_AMBUSH, validEvomorphField, initialEvomorph, evomorphFacts } from './evomorph.ts';
import { validCreechField, creechFacts, creechStartingObservations, CREECH_EVENTS, CREECH_ITEMS, CREECH_PEOPLE } from './creech.ts';
import { POLTERGEIST_ITEMS, POLTERGEIST_POWERS, POLTERGEIST_FINALES, POLTERGEIST_MINORS, validPoltergeistField, poltergeistFacts, poltergeistPower } from './poltergeist.ts';
import { validGrovesField, grovesLabel, grovesValue, grovesFacts, GROVES_EVENTS, GROVES_ITEMS, GROVES_VISUAL, GROVES_PEOPLE } from "./groves.ts";
import { INKANYAMBA_POWERS, INKANYAMBA_FINALES, INKANYAMBA_MINOR_POWERS, validInkanyambaField, inkanyambaFacts } from "./inkanyamba.ts";
export { INKANYAMBA_POWERS, INKANYAMBA_FINALES, INKANYAMBA_MINOR_POWERS } from "./inkanyamba.ts";
import { MAPLE_EVENTS, MAPLE_PEOPLE, MAPLE_ITEMS, validMapleField, mapleLabel, mapleValue, mapleStoryFacts, mapleStartingObservations } from "./maple.ts";
import { FRIGHT_MINOR_POWERS, FRIGHT_CONDITIONS, FRIGHT_POWERS, FRIGHT_FINALES, validFrightChanges, parseFright, frightState, frightPublic, describeFright } from "./fright.ts";
export { FRIGHT_POWERS, FRIGHT_FINALES } from "./fright.ts";
import {
  CARNIVAL_EVENTS,
  CARNIVAL_TRAPS,
  CARNIVAL_ITEMS,
  CARNIVAL_ITEM_TRAPS,
  CARNIVAL_PEOPLE,
  validCarnivalField,
  carnivalStartingObservations,
  carnivalStoryFacts,
} from "./carnival.ts";
import {
  GEPPETTO_POWERS,
  GEPPETTO_FINALES,
  GEPPETTO_MINOR_POWERS,
  GEPPETTO_PUPPETS,
  validGeppettoField,
  initialGeppettoPuppets,
  geppettoPuppetCounts,
} from "./geppetto.ts";
import {
  BUDDIES,
  BILLY_FINALES,
  BILLY_POWERS,
  BUDDYLAND_EVENTS,
  BUDDYLAND_ITEMS,
  BUDDYLAND_TERRORS,
  SPECIAL_VICTIMS,
} from "./buddyland.ts";
import {
  CAMP_EVENTS,
  CAMP_ONGOING_EVENTS,
  CAMP_ITEMS,
  CAMP_TERRORS,
  CAMP_TUNNEL_ROOMS,
  CAMP_VICTIMS,
  HANS_FINALES,
  HANS_MINOR_POWERS,
  HANS_POWERS,
} from "./camp.ts";

export type ModuleValue = string | number | boolean | null;
export interface ModuleObservation {
  module: "marrek" | "tormentor" | "shady-acres" | "grimlash" | "konrad" | "evomorph" | "creech" | "poltergeist" | "groves" | "inkanyamba" | "billy" | "buddyland" | "hans" | "camp" | "geppetto" | "carnival" | "fright" | "maple";
  changes: Record<string, ModuleValue>;
}
type ObservedEvent = {
  inkanyambaReference?: true;
  grovesReference?: true;
  linkedModule?: ModuleObservation;
  id?: string;
  kind: string;
  moduleData?: ModuleObservation;
  momentType?: string;
  killerCard?: string;
  detail?: string;
};

/** Only owner-verified catalogs. Other killers can still record an unnamed reveal. */
export function killerMomentCards(killer: string, type: string) {
  if(killer==='The Tormentor')return [...(type==='dark-power'?TORMENTOR_POWERS:type==='finale'?TORMENTOR_FINALES:[])].sort((a,b)=>a.name.localeCompare(b.name));
  if(killer==='Grimlash')return [...(type==='dark-power'?GRIMLASH_POWERS:type==='finale'?GRIMLASH_FINALES:[])].sort((a,b)=>a.name.localeCompare(b.name));
  if (killer === "Evomorph") return [...(type === "dark-power" ? EVOMORPH_POWERS : type === "finale" ? EVOMORPH_FINALES : [])].sort((a,b)=>a.name.localeCompare(b.name));
  if (killer === "Poltergeist") return [...(type === "dark-power" ? POLTERGEIST_POWERS : type === "finale" ? POLTERGEIST_FINALES : [])].sort((a,b)=>a.name.localeCompare(b.name));
  if (killer === "Inkanyamba") return [...(type === "dark-power" ? INKANYAMBA_POWERS : type === "finale" ? INKANYAMBA_FINALES : [])].sort((a,b)=>a.name.localeCompare(b.name));
  if (killer === "Dr. Fright") return [...(type === "dark-power" ? FRIGHT_POWERS : type === "finale" ? FRIGHT_FINALES : [])].sort((a,b)=>a.name.localeCompare(b.name));
  if (killer === "Geppetto")
    return [
      ...(type === "dark-power"
        ? GEPPETTO_POWERS
        : type === "finale"
          ? GEPPETTO_FINALES
          : []),
    ].sort((a, b) => a.name.localeCompare(b.name));
  if (killer === "Hans")
    return (
      type === "dark-power"
        ? [...HANS_POWERS]
        : type === "finale"
          ? [...HANS_FINALES]
          : []
    ).sort((a, b) => a.name.localeCompare(b.name));
  const cards =
    killer !== "Billy the Bear"
      ? []
      : type === "dark-power"
        ? [...BILLY_POWERS]
        : type === "finale"
          ? [...BILLY_FINALES]
          : [];
  return cards.sort((a, b) => a.name.localeCompare(b.name));
}
export interface ModuleSelection {
  killer: string;
  location: string;
}
/** Verified starting observations only. Board choices and immediate effects stay manual. */
export function startingEventObservations(selection: {
  location: string;
  startingEvent?: string | null;
}): ModuleObservation[] {
  const { location, startingEvent } = selection;
  if (!startingEvent) return [];
  if (location === "Camp Happy Trails") {
    const victim = CAMP_VICTIMS.find(
      (victim) => victim.event === startingEvent,
    );
    if (victim)
      return [
        { module: "camp", changes: { [`victim.${victim.id}`]: "in-play" } },
      ];
    const event = CAMP_ONGOING_EVENTS.find(
      (event) => event.name === startingEvent,
    );
    if (event)
      return [{ module: "camp", changes: { [`event.${event.id}`]: "active" } }];
  }
  if (location === "Buddyland") {
    const victim = SPECIAL_VICTIMS.find(
      (victim) => victim.event === startingEvent,
    );
    if (victim)
      return [
        {
          module: "buddyland",
          changes: { [`victim.${victim.id}`]: "on-board" },
        },
      ];
  }
  return [];
}
export type ModuleState = Record<string, ModuleValue>;
const oneOf = (value: unknown, options: readonly unknown[]) =>
  value === null || options.includes(value);
const count = (value: unknown, max: number) =>
  value === null ||
  (typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= max);
const text = (value: unknown) =>
  value === null || (typeof value === "string" && value.length <= 240);
const member = (list: readonly { id: string }[], id: string) =>
  list.some((item) => item.id === id);
function validField(
  module: ModuleObservation["module"],
  key: string,
  value: unknown,
) {
  if (module === 'shady-acres') return validShadyField(key,value);
  if(module==='marrek')return validMarrekField(key,value);
  if(module==='tormentor')return validTormentorField(key,value);
  if (module === "grimlash") return validGrimlashField(key,value);
  if (module === "konrad") return validKonradField(key,value);
  if (module === "evomorph") return validEvomorphField(key,value);
  if (module === "creech") return validCreechField(key,value);
  if (module === "poltergeist") return validPoltergeistField(key,value);
  if (module === "groves") return validGrovesField(key, value);
  if (module === "inkanyamba") return validInkanyambaField(key, value);
  if (module === "maple") return validMapleField(key, value);
  if (module === "carnival") return validCarnivalField(key, value);
  if (module === "geppetto") return validGeppettoField(key, value);
  const [group, id, field] = key.split(".");
  if (module === "hans") {
    if (key === "secondPower")
      return oneOf(
        value,
        HANS_POWERS.map((c) => c.name),
      );
    return (
      /^minor\.[a-z-]+\.health$/.test(key) &&
      member(HANS_MINOR_POWERS, id) &&
      count(value, 2)
    );
  }
  if (module === "camp") {
    if (/^tunnel\.(a|b)$/.test(key)) return oneOf(value, CAMP_TUNNEL_ROOMS);
    if (
      group === "victim" &&
      key.split(".").length === 2 &&
      member(CAMP_VICTIMS, id)
    )
      return oneOf(value, ["in-play", "saved", "killed", "untracked"]);
    if (
      group === "event" &&
      key.split(".").length === 2 &&
      member(CAMP_EVENTS, id)
    )
      return oneOf(value, ["active", "resolved"]);
    return false;
  }
  if (key === "lastTerror")
    return (
      value === null ||
      BUDDYLAND_TERRORS.some(
        (c) =>
          c.name === value &&
          (module === "billy" ? "killer" in c : "location" in c),
      )
    );
  if (module === "billy") {
    if (key === "powerSourcesReady") return value === true;
    if (key === "rosterComplete") return oneOf(value, [true, false]);
    if (key === "finale")
      return oneOf(
        value,
        BILLY_FINALES.map((c) => c.id),
      );
    if (key === "billyStatus") return oneOf(value, ["active", "defeated"]);
    if (/^bloodlust\.[1-6]$/.test(key)) return text(value);
    if (/^source\.[1-5]\.(status|room)$/.test(key))
      return field === "room"
        ? text(value)
        : oneOf(value, ["active", "inactive", "set-aside"]);
    if (
      group === "buddy" &&
      member(BUDDIES, id) &&
      key.split(".").length === 3
    ) {
      if (field === "health") return count(value, 99);
      if (field === "status")
        return oneOf(value, ["active", "defeated", "removed"]);
      if (field === "withBilly" || field === "waiting")
        return oneOf(value, [true, false]);
      if (field === "room") return text(value);
    }
    if (
      group === "power" &&
      member(BILLY_POWERS, id) &&
      key.split(".").length === 3
    ) {
      if (field === "active" || field === "revealed")
        return oneOf(value, [true, false]);
      const power = BILLY_POWERS.find((p) => p.id === id);
      if (field === "health" && power && "health" in power)
        return count(value, power.health);
    }
  } else {
    if (key === "collapseRoom") return text(value);
    if (
      group === "event" &&
      key.split(".").length === 2 &&
      member(BUDDYLAND_EVENTS, id)
    )
      return oneOf(value, ["active", "resolved"]);
    if (
      group === "victim" &&
      key.split(".").length === 2 &&
      member(SPECIAL_VICTIMS, id)
    )
      return oneOf(value, ["on-board", "saved", "killed", "away"]);
    if (
      group === "item" &&
      member(BUDDYLAND_ITEMS, id) &&
      key.split(".").length === 3
    ) {
      if (field === "status") return oneOf(value, ["carried", "discarded"]);
      if (field === "room") return text(value);
      const item = BUDDYLAND_ITEMS.find((i) => i.id === id);
      if (field === "uses" && item && "uses" in item)
        return count(value, item.uses);
    }
  }
  return false;
}
export function validModuleObservation(
  input: unknown,
): input is ModuleObservation {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const m = input as ModuleObservation;
  if (
    !["marrek", "tormentor", "shady-acres", "grimlash", "konrad", "evomorph", "creech", "poltergeist", "groves", "inkanyamba", "billy", "buddyland", "hans", "camp", "geppetto", "carnival", "fright", "maple"].includes(
      m.module,
    ) ||
    !m.changes ||
    typeof m.changes !== "object" ||
    Array.isArray(m.changes)
  )
    return false;
  const entries = Object.entries(m.changes);
  if (m.module === "fright") return validFrightChanges(m.changes);
  return (
    entries.length > 0 &&
    entries.length <= 20 &&
    entries.every(([key, value]) => validField(m.module, key, value))
  );
}
/** Pass already reduced entries so undo/restore uses the same semantics everywhere. */
export function moduleState(
  entries: readonly ObservedEvent[],
  module: ModuleObservation["module"],
): ModuleState {
  if (module === "fright") { const state=frightState(entries); if(!state) return {}; const {eventId:_id,...snapshot}=state; return {snapshot:JSON.stringify(snapshot),sleep:state.sleep,mode:state.mode,progress:state.path.length,...frightPublic(entries)}; }
  const state: ModuleState = {};
  for (const e of entries) {
    if(module==='grimlash'&&e.kind==='moment') {if(e.momentType==='dark-power') {state.powerRevealed=true;state.power=GRIMLASH_POWERS.find(c=>c.name===e.killerCard)?.id??null;} if(e.momentType==='finale') {state.finaleRevealed=true;state.finale=GRIMLASH_FINALES.find(c=>c.name===e.killerCard)?.id??null;}}
    if(module === "evomorph" && e.kind === "moment") {if(e.momentType === "dark-power") {state.powerRevealed=true; state.power=EVOMORPH_POWERS.find(c=>c.name===e.killerCard)?.id??null;}if(e.momentType === "finale") {state.finaleRevealed=true;state.finale=EVOMORPH_FINALES.find(c=>c.name===e.killerCard)?.id??null;}}
    if (module === "groves" && e.kind === "moment" && e.momentType === "finale") state.finaleRevealed = true;
    if (module === "inkanyamba" && e.kind === "moment") {
      if (e.momentType === "dark-power") { state.powerRevealed = true; state.power = INKANYAMBA_POWERS.find(c => c.name === e.killerCard)?.id ?? null; }
      if (e.momentType === "finale") { state.finaleRevealed = true; state.finale = INKANYAMBA_FINALES.find(c => c.name === e.killerCard)?.id ?? null; }
    }
    if (module === "geppetto" && e.kind === "moment") {
      if (e.momentType === "finale") {
        state.finaleRevealed = true;
        const card = GEPPETTO_FINALES.find((c) => c.name === e.killerCard);
        if (card) state.finale = card.id;
      }
      if (e.momentType === "dark-power") {
        state.powerRevealed = true;
        const card = GEPPETTO_POWERS.find((c) => c.name === e.killerCard);
        if (card) state.power = card.id;
      }
    }
    if (module === "hans" && e.kind === "moment" && e.killerCard) {
      if (
        e.momentType === "dark-power" &&
        HANS_POWERS.some((c) => c.name === e.killerCard)
      )
        state.power = e.killerCard;
      if (
        e.momentType === "finale" &&
        HANS_FINALES.some((c) => c.name === e.killerCard)
      )
        state.finale = e.killerCard;
    }
    // Moment details have already been reduced with undo/restore and corrections.
    // A remembered reveal is evidence of a reveal, not proof the power is still active.
    if (module === "billy" && e.kind === "moment" && e.killerCard) {
      if (e.momentType === "finale") {
        const finale = BILLY_FINALES.find((c) => c.name === e.killerCard);
        if (finale) state.finale = finale.id;
      } else if (e.momentType === "dark-power") {
        const power = BILLY_POWERS.find((c) => c.name === e.killerCard);
        if (power) state[`power.${power.id}.revealed`] = true;
      }
    }
    const observation = e.moduleData?.module === module ? e.moduleData : ["groves","creech"].includes(e.moduleData?.module ?? "") && e.linkedModule?.module === module ? e.linkedModule : undefined;
    if (e.kind !== "module" || !validModuleObservation(observation)) continue;
    for (const [key, value] of Object.entries(observation.changes)) {
      if (value === null) delete state[key];
      else state[key] = value;
    }
  }
  return state;
}
function fieldLabel(module: ModuleObservation["module"], key: string) {
  if (module === "creech") return key.replace(/\./g," ");
  if (module === "poltergeist") return key === "carolyn" ? "Carolyn" : key === "floppy" ? "Mr. Floppy" : POLTERGEIST_MINORS.find(p=>key===`minor.${p.id}`)?.name ?? key;
  if (module === "groves") return grovesLabel(key);
  if (module === "inkanyamba") return key === "wrath" ? "Killer Wrath" : key === "miracleResolved" ? "We Need a Miracle Wrath recorded" : `${INKANYAMBA_MINOR_POWERS.find(p => key === `minor.${p.id}.health`)?.name ?? key} Health`;
  if (module === "maple") return mapleLabel(key);
  if (module === "carnival") {
    const [group, id, field] = key.split(".");
    if (group === "trap")
      return `${CARNIVAL_TRAPS.find((t) => t.id === id)?.name ?? id}${field === "space" ? " space" : ""}`;
    if (group === "event")
      return CARNIVAL_EVENTS.find((e) => e.id === id)?.name ?? key;
    if (group === "person")
      return CARNIVAL_PEOPLE.find((p) => p.id === id)?.name ?? key;
    if (group === "condition")
      return `${CARNIVAL_ITEM_TRAPS.find((t) => t.id === id)?.name ?? id} attached`;
    return (
      (
        {
          werewolf: "Werewolf",
          zappo: "Zappo",
          cart: "Golf Cart",
          searchPenalty: "Lasting Search penalty",
          lastTerrorTrap: "Terror Trap card",
          terrorTrapOutcome: "Terror Trap outcome",
          lastEncounter: "Item Trap encountered",
          encounterOutcome: "Encounter outcome",
        } as Record<string, string>
      )[key] ?? key
    );
  }
  if (module === "geppetto") {
    const [, id, field] = key.split(".");
    if (key.startsWith("minor."))
      return `${GEPPETTO_MINOR_POWERS.find((p) => p.id === id)?.name ?? id} Health`;
    return `Puppet ${id}${field === "protectionUsed" ? " first-hit protection used" : ""}`;
  }
  if (module === "hans")
    return key === "secondPower"
      ? "Second Dark Power revealed"
      : `${HANS_MINOR_POWERS.find((c) => key === `minor.${c.id}.health`)?.name ?? key} Health`;
  if (module === "camp") {
    const [group, id] = key.split(".");
    return group === "victim"
      ? (CAMP_VICTIMS.find((c) => c.id === id)?.name ?? key)
      : group === "event"
        ? (CAMP_EVENTS.find((c) => c.id === id)?.name ?? key)
        : `Secret Tunnel endpoint ${id.toUpperCase()}`;
  }
  if (key === "powerSourcesReady") return "Power sources initialized";
  const [group, id, field] = key.split(".");
  if (group === "source")
    return `Power Source ${id}${field === "room" ? " location" : ""}`;
  if (group === "bloodlust") return `Revealed Bloodlust token ${id}`;
  if (group === "buddy")
    return `${BUDDIES.find((b) => b.id === id)?.name ?? id} ${field === "withBilly" ? "shares Billy’s space" : field === "waiting" ? "awaits activation" : field}`;
  if (group === "power")
    return `${BILLY_POWERS.find((c) => c.id === id)?.name ?? id} ${field === "health" ? "Health" : ""}`.trim();
  if (group === "event")
    return BUDDYLAND_EVENTS.find((c) => c.id === id)?.name ?? id;
  if (group === "item")
    return `${BUDDYLAND_ITEMS.find((c) => c.id === id)?.name ?? id} ${field === "uses" ? "uses remaining" : field}`;
  if (group === "victim")
    return SPECIAL_VICTIMS.find((v) => v.id === id)?.name ?? id;
  return key === "rosterComplete"
    ? "Buddy roster complete"
    : key === "lastTerror"
      ? "Terror drawn"
      : key === "finale"
        ? "Revealed Finale"
        : key === "billyStatus"
          ? "Billy"
          : "Broken token location";
}
function valueLabel(key: string, value: ModuleValue) {
  if (value === null) return "unrecorded";
  if (key === "lastTerrorTrap")
    return CARNIVAL_TRAPS.find((t) => t.id === value)?.name ?? String(value);
  if (key === "terrorTrapOutcome" || key === "encounterOutcome")
    return (
      (
        {
          "canceled-footage": "canceled with Found Footage",
          "avoided-zappo": "avoided using Zappo",
          resolved: "effects resolved",
          placed: "token placed",
        } as Record<string, string>
      )[String(value)] ?? String(value)
    );
  if (key === "finale")
    return BILLY_FINALES.find((c) => c.id === value)?.name ?? String(value);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}
export function describeModule(observation: ModuleObservation) {
  if(observation.module==='marrek')return marrekFacts(marrekState(observation.changes)).join(' ');
  if(observation.module==='tormentor')return tormentorFacts(tormentorState(observation.changes));
  if(observation.module==='shady-acres')return shadyFacts(shadyState(observation.changes)).join(' ')||'Shady Acres observations recorded';
  if(observation.module==='grimlash')return Object.entries(observation.changes).filter(([k])=>k!=='initialized').map(([k,v])=>`${k.replace(/\./g,' ')}: ${GRIMLASH_HARVEST.find(c=>c.id===v)?.name??v??'not recorded'}`).join('; ');
  if(observation.module === "konrad") return konradFacts(observation.changes).join(" ") || "USS Konrad state recorded";
  if(observation.module === "evomorph") return evomorphFacts(observation.changes);
  if(observation.module==='creech')return creechFacts(observation.changes).join(' ') || Object.entries(observation.changes).filter(([k])=>k!=='initialized').map(([k,v])=>`${k.replace(/\./g,' ')}: ${v??'not recorded'}`).join('; ');
  if(observation.module==='poltergeist')return Object.entries(observation.changes).filter(([k])=>!['initialized','minorsRemoved'].includes(k)).map(([k,v])=>`${fieldLabel('poltergeist',k)}: ${v===null?'not recorded':String(v).replace(/-/g,' ')}`).join('; ');
  if (observation.module === "groves") return Object.entries(observation.changes).map(([key,value])=>`${grovesLabel(key)}: ${grovesValue(key,value)}`).join("; ");
  if (observation.module === "maple") return Object.entries(observation.changes).map(([key,value])=>`${mapleLabel(key)}: ${mapleValue(key,value)}`).join("; ");
  if (observation.module === "fright") { const s=parseFright(observation.changes.snapshot); return s ? describeFright(s) : "Dr. Fright observation"; }
  return Object.entries(observation.changes)
    .map(
      ([key, value]) =>
        `${fieldLabel(observation.module, key)}: ${valueLabel(key, value)}`,
    )
    .join("; ");
}
export function moduleContext(
  selection: ModuleSelection,
  entries: readonly ObservedEvent[],
) {
  const context: Record<string, ModuleState> = {};
  if(selection.location==='Marrek Warehouse'&&entries.some(e=>e.moduleData?.module==='marrek')){const s=marrekState(moduleState(entries,'marrek'));s.exits=marrekExits(s,entries);delete s.initialized;context.marrek={snapshot:JSON.stringify(s)};}
  if(selection.killer==='The Tormentor'&&entries.some(e=>e.moduleData?.module==='tormentor'))context.tormentor={snapshot:serializeTormentor(tormentorState(moduleState(entries,'tormentor'))),power:tormentorCard(entries,'dark-power')??null,finale:tormentorCard(entries,'finale')??null};
  if(context.marrek&&context.tormentor){const t=tormentorState(context.tormentor),locks=marrekExits(marrekState(context.marrek));t.exits=Object.fromEntries(MARREK_EXITS.map(e=>[e.name,locks[e.id]]));context.tormentor.snapshot=serializeTormentor(t);}
  if(selection.location==='Shady Acres'&&entries.some(e=>e.moduleData?.module==='shady-acres')) {const s=shadyState(moduleState(entries,'shady-acres'));delete s.initialized;context.shady={snapshot:JSON.stringify(s)};}
  if(selection.killer==='Grimlash'&&entries.some(e=>e.moduleData?.module==='grimlash')) {const s=moduleState(entries,'grimlash');delete s.initialized;context.grimlash=s;}
  if(selection.location === "USS Konrad" && entries.some(e=>e.moduleData?.module === "konrad")) context.konrad={snapshot:canonicalKonradSnapshot(moduleState(entries,"konrad").snapshot)!};
  if(selection.killer === "Evomorph" && entries.some(e=>e.moduleData?.module === "evomorph")) {const s=moduleState(entries,"evomorph");delete s.initialized;context.evomorph=s;}
  if (selection.killer === "Dr. Fright") { const facts=frightPublic(entries); if(facts) context.fright=facts; }
  for (const module of [
    "creech",
    "poltergeist",
    "groves",
    "inkanyamba",
    "billy",
    "buddyland",
    "hans",
    "camp",
    "geppetto",
    "carnival",
    "maple",
  ] as const) {
    const applies =
      module === "creech" ? selection.location === "Creech Manor" : module === "poltergeist" ? selection.killer === "Poltergeist" : module === "groves" ? selection.location === "Sacred Groves" : module === "inkanyamba" ? selection.killer === "Inkanyamba" : module === "maple" ? selection.location === "Maple Lane" : module === "carnival"
        ? selection.location === "Carnival of Blood"
        : module === "geppetto"
          ? selection.killer === "Geppetto"
          : module === "billy"
            ? selection.killer === "Billy the Bear"
            : module === "hans"
              ? selection.killer === "Hans"
              : module === "camp"
                ? selection.location === "Camp Happy Trails"
                : selection.location === "Buddyland";
    if (!applies) continue;
    // Older generic Inkanyamba reveals had no module context. Do not change
    // historical death fingerprints until an explicit owner observation exists.
    if (module === "inkanyamba" && !entries.some(e => (e.kind === "module" && (e.moduleData?.module === "inkanyamba" || e.linkedModule?.module === "inkanyamba")) || e.inkanyambaReference === true)) continue;
    if (module === "groves" && !entries.some(e => (e.kind === "module" && e.moduleData?.module === "groves") || e.grovesReference === true)) continue;
    if (module === "creech" && !entries.some(e=>e.kind==="module"&&e.moduleData?.module==="creech")) continue;
    if (module === "poltergeist" && !entries.some(e=>e.kind==='module'&&(e.moduleData?.module==='poltergeist'||e.linkedModule?.module==='poltergeist'))) continue;
    const state = moduleState(entries, module);
    if (module === 'creech') delete state.initialized;
    if (module === 'poltergeist') { delete state.initialized; const power=poltergeistPower(entries);state.powerKnown=power.known;state.epicRequired=power.known?power.epic:null; }
    if (module === "groves") { delete state.holyManProvisional; }
    // A UI initialization marker is not a game fact or part of a death fingerprint.
    delete state.powerSourcesReady;
    if (module === "inkanyamba") delete state.miracleResolved;
    if (
      module === "hans" &&
      (state.finale !== "Dark, Darker, Darkest" ||
        state.secondPower === state.power)
    )
      delete state.secondPower;
    if (module === "camp" && state["event.secret-tunnel"] !== "active") {
      delete state["tunnel.a"];
      delete state["tunnel.b"];
    }
    if (module === "camp" && state["tunnel.a"] === state["tunnel.b"])
      delete state["tunnel.b"];
    if (module === "carnival")
      for (const trap of CARNIVAL_TRAPS)
        if (state[`trap.${trap.id}.status`] !== "placed")
          delete state[`trap.${trap.id}.space`];
    if (Object.keys(state).length) context[module] = state;
  }
  return Object.keys(context).length ? context : undefined;
}
export function moduleStoryBeats(
  selection: ModuleSelection,
  entries: readonly ObservedEvent[],
): string {
  const context = moduleContext(selection, entries);
  if(context?.marrek){const killer=moduleStoryBeats({...selection,location:''},entries);let place='';for(const fact of marrekFacts(marrekState(context.marrek)))if(place.length+fact.length+1<=(killer?535:875))place+=fact+' ';let threat='';for(const fact of killer.split(/(?<=\.)\s+/))if(threat.length+fact.length+1<=335)threat+=fact+' ';return [place.trim(),threat.trim()].filter(Boolean).join('\n');}
  if(context?.tormentor){const place=moduleStoryBeats({...selection,killer:''},entries);let threat='';for(const fact of tormentorFacts(tormentorState(context.tormentor),entries).split(/(?<=\.)\s+/))if(threat.length+fact.length+1<=(place?340:870))threat+=fact+' ';return [threat.trim(),place.slice(0,535)].filter(Boolean).join('\n');}
  if (!context) return "";

  // Preserve the established output for every other location. Each owner gets
  // room inside the existing 900-character module budget for Carnival mixes.
  if(context.shady) {
    const killer=moduleStoryBeats({...selection,location:''},entries);
    const facts=shadyFacts(shadyState(context.shady));
    let location='';for(const fact of facts)if(location.length+fact.length+1<=(killer?530:875))location+=fact+' ';
    let k='';for(const fact of killer.split(/(?<=\.)\s+/))if(k.length+fact.length+1<=335)k+=fact+' ';
    return [location&&`Shady Acres: ${location.trim()}`,k&&`Killer: ${k.trim()}`].filter(Boolean).join('\n');
  }
  if(context.konrad) {
    const killer=moduleStoryBeats({...selection,location:""},entries);
    let location="";for(const fact of konradFacts(context.konrad))if(location.length+fact.length+1<=(killer?535:880))location+=fact+" ";
    let priority=killer;
    if(selection.killer==='Evomorph'&&context.evomorph){const e=context.evomorph,card=EVOMORPH_AMBUSH.find(c=>c.id===e.ambushId);priority=`Evomorph stage: ${e.stage??'unknown'}; presence: ${e.presence??'unknown'}. ${card&&(e.ambushFace==='youngling'||e.ambushFace==='adult')?`Recorded Ambush face ${e.ambushFace}, Danger ${card[e.ambushFace]}; preserve drawn face across evolution. `:''}${e.stage==='hatchling'?'Only Hatchling-kill Bloodlust; other increases become Time. ':''}`;}
    let k="";for(const fact of priority.split(/(?<=\.)\s+/))if(k.length+fact.length+1<=340)k+=fact+" ";
    return [location&&`USS Konrad: ${location.trim()}`,k&&`Killer: ${k.trim()}`].filter(Boolean).join("\n");
  }
  if (context.creech) {
    const killer = moduleStoryBeats({...selection,location:""},entries);
    const budget = killer ? 535 : 880;
    let location = "";
    for(const fact of creechFacts(context.creech)) if(location.length+fact.length+1<=budget)location+=fact+" ";
    // Objective comes first in the existing Poltergeist facts; whole sentences only.
    let killerFacts="";
    for(const fact of killer.split(/(?<=\.)\s+/))if(killerFacts.length+fact.length+1<=340)killerFacts+=fact+" ";
    return [location&&`Creech Manor: ${location.trim()}`,killerFacts&&`Killer: ${killerFacts.trim()}`].filter(Boolean).join("\n");
  }
  if(context.grimlash&&!context.konrad&&!context.creech&&!context.groves&&!context.maple&&!context.carnival) {const location=moduleStoryBeats({...selection,killer:''},entries);const budget=location?440:870;let killer='';for(const fact of grimlashFacts(context.grimlash).split(/(?<=\.)\s+/))if(killer.length+fact.length+1<=budget)killer+=fact+' ';return [killer.trim(),location.slice(0,440)].filter(Boolean).join('\n');}
  if (context.groves) {
    const killer = moduleStoryBeats({ ...selection, location: "" }, entries);
    const facts = grovesFacts(context.groves);
    return [`Sacred Groves: ${facts.slice(0,killer ? 525 : 875)}`, killer && `Killer: ${killer.slice(0,340)}`].filter(Boolean).join("\n");
  }
  if (context.maple) {
    const killer = moduleStoryBeats({ ...selection, location: "" }, entries);
    const facts = mapleStoryFacts(context.maple);
    // Reserve both owners' space before composing the bounded ending context.
    const budget = killer ? 535 : 880;
    let location = "";
    for (const fact of facts) if (location.length + fact.length + 1 <= budget) location += `${fact} `;
    return [location && `Maple Lane: ${location.trim()}`,killer && `Killer: ${killer.slice(0,340)}`].filter(Boolean).join("\n");
  }
  if (context.carnival) {
    const killer = moduleStoryBeats({ ...selection, location: "" }, entries);
    const carnival = carnivalStoryFacts(context.carnival).join(" ");
    return [
      carnival && `Carnival: ${carnival.slice(0, killer ? 535 : 880)}`,
      killer && `Killer: ${killer.slice(0, 340)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }
  const lines: string[] = [];
  if(context.evomorph) {const s=context.evomorph;lines.push(`Evomorph ${s.stage??'stage unknown'}, ${s.presence??'presence unknown'}${s.ambushId?`; Ambush face ${s.ambushFace??'unknown'} / ${s.ambushId}`:''}.`);lines.push(evomorphFacts(s,entries));}
  if(context.poltergeist) lines.push(poltergeistFacts(context.poltergeist,poltergeistPower(entries)));
  if (context.inkanyamba) lines.push(...inkanyambaFacts(context.inkanyamba));
  if (context.fright) {
    const s=context.fright;
    const recorded = FRIGHT_MINOR_POWERS.filter(p => s[`minor.${p.id}.health`] !== undefined).map(p => `${p.name} ${s[`minor.${p.id}.health`]}/${p.health}${s[`minor.${p.id}.health`] === 0 ? " removed" : ""}`);
    const conditions = FRIGHT_CONDITIONS.filter(c => s[`condition.${c.id}`] === true).map(c => c.name);
    if (recorded.length || conditions.length) lines.push(`Dr. Fright: Final Girl ${s.sleep}. ${recorded.join("; ")}${conditions.length ? "; Active: " + conditions.join(", ") : ""}.`);
    else lines.push(`Dr. Fright: Final Girl ${s.sleep}. ${s.sleep === "asleep" ? "She may attack him normally but cannot save Victims or have them follow. Ordinary Victims remain in the physical Location." : "Awake normally prevents attacks between her and Dr. Fright; apply only recorded card exceptions."}`);
    if(s.boilerCardsResolved !== undefined) lines.push(`Boiler Room: ${s.boilerCardsResolved}/4 cards resolved${s.attackPending?", an attack awaits physical defense":""}. A revealed attack does not establish damage.`);
    if(s.power) lines.push(`Power: ${FRIGHT_POWERS.find(c=>c.id===s.power)?.name}.`);
    if(s.finale) lines.push(`Finale: ${FRIGHT_FINALES.find(c=>c.id===s.finale)?.name}.`);
  }
  const geppetto = context.geppetto;
  if (geppetto) {
    const count = geppettoPuppetCounts(geppetto);
    if (geppetto.finaleRevealed)
      lines.push(
        `Geppetto Finale revealed: ${GEPPETTO_FINALES.find((c) => c.id === geppetto.finale)?.name ?? "card not specified"}.`,
      );
    if (geppetto.powerRevealed)
      lines.push(
        `Geppetto Dark Power revealed: ${GEPPETTO_POWERS.find((c) => c.id === geppetto.power)?.name ?? "card not specified"}.`,
      );
    lines.push(
      count.recorded
        ? `Puppets: ${count.onBoard} on board, ${count.ready} Ready, ${count.exhausted} Exhausted. Exhausted is reusable, not permanent death; no victim deaths inferred.`
        : "Puppet tray incompletely recorded.",
    );
    for (const p of GEPPETTO_MINOR_POWERS)
      if (typeof geppetto[`minor.${p.id}.health`] === "number")
        lines.push(
          `${p.name}: ${geppetto[`minor.${p.id}.health`]}/2 Health${geppetto[`minor.${p.id}.health`] === 0 ? ", removed" : ""}.`,
        );
  }
  const billy = context.billy;
  if (billy) {
    if (billy.finale)
      lines.push(
        `Revealed Finale: ${BILLY_FINALES.find((f) => f.id === billy.finale)?.name}`,
      );
    if (billy.billyStatus) lines.push(`Billy: ${billy.billyStatus}`);
    if (billy.rosterComplete === true)
      lines.push("Buddy roster confirmed complete.");
    if (billy.lastTerror)
      lines.push(`Last recorded Billy Terror: ${billy.lastTerror}`);
    for (const b of BUDDIES) {
      const prefix = `buddy.${b.id}`;
      if (billy[`${prefix}.status`] !== undefined)
        lines.push(
          `${b.name}: ${billy[`${prefix}.status`]}${billy[`${prefix}.health`] !== undefined ? `, Health ${billy[`${prefix}.health`]}` : ""}`,
        );
    }
    const sources = [1, 2, 3, 4, 5].filter(
      (i) => billy[`source.${i}.status`] !== undefined,
    );
    if (sources.length)
      lines.push(
        `Power Sources (${sources.length}/5 recorded): ${sources.map((i) => `${i} ${billy[`source.${i}.status`]}`).join(", ")}`,
      );
    for (const p of BILLY_POWERS)
      if (billy[`power.${p.id}.active`] !== undefined)
        lines.push(
          `${p.name}: ${billy[`power.${p.id}.active`] ? "active" : "removed"}`,
        );
      else if (billy[`power.${p.id}.revealed`] === true)
        lines.push(
          `${p.name}: revealed earlier; current active status untracked`,
        );
    for (const i of [1, 2, 3, 4, 5, 6])
      if (billy[`bloodlust.${i}`])
        lines.push(
          `Revealed token ${i}: ${String(billy[`bloodlust.${i}`]).slice(0, 100)}`,
        );
  }
  const venue = context.buddyland;
  if (venue) {
    if (venue.lastTerror)
      lines.push(`Last recorded Location Terror: ${venue.lastTerror}`);
    for (const v of SPECIAL_VICTIMS)
      if (venue[`victim.${v.id}`])
        lines.push(`${v.name}: ${venue[`victim.${v.id}`]}`);
    if (venue.collapseRoom) lines.push(`Broken token: ${venue.collapseRoom}`);
    for (const e of BUDDYLAND_EVENTS)
      if (venue[`event.${e.id}`])
        lines.push(`${e.name}: ${venue[`event.${e.id}`]}`);
    for (const i of BUDDYLAND_ITEMS)
      if (venue[`item.${i.id}.status`])
        lines.push(
          `${i.name}: ${venue[`item.${i.id}.status`]}${venue[`item.${i.id}.uses`] !== undefined ? `, ${venue[`item.${i.id}.uses`]} uses` : ""}`,
        );
  }
  const hans = context.hans;
  if (hans) {
    if (hans.power) lines.push(`Hans Dark Power revealed: ${hans.power}.`);
    if (hans.finale) lines.push(`Hans Finale revealed: ${hans.finale}.`);
    if (hans.secondPower)
      lines.push(`Second Dark Power revealed: ${hans.secondPower}.`);
    for (const p of HANS_MINOR_POWERS)
      if (hans[`minor.${p.id}.health`] !== undefined)
        lines.push(
          `${p.name}: ${hans[`minor.${p.id}.health`]} Health remaining${hans[`minor.${p.id}.health`] === 0 ? ", removed" : ""}.`,
        );
  }
  const camp = context.camp;
  if (camp) {
    for (const v of CAMP_VICTIMS)
      if (camp[`victim.${v.id}`])
        lines.push(`${v.name}: ${camp[`victim.${v.id}`]}.`);
    for (const e of CAMP_EVENTS)
      if (camp[`event.${e.id}`])
        lines.push(`Camp Event ${e.name}: ${camp[`event.${e.id}`]}.`);
    if (camp["tunnel.a"] || camp["tunnel.b"])
      lines.push(
        `Secret Tunnel endpoints recorded: ${[camp["tunnel.a"], camp["tunnel.b"]].filter(Boolean).join(" / ")}.`,
      );
  }
  return lines.join("\n");
}
export function buddylandReferences(
  selection: ModuleSelection,
  context?: Record<string, ModuleState>,
  attacker?: string,
) {
  const refs: { name: string; effect: string }[] = [];
  if(selection.location==='Marrek Warehouse'){refs.push({name:'Marrek Warehouse',effect:MARREK_VISUAL});if(context?.marrek)refs.push({name:'Warehouse observations',effect:marrekFacts(marrekState(context.marrek)).join(' ')});}
  if(selection.killer==='The Tormentor'&&context?.tormentor){refs.push({name:'Tormentor observations',effect:tormentorFacts(tormentorState(context.tormentor))});for(const card of [...TORMENTOR_POWERS,...TORMENTOR_FINALES])if(card.name===context.tormentor.power||card.name===context.tormentor.finale)refs.push({name:card.name,effect:card.effect+' Recording the reveal does not prove its actions or consequences occurred.'});}
  if (selection.location === "Sacred Groves") {
    refs.push({name:"Sacred Groves",effect:GROVES_VISUAL});
    for(const e of GROVES_EVENTS) if(context?.groves?.[`event.${e.id}`] === "active") refs.push({name:e.name,effect:`${e.effect} Activation alone does not prove any conditional effect occurred.`});
  }
  if (selection.killer === 'Evomorph' && context?.evomorph) refs.push({name:'Evomorph observations',effect:evomorphFacts(context.evomorph)});
  if (selection.killer === "Poltergeist" && context?.poltergeist) {
    const state=context.poltergeist;
    if(attacker==='Clown Doll'||attacker==='Behemoth') refs.push({name:attacker,effect:'A temporary Terror-card apparition. It disappears after the encounter. It is not an ordinary Victim or a permanent Minion. Its presence alone establishes no killing.'});
    refs.push({name:'Poltergeist objective',effect:poltergeistFacts(state)+' The spirit cannot be attacked, damaged or killed. Finding is not escape; only recorded outcomes happened.'});
    for(const p of POLTERGEIST_MINORS) if(state[`minor.${p.id}`]==='active') refs.push({name:p.name,effect:p.effect});
  }
  if(selection.location==='Shady Acres'&&context?.shady){const s=shadyState(context.shady);for(const c of s.curses.filter(c=>c.status==='active')){const card=SHADY_CURSES.find(x=>x.id===c.card);if(card)refs.push({name:card.name,effect:card.effect+' Presence does not prove resolution.'});}for(const fact of shadyFacts(s))refs.push({name:'Shady Acres observation',effect:fact});}
  if(selection.killer==='Grimlash') {const s=context?.grimlash??{};refs.push({name:'Grimlash',effect:grimlashFacts(s)});for(const c of [...GRIMLASH_POWERS,...GRIMLASH_FINALES])if(c.id===s.power||c.id===s.finale)refs.push({name:c.name,effect:c.effect+' Revelation does not prove resolution.'});for(const c of GRIMLASH_MINORS)if(typeof s[`minor.${c.id}.health`]==='number')refs.push({name:c.name,effect:s[`minor.${c.id}.health`]===0?'Removed; no longer active.':c.effect});}
  if (selection.killer === "Inkanyamba") {
    const state = context?.inkanyamba ?? {};
    refs.push({name:"Inkanyamba the Avenger", effect:"A masked human-shaped avenger with paired curved weapons in the selected Location; never a serpent or weather-controlled creature. Wrath is recorded anger, not proof of an Unleash, injury, movement or extra casualty."});
    for (const c of [...INKANYAMBA_POWERS, ...INKANYAMBA_FINALES]) if(c.id === state.power || c.id === state.finale) refs.push({name:c.name,effect:`${c.effect} A reveal does not establish that its conditional effects occurred.`});
    for (const p of INKANYAMBA_MINOR_POWERS) { const h=state[`minor.${p.id}.health`]; if(typeof h === "number") refs.push({name:p.name,effect:h === 0 ? "Recorded removed; no longer active." : `${p.effect} ${h}/3 separate Health. Do not infer unrecorded rolls or outcomes.`}); }
  }
  if (selection.killer === "Billy the Bear") {
    const state = context?.billy ?? {};
    for (const p of BILLY_POWERS)
      if (state[`power.${p.id}.active`] === true)
        refs.push({ name: p.name, effect: p.effect });
      else if (state[`power.${p.id}.revealed`] === true)
        refs.push({
          name: p.name,
          effect: `${p.effect} The player recorded its reveal, not whether it remains active. Do not assume it caused this death.`,
        });
    const finale = BILLY_FINALES.find((f) => f.id === state.finale);
    if (finale) refs.push({ name: finale.name, effect: finale.effect });
    const buddy = BUDDIES.find(
      (b) => b.name.toLowerCase() === attacker?.toLowerCase(),
    );
    if (buddy)
      refs.push({
        name: buddy.name,
        effect: `Animatronic Buddy, Attack ${buddy.attack}, Movement ${buddy.movement}, Initiative ${buddy.initiative}. ${buddy.ability}`,
      });
  }
  if (selection.location === "Buddyland") {
    for (const event of BUDDYLAND_EVENTS)
      if (context?.buddyland?.[`event.${event.id}`] === "active")
        refs.push({ name: event.name, effect: event.effect });
  }
  if(selection.location==='Creech Manor') {
    const state=context?.creech??{};
    for(const e of CREECH_EVENTS)if(state[`event.${e.id}`]==='active')refs.push({name:e.name,effect:e.effect+' Activation establishes no additional casualties.'});
    for(const h of CREECH_PEOPLE)if(state[`hunter.${h.id}`])refs.push({name:h.name,effect:`Recorded hunter status: ${state[`hunter.${h.id}`]??'unknown'}. Only an explicit death-specific victim field identifies the victim of this death. No additional casualty is implied.`});
    for(const fact of creechFacts(state))refs.push({name:'Creech Manor observation',effect:fact});
  }
  return refs;
}

/** Read only the applicable module's recorded observations. Never trigger effects. */
export function moduleReferences(
  selection: ModuleSelection,
  context?: Record<string, ModuleState>,
  attacker?: string,
  victim?: string,
  mechanism?: string,
) {
  const refs = buddylandReferences(selection, context, attacker);
    if(selection.killer==='The Tormentor'){const trap=TORMENTOR_TRAPS.find(c=>c.name===mechanism);if(trap)refs.push({name:trap.name,effect:`${trap.deck==='girl'?'Final Girl':'Victim'} Death Trap. Tasks: ${trap.tasks.join('; ')}. Progress: ${trap.checkpoints.join(' → ')}. ${trap.fail} Only this recorded death is established; costs and other casualties are not inferred.`});}
  if(selection.location === "USS Konrad" && context?.konrad) for(const effect of konradFacts(context.konrad)) refs.push({name:"USS Konrad observation",effect});
  if (selection.location === "Sacred Groves") {
    const state=context?.groves ?? {};
    for(const person of GROVES_PEOPLE) if(state[`person.${person.id}`] || victim === person.name) refs.push({name:person.name,effect:`${victim === person.name ? "Explicit scene victim." : "Not established as this scene's victim."} Recorded role status: ${state[`person.${person.id}`] ?? "unknown"}. The role identifies an existing Victim; the Holy Man's ritual removal is not a kill.`});
    const facts=grovesFacts(state);if(facts)refs.push({name:"Sacred Groves observations",effect:facts});
  }
  if (selection.location === "Maple Lane") {
    const state = context?.maple ?? {};
    for (const person of MAPLE_PEOPLE) if (state[`person.${person.id}`] || victim === person.name) refs.push({name:person.name,effect:`${victim === person.name ? "Explicit scene victim." : "Not established as this scene’s victim."} Recorded status: ${state[`person.${person.id}`] ?? "unknown"}. ${MAPLE_EVENTS.find(e=>e.id===person.event)!.effect}`});
    for (const event of MAPLE_EVENTS) if (state[`event.${event.id}`] === "active") refs.push({name:event.name,effect:`${event.effect} Card activation is not proof of physical effects or extra casualties.`});
    for (const fact of mapleStoryFacts(state)) refs.push({name:"Maple Lane observation",effect:fact});
    if (mechanism === "Fire") refs.push({name:"Fire",effect:MAPLE_EVENTS.find(e=>e.id==="fire")!.effect});
    if (mechanism === "Booby Trap") refs.push({name:"Booby Trap",effect:MAPLE_ITEMS.find(i=>i.id==="odds")!.effect+" Its printed target is an Enemy. Do not infer an ordinary Victim death from an armed trap."});
    if (mechanism === "Street traffic") refs.push({name:"Street traffic",effect:"Only the explicit death details establish a traffic casualty; the Cop Car's presence does not establish an attacker."});
  }
  if (selection.killer === "Dr. Fright") {
    const state=context?.fright;
    for (const p of FRIGHT_MINOR_POWERS) {
      const health = state?.[`minor.${p.id}.health`];
      if (typeof health === "number") refs.push({ name: p.name, effect: health === 0 ? "Recorded as removed, no longer active." : `${p.effect} ${health}/${p.health} separate Health remaining. Infer no extra damage or deaths.` });
    }
    for (const c of FRIGHT_CONDITIONS) if (state?.[`condition.${c.id}`] === true) refs.push({name:c.name,effect:c.effect});
    for(const card of [...FRIGHT_POWERS,...FRIGHT_FINALES]) if(card.id === state?.power || card.id === state?.finale) refs.push({name:card.name,effect:card.effect});
    refs.push({name:"Dr. Fright — Awake and Asleep",effect:"Awake normally prevents attacks between the Final Girl and Dr. Fright, except a recorded applicable Power or temporary card effect. Asleep permits normal combat but Victims cannot follow or be saved. The tracked Boiler Room attacks target only the Final Girl; never infer damage or transport Victims into her sequence. Victims can experience their own private nightmares while their bodies remain at the selected Location. Her sleep status is not theirs."});
  }
  if (selection.location === "Carnival of Blood") {
    const state = context?.carnival ?? {};
    for (const e of CARNIVAL_EVENTS)
      if (state[`event.${e.id}`] === "active")
        refs.push({
          name: e.name,
          effect: `${e.effect} Reference only; infer no extra casualties or stat changes.`,
        });
    for (const t of CARNIVAL_TRAPS)
      if (state[`trap.${t.id}.status`] === "placed" || mechanism === t.name)
        refs.push({
          name: t.name,
          effect: `${t.effect} Persistent board token: kills Victims there or entering; all Enemies ignore it. A token's presence alone does not establish the cause of this death.`,
        });
    for (const t of CARNIVAL_ITEM_TRAPS)
      if (state[`condition.${t.id}`] === "active" || mechanism === t.name)
        refs.push({ name: t.name, effect: t.effect });
    if (state.searchPenalty === true)
      refs.push({
        name: "So Much Junk lasting penalty",
        effect:
          "Search rolls use one fewer die, minimum one, for the rest of the game. Zappo may have been regained; this penalty remains recorded.",
      });
    for (const p of CARNIVAL_PEOPLE)
      if (state[`person.${p.id}`] || victim === p.name)
        refs.push({
          name: p.name,
          effect: `Recorded status: ${state[`person.${p.id}`] ?? "unrecorded"}. Only a matching death-specific victim field identifies this scene’s victim.`,
        });
    if (state.werewolf === "in-play")
      refs.push({
        name: "Werewolf",
        effect:
          "Full Moon’s transformed performer cannot be targeted, saved or killed; its presence does not establish that it caused this death.",
      });
    if (state.zappo)
      refs.push({
        name: "Zappo",
        effect: `Small carnival monkey, current state ${state.zappo}; fleeing or being discarded is not a Victim death.`,
      });
  }
  if (selection.killer === "Geppetto") {
    const state = context?.geppetto ?? {};
    if (
      attacker === "Puppet" ||
      GEPPETTO_PUPPETS.some((p) => p.name === attacker)
    )
      refs.push({
        name: attacker!,
        effect:
          "Geppetto’s humanlike marionette Minion, normally one Health and one damage, with movement matching Geppetto. Two-space tether applies unless the recorded Finale changes it. A selected attacker establishes this scene’s attacker only. Never substitute Buddyland animatronics.",
      });
    for (const c of [...GEPPETTO_POWERS, ...GEPPETTO_FINALES])
      if (state.power === c.id || state.finale === c.id)
        refs.push({
          name: c.name,
          effect: `${c.effect} Reference only: a reveal does not establish that this effect caused the recorded death.`,
        });
    for (const p of GEPPETTO_MINOR_POWERS) {
      const health = state[`minor.${p.id}.health`];
      if (typeof health === "number")
        refs.push({
          name: p.name,
          effect:
            health === 0
              ? "Recorded as removed, no longer active."
              : `${p.effect} ${health}/2 separate Health remaining. Do not infer extra damage or deaths.`,
        });
    }
  }
  if (selection.killer === "Hans" && context?.hans) {
    const state = context.hans;
    for (const p of HANS_POWERS)
      if (state.power === p.name || state.secondPower === p.name)
        refs.push({
          name: p.name,
          effect: `${p.effect} Its reveal was recorded; do not assume it caused this death.`,
        });
    const finale = HANS_FINALES.find((c) => c.name === state.finale);
    if (finale) refs.push({ name: finale.name, effect: finale.effect });
    for (const p of HANS_MINOR_POWERS) {
      const health = state[`minor.${p.id}.health`];
      if (typeof health === "number")
        refs.push({
          name: p.name,
          effect:
            health === 0
              ? "Recorded as removed, no longer active."
              : `${p.effect} ${health} Health remaining. Do not add this Health to Hans’s general Health.`,
        });
    }
  }
  if (selection.location === "Camp Happy Trails") {
    const state = context?.camp ?? {};
    for (const e of CAMP_EVENTS)
      if (state[`event.${e.id}`] === "active")
        refs.push({
          name: e.name,
          effect: `${e.effect} This recorded ongoing effect does not establish an additional death or rescue.`,
        });
    for (const v of CAMP_VICTIMS)
      if (state[`victim.${v.id}`] || v.name === victim) {
        const event = CAMP_EVENTS.find((e) => e.name === v.event)!;
        refs.push({
          name: v.name,
          effect: `${v.name === victim ? "Explicitly selected as this scene’s victim." : `Recorded status: ${state[`victim.${v.id}`]}.`} ${event.effect} Do not infer this person is the victim of this scene without a matching death-specific victim field. No additional Health, Horror, Time or Bloodlust change is established.`,
        });
      }
    const hazard =
      CAMP_EVENTS.find((c) => c.name === mechanism) ??
      CAMP_TERRORS.find((c) => c.name === "Fire!" && mechanism === "Fire");
    if (hazard && !refs.some((r) => r.name === hazard.name))
      refs.push({
        name: hazard.name,
        effect: `${hazard.effect} The explicitly recorded mechanism applies to this death only, not proof of an ongoing hazard or extra casualties.`,
      });
  }
  if(selection.location==='Creech Manor') {
    const state=context?.creech??{};
    for(const e of CREECH_EVENTS)if(state[`event.${e.id}`]==='active')refs.push({name:e.name,effect:e.effect+' Activation establishes no additional casualties.'});
    for(const h of CREECH_PEOPLE)if(state[`hunter.${h.id}`]||h.name===victim)refs.push({name:h.name,effect:`Recorded hunter status: ${state[`hunter.${h.id}`]??'unknown'}. Only an explicit death-specific victim field identifies the victim of this death. No additional casualty is implied.`});
    for(const fact of creechFacts(state))refs.push({name:'Creech Manor observation',effect:fact});
  }
  return refs;
}

/** A remembered find establishes possession at that moment, never later use. */
export function moduleItemBeats(
  selection: ModuleSelection,
  entries: readonly ObservedEvent[],
) {
  const locationCatalog =
    selection.location === "Marrek Warehouse" ? MARREK_ITEMS : selection.location === "Shady Acres" ? SHADY_ITEMS : selection.location === "USS Konrad" ? KONRAD_ITEMS : selection.location === "Creech Manor" ? CREECH_ITEMS : selection.location === "Sacred Groves" ? GROVES_ITEMS : selection.location === "Maple Lane" ? MAPLE_ITEMS : selection.location === "Camp Happy Trails"
      ? CAMP_ITEMS
      : selection.location === "Carnival of Blood"
        ? CARNIVAL_ITEMS
        : selection.location === "Buddyland"
          ? BUDDYLAND_ITEMS
        : [];
  const catalog=[...locationCatalog,...(selection.killer==='Poltergeist'?POLTERGEIST_ITEMS:[])];
  return entries
    .filter((e) => e.kind === "moment" && e.momentType === "item" && e.detail)
    .slice(-2)
    .flatMap((e) => {
      const item = catalog.find(
        (c) =>
          c.name.toLowerCase().replace(/’/g, "'") ===
          e.detail!.trim().toLowerCase().replace(/’/g, "'"),
      );
      return item
        ? [
            `Found ${item.name}: ${item.effect} Finding does not establish use, charges remaining or current inventory.`,
          ]
        : [];
    })
    .join("\n");
}

/** Called only for a brand-new log, persisted with its first observation. */
export function initialModuleObservations(
  selection: {
    killer: string;
    location: string;
    startingEvent?: string | null;
    setupScenario?: string | null;
  },
  initializeKiller: boolean,
  initializeCarnival = false,
  initializeBilly = false,
  initializeMaple = false,
  initializeInkanyamba = false,
  initializeGroves = false,
  initializePoltergeist = false,
  initializeCreech = false,
  initializeEvomorph = false,
  initializeKonrad = false,
  initializeGrimlash = false,
  initializeShady = false,
  initializeTormentor = false,
  initializeMarrek = false,
): ModuleObservation[] {
  return [
    ...(initializeMarrek && selection.location==='Marrek Warehouse' ? [{module:'marrek' as const,changes:initialMarrek(selection.startingEvent)}] : []),
    ...(initializeTormentor && selection.killer==='The Tormentor' ? [{module:'tormentor' as const,changes:initialTormentor()}] : []),
    ...(initializeShady && selection.location==='Shady Acres' ? [{module:'shady-acres' as const,changes:initialShady(selection.startingEvent)}] : []),
    ...(initializeGrimlash && selection.killer==='Grimlash' ? [{module:'grimlash' as const,changes:initialGrimlash()}] : []),
    ...(initializeKonrad && selection.location === "USS Konrad" ? [{module:"konrad" as const,changes:initialKonrad(selection.setupScenario,selection.startingEvent)}] : []),
    ...(initializeEvomorph && selection.killer==='Evomorph' ? [{module:'evomorph' as const,changes:initialEvomorph()}] : []),
    ...(initializeCreech && selection.location==='Creech Manor' ? [{module:'creech' as const,changes:creechStartingObservations(selection.startingEvent)}] : []),
    ...(initializePoltergeist && selection.killer==='Poltergeist' ? [{module:'poltergeist' as const,changes:{initialized:true,carolyn:'hidden',floppy:'hidden','minor.psychic-confusion':'inactive','minor.unseen-forces':'inactive',minorsRemoved:false}}] : []),
    ...(initializeGroves && selection.location === "Sacred Groves" ? [{module:"groves" as const,changes:{wrath:2,closed:"none",fire:"none",hallowed:"none","sign.1":"none","sign.2":"none"}}] : []),
    ...(initializeInkanyamba && selection.killer === "Inkanyamba" ? [{module:"inkanyamba" as const,changes:{wrath:2}}] : []),
    ...(initializeBilly && selection.killer === "Billy the Bear" ? [{ module:"billy" as const, changes:{
      powerSourcesReady:true, ...Object.fromEntries([1,2,3,4,5].map(id => [`source.${id}.status`,id === 5 ? "set-aside" : "active"])),
    } }] : []),
    ...(initializeKiller && selection.killer === "Geppetto"
      ? [{ module: "geppetto" as const, changes: initialGeppettoPuppets() }]
      : []),
    ...(initializeCarnival && selection.location === "Carnival of Blood"
      ? [
          {
            module: "carnival" as const,
            changes: carnivalStartingObservations(selection.startingEvent),
          },
        ]
      : []),
    ...(initializeMaple && selection.location === "Maple Lane" ? mapleStartingObservations(selection.startingEvent).map(changes=>({module:"maple" as const,changes})) : []),
    ...startingEventObservations(selection),
  ];
}
