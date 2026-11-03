import { describe, it, expect } from 'vitest';
import { computeArchetype } from './useArchetypeScoring';
import type { GameResult } from './useGameHistory';

const games = (length: number, fields: (i: number) => Partial<GameResult> = () => ({})): GameResult[] =>
  Array.from({ length }, (_, i) => ({
    id: String(i), timestamp: i, outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails',
    finalGirl: 'Laurie', ...fields(i),
  }));

describe('career style profile', () => {
  it('keeps thin and empty evidence from assigning an identity', () => {
    const profile = computeArchetype(games(3, () => ({ finalHorrorLevel: 1 })));
    expect(profile.archetype).toBe('newcomer');
    expect(profile.scores).toHaveLength(4);
    expect(profile.scores[0]).toMatchObject({ support: 3, of: 3 });
    expect(computeArchetype(games(20, () => ({ outcome: 'lost' }))).archetype).toBe('newcomer');
  });

  it('finds distinct rescue, low-Horror and close-finish patterns', () => {
    expect(computeArchetype(games(8, () => ({ victimsSaved: 9, victimsKilled: 1, finalHorrorLevel: 5 }))).archetype).toBe('protector');
    expect(computeArchetype(games(8, () => ({ finalHorrorLevel: 1, finalGirlHealth: 5 }))).archetype).toBe('duelist');
    expect(computeArchetype(games(8, () => ({ finalGirlHealth: 2, finalGirlMaxHealth: 6 }))).archetype).toBe('survivor');
  });

  it('shares the title and shows both facts when two supported readings are close', () => {
    const profile = computeArchetype(games(8, () => ({ finalHorrorLevel: 2, victimsSaved: 10, victimsKilled: 0 })));
    expect(profile).toMatchObject({ archetype: 'duelist', blend: 'protector' });
    expect(profile.summary).toEqual([
      '8 of 8 eligible games ended in a win at Horror 3 or lower.',
      '80 of 80 resolved victims saved across 8 games with both totals recorded.',
    ]);
  });

  it('uses the right denominator for each dimension and leaves missing results unknown', () => {
    const profile = computeArchetype([
      ...games(7, i => ({ victimsSaved: 4, victimsKilled: i < 4 ? 1 : null, finalGirlHealth: i < 3 ? 1 : undefined })),
      ...games(5, i => ({ id: `loss${i}`, outcome: 'lost' })),
    ]);
    expect(profile.scores.find(item => item.archetype === 'protector')).toMatchObject({ support: 4, of: 12 });
    expect(profile.scores.find(item => item.archetype === 'survivor')).toMatchObject({ support: 3, of: 7 });
    expect(profile.scores.find(item => item.archetype === 'duelist')).toMatchObject({ support: 5, of: 12 });
  });

  it('uses only consecutive same-cast comparisons and skips gaps in their Horror readings', () => {
    const unique = games(10, i => ({ finalGirl: `Girl ${i}`, finalHorrorLevel: i % 2 ? 1 : 7 }));
    expect(computeArchetype(unique).scores[3]).toMatchObject({ support: 0, of: 0 });
    const alternating = games(10, i => ({ finalHorrorLevel: i === 4 ? undefined : i % 2 ? 1 : 7 }));
    const profile = computeArchetype(alternating);
    expect(profile.archetype).toBe('gambler');
    expect(profile.scores[3]).toMatchObject({ support: 7, of: 9 });
  });

  it('weights recent games more and damps extreme readings on small samples', () => {
    const protector = (history: GameResult[]) => computeArchetype(history).scores[1].score;
    const perfect = (n: number) => games(n, () => ({ victimsSaved: 5, victimsKilled: 0 }));
    expect(protector(perfect(3))).toBeLessThan(70);
    expect(protector(perfect(40))).toBeGreaterThan(82);
    const swing = (late: boolean) => games(20, i => ((i >= 10) === late)
      ? { victimsSaved: 5, victimsKilled: 0 }
      : { victimsSaved: 0, victimsKilled: 5 });
    expect(protector(swing(true))).toBeGreaterThan(protector(swing(false)));
  });
});
