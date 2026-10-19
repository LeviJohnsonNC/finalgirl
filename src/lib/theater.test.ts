import { describe, expect, it } from 'vitest';
import type { GameResult } from '@/hooks/useGameHistory';
import { activeScreenings, activeScreeningStatus, buildScreenings, screeningDate, screeningVerdict } from './theater';
import type { ActiveGame } from './activeGame';

const game = (id: string, timestamp: number, overrides: Partial<GameResult> = {}): GameResult => ({ id, timestamp, outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', sceneImageUrl: `https://test.invalid/${id}.png`, ...overrides });

describe('personal screening selection', () => {
  it('starts with the latest game, then varies matchups without reshuffling on refresh', () => {
    const games = [game('old', 1, { killer: 'Billy the Bear', location: 'Buddyland' }), game('latest', 3), game('similar', 2)];
    expect(buildScreenings(games).map(g => g.id)).toEqual(['latest', 'old', 'similar']);
    expect(buildScreenings([...games].reverse())).toEqual(buildScreenings(games));
    expect(games[0].id).toBe('old');
  });
  it('skips unavailable scenes even when the same game has a poster', () => {
    const games = [game('a', 2, { posterImageUrl: 'https://test.invalid/poster.png' }), game('b', 1)];
    const failed = new Set(['https://test.invalid/a.png']);
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
    expect(buildScreenings([game('a', 1, { sceneImageUrl: undefined, posterImageUrl: 'https://test.invalid/p.png' })])).toEqual([]);
    for (const value of [0, NaN, Infinity, 1e30]) expect(screeningDate(value)).toBe('');
  });
});

describe('unfinished screening', () => {
  const draft: ActiveGame = { version: 1, id: 'draft', phase: 'nowPlaying', selection: { killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', setupScenario: null, startingEvent: null, mission: null, filmId: 's1-camp-happy-trails' } };
  it('keeps unrecorded rounds unknown and labels the real continuation stage', () => {
    expect(activeScreeningStatus(draft)).toBe('Ready for the opening scene');
    expect(activeScreeningStatus({ ...draft, phase: 'outcome' })).toBe('Your result is waiting for review');
    expect(activeScreeningStatus({ ...draft, phase: 'ending' })).toBe('Your ending is waiting');
    const tracked = { ...draft, playEvents: [{ id: 'a', at: 1, kind: 'start' as const, saved: 2, killed: 1, round: null }] };
    expect(activeScreeningStatus(tracked)).toBe('Round not recorded · 2 saved · 1 killed');
  });
  it('uses actual draft artwork without fabricating an outcome or date', () => {
    const withArt = { ...draft, sceneImageUrl: 'https://test.invalid/scene.png', posterImageUrl: 'https://test.invalid/poster.png' };
    expect(activeScreenings(withArt, new Set())[0]).toMatchObject({ kind: 'scene', timestamp: 0 });
    expect(activeScreenings(withArt, new Set())[0].outcome).toBeUndefined();
    expect(activeScreenings(withArt, new Set([withArt.sceneImageUrl]))).toEqual([]);
    expect(activeScreenings({ ...draft, posterImageUrl: withArt.posterImageUrl }, new Set())).toEqual([]);
  });
});


describe('marquee result accuracy', () => {
  it.each([
    ['won', 2, 'Survived'], ['won', 0, 'Sacrificial victory'], ['won', undefined, 'Victory'],
    ['lost', 2, 'Alive · Defeat'], ['lost', 0, 'Lost to the night'], ['lost', undefined, 'Lost to the night'],
  ] as const)('labels %s with health %s as %s', (outcome, finalGirlHealth, label) => {
    expect(screeningVerdict({ outcome, finalGirlHealth })).toBe(label);
  });
  it('preserves recorded health on the selected scene', () => {
    const [screening] = buildScreenings([game('a', 1, { finalGirlHealth: 0, posterImageUrl: 'https://test.invalid/poster.png' })]);
    expect(screening.kind).toBe('scene');
    expect(screeningVerdict(screening)).toBe('Sacrificial victory');
  });
});
