import { test, expect, activeGame } from "./fixtures";
import { searchPick, openHistory, saveResultOnly } from "./play-helpers";
import type { Page } from "@playwright/test";

async function resume(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}
async function characterInfo(page: Page, name = "Laurie", expand = true) {
  await page
    .getByRole("button", { name: `View ${name} info`, exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  if (expand) {
    await dialog.locator(".girl-ability > summary").click();
    await dialog.locator(".girl-personal-item > summary").click();
  }
  return dialog;
}

test("Play keeps character facts in compact info without card viewers or gameplay changes", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await expect(page.locator(".girl-play-file")).toHaveCount(0);
  const dialog = await characterInfo(page, "Laurie", false);
  await dialog.evaluate((el) =>
    Promise.all(el.getAnimations().map((animation) => animation.finished)),
  );
  const backstory = dialog.getByRole("region", { name: "Laurie backstory" });
  await expect(backstory.getByText(/Laurie Carpenter was born/)).toBeVisible();
  await expect(dialog.locator(".girl-ability")).not.toHaveAttribute("open", "");
  await expect(dialog.locator(".girl-personal-item")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(
    dialog.getByText(
      "When you are in the same space as an Enemy and inflict damage, deal 1 additional damage.",
    ),
  ).not.toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Unlock personal item" }),
  ).not.toBeVisible();
  expect(
    await backstory.evaluate((el) =>
      Boolean(
        el.compareDocumentPosition(document.querySelector(".girl-reference")!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("backstory-first.png"),
    animations: "disabled",
  });
  const ability = dialog.locator(".girl-ability > summary");
  await ability.focus();
  await ability.press("Enter");
  await expect(dialog.locator(".girl-ability")).toHaveAttribute("open", "");
  await expect(dialog.locator(".girl-personal-item")).not.toHaveAttribute(
    "open",
    "",
  );
  const itemPanel = dialog.locator(".girl-personal-item > summary");
  await itemPanel.focus();
  await itemPanel.press("Space");
  await expect(
    dialog.getByText("5 starting health", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      "When you are in the same space as an Enemy and inflict damage, deal 1 additional damage.",
    ),
  ).toBeVisible();
  await expect(dialog.getByText("Locked", { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("button", {
      name: /starting side|ultimate side|inspect|card/i,
    }),
  ).toHaveCount(0);
  await expect(dialog.locator("img")).toHaveCount(1); // Existing portrait only.
  expect(archive.itemReads).toEqual([]);
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 768 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect
      .poll(() =>
        dialog.evaluate((el) => {
          const box = el.getBoundingClientRect();
          return (
            box.x >= 0 &&
            box.y >= 0 &&
            box.right <= innerWidth &&
            box.bottom <= innerHeight
          );
        }),
      )
      .toBe(true);
    await dialog
      .getByRole("button", { name: "Unlock personal item" })
      .scrollIntoViewIfNeeded();
    await expect(
      dialog.getByRole("button", { name: "Unlock personal item" }),
    ).toBeInViewport();
    await page.screenshot({
      path: info.outputPath(`character-info-${width}.png`),
    });
  }
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.screenshot({
    path: info.outputPath("play-character-action.png"),
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Ultimate unlocked", exact: true })
    .click();
  await characterInfo(page);
  await expect(
    dialog.getByText("Recorded this game", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline", exact: true }),
  ).not.toContainText("Private test reference");
  expect(archive.itemReads).toEqual([]);
  expect(archive.calls).toEqual([]);
});

test("confirmed unlock updates Play suggestions; relocking persists without deleting recorded finds", async ({
  page,
  archive,
}, info) => {
  archive.holdUnlock = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  const dialog = await characterInfo(page);
  await dialog.getByRole("button", { name: "Unlock personal item" }).click();
  await expect(page.getByRole("alertdialog")).toContainText(
    "Unlock Laurie’s personal item?",
  );
  expect(archive.itemReads).toEqual([]);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(archive.itemReads).toEqual([]);
  await dialog.getByRole("button", { name: "Unlock personal item" }).click();
  await page.getByRole("button", { name: "Confirm unlock" }).click();
  await expect.poll(() => Boolean(archive.releaseUnlock)).toBe(true);
  await expect(dialog.getByText("Locked", { exact: true })).toBeVisible();
  expect(archive.itemReads).toEqual([]);
  archive.holdUnlock = false;
  archive.releaseUnlock!();
  await expect(
    dialog.getByRole("heading", { name: "Private test reference" }),
  ).toBeVisible();
  await expect(dialog.getByText(/Available in Play for Laurie/)).toBeVisible();
  await page.screenshot({
    path: info.outputPath("personal-item-unlocked.png"),
  });
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline", exact: true }),
  ).not.toContainText("Private test reference");
  await page
    .getByRole("button", { name: "Found a weapon/item", exact: true })
    .click();
  await searchPick(page, "Moment detail", "Private test reference");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await characterInfo(page);
  await dialog.getByRole("button", { name: "Lock item again" }).click();
  await expect(dialog.getByText("Locked", { exact: true })).toBeVisible();
  await expect.poll(() => archive.unlocks.Laurie).toBe(false);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await characterInfo(page);
  await expect(dialog.getByText("Locked", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline", exact: true }),
  ).toContainText("Private test reference");
  await page
    .getByRole("button", { name: "Found a weapon/item", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Moment detail", exact: true })
    .click();
  await expect(
    page.getByRole("option", { name: "Private test reference", exact: true }),
  ).toHaveCount(0);
  expect(archive.calls).toEqual([]);
});

test("Collection shares portrait, facts and backstory; failed unlock loading stays concealed", async ({
  page,
  archive,
}, info) => {
  archive.failUnlocks = true;
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  const dialog = await characterInfo(page);
  await expect(dialog.getByText("Locked", { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Unlock personal item" }),
  ).toBeDisabled();
  await expect(
    dialog.getByText(
      "Your unlocks could not be reached. Secret items stay hidden.",
    ),
  ).toBeVisible();
  await expect(
    dialog.locator(".girl-backstory").getByText(/Laurie Carpenter was born/),
  ).toBeVisible();
  await expect(dialog.locator(".girl-backstory summary")).toHaveCount(0);
  const image = dialog.getByRole("img", { name: "Laurie", exact: true });
  await expect
    .poll(() =>
      image.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0),
    )
    .toBe(true);
  await page.screenshot({
    path: info.outputPath("character-info-collection.png"),
  });
  archive.failUnlocks = false;
  await dialog.getByRole("button", { name: "Retry sync" }).click();
  await expect(
    dialog.getByRole("button", { name: "Unlock personal item" }),
  ).toBeEnabled();
  expect(archive.itemReads).toEqual([]);
  expect(archive.calls).toEqual([]);
});

test("existing unlock follows the character across locations without revealing other characters’ items", async ({
  page,
  archive,
}) => {
  archive.unlocks = { Laurie: true, Reiko: true };
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: { ...activeGame.selection, location: "Buddyland" },
      playMode: true,
    },
  });
  await resume(page);
  await page
    .getByRole("button", { name: "Found a weapon/item", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Moment detail", exact: true })
    .click();
  await expect(
    page.getByRole("option", { name: "Private test reference", exact: true }),
  ).toBeVisible();
  expect(archive.itemReads.length).toBeGreaterThan(0);
  expect(archive.itemReads.every((name) => name === "Laurie")).toBe(true);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await characterInfo(page);
  await expect(
    page.getByRole("dialog").getByText("Unlocked", { exact: true }),
  ).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test("retrying item details also refreshes Play suggestions", async ({
  page,
  archive,
}) => {
  archive.unlocks.Laurie = true;
  let failed = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await page.route("**/rpc/get_final_girl_item", (route) =>
    route.fulfill({
      status: failed ? 503 : 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(
        failed
          ? { message: "Unavailable" }
          : {
              girl: "Laurie",
              name: "Private test reference",
              effect: "Synthetic effect.",
            },
      ),
    }),
  );
  await resume(page);
  const dialog = await characterInfo(page);
  await expect(dialog.getByRole("alert")).toContainText(
    "The item reference could not be reached.",
  );
  failed = false;
  await dialog.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "Private test reference" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByRole("button", { name: "Found a weapon/item", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Moment detail", exact: true })
    .click();
  await expect(
    page.getByRole("option", { name: "Private test reference", exact: true }),
  ).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test("guests can read character facts without exposing or saving an item unlock", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    signedIn: false,
    draft: { ...activeGame, playMode: true },
  });
  await resume(page);
  const dialog = await characterInfo(page);
  await expect(
    dialog.getByText("5 starting health", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByText("Sign in to save your unlocks.")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Unlock personal item" }),
  ).toHaveCount(0);
  expect(archive.itemReads).toEqual([]);
  expect(archive.calls).toEqual([]);
});

test("Kate’s manual Ultimate preserves current health and allows the correct outcome maximum", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: {
        ...activeGame.selection,
        finalGirl: "Kate",
        finalGirlStartingHealth: 4,
      },
      playMode: true,
    },
  });
  await resume(page);
  await page
    .getByRole("button", { name: "Track Final Girl health", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ultimate unlocked", exact: true })
    .click();
  const dialog = await characterInfo(page, "Kate");
  await expect(
    dialog.getByText("4 starting health · 7 with Ultimate", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Recorded this game", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Set Final Girl health", exact: true }),
  ).toContainText("4");
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await expect(
    page.getByText("Final Girl health (0–7)", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Final Girl Health", { exact: true }).fill("7");
  await expect(
    page.getByLabel("Final Girl Health", { exact: true }),
  ).toHaveValue("7");
  await saveResultOnly(page);
  await expect.poll(() => archive.history[0]?.final_girl_health).toBe(7);
  expect(archive.history[0]?.final_girl_max_health).toBe(7);
  expect(archive.itemReads).toEqual([]);
  expect(archive.calls).toEqual([]);
});

test("an unlocked character without a supplied item gets an honest unavailable state", async ({
  page,
  archive,
}) => {
  archive.unlocks.Laurie = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await page.route("**/rpc/get_final_girl_item", (route) =>
    route.fulfill({
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: "null",
    }),
  );
  await resume(page);
  const dialog = await characterInfo(page);
  await expect(
    dialog.getByText("Unlocked. Item details aren’t available yet."),
  ).toBeVisible();
  await expect(dialog.getByText(/Available in Play/)).toHaveCount(0);
  await expect(
    dialog.getByRole("button", { name: "Lock item again" }),
  ).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test("casting opens the same compact details and returns to a laptop layout without scrolling", async ({
  page,
  archive,
}, info) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await archive.install(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "START THE TAPE", exact: true })
    .click();
  for (const [slot, name] of [
    "Hans",
    "Camp Happy Trails",
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
  const dialog = await characterInfo(page, "Laurie", false);
  await expect(
    dialog.getByText("5 starting health", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.locator(".girl-backstory").getByText(/Laurie Carpenter was born/),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("character-info-casting.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollHeight - innerHeight),
    )
    .toBeLessThanOrEqual(1);
  await page.screenshot({
    path: info.outputPath("casting-after-character-info.png"),
    animations: "disabled",
  });
  expect(archive.itemReads).toEqual([]);
  expect(archive.calls).toEqual([]);
});

test("long character and item text stays readable inside a small dialog", async ({
  page,
  archive,
}, info) => {
  archive.unlocks.Janelle = true;
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: {
        ...activeGame.selection,
        finalGirl: "Janelle",
        finalGirlStartingHealth: 5,
      },
      playMode: true,
    },
  });
  await page.route("**/rpc/get_final_girl_item", (route) =>
    route.fulfill({
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({
        girl: "Janelle",
        name: "Private test reference",
        effect: "Synthetic item effect. ".repeat(80),
      }),
    }),
  );
  await page.setViewportSize({ width: 320, height: 600 });
  await resume(page);
  const dialog = await characterInfo(page, "Janelle");
  await expect(
    dialog.getByRole("heading", { name: "Private test reference" }),
  ).toBeVisible();
  await dialog
    .getByText("5 starting health", { exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    dialog.getByText("5 starting health", { exact: true }),
  ).toBeInViewport();
  const lock = dialog.getByRole("button", { name: "Lock item again" });
  await lock.scrollIntoViewIfNeeded();
  await expect(lock).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("long-item-small-dialog.png"),
    animations: "disabled",
  });
  await lock.click();
  await expect(dialog.getByText("Locked", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "View Janelle info", exact: true }),
  ).toBeFocused();
  expect(archive.calls).toEqual([]);
});
