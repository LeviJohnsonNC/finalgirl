import { PESADILLA } from './pesadillaCatalog.ts';
import { pesadillaOwnsLog } from './pesadilla.ts';
import {volkarOwnsLog} from './volkar.ts';
import { HELLSCAPE, HELLSCAPE_MODULE } from "./hellscape.ts";
import { MEGABGCON, MEGABGCON_MODULE } from "./megabgconCatalog.ts";
import { RAZORFACE, RAZORFACE_MODULE, razorfaceFacts } from './razorface.ts';
import { BIRDS, BIRDS_MODULE, birdsLogBelongsTo, birdsState } from './birds.ts';
import { PODARCHS, podarchOwnsLog } from './podarchs.ts';
import { conFacts, conOwnsLog } from "./megabgcon.ts";
import { MORT, MORT_SUSPECTS, mortFacts, mortOwnsLog } from './mort.ts';
import { WOLFE } from './wolfeCatalog.ts';
import { wolfeOwnsLog } from './wolfe.ts';
import { RATCHET_LADY, RATCHET_MODULE, ratchetFacts, ratchetLogBelongsTo } from './ratchetLady.ts';
import {STATION, STATION_MODULE, stationFacts, stationState} from './station.ts';
import {ORGANISM, ORGANISM_MODULE, organismFacts, organismLiving} from "./organism.ts";
import { FALCONWOOD, FALCONWOOD_MODULE, falconwoodFacts, falconwoodState, missionById, missionByName } from "./falconwood.ts";
import { MALL, MALL_MODULE, mallFacts } from './sunnydaze.ts';
import { SLAYER, SLAYER_MODULE, SLAYER_TERRORS, slayerFacts } from "./slayer.ts";
import { HUNTER, HUNTER_MODULE, hunterFacts } from './hunter.ts';
import { WINGARD, WINGARD_MODULE } from './wingardCatalog.ts';
import { wingardFacts, wingardState } from './wingardCottage.ts';
import { WOODS, WOODS_MODULE } from "./storybookWoods.ts";
import {
  summarizePlay,
  validPlayLog,
  type PlayDetails,
  type PlayEvent,
} from "./events.ts";
import { moduleContext, moduleState } from "./modules.ts";
import { INTRUDERS, INTRUDER_MODULE, INTRUDER_ROSTER } from "./intruders.ts";
import { WOLF } from "./bigBadWolf.ts";
// The browser also budgets for up to 20 seconds of cloud sync plus endpoint
// authorization, claiming and persistence. These are ceilings, not delays.
export const DEATH_GENERATION_TIMEOUT_MS = 30000;
export const DEATH_REQUEST_TIMEOUT_MS = 60000;
export interface DeathSelection {
  killer: string;
  location: string;
  finalGirl: string;
  mission?: string | null;
}
export const MORT_DEATH_DISGUISES = MORT_SUSPECTS.map(({ name }) => ({
  name,
  attacker: `Mort as ${name}`,
}));

