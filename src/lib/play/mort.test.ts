import { describe, expect, it } from "vitest";
import {
  MORT,
  MORT_MODULE,
  MORT_SUSPECTS,
  MORT_TERRORS,
  mortFinale,
  mortMatches,
  mortOwnsLog,
  mortState,
  type MortCommand,
} from "../../../supabase/functions/_shared/play/mort";
import { mortEvent } from "./mortRecord";
import {
  canUndoMort,
  decrementPlay,
  newPlayEvent,
  summarizePlay,
  validPlayLog,
  type PlayEvent,
} from "./events";
import { deathFacts, deathSignature } from "./death";
import { moduleStoryBeats } from "./modules";
import { playStartingValues } from "./defaults";

function investigation() {
  const log: PlayEvent[] = [
    newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
    newPlayEvent({ kind: "state", field: "finalGirlHealth", value: 6 }),
    newPlayEvent({ kind: "state", field: "bloodlust", value: 0 }),
    newPlayEvent({ kind: "state", field: "finalHorrorLevel", value: 3 }),
    newPlayEvent({
      kind: "module",
      moduleData: { module: MORT_MODULE, changes: { initialized: true } },
    }),
  ];
  const record = (command: MortCommand) => {
    const event = mortEvent(command, summarizePlay(log).entries);
    expect(validPlayLog([...log, event])).toBe(true);
    log.push(event);
    return event;
  };
  const summary = () => summarizePlay(log);
  return { log, summary, record, state: () => mortState(summary().entries) };
}

const selection = {
  killer: MORT,
  location: "USS Konrad",
  finalGirl: "Adrianne",
};

