import { validCreechAction, validCreechObservation, type CreechAction } from './creech.ts';
import { validPoltergeistObservation, validPoltergeistAction, type PoltergeistAction } from './poltergeist.ts';
import { validGrovesAction, canLinkGrovesAction, type GrovesAction } from "./groves.ts";
/** Immutable observations, shared by the app and edge runtime. */
import { parseFright } from "./fright.ts";
import {
  validModuleObservation,
  describeModule,
  moduleStoryBeats,
  moduleItemBeats,
  type ModuleObservation,
  type ModuleSelection,
} from "./modules.ts";
export const DEATH_CAUSES = [
  "unspecified",
  "killer",
  "minion",
  "terror",
  "event",
  "hazard",
  "other",
] as const;
export type DeathCause = (typeof DEATH_CAUSES)[number];
export const STATE_FIELDS = [
  "finalGirlHealth",
  "killerHealth",
  "finalHorrorLevel",
  "bloodlust",
] as const;
export type StateField = (typeof STATE_FIELDS)[number];
export type MomentType =
  | "item"
  | "ultimate-unlocked"
  | "ultimate-used"
  | "escape"
  | "turning-point"
  | "girl-revived"
  | "killer-revived"
  | "dark-power"
  | "finale"
  | "other";
export const PERMANENT_MOMENTS: readonly MomentType[] = ["dark-power", "finale", "ultimate-unlocked", "girl-revived", "killer-revived"];
export const isPermanentMoment = (e: Pick<PlayEvent, "kind" | "momentType">): boolean =>
  e.kind === "moment" && PERMANENT_MOMENTS.includes(e.momentType!);
/** New milestones carry an explicit lock. Legacy undone observations stay undone. */
export const isLockedPlayEvent = (e: PlayEvent): boolean =>
  (isPermanentMoment(e) && e.permanent === true) ||
  (e.kind === "module" && e.moduleData?.module === "billy" && e.moduleData.changes.powerSourcesReady === true);
export type PlayKind =
  | "start"
  | "saved"
  | "killed"
  | "round"
  | "adjust"
  | "state"
  | "moment"
  | "module"
  | "details"
  | "death-count"
  | "reduce"
  | "undo"
  | "restore";
export interface PlayDetails {
  text?: string;
  room?: string;
  cause?: DeathCause;
  victim?: string;
  mechanism?: string;
  terrorCard?: string;
  eventCard?: string;
  attacker?: string;
  detail?: string;
  killerCard?: string;
}
export interface PlayEvent extends PlayDetails {
  grovesReference?: true;
  /** One explicit location action can also update selected Inkanyamba. */
  grovesAction?: GrovesAction;
  creechAction?: CreechAction;
  poltergeistAction?: PoltergeistAction;
  linkedModule?: ModuleObservation;
  /** Provenance for newly recorded Inkanyamba card facts; legacy death hashes stay unchanged. */
  inkanyambaReference?: true;
  permanent?: true;
  id: string;
  at: number;
  kind: PlayKind;
  quantity?: number;
  delta?: number;
  saved?: number;
  killed?: number;
  round?: number | null;
  field?: StateField;
  value?: number | null;
  target?: string;
  momentType?: MomentType;
  moduleData?: ModuleObservation;
}
export interface PlaySummary {
  tracked: boolean;
  saved: number | null;
  killed: number | null;
  round: number | null;
  finalGirlHealth?: number;
  killerHealth?: number;
  finalHorrorLevel?: number;
  bloodlust?: number;
  entries: Array<PlayEvent & { currentRound: number | null }>;
  inactive: Set<string>;
}
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const integer = (n: unknown, max = 999) =>
  typeof n === "number" && Number.isSafeInteger(n) && n >= 0 && n <= max;
