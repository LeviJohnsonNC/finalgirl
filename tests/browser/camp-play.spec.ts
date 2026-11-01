import { showMinorChoices, undoLatestObservation, setTracker } from "./play-helpers";
import { test, expect, activeGame, userId } from "./fixtures";
import {
  searchPick,
  statusPick,
  openModule,
  openHistory,
} from "./play-helpers";
import type { Page } from "@playwright/test";
import { deathFacts } from "../../src/lib/play/death";
import type { PlayEvent } from "../../src/lib/play/events";
const selection = activeGame.selection;
async function resume(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
}
async function expandCamp(page: Page) {
  await openModule(page, "camp");
}

async function reveal(page: Page, kind: "Dark Power" | "Finale", name: string) {
  await page.getByRole("button", { name: kind, exact: true }).click();
  await statusPick(
    page,
    page.getByRole("combobox", { name: kind + " card", exact: true }),
    name,
  );
}

test("illustrated Camp states and Hans hearts survive reload without changing totals", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await expect(page.locator(".play-camp-portrait").first()).not.toBeVisible();
  await expandCamp(page);
  await expect(page.locator(".play-camp-person")).toHaveCount(3);
  await expect(page.locator(".play-camp-effect")).toHaveCount(6);
  for (const name of ["Boyfriend", "Girlfriend", "The Damned"]) {
    const person = page.locator(".play-camp-person").filter({ hasText: name });
    await expect(person).toHaveAttribute("data-state", "unrecorded");
    await expect(
      person.getByRole("button", { name: `Mark ${name} saved`, exact: true }),
    ).toBeDisabled();
    const portraits = new Set<string>();
    for (const state of ["unrecorded", "in-play", "saved", "killed"]) {
      if (state === "in-play")
        await person.locator(".play-camp-portrait").click();
      if (state === "killed") {
        await person.locator(".module-correction > summary").click();
        await statusPick(page, person.getByRole("combobox"), "In play");
      }
      if (state === "saved" || state === "killed")
        await person
          .getByRole("button", { name: `Mark ${name} ${state}`, exact: true })
          .click();
      await expect(person).toHaveAttribute("data-state", state);
      portraits.add(
        await person
          .locator(".play-camp-portrait")
          .evaluate(
            (el) =>
              el.querySelector("img")?.getAttribute("src") ??
              el.querySelector("svg")!.getAttribute("viewBox")!,
          ),
      );
    }
    expect(portraits.size).toBe(4);
    await statusPick(page, person.getByRole("combobox"), "Saved");
  }
  await statusPick(
    page,
    page.getByRole("combobox", { name: "Girlfriend status", exact: true }),
    "Killed",
  );
  for (const detail of ["Dark Waters", "Secret Tunnel"])
    await page
      .getByRole("button", { name: `Activate ${detail}`, exact: true })
      .click();
  await statusPick(
    page,
    page.getByRole("combobox", {
      name: "Secret Tunnel endpoint 1",
      exact: true,
    }),
    "Cabins",
  );
  await page
    .getByRole("combobox", { name: "Secret Tunnel endpoint 2", exact: true })
    .click();
  await expect(
    page.getByRole("option", { name: "Cabins", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("option", { name: "Dock", exact: true }).click();
  await openModule(page, "hans");
  for (const name of ["Unholy Rage", "Unholy Speed"]) {
    await showMinorChoices(page.locator('[data-module="hans"]'));
    const power = page.locator(".play-minor-power").filter({ hasText: name });
    await expect(power).toHaveAttribute("data-state", "unrecorded");
    await power
      .getByRole("button", { name: `Reveal ${name}`, exact: true })
      .click();
    const views = new Set<string>();
    for (const health of [2, 1, 0]) {
      await expect(power).toContainText(`${health}/2 health`);
      await expect(
        power.locator('.play-health-tokens button[aria-pressed="true"]'),
      ).toHaveCount(health);
      views.add((await power.getAttribute("data-state"))!);
      await power.screenshot({
        path: info.outputPath(
          `${name.replaceAll(" ", "-").toLowerCase()}-${health}.png`,
        ),
        animations: "disabled",
        style: ".app-footer { visibility: hidden }",
      });
      if (health)
        await power
          .getByRole("button", {
            name: `Remove one ${name} health, heart 1`,
            exact: true,
          })
          .click();
    }
    expect(views.size).toBe(3);
    await expect(power).toHaveAttribute("data-state", "removed");
    // Clicking the second empty heart restores ONE, not two.
    await power
      .getByRole("button", {
        name: `Restore one ${name} health, heart 2`,
        exact: true,
      })
      .click();
    await expect(power).toContainText("1/2 health");
    // Clicking the first filled heart also removes just ONE.
    await power
      .getByRole("button", {
        name: `Remove one ${name} health, heart 1`,
        exact: true,
      })
      .click();
  }
  await setTracker(page, "Killer health", 12);
  await expect(
    page.getByRole("button", { name: "Set Killer health", exact: true }),
  ).toHaveText("12");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expandCamp(page);
  await openModule(page, "hans");
  await expect(
    page.locator(".play-camp-person").filter({ hasText: "Boyfriend" }),
  ).toHaveAttribute("data-state", "saved");
  await expect(
    page.locator(".play-camp-person").filter({ hasText: "Girlfriend" }),
  ).toHaveAttribute("data-state", "killed");
  await expect(
    page.getByRole("combobox", {
      name: "Secret Tunnel endpoint 2",
      exact: true,
    }),
  ).toHaveText("Dock");
  for (const power of await page.locator(".play-minor-power").all())
    await expect(power).toContainText("Removed");
  for (const name of ["Save one victim", "Record one victim killed"])
    await expect(page.getByRole("button", { name, exact: true })).toContainText(
      "0",
    );
  for (const width of info.project.name === "mobile"
    ? [320, 390, 768]
    : [1024, 1382, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const button of await page
      .locator(".play-camp-modules button:visible")
      .all())
      expect(
        await button.evaluate((el) => el.getBoundingClientRect().height),
      ).toBeGreaterThanOrEqual(44);
  }
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 390 : 1382,
    height: 900,
  });
  for (const [index, panel] of (
    await page.locator(".play-module-panel").all()
  ).entries())
    await panel.screenshot({
      path: info.outputPath(`tracked-panel-${index}.png`),
      animations: "disabled",
      style: ".app-footer { visibility: hidden }",
    });
});

