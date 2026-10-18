import { searchPick, statusPick } from "./play-helpers";
import { test, expect, activeGame, userId } from "./fixtures";
const selection = {
  ...activeGame.selection,
  killer: "Billy the Bear",
  location: "Buddyland",
  finalGirl: "Rena",
  filmId: "s4-buddyland",
};
async function open(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}
async function pick(
  page: import("@playwright/test").Page,
  label: string,
  value: string,
) {
  const names: Record<string, string> = {
    toby: "Toby",
    "backup-generator": "Backup Generator",
    "sing-a-long": "Sing-A-Long",
    "flash-camera": "Flash Camera",
    "skee-ball-token": "Skee-Ball Token",
  };
  await searchPick(page, label, names[value] ?? value);
}

test("Buddyland observations survive reload and reach deaths and ending review", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: { ...activeGame, selection, playMode: true },
  });
  await open(page);
  const billy = page.getByRole("region", {
    name: "Billy tracking",
    exact: true,
  });
  await billy
    .locator("summary")
    .filter({ hasText: /^Buddies/ })
    .click();
  await expect(page.getByRole("article", { name: "Toby tracker" })).toHaveCount(
    0,
  );
  await pick(page, "Add revealed Buddy", "toby");
  const toby = page.getByRole("article", { name: "Toby tracker", exact: true });
  await expect(toby.getByLabel("Toby health", { exact: true })).toHaveText("3");
  await toby
    .getByRole("button", { name: "Decrease Toby health", exact: true })
    .click();
  await statusPick(
    page,
    toby.getByLabel("Toby shares Billy’s space", { exact: true }),
    "Yes",
  );
  await statusPick(
    page,
    toby.getByLabel("Toby activation", { exact: true }),
    "Wait until next Killer phase",
  );
  await expect(billy).toContainText("A recorded Buddy is protecting Billy.");
  await billy
    .getByLabel("All Buddies currently in play are listed", { exact: true })
    .check();
  await billy
    .locator("summary")
    .filter({ hasText: /^Power Sources$/ })
    .click();
  await page
    .getByRole("button", { name: "Record starting Power Sources", exact: true })
    .click();
  await statusPick(
    page,
    page.getByLabel("Power Source 1 status", { exact: true }),
    "Inactive",
  );
  await searchPick(page, "Power Source 1 location", "Dining Area");
  await billy
    .locator("summary")
    .filter({ hasText: /^Revealed powers/ })
    .click();
  await statusPick(
    page,
    page.getByLabel("Revealed Finale", { exact: true }),
    "Power Surge",
  );
  await expect(
    page.getByRole("article", { name: "Boris tracker" }),
  ).toHaveCount(0);
  await pick(page, "Record revealed power", "backup-generator");
  await page
    .getByRole("button", {
      name: "Decrease Backup Generator health",
      exact: true,
    })
    .click();
  await expect(
    page.getByLabel("Power Source 1 status", { exact: true }),
  ).toHaveText("Inactive");
  await expect(
    page.getByText("Terror card reference", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Revealed Bloodlust tokens", { exact: true }),
  ).toHaveCount(0);
  const venue = page.getByRole("region", {
    name: "Buddyland tracking",
    exact: true,
  });
  await venue
    .locator("summary")
    .filter({ hasText: /^Events/ })
    .click();
  await pick(page, "Record drawn Event", "sing-a-long");
  await expect(venue).not.toContainText(
    "During each Upkeep, draw a Terror card.",
  );
  await statusPick(
    page,
    page.getByLabel("Birthday Girl status", { exact: true }),
    "On board",
  );
  await statusPick(
    page,
    page.getByLabel("Tragic Collapse location", { exact: true }),
    "Kitchen",
  );
  await venue
    .locator("summary")
    .filter({ hasText: /^Items/ })
    .click();
  await pick(page, "Track found Item", "flash-camera");
  await page
    .getByRole("button", { name: "Decrease Flash Camera uses", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("0");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(toby.getByLabel("Toby health", { exact: true })).toHaveText("2");
  await expect(toby.getByLabel("Toby activation", { exact: true })).toHaveText(
    "Wait until next Killer phase",
  );
  await billy
    .locator("summary")
    .filter({ hasText: /^Power Sources$/ })
    .click();
  await expect(
    page.getByLabel("Power Source 1 location", { exact: true }),
  ).toHaveText("Dining Area");
  await billy
    .locator("summary")
    .filter({ hasText: /^Revealed powers/ })
    .click();
  await expect(page.getByLabel("Revealed Finale", { exact: true })).toHaveText(
    "Power Surge",
  );
  await expect(
    page.getByLabel("Backup Generator health", { exact: true }),
  ).toHaveText("1");
  await venue
    .locator("summary")
    .filter({ hasText: /^Items/ })
    .click();
  await expect(
    page.getByLabel("Flash Camera uses", { exact: true }),
  ).toHaveText("1");
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Buddy / minion", exact: true })
    .click();
  await searchPick(page, "Death attacker", "Toby");
  await expect(
    page.getByRole("combobox", { name: "Terror card", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText(archive.deathText);
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(1);
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).playEvents.some(
            (e: { attacker?: string }) => e.attacker === "Toby",
          ),
        `final-girl-active-game-v1:${userId}`,
      ),
    )
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
  await page.screenshot({
    path: info.outputPath("buddyland-play.png"),
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lost", exact: true })
    .click();
  await expect(
    page.getByLabel("Billy Finale (optional)", { exact: true }),
  ).toHaveValue("Power Surge");
  await expect(
    page.getByLabel("Buddies in Play at End (0–7)", { exact: true }),
  ).toHaveValue("1");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(
      () =>
        archive.generationRequests.find((r) => r.name === "generate-ending")
          ?.body.playSummary,
    )
    .toContain("Toby: active, Health 2");
  expect(
    archive.generationRequests.find((r) => r.name === "generate-ending")!.body
      .playSummary,
  ).toContain("Power Surge");
});

test("Skee-Balls remain unloaded until recorded and unfinished room drafts survive reload", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: { ...activeGame, selection, playMode: true },
  });
  await open(page);
  const venue = page.getByRole("region", {
    name: "Buddyland tracking",
    exact: true,
  });
  await venue
    .locator("summary")
    .filter({ hasText: /^Items/ })
    .click();
  await pick(page, "Track found Item", "skee-ball-token");
  await expect(
    page.getByLabel("Skee-Ball Token uses", { exact: true }),
  ).toHaveText("?");
  await page
    .getByRole("button", { name: "Record four loaded Skee-Balls", exact: true })
    .click();
  await expect(
    page.getByLabel("Skee-Ball Token uses", { exact: true }),
  ).toHaveText("4");
  const billy = page.getByRole("region", {
    name: "Billy tracking",
    exact: true,
  });
  await billy
    .locator("summary")
    .filter({ hasText: /^Power Sources$/ })
    .click();
  await page
    .getByRole("combobox", { name: "Power Source 2 location", exact: true })
    .click();
  await page
    .getByRole("combobox", {
      name: "Search Power Source 2 location",
      exact: true,
    })
    .fill("Party Room");
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).playDrafts[
            "module:billy:source.2.room"
          ]?.detail,
        `final-girl-active-game-v1:${userId}`,
      ),
    )
    .toBe("Party Room");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await billy
    .locator("summary")
    .filter({ hasText: /^Power Sources$/ })
    .click();
  await expect(
    page.getByLabel("Power Source 2 location", { exact: true }),
  ).toHaveText("Party Room");
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lost", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).result.playEvents.some(
            (e: { moduleData?: { changes: Record<string, unknown> } }) =>
              e.moduleData?.changes["source.2.room"] === "Party Room",
          ),
        `final-girl-active-game-v1:${userId}`,
      ),
    )
    .toBe(true);
});

for (const [killer, location] of [
  ["Billy the Bear", "Camp Happy Trails"],
  ["Hans", "Buddyland"],
]) {
  test(`module controls follow ${killer} at ${location}`, async ({
    page,
    archive,
  }) => {
    await archive.install(page, {
      draft: {
        ...activeGame,
        selection: { ...selection, killer, location },
        playMode: true,
      },
    });
    await open(page);
    await expect(
      page.getByRole("region", { name: "Billy tracking", exact: true }),
    ).toHaveCount(killer === "Billy the Bear" ? 1 : 0);
    await expect(
      page.getByRole("region", { name: "Buddyland tracking", exact: true }),
    ).toHaveCount(location === "Buddyland" ? 1 : 0);
    await expect(
      page.getByText("Terror card reference", { exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Record one victim killed", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Terror card", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Terror card", exact: true })
      .click();
    const options = await page.getByRole("option").allTextContents();
    expect(options.includes("Regroup")).toBe(killer === "Billy the Bear");
    expect(options.includes("Earthquake!")).toBe(location === "Buddyland");
  });
}
