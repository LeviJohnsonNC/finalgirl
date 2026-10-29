import { test, expect, activeGame, userId } from "./fixtures";
import { openModule, statusPick, searchPick, undoLatestObservation } from "./play-helpers";
import { type PlayEvent } from "../../src/lib/play/events";
const selection = {
  ...activeGame.selection,
  killer: "Geppetto",
  location: "Carnival of Blood",
  filmId: "s1-carnival-of-blood",
};
const setup = {
  ...activeGame,
  selection,
  geppettoSetupVersion: 1,
  carnivalSetupVersion: 1,
  playMode: true,
};
const panel = (page: import("@playwright/test").Page) =>
  page.locator('[data-module="carnival"]');
async function resume(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "carnival");
}
async function section(page: import("@playwright/test").Page, name: string) {
  const summary = panel(page)
    .locator(".carnival-section > summary")
    .filter({ hasText: name });
  if (
    !(await summary.evaluate(
      (el) => (el.parentElement as HTMLDetailsElement).open,
    ))
  )
    await summary.click();
  if(name === "People & props") {
    for(const correction of await panel(page).locator(".carnival-actors .module-correction").all())
      if(!(await correction.evaluate(el => (el as HTMLDetailsElement).open))) await correction.locator("summary").click();
  }
}
async function log(
  page: import("@playwright/test").Page,
): Promise<PlayEvent[]> {
  return page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
}

test("starting Event initializes linked Zappo once and losing him retains the penalty after regain and reload", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...setup,
      selection: { ...selection, startingEvent: "So Much Junk" },
    },
  });
  await resume(page);
  await section(page, "People & props");
  await expect(
    panel(page).getByRole("combobox", { name: "Zappo status", exact: true }),
  ).toHaveText("With you");
  await section(page, "Item Trap encounters");
  await panel(page)
    .getByRole("button", {
      name: "Avoided using Zappo: Hidden Cobra Trap",
      exact: true,
    })
    .click();
  await expect(panel(page).locator(".carnival-warning")).toContainText(
    "Search −1 die",
  );
  await expect(
    panel(page).getByRole("combobox", { name: "Zappo status", exact: true }),
  ).toHaveText("Lost / fled");
  await statusPick(
    page,
    panel(page).getByRole("combobox", { name: "Zappo status", exact: true }),
    "With you",
  );
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "carnival");
  await expect(panel(page).locator(".carnival-warning")).toContainText(
    "Search −1 die",
  );
  expect(
    (await log(page)).filter(
      (e) => e.moduleData?.changes["trap.acid.status"] === "not-placed",
    ),
  ).toHaveLength(1);
  await section(page, "People & props");
  await panel(page)
    .locator(".carnival-actors")
    .screenshot({ path: info.outputPath("carnival-companions.png") });
});

test("older empty-log games retain unrecorded traps and characters despite a starting Event", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: { ...selection, startingEvent: "Full Moon" },
      playMode: true,
    },
  });
  await resume(page);
  await expect(
    panel(page).getByRole("button", {
      name: "Place Acid Pitfall Trap",
      exact: true,
    }),
  ).toContainText("Not recorded");
  await section(page, "People & props");
  await expect(
    panel(page).getByRole("combobox", { name: "Werewolf status", exact: true }),
  ).toHaveText("Not recorded");
  expect(
    (await log(page)).some((e) => e.moduleData?.module === "carnival"),
  ).toBe(false);
});