test("Camp and Hans corrections preserve immutable history, Undo, restore and tunnel reset", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await expandCamp(page);
  await page
    .getByRole("button", {
      name: "Add Boyfriend",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Mark Boyfriend saved", exact: true })
    .click();
  await undoLatestObservation(page);
  const boyfriend = page
    .locator(".play-camp-person")
    .filter({ hasText: "Boyfriend" });
  await expect(boyfriend).toHaveAttribute("data-state", "in-play");
  await openHistory(page);
  const undone = page
    .getByRole("region", { name: "Game timeline" })
    .locator("li")
    .filter({ hasText: "UNDONE" });
  await undone.getByRole("button", { name: /^Restore/ }).click();
  await expect(boyfriend).toHaveAttribute("data-state", "saved");
  await boyfriend.locator(".module-correction > summary").click();
  await statusPick(page, boyfriend.getByRole("combobox"), "Not recorded");
  await expect(boyfriend).toHaveAttribute("data-state", "unrecorded");
  await undoLatestObservation(page);
  await expect(boyfriend).toHaveAttribute("data-state", "saved");
  await openModule(page, "hans");
  const rage = page
    .locator(".play-minor-power")
    .filter({ hasText: "Unholy Rage" });
  await rage
    .getByRole("button", { name: "Reveal Unholy Rage", exact: true })
    .click();
  await rage
    .getByRole("button", { name: "Clear record: Unholy Rage", exact: true })
    .click();
  await expect(rage).toHaveAttribute("data-state", "unrecorded");
  await undoLatestObservation(page);
  await expect(rage).toHaveAttribute("data-state", "full");
  await page
    .getByRole("button", { name: "Activate Secret Tunnel", exact: true })
    .click();
  await statusPick(
    page,
    page.getByRole("combobox", {
      name: "Secret Tunnel endpoint 1",
      exact: true,
    }),
    "Cabins",
  );
  await statusPick(
    page,
    page.getByRole("combobox", {
      name: "Secret Tunnel endpoint 2",
      exact: true,
    }),
    "Dock",
  );
  await page
    .locator(".module-event")
    .filter({ hasText: "Secret Tunnel" })
    .locator(".module-correction > summary")
    .click();
  await page
    .getByRole("button", { name: "Clear record: Secret Tunnel", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Activate Secret Tunnel", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", {
      name: "Secret Tunnel endpoint 1",
      exact: true,
    }),
  ).toHaveText("Not recorded");
  await expect(
    page.getByRole("combobox", {
      name: "Secret Tunnel endpoint 2",
      exact: true,
    }),
  ).toHaveText("Not recorded");
  const log = await page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + id)!)
        .playEvents,
    userId,
  );
  expect(
    log.some(
      (e: PlayEvent) => e.moduleData?.changes["victim.boyfriend"] === "saved",
    ),
  ).toBe(true);
  expect(
    log.some(
      (e: PlayEvent) => e.moduleData?.changes["victim.boyfriend"] === null,
    ),
  ).toBe(true);
  expect(log.filter((e: PlayEvent) => e.kind === "undo")).toHaveLength(3);
  expect(archive.calls).toEqual([]);
});

