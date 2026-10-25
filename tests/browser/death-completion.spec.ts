import { test, expect, activeGame } from "./fixtures";
import { deathFacts, deathSignature } from "../../src/lib/play/death";
const death = {
  id: "77777777-7777-4777-8777-777777777777",
  at: 2,
  kind: "killed" as const,
  quantity: 1,
  cause: "killer" as const,
  attacker: "Billy the Bear",
};
const draft = {
  ...activeGame,
  playMode: true,
  selection: {
    ...activeGame.selection,
    killer: "Billy the Bear",
    location: "Buddyland",
    finalGirl: "Rena",
  },
  playEvents: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      at: 1,
      kind: "start" as const,
      saved: 0,
      killed: 0,
      round: 4,
    },
    death,
  ],
};
async function open(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
}
test("the screenshot fragment is repaired in the same saved slot and the reading controls are minimal", async ({
  page,
  archive,
}, info) => {
  const signature = await deathSignature(
    deathFacts(draft.selection, draft.playEvents, death.id)!,
  );
  const id = "88888888-8888-4888-8888-888888888888";
  archive.deathScenes.push({
    id,
    session_id: draft.id,
    event_id: death.id,
    signature,
    take: 0,
    scene_text: "The grease-stained",
    status: "ready",
  });
  await archive.install(page, { draft });
  await open(page);
  const dialog = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  const story = dialog.getByRole("region", {
    name: "Generated death scene",
    exact: true,
  });
  await expect(dialog).toContainText("This saved scene was cut short.");
  await expect(story).toHaveCount(0);
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(0);
  await dialog
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(story).toContainText(archive.deathText);
  await expect(story).not.toContainText("TAKE 1");
  await expect(story).not.toContainText("Audio is optional");
  await expect(story.locator(".play-death-story-heading > svg")).toHaveCount(0);
  const audio = story.getByRole("button", {
    name: "Narrate death scene",
    exact: true,
  });
  await expect(audio).toHaveText("");
  expect((await audio.boundingBox())!.width).toBeGreaterThanOrEqual(44);
  expect(archive.deathScenes).toHaveLength(1);
  expect(archive.deathScenes[0].id).toBe(id);
  expect(
    archive.generationRequests.find((r) => r.name === "generate-death-scene")
      ?.body.take,
  ).toBe(0);
  await dialog.evaluate((el) => {
    (document.activeElement as HTMLElement | null)?.blur();
    el.scrollTop = el.scrollHeight;
  });
  await page.screenshot({
    path: info.outputPath("complete-death-clean-controls.png"),
    animations: "disabled",
  });
  await dialog
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  const title = page.locator(".play-heading h1");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await title.evaluate((el) => getComputedStyle(el).fontFamily),
  ).toContain("Narration Fell");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(story).toContainText(archive.deathText);
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(1);
});
test("three old fragments do not exhaust the repair action or create extra victim records", async ({
  page,
  archive,
}) => {
  const signature = await deathSignature(
    deathFacts(draft.selection, draft.playEvents, death.id)!,
  );
  for (const take of [0, 1, 2])
    archive.deathScenes.push({
      id: `8888888${take}-8888-4888-8888-888888888888`,
      session_id: draft.id,
      event_id: death.id,
      signature,
      take,
      scene_text: "The grease-stained",
      status: "ready",
    });
  await archive.install(page, { draft });
  await open(page);
  const generate = page.getByRole("button", {
    name: "Gruesome Death",
    exact: true,
  });
  for (const take of [0, 1, 2]) {
    const action = take === 0 ? generate : page.getByRole("button", { name: "Another version", exact: true });
    await expect(action).toBeEnabled();
    await action.click();
    await expect
      .poll(
        () =>
          archive.deathScenes.filter((r) => r.scene_text === archive.deathText)
            .length,
      )
      .toBe(take + 1);
  }
  await expect(generate).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Another version", exact: true })).toHaveCount(0);
  expect(
    archive.generationRequests
      .filter((r) => r.name === "generate-death-scene")
      .map((r) => r.body.take),
  ).toEqual([0, 1, 2]);
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
});
test("an old backend returning a successful fragment produces an error instead of presenting it as a story", async ({
  page,
  archive,
}) => {
  archive.deathText = "The grease-stained";
  await archive.install(page, { draft });
  await open(page);
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  const result = page.getByRole("region", {
    name: "Death scene result",
    exact: true,
  });
  await expect(result).toContainText(
    "The scene stopped before it was finished.",
  );
  await expect(
    page.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toHaveCount(0);
  await expect(result).not.toContainText("The grease-stained");
});
