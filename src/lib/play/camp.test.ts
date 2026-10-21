import { describe, expect, it } from "vitest";
import { CAMP_EVENTS, CAMP_ITEMS, CAMP_SETUPS, HANS_POWERS } from "./modules";
import { applicablePlayCards, playItems, playVictims } from "./catalog";
import {
  newPlayEvent as event,
  playStoryBeats,
  summarizePlay,
  validPlayLog,
} from "./events";
import {
  moduleContext,
  moduleReferences,
  moduleState,
  validModuleObservation,
} from "./modules";
import { deathFacts, deathSignature } from "./death";
import { deathPrompt } from "../../../supabase/functions/_shared/deathPrompt";
import { getKillerMaxHealth } from "@/data/killerHealth";
import { getFinalGirlHealth } from "@/data/finalGirlHealth";
import { FEATURE_FILM_DETAILS } from "@/types/featureFilmDetails";
import { getModulePromptContext } from "@/data/rules/moduleRules";
import { getKillerNarrativeRules } from "@/data/killerSpecialRules";
const selection = {
  killer: "Hans",
  location: "Camp Happy Trails",
  finalGirl: "Laurie",
};
const start = () => event({ kind: "start", saved: 0, killed: 0, round: 1 });
const observation = (
  module: "hans" | "camp",
  changes: Record<string, string | number | boolean | null>,
) => event({ kind: "module", moduleData: { module, changes } });