test("art controls reject failed local saves and recover offline observations on reconnect", async ({
  page,
  archive,
}) => {
  archive.failWrites = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await resume(page);
  await expandCamp(page);
  await openModule(page, "hans");
  const before = await page.evaluate(
    (id) => localStorage.getItem("final-girl-active-game-v1:" + id),
    userId,
  );
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, "__restoreCampStorage", {
      configurable: true,
      value: () => {
        Storage.prototype.setItem = original;
      },
    });
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("final-girl-active-game-v1:"))
        throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page
    .getByRole("button", {
      name: "Add Boyfriend",
      exact: true,
    })
    .click();
  await expect(
    page.locator(".play-camp-person").filter({ hasText: "Boyfriend" }),
  ).toHaveAttribute("data-state", "unrecorded");
  const rage = page
    .locator(".play-minor-power")
    .filter({ hasText: "Unholy Rage" });
  await rage
    .getByRole("button", { name: "Reveal Unholy Rage", exact: true })
    .click();
  await expect(rage).toHaveAttribute("data-state", "unrecorded");
  await expect(
    page.getByText("This change could not be saved. Please try again.", {
      exact: true,
    }),
  ).toHaveCount(2);
  expect(
    await page.evaluate(
      (id) => localStorage.getItem("final-girl-active-game-v1:" + id),
      userId,
    ),
  ).toBe(before);
  await page.evaluate(() =>
    (
      window as unknown as { __restoreCampStorage: () => void }
    ).__restoreCampStorage(),
  );
  await page
    .getByRole("button", {
      name: "Add Boyfriend",
      exact: true,
    })
    .click();
  await rage
    .getByRole("button", { name: "Reveal Unholy Rage", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Remove one Unholy Rage health, heart 2",
      exact: true,
    })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(rage).toHaveAttribute("data-state", "weakened");
  await expect(
    page.locator(".play-camp-person").filter({ hasText: "Boyfriend" }),
  ).toHaveAttribute("data-state", "in-play");
  archive.failWrites = false;
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect
    .poll(
      () =>
        (
          archive.sessions[0]?.state.playEvents as PlayEvent[] | undefined
        )?.filter((e) => e.kind === "module").length,
    )
    .toBe(3);
  expect(archive.calls).toEqual([]);
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
  await page
    .getByRole("button", { name: "Activate Dark Waters", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Cause of death" }).getByRole("button"),
  ).toHaveText([
    "Killer attack",
    "Terror card",
    "Event",
    "Buddy / minion",
    "Location hazard",
    "Other / not sure",
  ]);
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
    .getByRole("button", { name: "End effect: Dark Waters", exact: true })
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
