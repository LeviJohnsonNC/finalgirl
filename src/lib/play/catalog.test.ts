import { describe, it, expect } from "vitest";
import { applicablePlayCards, findPlayCard, playCardContext } from "./catalog";
import { deathFacts, deathSignature } from "./death";
import { newPlayEvent as event } from "./events";
import { deathPrompt } from "../../../supabase/functions/_shared/deathPrompt";

describe("sourced death context", () => {
  it("filters mixed killer/location decks and disambiguates same-name card types", () => {
    const selection = { killer: "Hans", location: "Station 2891" };
    const cards = applicablePlayCards(selection, "terror");
    expect(cards.some((c) => c.name === "Taking Souvenirs")).toBe(true);
    expect(cards.some((c) => c.name === "The generator is out.")).toBe(true);
    expect(cards.some((c) => c.name === "Fire!")).toBe(false);
    expect(
      findPlayCard({ killer: "Hans", location: "Maple Lane" }, "event", "Fire!")
        ?.effect,
    ).toContain("house");
    expect(
      findPlayCard(
        { killer: "Hans", location: "Maple Lane" },
        "terror",
        "Fire!",
      ),
    ).toBeUndefined();
    expect(playCardContext(selection, "It's happy hour!")).toEqual([]);
    expect(playCardContext(selection, "Totally invented")).toEqual([]);
  });
  it("changes scene identity when card facts change and never supplies an unverified effect", async () => {
    const selection = {
      killer: "Hans",
      location: "Station 2891",
      finalGirl: "Uki",
    };
    const death = event({ kind: "killed", quantity: 1 });
    const log = [
      event({ kind: "start", saved: 0, killed: 0, round: 1 }),
      death,
    ];
    const before = deathFacts(selection, log, death.id)!;
    const facts = deathFacts(
      selection,
      [
        ...log,
        event({
          kind: "details",
          target: death.id,
          cause: "hazard",
          mechanism: "Frostbite",
          terrorCard: "The generator is out.",
        }),
      ],
      death.id,
    )!;
    expect(await deathSignature(facts)).not.toBe(await deathSignature(before));
    expect(
      JSON.parse(deathPrompt(facts, []).user).selectedCardContext[0].effect,
    ).toContain("Frostbite");
    const unknown = {
      ...facts,
      terrorCard: "Fake card",
      eventCard: "Heavy Storm",
    };
    expect(
      JSON.parse(deathPrompt(unknown, []).user).selectedCardContext,
    ).toEqual([]);
  });
});
