import { describe, expect, it } from 'vitest';
import { buildPerformanceTrend, type PerformanceGame } from './performanceTrend';

const now = Date.UTC(2026, 10, 4);
const game = (n: number, patch: Partial<PerformanceGame> = {}): PerformanceGame => ({
  id: `game-${String(n).padStart(3, '0')}`, timestamp: now - n * 86400000,
  outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', ...patch,
});
const run = (games: PerformanceGame[]) => buildPerformanceTrend(games, now);

describe('recent versus earlier performance', () => {
  it('compares at most 40 completed games without mutating input or using a game twice', () => {
    const games = Array.from({ length: 65 }, (_, n) => game(n)).reverse();
    const before = structuredClone(games), report = run(games);
    expect(games).toEqual(before);
    expect(report.recent).toHaveLength(20); expect(report.earlier).toHaveLength(20);
    expect(report.pairs).toHaveLength(20);
    expect(new Set(report.pairs.flatMap(pair => [pair.earlier.id, pair.recent.id])).size).toBe(40);
    expect(report.pairs[0]).toEqual({ recent: game(0), earlier: game(20) });
  });
  it('includes losses and reports a lower as well as higher matched win rate', () => {
    const games = Array.from({ length: 40 }, (_, n) => game(n, { outcome: n < 10 || n >= 20 ? 'won' : 'lost' }));
    expect(run(games).matched).toEqual({ recentWins: 10, earlierWins: 20, difference: -50 });
    expect(run(games.map(g => ({ ...g, outcome: g.outcome === 'won' ? 'lost' : 'won' }))).matched.difference).toBe(50);
  });
  it('does not mistake a changed cast mix for comparable improvement', () => {
    const report = run(Array.from({ length: 40 }, (_, n) => game(n, {
      outcome: n < 20 ? 'won' : 'lost', killer: n < 20 ? 'Hans' : 'Poltergeist',
    })));
    expect(report.recentWins).toBe(20); expect(report.earlierWins).toBe(0);
    expect(report.comparable).toBe(false); expect(report.pairs).toHaveLength(0);
    expect(report.matched.difference).toBeNull();
  });
  it('requires the same Final Girl, killer AND location; five pairs is the minimum', () => {
    const games = Array.from({ length: 40 }, (_, n) => game(n, {
      finalGirl: n >= 24 ? 'Sally' : 'Laurie', location: n >= 25 ? 'Maple Lane' : 'Camp Happy Trails',
    }));
    expect(run(games).pairs).toHaveLength(4); expect(run(games).comparable).toBe(false);
    games[24] = game(24);
    expect(run(games).pairs).toHaveLength(5); expect(run(games).comparable).toBe(true);
  });
  it('keeps zero, excludes unknown and invalid metrics, and uses paired denominators', () => {
    const games = Array.from({ length: 40 }, (_, n) => game(n));
    games[0] = game(0, { victimsSaved: 0, finalHorrorLevel: 0 });
    games[20] = game(20, { victimsSaved: 4, finalHorrorLevel: 7 });
    games[1] = game(1, { victimsSaved: 9, finalHorrorLevel: 3 });
    games[2] = game(2, { victimsSaved: -1, finalHorrorLevel: 8 });
    games[22] = game(22, { victimsSaved: 2, finalHorrorLevel: 2 });
    const report = run(games);
    expect(report.rescues).toEqual({ pairs: 1, recent: 0, earlier: 4 });
    expect(report.horror).toEqual({ pairs: 1, recent: 0, earlier: 7 });
    expect(report.pairs).toHaveLength(20);
  });
  it('handles sparse history, duplicates, bad dates and future records without inventing trends', () => {
    expect(run([]).comparable).toBe(false);
    const report = run([game(1), game(1), game(2, { timestamp: NaN }), game(3, { timestamp: now + 1 }), game(4, { timestamp: -1 })]);
    expect(report.recent).toEqual([game(1)]);
    expect(report.earlier).toEqual([]); expect(report.rescues.recent).toBeNull();
  });
  it('changes with corrections/deletions and pairs deterministically without choosing by result', () => {
    const games = Array.from({ length: 40 }, (_, n) => game(n));
    const before = run(games);
    const corrected = run(games.map(g => g.id === game(20).id ? { ...g, outcome: 'lost' as const } : g));
    expect(corrected.pairs.map(p => [p.earlier.id, p.recent.id])).toEqual(before.pairs.map(p => [p.earlier.id, p.recent.id]));
    expect(corrected.matched.difference).toBe(5);
    expect(run(games.filter(g => g.id !== game(20).id)).pairs).toHaveLength(19);
    expect(run(games.map(g => ({ ...g, timestamp: now })))).toEqual(run(games.map(g => ({ ...g, timestamp: now })).reverse()));
  });
});
