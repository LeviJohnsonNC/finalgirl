import { describe, it, expect } from "vitest";
import {
  MAPLE_HOUSES,
  MAPLE_STREETS,
  MAPLE_EVENTS,
  MAPLE_TERRORS,
  MAPLE_ITEMS,
  MAPLE_SETUPS,
  MAPLE_EXITS,
  copRoute,
  startCop,
  advanceCop,
  maplePersonChange,
  mapleStoryFacts,
} from "../../../supabase/functions/_shared/play/maple";
import {
  initialModuleObservations,
  moduleContext,
  moduleState,
  moduleStoryBeats,
  moduleReferences,
  moduleItemBeats,
  validModuleObservation,
} from "./modules";
import { newPlayEvent, summarizePlay, validPlayLog } from "./events";
import { deathFacts, deathSignature } from "./death";
import {
  applicablePlayCards,
  playItems,
  playVictims,
  PLAY_ROOMS,
  playMechanisms,
} from "../../../supabase/functions/_shared/play/catalog";
import {
  getModulePromptContext,
  ENTITY_RULE_MODULES,
} from "@/data/rules/moduleRules";
import { FEATURE_FILM_DETAILS } from "@/types/featureFilmDetails";
import { deathPrompt } from "../../../supabase/functions/_shared/deathPrompt";
import { initialFright } from "../../../supabase/functions/_shared/play/fright";
const cast = {
  killer: "Hans",
  location: "Maple Lane",
  finalGirl: "Laurie",
  startingEvent: null,
};
const observation = (
  changes: Record<string, string | number | boolean | null>,
) => newPlayEvent({ kind: "module", moduleData: { module: "maple", changes } });
const start = () =>
  newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 });
const setup = (startingEvent: string | null = null) =>
  initialModuleObservations(
    { ...cast, startingEvent },
    false,
    false,
    false,
    true,
  );

