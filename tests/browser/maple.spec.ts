import { test, expect, activeGame, userId, installTestAudio } from "./fixtures";
import {
  openModule,
  statusPick,
  searchPick,
  openHistory,
} from "./play-helpers";
import { summarizePlay, type PlayEvent } from "../../src/lib/play/events";
import { moduleState } from "../../src/lib/play/modules";
import type { Page } from "@playwright/test";
const panel = (page: Page) => page.locator('[data-module="maple"]');
const draft = (killer = "Hans", fresh = true) => ({
  ...activeGame,
  playMode: true,
  ...(fresh ? { mapleSetupVersion: 1 } : {}),
  selection: {
    ...activeGame.selection,
    killer,
    location: "Maple Lane",
    startingEvent: null,
  },
});
async function resume(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "maple");
}
const log = (page: Page): Promise<PlayEvent[]> =>
  page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
const state = async (page: Page) =>
  moduleState(summarizePlay(await log(page)).entries, "maple");
async function pick(page: Page, label: string, value: string) {
  await statusPick(
    page,
    panel(page).getByRole("combobox", { name: label, exact: true }),
    value,
  );
}

for (const [killer, id] of [
  ["Billy the Bear", "billy"],
  ["Hans", "hans"],
  ["Geppetto", "geppetto"],
  ["Dr. Fright", "fright"],
]) {
  test(`Maple Lane with ${killer}: owner order, searches, linked people, Undo and reload`, async ({
    page,
    archive,
  }, info) => {
    await archive.install(page, { draft: draft(killer) });
    await resume(page);
    await expect(page.locator(".play-module-panel").first()).toHaveAttribute(
      "data-module",
      id,
    );
    await expect(panel(page)).toContainText("0/12 recorded Houses searched");
    await panel(page)
      .getByRole("button", {
        name: "Mark NW · West house searched",
        exact: true,
      })
      .click();
    await expect(panel(page).locator('[data-house="nw-west"]')).toHaveAttribute(
      "data-searched",
      "true",
    );
    await panel(page)
      .getByRole("button", {
        name: "Mark NW · West house unsearched",
        exact: true,
      })
      .click();
    expect((await state(page))["house.nw-west"]).toBe(false);
    await panel(page)
      .getByRole("button", {
        name: "Mark NW · West house searched",
        exact: true,
      })
      .click();
    const before = await log(page);
    await panel(page)
      .getByText("House & Convince rules", { exact: true })
      .click();
    expect(await log(page)).toEqual(before);
    await panel(page)
      .getByRole("button", { name: "Add both Smalleys", exact: true })
      .click();
    await panel(page)
      .getByRole("button", { name: "Mark Smalley 1 saved", exact: true })
      .click();
    await panel(page)
      .getByRole("button", { name: "Mark Smalley 2 killed", exact: true })
      .click();
    expect(await state(page)).toMatchObject({
      "person.smalley-1": "saved",
      "person.smalley-2": "killed",
      "event.smalleys": "ended",
    });
    expect(summarizePlay(await log(page))).toMatchObject({
      saved: 0,
      killed: 0,
    });
    await openHistory(page);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    expect(await state(page)).toMatchObject({
      "person.smalley-2": "in-play",
      "event.smalleys": "active",
    });
    await page.reload();
    await resume(page);
    expect((await state(page))["house.nw-west"]).toBe(true);
    await panel(page).locator(".maple-people").scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`maple-${id}-people.png`) });
  });
}
test("explicit fire, exit, Cop Car and Item props survive offline reload; ending a card never clears the board", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  await archive.install(page, { draft: draft() });
  await resume(page);
  await pick(page, "Burning House", "The Boyfriend’s House");
  await panel(page)
    .getByRole("button", { name: "Record fire", exact: true })
    .click();
  await expect(
    panel(page).getByRole("button", {
      name: "Mark The Boyfriend’s House searched",
      exact: true,
    }),
  ).toBeDisabled();
  expect((await state(page))["house.ne-boyfriend"]).toBe(false);
  await panel(page)
    .getByRole("button", { name: "Block North exit", exact: true })
    .click();
  await pick(page, "Cop Car starting Exit", "west Exit");
  await panel(page)
    .getByRole("button", { name: "Place Cop Car", exact: true })
    .click();
  for (let step = 1; step <= 4; step++) {
    await panel(page)
      .getByRole("button", { name: "Advance Cop Car one space", exact: true })
      .click();
    await expect.poll(async () => (await state(page))["cop.step"]).toBe(step);
  }
  expect(await state(page)).toMatchObject({
    "cop.status": "exited",
    "event.kopp": "ended",
    "exit.north": true,
  });
  await pick(page, "Fireworks Street", "Intersection");
  await panel(page)
    .getByRole("button", { name: "Record Fireworks position", exact: true })
    .click();
  await panel(page)
    .getByRole("button", { name: "Killer reached Fireworks", exact: true })
    .click();
  await pick(page, "Bicycle Street", "South Street");
  await panel(page)
    .getByRole("button", { name: "Record Bicycle position", exact: true })
    .click();
  await pick(page, "Booby Trap House", "The Smalley’s House");
  await panel(page)
    .getByRole("button", { name: "Place Booby Trap", exact: true })
    .click();
  await panel(page)
    .getByRole("button", {
      name: "Trigger trap: The Smalley’s House",
      exact: true,
    })
    .click();
  expect((await state(page))["trap.sw-smalley"]).toBe("triggered");
  expect((await state(page))["house.sw-smalley"]).toBe(false);
  await page.screenshot({ path: info.outputPath("maple-spent-props.png") });
  archive.failWrites = true;
  await panel(page)
    .getByRole("button", { name: "Activate Friendly Neighbors", exact: true })
    .click();
  await page.reload();
  await resume(page);
  expect(await state(page)).toMatchObject({
    fire: "ne-boyfriend",
    fireworks: "spent",
    bicycle: "south-inner",
    "trap.sw-smalley": "triggered",
    "event.neighbors": "active",
  });
  expect(summarizePlay(await log(page))).toMatchObject({ saved: 0, killed: 0 });
  archive.failWrites = false;
});