export const DETAIL_FIELDS = [
  "text",
  "room",
  "cause",
  "victim",
  "mechanism",
  "terrorCard",
  "eventCard",
  "attacker",
  "detail",
  "killerCard",
] as const;
export function validPlayDetails(input: unknown): input is PlayDetails {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const e = input as PlayDetails;
  return DETAIL_FIELDS.every(
    (field) =>
      e[field] === undefined ||
      (field === "cause"
        ? DEATH_CAUSES.includes(e.cause!)
        : typeof e[field] === "string" && e[field]!.length <= 240),
  );
}
export function isPlayEvent(input: unknown): input is PlayEvent {
  if (!validPlayDetails(input)) return false;
  const e = input as PlayEvent;
  if(e.moduleData?.module==='poltergeist' && (!validModuleObservation(e.moduleData)||!validPoltergeistObservation(e.poltergeistAction,e.moduleData.changes)))return false;
  if(e.poltergeistAction!==undefined && (e.kind!=='module'||e.moduleData?.module!=='poltergeist'||!validPoltergeistAction(e.poltergeistAction)))return false;
  if (e.grovesReference !== undefined && (e.grovesReference !== true || e.kind !== "moment" || e.momentType !== "finale")) return false;
  if (e.grovesAction !== undefined && (e.kind !== "module" || e.moduleData?.module !== "groves" || !validGrovesAction(e.grovesAction))) return false;
  if(e.creechAction!==undefined && (e.kind!=='module'||e.moduleData?.module!=='creech'||!validCreechAction(e.creechAction)))return false;
  if(e.moduleData?.module==='creech'&&(!validModuleObservation(e.moduleData)||!validCreechObservation(e.creechAction,e.moduleData.changes)))return false;
  const creechRescue=e.creechAction?.kind==='helicopter'&&e.creechAction.carolyn===true;
  if(creechRescue && (!e.linkedModule||e.linkedModule.module!=='poltergeist'||JSON.stringify(e.linkedModule.changes)!==JSON.stringify({carolyn:'rescued'})))return false;
  if(e.linkedModule!==undefined) {
    if(!validModuleObservation(e.linkedModule))return false;
    const grovesLink=e.kind==='module'&&e.moduleData?.module==='groves'&&e.grovesAction&&canLinkGrovesAction(e.grovesAction)&&e.linkedModule.module==='inkanyamba'&&Object.keys(e.linkedModule.changes).join()==='wrath';
    if(!grovesLink&&!creechRescue)return false;
  }
  if (e.inkanyambaReference !== undefined && (e.inkanyambaReference !== true || e.kind !== "moment" || !["dark-power", "finale"].includes(e.momentType!))) return false;
  if (e.permanent !== undefined && (e.permanent !== true || !isPermanentMoment(e))) return false;
  if (!uuid.test(e.id) || !integer(e.at, Number.MAX_SAFE_INTEGER)) return false;
  if (
    e.momentType !== undefined &&
    ![
      "item",
      "ultimate-unlocked",
      "ultimate-used",
      "escape",
      "turning-point",
      "girl-revived",
      "killer-revived",
      "dark-power",
      "finale",
      "other",
    ].includes(e.momentType)
  )
    return false;
  switch (e.kind) {
    case "start":
    case "adjust":
      return (
        integer(e.saved) &&
        integer(e.killed) &&
        (e.round === null || (integer(e.round) && e.round! >= 1))
      );
    case "saved":
    case "killed":
      return integer(e.quantity, 50) && e.quantity! >= 1;
    case "round":
      return true;
    case "state":
      return (
        STATE_FIELDS.includes(e.field!) &&
        (e.value === null ||
          (integer(e.value, 99) &&
            (e.field !== "finalHorrorLevel" ||
              (e.value! >= 0 && e.value! <= 7))))
      );
    case "moment":
      return typeof e.text === "string" && e.text.trim().length > 0;
    case "module":
      return validModuleObservation(e.moduleData);
    case "death-count":
      return (e.delta === 1 || e.delta === -1) && typeof e.target === "string" && uuid.test(e.target);
    case "details":
    case "reduce":
    case "undo":
    case "restore":
      return typeof e.target === "string" && uuid.test(e.target);
    default:
      return false;
  }
}
export function validPlayLog(log: unknown): log is PlayEvent[] {
  return (
    Array.isArray(log) &&
    log.length <= 1000 &&
    log.every(isPlayEvent) &&
    new Set(log.map((e) => e.id)).size === log.length
  );
}
export function summarizePlay(log: readonly PlayEvent[] = []): PlaySummary {
  const inactive = new Set<string>();
  const targets = new Set(
    log
      .filter((e) => !["undo", "restore", "details"].includes(e.kind) && !isLockedPlayEvent(e))
      .map((e) => e.id),
  );
  for (const e of log) {
    if (e.kind === "undo" && targets.has(e.target!)) inactive.add(e.target!);
    if (e.kind === "restore") inactive.delete(e.target!);
  }
  // Project group quantities separately from the chronological tally. Legacy
  // reductions still correct the original observation. Once a group has a count
  // correction, subsequent reductions are chronological, just like that correction.
  // This preserves old signatures while allowing corrections after a totals baseline.
  const quantities = new Map<string, number>();
  const reductions = new Map<string, number>();
  const deltas = new Map<string, number>();
  const corrected = new Set<string>();
  for (const e of log) {
    if (inactive.has(e.id)) continue;
    if (e.kind === "killed" || e.kind === "saved") quantities.set(e.id, e.quantity!);
    if (e.kind !== "reduce" && e.kind !== "death-count") continue;
    const quantity = quantities.get(e.target!);
    const target = log.find(original => original.id === e.target);
    if (quantity === undefined || quantity < 1 ||
        (e.kind === "death-count" && (target?.kind !== "killed" || quantity + e.delta! < 1 || quantity + e.delta! > 50))) {
      inactive.add(e.id);
      continue;
    }
    const delta = e.kind === "reduce" ? -1 : e.delta!;
    quantities.set(e.target!, quantity + delta);
    if (e.kind === "death-count") corrected.add(e.target!);
    if (corrected.has(e.target!)) deltas.set(e.id, delta);
    else reductions.set(e.target!, (reductions.get(e.target!) ?? 0) + 1);
  }
  const milestones = new Set<MomentType>();
  const summary: PlaySummary = {
    tracked: false,
    saved: null,
    killed: null,
    round: null,
    entries: [],
    inactive,
  };
  let frightParent = "root";
  for (const original of log) {
    if (
      inactive.has(original.id) ||
      ["undo", "restore", "details"].includes(original.kind)
    )
      continue;
    if (original.kind === "module" && original.moduleData?.module === "fright") {
      const snapshot = parseFright(original.moduleData.changes.snapshot);
      if (!snapshot || snapshot.parent !== frightParent) { summary.inactive.add(original.id); continue; }
      frightParent = original.id;
    }
    const e = { ...original };
    if (e.kind === "killed" || e.kind === "saved") {
      e.quantity = quantities.get(e.id) ?? e.quantity!;
    }
    if (e.kind === "killed" || e.kind === "moment")
      for (const edit of log) {
        if (edit.kind === "details" && edit.target === e.id) {
          if (e.kind === "killed")
            for (const field of DETAIL_FIELDS) {
              // Legacy details records replace these four fields, including clearing.
              if (
                field in edit ||
                ["room", "cause", "victim", "text"].includes(field)
              )
                Object.assign(e, { [field]: edit[field] });
            }
          else {
            if (edit.detail !== undefined) e.detail = edit.detail;
            if (edit.killerCard !== undefined) e.killerCard = edit.killerCard;
          }
        }
      }
    if (e.kind === "start") {
      summary.tracked = true;
      summary.saved = e.saved!;
      summary.killed = e.killed!;
      summary.round = e.round ?? null;
    }
    if (!summary.tracked) continue;
    if (isPermanentMoment(e)) {
      if (e.permanent && milestones.has(e.momentType!)) continue;
      milestones.add(e.momentType!);
    }
    if (e.kind === "adjust") {
      summary.saved = e.saved!;
      summary.killed = e.killed!;
      summary.round = e.round ?? null;
    }
    if (e.kind === "saved")
      summary.saved = Math.min(999, summary.saved! + original.quantity! - (reductions.get(e.id) ?? 0));
    if (e.kind === "killed")
      summary.killed = Math.min(999, summary.killed! + original.quantity! - (reductions.get(e.id) ?? 0));
    if (deltas.has(e.id)) summary.killed = Math.max(0, Math.min(999, summary.killed! + deltas.get(e.id)!));
    if (e.kind === "round")
      summary.round = Math.min(999, (summary.round ?? 0) + 1);
    if(e.kind==='module'&&e.creechAction?.kind==='hunter'&&e.creechAction.bloodlust!==undefined)summary.bloodlust=e.creechAction.bloodlust;
    if (e.kind === "state") {
      if (e.value === null) delete summary[e.field!];
      else summary[e.field!] = e.value!;
    }
    if (!(e.kind === "killed" || e.kind === "saved") || e.quantity)
      summary.entries.push({ ...e, currentRound: summary.round });
  }
  return summary;
}
/** Relative taps use the latest durable state, including taps before React renders. */
export function canChangeDeathCount(log: readonly PlayEvent[], event: PlayEvent): boolean {
  if (event.kind !== "death-count" || !isPlayEvent(event)) return false;
  const summary = summarizePlay(log);
  const group = summary.entries.find(e => e.id === event.target && e.kind === "killed");
  return Boolean(group && group.quantity! + event.delta! >= 1 && group.quantity! + event.delta! <= 50 &&
    summary.killed !== null && summary.killed + event.delta! >= 0 && summary.killed + event.delta! <= 999);
}
/** Correct the latest matching observation, never undo an unrelated action.
 * Partial correction of legacy group records preserves death identity. */
