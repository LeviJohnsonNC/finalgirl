import { activeGame, expect, test, userId } from "./fixtures";
import { openModule } from "./play-helpers";
import { newPlayEvent, summarizePlay, validPlayLog } from "../../src/lib/play/events";
import { MORT } from "../../supabase/functions/_shared/play/mort";

const key = `final-girl-active-game-v1:${userId}`;
const selection = {
  ...activeGame.selection,
  filmId: "s4-shriek", location: "MegaBGCon", killer: "Hans", finalGirl: "Adrianne", startingEvent: null,
};
async function choose(page: import("@playwright/test").Page, field: string, option: string) {
  await page.getByRole("combobox", { name: field, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
async function start(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "megabgcon");
  return page.locator('[data-module="megabgcon"]');
}

test("MegaBGCon supports fast Upkeep, save retry, persistent booth effects, and linked Buggy undo", async ({ page, archive }, info) => {
  await archive.install(page, { draft: {
    ...activeGame, selection, playMode: true, coreTrackersVersion: 1,
    playEvents: [
      newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
      newPlayEvent({ kind: "state", field: "killerHealth", value: 12 }),
    ],
  } });
  if (info.project.name === "mobile") await page.setViewportSize({ width: 320, height: 568 });
  const panel = await start(page);
  await panel.getByRole("button", { name: "Record Upkeep" }).click();
  await choose(page, "Booth drawn", "Hatrock Games");
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    Object.assign(window, { restoreConStorage: () => { Storage.prototype.setItem = write; } });
    Storage.prototype.setItem = function (name, data) {
      if (name.startsWith("final-girl-active-game-v1:")) throw Error("Write interrupted");
      write.call(this, name, data);
    };
  });
  await panel.getByRole("button", { name: "1–3 · Victim arrived" }).click();
  await expect(panel.getByRole("alert")).toContainText("could not be saved");
  await expect(panel.getByText("Latest Upkeep")).toHaveCount(0);
  await page.evaluate(() => (window as unknown as { restoreConStorage: () => void }).restoreConStorage());
  await panel.getByRole("button", { name: "1–3 · Victim arrived" }).click();
  await expect(panel.getByText("New attendee · Hatrock Games")).toBeVisible();
  await panel.getByRole("button", { name: "Record Upkeep" }).click();
  await choose(page, "Booth drawn", "Van Ryder Games");
  await panel.getByRole("button", { name: "4–6 · Booth Event" }).click();
  await choose(page, "Booth Event", "Wet Floor");
  await panel.getByRole("button", { name: "Record result" }).click();
  await expect(panel.getByRole("region", { name: "Active Booth effects" }).getByText("Van Ryder Games")).toBeVisible();

  await panel.getByText("Ongoing Events", { exact: true }).click();
  await panel.getByRole("button", { name: "Lunch Time! Not recorded" }).click();
  await panel.getByRole("button", { name: "End Action phase" }).click();
  await expect(panel.getByText("1 Action phase left")).toBeVisible();
  await panel.getByText("Medical Buggy", { exact: true }).first().click();
  await panel.getByRole("button", { name: "Medical Buggy Add when Keys are found" }).click();
  await panel.getByRole("button", { name: "Spend · Deal 2 to Killer" }).click();
  await expect(panel.getByText("Medical Buggy · Spent")).toBeVisible();
  await panel.getByRole("button", { name: "Undo Buggy hit" }).click();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(validPlayLog(saved.playEvents)).toBe(true);
  expect(summarizePlay(saved.playEvents).killerHealth).toBe(12);

  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(panel.getByText("Wet Floor · Van Ryder Games")).toBeVisible();
  await expect(panel.getByText("Medical Buggy · In play")).toBeVisible();
  await panel.getByText("Special Victims", { exact: true }).click();
  await panel.getByRole("button", { name: "Add Game Designer" }).click();
  await choose(page, "Booth drawn", "Hatrock Games");
  await panel.getByRole("button", { name: "Record arrival", exact: true }).click();
  await panel.getByRole("button", { name: "Mark Game Designer saved" }).click();
  await panel.getByRole("button", { name: "Add Annoying Reporter" }).click();
  await panel.getByRole("button", { name: "Record arrival", exact: true }).click();
  await panel.getByRole("button", { name: "Mark Annoying Reporter killed" }).click();
  const death = page.getByRole("dialog", { name: "Gruesome Death" });
  await expect(death).toContainText("Annoying Reporter");
  await death.getByRole("button", { name: "Save and exit" }).click();
  for (const picture of await panel.locator("img:visible").all()) {
    await picture.scrollIntoViewIfNeeded();
    await expect(picture).toHaveJSProperty("complete", true);
    expect(await picture.evaluate(im => (im as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  const widths = info.project.name === "mobile" ? [390, 320] : [1366, 1440, 1280];
  for (const width of widths) {
    const heights: Record<number, number> = { 320: 568, 390: 844, 1280: 640, 1366: 768, 1440: 900 };
    await page.setViewportSize({ width, height: heights[width] });
    const bounds = await panel.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    for (const child of await panel.locator(".module-control-tile:visible, .con-editor:visible").all()) {
      const tile = await child.boundingBox();
      expect(tile!.x).toBeGreaterThanOrEqual(bounds!.x - 1);
      expect(tile!.x + tile!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
    }
  }
  await panel.screenshot({ path: info.outputPath("convention-floor.png") });
});

test("Mort shares one physical Suspect draw across three location records and closes Upkeep on reveal", async ({ page, archive }) => {
  await archive.install(page, { draft: {
    ...activeGame, selection: { ...selection, killer: MORT, startingEvent: "Industry Bad Boy" },
    playMode: true, coreTrackersVersion: 1, mortSetupVersion: 1, playEvents: [],
  } });
  const panel = await start(page);
  await expect(panel.locator(".con-starting")).toContainText("Industry Bad Boy");
  await panel.getByRole("button", { name: "Record a Booth location" }).click();
  await panel.getByText("For cards with Killer effects").click();
  await panel.getByRole("link", { name: "Suspect bag draw" }).click();
  await choose(page, "Physically drawn suspect token", "Hans");
  await page.getByRole("button", { name: "Record draw", exact: true }).click();

  for (const booth of ["Soxley", "Hatrock Games", "Van Ryder Games"]) {
    if (booth !== "Soxley") await panel.getByRole("button", { name: "Record a Booth location" }).click();
    await choose(page, "Booth drawn", booth);
    await panel.getByRole("button", { name: "Record location", exact: true }).click();
  }
  await expect(page.locator("#mort-suspect-bag")).toContainText("Hans is the Active Killer");
  await expect(panel.getByRole("button", { name: "Record Upkeep" })).toBeVisible();
  await page.getByRole("button", { name: "Return token", exact: true }).click();
  await page.getByRole("region", { name: "Remember this" }).getByRole("button", { name: "Finale", exact: true }).click();
  await choose(page, "Confirmed disguise", "Hans");
  await choose(page, "Dark Power", "Anonymous Terror");
  await page.getByRole("checkbox", { name: "The Terror deck is exhausted and I confirmed the disguise" }).check();
  await page.getByRole("button", { name: "Reveal Mort", exact: true }).click();
  await expect(panel.getByText("Booth draws ended · Finale in play")).toBeVisible();
  await expect(panel.getByRole("button", { name: "Record Upkeep" })).toHaveCount(0);
});
