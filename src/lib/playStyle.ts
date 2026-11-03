import type { GameResult } from '@/hooks/useGameHistory';
import { summarizePlay } from '@/lib/play/events';

export const STYLE_WINDOW = 20;
export const STYLE_HISTORY_LIMIT = STYLE_WINDOW * 2;

type Entry = ReturnType<typeof summarizePlay>['entries'][number];
type PlayGame = Pick<GameResult, 'id' | 'timestamp' | 'outcome' | 'killer' | 'location' | 'finalGirl' | 'playEvents' | 'roundsPlayed'>;

export interface StyleCase {
  id: string;
  timestamp: number;
  killer: string;
  location: string;
  finalGirl: string;
  outcome: GameResult['outcome'];
  note: string;
  beats: string[];
}

export interface StyleFinding {
  id: string;
  label: string;
  title: string;
  detail: string;
  cases: StyleCase[];
}

const beat = (entry: Entry, text: string) => entry.currentRound == null ? text : `Round ${entry.currentRound} · ${text}`;
const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;
const signed = (value: number) => value > 0 ? `+${value}` : String(value);

function observe(game: PlayGame) {
  const { entries, round } = summarizePlay(game.playEvents);
  let health: number | undefined;
  let activeLow: Entry | undefined;
  let healthEpisode: { low: Entry; recovery?: Entry } | undefined;
  let peak: Entry | undefined;
  let horrorRecovery: { peak: Entry; after: Entry; change: number } | undefined;
  let reveal: Entry | undefined;
  let before = 0;
  let after = 0;
  let saved = 0;
  let canTimeRescues = true;
  let roundWasAdjusted = false;
  let roundKnownFromStart = false;
  let previousRound: number | null = null;
  const rescues: Entry[] = [];
  let usable = false;

  // The first observed value in a tracker segment is its baseline. A clear
  // ends the segment, so readings on opposite sides cannot imply recovery.
  for (const entry of entries) {
    if (entry.kind === 'start') {
      saved = entry.saved!;
      canTimeRescues = saved === 0;
      roundKnownFromStart = entry.round === 1;
    }
    if (entry.kind === 'adjust') {
      if (entry.saved !== saved) canTimeRescues = false;
      if (entry.round !== previousRound) roundWasAdjusted = true;
      saved = entry.saved!;
    }
    if (entry.kind === 'moment' && entry.momentType === 'dark-power' && !reveal) {
      reveal = entry;
      usable = true;
    }
    if (entry.kind === 'round') usable = true;
    if (entry.kind === 'saved') {
      const quantity = entry.quantity!;
      if (reveal) after += quantity;
      else before += quantity;
      saved += quantity;
      rescues.push(entry);
      usable = true;
    }
    if (entry.kind === 'state' && entry.field === 'finalGirlHealth') {
      const value = entry.value ?? undefined;
      if (health !== undefined && value !== undefined && value !== health) usable = true;
      if (value === undefined) activeLow = undefined;
      if (value === 1 && health !== undefined && health > 1) {
        activeLow = entry;
        healthEpisode ??= { low: entry };
      }
      if (activeLow && value !== undefined && value > (healthEpisode?.recovery?.value ?? 1)) {
        healthEpisode = { low: activeLow, recovery: entry };
      }
      health = value;
    }
    if (entry.kind === 'state' && entry.field === 'finalHorrorLevel') {
      const value = entry.value ?? undefined;
      if (value === undefined) peak = undefined;
      else {
        if (peak && value !== peak.value) usable = true;
        if (peak && peak.value! >= 4 && value < peak.value!) {
          const change = peak.value! - value;
          if (!horrorRecovery || change > horrorRecovery.change) horrorRecovery = { peak, after: entry, change };
        }
        if (!peak || value > peak.value!) peak = entry;
      }
    }
    previousRound = entry.currentRound;
  }
  return {
    game,
    usable,
    health: healthEpisode,
    horrorRecovery,
    rescue: reveal && canTimeRescues && rescues.length ? { before, after, reveal, rescues } : undefined,
    pace: roundKnownFromStart && !roundWasAdjusted && round != null && round > 1 && game.roundsPlayed === round ? round : undefined,
  };
}

type Observation = ReturnType<typeof observe>;
function caseFor({ game }: Observation, note: string, beats: string[]): StyleCase {
  return { id: game.id, timestamp: game.timestamp, killer: game.killer, location: game.location, finalGirl: game.finalGirl, outcome: game.outcome, note, beats };
}

function rescueFinding(recent: Observation[]): StyleFinding | undefined {
  const eligible = recent.filter(x => x.rescue);
  const early = eligible.filter(x => x.rescue!.before > x.rescue!.after);
  const late = eligible.filter(x => x.rescue!.after > x.rescue!.before);
  const direction = early.length > late.length ? 'before' : 'after';
  const hits = direction === 'before' ? early : late;
  if (eligible.length < 4 || hits.length < 3 || hits.length / eligible.length < 0.6) return;
  return {
    id: 'rescue', label: 'Your signature',
    title: `More rescues ${direction} the Dark Power`,
    detail: `${hits.length} of ${eligible.length} recent games with both a recorded reveal and timed rescues followed this pattern.`,
    cases: hits.map(x => {
      const { before, after, reveal, rescues } = x.rescue!;
      const sample = direction === 'before' ? rescues[0] : rescues[rescues.length - 1];
      const mode = reveal.wolfPowerMode === 'both' ? 'Track and Slay' : reveal.wolfPowerMode === 'slay' ? 'Slay' : undefined;
      const revealBeat = beat(reveal, ['Dark Power revealed', reveal.killerCard, mode].filter(Boolean).join(' · '));
      const rescueBeat = beat(sample, `${plural(sample.quantity!, 'victim')} saved`);
      return caseFor(x, `${before} saved before · ${after} after`, direction === 'before' ? [rescueBeat, revealBeat] : [revealBeat, rescueBeat]);
    }),
  };
}

