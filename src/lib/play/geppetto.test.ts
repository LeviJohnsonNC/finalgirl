import { describe, it, expect } from "vitest";
import {
  GEPPETTO_FINALES,
  GEPPETTO_MINOR_POWERS,
  GEPPETTO_POWERS,
  GEPPETTO_TERRORS,
  GEPPETTO_PUPPETS,
  PUPPET_STATUSES,
  initialGeppettoPuppets,
  geppettoPuppetCounts,
  geppettoSpawnChanges,
  moduleState,
  moduleContext,
  moduleReferences,
  killerMomentCards,
  validModuleObservation,
  initialModuleObservations,
} from "./modules";
import {
  newPlayEvent,
  summarizePlay,
  playStoryBeats,
  validPlayLog,
} from "./events";
import { deathFacts, deathSignature } from "./death";
import { applicablePlayCards, playItems } from "./catalog";
import {
  getModulePromptContext,
  ENTITY_RULE_MODULES,
} from "@/data/rules/moduleRules";
import { getKillerNarrativeRules } from "@/data/killerSpecialRules";
import { playStartingValues } from "./defaults";
import { getKillerMaxHealth } from "@/data/killerHealth";
const selection = {
  killer: "Geppetto",
  location: "Camp Happy Trails",
  finalGirl: "Laurie",
};
const start = () =>
  newPlayEvent({ kind: "start", round: 1, saved: 0, killed: 0 });
const observation = (
  changes: Record<string, string | number | boolean | null>,
) =>
  newPlayEvent({ kind: "module", moduleData: { module: "geppetto", changes } });
const stateOf = (log: ReturnType<typeof newPlayEvent>[]) =>
  moduleState(summarizePlay(log).entries, "geppetto");

describe("verified Gepetto catalog and module isolation", () => {
  it("supplies only the selected killer’s cards and preserves independent location catalogs", () => {
    expect(GEPPETTO_POWERS).toHaveLength(4);
    expect(GEPPETTO_FINALES).toHaveLength(3);
    expect(GEPPETTO_MINOR_POWERS).toHaveLength(2);
    expect(GEPPETTO_TERRORS).toHaveLength(16);
    expect(new Set(GEPPETTO_TERRORS.map((c) => c.name)).size).toBe(16);
    expect(killerMomentCards("Geppetto", "finale")).toHaveLength(3);
    expect(
      applicablePlayCards(selection, "terror").filter(
        (c) => c.killer === "Geppetto",
      ),
    ).toHaveLength(16);
    expect(
      applicablePlayCards({ ...selection, killer: "Hans" }, "terror").some(
        (c) => c.killer === "Geppetto",
      ),
    ).toBe(false);
    expect(playItems("Carnival of Blood")).toEqual([]); // Location implementation is separate.
    expect(
      ENTITY_RULE_MODULES.find((c) => c.entity === "Geppetto")?.source,
    ).toContain("IMG_9333");
    expect(playStartingValues("Geppetto", "Laurie").killerHealth).toBe(8);
    expect(getKillerMaxHealth("Geppetto")).toBe(8);
  });
  it("fits actual opening/ending special-rule limits with the supported location modules", () => {
    for (const location of [
      "Camp Happy Trails",
      "Buddyland",
      "Carnival of Blood",
    ]) {
      const context = getModulePromptContext("Geppetto", location)!;
      const moduleRules = [
        context.rulesSummary,
        context.narrativeGuidance,
      ].join("\n");
      expect(
        [getKillerNarrativeRules("Geppetto"), moduleRules]
          .filter(Boolean)
          .join("\n").length,
      ).toBeLessThanOrEqual(3000);
      expect(context.visualGuidance.length).toBeLessThanOrEqual(3000);
    }
  });
});

describe("three physical puppets and ordered spawning", () => {
  it("conserves three tokens across every fully recorded distribution and spawn action", () => {
    for (const a of PUPPET_STATUSES)
      for (const b of PUPPET_STATUSES)
        for (const c of PUPPET_STATUSES) {
          const state = {
            "puppet.1.status": a,
            "puppet.2.status": b,
            "puppet.3.status": c,
          };
          for (const kind of ["normal", "one", "all"] as const) {
            const next = { ...state, ...geppettoSpawnChanges(state, kind) };
            const counts = geppettoPuppetCounts(next);
            expect(counts.recorded).toBe(true);
            expect(counts.ready + counts.onBoard + counts.exhausted).toBe(3);
            expect(
              validModuleObservation({ module: "geppetto", changes: next }),
            ).toBe(true);
          }
        }
  });
  it("does not spawn an exhausted puppet before returning it to Ready", () => {
    const state = {
      "puppet.1.status": "on-board",
      "puppet.2.status": "exhausted",
      "puppet.3.status": "exhausted",
    };
    const first = geppettoSpawnChanges(state, "normal")!;
    expect(geppettoPuppetCounts(first)).toEqual({
      recorded: true,
      ready: 2,
      onBoard: 1,
      exhausted: 0,
    });
    const second = geppettoSpawnChanges(first, "normal")!;
    expect(geppettoPuppetCounts(second)).toEqual({
      recorded: true,
      ready: 1,
      onBoard: 2,
      exhausted: 0,
    });
    expect(
      geppettoPuppetCounts({ ...state, ...geppettoSpawnChanges(state, "all") }),
    ).toMatchObject({ onBoard: 3, exhausted: 0 });
  });
  it("requires a complete recorded tray and stops normal spawning for even an unnamed Finale", () => {
    expect(geppettoSpawnChanges({}, "normal")).toBeNull();
    const log = [
      start(),
      observation(initialGeppettoPuppets()),
      newPlayEvent({
        kind: "moment",
        momentType: "finale",
        text: "Finale revealed",
        permanent: true,
      }),
    ];
    expect(stateOf(log).finaleRevealed).toBe(true);
    expect(geppettoSpawnChanges(stateOf(log), "normal")).toBeNull();
    expect(geppettoSpawnChanges(stateOf(log), "one")).not.toBeNull();
  });
  it("rejects invalid token IDs, health, flags and synthetic reveal fields", () => {
    for (const changes of [
      { "puppet.4.status": "ready" },
      { "puppet.1.status": "dead" },
      { "puppet.1.protectionUsed": 1 },
      { "minor.am-i-a-puppet.health": 3 },
      { "minor.fake.health": 2 },
      { finaleRevealed: true },
    ])
      expect(validModuleObservation({ module: "geppetto", changes })).toBe(
        false,
      );
  });
});

