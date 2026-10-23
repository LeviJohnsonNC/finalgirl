import { describe, it, expect } from "vitest";
import {
  CARNIVAL_EVENTS,
  CARNIVAL_ITEMS,
  CARNIVAL_ITEM_TRAPS,
  CARNIVAL_TRAPS,
  CARNIVAL_TERRORS,
  CARNIVAL_ROOMS,
  CARNIVAL_SETUPS,
  activateCarnivalEvent,
  carnivalActorChanges,
  carnivalItemEncounter,
  carnivalStartingObservations,
  initialModuleObservations,
  moduleState,
  moduleContext,
  moduleReferences,
  validModuleObservation,
} from "./modules";
import {
  newPlayEvent,
  summarizePlay,
  playStoryBeats,
  validPlayLog,
} from "./events";
import { deathFacts, deathSignature } from "./death";
import {
  applicablePlayCards,
  playItems,
  playVictims,
  playMechanisms,
  findPlayCard,
} from "./catalog";
import {
  getModulePromptContext,
  ENTITY_RULE_MODULES,
} from "@/data/rules/moduleRules";
import { getKillerNarrativeRules } from "@/data/killerSpecialRules";
const selection = {
  killer: "Geppetto",
  location: "Carnival of Blood",
  finalGirl: "Laurie",
};
const start = () =>
  newPlayEvent({ kind: "start", round: 1, saved: 0, killed: 0 });
const observation = (
  changes: Record<string, string | number | boolean | null>,
) =>
  newPlayEvent({ kind: "module", moduleData: { module: "carnival", changes } });
const stateOf = (log: ReturnType<typeof newPlayEvent>[]) =>
  moduleState(summarizePlay(log).entries, "carnival");
