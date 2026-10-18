import { describe, it, expect } from "vitest";
import { playStartingValues } from "./defaults";
import {
  newPlayEvent,
  summarizePlay,
  validPlayLog,
  playStoryBeats,
} from "./events";
describe("opt-in starting suggestions", () => {
  it("uses printed Buddyland character and Killer stats, and reasonable editable fallbacks", () => {
    expect(playStartingValues("Billy the Bear", "Rena")).toEqual({
      finalGirlHealth: 6,
      killerHealth: 8,
      finalHorrorLevel: 4,
      bloodlust: 0,
    });
    expect(playStartingValues("Billy the Bear", "Gwynn").finalGirlHealth).toBe(
      5,
    );
    expect(playStartingValues("Hans", "Laurie").killerHealth).toBe(12);
    expect(playStartingValues("Unknown", "Unknown")).toEqual({
      finalGirlHealth: 5,
      killerHealth: 10,
      finalHorrorLevel: 4,
      bloodlust: 0,
    });
    expect(
      summarizePlay([
        newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
        newPlayEvent({ kind: "state", field: "finalGirlHealth", value: 0 }),
      ]).finalGirlHealth,
    ).toBe(0);
  });
  it("retains the two distinct final-health reversals through canonical validation and story context", () => {
    const events = [
      newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
      newPlayEvent({
        kind: "moment",
        momentType: "girl-revived",
        text: "Second wind",
        detail: "Black Final Health token restored two health",
      }),
      newPlayEvent({
        kind: "moment",
        momentType: "killer-revived",
        text: "Back from the dead",
        detail: "The killer rose behind the counter",
      }),
    ];
    expect(validPlayLog(events)).toBe(true);
    expect(playStoryBeats(events)).toContain("Second wind");
    expect(playStoryBeats(events)).toContain("Back from the dead");
    expect(summarizePlay(events).killed).toBe(0);
  });
});
