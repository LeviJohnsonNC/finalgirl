import { summarizePlay, type PlayEvent } from './events';
/** Only observations are prefilled; missing counts remain explicitly unrecorded. */
export function trackedOutcome(events: PlayEvent[] = []) {
  const s = summarizePlay(events);
  return {
    victimsSaved: s.saved,
    victimsKilled: s.killed,
    roundsPlayed: s.round,
    ...(s.finalGirlHealth !== undefined && {
      finalGirlHealth: s.finalGirlHealth,
    }),
    ...(s.killerHealth !== undefined && { killerHealth: s.killerHealth }),
    ...(s.finalHorrorLevel !== undefined && {
      finalHorrorLevel: s.finalHorrorLevel,
    }),
    ...(events.length && { playEvents: events }),
  };
}
