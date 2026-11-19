import { activeGame, expect, test, userId } from "./fixtures";
import { openModule } from "./play-helpers";
import { newPlayEvent, summarizePlay, validPlayLog } from "../../src/lib/play/events";
import { MORT } from "../../supabase/functions/_shared/play/mort";
import { megabgconState } from "../../supabase/functions/_shared/play/megabgcon";

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

test("MegaBGCon hides retired controls and replays saved effects alongside events and Buggy undo", async ({ page, archive }, info) => {
  const moduleData = { module: "megabgcon", changes: { recorded: true } } as const;
  const upkeep = newPlayEvent({
    kind: "module", moduleData,
    megabgconAction: { kind: "upkeep", previous: "root", killer: "Hans", booth: "Van Ryder Games", result: "wet-floor" },
  });
  const lookup = newPlayEvent({
    kind: "module", moduleData,
    megabgconAction: { kind: "lookup", previous: upkeep.id, booth: "Fortunate Fowl Games" },
  });
  const swag = newPlayEvent({
    kind: "module", moduleData,
    megabgconAction: { kind: "swag", previous: lookup.id, booths: ["Hatrock Games", "Soxley", "Van Ryder Games"] },
  });
  await archive.install(page, { draft: {
    ...activeGame, selection: { ...selection, startingEvent: "SWAG Roulette" },
    playMode: true, coreTrackersVersion: 1,
    playEvents: [
      newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
      newPlayEvent({ kind: "state", field: "killerHealth", value: 12 }),
      upkeep, lookup, swag,
    ],
  } });
  if (info.project.name === "mobile") await page.setViewportSize({ width: 320, height: 568 });
  const panel = await start(page);
  await expect(panel.getByText(/Convention Floor|Record Upkeep|Record a Booth location|Undo last convention record|Last Booth location|Latest Upkeep|SWAG Roulette/i)).toHaveCount(0);
  await expect(panel.getByRole("region", { name: "Active Booth effects" }).getByText("Van Ryder Games")).toBeVisible();

  await panel.getByText("Ongoing Events", { exact: true }).click();
  const lunch = panel.getByRole("button", { name: "Lunch Time! Not recorded" });
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    Object.assign(window, { restoreConStorage: () => { Storage.prototype.setItem = write; } });
    Storage.prototype.setItem = function (name, data) {
      if (name.startsWith("final-girl-active-game-v1:")) throw Error("Write interrupted");
      write.call(this, name, data);
    };
  });
  await lunch.click();
  await expect(panel.getByRole("alert")).toContainText("could not be saved");
  await expect(lunch).toBeVisible();
  await page.evaluate(() => (window as unknown as { restoreConStorage: () => void }).restoreConStorage());
  await lunch.click();
  await panel.getByRole("button", { name: "End Action phase" }).click();
  await expect(panel.getByText("1 Action phase left")).toBeVisible();
  await panel.getByText("Medical Buggy", { exact: true }).first().click();
  await panel.getByRole("button", { name: "Medical Buggy Add when Keys are found" }).click();
  await panel.getByRole("button", { name: "Spend · Deal 2 to Killer" }).click();
  await expect(panel.getByText("Medical Buggy · Spent")).toBeVisible();
  await panel.getByRole("button", { name: "Undo Buggy hit" }).click();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(validPlayLog(saved.playEvents)).toBe(true);
  const replayed = summarizePlay(saved.playEvents);
  expect(replayed.killerHealth).toBe(12);
  expect(megabgconState(replayed.entries)).toMatchObject({
    lookup: "Fortunate Fowl Games",
    effects: { "wet-floor": "Van Ryder Games" },
    swag: [{ status: "active" }, { status: "active" }, { status: "active" }],
  });

  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(panel.getByRole("button", { name: "Wet Floor Van Ryder Games" })).toBeVisible();
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
  await panel.screenshot({ path: info.outputPath("megabgcon-play.png") });
});

test("Mort’s investigation and Finale coexist with MegaBGCon’s special victims", async ({ page, archive }) => {
  await archive.install(page, { draft: {
    ...activeGame, selection: { ...selection, killer: MORT, startingEvent: "Industry Bad Boy" },
    playMode: true, coreTrackersVersion: 1, mortSetupVersion: 1, playEvents: [],
  } });
  const panel = await start(page);
  const starter = panel.locator(".con-starting");
  await expect(starter).toContainText("Industry Bad Boy");
  await openModule(page, "mort");
  const mort = page.getByRole("group", { name: "Mort investigation" });
  await choose(page, "Physically drawn suspect token", "Hans");
  await mort.getByRole("button", { name: "Record draw", exact: true }).click();

  await starter.getByRole("button", { name: "Record arrival" }).click();
  await choose(page, "Booth drawn", "Soxley");
  await choose(page, "Role", "Friend");
  await starter.locator(".con-editor").getByRole("button", { name: "Record arrival" }).click();
  await expect(starter).toHaveCount(0);
  await panel.getByText("Special Victims", { exact: true }).click();
  await expect(panel.getByText("Placed at Soxley")).toBeVisible();
  await expect(mort.locator("#mort-suspect-bag")).toContainText("Hans is the Active Killer");

  await mort.getByRole("button", { name: "Return token", exact: true }).click();
  const bloodlust = page.getByRole("button", { name: "Set Bloodlust", exact: true });
  await bloodlust.click();
  await page.getByLabel("Bloodlust value", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Set", exact: true }).click();
  await expect(bloodlust).toHaveText("1");
  await expect(mort.getByText(/Attack \d+ · Movement \d+/)).toHaveCount(0);
  await page.getByRole("region", { name: "Remember this" }).getByRole("button", { name: "Finale", exact: true }).click();
  await choose(page, "Confirmed disguise", "Hans");
  await choose(page, "Dark Power", "Anonymous Terror");
  await page.getByRole("checkbox", { name: "The Terror deck is exhausted and I confirmed the disguise" }).check();
  await page.getByRole("button", { name: "Reveal Mort", exact: true }).click();
  await expect(mort.getByRole("heading", { name: "Mort as Hans" })).toBeVisible();
  await expect(panel.getByText("Placed at Soxley")).toBeVisible();
  await expect(panel.getByText(/Booth draws ended|Record Upkeep|SWAG Roulette/i)).toHaveCount(0);
});
