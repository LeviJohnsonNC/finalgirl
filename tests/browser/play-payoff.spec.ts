import { test, expect, activeGame, userId } from "./fixtures";
import { searchPick, openHistory } from "./play-helpers";
const storageKey = `final-girl-active-game-v1:${userId}`;
const draft = {
  ...activeGame,
  playMode: true,
  selection: {
    ...activeGame.selection,
    killer: "Billy the Bear",
    location: "Buddyland",
    finalGirl: "Rena",
  },
};
async function open(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}
test("opt-in defaults, compact adjustments and the two comeback moments survive reload", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft });
  await open(page);
  for (const [label, value] of [
    ["Final Girl health", "6"],
    ["Killer health", "8"],
    ["Horror", "4"],
    ["Bloodlust", "0"],
  ]) {
    await page
      .getByRole("button", { name: `Track ${label}`, exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: `Set ${label}`, exact: true }),
    ).toHaveText(value);
    await expect(
      page.getByRole("button", { name: `Increase ${label}`, exact: true }),
    ).toBeEnabled();
  }
  await page
    .getByRole("button", { name: "Increase Horror", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Set Horror", exact: true }),
  ).toHaveText("5");
  const moments = page.getByRole("region", {
    name: "Remember this",
    exact: true,
  });
  const shapes = await moments
    .locator(".play-moment-choices button svg")
    .evaluateAll((nodes) => nodes.map((n) => n.innerHTML));
  expect(new Set(shapes).size).toBe(8);
  for (const [name, detail] of [
    ["Second wind", "Her black token restored two health"],
    ["Back from the dead", "Billy rose behind the counter"],
  ]) {
    await moments.getByRole("button", { name, exact: true }).click();
    await page.getByLabel("Moment detail", { exact: true }).fill(detail);
    await page.getByRole("button", { name: "Record", exact: true }).click();
  }
  await expect(
    page.getByRole("button", { name: "Set Final Girl health", exact: true }),
  ).toHaveText("6");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Set Horror", exact: true }),
  ).toHaveText("5");
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline" }),
  ).toContainText("Her black token restored two health");
  const log = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).playEvents,
    storageKey,
  );
  expect(log).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ momentType: "girl-revived" }),
      expect.objectContaining({ momentType: "killer-revived" }),
    ]),
  );
  await page.screenshot({
    path: info.outputPath("trackers-and-moments.png"),
    fullPage: true,
    animations: "disabled",
  });
});
test("Gruesome Death works with optional details and visibly delivers two story paragraphs above the actions", async ({
  page,
  archive,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  archive.holdDeath = true;
  archive.deathText =
    "The mascot song kept playing after the power died. At the kitchen door, a man held his breath and watched the strip of light beneath it. Something on the other side copied his breathing, one beat late. He laughed once, too softly, and reached for the latch.\n\nThe door opened inward without him touching it. His hand disappeared first. By the time the scream arrived, his shoes were the only part of him still in the kitchen. The song started its welcome verse again. This time, it used his voice.";
  await archive.install(page, { draft });
  await open(page);
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  const actions = dialog.locator(".play-death-actions");
  await expect(actions.getByRole("button")).toHaveCount(3);
  await expect(
    actions.getByRole("button", { name: "Gruesome Death", exact: true }),
  ).toBeEnabled();
  const beforeStoryScroll = await dialog.evaluate((el) => el.scrollTop);
  await actions
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  const payoff = page.getByRole("region", {
    name: "Death scene result",
    exact: true,
  });
  await expect(payoff).toHaveAttribute("aria-busy", "true");
  await expect(payoff).toContainText("Developing this moment into a story");
  await expect.poll(() => Boolean(archive.releaseDeath)).toBe(true);
  archive.releaseDeath!();
  const story = page.getByRole("region", {
    name: "Generated death scene",
    exact: true,
  });
  await expect(story).toContainText("This time, it used his voice.");
  await expect(story.locator(".play-death-prose")).toHaveCount(2);
  await expect(payoff).toHaveAttribute("aria-busy", "false");
  await expect
    .poll(() => dialog.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(beforeStoryScroll);
  expect(
    await dialog.evaluate((el) => {
      const result = el
        .querySelector(".play-death-payoff")!
        .getBoundingClientRect();
      const buttons = el
        .querySelector(".play-death-actions")!
        .getBoundingClientRect();
      return (
        result.bottom <= buttons.top &&
        result.top < innerHeight &&
        result.bottom > 0
      );
    }),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("gruesome-death-payoff.png"),
    animations: "disabled",
  });
  await actions
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(story).toContainText("This time, it used his voice.");
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(1);
});
test("Cancel discards edits but keeps the kill, Save and exit persists details, and regular victims remain unnamed facts", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await open(page);
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Killer attack", exact: true })
    .click();
  await searchPick(page, "Death location", "Kitchen");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Killer attack", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Death location", exact: true }),
  ).toHaveText("Room or board space");
  await searchPick(page, "Death location", "Arcade");
  await page
    .getByRole("combobox", { name: "Victim name or role", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Regular victim", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Death location", exact: true }),
  ).toHaveText("Arcade");
  await expect(
    page.getByRole("combobox", { name: "Victim name or role", exact: true }),
  ).toHaveText("Regular victim");
  await searchPick(page, "Death location", "Kitchen");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Death location", exact: true }),
  ).toHaveText("Arcade");
});
