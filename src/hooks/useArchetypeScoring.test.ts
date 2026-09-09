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
    const result = computeArchetype(games);
    expect(result.archetype).toBe('newcomer');
  });

  it('identifies a strong Protector (high save ratio, high volume)', () => {
    // 5 games, 45 saved, 5 killed → 90% save ratio, avg 9/game
    const games = Array.from({ length: 5 }, () =>
      makeGame({ victimsSaved: 9, victimsKilled: 1, finalHorrorLevel: 4 }),
    );
    const wins = games;
    const result = computeArchetype(games);
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
    const result = computeArchetype(games);
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
    const result = computeArchetype(games);
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
    const result = computeArchetype(games);
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

    const result = computeArchetype(games);
    expect(result.archetype).toBe('duelist');
    expect(result.reason).toContain('%');
  });

  it('includes data-driven numbers in reason text', () => {
    const games = Array.from({ length: 4 }, () =>
      makeGame({ victimsSaved: 8, victimsKilled: 1, finalHorrorLevel: 4 }),
    );
    const wins = games;
    const result = computeArchetype(games);
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
    const { scores, archetype } = computeArchetype(games);

    expect(scores).toHaveLength(4);
    expect(scores[0].archetype).toBe(archetype);
    expect(scores.every((s) => Number.isInteger(s.score))).toBe(true);

    // Measured axes rank by score; an axis with nothing behind it sits on the
    // prior at 50 and must sort last regardless of that number.
    const measured = scores.filter((s) => s.support > 0);
    const blind = scores.filter((s) => s.support === 0);
    expect(scores.slice(0, measured.length)).toEqual(measured);
    for (let i = 1; i < measured.length; i++) {
      expect(measured[i - 1].score).toBeGreaterThanOrEqual(measured[i].score);
    }
    expect(blind.every((s) => s.score === 50)).toBe(true);

    // Support is reported as a fraction of the history, so a score built on
    // three of fifty sessions cannot pass for a settled verdict.
    expect(scores.every((s) => s.of === games.length)).toBe(true);
  });

  it('has no scores to report before the third game', () => {
    expect(computeArchetype([makeGame()]).scores).toEqual([]);
  });

  it('joins three narrative facts with a single "and", not a stray full stop', () => {
    const { profile } = computeArchetype(
      games,
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

describe('scoring corrections', () => {
  const scoreOf = (games: GameResult[], archetype: string) =>
    computeArchetype(games).scores.find((s) => s.archetype === archetype)!;

  it('does not read an unrecorded health bar as a comfortable win', () => {
    // Every recorded win was a knife-edge one; the rest simply were not filled
    // in. Dividing clutch wins by *all* wins scored this player as barely a
    // Survivor; over the wins that carry the field, they plainly are one.
    const games = [
      makeGame({ outcome: 'won', finalGirl: 'Laurie', finalGirlHealth: 1 }),
      makeGame({ outcome: 'won', finalGirl: 'Laurie', finalGirlHealth: 1 }),
      makeGame({ outcome: 'won', finalGirl: 'Laurie', finalGirlHealth: 1 }),
      ...Array.from({ length: 9 }, () => makeGame({ outcome: 'won' })),
    ];

    const survivor = scoreOf(games, 'survivor');
    expect(survivor.support).toBe(3);
    expect(survivor.of).toBe(12);
    expect(survivor.score).toBeGreaterThan(60);
  });

  it('does not read an unfilled victim count as nobody saved', () => {
    const day = 86_400_000;
    const recorded = Array.from({ length: 3 }, (_, i) =>
      makeGame({ timestamp: Date.now() - (3 - i) * day, victimsSaved: 6, victimsKilled: 0 }),
    );
    const blank = Array.from({ length: 8 }, (_, i) =>
      makeGame({ timestamp: Date.now() - (11 - i) * day }),
    );

    const withBlanks = scoreOf([...blank, ...recorded], 'protector');

    // The blank games are absent from the rate, not counted as failures.
    expect(withBlanks.support).toBe(3);
    expect(withBlanks.of).toBe(11);
    expect(withBlanks.score).toBeGreaterThan(60);
  });

  it('pulls a rate from three games toward the middle, and leaves a long record alone', () => {
    const perfect = (n: number) =>
      Array.from({ length: n }, () => makeGame({ victimsSaved: 5, victimsKilled: 0 }));

    const thin = scoreOf(perfect(3), 'protector').score;
    const thick = scoreOf(perfect(40), 'protector').score;

    // Three flawless games are not a verdict; forty are. The prior keeps the
    // meter off 100 even then, which is the honest reading — nobody's record
    // is proof of a perfect tendency.
    expect(thin).toBeLessThan(70);
    expect(thick).toBeGreaterThan(82);
    expect(thick - thin).toBeGreaterThan(15);
  });

  it('weights recent sessions more heavily than old ones', () => {
    const day = 86_400_000;
    // Twenty games of never rescuing, then ten of rescuing everyone.
    const reformed = [
      ...Array.from({ length: 20 }, (_, i) =>
        makeGame({ timestamp: Date.now() - (30 - i) * day, victimsSaved: 0, victimsKilled: 5 }),
      ),
      ...Array.from({ length: 10 }, (_, i) =>
        makeGame({ timestamp: Date.now() - (10 - i) * day, victimsSaved: 5, victimsKilled: 0 }),
      ),
    ];

    // The same thirty games in the opposite order — someone who used to save
    // everyone and stopped.
    const lapsed = [
      ...Array.from({ length: 10 }, (_, i) =>
        makeGame({ timestamp: Date.now() - (30 - i) * day, victimsSaved: 5, victimsKilled: 0 }),
      ),
      ...Array.from({ length: 20 }, (_, i) =>
        makeGame({ timestamp: Date.now() - (20 - i) * day, victimsSaved: 0, victimsKilled: 5 }),
      ),
    ];

    // A flat lifetime average cannot tell these two apart — both are 10 saving
    // games out of 30. Recency reads them as opposite people.
    expect(scoreOf(reformed, 'protector').score).toBeGreaterThan(45);
    expect(scoreOf(lapsed, 'protector').score).toBeLessThan(35);
  });

  it('counts wildness as swing between sessions, not as ending calm', () => {
    const day = 86_400_000;
    const steady = Array.from({ length: 10 }, (_, i) =>
      makeGame({ timestamp: Date.now() - (10 - i) * day, finalHorrorLevel: 1 }),
    );
    const wild = Array.from({ length: 10 }, (_, i) =>
      makeGame({ timestamp: Date.now() - (10 - i) * day, finalHorrorLevel: i % 2 === 0 ? 1 : 7 }),
    );

    // Ten dominant wins at terror 1 is the most consistent record possible.
    expect(scoreOf(steady, 'gambler').score).toBeLessThan(25);
    expect(scoreOf(wild, 'gambler').score).toBeGreaterThan(70);
  });

  it('never lets an unmeasured axis outrank a measured one', () => {
    // No terror levels anywhere: Gambler and Duelist have nothing to go on.
    const games = Array.from({ length: 8 }, () =>
      makeGame({ outcome: 'lost', victimsSaved: 0, victimsKilled: 6 }),
    );

    const { scores, archetype } = computeArchetype(games);
    const gambler = scores.find((s) => s.archetype === 'gambler')!;

    expect(gambler.support).toBe(0);
    expect(gambler.score).toBe(50);
    expect(archetype).not.toBe('gambler');
    expect(scores[scores.length - 1].support).toBe(0);
  });
});
