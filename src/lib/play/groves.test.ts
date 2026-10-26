import { describe, it, expect } from "vitest";
import {
  GROVES_EVENTS,
  GROVES_ITEMS,
  GROVES_TERRORS,
  GROVES_SETUPS,
  GROVES_SPACES,
  GROVES_EDGES,
  GROVES_UNLEASH,
  GROVES_BLOODLUST,
  grovesEdgeId,
  resolveGrovesAction,
  validGrovesAction,
  HOLY_MAN_PROVISIONAL,
  type GrovesAction,
} from "../../../supabase/functions/_shared/play/groves";
import {
  moduleState,
  moduleContext,
  moduleStoryBeats,
  initialModuleObservations,
  validModuleObservation,
  moduleReferences,
} from "./modules";
import {
  newPlayEvent,
  summarizePlay,
  isPlayEvent,
  type PlayEvent,
} from "./events";
import { deathFacts, deathSignature } from "./death";
import {
  applicablePlayCards,
  playItems,
  playVictims,
  PLAY_ROOMS,
} from "./catalog";
import {
  ENTITY_RULE_MODULES,
  getModulePromptContext,
} from "@/data/rules/moduleRules";
import { FEATURE_FILM_DETAILS } from "@/types/featureFilmDetails";
const selection = {
  killer: "Inkanyamba",
  location: "Sacred Groves",
  finalGirl: "Adelaide",
};
const start = () =>
  newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 });
const observation = (
  changes: Record<string, string | number | boolean | null>,
) =>
  newPlayEvent({ kind: "module", moduleData: { module: "groves", changes } });
