import { searchPick, openHistory } from "./play-helpers";
import { test, expect, activeGame, userId } from "./fixtures";
const storageKey = `final-girl-active-game-v1:${userId}`;
async function resume(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}

test("optional observations preserve zero, survive reload, and reach the ending", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await expect(
    page.getByRole("button", { name: "Track Final Girl health", exact: true }),
  ).toBeVisible();
  for (const [label, value] of [
    ["Final Girl health", "5"],
    ["Horror", "0"],
    ["Bloodlust", "3"],
  ]) {
    await page
      .getByRole("button", { name: `Track ${label}`, exact: true })
      .click();
    await page.getByLabel(`${label} value`, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Set", exact: true }).click();
  }
  await page
    .getByRole("button", { name: "Decrease Final Girl health", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Stop tracking Bloodlust", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Decrease Horror", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Found a weapon or key item", exact: true })
    .click();
  await searchPick(page, "Moment detail", "Axe from the cabins");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Set Horror", exact: true }),
  ).toHaveText("0");
  await expect(
    page.getByRole("button", { name: "Set Final Girl health", exact: true }),
  ).toHaveText("4");
  await expect(
    page.getByRole("button", { name: "Track Bloodlust", exact: true }),
  ).toBeVisible();
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline" }),
  ).toContainText("Axe from the cabins");
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await expect(
    page.getByLabel("Final Horror Level", { exact: true }),
  ).toHaveValue("0");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(
      () =>
        archive.generationRequests.find((r) => r.name === "generate-ending")
          ?.body.finalHorrorLevel,
    )
    .toBe(0);
  const request = archive.generationRequests.find(
    (r) => r.name === "generate-ending",
  )!;
  expect(request.body.finalGirlHealth).toBe(4);
  expect(request.body.playSummary).toContain("Axe from the cabins");
  expect(request.body.weaponUsed).toBeUndefined();
});

test("stopping Horror tracking keeps it unrecorded through the ending", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await page.getByRole("button", { name: "Track Horror", exact: true }).click();
  await page.getByLabel("Horror value", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Set", exact: true }).click();
  await page
    .getByRole("button", { name: "Stop tracking Horror", exact: true })
    .click();
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await expect(
    page.getByLabel("Final Horror Level", { exact: true }),
  ).toHaveValue("");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(
    page.getByLabel("Final Horror Level", { exact: true }),
  ).toHaveValue("");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() =>
      archive.generationRequests.some((r) => r.name === "generate-ending"),
    )
    .toBe(true);
  expect(
    archive.generationRequests.find((r) => r.name === "generate-ending")!.body,
  ).not.toHaveProperty("finalHorrorLevel");
});

test("cause-first modal preserves separate death drafts and discards hidden facts", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      selection: {
        ...activeGame.selection,
        killer: "The Organism",
        location: "Station 2891",
      },
    },
  });
  await resume(page);
  await expect(page.getByRole("region", { name: "Game timeline" })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const modal = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  await expect(modal).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Death location", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Terror card", exact: true }).click();
  await searchPick(page, "Terror card", "The generator is out.");
  await expect(modal).not.toContainText(
    "Frostbite remains through the next Upkeep",
  );
  await expect(modal).not.toContainText("Source:");
  await page
    .getByRole("button", { name: "Killer attack", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Terror card", exact: true }),
  ).toHaveCount(0);
  await searchPick(page, "Death location", "Kitchen");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(modal).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Location hazard", exact: true })
    .click();
  await searchPick(page, "Death mechanism", "Frostbite");
  await searchPick(page, "Death location", "Lab");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Death location", exact: true }),
  ).toHaveText("Lab");
  await expect(
    page.getByRole("combobox", { name: "Death mechanism", exact: true }),
  ).toHaveText("Frostbite");
  await page.keyboard.press("Escape");
  await openHistory(page);
  await page
    .getByRole("region", { name: "Game timeline" })
    .locator("li")
    .filter({ hasText: "at Kitchen" })
    .getByRole("button", { name: "Death details", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Killer attack", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("combobox", { name: "Death location", exact: true }),
  ).toHaveText("Kitchen");
  await expect(
    page.getByRole("combobox", { name: "Terror card", exact: true }),
  ).toHaveCount(0);
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(0);
  await page.screenshot({
    path: info.outputPath("gruesome-death.png"),
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Decrease killed", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  const log = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).playEvents,
    storageKey,
  );
  expect(
    log
      .filter((e: { cause?: string }) => e.cause === "killer")
      .every((e: { terrorCard?: string }) => !e.terrorCard),
  ).toBe(true);
});