test("persistent trap placement survives cancellation, rounds, reload and Undo without creating casualties", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  const p = panel(page);
  await p
    .getByRole("button", { name: "Place Acid Pitfall Trap", exact: true })
    .click();
  const note = p.getByLabel("Acid Pitfall Trap space", { exact: true });
  await note.fill("Outer path by Animal Cages");
  await note.blur();
  await p
    .getByRole("button", {
      name: "Card canceled with Found Footage: Acid Pitfall Trap",
      exact: true,
    })
    .click();
  await expect(
    p.getByRole("button", { name: "View Acid Pitfall Trap", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next round", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "carnival");
  await p
    .getByRole("button", { name: "View Acid Pitfall Trap", exact: true })
    .click();
  await expect(
    p.getByLabel("Acid Pitfall Trap space", { exact: true }),
  ).toHaveValue("Outer path by Animal Cages");
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Acid Pitfall Trap status", exact: true }),
    "Not placed",
  );
  await undoLatestObservation(page);
  await expect(
    p.getByRole("button", { name: "View Acid Pitfall Trap", exact: true }),
  ).toBeVisible();
  expect((await log(page)).filter((e) => e.kind === "killed")).toHaveLength(0);
  await p
    .locator(".carnival-traps")
    .screenshot({ path: info.outputPath("carnival-traps.png") });
});

test("Event activation and character outcomes are atomic and never resurrect ended roles", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  const p = panel(page);
  await section(page, "Events");
  await p
    .getByRole("button", {
      name: 'Activate "Did you follow me here?"',
      exact: true,
    })
    .click();
  const entry = (await log(page)).at(-1)!;
  expect(entry.moduleData?.changes).toEqual({
    "event.sibling": "active",
    "person.sibling": "in-play",
  });
  await section(page, "People & props");
  await p
    .getByRole("button", { name: "Mark Sibling killed", exact: true })
    .click();
  await expect(
    p.getByRole("button", {
      name: 'Correct linked status for "Did you follow me here?"',
      exact: true,
    }),
  ).toHaveAttribute("aria-disabled", "true");
  const length = (await log(page)).length;
  await p
    .getByRole("button", {
      name: 'Correct linked status for "Did you follow me here?"',
      exact: true,
    })
    .evaluate((el) => (el as HTMLButtonElement).click());
  expect((await log(page)).length).toBe(length);
  expect((await log(page)).filter((e) => e.kind === "killed")).toHaveLength(0);
  await undoLatestObservation(page);
  await expect(
    p.getByRole("combobox", { name: "Sibling status", exact: true }),
  ).toHaveText("In play");
});

