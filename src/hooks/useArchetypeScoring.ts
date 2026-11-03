import type { GameResult } from './useGameHistory';
import { getLegacyFinalGirlHealth } from '@/data/finalGirlHealth';

export type StyleDimension = 'protector' | 'duelist' | 'survivor' | 'gambler';

export interface ArchetypeStanding {
  archetype: StyleDimension;
  score: number;
  support: number;
  of: number;
  evidence: string;
}

const RECENCY_HALF_LIFE = 12;
const PRIOR_WEIGHT = 6;
const MIN_HEADLINE_SUPPORT = 4;

type Reading = { share: number; weight: number };
const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;

export function computeArchetype(games: GameResult[]) {
  const sorted = [...games].sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
  const rescues: Reading[] = [];
  const finishes: Reading[] = [];
  const closeWins: Reading[] = [];
  const swings: Reading[] = [];
  const previousHorror = new Map<string, number>();
  const matchups = new Set<string>();
  let wins = 0;
  let saved = 0;
  let resolved = 0;

  for (const [index, game] of sorted.entries()) {
    const weight = 0.5 ** ((sorted.length - 1 - index) / RECENCY_HALF_LIFE);
    const { victimsSaved, victimsKilled, finalGirlHealth, finalHorrorLevel: horror } = game;
    const won = game.outcome === 'won';
    const knownHorror = horror != null && Number.isInteger(horror) && horror >= 0 && horror <= 7;
    if (victimsSaved != null && victimsKilled != null && victimsSaved + victimsKilled > 0) {
      const total = victimsSaved + victimsKilled;
      rescues.push({ share: victimsSaved / total, weight });
      saved += victimsSaved;
      resolved += total;
    }
    if (!won || knownHorror) finishes.push({ share: Number(won && horror! <= 3), weight });
    if (won) {
      wins++;
      const maximum = game.finalGirlMaxHealth ?? getLegacyFinalGirlHealth(game.finalGirl);
      if (finalGirlHealth != null && maximum > 0 && finalGirlHealth <= maximum) {
        closeWins.push({ share: Number(finalGirlHealth > 0 && finalGirlHealth * 3 <= maximum), weight });
      }
    }
    const matchup = JSON.stringify([game.killer, game.location, game.finalGirl]);
    matchups.add(matchup);
    if (knownHorror) {
      const previous = previousHorror.get(matchup);
      if (previous !== undefined) swings.push({ share: Number(Math.abs(horror - previous) >= 3), weight });
      previousHorror.set(matchup, horror);
    } else {
      previousHorror.delete(matchup);
    }
  }

  function standing(archetype: StyleDimension, readings: Reading[], of: number, evidence: string): ArchetypeStanding {
    const weight = readings.reduce((sum, item) => sum + item.weight, 0);
    const hits = readings.reduce((sum, item) => sum + item.share * item.weight, 0);
    return { archetype, score: Math.round(100 * (hits + PRIOR_WEIGHT / 2) / (weight + PRIOR_WEIGHT)), support: readings.length, of, evidence };
  }

  const hits = (items: Reading[]) => items.filter(item => item.share === 1).length;
  const scores = [
    standing('duelist', finishes, games.length, `${hits(finishes)} of ${finishes.length} eligible games ended in a win at Horror 3 or lower.`),
    standing('protector', rescues, games.length, `${saved} of ${resolved} resolved victims saved across ${count(rescues.length, 'game')} with both totals recorded.`),
    standing('survivor', closeWins, wins, `${hits(closeWins)} of ${closeWins.length} wins with health recorded ended at a third of maximum HP or lower.`),
    standing('gambler', swings, games.length - matchups.size, `${hits(swings)} of ${swings.length} consecutive same-cast comparisons differed by 3 or more ending Horror levels.`),
  ];
  const eligible = [
    { standing: scores[0], positive: hits(finishes) },
    { standing: scores[1], positive: rescues.filter(item => item.share > 0).length },
    { standing: scores[2], positive: hits(closeWins) },
    { standing: scores[3], positive: hits(swings) },
  ].filter(item => item.standing.support >= MIN_HEADLINE_SUPPORT && item.positive >= 2)
    .map(item => item.standing)
    .sort((a, b) => b.score - a.score || b.support - a.support);
  const [lead, next] = eligible;
  const blend = lead && next && lead.score - next.score <= 5 ? next.archetype : undefined;
  const summary = lead
    ? [lead.evidence, ...(blend ? [next.evidence] : [])]
    : [`${wins} wins in ${count(games.length, 'recorded game')}. Your profile is still taking shape.`];
  return { archetype: lead?.archetype ?? 'newcomer', blend, summary, scores } as const;
}
