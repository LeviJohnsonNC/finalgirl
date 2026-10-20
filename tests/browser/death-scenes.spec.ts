import { saveResultOnly } from "./play-helpers";
import { deathFacts, deathSignature } from "../../src/lib/play/death";
import type { PlayEvent } from "../../src/lib/play/events";
import { searchPick } from "./play-helpers";
import { test, expect, activeGame, installTestAudio } from "./fixtures";
const start = {
  id: "22222222-2222-4222-8222-222222222222",
  at: 1,
  kind: "start",
  saved: 0,
  killed: 0,
  round: 2,
};
const draft = {
  ...activeGame,
  selection: {
    ...activeGame.selection,
    killer: "Billy the Bear",
    location: "Buddyland",
    finalGirl: "Gwynn",
  },
  playMode: true,
  playEvents: [start],
};
async function resume(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}

test("record first, contextualize optionally, cache and replay without another generation", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  await archive.install(page, { draft });
  await resume(page);
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Gruesome Death" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Event", exact: true }).click();
  await searchPick(page, "Death location", "Kitchen");
  await page
    .getByLabel("Death context", { exact: true })
    .fill("Tragic Collapse");
  if (
    (await page
      .getByRole("button", { name: "Killer attack", exact: true })
      .getAttribute("aria-pressed")) === "false" &&
    (await page
      .getByRole("button", { name: "Event", exact: true })
      .getAttribute("aria-pressed")) === "false"
  )
    await page
      .getByRole("button", { name: "Killer attack", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Generated death scene" }),
  ).toContainText(archive.deathText);
  await page.screenshot({
    path: info.outputPath("death-scene.png"),
    fullPage: true,
  });
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(1);
  expect(archive.sessions[0].state.playEvents).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        kind: "details",
        room: "Kitchen",
        cause: "event",
        text: "Tragic Collapse",
      }),
    ]),
  );
  expect(
    archive.generationRequests.find((r) => r.name === "generate-death-scene")
      ?.body,
  ).toMatchObject({ eventId: archive.deathScenes[0].event_id, take: 0 });
  expect(
    JSON.stringify(
      archive.generationRequests.find((r) => r.name === "generate-death-scene")
        ?.body,
    ),
  ).not.toContain("killer");
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Latest death scene" }).click();
  await expect(
    page.getByRole("region", { name: "Generated death scene" }),
  ).toContainText(archive.deathText);
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(1);
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Version 2", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Version 3", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gruesome Death", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
});

