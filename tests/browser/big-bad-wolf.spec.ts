import { test, expect, activeGame, userId } from "./fixtures";
import { openModule, chooseKillerCard, searchPick } from "./play-helpers";
import { WOLF_MINORS, WOLF_POWERS, WOLF_FINALES, WOLF_TERRORS } from "../../src/lib/play/bigBadWolf";
import { summarizePlay, type PlayEvent } from "../../src/lib/play/events";

const key = `final-girl-active-game-v1:${userId}`;
const sizes = { desktop: [[1280, 640], [1366, 768], [1440, 900]], mobile: [[390, 844], [320, 568]] };

test("Wolf setup, linked reveals, Minor health and loaded photographs", async ({ page, archive }, info) => {
  const selection = { ...activeGame.selection, killer: "Big Bad Wolf", location: "Sacred Groves" };
  await archive.install(page, { draft: { ...activeGame, selection, playMode: true, coreTrackersVersion: 1, wolfSetupVersion: 1, playEvents: [] } });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "big-bad-wolf");
  const panel = page.locator('[data-module="big-bad-wolf"]');
  const mode = panel.getByRole("region", { name: "Recorded mode" });
  await expect(mode.getByRole("heading")).toHaveText("Track");
  const first: PlayEvent[] = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents, key);
  expect(summarizePlay(first)).toMatchObject({ killerHealth: 9, finalHorrorLevel: 5, bloodlust: 0, killed: 0 });

  await panel.locator("details.module-card-section > summary").click();
  const power = panel.getByRole("region", { name: "Dark Power selection" });
  await power.getByRole("button", { name: "Record Dark Power card name", exact: true }).click();
  await expect(mode.getByRole("heading")).toHaveText("Power revealed · mode unconfirmed");
  const savedBeforeFailure = await page.evaluate(k => localStorage.getItem(k), key);
  await page.evaluate(k => {
    const set = Storage.prototype.setItem;
    (window as unknown as { restoreWolfStorage: () => void }).restoreWolfStorage = () => { Storage.prototype.setItem = set; };
    Storage.prototype.setItem = function (name, value) {
      if (name === k) throw new Error("Synthetic full storage");
      return set.call(this, name, value);
    };
  }, key);
  await power.getByRole("button", { name: "Choose A Killing Machine", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("could not be saved");
  await expect(mode.getByRole("heading")).toHaveText("Power revealed · mode unconfirmed");
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe(savedBeforeFailure);
  await page.evaluate(() => (window as unknown as { restoreWolfStorage: () => void }).restoreWolfStorage());
  await chooseKillerCard(panel, "Dark Power", "A Killing Machine");
  await expect(mode.getByRole("heading")).toHaveText("Track + Slay");
  await power.getByRole("button", { name: "Clear Dark Power card name", exact: true }).click();
  await expect(mode.getByRole("heading")).toHaveText("Track + Slay");

  const remember = page.getByRole("region", { name: "Remember this", exact: true });
  await remember.getByRole("button", { name: "Dark Power", exact: true }).click();
  await chooseKillerCard(remember, "Dark Power", "Sixth Sense");
  await expect(mode.getByRole("heading")).toHaveText("Slay");
  await expect(power.locator(".module-revealed-hero h4")).toHaveText("Sixth Sense");
  const later: PlayEvent[] = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents, key);
  expect(later.filter(event => event.kind === "moment" && event.momentType === "dark-power")).toHaveLength(1);

  await panel.getByRole("button", { name: "Reveal What Big Teeth You Have!", exact: true }).click();
  await panel.getByRole("button", { name: "Remove one What Big Teeth You Have! health, heart 1", exact: true }).click();
  await panel.getByRole("button", { name: "Remove one What Big Teeth You Have! health, heart 1", exact: true }).click();
  await expect(panel.getByText("Removed · 0/2 health")).toBeVisible();
  await panel.getByRole("button", { name: "Restore one What Big Teeth You Have! health, heart 1", exact: true }).click();
  await expect(panel.getByText("1/2 health")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "big-bad-wolf");
  await expect(mode.getByRole("heading")).toHaveText("Slay");
  await expect(panel.getByText("1/2 health")).toBeVisible();

  await panel.locator("details.module-card-section > summary").click();
  await chooseKillerCard(panel, "Finale", "Thrill of the Hunt");
  for (const [width, height] of sizes[info.project.name === "mobile" ? "mobile" : "desktop"]) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await panel.locator("img:visible").evaluateAll(async images => Promise.all(images.map(el => {
      const img = el as HTMLImageElement;
      img.loading = "eager";
      return img.decode();
    })));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await panel.screenshot({ path: info.outputPath(`wolf-${width}.jpg`), type: "jpeg", quality: 85, animations: "disabled", style: ".app-footer{visibility:hidden}" });
  }
});

