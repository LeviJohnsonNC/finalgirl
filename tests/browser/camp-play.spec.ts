import { test, expect, activeGame } from "./fixtures";
import { searchPick, statusPick } from "./play-helpers";
import type { Page } from "@playwright/test";
import { deathFacts } from "../../src/lib/play/death";
import type { PlayEvent } from "../../src/lib/play/events";
const selection = activeGame.selection;
async function resume(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}
async function expandCamp(page: Page) {
  await page
    .locator(".play-camp-panel > summary")
    .filter({ hasText: "Inside Camp Happy Trails" })
    .click();
}
async function reveal(page: Page, kind: "Dark Power" | "Finale", name: string) {
  await page.getByRole("button", { name: kind, exact: true }).click();
  await statusPick(
    page,
    page.getByRole("combobox", { name: kind + " card", exact: true }),
    name,
  );
}

test("opt-in Camp portraits, hazards and Minor Dark Powers survive reload without changing totals", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await expect(
    page.getByRole("combobox", { name: "Add Camp detail", exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reveal", exact: true }),
  ).not.toBeVisible();
  await expandCamp(page);
  for (const detail of [
    "Boyfriend",
    "Girlfriend",
    "The Damned",
    "Dark Waters",
    "Secret Tunnel",
  ])
    await searchPick(page, "Add Camp detail", detail);
  await statusPick(
    page,
    page.getByRole("combobox", {
      name: "Secret Tunnel endpoint 1",
      exact: true,
    }),
    "Cabins",
  );
  const end2 = page.getByRole("combobox", {
    name: "Secret Tunnel endpoint 2",
    exact: true,
  });
  await end2.click();
  await expect(
    page.getByRole("option", { name: "Cabins", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("option", { name: "Dock", exact: true }).click();
  for (const state of ["Killed", "Untracked", "In play", "Saved"])
    await statusPick(
      page,
      page.getByRole("combobox", { name: "Boyfriend status", exact: true }),
      state,
    );
  await statusPick(
    page,
    page.getByRole("combobox", { name: "Girlfriend status", exact: true }),
    "Killed",
  );
  await page.locator(".play-hans-panel > summary").click();
  const rage = page
    .locator(".play-minor-power")
    .filter({ hasText: "Unholy Rage" });
  await rage.getByRole("button", { name: "Reveal", exact: true }).click();
  await expect(rage).toContainText("2 health");
  for (let i = 0; i < 2; i++)
    await page
      .getByRole("button", { name: "Decrease Unholy Rage health", exact: true })
      .click();
  await expect(rage).toContainText("Removed");
  await expect(
    page.getByRole("button", {
      name: "Decrease Unholy Rage health",
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Track Killer health", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Set Killer health", exact: true }),
  ).toHaveText("12");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expandCamp(page);
  await page.locator(".play-hans-panel > summary").click();
  await expect(
    page.getByRole("combobox", { name: "Boyfriend status", exact: true }),
  ).toHaveText("Saved");
  await expect(
    page.getByRole("combobox", { name: "Girlfriend status", exact: true }),
  ).toHaveText("Killed");
  await expect(
    page.getByRole("combobox", {
      name: "Secret Tunnel endpoint 2",
      exact: true,
    }),
  ).toHaveText("Dock");
  await expect(rage).toContainText("Removed");
  await expect(
    page.getByRole("button", { name: "Save one victim", exact: true }),
  ).toContainText("0");
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("0");
  const pictures = page.locator(".play-camp-portrait img");
  await expect(pictures).toHaveCount(3);
  for (const picture of await pictures.all())
    await expect
      .poll(() => picture.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBe(384);
  for (const width of info.project.name === "mobile"
    ? [320, 390, 768]
    : [1024, 1382, 1920]) {
    await page.setViewportSize({
      width,
      height: info.project.name === "mobile" ? 844 : 900,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const trigger of await page
      .locator(".play-camp-body .play-select-trigger:visible")
      .all())
      expect(
        await trigger.evaluate((el) => el.getBoundingClientRect().height),
      ).toBeGreaterThanOrEqual(44);
  }
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 390 : 1382,
    height: 900,
  });
  await page.locator(".play-camp-panel").last().scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("camp-controls.png"),
    fullPage: true,
  });
});

test("two Hans powers remain one remembered reveal and reach ending context alongside Camp Items", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await reveal(page, "Dark Power", "Feed");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await reveal(page, "Finale", "Dark, Darker, Darkest");
  const second = page.getByRole("combobox", {
    name: "Second Dark Power card",
    exact: true,
  });
  await second.click();
  await expect(
    page.getByRole("option", { name: "Feed", exact: true }),
  ).toHaveCount(0);
  const names = (await page.getByRole("option").allTextContents()).filter(
    (n) => n !== "Not specified",
  );
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  await page
    .getByRole("option", { name: "Dark Obsession", exact: true })
    .click();
  await page.screenshot({
    path: info.outputPath("hans-second-power.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await page.getByRole("button", { name: "Dark Power", exact: true }).click();
  await expect(second).toHaveText("Dark Obsession");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await page
    .getByRole("button", { name: "Found a weapon/item", exact: true })
    .click();
  await searchPick(page, "Moment detail", "Aluminum Bat");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Finale", exact: true }).click();
  await expect(second).toHaveText("Dark Obsession");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() =>
      archive.generationRequests.find((r) => r.name === "generate-ending"),
    )
    .toBeTruthy();
  const body = archive.generationRequests.find(
    (r) => r.name === "generate-ending",
  )!.body;
  expect(body.playSummary).toContain("Dark Obsession");
  expect(body.playSummary).toContain("Aluminum Bat");
  expect(body.playSummary).toContain("Finding does not establish use");
  expect(JSON.stringify(body)).toContain("Whenever Hans attacks");
  const log = archive.sessions.find((s) => s.id === activeGame.id)!.state
    .playEvents as PlayEvent[];
  expect(
    log.filter((e) => e.kind === "moment" && e.momentType === "dark-power"),
  ).toHaveLength(1);
});

test("Camp death payoff keeps its original Event context after later observations and reopens cached", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await expandCamp(page);
  await searchPick(page, "Add Camp detail", "Dark Waters");
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await page.getByRole("button", { name: "Event", exact: true }).click();
  await searchPick(page, "Death event card", "Dark Waters");
  await searchPick(page, "Death location", "Lake");
  await searchPick(page, "Victim name or role", "Boyfriend");
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText(archive.deathText);
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  const eventLog = archive.sessions.find((s) => s.id === activeGame.id)!.state
    .playEvents as PlayEvent[];
  const killed = eventLog.find((e) => e.kind === "killed")!;
  const before = deathFacts(selection, eventLog, killed.id)!;
  expect(before.moduleContext?.camp["event.dark-waters"]).toBe("active");
  expect(before).toMatchObject({
    quantity: 1,
    victim: "Boyfriend",
    eventCard: "Dark Waters",
    room: "Lake",
  });
  await page
    .getByRole("button", { name: "Dark Waters Active", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
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
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("1");
});

for (const [killer, location] of [
  ["Hans", "Buddyland"],
  ["Billy the Bear", "Camp Happy Trails"],
])
  test(`module controls and card choices stay independent for ${killer} at ${location}`, async ({
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
    await resume(page);
    await expect(page.locator(".play-hans-panel")).toHaveCount(
      killer === "Hans" ? 1 : 0,
    );
    await expect(
      page
        .locator(".play-camp-panel > summary")
        .filter({ hasText: "Inside Camp Happy Trails" }),
    ).toHaveCount(location === "Camp Happy Trails" ? 1 : 0);
    await expect(
      page.getByRole("heading", { name: "Billy & his Buddies", exact: true }),
    ).toHaveCount(killer === "Billy the Bear" ? 1 : 0);
    await expect(
      page.getByRole("heading", { name: "Inside Buddyland", exact: true }),
    ).toHaveCount(location === "Buddyland" ? 1 : 0);
    await page.getByRole("button", { name: "Dark Power", exact: true }).click();
    await page
      .getByRole("combobox", { name: "Dark Power card", exact: true })
      .click();
    await expect(
      page.getByRole("option", { name: "Feed", exact: true }),
    ).toHaveCount(killer === "Hans" ? 1 : 0);
    await expect(
      page.getByRole("option", { name: "Endless Power", exact: true }),
    ).toHaveCount(killer === "Billy the Bear" ? 1 : 0);
  });

test("owned Camp and Hans rule references are searchable", async ({
  page,
  archive,
}) => {
  await archive.install(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Rules", exact: true }).click();
  const search = page.getByPlaceholder("SEARCH RULES, TERMS, ICONS...");
  await search.fill("Dark Waters");
  await expect(page.locator("#location-camp-happy-trails-rules")).toContainText(
    "entering the Lake",
  );
  await search.fill("Unholy Rage");
  await expect(page.locator("#killer-hans-rules")).toContainText(
    "Health marker remaining",
  );
});
