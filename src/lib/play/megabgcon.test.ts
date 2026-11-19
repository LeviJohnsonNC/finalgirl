import { describe, expect, it } from "vitest";
import { BOOTHS, BOOTH_EVENTS, CON_EVENTS, CON_ITEMS, CON_TERRORS, MEGABGCON } from "../../../supabase/functions/_shared/play/megabgconCatalog";
import { canRecordCon, conFinaleRevealed, conOutcome, conOwnsLog, megabgconState, type ConAction, type ConCommand } from "../../../supabase/functions/_shared/play/megabgcon";
import { MORT, MORT_MODULE } from "../../../supabase/functions/_shared/play/mort";
import { canUndoCon, newPlayEvent, summarizePlay, validPlayLog, type PlayEvent } from "./events";
import { applicablePlayCards, suggestedDeathCards } from "./catalog";
import { deathFacts } from "./death";

const booth = BOOTHS[0];
function game() {
  const log: PlayEvent[] = [
    newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
    newPlayEvent({ kind: "state", field: "bloodlust", value: 2 }),
    newPlayEvent({ kind: "state", field: "killerHealth", value: 10 }),
    newPlayEvent({ kind: "state", field: "finalHorrorLevel", value: 4 }),
    newPlayEvent({ kind: "state", field: "finalGirlHealth", value: 5 }),
  ];
  const summary = () => summarizePlay(log);
  const con = () => megabgconState(summary().entries);
  function record(command: ConCommand) {
    const action: ConAction = { ...command, previous: con().previous };
    expect(canRecordCon(action, summary())).toBe(true);
    const moduleData = { module: "megabgcon", changes: { recorded: true } } as const;
    const outcome = conOutcome(action);
    const event = newPlayEvent(outcome ? {
      ...outcome, quantity: 1, megabgconAction: action, moduleData,
      ...(outcome.kind === "killed" && { cause: "event", megabgconReference: true }),
    } : { kind: "module", megabgconAction: action, moduleData });
    log.push(event);
    expect(validPlayLog(log)).toBe(true);
    return event;
  }
  function undo(target: string) {
    expect(canUndoCon(log, target)).toBe(true);
    log.push(newPlayEvent({ kind: "undo", target }));
    expect(validPlayLog(log)).toBe(true);
  }
  return { log, record, undo, con, summary };
}

