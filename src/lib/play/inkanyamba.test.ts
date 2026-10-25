import { describe, it, expect } from "vitest";
import {
  INKANYAMBA_UNLEASH,
  INKANYAMBA_POWERS,
  INKANYAMBA_FINALES,
  INKANYAMBA_MINOR_POWERS,
  INKANYAMBA_TERRORS,
  INKANYAMBA_BLOODLUST,
  atonementWrath,
} from "../../../supabase/functions/_shared/play/inkanyamba";
import {
  moduleState,
  moduleContext,
  moduleReferences,
  initialModuleObservations,
  validModuleObservation,
  killerMomentCards,
} from "./modules";
import { newPlayEvent, summarizePlay, type PlayEvent } from "./events";
import { deathFacts, deathSignature } from "./death";
import { deathPrompt } from "../../../supabase/functions/_shared/deathPrompt";
import { applicablePlayCards, playMechanisms } from "./catalog";
import {
  getModulePromptContext,
  ENTITY_RULE_MODULES,
} from "@/data/rules/moduleRules";
import { getKillerNarrativeRules } from "@/data/killerSpecialRules";
import { playStartingValues } from "./defaults";
import { getKillerMaxHealth } from "@/data/killerHealth";
const selection = {
  killer: "Inkanyamba",
  location: "Camp Happy Trails",
  finalGirl: "Laurie",
};
const observation = (
  changes: Record<string, string | number | boolean | null>,
) =>
  newPlayEvent({
    kind: "module",
    moduleData: { module: "inkanyamba", changes },
  });
const start = () =>
  newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 });
const state = (events: PlayEvent[]) =>
  moduleState(summarizePlay(events).entries, "inkanyamba");
