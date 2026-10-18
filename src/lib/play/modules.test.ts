import { describe, it, expect } from "vitest";
import {
  BUDDIES,
  BUDDYLAND_ITEMS,
  BUDDYLAND_TERRORS,
  BUDDYLAND_EVENTS,
  BILLY_POWERS,
  BILLY_FINALES,
  validModuleObservation,
  moduleState,
  moduleContext,
  buddylandReferences,
  type ModuleObservation,
} from "./modules";
import {
  newPlayEvent as event,
  summarizePlay,
  playStoryBeats,
  validPlayLog,
} from "./events";
import { deathFacts, deathSignature } from "./death";
import { applicablePlayCards, findPlayCard } from "./catalog";
import { deathPrompt } from "../../../supabase/functions/_shared/deathPrompt";
const selection = {
  killer: "Billy the Bear",
  location: "Buddyland",
  finalGirl: "Rena",
};
const start = () => event({ kind: "start", saved: 0, killed: 0, round: 1 });
const observe = (
  module: ModuleObservation["module"],
  changes: ModuleObservation["changes"],
) => event({ kind: "module", moduleData: { module, changes } });

describe("owner-supplied Buddyland content", () => {
  it("covers the photographed decks without counting repeated names as new cards", () => {
    expect(BUDDYLAND_TERRORS).toHaveLength(19);
    expect(
      BUDDYLAND_TERRORS.reduce((n, c) => n + ("copies" in c ? c.copies : 1), 0),
    ).toBe(22);
    expect(BUDDYLAND_EVENTS).toHaveLength(10);
    expect(BUDDYLAND_ITEMS).toHaveLength(16);
    expect(BUDDIES.map((b) => [b.name, b.health, b.initiative])).toEqual([
      ["Toby", 3, 1],
      ["Ramey", 2, 2],
      ["Allie", 2, 3],
      ["Cam", 2, 4],
      ["Roxy", 1, 5],
      ["Billy Jr.", 2, 6],
      ["Boris", 4, 7],
    ]);
    expect(BILLY_POWERS).toHaveLength(6);
    expect(BILLY_FINALES).toHaveLength(4);
    expect(findPlayCard(selection, "event", "Sing-A-Long")?.effect).toContain(
      "draw a Terror card",
    );
    expect(findPlayCard(selection, "terror", "Power Surge")?.effect).toContain(
      "Power Source",
    );
    expect(
      BILLY_FINALES.find((f) => f.name === "Power Surge")?.effect,
    ).toContain("Boris");
  });
  it("keeps Billy cards and Buddyland cards independent", () => {
    const away = applicablePlayCards(
      { killer: "Billy the Bear", location: "Camp Happy Trails" },
      "terror",
    );
    expect(away.some((c) => c.name === "Regroup")).toBe(true);
    expect(away.some((c) => c.name === "Earthquake!")).toBe(false);
    const visitor = applicablePlayCards(
      { killer: "Hans", location: "Buddyland" },
      "terror",
    );
    expect(visitor.some((c) => c.name === "Earthquake!")).toBe(true);
    expect(visitor.some((c) => c.name === "Regroup")).toBe(false);
  });
});
describe("persistent module observations", () => {
  it("rejects invalid keys, values, decks and oversized payloads", () => {
    for (const moduleData of [
      { module: "billy", changes: { "buddy.invented.health": 2 } },
      { module: "billy", changes: { "buddy.toby.health": -1 } },
      { module: "billy", changes: { "buddy.toby.health": 1.5 } },
      { module: "billy", changes: { "source.6.status": "active" } },
      { module: "billy", changes: { "power.backup-generator.health": 3 } },
      { module: "billy", changes: { finale: "Regroup" } },
      { module: "billy", changes: { lastTerror: "Earthquake!" } },
      { module: "buddyland", changes: { "item.flash-camera.uses": 3 } },
      { module: "buddyland", changes: { "source.1.status": "active" } },
      { module: "buddyland", changes: { collapseRoom: "a".repeat(241) } },
      { module: "billy", changes: {} },
    ]) {
      expect(validModuleObservation(moduleData)).toBe(false);
      expect(
        validPlayLog([
          { id: crypto.randomUUID(), at: 1, kind: "module", moduleData },
        ]),
      ).toBe(false);
    }
  });
  it("preserves zero, unknown and explicit defeat separately through undo and restore", () => {
    const spawn = observe("billy", {
      "buddy.toby.status": "active",
      "buddy.toby.health": 3,
    });
    const damage = observe("billy", { "buddy.toby.health": 0 });
    const log = [start(), spawn, damage];
    expect(moduleState(summarizePlay(log).entries, "billy")).toMatchObject({
      "buddy.toby.health": 0,
      "buddy.toby.status": "active",
    });
    const undo = event({ kind: "undo", target: damage.id });
    expect(
      moduleState(summarizePlay([...log, undo]).entries, "billy")[
        "buddy.toby.health"
      ],
    ).toBe(3);
    expect(
      moduleState(
        summarizePlay([
          ...log,
          undo,
          event({ kind: "restore", target: damage.id }),
        ]).entries,
        "billy",
      )["buddy.toby.health"],
    ).toBe(0);
    expect(summarizePlay(log)).toMatchObject({ saved: 0, killed: 0 });
    expect(
      moduleState(
        summarizePlay([...log, observe("billy", { "buddy.toby.health": null })])
          .entries,
        "billy",
      )["buddy.toby.health"],
    ).toBeUndefined();
  });
  it("uses module state at the death, ignores future changes, and preserves legacy identities", async () => {
    const killed = event({
      kind: "killed",
      quantity: 1,
      attacker: "Toby",
      cause: "minion",
    });
    const log = [
      start(),
      observe("billy", {
        "buddy.toby.status": "active",
        "buddy.toby.health": 3,
        "source.1.status": "active",
      }),
      killed,
    ];
    const before = deathFacts(selection, log, killed.id)!;
    const future = deathFacts(
      selection,
      [
        ...log,
        observe("billy", {
          "source.1.status": "inactive",
          "buddy.toby.health": 0,
        }),
      ],
      killed.id,
    )!;
    expect(before.moduleContext?.billy["source.1.status"]).toBe("active");
    expect(await deathSignature(before)).toBe(await deathSignature(future));
    const prompt = JSON.parse(deathPrompt(before, []).user);
    expect(
      prompt.moduleReferences.find((r) => r.name === "Toby").effect,
    ).toContain("extra Bloodlust");
    expect(prompt.moduleContextNote).toContain(
      "does not establish the attacker",
    );
    const old = deathFacts(selection, [start(), killed], killed.id)!;
    expect(old).not.toHaveProperty("moduleContext");
    expect(
      moduleContext(
        { killer: "Hans", location: "Camp Happy Trails" },
        summarizePlay(log).entries,
      ),
    ).toBeUndefined();
  });
  it("keeps module context and remembered moments bounded in ending summaries", () => {
    const log = [
      start(),
      observe("buddyland", { "item.fire-axe.status": "carried" }),
      event({
        kind: "moment",
        momentType: "item",
        text: "Found a weapon",
        detail: "Fire Axe",
      }),
      observe("billy", {
        finale: "power-surge",
        "buddy.boris.status": "defeated",
      }),
      ...Array.from({ length: 100 }, () =>
        observe("billy", { "buddy.toby.health": 2 }),
      ),
    ];
    const summary = playStoryBeats(log, selection);
    expect(summary).toContain("Fire Axe");
    expect(summary).toContain("Power Surge");
    expect(summary).toContain("Boris: defeated");
    expect(summary.length).toBeLessThanOrEqual(1800);
    expect(
      buddylandReferences(
        { killer: "Hans", location: "Buddyland" },
        { billy: { finale: "power-surge", "power.deathlust.active": true } },
      ),
    ).toEqual([]);
  });
});
