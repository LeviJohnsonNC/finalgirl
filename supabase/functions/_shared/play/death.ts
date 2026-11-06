import { MALL, MALL_MODULE, mallFacts } from './sunnydaze.ts';
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
}
export function deathFacts(
  selection: DeathSelection,
  events: PlayEvent[],
  eventId: string,
) {
  if(!validPlayLog(events))return null;
  if(selection.location!==MALL&&events.some(e=>e.moduleData?.module===MALL_MODULE||e.mallReference))return null;
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
  if (!validPlayLog(events) || (selection.killer!=='Poltergeist' && events.some(e=>e.moduleData?.module==='poltergeist'))) return null;
  const entries = summarizePlay(events).entries;
  const e = entries.find((e) => e.id === eventId && e.kind === "killed");
  if (!e) return null;
  const woodsDeath = selection.location === WOODS && e.woodsReference;
  const wolfDeath = selection.killer === WOLF && e.wolfReference;
  const intruderDeath=selection.killer===INTRUDERS && e.intruderReference;
  const wingardDeath = selection.location===WINGARD && e.wingardReference;
  const mallDeath=selection.location===MALL&&e.mallReference;
  const hunterDeath=selection.killer===HUNTER&&e.hunterReference;
  const historical = mallDeath || hunterDeath || woodsDeath || wolfDeath || intruderDeath || wingardDeath
    ? summarizePlay(events.slice(0, events.findIndex(event => event.id === eventId) + 1)).entries
    : [];
  // The death's own fields reflect deliberate edits. Only the surrounding
  // context is frozen for newly recorded Woods deaths.
  const contextEntries = woodsDeath
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
  );
  if(context?.[MALL_MODULE])delete context[MALL_MODULE];
  if(mallDeath&&historical.some(e=>e.moduleData?.module===MALL_MODULE))context={...context,[MALL_MODULE]:{facts:mallFacts(moduleState(historical,MALL_MODULE))}};
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
    ...(e.mechanism && { mechanism: e.mechanism }),
    ...(e.terrorCard && { terrorCard: e.terrorCard }),
    ...(e.eventCard && { eventCard: e.eventCard }),
    ...(e.attacker && { attacker: e.attacker }),
    ...(context && { moduleContext: context }),
  };
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
  return {
    ...details,
    attacker:
      intruderAttribution ? (INTRUDER_ROSTER.some(p=>p.name===details.attacker)?details.attacker:"") : cause === "killer"
        ? killer
        : cause === "minion"
          ? (details.attacker ?? "")
          : "",
    terrorCard: cause === "terror" ? (details.terrorCard ?? "") : "",
    eventCard: cause === "event" ? (details.eventCard ?? "") : "",
    mechanism:
      cause === "hazard" || cause === "other" ? (details.mechanism ?? "") : "",
  };
}
