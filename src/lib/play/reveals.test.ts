import { describe, expect, it } from "vitest";
import {
  newPlayEvent as event,
  summarizePlay,
  validPlayLog,
  playStoryBeats,
} from "./events";
import { killerMomentCards, moduleState, buddylandReferences } from "./modules";
import { deathFacts, deathSignature } from "./death";

const selection = {
  killer: "Billy the Bear",
  location: "Buddyland",
  finalGirl: "Rena",
};
const start = () => event({ kind: "start", saved: 0, killed: 0, round: 1 });
describe("remembered killer reveals", () => {
  it("offers only verified killer cards, alphabetized independently of the location", () => {
    const powers = killerMomentCards(selection.killer, "dark-power");
    expect(powers).toHaveLength(6);
    expect(powers.map((c) => c.name)).toEqual(
      powers.map((c) => c.name).sort((a, b) => a.localeCompare(b)),
    );
    expect(
      killerMomentCards(selection.killer, "finale").map((c) => c.name),
    ).toEqual(["Encore", "It’s Showtime!", "Power Surge", "Sizzling Power"]);
    expect(killerMomentCards("Hans", "dark-power")).toHaveLength(4);
    expect(killerMomentCards("Hans", "finale")).toHaveLength(3);
  });
  it("retains old moments and validates optional reveal fields for durable drafts", () => {
    const reveal = event({
      kind: "moment",
      momentType: "dark-power",
      text: "Dark Power",
    });
    expect(
      validPlayLog([
        start(),
        reveal,
        event({ kind: "moment", momentType: "escape", text: "Narrow escape" }),
      ]),
    ).toBe(true);
    expect(validPlayLog([{ ...reveal, killerCard: 3 }])).toBe(false);
    expect(validPlayLog([{ ...reveal, killerCard: "a".repeat(241) }])).toBe(
      false,
    );
  });
  it("carries corrected Finale selection through the timeline, ending prefill, Undo and restore", () => {
    const reveal = event({
      kind: "moment",
      momentType: "finale",
      text: "Finale",
    });
    const log = [
      start(),
      reveal,
      event({
        kind: "details",
        target: reveal.id,
        killerCard: "Encore",
        detail: "The lights went out.",
      }),
      event({ kind: "details", target: reveal.id, killerCard: "Power Surge" }),
    ];
    const entries = summarizePlay(log).entries;
    expect(entries.find((e) => e.id === reveal.id)).toMatchObject({
      killerCard: "Power Surge",
      detail: "The lights went out.",
    });
    expect(moduleState(entries, "billy").finale).toBe("power-surge");
    expect(playStoryBeats(log, selection)).toContain(
      "Finale: Power Surge. The lights went out.",
    );
    const clear = event({ kind: "details", target: reveal.id, killerCard: "" });
    expect(
      moduleState(summarizePlay([...log, clear]).entries, "billy").finale,
    ).toBeUndefined();
    const undo = event({ kind: "undo", target: reveal.id });
    expect(
      moduleState(summarizePlay([...log, undo]).entries, "billy").finale,
    ).toBeUndefined();
    expect(
      moduleState(
        summarizePlay([
          ...log,
          undo,
          event({ kind: "restore", target: reveal.id }),
        ]).entries,
        "billy",
      ).finale,
    ).toBe("power-surge");
  });
  it("uses earlier reveals for death context without treating a reveal as a current power state", async () => {
    const reveal = event({
      kind: "moment",
      momentType: "dark-power",
      text: "Dark Power",
      killerCard: "Backup Generator",
    });
    const killed = event({ kind: "killed", quantity: 1, cause: "killer" });
    const log = [start(), reveal, killed];
    const before = deathFacts(selection, log, killed.id)!;
    expect(before.moduleContext?.billy).toEqual({
      "power.backup-generator.revealed": true,
    });
    expect(
      buddylandReferences(selection, before.moduleContext)[0].effect,
    ).toContain("not whether it remains active");
    expect(
      await deathSignature(
        deathFacts(
          selection,
          [
            ...log,
            event({
              kind: "moment",
              momentType: "finale",
              text: "Finale",
              killerCard: "Encore",
            }),
          ],
          killed.id,
        )!,
      ),
    ).toBe(await deathSignature(before));
    expect(
      deathFacts({ ...selection, killer: "Hans" }, log, killed.id),
    ).not.toHaveProperty("moduleContext");
  });
  it("keeps explicit character deaths as story beats after turning a portrait off without changing totals", () => {
    const log = [
      start(),
      event({
        kind: "module",
        moduleData: {
          module: "billy",
          changes: { "buddy.toby.status": "defeated" },
        },
      }),
      event({
        kind: "module",
        moduleData: { module: "billy", changes: { "buddy.toby.status": null } },
      }),
      event({
        kind: "module",
        moduleData: {
          module: "buddyland",
          changes: { "victim.birthday-girl": "killed" },
        },
      }),
    ];
    expect(summarizePlay(log)).toMatchObject({ saved: 0, killed: 0 });
    expect(moduleState(summarizePlay(log).entries, "billy")).not.toHaveProperty(
      "buddy.toby.status",
    );
    expect(playStoryBeats(log, selection)).toContain("Toby status: defeated");
    expect(playStoryBeats(log, selection)).toContain("Birthday Girl: killed");
  });
});
