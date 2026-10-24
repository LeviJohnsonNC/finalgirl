import { describe, it, expect } from "vitest";
import {
  boilerGeometry,
  boilerAttack,
  DIRECTIONS,
  legalDirections,
  parseFright,
  initialFright,
  frightTransition,
  frightState,
  frightPublic,
  validFrightSuccessor,
  FRIGHT_POWERS,
  FRIGHT_FINALES,
  type FrightSnapshot,
} from "../../../supabase/functions/_shared/play/fright";
import {
  newPlayEvent,
  summarizePlay,
  describeEvent,
  playStoryBeats,
} from "./events";
import { moduleContext, killerMomentCards } from "./modules";
import { deathFacts, deathSignature } from "./death";
import { playStartingValues } from "./defaults";
import { getKillerMaxHealth } from "@/data/killerHealth";

const selection = {
  killer: "Dr. Fright",
  location: "Camp Happy Trails",
  finalGirl: "Laurie",
};
const observation = (s: FrightSnapshot) =>
  newPlayEvent({
    kind: "module",
    moduleData: { module: "fright", changes: { snapshot: JSON.stringify(s) } },
  });
function session(deal = "0132") {
  const setup = observation(initialFright());
  const digital = observation({
    ...initialFright(),
    parent: setup.id,
    command: "digital",
    mode: "digital",
    cycle: 1,
    deal,
    reserve: "2301",
  });
  const log = [
    newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
    setup,
    digital,
  ];
  const step = (command: Parameters<typeof frightTransition>[1]) => {
    const entries = summarizePlay(log).entries;
    const s = frightTransition(
      frightState(entries),
      command,
      log,
      entries,
      () => "3210",
    );
    if (s) log.push(observation(s));
    return s;
  };
  return { log, step, state: () => frightState(summarizePlay(log).entries)! };
}
function permutations(values: string[]): string[] {
  return values.length
    ? values.flatMap((n, i) =>
        permutations(values.filter((_, j) => j !== i)).map((p) => n + p),
      )
    : [""];
}
// Independent pixel raster oracle: place the covered stack from each recorded move,
// then inspect the four cell centres, painting cover/earlier cards above the new card.
function raster(path: string) {
  let layers = [[0, 0]];
  for (const d of path) {
    const [x, y] = { U: [0, -20], D: [0, 20], L: [-20, 0], R: [20, 0] }[d];
    layers = layers.map(([a, b]) => [a + x, b + y]);
    layers.push([0, 0]);
  }
  return [
    [10, 10],
    [30, 10],
    [10, 30],
    [30, 30],
  ].flatMap(([x, y], q) =>
    layers
      .slice(0, -1)
      .some(([a, b]) => x >= a && x < a + 40 && y >= b && y < b + 40)
      ? []
      : [q],
  );
}
describe("owner-verified Dr. Fright", () => {
  it("corrects both new-game Health defaults and reuses all seven verified cards", () => {
    expect(playStartingValues("Dr. Fright", "Laurie").killerHealth).toBe(9);
    expect(getKillerMaxHealth("Dr. Fright")).toBe(9);
    expect(FRIGHT_POWERS).toHaveLength(4);
    expect(FRIGHT_FINALES).toHaveLength(3);
    expect(killerMomentCards("Dr. Fright", "dark-power")).toHaveLength(4);
  });
  it("reproduces the printed U,U,L,D example: two safe halves, attack, safe top-right quarter", () => {
    expect(boilerGeometry("U")!.visible[0]).toEqual([2, 3]);
    expect(boilerGeometry("UU")!.visible[1]).toEqual([2, 3]);
    expect(boilerGeometry("UUL")!.visible[2]).toEqual([1, 3]);
    expect(boilerGeometry("UULD")!.visible[3]).toEqual([1]);
    expect(
      ["U", "UU", "UUL", "UULD"].map((p) => boilerAttack("0132", p)),
    ).toEqual([false, false, true, false]);
    expect(boilerGeometry("UD")).toBeNull();
    expect(legalDirections("U")).toEqual(["U", "L", "R"]);
  });
  it("checks every reachable path against independent raster visibility and all 24 card orders", () => {
    let visited = 0;
    function walk(path: string) {
      if (path.length === 4) return;
      for (const d of DIRECTIONS) {
        const next = path + d;
        const expected = raster(next);
        const actual = boilerGeometry(next);
        expect(Boolean(actual), next).toBe(expected.length > 0);
        if (!actual) continue;
        visited++;
        expect([1, 2]).toContain(expected.length);
        expect(actual.visible[next.length - 1], next).toEqual(expected);
        for (const deal of permutations(["0", "1", "2", "3"]))
          expect(boilerAttack(deal, next), deal + next).toBe(
            expected.includes(Number(deal[next.length - 1])),
          );
        walk(next);
      }
    }
    walk("");
    expect(visited).toBeGreaterThan(100);
  });
  it("waits for defense before a fourth-card exit; never records damage or victim deaths", () => {
    const a = session("0123");
    a.step({ command: "asleep" });
    for (let i = 0; i < 4; i++) {
      a.step({ command: "slide", direction: "U" });
      if (a.state().pending) {
        expect(a.step({ command: "slide", direction: "L" })).toBeNull();
        if (i === 3) {
          expect(a.state().sleep).toBe("asleep");
          expect(a.state().path).toHaveLength(4);
        }
        a.step({ command: "defended" });
      }
    }
    expect(a.state()).toMatchObject({
      sleep: "awake",
      path: "",
      cycle: 2,
      deal: "2301",
    });
    expect(summarizePlay(a.log)).toMatchObject({ killed: 0, saved: 0 });
  });
  it("reuses both current and next deal across dependency rewind, restore and recompletion", () => {
    const a = session();
    a.step({ command: "asleep" });
    a.step({ command: "slide", direction: "U" });
    const first = a.log[a.log.length - 1]!;
    a.step({ command: "slide", direction: "U" });
    a.step({ command: "slide", direction: "L" });
    a.step({ command: "defended" });
    a.step({ command: "slide", direction: "D" });
    const completed = { ...a.state() };
    const completion = a.log[a.log.length - 1]!;
    a.log.push(newPlayEvent({ kind: "undo", target: first.id }));
    expect(a.state().path).toBe("");
    expect(a.state().deal).toBe("0132");
    expect(summarizePlay(a.log).inactive.has(completion.id)).toBe(true);
    a.log.push(newPlayEvent({ kind: "restore", target: first.id }));
    expect(a.state().deal).toBe(completed.deal);
    a.log.push(newPlayEvent({ kind: "undo", target: completion.id }));
    expect(a.state().path).toBe("UUL");
    a.step({ command: "slide", direction: "D" });
    expect(a.state().deal).toBe(completed.deal);
    expect(a.state().reserve).toBe(completed.reserve);
  });
  it("wakes mid-trip atomically, validates the successor, and reuses the prepared deck after Undo", () => {
    const a = session();
    a.step({ command: "asleep" });
    a.step({ command: "slide", direction: "U" });
    const before = a.state();
    const entries = summarizePlay(a.log).entries;
    const wake = frightTransition(
      before,
      { command: "awake" },
      a.log,
      entries,
      () => "3210",
    )!;
    expect(validFrightSuccessor(wake, a.log, entries)).toBe(true);
    expect(
      validFrightSuccessor({ ...wake, deal: "1230" }, a.log, entries),
    ).toBe(false);
    a.step({ command: "awake" });
    const wakeEvent = a.log[a.log.length - 1]!;
    expect(a.state()).toMatchObject({
      sleep: "awake",
      path: "",
      pending: false,
      cycle: 2,
      deal: "2301",
      lastPath: "",
    });
    expect(a.step({ command: "awake" })).toBeNull();
    a.log.push(newPlayEvent({ kind: "undo", target: wakeEvent.id }));
    expect(a.state().path).toBe("U");
    a.step({ command: "awake" });
    expect(a.state()).toMatchObject({
      deal: "2301",
      reserve: "3210",
      path: "",
    });
    a.step({ command: "asleep" });
    expect(a.state()).toMatchObject({
      sleep: "asleep",
      deal: "2301",
      reserve: "3210",
      cycle: 2,
      path: "",
    });
    expect(summarizePlay(a.log)).toMatchObject({ killed: 0, saved: 0 });
  });
  it("switches an untouched deck without rerolling and refuses to bypass an attack or forced sleep", () => {
    const a = session();
    a.step({ command: "asleep" });
    a.step({ command: "awake" });
    expect(a.state()).toMatchObject({
      cycle: 1,
      deal: "0132",
      reserve: "2301",
    });
    a.step({ command: "asleep" });
    a.step({ command: "slide", direction: "D" });
    expect(a.state().pending).toBe(true);
    expect(a.step({ command: "awake" })).toBeNull();
    expect(a.step({ command: "asleep" })).toBeNull();
    a.step({ command: "defended" });
    a.log.push(
      newPlayEvent({
        kind: "moment",
        momentType: "finale",
        text: "Finale revealed",
        permanent: true,
        killerCard: "Face Your Fright",
      }),
    );
    expect(a.step({ command: "awake" })).toBeNull();
  });
  it("applies a reveal effect explicitly once and stays asleep across Face Your Fright exits", () => {
    const a = session();
    const reveal = newPlayEvent({
      kind: "moment",
      momentType: "finale",
      text: "Finale revealed",
      permanent: true,
      killerCard: "Face Your Fright",
    });
    a.log.push(reveal);
    expect(a.state().sleep).toBe("awake");
    const key = reveal.id + ":face-your-fright";
    expect(a.step({ command: "effect", effect: key })).not.toBeNull();
    expect(a.state().sleep).toBe("asleep");
    expect(a.step({ command: "effect", effect: key })).toBeNull();
    for (const direction of ["U", "U", "L", "D"] as const) {
      a.step({ command: "slide", direction });
      if (a.state().pending) a.step({ command: "defended" });
    }
    expect(a.state()).toMatchObject({ sleep: "asleep", path: "", cycle: 2 });
  });
  it("never leaks order, reserve, parent, raw path or effect markers to timeline, narration or death identity", async () => {
    const a = session();
    a.step({ command: "asleep" });
    a.step({ command: "slide", direction: "U" });
    const kill = newPlayEvent({ kind: "killed", quantity: 1, cause: "killer" });
    a.log.push(kill);
    const entries = summarizePlay(a.log).entries;
    const context = moduleContext(selection, entries)!;
    expect(context.fright).toEqual({
      sleep: "asleep",
      boilerCardsResolved: 1,
      attackPending: false,
    });
    expect(frightPublic(entries)).toEqual(context.fright);
    const text = [
      JSON.stringify(context),
      ...a.log.map(describeEvent),
      playStoryBeats(a.log, selection),
      JSON.stringify(deathFacts(selection, a.log, kill.id)),
    ].join("\n");
    for (const hidden of ["0132", "2301", "snapshot", "reserve", "parent"])
      expect(text).not.toContain(hidden);
    const before = await deathSignature(deathFacts(selection, a.log, kill.id)!);
    a.step({ command: "slide", direction: "U" });
    expect(await deathSignature(deathFacts(selection, a.log, kill.id)!)).toBe(
      before,
    );
    expect(
      moduleContext({ ...selection, killer: "Hans" }, entries)?.fright,
    ).toBeUndefined();
  });
  it("rejects corrupt, impossible and overlong snapshots without inventing legacy setup", () => {
    expect(frightState([])).toBeNull();
    expect(frightPublic([])).toBeUndefined();
    const a = session();
    const s = a.state();
    const { eventId: _id, ...snapshot } = s;
    for (const patch of [
      { deal: "0000" },
      { path: "UD" },
      { pending: true },
      { path: "UUUU", pending: false, sleep: "asleep" },
      { reserve: "01234" },
      { extra: "leak" },
    ])
      expect(parseFright(JSON.stringify({ ...snapshot, ...patch }))).toBeNull();
  });
  it("does not add context to an older matching free-text card reveal", () => {
    const log = [
      newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
      newPlayEvent({
        kind: "moment",
        momentType: "dark-power",
        text: "Dark Power",
        killerCard: "Never Really Dead",
      }),
      newPlayEvent({ kind: "killed", quantity: 1 }),
    ];
    expect(deathFacts(selection, log, log[2].id)).not.toHaveProperty(
      "moduleContext",
    );
  });
});
