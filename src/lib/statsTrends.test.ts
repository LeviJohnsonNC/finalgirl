import { describe, it, expect } from 'vitest';
import { buildTrend, granularityFor, rangeStart } from './statsTrends';
import { GameResult } from '@/hooks/useGameHistory';

const game = (iso: string, outcome: 'won' | 'lost', saved = 0, killed = 0): GameResult => ({
  id: iso + outcome,
  timestamp: new Date(iso).getTime(),
  outcome,
  killer: 'The Organism',
  location: 'Creech Manor',
  finalGirl: 'Alice',
  victimsSaved: saved,
  victimsKilled: killed,
});

const NOW = new Date('2026-03-31T12:00:00').getTime();

describe('buildTrend', () => {
  it('emits every period in the range, including the empty ones', () => {
    // Two sessions eight days apart. The old chart drew a curve straight
    // between them; the buckets in between must exist and be zero.
    const trend = buildTrend([game('2026-03-20T20:00:00', 'won'), game('2026-03-28T20:00:00', 'lost')], '30d', NOW);

    expect(trend.granularity).toBe('day');
    expect(trend.buckets).toHaveLength(30);
    const played = trend.buckets.filter((b) => b.games > 0);
    expect(played).toHaveLength(2);
    const between = trend.buckets.filter((b) => b.start > played[0].start && b.start < played[1].start);
    expect(between).toHaveLength(7);
    expect(between.every((b) => b.games === 0 && b.saved === 0)).toBe(true);
  });

  it('totals wins, losses and victims into the right bucket', () => {
    const trend = buildTrend(
      [
        game('2026-03-30T18:00:00', 'won', 3, 1),
        game('2026-03-30T21:00:00', 'lost', 1, 4),
        game('2026-03-29T21:00:00', 'won', 2, 0),
      ],
      '30d',
      NOW,
    );

    const mar30 = trend.buckets.find((b) => b.fullLabel === 'Mar 30, 2026');
    expect(mar30).toMatchObject({ games: 2, wins: 1, losses: 1, saved: 4, killed: 5 });
    const mar29 = trend.buckets.find((b) => b.fullLabel === 'Mar 29, 2026');
    expect(mar29).toMatchObject({ games: 1, wins: 1, losses: 0, saved: 2, killed: 0 });
  });

  it('excludes games outside the window from the buckets and the count', () => {
    const trend = buildTrend([game('2025-06-01T20:00:00', 'won'), game('2026-03-30T20:00:00', 'won')], '30d', NOW);

    expect(trend.gamesInRange).toBe(1);
    expect(trend.buckets.reduce((sum, b) => sum + b.games, 0)).toBe(1);
  });

  it('groups a weekend of play into one week bucket at 90 days', () => {
    const trend = buildTrend(
      [game('2026-03-28T20:00:00', 'won'), game('2026-03-29T20:00:00', 'lost')], // Sat + Sun
      '90d',
      NOW,
    );

    expect(trend.granularity).toBe('week');
    const played = trend.buckets.filter((b) => b.games > 0);
    expect(played).toHaveLength(1);
    expect(played[0]).toMatchObject({ games: 2, wins: 1, losses: 1 });
  });

  it('starts an all-time range at the first game, not at an arbitrary epoch', () => {
    const games = [game('2026-01-15T20:00:00', 'won'), game('2026-03-30T20:00:00', 'won')];
    expect(rangeStart('all', games, NOW)).toBe(games[0].timestamp);

    const trend = buildTrend(games, 'all', NOW);
    expect(trend.gamesInRange).toBe(2);
    expect(trend.buckets[0].start).toBeLessThanOrEqual(games[0].timestamp);
  });

  it('keeps the column count readable as the span grows', () => {
    expect(granularityFor('30d', 30)).toBe('day');
    expect(granularityFor('90d', 90)).toBe('week');
    expect(granularityFor('1y', 365)).toBe('month');
    expect(granularityFor('all', 45)).toBe('day');
    expect(granularityFor('all', 300)).toBe('week');
    expect(granularityFor('all', 900)).toBe('month');

    const trend = buildTrend([game('2020-01-01T20:00:00', 'won')], 'all', NOW);
    expect(trend.granularity).toBe('month');
    expect(trend.buckets.length).toBeLessThan(80);
  });

  it('handles an empty history without inventing periods', () => {
    const trend = buildTrend([], 'all', NOW);
    expect(trend.gamesInRange).toBe(0);
    expect(trend.buckets).toHaveLength(1);
    expect(trend.buckets[0].games).toBe(0);
  });
});