describe("Maple Lane physical-source reconciliation", () => {
  it("accounts for the supplied cards, copies, Houses and Streets without duplicate suggestions", () => {
    expect(MAPLE_EVENTS).toHaveLength(10);
    expect(MAPLE_TERRORS).toHaveLength(8);
    expect(MAPLE_ITEMS).toHaveLength(14);
    expect(MAPLE_ITEMS.reduce((n, i) => n + i.copies, 0)).toBe(16);
    expect(MAPLE_ITEMS.find((i) => i.id === "crucifix")?.copies).toBe(3);
    expect(new Set(MAPLE_HOUSES.map((h) => h.id)).size).toBe(12);
    for (const quadrant of ["NW", "NE", "SW", "SE"])
      expect(MAPLE_HOUSES.filter((h) => h.quadrant === quadrant)).toHaveLength(
        3,
      );
    expect(MAPLE_STREETS).toHaveLength(9);
    expect(MAPLE_SETUPS).toHaveLength(5);
    expect(PLAY_ROOMS["Maple Lane"]).toHaveLength(21);
    expect(
      applicablePlayCards(cast, "event").filter((c) => c.name === "Fire!"),
    ).toHaveLength(1);
    expect(playItems("Maple Lane")).toEqual(MAPLE_ITEMS);
    expect(playVictims("Maple Lane")).toHaveLength(3);
    expect(playItems("Camp Happy Trails")).not.toContainEqual(MAPLE_ITEMS[0]);
  });
  it("replaces casting's partial descriptions with the same verified effects used in Rules and prompts", () => {
    expect(FEATURE_FILM_DETAILS["s1-maple-lane"].location?.events).toEqual(
      MAPLE_EVENTS.map((e) => ({ name: e.name, description: e.effect })),
    );
    expect(
      ENTITY_RULE_MODULES.find((m) => m.entity === "Maple Lane")?.source,
    ).toContain("IMG_9351");
    expect(
      getModulePromptContext("Hans", "Maple Lane")?.rulesSummary,
    ).toContain("Roadblocks prevent rescue, not movement");
    expect(MAPLE_ITEMS.find((i) => i.id === "lid")?.effect).toContain(
      "one damage",
    );
    expect(MAPLE_ITEMS.find((i) => i.id === "bible")?.effect).toContain(
      "not two automatic successes",
    );
    expect(MAPLE_EVENTS.find((e) => e.id === "boyfriend")?.effect).toContain(
      "lose two Time",
    );
    expect(playMechanisms(cast)).toContain("Street traffic");
  });
});
describe("Maple Lane observations, setup and Undo", () => {
  it("seeds the fresh baseline in bounded valid observations, preserving pending random placements", () => {
    for (const event of [null, ...MAPLE_EVENTS.map((e) => e.name)]) {
      const observations = setup(event);
      for (const o of observations) {
        expect(validModuleObservation(o)).toBe(true);
        expect(Object.keys(o.changes).length).toBeLessThanOrEqual(20);
      }
      const s = moduleState(
        observations.map((moduleData) => ({ kind: "module", moduleData })),
        "maple",
      );
      expect(MAPLE_HOUSES.every((h) => s[`house.${h.id}`] === false)).toBe(
        true,
      );
      if (event === "Fire!") expect(s.fire).toBeUndefined();
      if (event === "Under Construction")
        expect(MAPLE_EXITS.every((e) => s[`exit.${e}`] === undefined)).toBe(
          true,
        );
    }
    expect(setup("The Smalleys").slice(-1)[0]?.changes).toMatchObject({
      "person.smalley-1": "in-play",
      "person.smalley-2": "in-play",
    });
    expect(
      initialModuleObservations(cast, false).some((x) => x.module === "maple"),
    ).toBe(false);
    expect(moduleContext(cast, [])).toBeUndefined();
  });
  it("rejects unknown houses, wrong prop spaces, illegal values and oversized patches", () => {
    for (const changes of [
      { "house.nw-fourth": true },
      { "house.nw-west": "searched" },
      { "trap.intersection": "placed" },
      { fire: "nw-west" },
      { fireworks: "ne-boyfriend" },
      { bicycle: "sw-west" },
      { "cop.step": 5 },
      { "person.smalley-3": "in-play" },
      { "exit.roof": true },
      { "event.fake": "active" },
    ])
      expect(validModuleObservation({ module: "maple", changes })).toBe(false);
    expect(
      validModuleObservation({
        module: "maple",
        changes: Object.fromEntries(
          Array.from({ length: 21 }, (_, i) => [`bad.${i}`, true]),
        ),
      }),
    ).toBe(false);
  });
  it("keeps house searching, fire and traps separate and rejects no passive totals", () => {
    const log = [
      start(),
      observation({ "house.ne-boyfriend": true }),
      observation({ fire: "ne-boyfriend", "trap.sw-smalley": "placed" }),
    ];
    const s = moduleState(summarizePlay(log).entries, "maple");
    expect(s["house.ne-boyfriend"]).toBe(true);
    expect(s["house.sw-smalley"]).toBeUndefined();
    expect(summarizePlay(log)).toMatchObject({ saved: 0, killed: 0 });
    expect(
      moduleContext(
        { ...cast, location: "Camp Happy Trails" },
        summarizePlay(log).entries,
      )?.maple,
    ).toBeUndefined();
  });
  it("links separate Smalley outcomes to their Event and restores both with Undo without changing totals", () => {
    const added = observation({
      "person.smalley-1": "in-play",
      "person.smalley-2": "in-play",
      "event.smalleys": "active",
    });
    const first = observation(
      maplePersonChange(moduleState([added], "maple"), "smalley-1", "saved"),
    );
    const second = observation(
      maplePersonChange(
        moduleState([added, first], "maple"),
        "smalley-2",
        "killed",
      ),
    );
    expect(second.moduleData?.changes).toEqual({
      "person.smalley-2": "killed",
      "event.smalleys": "ended",
    });
    const log = [
      start(),
      added,
      first,
      second,
      newPlayEvent({ kind: "undo", target: second.id }),
    ];
    const s = moduleState(summarizePlay(log).entries, "maple");
    expect(s).toMatchObject({
      "person.smalley-1": "saved",
      "person.smalley-2": "in-play",
      "event.smalleys": "active",
    });
    expect(summarizePlay(log)).toMatchObject({ saved: 0, killed: 0 });
    expect(
      maplePersonChange(s, "smalley-2", null)["event.smalleys"],
    ).toBeNull();
    expect(maplePersonChange({}, "fake", "killed")).toEqual({});
  });
  it.each(MAPLE_EXITS)(
    "advances the %s Cop Car route explicitly and atomically ends at the opposite Exit",
    (origin) => {
      const route = copRoute(origin);
      expect(route).toHaveLength(5);
      expect(route[2]).toBe("intersection");
      let state = startCop(origin);
      for (let step = 1; step <= 4; step++) {
        const change = advanceCop(state);
        expect(change["cop.step"]).toBe(step);
        state = { ...state, ...change };
      }
      expect(state).toMatchObject({
        "cop.status": "exited",
        "event.kopp": "ended",
      });
      expect(advanceCop(state)).toEqual({});
      expect(advanceCop({ "cop.status": "on-route", "cop.step": 2 })).toEqual(
        {},
      );
    },
  );
});
describe("Maple Lane historical narrative boundaries", () => {
  it("keeps concealed Dr. Fright deals out of Maple Lane's mixed context", () => {
    const hidden = {
      ...initialFright(),
      mode: "digital",
      command: "asleep",
      sleep: "asleep",
      cycle: 1,
      deal: "0132",
      reserve: "2301",
    };
    const entries = summarizePlay([
      start(),
      observation({ fire: "ne-boyfriend" }),
      newPlayEvent({
        kind: "module",
        moduleData: {
          module: "fright",
          changes: { snapshot: JSON.stringify(hidden) },
        },
      }),
    ]).entries;
    const selection = { ...cast, killer: "Dr. Fright" };
    expect(moduleContext(selection, entries)?.fright).toMatchObject({
      sleep: "asleep",
      boilerCardsResolved: 0,
    });
    const publicContext = JSON.stringify([
      moduleContext(selection, entries),
      moduleStoryBeats(selection, entries),
    ]);
    expect(publicContext).toContain("ne-boyfriend");
    for (const privateFact of ["0132", "2301", "reserve", "snapshot", "parent"])
      expect(publicContext).not.toContain(privateFact);
  });

  it("keeps old signatures unchanged and later corrections outside an earlier death", async () => {
    const death = newPlayEvent({
      kind: "killed",
      quantity: 1,
      cause: "event",
      eventCard: "Fire!",
      room: "The Boyfriend’s House",
    });
    const old = [start(), death];
    const before = deathFacts(cast, old, death.id)!;
    expect(before).not.toHaveProperty("moduleContext");
    const after = [...old, observation({ fire: "sw-smalley" })];
    expect(await deathSignature(deathFacts(cast, after, death.id)!)).toBe(
      await deathSignature(before),
    );
    const log = [
      start(),
      observation({ fire: "ne-boyfriend" }),
      death,
      observation({ fire: "none" }),
    ];
    const facts = deathFacts(cast, log, death.id)!;
    expect(facts.moduleContext?.maple.fire).toBe("ne-boyfriend");
    expect(
      JSON.parse(deathPrompt(facts, []).user).selectedCardContext[0].effect,
    ).toContain("one damage");
    expect(validPlayLog(log)).toBe(true);
  });
  it("preserves both owners in budgets without turning traps or finds into casualties or inventory", () => {
    const entries = summarizePlay([
      start(),
      observation({ fire: "ne-boyfriend", "trap.sw-smalley": "placed" }),
      newPlayEvent({
        kind: "module",
        moduleData: {
          module: "hans",
          changes: { "minor.unholy-rage.health": 1 },
        },
      }),
    ]).entries;
    const beats = moduleStoryBeats(cast, entries);
    expect(beats.length).toBeLessThanOrEqual(900);
    expect(beats).toContain("Maple Lane:");
    expect(beats).toContain("Killer:");
    expect(mapleStoryFacts({})).toEqual([]);
    expect(
      moduleItemBeats(cast, [
        newPlayEvent({
          kind: "moment",
          momentType: "item",
          text: "Found Bible",
          detail: "Bible",
        }),
      ]),
    ).toContain("does not establish use");
    expect(
      moduleReferences(cast, {}, undefined, undefined, "Booby Trap").find(
        (r) => r.name === "Booby Trap",
      )?.effect,
    ).toContain("Enemy");
  });
});
