import { describe, it, expect } from 'vitest';
import { buildHorrorDistribution, buildRecentSessions, buildWeaponTally } from './sessionStats';
import { GameResult } from '@/hooks/useGameHistory';

let seq = 0;
const game = (over: Partial<GameResult> = {}): GameResult => ({
  id: `g${seq++}`,
  timestamp: new Date(2026, 0, 1).getTime() + seq * 86400000,
  outcome: 'won',
  killer: 'The Organism',
  location: 'Creech Manor',
  finalGirl: 'Alice',
  ...over,
});

describe('buildHorrorDistribution', () => {
  it('emits every level, including the ones never reached', () => {
    const { bins, recorded } = buildHorrorDistribution([
      game({ finalHorrorLevel: 1 }),
      game({ finalHorrorLevel: 4 }),
      game({ finalHorrorLevel: 4 }),
    ]);

    expect(bins).toHaveLength(7);
    expect(bins.map((b) => b.games)).toEqual([1, 0, 0, 2, 0, 0, 0]);
    expect(recorded).toBe(3);
  });

  it('ignores games with no horror level recorded', () => {
    const { bins, recorded } = buildHorrorDistribution([game({ finalHorrorLevel: 3 }), game(), game()]);
    expect(recorded).toBe(1);
    expect(bins.reduce((sum, b) => sum + b.games, 0)).toBe(1);
  });

  it('drops out-of-range levels rather than inventing a bin for them', () => {
    const { bins, recorded } = buildHorrorDistribution([
      game({ finalHorrorLevel: 0 }),
      game({ finalHorrorLevel: 9 }),
      game({ finalHorrorLevel: 7 }),
    ]);
    expect(bins).toHaveLength(7);
    expect(recorded).toBe(1);
  });
});

describe('buildWeaponTally', () => {
  it('counts uses and wins, most-used first', () => {
    const tally = buildWeaponTally([
      game({ weaponUsed: 'Machete', outcome: 'won' }),
      game({ weaponUsed: 'Machete', outcome: 'lost' }),
      game({ weaponUsed: 'Shotgun', outcome: 'won' }),
    ]);

    expect(tally).toEqual([
      { name: 'Machete', uses: 2, wins: 1 },
      { name: 'Shotgun', uses: 1, wins: 1 },
    ]);
  });

  it('treats casing as the same weapon and ignores blanks', () => {
    const tally = buildWeaponTally([
      game({ weaponUsed: 'machete' }),
      game({ weaponUsed: 'Machete' }),
      game({ weaponUsed: '   ' }),
      game({}),
    ]);

    expect(tally).toHaveLength(1);
    expect(tally[0].uses).toBe(2);
  });

  it('caps the list', () => {
    const games = Array.from({ length: 10 }, (_, i) => game({ weaponUsed: `W${i}` }));
    expect(buildWeaponTally(games, 3)).toHaveLength(3);
  });
});

describe('buildRecentSessions', () => {
  it('returns the newest sessions first, capped', () => {
    const games = Array.from({ length: 12 }, () => game());
    const recent = buildRecentSessions(games, 5);

    expect(recent).toHaveLength(5);
    expect(recent[0].timestamp).toBeGreaterThan(recent[4].timestamp);
    expect(recent[0].timestamp).toBe(Math.max(...games.map((g) => g.timestamp)));
  });

  it('carries the horror level when it was recorded, and null when it was not', () => {
    const recent = buildRecentSessions([game({ finalHorrorLevel: 5 }), game()]);
    expect(recent.map((r) => r.horror)).toEqual([null, 5]);
  });
});
