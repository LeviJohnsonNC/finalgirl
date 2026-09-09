import { describe, it, expect } from 'vitest';
import { computeArchetype } from './useArchetypeScoring';
import { GameResult } from './useGameHistory';

// Helper to build a minimal GameResult
function makeGame(overrides: Partial<GameResult> = {}): GameResult {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    outcome: 'won',
    killer: 'Dr. Fright',
    location: 'Creech Manor',
    finalGirl: 'Laurie',
    ...overrides,
  };
}

describe('computeArchetype', () => {
  it('returns newcomer when fewer than 3 games', () => {
    const games = [makeGame(), makeGame()];
    const wins = games.filter((g) => g.outcome === 'won');
    const result = computeArchetype(games, wins, 100, 10, 0);
    expect(result.archetype).toBe('newcomer');
  });

  it('identifies a strong Protector (high save ratio, high volume)', () => {
    // 5 games, 45 saved, 5 killed → 90% save ratio, avg 9/game
    const games = Array.from({ length: 5 }, () =>
      makeGame({ victimsSaved: 9, victimsKilled: 1, finalHorrorLevel: 4 }),
    );
    const wins = games;
    const result = computeArchetype(games, wins, 100, 45, 5);
    expect(result.archetype).toBe('protector');
  });

  it('identifies a Survivor (many clutch wins at ≤33% HP)', () => {
    // Laurie has 6 max HP → 33% threshold is 2 HP
    // 4 wins out of 5 at 1-2 HP = 80% clutch ratio → score ~80
    const clutchWins = Array.from({ length: 4 }, () =>
      makeGame({
        finalGirl: 'Laurie',
        finalGirlHealth: 1,
        finalHorrorLevel: 3,
        victimsSaved: 1,
        victimsKilled: 4,
      }),
    );
    const normalGame = makeGame({
      outcome: 'lost',
      finalGirl: 'Laurie',
      finalGirlHealth: 0,
      finalHorrorLevel: 5,
      victimsSaved: 0,
      victimsKilled: 6,
    });
    const games = [...clutchWins, normalGame];
    const wins = clutchWins;
    const result = computeArchetype(games, wins, 80, 4, 28);
    expect(result.archetype).toBe('survivor');
  });

  it('identifies a Duelist (high win rate, low horror on wins)', () => {
    // 6 wins out of 8, avg horror on wins = 1.5
    const winGames = Array.from({ length: 6 }, () =>
      makeGame({
        finalHorrorLevel: 1,
        finalGirlHealth: 5,
        victimsSaved: 2,
        victimsKilled: 3,
      }),
    );
    // Add a couple so we get only ~40% save ratio (not protector)
    const lossGames = Array.from({ length: 2 }, () =>
      makeGame({
        outcome: 'lost',
        finalHorrorLevel: 2,
        victimsSaved: 1,
        victimsKilled: 5,
      }),
    );
    const games = [...winGames, ...lossGames];
    const wins = winGames;
    // total saved: 14, total killed: 28 → 33% save ratio
    const result = computeArchetype(games, wins, 75, 14, 28);
    expect(result.archetype).toBe('duelist');
  });

  it('identifies a Gambler (high horror variance + extremes)', () => {
    // Games with horror levels: 1, 1, 7, 7, 2, 6 → high stddev, has extremes
    const horrorLevels = [1, 1, 7, 7, 2, 6];
    const games = horrorLevels.map((h) =>
      makeGame({
        outcome: h > 4 ? 'lost' : 'won',
        finalHorrorLevel: h,
        finalGirlHealth: 4,
        victimsSaved: 2,
        victimsKilled: 3,
      }),
    );
    const wins = games.filter((g) => g.outcome === 'won');
    // win rate: 50% (3 of 6), save ratio: 40%, not clutch → gambler should win
    const result = computeArchetype(games, wins, 50, 12, 18);
    expect(result.archetype).toBe('gambler');
  });

  it('calibration: user data produces Duelist', () => {
    // Simulate the user's 9 games from the plan
    // 6 wins, 3 losses, win rate 67%
    // Horror on wins avg ~1.67, save ratio 42%
    const winGames = [
      makeGame({ finalHorrorLevel: 1, finalGirlHealth: 5, finalGirl: 'Laurie', victimsSaved: 6, victimsKilled: 6 }),
      makeGame({ finalHorrorLevel: 1, finalGirl: 'Reiko', finalGirlHealth: 1, victimsSaved: 7, victimsKilled: 5 }),
      makeGame({ finalHorrorLevel: 1, finalGirl: 'Alice', finalGirlHealth: 4, victimsSaved: 6, victimsKilled: 8 }),
      makeGame({ finalHorrorLevel: 3, finalGirl: 'Selena', finalGirlHealth: 1, victimsSaved: 8, victimsKilled: 4 }),
      makeGame({ finalHorrorLevel: 2, finalGirl: 'Laurie', finalGirlHealth: 4, victimsSaved: 5, victimsKilled: 7 }),
      makeGame({ finalHorrorLevel: 2, finalGirl: 'Adelaide', finalGirlHealth: 5, victimsSaved: 3, victimsKilled: 9 }),
    ];
    const lossGames = [
      makeGame({ outcome: 'lost', finalHorrorLevel: 7, finalGirl: 'Laurie', finalGirlHealth: 0, victimsSaved: 2, victimsKilled: 10 }),
      makeGame({ outcome: 'lost', finalHorrorLevel: 5, finalGirl: 'Reiko', finalGirlHealth: 0, victimsSaved: 1, victimsKilled: 11 }),
      makeGame({ outcome: 'lost', finalHorrorLevel: 4, finalGirl: 'Alice', finalGirlHealth: 0, victimsSaved: 1, victimsKilled: 23 }),
    ];
    const games = [...winGames, ...lossGames];
    const wins = winGames;
    // total saved: 39, total killed: 83 → ~32% save ratio
    const totalSaved = games.reduce((s, g) => s + (g.victimsSaved || 0), 0);
    const totalKilled = games.reduce((s, g) => s + (g.victimsKilled || 0), 0);
    const winRate = (wins.length / games.length) * 100;

    const result = computeArchetype(games, wins, winRate, totalSaved, totalKilled);
    expect(result.archetype).toBe('duelist');
    expect(result.reason).toContain('%');
  });

  it('includes data-driven numbers in reason text', () => {
    const games = Array.from({ length: 4 }, () =>
      makeGame({ victimsSaved: 8, victimsKilled: 1, finalHorrorLevel: 4 }),
    );
    const wins = games;
    const result = computeArchetype(games, wins, 100, 32, 4);
    expect(result.archetype).toBe('protector');
    // Reason should contain actual numbers
    expect(result.reason).toMatch(/\d/);
  });
});