export function decrementPlay(
  log: readonly PlayEvent[],
  counter: "saved" | "killed" | "round",
): Omit<PlayEvent, "id" | "at"> | null {
  const s = summarizePlay(log),
    value = s[counter];
  if (value === null || value <= (counter === "round" ? 1 : 0)) return null;
  const baseline = [...s.entries]
    .reverse()
    .find((e) => e.kind === "start" || e.kind === "adjust");
  const baselineIndex = baseline ? s.entries.indexOf(baseline) : -1;
  const recent = s.entries.slice(baselineIndex + 1);
  const matching = [...recent].reverse().find((e) =>
    e.kind === counter || (counter === "killed" && e.kind === "death-count"));
  if (matching) {
    const group = matching.kind === "death-count"
      ? s.entries.find(e => e.id === matching.target && e.kind === "killed")
      : matching;
    if (group?.quantity && group.quantity > 1)
      return matching.kind === "death-count"
        ? { kind: "death-count", target: group.id, delta: -1 }
        : { kind: "reduce", target: group.id };
    // Undoing a pre-baseline death cannot change that manual baseline. If its
    // group is already one, correct the overall total instead of a no-op Undo.
    if (group && recent.some(e => e.id === group.id))
      return { kind: "undo", target: group.id };
  }
  return {
    kind: "adjust",
    saved: s.saved!,
    killed: s.killed!,
    round: s.round,
    [counter]: value - 1,
  };
}
export function describeEvent(e: PlayEvent): string {
  switch (e.kind) {
    case "start":
      return `Tracking began: ${e.saved} saved, ${e.killed} killed${e.round ? `, round ${e.round}` : ""}`;
    case "saved":
      return `Saved ${e.quantity} victim${e.quantity === 1 ? "" : "s"}`;
    case "killed":
      return `${e.quantity} victim${e.quantity === 1 ? "" : "s"} killed${e.room ? ` at ${e.room}` : ""}${e.attacker ? ` by ${e.attacker}` : ""}${e.cause && e.cause !== "unspecified" ? ` (${e.cause})` : ""}${e.mechanism ? `, ${e.mechanism}` : ""}${e.victim ? `, ${e.victim}` : ""}${e.terrorCard ? `, Terror: ${e.terrorCard}` : ""}${e.eventCard ? `, Event: ${e.eventCard}` : ""}${e.text ? `: ${e.text}` : ""}`;
    case "round":
      return "Next round";
    case "adjust":
      return `Totals corrected: ${e.saved} saved, ${e.killed} killed${e.round ? `, round ${e.round}` : ""}`;
    case "death-count":
      return e.delta === 1 ? "Added one victim to a death" : "Removed one victim from a death";
    case "reduce":
      return "Corrected one victim from a group record";
    case "state":
      return `${{ finalGirlHealth: "Final Girl Health", killerHealth: "Killer Health", finalHorrorLevel: "Horror", bloodlust: "Bloodlust" }[e.field!]}: ${e.value === null ? "no longer tracked" : e.value}`;
    case "moment":
      return `${e.text}${e.killerCard ? `: ${e.killerCard}` : ""}${e.detail ? `${e.killerCard ? ". " : ": "}${e.detail}` : ""}`;
    case "module":
      return e.moduleData ? [describeModule(e.moduleData), e.linkedModule && describeModule(e.linkedModule)].filter(Boolean).join("; ") : "";
    default:
      return "";
  }
}
export function playStoryBeats(
  log: readonly PlayEvent[],
  selection?: ModuleSelection,
): string {
  const s = summarizePlay(log);
  if (!s.tracked) return "";
  // Reserve most context for explicit moments; routine taps cannot crowd them out.
  const moments = s.entries.filter(
    (e) =>
      e.kind === "moment" ||
      (e.kind === "module" &&
        e.moduleData &&
        Object.entries(e.moduleData.changes).some(
          ([key, value]) =>
            (/^item\..+\.status$/.test(key) && value === "carried") ||
            (/^buddy\..+\.status$/.test(key) && value === "defeated") ||
            (/^victim\./.test(key) && value === "killed"),
        )),
  );
  const chosen = new Set(
    [
      ...moments.slice(0, 1),
      ...moments.slice(-7),
      ...s.entries.filter((e) => e.kind === "killed").slice(-3),
    ].map((e) => e.id),
  );
  const lines = s.entries
    .filter((e) => chosen.has(e.id))
    .map(
      (e) =>
        `${e.currentRound ? `Round ${e.currentRound}: ` : ""}${describeEvent(e).replace(/[—–]/g, ",").slice(0, 145)}`,
    );
  const moduleFacts = selection ? moduleStoryBeats(selection, s.entries).replace(/[—–]/g, ',').slice(0,900) : '';
  // Keep observed state ahead of optional Item descriptions in the bounded ending context.
  const itemFacts = selection ? moduleItemBeats(selection,s.entries).replace(/[—–]/g, ',').slice(0,Math.max(0,900-moduleFacts.length-1)) : '';
  const moduleBeats = [moduleFacts,itemFacts].filter(Boolean).join('\n');
  if (!moduleBeats) return lines.join("\n").slice(0, 1800);
  return `${lines.join("\n").slice(0, 875)}\nModule observations:\n${moduleBeats}`.slice(
    0,
    1800,
  );
}
export function newPlayEvent(fields: Omit<PlayEvent, "id" | "at">): PlayEvent {
  const event = { ...fields, id: crypto.randomUUID(), at: Date.now() };
  if (!isPlayEvent(event))
    throw new Error("Check the recorded values and try again.");
  return event;
}
