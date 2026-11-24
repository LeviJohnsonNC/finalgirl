import { describe, expect, it } from "vitest";
import {
  HELLSCAPE_EVENTS, HELLSCAPE_ITEMS, HELLSCAPE_SETUPS, HELLSCAPE_SPACES, HELLSCAPE_TERRORS,
  hellscapePersonKey, type HellscapePerson, type HellscapeStatus,
} from "../../../supabase/functions/_shared/play/hellscape";
import { getEventsForLocation, getSetupCardsForLocation } from "@/types/featureFilmDetails";
import { birdsEventIncompatible } from "../../../supabase/functions/_shared/play/birds";
import { applicablePlayCards, playItems, playVictims, PLAY_ROOMS, suggestedDeathCards } from "./catalog";
import { deathFacts, deathSignature } from "./death";
import { newPlayEvent, summarizePlay, validPlayLog } from "./events";
import { moduleContext, moduleReferences, moduleState, moduleStoryBeats } from "./modules";

const selection = {killer: "Razorface", location: "Hellscape", finalGirl: "Kenzie"};
const observe = (id: HellscapePerson, value: HellscapeStatus | null) => newPlayEvent({
  kind: "module", moduleData: {module: "hellscape", changes: {[hellscapePersonKey(id)]: value}},
});

describe("Hellscape", () => {
  it("uses the verified location catalog in Casting and the owner-filtered Play lookup", () => {
    expect([HELLSCAPE_SETUPS.length, HELLSCAPE_EVENTS.length, HELLSCAPE_TERRORS.length, HELLSCAPE_ITEMS.length]).toEqual([5, 10, 8, 18]);
    expect(HELLSCAPE_SETUPS.map(card => card.victims.reduce<number>((n, [count]) => n + count, 0))).toEqual([4, 4, 4, 4, 4]);
    expect(getSetupCardsForLocation("s3-hell-to-pay").map(card => card.name)).toEqual(HELLSCAPE_SETUPS.map(card => card.name));
    expect(getEventsForLocation("s3-hell-to-pay")).toHaveLength(10);
    expect(PLAY_ROOMS.Hellscape).toEqual(HELLSCAPE_SPACES);
    expect(playItems(selection.location)).toEqual(HELLSCAPE_ITEMS);
    expect(applicablePlayCards(selection, "terror").filter(card => card.location === "Hellscape")).toHaveLength(8);
    expect(applicablePlayCards({...selection, location: "Buddyland"}, "terror").some(card => card.location === "Hellscape")).toBe(false);
    expect(suggestedDeathCards(selection, "terror").map(card => card.name)).toContain("Death Labyrinth");
    expect(suggestedDeathCards(selection, "terror").map(card => card.name)).not.toContain("Spiral of Horrors");
    const birds = {...selection, killer: "Birds"};
    expect(playVictims(birds.location, birds.killer)).toEqual([]);
    expect(birdsEventIncompatible("Birds", "Hellscape", "Curious Wretch")).toBe(true);
    expect(applicablePlayCards(birds, "event").map(card => card.name)).not.toContain("Curious Wretch");
    expect(applicablePlayCards(birds, "event").map(card => card.name)).toContain("Barrier of Blood");
  });

  it("replays several Victim records, corrections and Undo without changing the physical totals", () => {
    const start = newPlayEvent({kind: "start", saved: 2, killed: 1, round: 2});
    const health = newPlayEvent({kind: "state", field: "finalGirlHealth", value: 4});
    const horror = newPlayEvent({kind: "state", field: "finalHorrorLevel", value: 5});
    const death = observe("seeker", "killed");
    const log = [start, health, observe("peon", "in-play"), observe("wretch", "in-play"),
      observe("seeker", "in-play"), death, observe("wretch", "saved"), horror,
      newPlayEvent({kind: "undo", target: death.id})];
    const saved = JSON.parse(JSON.stringify(log));
    expect(validPlayLog(saved)).toBe(true);
    const summary = summarizePlay(saved);
    expect(summary).toMatchObject({saved: 2, killed: 1, finalGirlHealth: 4, finalHorrorLevel: 5});
    expect(moduleState(summary.entries, "hellscape")).toEqual({
      "person.peon": "in-play", "person.wretch": "saved", "person.seeker": "in-play",
    });
    expect(moduleContext({...selection, location: "Buddyland"}, summary.entries)?.hellscape).toBeUndefined();
    expect(moduleStoryBeats(selection, summary.entries)).toContain("Curious Wretch: saved.");
    expect(validPlayLog([...log, observe("peon", "left-play")])).toBe(true);
    expect(validPlayLog([...log, {...observe("peon", "saved"), moduleData: {module: "hellscape", changes: {
      "person.peon": "saved", "person.seeker": "killed",
    }}}])).toBe(false);
  });

  it("keeps historical death context and signatures stable across later corrections", async () => {
    const end = newPlayEvent({kind: "killed", quantity: 1, cause: "event", eventCard: "Masochistic Peon",
      room: "The Nexus", victim: "Masochistic Peon"});
    const arrival = observe("peon", "in-play");
    const log = [newPlayEvent({kind: "start", saved: 0, killed: 0, round: 1}), arrival, end];
    const before = deathFacts(selection, log, end.id)!;
    expect(before.moduleContext?.hellscape).toEqual({"person.peon": "in-play"});
    const after = deathFacts(selection, [...log, newPlayEvent({kind: "undo", target: arrival.id}), observe("seeker", "saved")], end.id)!;
    expect(after).toEqual(before);
    expect(await deathSignature(after)).toBe(await deathSignature(before));
    expect(deathFacts({...selection, location: "Buddyland"}, log, end.id)).toBeNull();
    expect(moduleReferences(selection, before.moduleContext, undefined, "Masochistic Peon").map(ref => ref.name)).toContain("Masochistic Peon");
  });
});