describe("MegaBGCon physical companion", () => {
  it("reconciles the deck counts and keeps the location suggestions owner-scoped", () => {
    expect([BOOTHS.length, BOOTH_EVENTS.length, CON_EVENTS.length, CON_TERRORS.length]).toEqual([12, 10, 10, 8]);
    expect(CON_ITEMS.reduce((count, item) => count + ("copies" in item ? item.copies : 1), 0)).toBe(18);
    const cast = { killer: "Hans", location: MEGABGCON };
    expect(applicablePlayCards(cast, "event").filter(c => c.location === MEGABGCON)).toHaveLength(20);
    expect(suggestedDeathCards(cast, "event").map(c => c.name)).toEqual(["Tragic Accident"]);
    expect(applicablePlayCards({ ...cast, location: "Creech Manor" }, "event").some(c => c.location === MEGABGCON)).toBe(false);
  });

  it("records lookups separately, preserves persistent effects, and stops routine Upkeep at the Finale", () => {
    const t = game();
    expect(t.con().upkeep).toBeUndefined();
    t.record({ kind: "upkeep", booth, result: "arrival", killer: "Hans" });
    t.record({ kind: "upkeep", booth, result: "crowd", killer: "Hans" });
    t.record({ kind: "upkeep", booth, result: "wet-floor", killer: "Hans" });
    t.record({ kind: "lookup", booth: BOOTHS[1] });
    expect(t.con()).toMatchObject({ effects: { crowd: booth, "wet-floor": booth }, upkeep: { result: "wet-floor" }, lookup: BOOTHS[1] });
    t.log.push(newPlayEvent({ kind: "moment", momentType: "finale", text: "Finale revealed", permanent: true }));
    expect(canRecordCon({ kind: "upkeep", killer: "Hans", booth, result: "arrival", previous: t.con().previous }, t.summary())).toBe(false);
    expect(validPlayLog(t.log)).toBe(true);
  });

  it("tracks only the observed Tragic Accident branch and freezes the death's context", () => {
    const t = game();
    const empty = t.record({ kind: "upkeep", booth, result: "accident", accident: "bloodlust", killer: "Hans" });
    expect(t.summary()).toMatchObject({ bloodlust: 3, killed: 0 });
    t.undo(empty.id);
    expect(t.summary()).toMatchObject({ bloodlust: 2, killed: 0 });
    const crowd = t.record({ kind: "upkeep", booth, result: "crowd", killer: "Hans" });
    const death = t.record({ kind: "upkeep", booth, result: "accident", accident: "victim", killer: "Hans" });
    expect(t.summary()).toMatchObject({ bloodlust: 2, killed: 1 });
    const cast = { killer: "Hans", location: MEGABGCON, finalGirl: "Laurie" };
    const historical = deathFacts(cast, t.log, death.id);
    t.record({ kind: "token", token: "crowd", booth: BOOTHS[1] });
    expect(deathFacts(cast, t.log, death.id)).toEqual(historical);
    expect(JSON.stringify(historical)).toContain(`Crowd at ${booth}`);
    expect(conOwnsLog("Creech Manor", "Hans", t.log)).toBe(false);
    expect(conOwnsLog(MEGABGCON, MORT, t.log)).toBe(false);
    expect(canUndoCon(t.log, crowd.id)).toBe(false);
  });

  it("advances Lunch Time only via explicit phase ends and rolls back a tracked Buggy hit", () => {
    const t = game();
    t.record({ kind: "event", event: "lunch", active: true });
    t.log.push(newPlayEvent({ kind: "round" }));
    expect(t.con().lunch).toBe(2);
    t.record({ kind: "lunch-end" });
    t.record({ kind: "lunch-end" });
    expect(t.con().lunch).toBe(0);
    t.record({ kind: "buggy", status: "active" });
    const hit = t.record({ kind: "buggy", status: "spent", target: "killer", killer: "Hans" });
    expect(t.summary().killerHealth).toBe(8);
    t.undo(hit.id);
    expect(t.summary().killerHealth).toBe(10);
    expect(t.con().buggy).toBe("active");
  });

  it("keeps SWAG sealed until the confirmed outcome and applies the Bad Boy's role explicitly", () => {
    const t = game();
    t.record({ kind: "swag", booths: [BOOTHS[0], BOOTHS[1], BOOTHS[2]] });
    t.record({ kind: "swag-outcome", slot: 0, outcome: "saved", killer: "Hans" });
    t.record({ kind: "swag-outcome", slot: 1, outcome: "killed", killer: "Hans" });
    expect(t.con().swag.map(s => s.status)).toEqual(["saved", "killed", "active"]);
    t.record({ kind: "person", person: "bad-boy", role: "friend", booth });
    const saved = t.record({ kind: "person-outcome", person: "bad-boy", outcome: "saved", killer: "Hans" });
    expect(t.summary()).toMatchObject({ saved: 2, killed: 1, finalHorrorLevel: 2 });
    t.undo(saved.id);
    expect(t.summary()).toMatchObject({ saved: 1, finalHorrorLevel: 4 });
  });

  it("applies Bad Boy's Enemy rescue as Health loss during Mort without advancing Bloodlust", () => {
    const t = game();
    t.record({ kind: "person", person: "bad-boy", role: "enemy", booth });
    const rescue = t.record({ kind: "person-outcome", person: "bad-boy", outcome: "saved", killer: MORT });
    expect(t.summary()).toMatchObject({ saved: 1, finalGirlHealth: 4, bloodlust: 2, finalHorrorLevel: 4 });
    t.undo(rescue.id);
    expect(t.summary()).toMatchObject({ saved: 0, finalGirlHealth: 5 });
  });

  it("uses Mort's confirmation on either route and ignores temporary suspects", () => {
    const moduleData = { module: MORT_MODULE, changes: { recorded: true } } as const;
    const temporary = newPlayEvent({ kind: "module", moduleData, mortAction: { kind: "draw", suspect: "hans", parent: "root" } });
    expect(conFinaleRevealed(MORT, [temporary])).toBe(false);
    for (const route of ["clues", "terror"] as const) {
      const confirmed = newPlayEvent({ kind: "module", moduleData, mortAction: { kind: "reveal", route, suspect: "hans", power: "whispers", parent: "root" } });
      expect(conFinaleRevealed(MORT, [confirmed])).toBe(true);
    }
    const t = game();
    t.record({ kind: "buggy", status: "active" });
    expect(canRecordCon({ kind: "buggy", status: "spent", killer: MORT, target: "killer", previous: t.con().previous }, t.summary())).toBe(false);
  });
});
