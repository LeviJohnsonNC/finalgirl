import type { GameResult } from '@/hooks/useGameHistory';

export const PERFORMANCE_WINDOW = 20;
export const MIN_MATCHED_PAIRS = 5;
export type PerformanceGame = Pick<GameResult, 'id' | 'timestamp' | 'outcome' | 'killer' | 'location' | 'finalGirl' | 'victimsSaved' | 'finalHorrorLevel'>;
export interface PerformancePair { earlier: PerformanceGame; recent: PerformanceGame }
const castKey = (game: PerformanceGame) => JSON.stringify([game.killer, game.location, game.finalGirl]);
const won = (game: PerformanceGame) => game.outcome === 'won';
const known = (value: unknown, max: number): value is number => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= max;

/** Descriptive matched comparisons, not a skill estimate or a causal model.
 * Selection never depends on outcome or availability of a secondary metric. */
export function buildPerformanceTrend(input: readonly PerformanceGame[], now = Date.now()) {
  const unique = new Map<string, PerformanceGame>();
  for (const game of input) {
    if (!game.id || unique.has(game.id) || !Number.isFinite(game.timestamp) || game.timestamp < 0 || game.timestamp > now
      || !['won', 'lost'].includes(game.outcome) || !game.killer || !game.location || !game.finalGirl) continue;
    unique.set(game.id, game);
  }
  const games = [...unique.values()].sort((a, b) => b.timestamp - a.timestamp || b.id.localeCompare(a.id));
  const recent = games.slice(0, PERFORMANCE_WINDOW);
  const earlier = games.slice(PERFORMANCE_WINDOW, PERFORMANCE_WINDOW * 2);
  const previousByCast = new Map<string, PerformanceGame[]>();
  for (const game of earlier) {
    const key = castKey(game);
    previousByCast.set(key, [...(previousByCast.get(key) ?? []), game]);
  }
  const pairs: PerformancePair[] = [];
  for (const game of recent) {
    const previous = previousByCast.get(castKey(game))?.shift();
    if (previous) pairs.push({ earlier: previous, recent: game });
  }
  const recentWins = pairs.filter(pair => won(pair.recent)).length;
  const earlierWins = pairs.filter(pair => won(pair.earlier)).length;
  const metric = (key: 'victimsSaved' | 'finalHorrorLevel', max: number) => {
    const eligible = pairs.filter(pair => known(pair.recent[key], max) && known(pair.earlier[key], max));
    if (!eligible.length) return { pairs: 0, earlier: null, recent: null };
    const mean = (period: 'recent' | 'earlier') => eligible.reduce((sum, pair) => sum + pair[period][key]!, 0) / eligible.length;
    return { pairs: eligible.length, earlier: mean('earlier'), recent: mean('recent') };
  };
  return {
    recent, earlier, pairs,
    recentWins: recent.filter(won).length,
    earlierWins: earlier.filter(won).length,
    comparable: pairs.length >= MIN_MATCHED_PAIRS,
    matched: { recentWins, earlierWins, difference: pairs.length ? 100 * (recentWins - earlierWins) / pairs.length : null },
    rescues: metric('victimsSaved', 999), horror: metric('finalHorrorLevel', 7),
  };
}