test("an empty pre-import Wolf game keeps unknown observations", async ({ page, archive }) => {
  await archive.install(page, { draft: { ...activeGame, selection: { ...activeGame.selection, killer: "Big Bad Wolf" }, playMode: true, coreTrackersVersion: 1, playEvents: [] } });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "big-bad-wolf");
  await expect(page.getByRole("region", { name: "Recorded mode" }).getByRole("heading")).toHaveText("Mode unrecorded");
  const events: PlayEvent[] = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents, key);
  expect(summarizePlay(events).killerHealth).toBeUndefined();
  expect(summarizePlay(events).finalHorrorLevel).toBeUndefined();
});

test("each Wolf card loads its own photograph and a named Terror keeps the same saved death", async ({ page, archive }, info) => {
  test.setTimeout(90000);
  await archive.install(page, { draft: { ...activeGame, selection: { ...activeGame.selection, killer: "Big Bad Wolf", location: "Storybook Woods" }, playMode: true, wolfSetupVersion: 1, coreTrackersVersion: 1, playEvents: [] } });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "big-bad-wolf");
  const panel = page.locator('[data-module="big-bad-wolf"]');
  await panel.locator("details.module-card-section > summary").click();

  const inspect = async (element: import("@playwright/test").Locator, id: string) => {
    const img = element.locator("img").first();
    await expect(img).toHaveAttribute("src", new RegExp("/" + id + "-"));
    await img.evaluate(async element => { await (element as HTMLImageElement).decode(); });
    await element.screenshot({ path: info.outputPath(id + ".jpg"), type: "jpeg", quality: 82, animations: "disabled", style: ".app-footer{visibility:hidden}" });
  };
  for (const [kind, cards] of [["Dark Power", WOLF_POWERS], ["Finale", WOLF_FINALES]] as const) {
    for (const card of cards) {
      await chooseKillerCard(panel, kind, card.name);
      await inspect(panel.getByRole("region", { name: kind + " selection" }).locator(".module-revealed-hero"), card.id);
    }
  }
  for (const card of WOLF_MINORS) {
    const more = panel.getByRole("button", { name: "Add another Minor Power", exact: true });
    if (await more.isVisible()) await more.click();
    await panel.getByRole("button", { name: "Reveal " + card.name, exact: true }).click();
    const minor = panel.locator('[data-module-control="minor-power"]').filter({ hasText: card.name }).last();
    await inspect(minor, card.id);
  }

  await page.getByRole("button", { name: "Record one victim killed", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Gruesome Death", exact: true });
  await dialog.locator(".play-cause-tile--terror").click();
  for (const card of WOLF_TERRORS) {
    await searchPick(page, "Terror card", card.name);
    await inspect(dialog.locator(".play-cause-tile--terror"), card.id);
  }
  await dialog.getByRole("button", { name: "Gruesome Death", exact: true }).click();
  await expect(dialog.getByRole("region", { name: "Generated death scene" })).toContainText(archive.deathText);
  await dialog.getByRole("button", { name: "Save and exit", exact: true }).click();
  await page.getByRole("button", { name: "Latest death scene", exact: true }).click();
  await expect(dialog.getByRole("region", { name: "Generated death scene" })).toContainText(archive.deathText);
  expect(archive.calls.filter(name => name === "generate-death-scene")).toHaveLength(1);
  expect((archive.sessions[0].state.playEvents as PlayEvent[]).filter(e => e.kind === "killed")).toHaveLength(1);
});
