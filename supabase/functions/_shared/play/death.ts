import {
  summarizePlay,
  validPlayLog,
  type PlayDetails,
  type PlayEvent,
} from "./events.ts";
import { moduleContext } from "./modules.ts";
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
  if (!validPlayLog(events)) return null;
  const entries = summarizePlay(events).entries;
  const e = entries.find((e) => e.id === eventId && e.kind === "killed");
  if (!e) return null;
  const context = moduleContext(
    selection,
    entries.slice(0, entries.indexOf(e) + 1).map((entry) =>
      entry.kind === "module" && entry.moduleData
        ? {
            ...entry,
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
  );
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
export async function deathSignature(facts: DeathFacts) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(facts)),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
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
  return {
    ...details,
    attacker:
      cause === "killer"
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
