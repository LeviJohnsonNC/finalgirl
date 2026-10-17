/** Immutable observations, not a rules engine. Also imported by the edge runtime. */
export const DEATH_CAUSES = ['unspecified', 'killer', 'minion', 'event', 'hazard', 'other'] as const;
export type DeathCause = typeof DEATH_CAUSES[number];
export type PlayKind = 'start' | 'saved' | 'killed' | 'round' | 'adjust' | 'state' | 'moment' | 'details' | 'undo' | 'restore';
export interface PlayEvent {
  id: string; at: number; kind: PlayKind;
  quantity?: number; saved?: number; killed?: number; round?: number | null;
  field?: 'finalGirlHealth' | 'killerHealth' | 'finalHorrorLevel' | 'bloodlust'; value?: number;
  text?: string; room?: string; cause?: DeathCause; victim?: string; target?: string;
}
export interface PlaySummary {
  tracked: boolean; saved: number | null; killed: number | null; round: number | null;
  finalGirlHealth?: number; killerHealth?: number; finalHorrorLevel?: number; bloodlust?: number;
  entries: Array<PlayEvent & { currentRound: number | null }>;
  inactive: Set<string>;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const integer = (n: unknown, max = 999) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n <= max;
export function isPlayEvent(input: unknown): input is PlayEvent {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const e = input as PlayEvent;
  if (!uuid.test(e.id) || !integer(e.at, Number.MAX_SAFE_INTEGER)) return false;
  if (![e.text, e.room, e.victim].every(s => s === undefined || typeof s === 'string' && s.length <= 240)) return false;
  if (e.cause !== undefined && !DEATH_CAUSES.includes(e.cause)) return false;
  switch (e.kind) {
    case 'start': case 'adjust': return integer(e.saved) && integer(e.killed) && (e.round === null || integer(e.round) && e.round! >= 1);
    case 'saved': case 'killed': return integer(e.quantity, 50) && e.quantity! >= 1;
    case 'round': return true;
    case 'state': return ['finalGirlHealth', 'killerHealth', 'finalHorrorLevel', 'bloodlust'].includes(e.field!) && integer(e.value, 99) && (e.field !== 'finalHorrorLevel' || e.value! >= 1 && e.value! <= 7);
    case 'moment': return typeof e.text === 'string' && e.text.trim().length > 0;
    case 'details': case 'undo': case 'restore': return typeof e.target === 'string' && uuid.test(e.target);
    default: return false;
  }
}
export function validPlayLog(log: unknown): log is PlayEvent[] {
  return Array.isArray(log) && log.length <= 1000 && log.every(isPlayEvent) && new Set(log.map(e => e.id)).size === log.length;
}
export function summarizePlay(log: readonly PlayEvent[] = []): PlaySummary {
  const inactive = new Set<string>();
  const targets = new Set(log.filter(e => !['undo', 'restore', 'details'].includes(e.kind)).map(e => e.id));
  for (const e of log) {
    if (e.kind === 'undo' && targets.has(e.target!)) inactive.add(e.target!);
    if (e.kind === 'restore') inactive.delete(e.target!);
  }
  const summary: PlaySummary = { tracked: false, saved: null, killed: null, round: null, entries: [], inactive };
  for (const original of log) {
    if (inactive.has(original.id) || ['undo', 'restore', 'details'].includes(original.kind)) continue;
    const e = { ...original };
    if (e.kind === 'killed') for (const edit of log) {
      if (edit.kind === 'details' && edit.target === e.id) {
        e.room = edit.room; e.cause = edit.cause; e.victim = edit.victim; e.text = edit.text;
      }
    }
    if (e.kind === 'start') { summary.tracked = true; summary.saved = e.saved!; summary.killed = e.killed!; summary.round = e.round ?? null; }
    if (!summary.tracked) continue;
    if (e.kind === 'adjust') { summary.saved = e.saved!; summary.killed = e.killed!; summary.round = e.round ?? null; }
    if (e.kind === 'saved') summary.saved = Math.min(999, summary.saved! + e.quantity!);
    if (e.kind === 'killed') summary.killed = Math.min(999, summary.killed! + e.quantity!);
    if (e.kind === 'round') summary.round = Math.min(999, (summary.round ?? 0) + 1);
    if (e.kind === 'state') summary[e.field!] = e.value!;
    summary.entries.push({ ...e, currentRound: summary.round });
  }
  return summary;
}
export function describeEvent(e: PlayEvent): string {
  switch (e.kind) {
    case 'start': return `Tracking began: ${e.saved} saved, ${e.killed} killed${e.round ? `, round ${e.round}` : ''}`;
    case 'saved': return `Saved ${e.quantity} victim${e.quantity === 1 ? '' : 's'}`;
    case 'killed': return `${e.quantity} victim${e.quantity === 1 ? '' : 's'} killed${e.room ? ` at ${e.room}` : ''}${e.cause && e.cause !== 'unspecified' ? ` (${e.cause})` : ''}${e.victim ? ` — ${e.victim}` : ''}${e.text ? `: ${e.text}` : ''}`;
    case 'round': return 'Next round';
    case 'adjust': return `Totals corrected: ${e.saved} saved, ${e.killed} killed${e.round ? `, round ${e.round}` : ''}`;
    case 'state': return `${{ finalGirlHealth: 'Final Girl Health', killerHealth: 'Killer Health', finalHorrorLevel: 'Horror', bloodlust: 'Bloodlust' }[e.field!]}: ${e.value}`;
    case 'moment': return e.text!;
    default: return '';
  }
}
export function playStoryBeats(log: readonly PlayEvent[]): string {
  const s = summarizePlay(log);
  if (!s.tracked) return '';
  // Authoritative totals are transmitted separately. Keep the prompt bounded.
  return s.entries.filter(e => e.kind !== 'round').slice(-10)
    .map(e => `${e.currentRound ? `Round ${e.currentRound}: ` : ''}${describeEvent(e)}`).join('\n').slice(0, 1800);
}
export function newPlayEvent(fields: Omit<PlayEvent, 'id' | 'at'>): PlayEvent {
  const event = { ...fields, id: crypto.randomUUID(), at: Date.now() };
  if (!isPlayEvent(event)) throw new Error('Check the recorded values and try again.');
  return event;
}
