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
  await page
    .getByLabel("Moment detail", { exact: true })
    .fill("Axe from the cabins");
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

test("inline death drafts stay with their victims, filter cards, and reopen without spending AI", async ({
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
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const editor = page.getByRole("region", {
    name: "Death details",
    exact: true,
  });
  await expect(editor).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Death location", { exact: true }).fill("Kitchen");
  await page.getByLabel("Death mechanism", { exact: true }).fill("Frostbite");
  await page
    .getByLabel("Terror card", { exact: true })
    .fill("The generator is out.");
  await expect(editor).toContainText(
    "Frostbite remains through the next Upkeep",
  );
  await page.getByLabel("Death event card", { exact: true }).fill("Pair up!");
  await expect(editor).toContainText("Redistribute lone Victims");
  expect(
    await page
      .locator("#play-terror-options option")
      .evaluateAll((options) =>
        options.map((o) => (o as HTMLOptionElement).value),
      ),
  ).not.toContain("Taking Souvenirs");
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await expect(page.getByLabel("Death location", { exact: true })).toHaveValue(
    "",
  );
  await page.getByLabel("Death location", { exact: true }).fill("Lab");
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          Object.values(JSON.parse(localStorage.getItem(key)!).playDrafts).some(
            (d) => (d as { room?: string }).room === "Lab",
          ),
        storageKey,
      ),
    )
    .toBe(true);
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(page.getByLabel("Death location", { exact: true })).toHaveValue(
    "Lab",
  );
  await page
    .getByRole("button", { name: "Back to the game", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Game timeline" })
    .locator("li")
    .filter({ hasText: "at Kitchen" })
    .getByRole("button", { name: "Death details", exact: true })
    .click();
  await expect(page.getByLabel("Terror card", { exact: true })).toHaveValue(
    "The generator is out.",
  );
  await expect(page.getByLabel("Death mechanism", { exact: true })).toHaveValue(
    "Frostbite",
  );
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(0);
  await page.screenshot({
    path: info.outputPath("inline-death.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Decrease killed", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
});
