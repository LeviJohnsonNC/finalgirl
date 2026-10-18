import { describe, it, expect } from "vitest";
import { deathFacts, deathSignature } from "./death";
import { newPlayEvent } from "./events";
const selection = {
  killer: "Billy the Bear",
  location: "Camp Happy Trails",
  finalGirl: "Rena",
};
describe("death identity and factual context", () => {
  it("matches cloud JSONB key order without losing existing server scene signatures", async () => {
    const start = newPlayEvent({
      kind: "start",
      saved: 0,
      killed: 0,
      round: 4,
    });
    const moduleEvent = newPlayEvent({
      kind: "module",
      moduleData: {
        module: "billy",
        changes: {
          "buddy.toby.status": "active",
          "buddy.toby.health": 3,
          "source.1.status": "active",
        },
      },
    });
    const death = newPlayEvent({
      kind: "killed",
      quantity: 1,
      cause: "killer",
    });
    const cloudModule = {
      ...moduleEvent,
      moduleData: {
        module: "billy" as const,
        changes: {
          "source.1.status": "active",
          "buddy.toby.health": 3,
          "buddy.toby.status": "active",
        },
      },
    };
    const cloud = deathFacts(selection, [start, cloudModule, death], death.id)!;
    const local = deathFacts(selection, [start, moduleEvent, death], death.id)!;
    expect(local).toEqual(cloud);
    expect(await deathSignature(local)).toBe(await deathSignature(cloud));
    // Captured from the previous edge implementation with JSONB-ordered input.
    expect(await deathSignature(local)).toBe(
      "5ba8f677ca50fe10547b6a08062d0d914d078e21cef18a82e5558ea561dc1411",
    );
    // Legacy/non-module events may carry irrelevant extra properties.
    const stray = {
      ...death,
      moduleData: { module: "billy", changes: null },
    } as unknown as typeof death;
    expect(deathFacts(selection, [start, stray], death.id)).not.toHaveProperty(
      "moduleContext",
    );
  });
  it("uses the selected location and cause, ignores later unrelated taps, and excludes undone deaths", async () => {
    const start = newPlayEvent({
      kind: "start",
      saved: 0,
      killed: 0,
      round: 3,
    });
    const death = newPlayEvent({ kind: "killed", quantity: 2, cause: "event" });
    const log = [start, death];
    const facts = deathFacts(selection, log, death.id)!;
    expect(facts).toMatchObject({
      killer: "Billy the Bear",
      location: "Camp Happy Trails",
      quantity: 2,
      cause: "event",
      room: "",
      victim: "",
      round: 3,
    });
    expect(await deathSignature(facts)).toBe(
      await deathSignature(
        deathFacts(
          selection,
          [...log, newPlayEvent({ kind: "round" })],
          death.id,
        )!,
      ),
    );
    expect(
      deathFacts(
        selection,
        [...log, newPlayEvent({ kind: "undo", target: death.id })],
        death.id,
      ),
    ).toBeNull();
  });
  it("invalidates a cached scene when the player corrects the recorded details", async () => {
    const start = newPlayEvent({
      kind: "start",
      saved: 0,
      killed: 0,
      round: null,
    });
    const death = newPlayEvent({ kind: "killed", quantity: 1 });
    const log = [start, death];
    const before = await deathSignature(deathFacts(selection, log, death.id)!);
    const updated = deathFacts(
      selection,
      [
        ...log,
        newPlayEvent({
          kind: "details",
          target: death.id,
          room: "Kitchen",
          cause: "hazard",
          text: "Collapse",
        }),
      ],
      death.id,
    )!;
    expect(updated).toMatchObject({
      room: "Kitchen",
      cause: "hazard",
      note: "Collapse",
    });
    expect(await deathSignature(updated)).not.toBe(before);
  });
});

describe("cause-specific death details", () => {
  it("clears previous causes rather than letting hidden card facts reach generation", async () => {
    const { detailsForCause } = await import("./death");
    const mixed = {
      room: "Kitchen",
      victim: "Nick",
      text: "A narrow doorway",
      cause: "killer" as const,
      attacker: "Toby",
      terrorCard: "Regroup",
      eventCard: "Earthquake!",
      mechanism: "Collapse",
    };
    const killer = detailsForCause(mixed, "Billy the Bear");
    expect(killer).toMatchObject({
      attacker: "Billy the Bear",
      terrorCard: "",
      eventCard: "",
      mechanism: "",
      room: "Kitchen",
      victim: "Nick",
    });
    const terror = detailsForCause(
      { ...mixed, cause: "terror" },
      "Billy the Bear",
    );
    expect(terror).toMatchObject({
      attacker: "",
      terrorCard: "Regroup",
      eventCard: "",
      mechanism: "",
    });
    const event = detailsForCause(
      { ...mixed, cause: "event" },
      "Billy the Bear",
    );
    expect(event).toMatchObject({
      attacker: "",
      terrorCard: "",
      eventCard: "Earthquake!",
      mechanism: "",
    });
    const death = newPlayEvent({ kind: "killed", quantity: 1, ...mixed });
    const clean = newPlayEvent({
      kind: "details",
      target: death.id,
      ...killer,
    });
    const facts = deathFacts(
      selection,
      [
        newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
        death,
        clean,
      ],
      death.id,
    )!;
    expect(facts).not.toHaveProperty("terrorCard");
    expect(facts).not.toHaveProperty("eventCard");
    expect(facts.attacker).toBe("Billy the Bear");
  });
});
