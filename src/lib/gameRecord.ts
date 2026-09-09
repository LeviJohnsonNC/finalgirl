import { GameResult } from '@/hooks/useGameHistory';

export type Outcome = 'won' | 'lost';

export interface Streak {
  outcome: Outcome;
  length: number;
}

export interface FormEntry {
  id: string;
  outcome: Outcome;
  timestamp: number;
  killer: string;
  finalGirl: string;
}

export interface GameRecord {
  wins: number;
  losses: number;
  played: number;
  /** 0–100. Zero when nothing has been played, so callers never divide. */
  winRate: number;
  /** The run the player is on right now, counted back from the latest game. */
  current: Streak | null;
  /** Longest unbroken run of each outcome, anywhere in the history. */
  bestWinRun: number;
  worstLossRun: number;
  /** Most recent sessions, oldest first, so the strip reads left to right. */
  recent: FormEntry[];
}

const EMPTY: GameRecord = {
  wins: 0,
  losses: 0,
  played: 0,
  winRate: 0,
  current: null,
  bestWinRun: 0,
  worstLossRun: 0,
  recent: [],
};

/**
 * The win/loss record, including the streaks the stats page never computed.
 *
 * Order matters here in a way it does not elsewhere on the page: a streak is
 * defined by adjacency in time. `gameHistory` arrives newest-first from the
 * archive, but the local cache merges and the legacy backfill both append, so
 * this sorts rather than trusting the caller's order.
 */
export const buildGameRecord = (games: GameResult[], recentLimit = 20): GameRecord => {
  if (games.length === 0) return EMPTY;

  const ordered = [...games].sort((a, b) => a.timestamp - b.timestamp);

  let wins = 0;
  let losses = 0;
  let bestWinRun = 0;
  let worstLossRun = 0;
  let runOutcome: Outcome | null = null;
  let runLength = 0;

  ordered.forEach((game) => {
    const outcome: Outcome = game.outcome === 'won' ? 'won' : 'lost';
    if (outcome === 'won') wins += 1;
    else losses += 1;

    runLength = outcome === runOutcome ? runLength + 1 : 1;
    runOutcome = outcome;

    if (outcome === 'won') bestWinRun = Math.max(bestWinRun, runLength);
    else worstLossRun = Math.max(worstLossRun, runLength);
  });

  // The final run is the one still standing.
  const current: Streak | null = runOutcome ? { outcome: runOutcome, length: runLength } : null;

  const recent = ordered.slice(-recentLimit).map((game) => ({
    id: game.id,
    outcome: (game.outcome === 'won' ? 'won' : 'lost') as Outcome,
    timestamp: game.timestamp,
    killer: game.killer,
    finalGirl: game.finalGirl,
  }));

  return {
    wins,
    losses,
    played: ordered.length,
    winRate: (wins / ordered.length) * 100,
    current,
    bestWinRun,
    worstLossRun,
    recent,
  };
};

/** "3 wins" / "1 loss" — the streak in words, for a label and for a screen reader. */
export const describeStreak = (streak: Streak | null): string => {
  if (!streak || streak.length === 0) return '—';
  const noun = streak.outcome === 'won' ? 'win' : 'loss';
  const plural = streak.outcome === 'won' ? 'wins' : 'losses';
  return `${streak.length} ${streak.length === 1 ? noun : plural}`;
};

export const describeRun = (length: number, outcome: Outcome): string => {
  if (length === 0) return '—';
  const noun = outcome === 'won' ? 'win' : 'loss';
  const plural = outcome === 'won' ? 'wins' : 'losses';
  return `${length} ${length === 1 ? noun : plural}`;
};