export function deathFacts(
  selection: DeathSelection,
  events: PlayEvent[],
  eventId: string,
) {
  if (!pesadillaOwnsLog(selection,events)) return null;
  if ((selection.location !== HELLSCAPE || selection.killer === BIRDS) && events.some(event => event.moduleData?.module === HELLSCAPE_MODULE)) return null;
  if (selection.killer !== RAZORFACE && events.some(event => event.moduleData?.module === RAZORFACE_MODULE)) return null;
  if(!birdsLogBelongsTo(selection.killer,events) || !validPlayLog(events) || !volkarOwnsLog(selection.killer,events,selection.finalGirl) || !podarchOwnsLog(selection.killer,events,selection.location) || !conOwnsLog(selection.location,selection.killer,events) || !wolfeOwnsLog(selection.location,events) || !ratchetLogBelongsTo(selection.killer, events) || !mortOwnsLog(selection.killer,events,selection.location))return null;
  if (selection.location !== STATION && events.some(e=>e.stationReference || e.moduleData?.module===STATION_MODULE)) return null;
  if(selection.killer!==ORGANISM&&events.some(e=>e.moduleData?.module===ORGANISM_MODULE||e.organismReference)) return null;
  if (selection.location !== FALCONWOOD && events.some(e => e.moduleData?.module === FALCONWOOD_MODULE || e.falconwoodReference)) return null;
  const selectedMission = missionByName(selection.mission);
  if (selectedMission && events.some(e => e.falconwoodAction && e.falconwoodAction.mission !== selectedMission.id)) return null;
  if(selection.location!==MALL&&events.some(e=>e.moduleData?.module===MALL_MODULE||e.mallReference))return null;
  if (selection.killer !== SLAYER && events.some(e => e.moduleData?.module === SLAYER_MODULE || e.slayerReference)) return null;
  if(selection.killer!==HUNTER&&events.some(e=>e.moduleData?.module===HUNTER_MODULE||e.hunterReference))return null;
  if (selection.killer!==INTRUDERS && events.some(e=>e.moduleData?.module===INTRUDER_MODULE||e.intruderReference)) return null;
  if (selection.killer !== WOLF && events.some(e => e.moduleData?.module === "big-bad-wolf" || e.wolfReference)) return null;
  if (selection.location !== WOODS && events.some(event => event.moduleData?.module === WOODS_MODULE || event.woodsReference)) return null;
  if(selection.location!==WINGARD && events.some(event=>event.wingardReference || event.moduleData?.module===WINGARD_MODULE))return null;
  if(selection.location!=='Marrek Warehouse'&&events.some(e=>e.moduleData?.module==='marrek'))return null;
  if(selection.killer!=='The Tormentor'&&events.some(e=>e.moduleData?.module==='tormentor'))return null;
  if(selection.location!=='Shady Acres'&&events.some(e=>e.moduleData?.module==='shady-acres'))return null;
  if(selection.killer!=='Grimlash'&&events.some(e=>e.moduleData?.module==='grimlash'))return null;
  if(selection.location!=='USS Konrad'&&events.some(e=>e.moduleData?.module==='konrad'))return null;
  if(selection.killer!=='Evomorph'&&events.some(e=>e.moduleData?.module==='evomorph'))return null;
  if(events.some(e=>(e.moduleData?.module==='creech'&&selection.location!=='Creech Manor')||(e.linkedModule?.module==='poltergeist'&&selection.killer!=='Poltergeist')))return null;
  if (!validPlayLog(events) || !volkarOwnsLog(selection.killer,events,selection.finalGirl) || !podarchOwnsLog(selection.killer,events,selection.location) || !conOwnsLog(selection.location,selection.killer,events) || (selection.killer!=='Poltergeist' && events.some(e=>e.moduleData?.module==='poltergeist'))) return null;
  const entries = summarizePlay(events).entries;
  const e = entries.find((e) => e.id === eventId && e.kind === "killed");
  if (!e) return null;
  const falconwoodDeath = selection.location === FALCONWOOD && e.falconwoodReference;
  const woodsDeath = selection.location === WOODS && e.woodsReference;
  const wolfDeath = selection.killer === WOLF && e.wolfReference;
  const organismDeath=selection.killer===ORGANISM&&e.organismReference;
  const mortDeath=selection.killer===MORT && e.mortReference;
  const intruderDeath=selection.killer===INTRUDERS && e.intruderReference;
  const wingardDeath = selection.location===WINGARD && e.wingardReference;
  const mallDeath=selection.location===MALL&&e.mallReference;
  const slayerDeath = selection.killer === SLAYER && e.slayerReference;
  const hunterDeath=selection.killer===HUNTER&&e.hunterReference;
  const stationDeath = selection.location === STATION && e.stationReference;
  const ratchetDeath = selection.killer === RATCHET_LADY && e.ratchetReference;
  const wolfeDeath = selection.location === WOLFE && e.wolfeReference;
  const conDeath = selection.location === MEGABGCON && e.megabgconReference;
  const historical = selection.location === PESADILLA || selection.killer === "The Volk'ar" || selection.killer === PODARCHS || conDeath || mortDeath || wolfeDeath || ratchetDeath || stationDeath || falconwoodDeath || slayerDeath || mallDeath || hunterDeath || woodsDeath || wolfDeath || intruderDeath || wingardDeath || organismDeath
    ? summarizePlay(events.slice(0, events.findIndex(event => event.id === eventId) + 1)).entries
    : [];
  // The death's own fields reflect deliberate edits. Only the surrounding
  // context is frozen for newly recorded Woods deaths.
  const contextEntries = selection.location === PESADILLA || selection.killer === "The Volk'ar" || selection.killer === PODARCHS || woodsDeath || wolfeDeath
    ? historical : entries.slice(0, entries.indexOf(e) + 1);
  let context = moduleContext(
    selection,
    contextEntries.map((entry) =>
      entry.kind === "module" && entry.moduleData
        ? {
            ...entry,
            ...(entry.linkedModule && {linkedModule:{...entry.linkedModule,changes:Object.fromEntries(Object.entries(entry.linkedModule.changes).sort(([a],[b])=>a.length-b.length || (a<b?-1:a>b?1:0)))}}),
            moduleData: {
              ...entry.moduleData,
              // Match PostgreSQL JSONB's length-then-byte key order per observation.
              // Module field names are validated ASCII. Normalizing before reduction
              // preserves existing server fingerprints, including repeated edits.
              changes: Object.fromEntries(
                Object.entries(entry.moduleData.changes).sort(
                  ([a], [b]) =>
                    a.length - b.length || (a < b ? -1 : a > b ? 1 : 0),
                ),
              ),
            },
          }
        : entry,
    ),
    false,
    !!wolfeDeath,
  );
  // Hellscape roles are frozen at the event. Undo can correct the current
  // roster without rewriting the setting of an earlier saved death.
  if (selection.location === HELLSCAPE) {
    const deathIndex = events.findIndex(event => event.id === eventId);
    const snapshot = moduleState(summarizePlay(events.slice(0, deathIndex + 1)).entries, HELLSCAPE_MODULE);
    if (Object.keys(snapshot).length) context = {...context, [HELLSCAPE_MODULE]: snapshot};
    else if (context?.[HELLSCAPE_MODULE]) {
      delete context[HELLSCAPE_MODULE];
      if (!Object.keys(context).length) context = undefined;
    }
  }

  const missionState = falconwoodDeath ? falconwoodState(moduleState(historical,FALCONWOOD_MODULE)) : undefined;
  if (missionState) {
    const facts = falconwoodFacts({...missionState, mission:missionState.mission ?? selectedMission?.id});
    if (facts) context = {...context,[FALCONWOOD_MODULE]:{facts}};
  }
  if(context?.[MALL_MODULE])delete context[MALL_MODULE];
  if(mallDeath&&historical.some(e=>e.moduleData?.module===MALL_MODULE))context={...context,[MALL_MODULE]:{facts:mallFacts(moduleState(historical,MALL_MODULE))}};
  if (context?.slayer) delete context.slayer;
  if (slayerDeath && historical.some(entry => entry.moduleData?.module === SLAYER_MODULE)) {
    const facts = slayerFacts(moduleState(historical, SLAYER_MODULE));
    if (facts) context = {...context, slayer: {facts: facts + " These positions do not establish the dimension of the Victim who died."}};
  }
  if (selection.killer === BIRDS) {
    if (context?.birds) delete context.birds;
    const prefix = summarizePlay(events.slice(0,events.findIndex(item=>item.id === eventId)+1)).entries
      .filter(item=>item.birdsAction?.command !== 'review');
    if (prefix.some(item=>item.moduleData?.module === BIRDS_MODULE)) {
      const state = birdsState(prefix);
      context = {...context,birds:Object.fromEntries(Object.entries(state).sort(([a],[b])=>a.localeCompare(b)))};
    }
  }
  if (selection.killer === RAZORFACE) {
    if (context?.razorface) delete context.razorface;
    const atDeath = summarizePlay(events.slice(0, events.findIndex(entry => entry.id === eventId) + 1)).entries;
    const facts = razorfaceFacts(atDeath);
    if (facts) context = {...context, razorface:{facts}};
  }
  if(context?.hunter)delete context.hunter;
  if(hunterDeath&&historical.some(e=>e.moduleData?.module===HUNTER_MODULE))context={...context,hunter:{facts:hunterFacts(moduleState(historical,HUNTER_MODULE),historical)}};
  if(context&&!Object.keys(context).length)context=undefined;
  if(wingardDeath) {
    const state=moduleState(historical,WINGARD_MODULE);
    const facts=wingardFacts(wingardState(state)).join(' ');
    if(facts)context={...context,[WINGARD_MODULE]:{facts}};
  }
  if (wolfDeath) {
    const wolf = moduleState(historical, "big-bad-wolf");
    if (Object.keys(wolf).length) {
      // Stable ordering across browser objects and JSONB reads.
      const sorted = Object.fromEntries(Object.entries(wolf).sort(([a], [b]) => a.localeCompare(b)));
      context = { ...context, "big-bad-wolf": sorted };
    }
  }
  if (selection.location === MEGABGCON) {
    const facts = conDeath ? conFacts(historical) : "";
    if (facts) context = { ...context, [MEGABGCON_MODULE]: { facts } };
    else if (context?.[MEGABGCON_MODULE]) {
      delete context[MEGABGCON_MODULE];
      if (!Object.keys(context).length) context = undefined;
    }
  }
  if (mortDeath) {
    const facts=mortFacts(historical);
    if (facts) context={...context,mort:{facts}};
  }
  if (ratchetDeath) {
    const facts = ratchetFacts(moduleState(historical, RATCHET_MODULE), undefined, historical);
    context = { ...context, [RATCHET_MODULE]: { facts } };
  }
  if(organismDeath) {
    // These labels are part of the fingerprint of existing saved death scenes.
    const facts=organismFacts(moduleState(historical,ORGANISM_MODULE),historical,true);
    if(facts) context={...context,[ORGANISM_MODULE]:{facts}};
  }
  if (stationDeath) {
    const facts = stationFacts(stationState(moduleState(historical,STATION_MODULE)));
    if (facts) context = {...context,[STATION_MODULE]:{facts}};
  }
  if (intruderDeath) {
    const state=moduleState(historical,INTRUDER_MODULE);
    if (Object.keys(state).length) {
      const sorted=Object.fromEntries(Object.entries(state).sort(([a],[b])=>a.localeCompare(b)));
      context={...context,intruders:sorted};
    }
  }
  return {
    version: 1,
    killer: selection.killer,
    location: selection.location,
    finalGirl: selection.finalGirl,
    quantity: e.quantity!,
    cause: e.cause ?? "unspecified",
    room: e.room ?? "",
    victim: e.victim ?? "",
    note: e.text ?? "",
    round: e.currentRound,
    // Omit absent additions to preserve signatures for legacy saved scenes.
    ...(falconwoodDeath && missionState?.mission && {mission:missionById(missionState.mission)?.name}),
    ...(e.mechanism && { mechanism: e.mechanism }),
    ...(e.terrorCard && { terrorCard: e.terrorCard }),
    ...(e.eventCard && { eventCard: e.eventCard }),
    ...(e.attacker && { attacker: e.attacker }),
    ...(context && { moduleContext: context }),
  };
}
export function organismDeathAttackers(events:readonly PlayEvent[],eventId:string) {
  const index=events.findIndex(event=>event.id===eventId);
  if(index<0) return [];
  const entries=summarizePlay(events.slice(0,index)).entries;
  return organismLiving(moduleState(entries,ORGANISM_MODULE)).flatMap(figure=>figure.form?[figure.form.name]:[]);
}
/** Narrative setting for an attributed Slayer victim attack. Preserve cached facts:
 * collapse is read from this death's frozen context, never the current tracker. */