describe("photographed Inkanyamba source", () => {
  it("reconciles deck counts, duplicates, board and owner filtering", () => {
    expect(INKANYAMBA_POWERS).toHaveLength(4);
    expect(INKANYAMBA_FINALES).toHaveLength(3);
    expect(INKANYAMBA_MINOR_POWERS.map((p) => p.health)).toEqual([3, 3]);
    expect(INKANYAMBA_TERRORS.reduce((n, c) => n + c.quantity, 0)).toBe(16);
    expect(
      INKANYAMBA_TERRORS.find((c) => c.name === "Fickle Temper")?.quantity,
    ).toBe(2);
    expect(
      INKANYAMBA_TERRORS.find((c) => c.name.startsWith("He's Coming"))
        ?.quantity,
    ).toBe(4);
    expect(INKANYAMBA_BLOODLUST.map((r) => [r.attack, r.move])).toEqual([
      [1, 2],
      [1, 2],
      [1, 3],
      [2, 3],
      [2, 3],
      [2, 3],
      [2, 4],
      [2, 4],
      [3, 5],
    ]);
    expect(playStartingValues("Inkanyamba", "Laurie").killerHealth).toBe(9);
    expect(getKillerMaxHealth("Inkanyamba")).toBe(9);
    expect(
      killerMomentCards("Inkanyamba", "dark-power").map((c) => c.name),
    ).toEqual([
      "Dark Lightning",
      "Feast of Anger",
      "Rising Dread",
      "Volatile Temper",
    ]);
    for (const location of [
      "Camp Happy Trails",
      "Buddyland",
      "Carnival of Blood",
      "Maple Lane",
    ]) {
      const cards = applicablePlayCards(
        { ...selection, location },
        "terror",
      ).filter((c) => c.killer === "Inkanyamba");
      expect(cards).toHaveLength(12);
      expect(cards.some((c) => c.name.includes("My House"))).toBe(false);
      const prompt = getModulePromptContext("Inkanyamba", location)!;
      expect(
        [
          getKillerNarrativeRules("Inkanyamba"),
          prompt.rulesSummary,
          prompt.narrativeGuidance,
        ].join("\n").length,
      ).toBeLessThanOrEqual(3000);
      expect(prompt.visualGuidance.length).toBeLessThanOrEqual(3000);
    }
    expect(
      applicablePlayCards({ ...selection, killer: "Hans" }, "terror").some(
        (c) => c.killer === "Inkanyamba",
      ),
    ).toBe(false);
    expect(playMechanisms(selection)).toContain("Killer Wrath");
    expect(
      ENTITY_RULE_MODULES.filter((m) => m.entity === "Inkanyamba"),
    ).toHaveLength(1);
  });
  it("preserves each photographed Unleash row in order", () => {
    expect(INKANYAMBA_UNLEASH).toEqual([
      "Increase Killer Wrath by 1.",
      "Increase Killer Wrath by 2.",
      "Increase Horror by 1.",
      "Increase Horror by 1; target the closest Final Girl or Victim; move.",
      "Increase Horror by 2.",
      "Target the closest Final Girl or Victim; move; attack.",
      "Recover 1 killer Health; target the closest Final Girl or Victim; move; attack.",
      "Recover 1 killer Health; increase Horror by 1; target the closest Final Girl or Victim; move; attack.",
      "Recover 2 killer Health; increase Horror by 1; target the closest Final Girl or Victim; move; attack.",
      "Recover 3 killer Health; increase Horror by 1; target the closest Final Girl or Victim; move; attack twice.",
    ]);
  });
  it("rounds the Atonement reduction up and never creates level zero", () => {
    const halves = [1, 1, 1, 2, 2, 3, 3, 4, 4, 5];
    for (let n = 1; n <= 10; n++) {
      expect(atonementWrath(n, 2)).toBe(halves[n - 1]);
      expect(atonementWrath(n, 3)).toBe(1);
      expect(atonementWrath(n, 1)).toBe(Math.max(1, n - 1));
      expect(atonementWrath(n, 0)).toBe(n);
    }
  });
});
describe("Inkanyamba observations and historical context", () => {
  it("rejects illegal values and seeds only verified fresh owner sessions", () => {
    const valid = (changes: Record<string, unknown>) =>
      validModuleObservation({ module: "inkanyamba", changes });
    for (const wrath of [1, 2, 10, null]) expect(valid({ wrath })).toBe(true);
    for (const wrath of [0, 11, -1, 1.5, "2", NaN])
      expect(valid({ wrath })).toBe(false);
    for (const h of [0, 1, 2, 3, null])
      expect(valid({ "minor.boiling-anger.health": h })).toBe(true);
    expect(valid({ "minor.boiling-anger.health": 4 })).toBe(false);
    expect(valid({ "minor.made-up.health": 3 })).toBe(false);
    expect(valid({ divineWrath: 2 })).toBe(false);
    expect(
      initialModuleObservations(selection, false, false, false, false, true),
    ).toEqual([{ module: "inkanyamba", changes: { wrath: 2 } }]);
    expect(initialModuleObservations(selection, false)).toEqual([]);
    expect(
      initialModuleObservations(
        { ...selection, killer: "Hans" },
        false,
        false,
        false,
        false,
        true,
      ),
    ).toEqual([]);
  });
  it("keeps corrections, unknowns, Undo and physical casualties separate", () => {
    const first = observation({ wrath: 5, "minor.outrageholic.health": 3 });
    const next = observation({ wrath: 2 });
    const log = [start(), first, next];
    expect(state(log).wrath).toBe(2);
    expect(summarizePlay(log).killed).toBe(0);
    log.push(newPlayEvent({ kind: "undo", target: next.id }));
    expect(state(log).wrath).toBe(5);
    log.push(observation({ wrath: null }));
    expect(state(log).wrath).toBeUndefined();
    expect(state(log)["minor.outrageholic.health"]).toBe(3);
    expect(summarizePlay(log).killerHealth).toBeUndefined();
    expect(summarizePlay(log).finalHorrorLevel).toBeUndefined();
    expect(
      moduleContext(
        { ...selection, killer: "Hans" },
        summarizePlay(log).entries,
      )?.inkanyamba,
    ).toBeUndefined();
  });
  it("freezes death facts before later Wrath changes and preserves old generic death hashes", async () => {
    const reveal = newPlayEvent({
      kind: "moment",
      momentType: "dark-power",
      text: "Dark Power revealed",
      killerCard: "Dark Lightning",
      permanent: true,
    });
    const death = newPlayEvent({
      kind: "killed",
      quantity: 1,
      cause: "killer",
    });
    const older = [start(), reveal, death];
    const old = deathFacts(selection, older, death.id)!;
    expect(old).not.toHaveProperty("moduleContext");
    const log = [
      start(),
      observation({ wrath: 7, "minor.boiling-anger.health": 0 }),
      reveal,
      death,
    ];
    const before = deathFacts(selection, log, death.id)!;
    const sig = await deathSignature(before);
    log.push(observation({ wrath: 10 }));
    expect(deathFacts(selection, log, death.id)).toEqual(before);
    expect(await deathSignature(deathFacts(selection, log, death.id)!)).toBe(
      sig,
    );
    expect(before.moduleContext?.inkanyamba.wrath).toBe(7);
    const refs = moduleReferences(selection, before.moduleContext);
    expect(refs.find((c) => c.name === "Boiling Anger")?.effect).toContain(
      "no longer active",
    );
    const prompt = JSON.parse(deathPrompt(before, []).user);
    expect(prompt.killerCue).toContain("not a serpent");
    expect(
      prompt.moduleReferences.find(
        (c: { name: string }) => c.name === "Dark Lightning",
      ).effect,
    ).toContain("does not establish");
    const jsonb = log.map((e) =>
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
    expect(await deathSignature(deathFacts(selection, jsonb, death.id)!)).toBe(
      sig,
    );
  });
});

it('new legacy-session reveals supply card facts without inventing Wrath or rewriting older hashes',()=>{
 const reveal=newPlayEvent({kind:'moment',momentType:'dark-power',text:'Dark Power revealed',killerCard:'Dark Lightning',inkanyambaReference:true});
 const entries=summarizePlay([start(),reveal]).entries;
 expect(moduleContext(selection,entries)?.inkanyamba).toEqual({powerRevealed:true,power:'dark-lightning'});
 expect(moduleContext(selection,entries)?.inkanyamba.wrath).toBeUndefined();
});