describe('computeArchetype scores', () => {
  const games = [
    makeGame({ outcome: 'won', finalHorrorLevel: 1, victimsSaved: 6 }),
    makeGame({ outcome: 'won', finalHorrorLevel: 7, victimsSaved: 5 }),
    makeGame({ outcome: 'lost', finalHorrorLevel: 2 }),
    makeGame({ outcome: 'won', finalHorrorLevel: 6, victimsSaved: 4 }),
  ];

  it('reports every archetype, highest first', () => {
    const { scores, archetype } = computeArchetype(games, games.filter((g) => g.outcome === 'won'), 75, 15, 4);

    expect(scores).toHaveLength(4);
    expect(scores[0].archetype).toBe(archetype);
    // Ranked, so the runner-up gap is readable rather than thrown away.
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1].score).toBeGreaterThanOrEqual(scores[i].score);
    }
    expect(scores.every((s) => Number.isInteger(s.score))).toBe(true);
  });

  it('has no scores to report before the third game', () => {
    expect(computeArchetype([makeGame()], [], 100, 0, 0).scores).toEqual([]);
  });

  it('joins three narrative facts with a single "and", not a stray full stop', () => {
    const { profile } = computeArchetype(
      games,
      games.filter((g) => g.outcome === 'won'),
      75,
      15,
      4,
      {
        nemesis: { killer: 'Hans', losses: 3 },
        usualSuspect: null,
        cursedSite: null,
        homeTurf: { location: 'Camp Happy Trails', wins: 4 },
        comfortZone: { finalGirl: 'Alice', wins: 5 },
        grinder: null,
      },
    );

    // Previously "…dragging you back. Alice is your go-to…, and Camp…" — the
    // list-joining map returned its input on both branches.
    expect(profile).toContain('dragging you back, Alice is your go-to with 5 wins, and Camp Happy Trails');
  });
});
