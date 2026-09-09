import { describe, it, expect } from 'vitest';
import { buildGameRecord, describeStreak } from './gameRecord';
import { GameResult } from '@/hooks/useGameHistory';

let seq = 0;
const game = (day: number, outcome: 'won' | 'lost'): GameResult => ({
  id: `g${seq++}`,
  timestamp: new Date(2026, 2, day, 20, 0, 0).getTime(),
  outcome,
  killer: 'The Organism',
  location: 'Creech Manor',
  finalGirl: 'Alice',
});

describe('buildGameRecord', () => {
  it('counts the run the player is currently on', () => {
    const record = buildGameRecord([
      game(1, 'lost'),
      game(2, 'won'),
      game(3, 'won'),
      game(4, 'won'),
    ]);

    expect(record.current).toEqual({ outcome: 'won', length: 3 });
    expect(describeStreak(record.current)).toBe('3 wins');
  });

  it('measures the longest run of each outcome anywhere in the history', () => {
    const record = buildGameRecord([
      game(1, 'won'),
      game(2, 'won'),
      game(3, 'won'),
      game(4, 'won'),
      game(5, 'lost'),
      game(6, 'lost'),
      game(7, 'won'),
    ]);

    expect(record.bestWinRun).toBe(4);
    expect(record.worstLossRun).toBe(2);
    // The current run is the short one at the end, not the best one.
    expect(record.current).toEqual({ outcome: 'won', length: 1 });
  });

  it('orders by time rather than trusting the caller — the archive returns newest first', () => {
    const chronological = [game(1, 'lost'), game(2, 'lost'), game(3, 'won')];
    const asTheArchiveReturnsIt = [...chronological].reverse();

    const record = buildGameRecord(asTheArchiveReturnsIt);

    // Read newest-first without sorting, the current run would look like 2 losses.
    expect(record.current).toEqual({ outcome: 'won', length: 1 });
    expect(record.worstLossRun).toBe(2);
    expect(record.recent.map((r) => r.outcome)).toEqual(['lost', 'lost', 'won']);
  });

  it('returns recent form oldest-first and capped to the limit', () => {
    const games = Array.from({ length: 30 }, (_, i) => game(i + 1, i % 2 === 0 ? 'won' : 'lost'));
    const record = buildGameRecord(games, 20);

    expect(record.recent).toHaveLength(20);
    expect(record.recent[0].timestamp).toBeLessThan(record.recent[19].timestamp);
    // The last entry is the newest game overall.
    expect(record.recent[19].timestamp).toBe(Math.max(...games.map((g) => g.timestamp)));
  });

  it('handles an unbroken history of one outcome', () => {
    const allLosses = buildGameRecord([game(1, 'lost'), game(2, 'lost'), game(3, 'lost')]);
    expect(allLosses).toMatchObject({ wins: 0, losses: 3, winRate: 0, bestWinRun: 0, worstLossRun: 3 });
    expect(allLosses.current).toEqual({ outcome: 'lost', length: 3 });
  });

  it('computes the split and rate', () => {
    const record = buildGameRecord([game(1, 'won'), game(2, 'lost'), game(3, 'won'), game(4, 'won')]);
    expect(record).toMatchObject({ wins: 3, losses: 1, played: 4 });
    expect(record.winRate).toBe(75);
  });

  it('is empty, not undefined, for a player with no games', () => {
    const record = buildGameRecord([]);
    expect(record).toMatchObject({ wins: 0, losses: 0, played: 0, winRate: 0, bestWinRun: 0, worstLossRun: 0 });
    expect(record.current).toBeNull();
    expect(record.recent).toEqual([]);
    expect(describeStreak(null)).toBe('—');
  });

  it('says "1 win" and "1 loss", not "1 wins"', () => {
    expect(describeStreak({ outcome: 'won', length: 1 })).toBe('1 win');
    expect(describeStreak({ outcome: 'lost', length: 1 })).toBe('1 loss');
  });
});
