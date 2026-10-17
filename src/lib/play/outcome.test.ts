import { describe, it, expect } from 'vitest';
import { trackedOutcome } from './outcome';
import { newPlayEvent, playStoryBeats } from './events';
import { playStatistics } from './statistics';
import type { GameResult } from '@/hooks/useGameHistory';
describe('tracked results and coverage', () => {
  it('keeps untracked values unknown, but preserves a recorded zero', () => {
    expect(trackedOutcome()).toEqual({
      victimsSaved: null,
      victimsKilled: null,
      roundsPlayed: null,
    });
    const start = newPlayEvent({
      kind: 'start',
      saved: 0,
      killed: 2,
      round: null,
    });
    const state = newPlayEvent({
      kind: 'state',
      field: 'finalGirlHealth',
      value: 1,
    });
    const death = newPlayEvent({ kind: 'killed', quantity: 3, cause: 'event' });
    const undo = newPlayEvent({ kind: 'undo', target: death.id });
    const events = [start, state, death, undo];
    expect(trackedOutcome(events)).toMatchObject({
      victimsSaved: 0,
      victimsKilled: 2,
      roundsPlayed: null,
      finalGirlHealth: 1,
      playEvents: events,
    });
    expect(playStoryBeats(events)).not.toContain('3 victims killed');
  });
  it('does not treat missing historical rounds or victim counts as zero', () => {
    const base = {
      id: 'one',
      timestamp: 1,
      outcome: 'won',
      killer: 'Hans',
      location: 'Camp Happy Trails',
      finalGirl: 'Laurie',
    } as GameResult;
    expect(
      playStatistics([
        base,
        { ...base, roundsPlayed: 4, victimsSaved: 0 },
        { ...base, outcome: 'lost', roundsPlayed: 8, victimsKilled: 2 },
      ]),
    ).toEqual({
      roundsRecorded: 2,
      averageRounds: 6,
      wonAverageRounds: 4,
      lostAverageRounds: 8,
      savedRecorded: 1,
      killedRecorded: 1,
    });
  });
});