test("Werewolf has no illegal outcomes and discarding the Golf Cart ends its Event", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  const p = panel(page);
  await section(page, "Events");
  await p
    .getByRole("button", { name: "Activate Full Moon", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Activate Employee Transport", exact: true })
    .click();
  await section(page, "People & props");
  await p
    .getByRole("combobox", { name: "Werewolf status", exact: true })
    .click();
  await expect(
    page.getByRole("option", { name: "Saved", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("option", { name: "Killed", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await p
    .getByRole("button", { name: "Mark Golf Cart discarded", exact: true })
    .click();
  expect((await log(page)).at(-1)!.moduleData?.changes).toEqual({
    cart: "discarded",
    "event.cart": "ended",
  });
  await p
    .getByRole("button", {
      name: "Correct linked status for Employee Transport",
      exact: true,
    })
    .evaluate((el) => (el as HTMLButtonElement).click());
  await expect(
    p.getByRole("combobox", { name: "Golf Cart status", exact: true }),
  ).toHaveText("Discarded");
});

test("Item Traps can recur and cancellation never creates or clears an attached condition", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  const p = panel(page);
  await section(page, "Item Trap encounters");
  await p
    .getByRole("button", {
      name: "Canceled with Found Footage: Hidden Cobra Trap",
      exact: true,
    })
    .click();
  await expect(
    p.getByRole("button", { name: "Record Hidden Cobra Trap", exact: true }),
  ).toContainText("Not recorded");
  await p
    .getByRole("button", { name: "Record Hidden Cobra Trap", exact: true })
    .click();
  await expect(
    p.getByRole("button", { name: "Record Hidden Cobra Trap", exact: true }),
  ).toContainText("Attached");
  await p
    .getByRole("button", {
      name: "Clear attached effect: Hidden Cobra Trap",
      exact: true,
    })
    .click();
  await p
    .getByRole("button", { name: "Record Hidden Cobra Trap", exact: true })
    .click();
  await p
    .getByRole("button", {
      name: "Canceled with Found Footage: Hidden Cobra Trap",
      exact: true,
    })
    .click();
  await expect(
    p.getByRole("button", { name: "Record Hidden Cobra Trap", exact: true }),
  ).toContainText("Attached");
  await p
    .getByRole("button", { name: "Record Knockout Gas Trap", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Record Knockout Gas Trap", exact: true })
    .click();
  expect(
    (await log(page)).filter(
      (e) => e.moduleData?.changes.lastEncounter === "Knockout Gas Trap",
    ),
  ).toHaveLength(2);
  await p
    .locator(".carnival-item-traps")
    .screenshot({ path: info.outputPath("carnival-item-traps.png") });
});

test("failed durable writes leave UI unchanged and rapid repeated taps cannot duplicate placement", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  const p = panel(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k.startsWith("final-girl-active-game-v1:")) throw new Error("quota");
      return original.call(this, k, v);
    };
    (window as unknown as { restore: () => void }).restore = () => {
      Storage.prototype.setItem = original;
    };
  });
  await p.getByRole("button", { name: "Place Rope Trap", exact: true }).click();
  await expect(p.locator(".carnival-save-message")).toContainText(
    "could not be saved",
  );
  await expect(
    p.getByRole("button", { name: "Place Rope Trap", exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    (window as unknown as { restore: () => void }).restore(),
  );
  await p
    .getByRole("button", { name: "Place Rope Trap", exact: true })
    .evaluate((el) => {
      (el as HTMLButtonElement).click();
      (el as HTMLButtonElement).click();
    });
  expect(
    (await log(page)).filter(
      (e) => e.moduleData?.changes["trap.rope.status"] === "placed",
    ),
  ).toHaveLength(1);
});

test("Carnival death details use its hazards, rooms and people, while ordinary item finds exclude Item Traps", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  await page
    .getByRole("button", { name: "Found a weapon/item", exact: true })
    .click();
  await searchPick(page, "Moment detail", "Found Footage");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Location hazard", exact: true })
    .click();
  await searchPick(page, "Death mechanism", "Acid Pitfall Trap");
  await searchPick(page, "Death location", "Animal Cages");
  await searchPick(page, "Victim name or role", "Sibling");
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  const entries = await log(page);
  expect(entries.filter((e) => e.kind === "killed")).toHaveLength(1);
  expect(entries.at(-1)).toMatchObject({
    kind: "details",
    mechanism: "Acid Pitfall Trap",
    room: "Animal Cages",
    victim: "Sibling",
  });
});

test("module ownership, keyboard, artwork and laptop/narrow-phone layouts remain usable", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: { ...setup, selection: { ...selection, killer: "Hans" } },
  });
  await resume(page);
  const p = panel(page);
  await expect(page.locator('[data-module="hans"]')).toBeVisible();
  await expect(page.locator('[data-module="geppetto"]')).toHaveCount(0);
  expect(
    await page
      .locator(".play-module-panel")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-module"))),
  ).toEqual(["hans", "carnival"]);
  await p.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await expect(p).not.toHaveAttribute("open");
  await page.keyboard.press("Enter");
  await expect(p).toHaveAttribute("open", "");
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: width === 1366 ? 768 : 844 });
    await p.locator(":scope > summary").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const button = p.getByRole("button", {
      name: "Place Rope Trap",
      exact: true,
    });
    expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    await expect(p.locator(":scope > summary img")).toHaveJSProperty(
      "naturalWidth",
      1873,
    );
    await page.screenshot({
      path: info.outputPath(`carnival-${width}.png`),
      fullPage: false,
    });
  }
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 390, height: 844 });
  await section(page, "Events");
  const sizes = await p
    .getByRole("button")
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
  expect(sizes.every((height) => height >= 44)).toBe(true);
  await p
    .locator(".carnival-events")
    .screenshot({ path: info.outputPath("carnival-events.png") });
});

test("fresh casting marks Carnival setup and searchable owned rules contain the verified traps", async ({
  page,
  archive,
}) => {
  archive.films = ["s1-carnival-of-blood", "s1-camp-happy-trails"];
  await archive.install(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "START THE TAPE", exact: true })
    .click();
  for (const [slot, name] of [
    "Hans",
    "Carnival of Blood",
    "Laurie",
  ].entries()) {
    await page
      .getByRole("button", { name: "Choose", exact: true })
      .nth(slot)
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: new RegExp(name) })
      .click();
  }
  await page.getByRole("button", { name: "Press Play", exact: true }).click();
  await page
    .getByRole("button", { name: "Enter Play mode", exact: true })
    .click();
  await openModule(page, "carnival");
  await expect(
    panel(page).getByRole("button", { name: "Place Rope Trap", exact: true }),
  ).toContainText("Not placed");
  expect(
    await page.evaluate(
      (owner) =>
        JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
          .carnivalSetupVersion,
      userId,
    ),
  ).toBe(1);
  await page.getByRole("button", { name: "RULES", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search rules", exact: true })
    .fill("Terror Trap tokens");
  await page.getByRole("tab", { name: "Special Rules", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Terror Trap tokens stay on the board",
      exact: true,
    }),
  ).toBeVisible();
});