describe("owner-verified Carnival references", () => {
  it("has the photographed counts with ordinary items separate from encounters", () => {
    expect(CARNIVAL_EVENTS).toHaveLength(10);
    expect(CARNIVAL_ITEMS).toHaveLength(18);
    expect(CARNIVAL_ITEM_TRAPS).toHaveLength(3);
    expect(CARNIVAL_TRAPS).toHaveLength(3);
    expect(CARNIVAL_TERRORS).toHaveLength(8);
    expect(CARNIVAL_SETUPS).toHaveLength(5);
    expect(CARNIVAL_ROOMS).toHaveLength(6);
    expect(
      new Set([...CARNIVAL_ITEMS, ...CARNIVAL_ITEM_TRAPS].map((c) => c.name))
        .size,
    ).toBe(21);
    expect(playItems(selection.location)).toHaveLength(18);
    expect(
      playItems(selection.location).some((i) => i.name === "Hidden Cobra Trap"),
    ).toBe(false);
    expect(playVictims(selection.location).map((v) => v.name)).toEqual([
      "Sibling",
      "Fiancé",
    ]);
    expect(
      ENTITY_RULE_MODULES.find((m) => m.entity === selection.location)?.source,
    ).toContain("IMG_9338");
  });
  it("preserves source-specific quantities and cancellation rules", () => {
    expect(CARNIVAL_EVENTS.find((e) => e.id === "sibling")!.effect).toContain(
      "two Bloodlust",
    );
    expect(CARNIVAL_EVENTS.find((e) => e.id === "fiance")!.effect).toContain(
      "Horror by five",
    );
    expect(
      CARNIVAL_TERRORS.find((e) => e.name.includes("tiger"))!.effect,
    ).toContain("one damage");
    expect(CARNIVAL_ITEM_TRAPS.find((t) => t.id === "bear")!.effect).toContain(
      "Lose one Health",
    );
    expect(
      CARNIVAL_ITEMS.find((t) => t.name === "Strongman Hammer")!.effect,
    ).toContain("immediately end the Action phase");
    expect(
      CARNIVAL_ITEMS.find((t) => t.name === "Found Footage")!.effect,
    ).toContain("ANY");
  });
  it("mixes killer/location catalogs without leaking Carnival to other locations", () => {
    expect(applicablePlayCards(selection, "terror")).toHaveLength(24);
    const hans = applicablePlayCards(
      { ...selection, killer: "Hans" },
      "terror",
    );
    expect(hans.filter((c) => c.location === selection.location)).toHaveLength(
      8,
    );
    expect(hans.some((c) => c.killer === "Geppetto")).toBe(false);
    expect(
      applicablePlayCards(
        { ...selection, location: "Camp Happy Trails" },
        "event",
      ).some((c) => c.name === "Full Moon"),
    ).toBe(false);
    expect(
      findPlayCard(selection, "event", "Did you follow me here")?.effect,
    ).toContain("two Bloodlust");
    expect(playMechanisms(selection)).toContain("Acid Pitfall Trap");
    expect(
      playMechanisms({ ...selection, location: "Buddyland" }),
    ).not.toContain("Acid Pitfall Trap");
  });
  it("fits actual mixed narrative budgets", () => {
    for (const killer of ["Geppetto", "Hans", "Billy the Bear"]) {
      const context = getModulePromptContext(killer, selection.location)!;
      expect(
        [
          getKillerNarrativeRules(killer),
          context.rulesSummary,
          context.narrativeGuidance,
        ]
          .filter(Boolean)
          .join("\n").length,
      ).toBeLessThanOrEqual(3000);
      expect(context.visualGuidance.length).toBeLessThanOrEqual(3000);
    }
  });
});
describe("Carnival state lifecycles", () => {
  it.each(CARNIVAL_EVENTS)(
    "atomically seeds $name only in marked new sessions",
    (event) => {
      const observations = initialModuleObservations(
        { ...selection, startingEvent: event.name },
        true,
        true,
      );
      const carnival = observations.find((e) => e.module === "carnival")!;
      expect(validModuleObservation(carnival)).toBe(true);
      expect(carnival.changes[`event.${event.id}`]).toBe("active");
      for (const t of CARNIVAL_TRAPS)
        expect(carnival.changes[`trap.${t.id}.status`]).toBe("not-placed");
      expect(
        initialModuleObservations(
          { ...selection, startingEvent: event.name },
          false,
        ).some((e) => e.module === "carnival"),
      ).toBe(false);
      expect(
        initialModuleObservations(
          {
            ...selection,
            location: "Camp Happy Trails",
            startingEvent: "Girlfriend",
          },
          true,
          true,
        ).map((e) => e.module),
      ).toEqual(["geppetto", "camp"]);
    },
  );
  it("does not resurrect ended roles or restore discarded objects on reactivation", () => {
    expect(
      activateCarnivalEvent("sibling", {
        "person.sibling": "saved",
        "event.sibling": "ended",
      }),
    ).toBeNull();
    expect(activateCarnivalEvent("cart", { cart: "discarded" })).toBeNull();
    const killed = carnivalActorChanges("person.fiance", "killed", {});
    expect(killed).toEqual({
      "person.fiance": "killed",
      "event.fiance": "ended",
    });
    expect(
      carnivalActorChanges("person.fiance", "in-play", killed)["event.fiance"],
    ).toBe("active");
    expect(carnivalActorChanges("cart", "discarded", {})["event.cart"]).toBe(
      "ended",
    );
  });
  it("So Much Junk explicitly grants Zappo on first activation, but reactivation never restores lost inventory", () => {
    expect(activateCarnivalEvent("junk", { zappo: "lost" })?.zappo).toBe(
      "with-you",
    );
    expect(
      activateCarnivalEvent("junk", { zappo: "lost", "event.junk": "ended" }),
    ).not.toHaveProperty("zappo");
  });
  it("keeps the Search penalty after Zappo is regained or the Event ends", () => {
    const initial = carnivalStartingObservations("So Much Junk");
    const log = [
      start(),
      observation(initial),
      observation(carnivalActorChanges("zappo", "lost", initial)),
    ];
    log.push(
      observation(carnivalActorChanges("zappo", "with-you", stateOf(log))),
      observation({ "event.junk": "ended" }),
    );
    expect(stateOf(log)).toMatchObject({
      zappo: "with-you",
      searchPenalty: true,
    });
    expect(carnivalActorChanges("zappo", "lost", {})).not.toHaveProperty(
      "searchPenalty",
    );
  });
  it("records repeated encounters, avoids with Zappo, and never clears old effects on cancellation", () => {
    expect(carnivalItemEncounter("bear", "avoided-zappo", {})).toBeNull();
    const avoided = carnivalItemEncounter("bear", "avoided-zappo", {
      "event.junk": "active",
      zappo: "with-you",
    })!;
    expect(avoided).toMatchObject({
      zappo: "lost",
      searchPenalty: true,
      encounterOutcome: "avoided-zappo",
    });
    expect(avoided).not.toHaveProperty("condition.bear");
    const log = [
      start(),
      observation(carnivalItemEncounter("cobra", "resolved", {})!),
      observation({ "condition.cobra": "cleared" }),
      observation(carnivalItemEncounter("cobra", "resolved", {})!),
    ];
    expect(stateOf(log)["condition.cobra"]).toBe("active");
    log.push(
      observation(
        carnivalItemEncounter("cobra", "canceled-footage", stateOf(log))!,
      ),
    );
    expect(stateOf(log)["condition.cobra"]).toBe("active");
    expect(carnivalItemEncounter("gas", "resolved", {})).not.toHaveProperty(
      "condition.gas",
    );
  });
  it("retains a placed token after card cancellation and round changes, with explicit correction and Undo", () => {
    const placed = observation({
      "trap.acid.status": "placed",
      "trap.acid.space": "The Big Top",
    });
    const log = [
      start(),
      placed,
      observation({
        lastTerrorTrap: "acid",
        terrorTrapOutcome: "canceled-footage",
      }),
      newPlayEvent({ kind: "round" }),
    ];
    expect(stateOf(log)["trap.acid.status"]).toBe("placed");
    const correction = observation({
      "trap.acid.status": "not-placed",
      "trap.acid.space": null,
    });
    log.push(correction);
    expect(stateOf(log)["trap.acid.space"]).toBeUndefined();
    log.push(newPlayEvent({ kind: "undo", target: correction.id }));
    expect(stateOf(log)["trap.acid.status"]).toBe("placed");
    expect(validPlayLog(JSON.parse(JSON.stringify(log)))).toBe(true);
    expect(summarizePlay(log)).toMatchObject({ saved: 0, killed: 0 });
  });
  it("rejects impossible actor states, extra tokens, unknown fields and unsafe value types", () => {
    for (const changes of [
      { werewolf: "saved" },
      { werewolf: "killed" },
      { "trap.four.status": "placed" },
      { "condition.gas": "active" },
      { searchPenalty: "yes" },
      { "trap.rope.status": ["placed"] },
      { "trap.rope.space": "x".repeat(101) },
      { power: "invented" },
      { "event.unknown": "active" },
    ])
      expect(validModuleObservation({ module: "carnival", changes })).toBe(
        false,
      );
  });
  it("keeps death snapshots historical, JSONB stable, and ordinary non-Carnival fingerprints untouched", async () => {
    const death = newPlayEvent({
      kind: "killed",
      quantity: 1,
      cause: "hazard",
      mechanism: "Acid Pitfall Trap",
      victim: "Sibling",
    });
    const log = [
      start(),
      observation(carnivalStartingObservations(CARNIVAL_EVENTS[2].name)),
      observation({
        "trap.acid.status": "placed",
        "trap.acid.space": "Outer path",
      }),
      death,
    ];
    const facts = deathFacts(selection, log, death.id)!;
    log.push(observation({ "trap.acid.status": "not-placed" }));
    expect(await deathSignature(deathFacts(selection, log, death.id)!)).toBe(
      await deathSignature(facts),
    );
    const reversed = log.map((e) =>
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
      await deathSignature(deathFacts(selection, reversed, death.id)!),
    ).toBe(await deathSignature(facts));
    const other = { ...selection, location: "Camp Happy Trails" };
    expect(deathFacts(other, log, death.id)?.moduleContext).toBeUndefined();
    const refs = moduleReferences(
      selection,
      facts.moduleContext,
      undefined,
      "Sibling",
      "Acid Pitfall Trap",
    );
    expect(refs.find((r) => r.name === "Acid Pitfall Trap")?.effect).toContain(
      "Enemies ignore",
    );
  });
  it("keeps critical location facts and killer facts in crowded ending summaries", () => {
    const changes: Record<string, string | number | boolean | null> =
      Object.assign(
        carnivalStartingObservations("So Much Junk"),
        {
          searchPenalty: true,
          zappo: "lost",
          cart: "discarded",
          "person.sibling": "killed",
          "person.fiance": "saved",
          werewolf: "in-play",
          "trap.acid.status": "placed",
          "trap.blades.status": "placed",
          "trap.rope.status": "placed",
        },
        ...CARNIVAL_EVENTS.map((e) => ({ [`event.${e.id}`]: "active" })),
      );
    const log = [
      start(),
      observation(changes),
      newPlayEvent({
        kind: "module",
        moduleData: {
          module: "geppetto",
          changes: {
            "puppet.1.status": "on-board",
            "puppet.2.status": "ready",
            "puppet.3.status": "exhausted",
          },
        },
      }),
    ];
    // Split a large snapshot into valid individual observations (20 fields per entry).
    const entries = Object.entries(changes);
    log.splice(
      1,
      1,
      ...Array.from({ length: Math.ceil(entries.length / 20) }, (_, i) =>
        observation(Object.fromEntries(entries.slice(i * 20, (i + 1) * 20))),
      ),
    );
    const beats = playStoryBeats(log, selection);
    expect(beats.length).toBeLessThanOrEqual(1800);
    expect(beats).toContain("Search penalty");
    expect(beats).toContain("Sibling: killed");
    expect(beats).toContain("Puppets:");
    expect(beats).toContain("Persistent traps:");
    expect(
      moduleContext(
        { ...selection, location: "Buddyland" },
        summarizePlay(log).entries,
      )?.carnival,
    ).toBeUndefined();
  });
});