const command = (
  person: "guide" | "tourist" | "holy-man",
  outcome: "saved" | "killed" | "blessed" | "angered",
  allocation?: number,
): GrovesAction => ({
  kind: "outcome",
  parent: "root",
  person,
  outcome,
  incense: false,
  ...(allocation !== undefined && { allocation }),
});
describe("Sacred Groves source and ownership", () => {
  it("accounts for the complete photographed location independently of the killer", () => {
    expect([
      GROVES_EVENTS.length,
      GROVES_ITEMS.length,
      GROVES_TERRORS.length,
      GROVES_SETUPS.length,
    ]).toEqual([10, 17, 8, 5]);
    expect(new Set(GROVES_ITEMS.map((c) => c.name)).size).toBe(17);
    expect(
      GROVES_SPACES.filter((s) => s.type === "sacred").map((s) => s.name),
    ).toEqual(["Burial Ground", "Sacred Shrine", "Holy Groves"]);
    expect(PLAY_ROOMS["Sacred Groves"]).toHaveLength(6);
    for (const killer of [
      "Hans",
      "Billy the Bear",
      "Geppetto",
      "Dr. Fright",
      "Inkanyamba",
      "Poltergeist",
    ]) {
      const own = { ...selection, killer };
      expect(
        applicablePlayCards(own, "terror").filter(
          (c) => c.location === "Sacred Groves",
        ),
      ).toHaveLength(8);
      expect(playItems(own.location)).toHaveLength(17);
      expect(playVictims(own.location)).toHaveLength(3);
      expect(
        getModulePromptContext(killer, own.location)?.rulesSummary,
      ).toContain("Divine Wrath");
    }
    expect(
      applicablePlayCards(
        { ...selection, location: "Camp Happy Trails" },
        "terror",
      ).some((c) => c.name === "Rage of the Gods"),
    ).toBe(false);
    expect(
      ENTITY_RULE_MODULES.filter((m) => m.entity === "Sacred Groves"),
    ).toHaveLength(1);
    expect(
      FEATURE_FILM_DETAILS["s1-sacred-groves"].location.events.find(
        (e) => e.name === "Fire and Brimstone",
      )?.description,
    ).toContain("TWO");
  });
  it("preserves printed ordered penalties, zero-based overlay and FAQ fallback", () => {
    expect(GROVES_UNLEASH).toEqual([
      "Lose 1 Time; then increase Divine Wrath by 1.",
      "Lose 2 Time.",
      "Increase Horror by 1.",
      "Discard 1 random Action card.",
      "Lose 4 Time.",
      "Increase Horror by 2.",
      "Discard 1 random Action card; increase Horror by 1; lose 2 Time.",
      "Discard 2 random Action cards; then lose 5 Time.",
      "Increase Horror by 2; then lose 4 Time.",
      "Discard ALL Action cards except Atonement; decrease Divine Wrath by the number discarded.",
    ]);
    expect(GROVES_BLOODLUST).toHaveLength(7);
    expect(GROVES_BLOODLUST[0]).toContain("number of Victims");
    expect(GROVES_BLOODLUST[6]).toContain("then Unleash");
    expect(
      GROVES_TERRORS.find((c) => c.name === "Rage of the Gods")?.effect,
    ).toContain("even if Victims remain elsewhere");
    expect(HOLY_MAN_PROVISIONAL).toContain("Provisional");
  });
  it("shares reviewed board identifiers across five source-backed setups and token connections", () => {
    expect(GROVES_SPACES).toHaveLength(19);
    const ids = GROVES_SPACES.map((s) => s.id);
    expect(new Set(ids).size).toBe(19);
    expect(new Set(GROVES_EDGES.map(grovesEdgeId)).size).toBe(30);
    for (const edge of GROVES_EDGES) {
      expect(ids).toContain(edge[0]);
      expect(ids).toContain(edge[1]);
      expect(edge[0]).not.toBe(edge[1]);
    }
    expect(
      GROVES_SETUPS.map((s) => [
        s.name,
        s.girl,
        s.killer,
        Object.values(s.victims).reduce((a, b) => a + b, 0),
      ]),
    ).toEqual([
      ["Dueling Tour Guides", "south-exit", "shed", 12],
      ["Family Day", "central", "sw", 12],
      ["Mob O' Tourists", "welcome", "south-exit", 11],
      ["Swamp Thing", "central", "holy", 12],
      ["Worship Service", "sw", "central", 12],
    ]);
    for (const s of GROVES_SETUPS)
      for (const id of [s.girl, s.killer, ...Object.keys(s.victims)])
        expect(ids).toContain(id);
  });
});
describe("Wrath, tokens and explicit outcomes", () => {
  it("rejects illegal values, invented edges, excess signs and invalid action payloads", () => {
    for (const changes of [
      { wrath: 0 },
      { wrath: 11 },
      { wrath: 1.5 },
      { "sign.3": "none" },
      { "sign.1": "welcome~shed" },
      { closed: "welcome" },
      { fire: "lake" },
      { "person.stranger": "saved" },
    ])
      expect(validModuleObservation({ module: "groves", changes })).toBe(false);
    expect(
      validModuleObservation({
        module: "groves",
        changes: {
          wrath: null,
          "sign.1": grovesEdgeId(["sw", "shrine"]),
          closed: "holy",
        },
      }),
    ).toBe(true);
    expect(
      validGrovesAction({ ...command("holy-man", "angered"), allocation: 11 }),
    ).toBe(false);
    expect(
      validGrovesAction({ ...command("guide", "saved"), extra: true }),
    ).toBe(false);
  });
  it("uses one chosen Atonement track and rounds the reduction up", () => {
    const a: GrovesAction = {
      kind: "atonement",
      target: "divine",
      successes: 2,
      parent: "root",
    };
    expect(
      resolveGrovesAction(a, { wrath: 5 }, { wrath: 9 }, "Inkanyamba"),
    ).toEqual({ changes: { atonementTarget: "divine", wrath: 2 } });
    expect(
      resolveGrovesAction(
        { ...a, target: "killer" },
        { wrath: 5 },
        { wrath: 9 },
        "Inkanyamba",
      ),
    ).toEqual({
      changes: { atonementTarget: "killer" },
      linkedModule: { module: "inkanyamba", changes: { wrath: 4 } },
    });
    expect(
      resolveGrovesAction(
        { ...a, target: "killer" },
        { wrath: 5 },
        { wrath: 9 },
        "Hans",
      ),
    ).toBeNull();
    expect(resolveGrovesAction(a, {}, {}, "Hans")).toBeNull();
  });
  it("requires a present role and observed inputs; corrections do not run effects", () => {
    expect(
      resolveGrovesAction(command("guide", "killed"), { wrath: 2 }, {}, "Hans"),
    ).toBeNull();
    expect(
      resolveGrovesAction(
        command("guide", "killed"),
        { "person.guide": "in-play" },
        {},
        "Hans",
      ),
    ).toBeNull();
    expect(
      resolveGrovesAction(
        command("guide", "killed"),
        { wrath: 8, "person.guide": "in-play" },
        {},
        "Hans",
      )?.changes,
    ).toEqual({ "person.guide": "killed", "event.guide": "ended", wrath: 10 });
    expect(
      moduleState(
        summarizePlay([
          start(),
          observation({ wrath: 2, "person.guide": "in-play" }),
          observation({ "person.guide": "killed" }),
        ]).entries,
        "groves",
      ).wrath,
    ).toBe(2);
  });
  it("applies observed ongoing modifiers only to explicit positive increases, never corrections", () => {
    const a: GrovesAction = {
      kind: "increase",
      parent: "root",
      amount: 2,
      incense: false,
    };
    expect(
      resolveGrovesAction(a, { wrath: 3, "event.loud": "active" }, {}, "Hans")
        ?.changes.wrath,
    ).toBe(6);
    expect(
      resolveGrovesAction(
        { ...a, incense: true },
        { wrath: 3, "event.loud": "active" },
        {},
        "Hans",
      )?.changes.wrath,
    ).toBe(5);
    expect(
      resolveGrovesAction(
        { ...a, amount: 1, incense: true },
        { wrath: 3 },
        {},
        "Hans",
      )?.changes.wrath,
    ).toBe(4);
    expect(
      moduleState(
        [
          observation({ wrath: 3, "event.loud": "active" }),
          observation({ wrath: 4 }),
        ],
        "groves",
      ).wrath,
    ).toBe(4);
  });
  it("sets both tracks TO 1; allocates before clamping without redistributing overflow", () => {
    const s = { wrath: 9, "person.holy-man": "in-play" };
    expect(
      resolveGrovesAction(
        command("holy-man", "blessed"),
        s,
        { wrath: 8 },
        "Inkanyamba",
      ),
    ).toEqual({
      changes: {
        "person.holy-man": "removed",
        "event.holy-man": "ended",
        holyManOutcome: "blessed",
        holyManProvisional: false,
        wrath: 1,
      },
      linkedModule: { module: "inkanyamba", changes: { wrath: 1 } },
    });
    const angry = resolveGrovesAction(
      command("holy-man", "angered", 8),
      s,
      { wrath: 3 },
      "Inkanyamba",
    )!;
    expect(angry.changes.wrath).toBe(10);
    expect(angry.linkedModule?.changes.wrath).toBe(5);
    const provisional = resolveGrovesAction(
      command("holy-man", "angered"),
      { ...s, wrath: 2 },
      {},
      "Hans",
    )!;
    expect(provisional.changes.wrath).toBe(10);
    expect(provisional.changes.holyManProvisional).toBe(true);
    expect(provisional.linkedModule).toBeUndefined();
  });
});
describe("immutable linked history and narratives", () => {
  it("projects and undoes both owners as one event, with no added casualties", () => {
    const base = [
      observation({ wrath: 8, "person.holy-man": "in-play" }),
      newPlayEvent({
        kind: "module",
        moduleData: { module: "inkanyamba", changes: { wrath: 7 } },
      }),
    ];
    const e = newPlayEvent({
      kind: "module",
      moduleData: {
        module: "groves",
        changes: { wrath: 1, "person.holy-man": "removed" },
      },
      grovesAction: command("holy-man", "blessed"),
      linkedModule: { module: "inkanyamba", changes: { wrath: 1 } },
    });
    expect(isPlayEvent(e)).toBe(true);
    expect(
      isPlayEvent({
        ...e,
        linkedModule: { module: "billy", changes: { billyStatus: "active" } },
      }),
    ).toBe(false);
    const logs = [start(), ...base, e];
    let entries = summarizePlay(logs).entries;
    expect(moduleState(entries, "groves").wrath).toBe(1);
    expect(moduleState(entries, "inkanyamba").wrath).toBe(1);
    logs.push(newPlayEvent({ kind: "undo", target: e.id }));
    entries = summarizePlay(logs).entries;
    expect(moduleState(entries, "groves").wrath).toBe(8);
    expect(moduleState(entries, "inkanyamba").wrath).toBe(7);
    logs.push(newPlayEvent({ kind: "restore", target: e.id }));
    expect(moduleState(summarizePlay(logs).entries, "inkanyamba").wrath).toBe(
      1,
    );
    expect(summarizePlay(logs).killed).toBe(0);
  });
  it("preserves old generic death facts and limits new context to the death's historical cutoff", async () => {
    const reveal = newPlayEvent({
      kind: "moment",
      momentType: "finale",
      text: "Finale",
    });
    const death = newPlayEvent({
      kind: "killed",
      quantity: 1,
      room: "Burial Grounds",
    });
    const old = deathFacts(selection, [start(), reveal, death], death.id)!;
    expect(old.moduleContext).toBeUndefined();
    const later = deathFacts(
      selection,
      [start(), reveal, death, observation({ wrath: 10 })],
      death.id,
    )!;
    expect(await deathSignature(later)).toBe(await deathSignature(old));
    const obs = observation({
      wrath: 4,
      fire: "holy",
      "person.holy-man": "removed",
    });
    const now = deathFacts(selection, [start(), obs, death], death.id)!;
    expect(now.moduleContext?.groves.wrath).toBe(4);
    const refs = moduleReferences(selection, now.moduleContext);
    expect(refs.map((r) => r.effect).join(" ")).toContain("not proof");
    expect(
      moduleContext({ ...selection, location: "Camp Happy Trails" }, [obs])
        ?.groves,
    ).toBeUndefined();
  });
  it("keeps both owners represented within narrative budgets without turning fire into injury", () => {
    const log = [
      start(),
      observation({ wrath: 6, fire: "holy", "event.fire": "active" }),
      newPlayEvent({
        kind: "module",
        moduleData: { module: "inkanyamba", changes: { wrath: 7 } },
      }),
    ];
    const facts = moduleStoryBeats(selection, summarizePlay(log).entries);
    expect(facts).toContain("Divine Wrath 6");
    expect(facts).toContain("Killer Wrath 7");
    expect(facts.length).toBeLessThanOrEqual(900);
    expect(
      getModulePromptContext(selection.killer, selection.location)
        ?.narrativeGuidance,
    ).toContain("not a literal fire");
    expect(
      initialModuleObservations(
        selection,
        false,
        false,
        false,
        false,
        false,
        true,
      ).find((o) => o.module === "groves")?.changes.wrath,
    ).toBe(2);
    expect(
      initialModuleObservations(selection, false).some(
        (o) => o.module === "groves",
      ),
    ).toBe(false);
  });
});