describe("Mort investigation", () => {
  it("reconciles printed setup and the ten costumes and maps clues as exclusions", () => {
    expect(playStartingValues(MORT, "Adrianne")).toEqual({
      finalGirlHealth: 6,
      bloodlust: 0,
      finalHorrorLevel: 3,
    });
    expect(mortState([]).known).toBe(false);
    expect(MORT_SUSPECTS.every((s) => s.traits.length === 7)).toBe(true);
    expect(MORT_TERRORS.reduce((n, c) => n + c.quantity, 0)).toBe(16);
    const game = investigation();
    expect(mortMatches(game.state(), 4, "Comedy Horror")).toEqual([
      "hunter",
      "baghead",
    ]);
    expect(mortOwnsLog("Hans", game.log)).toBe(false);
  });

  it("lets a manual elimination be attached to a clue without creating a second Informant", () => {
    const game = investigation();
    const excluded = game.record({ kind: "exclude", suspect: "hunter" });
    const clue = game.record({
      kind: "clue",
      number: 2,
      source: "interrogate",
      trait: 4,
      value: "Comedy Horror",
      excluded: ["hunter", "baghead"],
    });
    expect(game.state()).toMatchObject({
      clues: [2],
      excluded: ["hunter", "baghead"],
      informants: 2,
    });
    expect(canUndoMort(game.log, excluded.id)).toBe(false);
    expect(canUndoMort(game.log, clue.id)).toBe(true);
    expect(
      validPlayLog([
        ...game.log,
        mortEvent(
          { kind: "clue", number: 2, source: "manual", excluded: ["hans"] },
          game.summary().entries,
        ),
      ]),
    ).toBe(false);
    game.log.push(newPlayEvent({ kind: "undo", target: clue.id }));
    expect(game.state()).toMatchObject({
      clues: [],
      excluded: ["hunter"],
      informants: 1,
    });
    game.log.push(newPlayEvent({ kind: "restore", target: clue.id }));
    expect(game.state()).toMatchObject({
      clues: [2],
      excluded: ["hunter", "baghead"],
      informants: 2,
    });
  });

  it("moves an excluded token out of the bag only when drawn, independently of the temporary Killer", () => {
    const game = investigation();
    game.record({ kind: "exclude", suspect: "wolf" });
    expect(game.state().discarded).toEqual([]);
    game.record({ kind: "draw", suspect: "wolf" });
    expect(game.state()).toMatchObject({ discarded: ["wolf"], informants: 1 });
    expect(game.state().active).toBeUndefined();
    expect(
      validPlayLog([
        ...game.log,
        mortEvent({ kind: "draw", suspect: "wolf" }, game.summary().entries),
      ]),
    ).toBe(false);
    game.record({ kind: "draw", suspect: "hans" });
    expect(game.state().active).toBe("hans");
    expect(moduleStoryBeats(selection, game.summary().entries)).not.toContain(
      "Hans",
    );
    game.record({ kind: "return-token" });
    game.record({ kind: "draw", suspect: "hans" });
    expect(game.state().active).toBe("hans");
  });

  it("resolves linked Informant outcomes and leaves the victim totals alone when coercing", () => {
    const game = investigation();
    game.record({ kind: "exclude", suspect: "hunter" });
    game.record({ kind: "minor", minor: "quick", active: true });
    game.record({
      kind: "clue",
      source: "coerce",
      number: 1,
      excluded: ["krampus", "wolf"],
      discard: "quick",
    });
    expect(game.state()).toMatchObject({ informants: 2, minors: [] });
    expect(game.summary()).toMatchObject({
      finalGirlHealth: 5,
      killed: 0,
      saved: 0,
    });
    game.record({ kind: "informant", result: "saved", lowerHorror: true });
    expect(game.summary()).toMatchObject({ finalHorrorLevel: 2, saved: 1 });
    const death = game.record({ kind: "informant", result: "killed" });
    expect(game.summary()).toMatchObject({
      killed: 1,
      bloodlust: 1,
      finalHorrorLevel: 3,
    });
    expect(decrementPlay(game.log, "killed")).toEqual({
      kind: "undo",
      target: death.id,
    });
    const before = deathFacts(selection, game.log, death.id);
    expect(before).toBeTruthy();
    game.record({
      kind: "reveal",
      suspect: "hans",
      power: "whispers",
      route: "terror",
    });
    const historical = deathFacts(selection, game.log, death.id);
    expect(historical && deathSignature(historical)).toEqual(
      before && deathSignature(before),
    );
    expect(JSON.stringify(historical)).not.toContain("Confirmed disguise");
    expect(moduleStoryBeats(selection, game.summary().entries)).toContain(
      "Confirmed disguise: Mort as Hans",
    );
  });

  it("records board thresholds and uses Time on Horror overflow once the token is in place", () => {
    const game = investigation();
    for (let i = 0; i < 8; i++)
      game.record({ kind: "advance", track: "bloodlust" });
    expect(game.state().horrorToken).toBe(true);
    expect(game.summary()).toMatchObject({ bloodlust: 8, finalHorrorLevel: 4 });
    expect(game.summary().entries.filter((e) => e.mortTerror)).toHaveLength(1);
    game.log.push(
      newPlayEvent({ kind: "state", field: "finalHorrorLevel", value: 7 }),
    );
    game.record({ kind: "advance", track: "horror" });
    expect(game.summary().entries.slice(-1)[0]?.mortTime).toBe(1);
    game.record({ kind: "advance", track: "bloodlust" });
    expect(game.summary().entries.slice(-1)[0]).toMatchObject({
      mortTime: 1,
      mortTerror: 1,
    });
  });

  it("discards location and killer Minor Powers in a replayable Finale, without touching other location observations", () => {
    const game = investigation();
    game.record({ kind: "minor", minor: "stockholm", active: true });
    game.record({
      kind: "location-minor",
      location: "USS Konrad",
      active: true,
    });
    const reveal = game.record({
      kind: "reveal",
      route: "terror",
      suspect: "ratchet",
      power: "anonymous",
    });
    expect(game.state()).toMatchObject({
      informants: 0,
      minors: [],
      reveal: { effective: 10 },
    });
    expect(game.state().locationMinor).toBeUndefined();
    expect(game.summary().killerHealth).toBe(26);
    game.log.push(newPlayEvent({ kind: "undo", target: reveal.id }));
    expect(validPlayLog(game.log)).toBe(true);
    expect(game.summary().killerHealth).toBeUndefined();
    expect(game.state()).toMatchObject({
      locationMinor: "USS Konrad",
      minors: ["stockholm"],
    });
  });

  it.each(MORT_SUSPECTS.map((s) => [s.id, s.health] as const))(
    "replays both legal reveal routes for %s",
    (suspect, base) => {
      const known = MORT_SUSPECTS.filter((s) => s.id !== suspect).map(
        (s) => s.id,
      );
      const start = newPlayEvent({
        kind: "start",
        saved: 0,
        killed: 0,
        round: 1,
      });
      const began = mortEvent(
        {
          kind: "begin",
          clues: [1, 2, 3, 4, 5],
          excluded: known,
          discarded: [],
          informants: 0,
        },
        [start],
      );
      const end = mortEvent(
        { kind: "reveal", route: "clues", suspect, power: "whispers" },
        [start, began],
      );
      expect(validPlayLog([start, began, end])).toBe(true);
      expect(summarizePlay([start, began, end]).killerHealth).toBe(base);
      for (let missing = 1; missing <= 5; missing++) {
        const early = mortEvent(
          {
            kind: "reveal",
            route: "terror",
            suspect,
            missing,
            power: "anonymous",
          },
          [start],
        );
        expect(validPlayLog([start, early])).toBe(true);
        const reveal = mortState(summarizePlay([start, early]).entries).reveal!;
        expect(mortFinale(reveal, 0).health).toBe(
          suspect === "ratchet" ? base + 4 * missing : base,
        );
        if (suspect === "baghead")
          expect(mortFinale(reveal, 0).effect).toContain(
            `${1 + missing} times`,
          );
        if (suspect === "hans")
          expect(mortFinale(reveal, 0).attack).toBe(1 + 4 * missing);
        if (suspect === "wolf")
          expect(mortFinale(reveal, 0).movement).toBe(1 + 2 * missing);
      }
    },
  );
});