test("legacy unknowns, rejected local save, retry and corrections retain accurate state", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: draft("Hans", false) });
  await resume(page);
  await expect(panel(page)).toContainText("House searches not recorded");
  await expect(panel(page)).toContainText("Exit status not recorded");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("final-girl-active-game-v1:"))
        throw new Error("quota");
      return original.call(this, key, value);
    };
    (window as unknown as { restoreStorage: () => void }).restoreStorage =
      () => {
        Storage.prototype.setItem = original;
      };
  });
  await panel(page)
    .getByRole("button", { name: "Mark NW · West house searched", exact: true })
    .click();
  await expect(panel(page).getByRole("status")).toContainText(
    "could not be saved",
  );
  expect((await state(page))["house.nw-west"]).toBeUndefined();
  await page.evaluate(() =>
    (window as unknown as { restoreStorage: () => void }).restoreStorage(),
  );
  await panel(page)
    .getByRole("button", { name: "Mark NW · West house searched", exact: true })
    .click();
  await expect
    .poll(async () => (await state(page))["house.nw-west"])
    .toBe(true);
  await panel(page)
    .locator("summary")
    .filter({ hasText: "Search corrections" })
    .first()
    .click();
  await pick(page, "NW · West house search status", "Not recorded");
  expect((await state(page))["house.nw-west"]).toBeUndefined();
});