test("AI failure and a late death response cannot lose or revive a recorded count", async ({
  page,
  archive,
}) => {
  test.setTimeout(90000);
  archive.failDeaths = true;
  await archive.install(page, { draft: { ...draft, showDeathPanel: true } });
  await resume(page);
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Gruesome Death", exact: true }),
  ).toBeVisible();
  if (
    (await page
      .getByRole("button", { name: "Killer attack", exact: true })
      .getAttribute("aria-pressed")) === "false" &&
    (await page
      .getByRole("button", { name: "Event", exact: true })
      .getAttribute("aria-pressed")) === "false"
  )
    await page
      .getByRole("button", { name: "Killer attack", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Scene unavailable." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  archive.failDeaths = false;
  archive.holdDeath = true;
  await page.getByRole("button", { name: "Latest death scene" }).click();
  if (
    (await page
      .getByRole("button", { name: "Killer attack", exact: true })
      .getAttribute("aria-pressed")) === "false" &&
    (await page
      .getByRole("button", { name: "Event", exact: true })
      .getAttribute("aria-pressed")) === "false"
  )
    await page
      .getByRole("button", { name: "Killer attack", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect.poll(() => Boolean(archive.releaseDeath)).toBe(true);
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  archive.releaseDeath!();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("0");
  await expect(
    page.getByRole("button", { name: "Latest death scene" }),
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("0");
});

test("a conflicting phone or desktop keeps both versions before explicit handoff", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await resume(page);
  await expect.poll(() => archive.sessions.length).toBe(1);
  archive.sessions[0].revision = 42;
  archive.sessions[0].state = {
    ...archive.sessions[0].state,
    playEvents: [
      start,
      {
        id: "55555555-5555-4555-8555-555555555555",
        at: 3,
        kind: "saved",
        quantity: 3,
      },
    ],
  };
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Another device changed this game.",
  );
  await page
    .getByRole("button", { name: "Keep this device’s version", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect.poll(() => archive.sessions[0].revision).toBeGreaterThan(42);
  const backup = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem(
        "final-girl-play-backup-v1:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:11111111-1111-4111-8111-111111111111",
      ) ?? "{}",
    ),
  );
  expect(backup.local.playEvents.at(-1).kind).toBe("killed");
  expect(backup.cloud.state.playEvents.at(-1).kind).toBe("saved");
});

test("manual death narration stops the intro and replays from device cache after reload", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  await archive.install(page, { draft });
  await installTestAudio(page);
  await resume(page);
  await page
    .getByRole("button", { name: "Narrate introduction", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Stop introduction", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  if (
    (await page
      .getByRole("button", { name: "Killer attack", exact: true })
      .getAttribute("aria-pressed")) === "false" &&
    (await page
      .getByRole("button", { name: "Event", exact: true })
      .getAttribute("aria-pressed")) === "false"
  )
    await page
      .getByRole("button", { name: "Killer attack", exact: true })
      .click();
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Narrate death scene", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Stop death narration", exact: true }),
  ).toBeVisible();
  const audio = () =>
    page.evaluate(() => {
      const a = (
        window as unknown as {
          __qaNarrators: { count: () => number; max: () => number };
        }
      ).__qaNarrators;
      return { count: a.count(), max: a.max() };
    });
  await expect.poll(audio).toEqual({ count: 1, max: 1 });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<number>((resolve, reject) => {
            const request = indexedDB.open("final-girl-narration-cache-v1");
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const db = request.result;
              const q = db
                .transaction("clips", "readonly")
                .objectStore("clips")
                .count();
              q.onsuccess = () => {
                db.close();
                resolve(q.result);
              };
              q.onerror = () => reject(q.error);
            };
          }),
      ),
    )
    .toBe(2);
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Narrate introduction", exact: true }),
  ).toBeVisible();
  expect((await audio()).count).toBe(0);
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Latest death scene" }).click();
  await page
    .getByRole("button", { name: "Narrate death scene", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Stop death narration", exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await audio()).count).toBe(1);
  expect(archive.calls.filter((c) => c === "narrate-story")).toHaveLength(2);
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(1);
  const body = archive.generationRequests
    .filter((r) => r.name === "narrate-story")
    .at(-1)!.body;
  expect(body).toMatchObject({
    kind: "death",
    deathSceneId: archive.deathScenes[0].id,
  });
  await page.screenshot({
    path: info.outputPath("death-narration.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Stop death narration", exact: true })
    .click();
  expect((await audio()).count).toBe(0);
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await saveResultOnly(page);
  await page.locator(".session-row-link").first().click();
  const savedScenes = page
    .locator("summary")
    .filter({ hasText: "DEATH SCENES" });
  await savedScenes.click();
  await page
    .getByRole("button", { name: "Narrate death scene", exact: true })
    .click();
  await expect.poll(async () => (await audio()).count).toBe(1);
  await savedScenes.click();
  await expect.poll(async () => (await audio()).count).toBe(0);
});

test("opening a legacy death preserves its cached scene until the player changes cause", async ({
  page,
  archive,
}) => {
  const death: PlayEvent = {
    id: "77777777-7777-4777-8777-777777777777",
    at: 2,
    kind: "killed",
    quantity: 1,
    cause: "killer",
    room: "Kitchen",
    terrorCard: "Regroup",
    eventCard: "Sing-A-Long",
    mechanism: "A short circuit",
  };
  const events = [start as PlayEvent, death];
  const signature = await deathSignature(
    deathFacts(draft.selection, events, death.id)!,
  );
  archive.deathScenes.push({
    id: "88888888-8888-4888-8888-888888888888",
    session_id: draft.id,
    event_id: death.id,
    signature,
    take: 0,
    scene_text: archive.deathText,
    status: "ready",
  });
  await archive.install(page, { draft: { ...draft, playEvents: events } });
  await resume(page);
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText(archive.deathText);
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect
    .poll(() => (archive.sessions[0]?.state.playEvents as PlayEvent[] | undefined)?.filter(e => e.kind !== "module"))
    .toHaveLength(2);
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await page.getByRole("button", { name: "Event", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("combobox", { name: "Death event card", exact: true }),
  ).toHaveText("Sing-A-Long");
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect
    .poll(() => (archive.sessions[0]?.state.playEvents as PlayEvent[] | undefined)?.filter(e => e.kind !== "module"))
    .toHaveLength(3);
  expect(
    (archive.sessions[0].state.playEvents as PlayEvent[]).at(-1),
  ).toMatchObject({
    cause: "event",
    terrorCard: "",
    attacker: "",
    mechanism: "",
  });
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(0);
});
