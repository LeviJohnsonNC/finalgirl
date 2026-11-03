import { describe, expect, it } from 'vitest';
import type { GameResult } from '@/hooks/useGameHistory';
import { newPlayEvent, type PlayEvent } from '@/lib/play/events';
import { buildPlayStyle } from './playStyle';

const start = () => newPlayEvent({ kind: 'start', round: 1, saved: 0, killed: 0 });
const state = (field: 'finalHorrorLevel' | 'finalGirlHealth', value: number | null) => newPlayEvent({ kind: 'state', field, value });
const rescue = (quantity: number) => newPlayEvent({ kind: 'saved', quantity });
const reveal = () => newPlayEvent({ kind: 'moment', momentType: 'dark-power', text: 'Dark Power revealed' });
const round = () => newPlayEvent({ kind: 'round' });
const game = (playEvents?: PlayEvent[], fields: Partial<GameResult> = {}): GameResult => ({
  id: crypto.randomUUID(), timestamp: 1, killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie',
  outcome: 'won', playEvents, ...fields,
});
const repeated = <T>(length: number, build: (i: number) => T) => Array.from({ length }, (_, i) => build(i));

describe('Play style evidence', () => {
  it('uses actual observations for coverage and retains the latest 20 as the denominator', () => {
    const onlySetup = game([start(), state('finalGirlHealth', 5), state('finalHorrorLevel', 2)]);
    const withPlay = game([start(), round()]);
    const report = buildPlayStyle([withPlay, onlySetup, ...repeated(20, () => game()), withPlay]);
    expect(report).toEqual({ recorded: 1, total: 20, findings: [] });
  });

  it('uses restored rescues, corrected quantities and the recorded reveal order', () => {
    const qualifying = repeated(3, () => {
      const earlier = rescue(4);
      const revealEvent = reveal();
      const after = rescue(2);
      return game([start(), earlier, revealEvent, after,
        newPlayEvent({ kind: 'reduce', target: earlier.id }),
        newPlayEvent({ kind: 'undo', target: earlier.id }),
        newPlayEvent({ kind: 'restore', target: earlier.id })]);
    });
    const tie = game([start(), rescue(1), reveal(), rescue(1)]);
    const missingReveal = game([start(), rescue(3)]);
    const corrected = game([start(), rescue(3), reveal(), newPlayEvent({ kind: 'adjust', saved: 0, killed: 0, round: 1 })]);
    const report = buildPlayStyle([...qualifying, tie, missingReveal, corrected]);
    expect(report.findings[0]).toMatchObject({ id: 'rescue', detail: expect.stringContaining('3 of 4') });
    expect(report.findings[0].cases.map(item => item.id)).toEqual(qualifying.map(item => item.id));
    expect(report.findings[0].cases[0]).toMatchObject({
      note: '3 saved before · 2 after', beats: ['Round 1 · 3 victims saved', 'Round 1 · Dark Power revealed'],
    });
  });

  it('finds comeback wins without counting a starting value, a cleared tracker or an undone drop', () => {
    const hp = (value: number | null) => state('finalGirlHealth', value);
    const wins = repeated(2, () => game([start(), hp(5), hp(1), round(), hp(5)], { finalGirlHealth: 3 }));
    const lost = game([start(), hp(5), hp(1), hp(0)], { outcome: 'lost' });
    const undone = hp(1);
    const report = buildPlayStyle([
      ...wins, lost,
      game([start(), hp(1), hp(4)]),
      game([start(), hp(4), hp(null), hp(1), hp(5)]),
      game([start(), hp(4), undone, newPlayEvent({ kind: 'undo', target: undone.id })]),
    ]);
    const [finding] = report.findings;
    expect(finding.title).toBe('2 of 3 games won after dropping to 1 HP');
    expect(finding.cases.map(item => item.id)).toEqual([...wins, lost].map(item => item.id));
    expect(finding.cases[0].beats).toEqual(['Round 1 · Health dropped to 1 HP', 'Round 2 · Health recovered to 5 HP']);
  });

  it('omits round labels when an unknown starting round has no later explicit anchor', () => {
    const games = repeated(3, () => game([
      newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: null }),
      state('finalGirlHealth', 5), round(), state('finalGirlHealth', 1),
    ]));
    expect(buildPlayStyle(games).findings[0].cases[0].beats).toEqual(['Health dropped to 1 HP']);
  });

  it('compares stronger Horror recoveries only across matched casts with enough supporting wins', () => {
    const make = (change: number, fields: Partial<GameResult> = {}) =>
      game([start(), state('finalHorrorLevel', 2), state('finalHorrorLevel', 6), round(), state('finalHorrorLevel', 6 - change)], fields);
    const filler = repeated(16, () => game());
    const recent = repeated(4, () => make(4));
    const earlier = repeated(4, () => make(1));
    const changed = buildPlayStyle([...recent, ...filler, ...earlier]);
    expect(changed.findings).toHaveLength(1);
    expect(changed.findings[0]).toMatchObject({ id: 'change', detail: expect.stringContaining('+3 levels on average across 4 pairs') });
    expect(changed.findings[0].cases.slice(0, 2).map(item => item.id)).toEqual([recent[0].id, earlier[0].id]);
    const differentCast = repeated(4, () => make(1, { killer: 'Big Bad Wolf' }));
    expect(buildPlayStyle([...recent, ...filler, ...differentCast]).findings.map(item => item.id)).toEqual(['pressure']);
    expect(buildPlayStyle([...recent, ...filler, ...recent]).findings.map(item => item.id)).toEqual(['pressure']);
  });

  it('reports pace only when a round counter started at one and the reviewed total agrees', () => {
    const wins = [3, 5, 6, 8].map(rounds => game([start(), ...repeated(rounds - 1, round)], { roundsPlayed: rounds }));
    const corrected = game([start(), round(), newPlayEvent({ kind: 'adjust', saved: 0, killed: 0, round: 5 }), round()], { roundsPlayed: 6 });
    const editedEnding = game([start(), round()], { roundsPlayed: 9 });
    const [finding] = buildPlayStyle([...wins, corrected, editedEnding]).findings;
    expect(finding.title).toBe('A typical tracked win takes 5.5 rounds');
    expect(finding.cases.map(item => item.id)).toEqual(wins.map(item => item.id));
  });
});
