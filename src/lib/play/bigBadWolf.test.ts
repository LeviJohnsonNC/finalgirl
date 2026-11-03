import { describe, expect, it } from "vitest";
import { WOLF, WOLF_BLOODLUST, WOLF_MINORS, WOLF_TERRORS } from "./bigBadWolf";
import { newPlayEvent, summarizePlay, validPlayLog, type PlayEvent } from "./events";
import { deathFacts } from "./death";
import { moduleState } from "./modules";
import { applicablePlayCards } from "./catalog";
import { playStartingValues } from "./defaults";

const selection = { killer: WOLF, location: "Sacred Groves", finalGirl: "Red" };
const start = newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 });
const track = newPlayEvent({ kind: "module", moduleData: { module: "big-bad-wolf", changes: { mode: "track" } } });
const reveal = newPlayEvent({ kind: "moment", momentType: "dark-power", permanent: true, text: "Dark Power revealed" });
const name = (killerCard: string) => newPlayEvent({ kind: "details", target: reveal.id, killerCard });
const mode = (events: PlayEvent[]) => moduleState(summarizePlay(events).entries, "big-bad-wolf").mode;

describe("Big Bad Wolf observations", () => {
  it("uses the printed standard setup and keeps the thirteen ordinary Terror faces separate from the Minors", () => {
    expect(playStartingValues(WOLF, "Red")).toMatchObject({ killerHealth: 9, finalHorrorLevel: 5, bloodlust: 0 });
    expect(WOLF_BLOODLUST).toHaveLength(11);
    expect(WOLF_BLOODLUST[2].entry).toBe("Reveal Dark Power");
    expect(WOLF_BLOODLUST[10]).toMatchObject({ attack: 4, move: 6 });
    expect(WOLF_TERRORS.reduce((count, card) => count + card.quantity, 0) + WOLF_MINORS.length).toBe(16);
    expect(applicablePlayCards(selection, "terror").filter(card => card.killer === WOLF)).toHaveLength(9);
    expect(applicablePlayCards({ ...selection, killer: "Hans" }, "terror").some(card => card.killer === WOLF)).toBe(false);
  });

  it("projects one locked reveal through unnamed, Epic, cleared and corrected states", () => {
    expect(mode([start])).toBeUndefined();
    expect(mode([start, track])).toBe("track");
    expect(mode([start, track, reveal])).toBeUndefined();
    const untrusted = { ...reveal, wolfPowerMode: "both" as const };
    expect(mode([start, track, untrusted])).toBeUndefined();
    const epic = name("A Killing Machine");
    const clear = name("");
    expect(mode([start, track, reveal, epic, clear])).toBe("both");
    expect(mode([start, track, reveal, epic, clear, name("Sixth Sense")])).toBe("slay");
    const undo = newPlayEvent({ kind: "undo", target: reveal.id });
    expect(mode([start, track, reveal, epic, undo])).toBe("both");
    expect(summarizePlay([start, track, reveal, epic]).killed).toBe(0);
  });

  it("keeps historical mode and Minor health stable across later corrections and leaves legacy signatures intact", () => {
    const minor = (health: number) => newPlayEvent({ kind: "module", moduleData: { module: "big-bad-wolf", changes: { "minor.eyes.health": health } } });
    const death = newPlayEvent({ kind: "killed", quantity: 1, cause: "terror", terrorCard: "The Jaws That Bite", wolfReference: true });
    const log = [start, track, reveal, name("Sixth Sense"), minor(2), death, name("A Killing Machine"), minor(0)];
    expect(validPlayLog(log)).toBe(true);
    expect(deathFacts(selection, log, death.id)?.moduleContext?.["big-bad-wolf"]).toMatchObject({ mode: "slay", "minor.eyes.health": 2 });
    expect(deathFacts({ ...selection, killer: "Hans" }, log, death.id)).toBeNull();
    const legacy = newPlayEvent({ kind: "killed", quantity: 1 });
    expect(deathFacts(selection, [start, reveal, name("Sixth Sense"), legacy], legacy.id)?.moduleContext?.["big-bad-wolf"]).toBeUndefined();
    expect(() => minor(3)).toThrow();
  });
});
