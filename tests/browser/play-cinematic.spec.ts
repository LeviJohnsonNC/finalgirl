import { test, expect, activeGame } from "./fixtures";
import { searchPick } from "./play-helpers";
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
      kind: "start",
      saved: 3,
      killed: 0,
      round: 2,
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      at: 2,
      kind: "state",
      field: "finalGirlHealth",
      value: 5,
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      at: 3,
      kind: "state",
      field: "killerHealth",
      value: 10,
    },
    {
      id: "55555555-5555-4555-8555-555555555555",
      at: 4,
      kind: "state",
      field: "finalHorrorLevel",
      value: 3,
    },
    {
      id: "66666666-6666-4666-8666-666666666666",
      at: 5,
      kind: "state",
      field: "bloodlust",
      value: 2,
    },
  ],
};
test("cinematic dashboard and modal retain usable touch targets and keyboard dismissal", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Death details", exact: true }),
  ).toBeChecked();
  await expect(page.getByRole("region", { name: "Game timeline" })).toHaveCount(
    0,
  );
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("cinematic-dashboard.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("cause-first-modal.png"),
  });
  await page.getByRole("button", { name: "Terror card", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Terror card", exact: true })
    .click();
  const search = page.getByRole("combobox", {
    name: "Search Terror card",
    exact: true,
  });
  await search.fill("Regroup");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("combobox", { name: "Terror card", exact: true }),
  ).toHaveText("Regroup");
  await page
    .getByRole("combobox", { name: "Terror card", exact: true })
    .click();
  await expect(search).toBeVisible();
  await expect(search).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(search).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Event", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Terror card", exact: true }),
  ).toHaveCount(0);
  await searchPick(page, "Death event card", "Sing-A-Long");
  await expect(dialog).not.toContainText("During each Upkeep");
  await expect(dialog).not.toContainText("Source:");
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("event-modal.png"),
  });
  const close = dialog.getByRole("button", { name: "Close", exact: true });
  await close.click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  await page.setViewportSize({ width: 320, height: 640 });
  const toggle = page.getByRole("checkbox", {
    name: "Death details",
    exact: true,
  });
  await toggle.uncheck();
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(toggle).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