export function slayerVictimSetting(facts: {
  killer: string; cause: string; attacker?: string; terrorCard?: string;
  moduleContext?: { slayer?: { facts?: unknown } };
}): string | null {
  if (facts.killer !== SLAYER) return null;
  const terror = facts.cause === 'terror' && SLAYER_TERRORS.find(card => card.name === facts.terrorCard);
  if (facts.cause !== 'killer' && facts.attacker !== SLAYER &&
      !(terror && /attack|kill/i.test(terror.effect))) return null;
  return typeof facts.moduleContext?.slayer?.facts === 'string' &&
    facts.moduleContext.slayer.facts.includes('Rift Collapse was physically recorded.')
    ? 'Our Dimension after Rift Collapse' : 'Mirror Dimension';
}
export type DeathFacts = NonNullable<ReturnType<typeof deathFacts>>;
/** Only Dr. Fright gets a new cache namespace; historical fact hashes stay valid. */
export async function deathSignature(facts: DeathFacts, profile: "current" | "legacy" = "current") {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(profile === "current" && facts.killer === "Dr. Fright"
      ? { ...facts, narrativeProfile: "fright-private-nightmares-v1" } : facts)),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
/** Authorize only canonical saved-fact identities, including pre-profile scenes. */
export async function deathSignatures(facts: DeathFacts): Promise<string[]> {
  return [...new Set(await Promise.all([deathSignature(facts), deathSignature(facts, "legacy")]))];
}
/** Only names already verified in the owner's Buddyland board/cards. Other boards accept free text. */
export const deathRooms: Record<string, readonly string[]> = {
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
export const deathCauseLabels = {
  unspecified: "Unspecified / general",
  killer: "Killer attack",
  minion: "Buddy / minion",
  terror: "Terror card",
  event: "Event",
  hazard: "Location hazard",
  other: "Other / not sure",
} as const;

export interface DeathScene {
  id: string;
  session_id: string;
  event_id: string;
  signature: string;
  take: number;
  scene_text: string;
  model?: string;
  status: "ready";
}
/** A readable paragraph, not an upstream fragment. Keep older complete short scenes. */
export function isCompleteDeathText(text: unknown): text is string {
  return (
    typeof text === "string" &&
    text.length <= 1600 &&
    text.trim().split(/\s+/u).length >= 40 &&
    /[.!?…]["'”’)\]]*\s*$/u.test(text)
  );
}
export function isDeathScene(input: unknown): input is DeathScene {
  const r = input as DeathScene;
  return Boolean(
    r &&
      typeof r.id === "string" &&
      typeof r.session_id === "string" &&
      typeof r.event_id === "string" &&
      /^[0-9a-f]{64}$/.test(r.signature) &&
      Number.isInteger(r.take) &&
      r.take >= 0 &&
      r.take <= 2 &&
      r.status === "ready" &&
      typeof r.scene_text === "string" &&
      r.scene_text.length >= 10 &&
      r.scene_text.length <= 1600,
  );
}

/** Clear fields from a previous cause before checkpointing or generating a scene.
 * Empty strings are intentional: detail events merge into the original death. */
export function detailsForCause(
  details: PlayDetails,
  killer: string,
): PlayDetails {
  const cause = details.cause ?? "unspecified";
  const intruderAttribution=killer===INTRUDERS&&(cause==='killer'||cause==='terror');
  const mortAttribution = killer === MORT && (cause === "killer" || cause === "terror");
  const mortDisguise = killer === MORT
    ? MORT_DEATH_DISGUISES.find(disguise => disguise.attacker === details.attacker)
    : undefined;
  return {
    ...details,
    attacker:
      killer===PODARCHS && cause==='killer' ? (details.attacker==='Leader'?'Leader':'') :
      killer===ORGANISM&&(cause==="killer"||cause==="terror") ? (details.attacker===ORGANISM?"":details.attacker??"") :
      killer === RATCHET_LADY && cause === 'terror' ? details.attacker ?? '' :
      mortAttribution ? (mortDisguise?.attacker ?? "") :
      intruderAttribution ? (INTRUDER_ROSTER.some(p=>p.name===details.attacker)?details.attacker:"") : cause === "killer"
        ? killer
        : cause === "minion"
          ? (mortDisguise || (killer === MORT && details.attacker === MORT) ? "" : details.attacker ?? "")
          : "",
    terrorCard: cause === "terror" ? (details.terrorCard ?? "") : "",
    eventCard: cause === "event" ? (details.eventCard ?? "") : "",
    mechanism:
      cause === "hazard" || cause === "other" ? (details.mechanism ?? "") : "",
  };
}
