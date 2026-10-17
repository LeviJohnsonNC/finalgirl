import { describe, expect, it } from 'vitest';
import type { GameResult } from '@/hooks/useGameHistory';
import { buildScreenings, screeningDate } from './theater';

const game = (id: string, timestamp: number, overrides: Partial<GameResult> = {}): GameResult => ({ id, timestamp, outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', sceneImageUrl: `https://test.invalid/${id}.png`, ...overrides });

describe('personal screening selection', () => {
  it('starts with the latest game, then varies matchups without reshuffling on refresh', () => {
    const games = [game('old', 1, { killer: 'Billy the Bear', location: 'Buddyland' }), game('latest', 3), game('similar', 2)];
    expect(buildScreenings(games).map(g => g.id)).toEqual(['latest', 'old', 'similar']);
    expect(buildScreenings([...games].reverse())).toEqual(buildScreenings(games));
    expect(games[0].id).toBe('old');
  });
  it('falls back to the same game’s poster after a scene failure and skips exhausted games', () => {
    const games = [game('a', 2, { posterImageUrl: 'https://test.invalid/poster.png' }), game('b', 1)];
    const failed = new Set(['https://test.invalid/a.png']);
    expect(buildScreenings(games, failed)[0]).toMatchObject({ id: 'a', kind: 'poster', imageUrl: 'https://test.invalid/poster.png' });
    failed.add('https://test.invalid/poster.png');
    expect(buildScreenings(games, failed).map(g => g.id)).toEqual(['b']);
  });
  it('deduplicates pictures and IDs, caps the reel, and leaves the archive untouched', () => {
    const games = Array.from({ length: 40 }, (_, i) => game(String(i), i));
    games.push(game('39', 39), game('duplicate-picture', 0, { sceneImageUrl: 'https://test.invalid/38.png' }));
    const reel = buildScreenings(games);
    expect(reel).toHaveLength(24);
    expect(new Set(reel.map(g => g.imageUrl)).size).toBe(24);
    expect(games).toHaveLength(42);
  });
  it('handles empty archives, poster-only games, and missing or invalid dates', () => {
    expect(buildScreenings([])).toEqual([]);
    expect(buildScreenings([game('a', 1, { sceneImageUrl: undefined })])).toEqual([]);
    expect(buildScreenings([game('a', 1, { sceneImageUrl: undefined, posterImageUrl: 'https://test.invalid/p.png' })])[0].kind).toBe('poster');
    for (const value of [0, NaN, Infinity, 1e30]) expect(screeningDate(value)).toBe('');
  });
});