test("House corrections retain unknown, fire and Undo semantics and Roadblocks use readable names", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: draft("Dr. Fright", false) });
  await resume(page);
  const mark = () =>
    panel(page).getByRole("button", {
      name: "Mark The Boyfriend’s House searched",
      exact: true,
    });
  const unmark = () =>
    panel(page).getByRole("button", {
      name: "Mark The Boyfriend’s House unsearched",
      exact: true,
    });
  expect((await state(page))["house.ne-boyfriend"]).toBeUndefined();
  await mark().click();
  await pick(page, "Burning House", "The Boyfriend’s House");
  await panel(page)
    .getByRole("button", { name: "Record fire", exact: true })
    .click();
  await unmark().click();
  expect(await state(page)).toMatchObject({
    "house.ne-boyfriend": false,
    fire: "ne-boyfriend",
  });
  await expect(mark()).toBeDisabled();
  await openHistory(page);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  expect(await state(page)).toMatchObject({
    "house.ne-boyfriend": true,
    fire: "ne-boyfriend",
  });
  await page.reload();
  await resume(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.assign(window, {
      restoreMapleStorage: () => {
        Storage.prototype.setItem = original;
      },
    });
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("final-girl-active-game-v1:")) throw new Error("Full");
      return original.call(this, key, value);
    };
  });
  await unmark().click();
  await expect(panel(page).getByRole("status")).toContainText(
    "could not be saved",
  );
  await expect(unmark()).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() =>
    (
      window as unknown as { restoreMapleStorage: () => void }
    ).restoreMapleStorage(),
  );
  await unmark().click();
  expect((await state(page))["house.ne-boyfriend"]).toBe(false);
  for (const direction of ["North", "East", "South", "West"])
    await expect(
      panel(page).getByRole("button", {
        name: `Block ${direction} exit`,
        exact: true,
      }),
    ).toHaveText(`${direction} · Unknown`);
  expect(summarizePlay(await log(page))).toMatchObject({ saved: 0, killed: 0 });
});

test("loaded artwork, labels and controls fit the five required viewports", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  await archive.install(page, { draft: draft() });
  await resume(page);
  for (const [width, height] of [
    [1280, 640],
    [1366, 768],
    [1440, 900],
    [320, 568],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await panel(page).locator(".maple-quadrants").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const images = await panel(page)
      .locator("svg image")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
    expect(images.length).toBeGreaterThan(12);
    expect(images.every(Boolean)).toBe(true);
    const clipped = await panel(page)
      .locator(".play-tile-caption strong")
      .evaluateAll((nodes) =>
        nodes
          .filter((n) => n.scrollWidth > n.clientWidth + 1)
          .map((n) => n.textContent),
      );
    expect(clipped).toEqual([]);
    await panel(page).screenshot({
      path: info.outputPath(`maple-expanded-${width}x${height}.png`),
    });
    await panel(page).locator(":scope>summary").click();
    await panel(page).screenshot({
      path: info.outputPath(`maple-collapsed-${width}x${height}.png`),
    });
    await openModule(page, "maple");
  }
});

test("Rules search, mixed death save/cache/narration and later state preserve the historical scene", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  archive.films.push("s1-maple-lane");
  await archive.install(page, { draft: draft("Dr. Fright") });
  await installTestAudio(page);
  await resume(page);
  await pick(page, "Burning House", "The Boyfriend’s House");
  await panel(page)
    .getByRole("button", { name: "Record fire", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const death = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  await death.getByRole("button", { name: "Event", exact: true }).click();
  await searchPick(page, "Death location", "The Boyfriend’s House");
  await searchPick(page, "Death event card", "Fire!");
  await death
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    death.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText(archive.deathText);
  await death
    .getByRole("button", { name: "Narrate death scene", exact: true })
    .click();
  await expect(
    death.getByRole("button", { name: "Stop death narration", exact: true }),
  ).toBeVisible();
  await death
    .getByRole("button", { name: "Stop death narration", exact: true })
    .click();
  await death.screenshot({ path: info.outputPath("maple-death-reading.png") });
  await death
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await panel(page)
    .getByText("Rules & corrections: Fire", { exact: true })
    .click();
  await panel(page)
    .getByRole("button", { name: "Correct: no fire token", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(
    death.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText(archive.deathText);
  expect(
    archive.calls.filter((n) => n === "generate-death-scene"),
  ).toHaveLength(1);
  await death
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await page
    .locator("footer")
    .getByRole("button", { name: "RULES", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search rules", exact: true })
    .fill("Convince and occupied Houses");
  await page.getByRole("tab", { name: "Special Rules", exact: true }).click();
  await expect(page.locator("#location-maple-lane-rules")).toContainText(
    "Convince and occupied Houses",
  );
  await page.screenshot({ path: info.outputPath("maple-rules.png") });
});