describe("durable corrections, narrative evidence and recovery", () => {
  it("initializes killer setup alongside an independent starting event", () => {
    const setup = initialModuleObservations(
      { ...selection, startingEvent: "Girlfriend" },
      true,
    );
    expect(setup.map((e) => e.module)).toEqual(["geppetto", "camp"]);
    expect(geppettoPuppetCounts(setup[0].changes)).toMatchObject({ ready: 3 });
  });
  it("supports one atomic spawn, Undo/restore and serialization without affecting victim counts", () => {
    const setup = observation(initialGeppettoPuppets());
    const log = [
      start(),
      setup,
      observation({ "puppet.1.status": "exhausted" }),
    ];
    const action = observation(geppettoSpawnChanges(stateOf(log), "normal")!);
    log.push(action);
    expect(geppettoPuppetCounts(stateOf(log))).toMatchObject({
      onBoard: 1,
      ready: 2,
      exhausted: 0,
    });
    log.push(newPlayEvent({ kind: "undo", target: action.id }));
    expect(stateOf(log)["puppet.1.status"]).toBe("exhausted");
    log.push(newPlayEvent({ kind: "restore", target: action.id }));
    const restored = JSON.parse(JSON.stringify(log));
    expect(validPlayLog(restored)).toBe(true);
    expect(stateOf(restored)).toEqual(stateOf(log));
    expect(summarizePlay(restored).killed).toBe(0);
  });
  it("shares reveal corrections with Remember This and keeps Minor Health separate", () => {
    const reveal = newPlayEvent({
      kind: "moment",
      momentType: "dark-power",
      text: "Dark Power",
      killerCard: "Weapons Graft",
      permanent: true,
    });
    const log = [
      start(),
      reveal,
      observation({ "minor.am-i-a-puppet.health": 0 }),
      newPlayEvent({ kind: "state", field: "killerHealth", value: 8 }),
    ];
    log.push(
      newPlayEvent({
        kind: "details",
        target: reveal.id,
        killerCard: "Immortal Master",
      }),
    );
    expect(stateOf(log).power).toBe("immortal-master");
    expect(summarizePlay(log).killerHealth).toBe(8);
    const refs = moduleReferences(
      selection,
      moduleContext(selection, summarizePlay(log).entries),
      "Puppet 1",
    );
    expect(refs.find((c) => c.name === "Immortal Master")?.effect).toContain(
      "Ordinary Health can still be damaged",
    );
    expect(refs.find((c) => c.name === "Am I a Puppet?")?.effect).toContain(
      "no longer active",
    );
    expect(
      moduleContext(
        { ...selection, killer: "Hans", location: "Carnival of Blood" },
        summarizePlay(log).entries,
      )?.geppetto,
    ).toBeUndefined();
  });
  it("keeps death context historical and preserves signatures across JSONB key ordering", async () => {
    const death = newPlayEvent({
      kind: "killed",
      quantity: 1,
      cause: "minion",
      attacker: "Puppet 2",
    });
    const log = [
      start(),
      observation(initialGeppettoPuppets()),
      observation({
        "puppet.2.status": "on-board",
        "puppet.1.status": "exhausted",
      }),
      death,
    ];
    const first = deathFacts(selection, log, death.id)!;
    log.push(observation({ "puppet.2.status": "exhausted" }));
    expect(await deathSignature(deathFacts(selection, log, death.id)!)).toBe(
      await deathSignature(first),
    );
    const reordered = log.map((e) =>
      e.moduleData
        ? {
            ...e,
            moduleData: {
              ...e.moduleData,
              changes: Object.fromEntries(
                Object.entries(e.moduleData.changes).reverse(),
              ),
            },
          }
        : e,
    );
    expect(
      await deathSignature(deathFacts(selection, reordered, death.id)!),
    ).toBe(await deathSignature(first));
  });
  it("prioritizes recorded Gepetto facts within the existing ending summary budget", () => {
    const reveal = newPlayEvent({
      kind: "moment",
      momentType: "finale",
      text: "Finale",
      killerCard: "No Strings Attached",
      permanent: true,
    });
    const log = [
      start(),
      observation(initialGeppettoPuppets()),
      reveal,
      ...Array.from({ length: 20 }, () =>
        newPlayEvent({
          kind: "moment",
          momentType: "other",
          text: "A long unrelated observation. ".repeat(6),
        }),
      ),
    ];
    const beats = playStoryBeats(log, selection);
    expect(beats).toContain("No Strings Attached");
    expect(beats).toContain("Puppets:");
    expect(beats.length).toBeLessThanOrEqual(1800);
  });
});
