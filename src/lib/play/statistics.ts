import type { GameResult } from '@/hooks/useGameHistory';
export function playStatistics(games: GameResult[]) {
  const rounds = games.filter(
    (g) =>
      Number.isInteger(g.roundsPlayed) &&
      g.roundsPlayed! >= 1 &&
      g.roundsPlayed! <= 999,
  );
  const mean = (subset: GameResult[]) =>
    subset.length
      ? subset.reduce((sum, g) => sum + g.roundsPlayed!, 0) / subset.length
      : null;
  return {
    roundsRecorded: rounds.length,
    averageRounds: mean(rounds),
    wonAverageRounds: mean(rounds.filter((g) => g.outcome === 'won')),
    lostAverageRounds: mean(rounds.filter((g) => g.outcome === 'lost')),
    savedRecorded: games.filter((g) => g.victimsSaved != null).length,
    killedRecorded: games.filter((g) => g.victimsKilled != null).length,
  };
}