describe("verified Camp and Hans knowledge", () => {
  it("supplies effects for all applicable cards, with independent killer/location catalogs", () => {
    const terror = applicablePlayCards(selection, "terror");
    expect(terror).toHaveLength(19);
    expect(
      terror.every((c) => c.effect && c.source.startsWith("Owner photo")),
    ).toBe(true);
    expect(CAMP_EVENTS).toHaveLength(10);
    expect(CAMP_ITEMS).toHaveLength(18);
    expect(CAMP_SETUPS).toHaveLength(5);
    expect(terror.map((c) => c.name)).toEqual(
      terror.map((c) => c.name).sort((a, b) => a.localeCompare(b)),
    );
    expect(
      applicablePlayCards(
        { ...selection, location: "Buddyland" },
        "event",
      ).some((c) => c.name === "Dark Waters"),
    ).toBe(false);
    expect(
      applicablePlayCards(
        { ...selection, killer: "Billy the Bear" },
        "terror",
      ).some((c) => c.name === "Dark Feast"),
    ).toBe(false);
    expect(playItems("Buddyland")).toHaveLength(16);
    expect(playItems("Camp Happy Trails")).toHaveLength(18);
    expect(playVictims("Camp Happy Trails").map((c) => c.name)).toEqual([
      "Boyfriend",
      "Girlfriend",
      "The Damned",
    ]);
    expect(terror.find((c) => c.name === "Dark Feast")?.effect).toMatch(
      /Horror.*dead Victim/,
    );
    expect(CAMP_ITEMS.find((c) => c.name === "Bear Trap")?.effect).toMatch(
      /two damage/,
    );
    expect(CAMP_ITEMS.find((c) => c.name === "Map")?.effect).not.toMatch(
      /every deck|bottom/,
    );
    expect(
      CAMP_ITEMS.find((c) => c.name === "Mysterious Pills")?.effect,
    ).toContain("Horror by one");
    expect(CAMP_ITEMS.find((c) => c.name === "Archery Bow")?.effect).toContain(
      "without modifying an Action card",
    );
  });
  it("uses the verified setup and event data outside Play and keeps cast identities independent", () => {
    expect(
      FEATURE_FILM_DETAILS["s1-camp-happy-trails"].location?.events.find(
        (c) => c.name === "Boyfriend",
      )?.description,
    ).toContain("12 Time");
    expect(getKillerMaxHealth("Hans")).toBe(12);
    expect(getFinalGirlHealth("Laurie")).toBe(5);
    const mixed = getModulePromptContext(
      "Billy the Bear",
      "Camp Happy Trails",
    )!;
    expect(mixed.visualGuidance).toContain("physical machine");
    expect(mixed.rulesSummary).toContain("Secret Tunnel");
    expect(
      getModulePromptContext("Hans", "Buddyland")!.visualGuidance,
    ).toContain("sledgehammer");
    for (const [killer, location] of [
      ["Hans", "Camp Happy Trails"],
      ["Hans", "Buddyland"],
      ["Billy the Bear", "Camp Happy Trails"],
    ]) {
      const context = getModulePromptContext(killer, location)!;
      expect(
        [
          context.rulesSummary,
          context.narrativeGuidance,
          getKillerNarrativeRules(killer),
        ].join("\n").length,
      ).toBeLessThanOrEqual(3000);
    }
  });
});
describe("durable optional Camp observations", () => {
  it("rejects foreign cards, arbitrary fields and invalid Minor Dark Power health", () => {
    for (const moduleData of [
      { module: "hans", changes: { "minor.unholy-rage.health": 3 } },
      { module: "hans", changes: { "minor.unholy-rage.health": -1 } },
      { module: "hans", changes: { secondPower: "Endless Power" } },
      { module: "camp", changes: { "victim.birthday-girl": "in-play" } },
      { module: "camp", changes: { "event.secret-tunnel": "drawn" } },
      { module: "camp", changes: { "tunnel.a": "Lake" } },
    ])
      expect(validModuleObservation(moduleData)).toBe(false);
  });
  it("retains zero, Undo and restore without changing any primary counter", () => {
    const people = observation("camp", { "victim.girlfriend": "killed" });
    const minor = observation("hans", { "minor.unholy-rage.health": 0 });
    const log = [start(), people, minor];
    expect(validPlayLog(log)).toBe(true);
    expect(
      moduleState(summarizePlay(log).entries, "hans")[
        "minor.unholy-rage.health"
      ],
    ).toBe(0);
    expect(summarizePlay(log)).toMatchObject({ saved: 0, killed: 0, round: 1 });
    const undo = event({ kind: "undo", target: people.id });
    expect(moduleState(summarizePlay([...log, undo]).entries, "camp")).toEqual(
      {},
    );
    expect(
      moduleState(
        summarizePlay([
          ...log,
          undo,
          event({ kind: "restore", target: people.id }),
        ]).entries,
        "camp",
      )["victim.girlfriend"],
    ).toBe("killed");
  });
  it("keeps a second reveal only with the applicable Finale and deduplicates powers", () => {
    const power = event({
      kind: "moment",
      momentType: "dark-power",
      text: "Dark Power",
      killerCard: "Feed",
    });
    const finale = event({
      kind: "moment",
      momentType: "finale",
      text: "Finale",
      killerCard: "Dark, Darker, Darkest",
    });
    const log = [
      start(),
      power,
      finale,
      observation("hans", { secondPower: "Dark Obsession" }),
    ];
    expect(
      moduleContext(selection, summarizePlay(log).entries)?.hans.secondPower,
    ).toBe("Dark Obsession");
    const corrected = [
      ...log,
      event({ kind: "details", target: finale.id, killerCard: "Bloodbath" }),
    ];
    expect(
      moduleContext(selection, summarizePlay(corrected).entries)?.hans
        .secondPower,
    ).toBeUndefined();
    expect(
      moduleContext(
        selection,
        summarizePlay([...log, observation("hans", { secondPower: "Feed" })])
          .entries,
      )?.hans.secondPower,
    ).toBeUndefined();
    expect(
      moduleContext(
        { ...selection, killer: "Billy the Bear" },
        summarizePlay(log).entries,
      ),
    ).toBeUndefined();
  });
  it("preserves death-time context and JSONB signatures, with explicit bounded fiction", async () => {
    const early = observation("camp", {
      "event.dark-waters": "active",
      "victim.boyfriend": "in-play",
    });
    const killed = event({
      kind: "killed",
      quantity: 1,
      cause: "event",
      eventCard: "Dark Waters",
      room: "Lake",
      victim: "Regular victim",
    });
    const log = [start(), early, killed];
    const before = deathFacts(selection, log, killed.id)!;
    const later = [
      ...log,
      observation("camp", {
        "event.dark-waters": "resolved",
        "victim.boyfriend": "saved",
      }),
      observation("hans", { "minor.unholy-rage.health": 2 }),
    ];
    expect(deathFacts(selection, later, killed.id)).toEqual(before);
    const roundTrip = (value: unknown): unknown =>
      Array.isArray(value)
        ? value.map(roundTrip)
        : value && typeof value === "object"
          ? Object.fromEntries(
              Object.entries(value)
                .reverse()
                .map(([key, entry]) => [key, roundTrip(entry)]),
            )
          : value;
    expect(
      await deathSignature(
        deathFacts(selection, roundTrip(log) as typeof log, killed.id)!,
      ),
    ).toBe(await deathSignature(before));
    const prompt = deathPrompt(before, []),
      data = JSON.parse(prompt.user);
    expect(data.selectedCardContext[0].effect).toContain("Lake");
    expect(
      data.moduleReferences.find(
        (r: { name: string }) => r.name === "Boyfriend",
      ).effect,
    ).toContain("without a matching death-specific victim field");
    expect(prompt.system).toContain("Exactly the recorded quantity dies");
    expect(
      moduleReferences(
        { ...selection, location: "Buddyland" },
        before.moduleContext,
      ).some((r) => r.name === "Dark Waters"),
    ).toBe(false);
    const explicit = moduleReferences(
      selection,
      undefined,
      undefined,
      "Boyfriend",
      "Dark Waters",
    );
    expect(explicit.find((r) => r.name === "Boyfriend")?.effect).toContain(
      "Explicitly selected",
    );
    expect(explicit.find((r) => r.name === "Dark Waters")?.effect).toContain(
      "this death only",
    );
    expect(
      moduleReferences(
        { ...selection, location: "Buddyland" },
        undefined,
        undefined,
        "Boyfriend",
        "Dark Waters",
      ),
    ).toEqual([]);
  });
  it("leaves old unsigned-context facts unchanged and carries known finds to endings", () => {
    const killed = event({ kind: "killed", quantity: 1 });
    expect(
      deathFacts(selection, [start(), killed], killed.id),
    ).not.toHaveProperty("moduleContext");
    const log = [
      start(),
      event({
        kind: "moment",
        momentType: "item",
        text: "Found a weapon/item",
        detail: "Aluminum Bat",
      }),
      observation("camp", {
        "event.secret-tunnel": "active",
        "tunnel.a": "Cabins",
        "tunnel.b": "Dock",
      }),
    ];
    const beats = playStoryBeats(log, selection);
    expect(beats).toContain("Minor Dark Power");
    expect(beats).toContain("Finding does not establish use");
    expect(beats).toContain("Cabins / Dock");
    expect(beats.length).toBeLessThanOrEqual(1800);
    expect(
      moduleReferences(selection, {
        hans: { "minor.unholy-rage.health": 0 },
      })[0].effect,
    ).toContain("no longer active");
    expect(HANS_POWERS.find((c) => c.name === "Blood Frenzy")).toHaveProperty(
      "epic",
      true,
    );
  });
});