function paceFinding(recent: Observation[]): StyleFinding | undefined {
  const wins = recent.filter(x => x.game.outcome === 'won' && x.pace !== undefined);
  if (wins.length < 4) return;
  const rounds = wins.map(x => x.pace!).sort((a, b) => a - b);
  const middle = Math.floor(rounds.length / 2);
  const median = rounds.length % 2 ? rounds[middle] : (rounds[middle - 1] + rounds[middle]) / 2;
  return {
    id: 'pace', label: 'Your signature',
    title: `A typical tracked win takes ${plural(median, 'round')}`,
    detail: `Median across ${plural(wins.length, 'win')} with a round counter tracked from round 1 and a matching saved total.`,
    cases: wins.map(x => caseFor(x, `Won in round ${x.pace}`, [])),
  };
}

function healthFinding(recent: Observation[]): StyleFinding | undefined {
  const lows = recent.filter(x => x.health);
  if (lows.length < 3) return;
  const wins = lows.filter(x => x.game.outcome === 'won').length;
  const recoveries = lows.filter(x => x.health!.recovery).length;
  return {
    id: 'health', label: 'Under pressure',
    title: wins > 0 ? `${wins} of ${lows.length} games won after dropping to 1 HP` : `1 HP in ${plural(lows.length, 'game')}`,
    detail: recoveries
      ? `You later recorded a rise above 1 HP in ${plural(recoveries, 'game')}. The final result alone misses those close calls.`
      : `Across ${plural(lows.length, 'game')} with a recorded drop to 1 HP, ${wins} ended in a win.`,
    cases: lows.map(x => {
      const { low, recovery } = x.health!;
      return caseFor(x, x.game.outcome === 'won' ? 'Won after the drop' : 'Lost after the drop', [
        beat(low, 'Health dropped to 1 HP'),
        ...(recovery ? [beat(recovery, `Health recovered to ${recovery.value} HP`)] : []),
      ]);
    }),
  };
}

function horrorCase(x: Observation, prefix?: string): StyleCase {
  const { peak, after, change } = x.horrorRecovery!;
  const note = `Horror fell ${plural(change, 'level')}`;
  return caseFor(x, prefix ? `${prefix} · ${note}` : note, [
    beat(peak, `Horror reached ${peak.value}`), beat(after, `Horror fell to ${after.value}`),
  ]);
}

const castKey = ({ game }: Observation) => JSON.stringify([game.killer, game.location, game.finalGirl]);

function changeFinding(recent: Observation[], previous: Observation[]): StyleFinding | undefined {
  const oldByCast = new Map<string, Observation[]>();
  for (const item of previous) {
    if (!item.horrorRecovery || item.game.outcome !== 'won') continue;
    const key = castKey(item);
    const matches = oldByCast.get(key) ?? [];
    matches.push(item);
    oldByCast.set(key, matches);
  }
  const pairs = recent.flatMap(item => {
    if (!item.horrorRecovery || item.game.outcome !== 'won') return [];
    const previousGame = oldByCast.get(castKey(item))?.shift();
    return previousGame ? [{ recent: item, previous: previousGame }] : [];
  });
  if (pairs.length < 4) return;
  const differences = pairs.map(pair => pair.recent.horrorRecovery!.change - pair.previous.horrorRecovery!.change);
  const average = differences.reduce((sum, value) => sum + value, 0) / pairs.length;
  const direction = Math.sign(average);
  if (Math.abs(average) < 1 || differences.filter(value => Math.sign(value) === direction).length / pairs.length < 0.75) return;
  return {
    id: 'change', label: 'What’s changing',
    title: average > 0 ? 'Bigger Horror recoveries in recent wins' : 'Smaller Horror recoveries in recent wins',
    detail: `${signed(Number(average.toFixed(1)))} levels on average across ${plural(pairs.length, 'pair')} of wins with recorded recoveries and the same killer, location and Final Girl.`,
    cases: pairs.flatMap(pair => [horrorCase(pair.recent, 'Recent'), horrorCase(pair.previous, 'Earlier')]),
  };
}

function pressureFinding(recent: Observation[]): StyleFinding | undefined {
  const eligible = recent.filter(x => x.horrorRecovery);
  const hits = eligible.filter(x => x.horrorRecovery!.change >= 3);
  if (hits.length < 3) return;
  return {
    id: 'pressure', label: 'Under pressure', title: 'You’ve brought Horror back down',
    detail: `In ${hits.length} of ${eligible.length} recent games with a recorded recovery from Horror 4 or higher, it fell at least 3 levels.`,
    cases: hits.map(x => horrorCase(x)),
  };
}

/** Games are the bounded archive selection, newest first. */
export function buildPlayStyle(games: readonly PlayGame[]) {
  const observed = games.slice(0, STYLE_HISTORY_LIMIT).map(observe);
  const recent = observed.slice(0, STYLE_WINDOW);
  const change = changeFinding(recent, observed.slice(STYLE_WINDOW));
  const health = healthFinding(recent);
  const findings = [
    rescueFinding(recent) ?? paceFinding(recent),
    health ?? (change ? undefined : pressureFinding(recent)),
    change,
  ].filter((finding): finding is StyleFinding => finding !== undefined);
  return { findings, recorded: recent.filter(x => x.usable).length, total: recent.length };
}
