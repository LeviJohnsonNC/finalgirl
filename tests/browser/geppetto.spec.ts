import { test, expect, activeGame, userId } from "./fixtures";
import { openModule, statusPick, searchPick } from "./play-helpers";
import { newPlayEvent, type PlayEvent } from "../../src/lib/play/events";
const selected = { ...activeGame.selection, killer: "Geppetto" };
const setup = {
  ...activeGame,
  selection: selected,
  geppettoSetupVersion: 1,
  playMode: true,
};
const start = newPlayEvent({ kind: "start", round: 2, saved: 0, killed: 0 });
const moduleEvent = (
  changes: Record<string, string | number | boolean | null>,
) =>
  newPlayEvent({ kind: "module", moduleData: { module: "geppetto", changes } });
const panel = (page: import("@playwright/test").Page) =>
  page.locator('[data-module="geppetto"]');
async function resume(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "geppetto");
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

test("new mixed-module game seeds the tray once, spawns in order, undoes and resumes", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...setup,
      selection: { ...selected, startingEvent: "Girlfriend" },
    },
  });
  await resume(page);
  const p = panel(page);
  await expect(
    p
      .locator(".geppetto-tray-heading")
      .getByText("0 on board · 3 ready · 0 exhausted", { exact: true }),
  ).toBeVisible();
  await openModule(page, "camp");
  await expect(
    page.locator(".play-camp-person").filter({ hasText: "Girlfriend" }),
  ).toHaveAttribute("data-state", "in-play");
  await p
    .getByRole("button", { name: "Apply spawn & ready", exact: true })
    .click();
  await expect(
    p
      .locator(".geppetto-tray-heading")
      .getByText("1 on board · 2 ready · 0 exhausted", { exact: true }),
  ).toBeVisible();
  await p
    .getByRole("button", { name: "Exhaust Puppet 1", exact: true })
    .click();
  await expect(
    p.getByText("Spawn 1 from Ready, then return 1 Exhausted to Ready.", {
      exact: true,
    }),
  ).toBeVisible();
  await p
    .getByRole("button", { name: "Apply spawn & ready", exact: true })
    .click();
  await expect(p.getByRole("combobox", { name: "Puppet 1 status" })).toHaveText(
    "Ready",
  );
  await expect(p.getByRole("combobox", { name: "Puppet 2 status" })).toHaveText(
    "On board",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(p.getByRole("combobox", { name: "Puppet 1 status" })).toHaveText(
    "Exhausted",
  );
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "geppetto");
  await expect(p.getByRole("combobox", { name: "Puppet 1 status" })).toHaveText(
    "Exhausted",
  );
  expect(
    (await log(page)).filter(
      (e) =>
        e.moduleData?.changes["puppet.1.status"] === "ready" &&
        Object.keys(e.moduleData.changes).length === 3,
    ),
  ).toHaveLength(2); // setup plus undone spawn
  expect((await log(page)).filter((e) => e.kind === "killed")).toHaveLength(0);
  await p.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("geppetto-puppet-tray.png"),
    fullPage: true,
  });
});

test("older sessions keep unknown trays until explicitly recorded, including no prior play log", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: { ...activeGame, selection: selected, playMode: true },
  });
  await resume(page);
  const p = panel(page);
  await expect(
    p.getByText("Record the current tray", { exact: true }),
  ).toBeVisible();
  await expect(
    p.getByRole("button", { name: "Apply spawn & ready" }),
  ).toBeDisabled();
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Puppet 1 status" }),
    "On board",
  );
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Puppet 2 status" }),
    "Exhausted",
  );
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Puppet 3 status" }),
    "Exhausted",
  );
  await expect(
    p.getByText("Spawn 0 from Ready, then return 2 Exhausted to Ready.", {
      exact: true,
    }),
  ).toBeVisible();
  await p.getByRole("button", { name: "Apply spawn & ready" }).click();
  await expect(
    p
      .locator(".geppetto-tray-heading")
      .getByText("1 on board · 2 ready · 0 exhausted", { exact: true }),
  ).toBeVisible();
});

test("unnamed Finale disables initial spawning; named reveal offers effects without resolving them", async ({
  page,
  archive,
}) => {
  const finale = newPlayEvent({
    kind: "moment",
    momentType: "finale",
    text: "Finale revealed",
    permanent: true,
  });
  await archive.install(page, {
    draft: {
      ...setup,
      playEvents: [
        start,
        moduleEvent({
          "puppet.1.status": "ready",
          "puppet.2.status": "exhausted",
          "puppet.3.status": "on-board",
        }),
        finale,
      ],
    },
  });
  await resume(page);
  const p = panel(page);
  await expect(
    p.getByRole("button", { name: "Apply spawn & ready" }),
  ).toHaveCount(0);
  await expect(
    p.getByText("Finale revealed, card not specified.", { exact: false }),
  ).toBeVisible();
  await p.getByText("Dark Power & Finale", { exact: true }).click();
  await p.getByRole("button", { name: /Remember Them\?/ }).click();
  await expect(
    p
      .locator(".geppetto-tray-heading")
      .getByText("1 on board · 1 ready · 1 exhausted", { exact: true }),
  ).toBeVisible();
  await p.getByText("Card effects & quick rules", { exact: true }).click();
  await p
    .getByRole("button", { name: "Spawn all remaining Puppets", exact: true })
    .click();
  await expect(
    p
      .locator(".geppetto-tray-heading")
      .getByText("3 on board · 0 ready · 0 exhausted", { exact: true }),
  ).toBeVisible();
  expect(
    (await log(page)).filter(
      (e) => e.kind === "moment" && e.momentType === "finale",
    ),
  ).toHaveLength(1);
});

test("Minor Dark Power hearts change art and survive reload independently of ordinary health", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  const p = panel(page);
  await p.getByText("Minor Dark Powers", { exact: true }).click();
  const minor = p
    .locator(".geppetto-minors > article")
    .filter({ hasText: "Am I a Puppet?" });
  await minor
    .getByRole("button", { name: "Reveal Am I a Puppet?", exact: true })
    .click();
  await expect(minor).toHaveAttribute("data-state", "full");
  const original = await minor
    .locator(".geppetto-minor-art > svg")
    .getAttribute("viewBox");
  await minor
    .getByRole("button", {
      name: "Remove one Am I a Puppet? health, heart 1",
      exact: true,
    })
    .click();
  await expect(minor).toHaveAttribute("data-state", "weakened");
  expect(
    await minor.locator(".geppetto-minor-art > svg").getAttribute("viewBox"),
  ).not.toBe(original);
  await minor
    .getByRole("button", {
      name: "Remove one Am I a Puppet? health, heart 1",
      exact: true,
    })
    .click();
  await expect(minor).toHaveAttribute("data-state", "removed");
  await minor
    .getByRole("button", {
      name: "Restore one Am I a Puppet? health, heart 2",
      exact: true,
    })
    .click();
  await expect(minor).toHaveAttribute("data-state", "weakened");
  expect(
    (await log(page)).filter(
      (e) => e.kind === "state" && e.field === "killerHealth",
    ),
  ).toHaveLength(0);
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "geppetto");
  await p.getByText("Minor Dark Powers", { exact: true }).click();
  await expect(minor).toHaveAttribute("data-state", "weakened");
  await minor.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("geppetto-minor-powers.png"),
    fullPage: true,
  });
});

test("illustrated power choices share Remember This and first-hit markers reset explicitly", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  const p = panel(page);
  await p.getByText("Dark Power & Finale", { exact: true }).click();
  await p.getByRole("button", { name: /Massive Abominations/ }).click();
  const hit = p.getByRole("button", {
    name: "First hit not recorded for Puppet 1",
    exact: true,
  });
  await hit.click();
  await expect(
    p.getByRole("button", { name: "First hit used for Puppet 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Next round", exact: true }).click();
  await expect(
    p.getByRole("button", { name: "First hit used for Puppet 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await p
    .getByRole("button", {
      name: "Reset protection for a new turn",
      exact: true,
    })
    .click();
  await expect(
    p.getByRole("button", {
      name: "First hit available for Puppet 1",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Dark Power", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Dark Power card", exact: true }),
  ).toHaveText("Massive Abominations");
  await statusPick(
    page,
    page.getByRole("combobox", { name: "Dark Power card", exact: true }),
    "Immortal Master",
  );
  await expect(p.locator(".geppetto-active-power")).toContainText(
    "Immortal Master",
  );
  expect(
    (await log(page)).filter(
      (e) => e.kind === "moment" && e.momentType === "dark-power",
    ),
  ).toHaveLength(1);
  await p.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("geppetto-power-catalog.png"),
    fullPage: true,
  });
});

test("failed local persistence leaves the tray unchanged and rapid repeated helper clicks cannot consume two puppets", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  const p = panel(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, "restoreGeppettoStorage", {
      value: () => {
        Storage.prototype.setItem = original;
      },
    });
    Storage.prototype.setItem = function (k, v) {
      if (k.startsWith("final-girl-active-game-v1:"))
        throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, k, v);
    };
  });
  await p.getByRole("button", { name: "Spawn Puppet 1", exact: true }).click();
  await expect(
    p.getByText("This detail could not be saved. Please try again.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(p.getByRole("combobox", { name: "Puppet 1 status" })).toHaveText(
    "Ready",
  );
  await page.evaluate(() => {
    (
      window as unknown as { restoreGeppettoStorage: () => void }
    ).restoreGeppettoStorage();
  });
  await p
    .getByRole("button", { name: "Apply spawn & ready", exact: true })
    .evaluate((button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
    });
  await expect(
    p
      .locator(".geppetto-tray-heading")
      .getByText("1 on board · 2 ready · 0 exhausted", { exact: true }),
  ).toBeVisible();
});

test("Puppet death attacker suggestions and Gepetto Terror names follow the killer", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: setup });
  await resume(page);
  await panel(page)
    .getByRole("button", { name: "Spawn Puppet 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  await dialog
    .getByRole("button", { name: "Puppet / minion", exact: true })
    .click();
  await searchPick(page, "Death attacker", "Puppet 1");
  await dialog
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  expect((await log(page)).filter((e) => e.kind === "killed")).toHaveLength(1);
  expect((await log(page)).some((e) => e.attacker === "Puppet 1")).toBe(true);
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Terror card", exact: true })
    .click();
  await searchPick(page, "Terror card", "Razor Puppet Strings");
  await dialog
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  expect(
    (await log(page)).some((e) => e.terrorCard === "Razor Puppet Strings"),
  ).toBe(true);
  expect(archive.calls).toEqual([]);
});

test("Gepetto panel is independent of location and fits keyboard, laptop and narrow phone layouts", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: {
      ...setup,
      selection: { ...selected, location: "Buddyland", filmId: "s4-buddyland" },
    },
  });
  await resume(page);
  await expect(page.locator('[data-module="buddyland"]')).toBeVisible();
  await expect(page.locator('[data-module="camp"]')).toHaveCount(0);
  await expect(page.locator('[data-module="billy"]')).toHaveCount(0);
  const p = panel(page);
  await p.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await expect(p).not.toHaveAttribute("open");
  await page.keyboard.press("Enter");
  await expect(p).toHaveAttribute("open", "");
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: width === 1366 ? 768 : 844 });
    await p.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (await p
        .getByRole("button", { name: "Spawn Puppet 1", exact: true })
        .boundingBox())!.width,
    ).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({
    path: info.outputPath("geppetto-laptop.png"),
    fullPage: false,
  });
});

test("another killer at Carnival has no Gepetto state; searchable owned rules include the verified module", async ({
  page,
  archive,
}, info) => {
  archive.films = ["s1-carnival-of-blood"];
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      selection: { ...selected, killer: "Hans", location: "Carnival of Blood" },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(page.locator('[data-module="hans"]')).toBeVisible();
  expect(
    (await log(page)).some((e) => e.moduleData?.module === "geppetto"),
  ).toBe(false);
  await page
    .locator("footer")
    .getByRole("button", { name: "RULES", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search rules", exact: true })
    .fill("puppet tray");
  await expect(page.locator("#killer-geppetto-rules")).toContainText(
    "Never refresh the tray first.",
  );
  await page.screenshot({
    path: info.outputPath("geppetto-rules.png"),
    fullPage: true,
  });
});

test("casting a fresh Gepetto game marks verified setup and uses eight Health in Play and review", async ({
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
    "Geppetto",
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
  await page.getByRole("button", { name: "Press Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enter Play mode", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Enter Play mode", exact: true })
    .click();
  await openModule(page, "geppetto");
  await expect(panel(page).locator(".geppetto-tray-heading")).toContainText(
    "0 on board · 3 ready · 0 exhausted",
  );
  await page
    .getByRole("button", { name: "Track Killer health", exact: true })
    .click();
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await expect(page.getByLabel("Killer Health", { exact: true })).toHaveValue(
    "8",
  );
  await expect(
    page.getByText("Killer health (0–8)", { exact: true }),
  ).toBeVisible();
});

test("an older recorded Gepetto health value remains editable instead of being clamped to the new reference", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: selected,
      phase: "outcome",
      result: {
        id: activeGame.id,
        timestamp: 1,
        outcome: "lost",
        ...selected,
        killerHealth: 9,
      },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await expect(page.getByLabel("Killer Health", { exact: true })).toHaveValue(
    "9",
  );
  await page.getByLabel("Killer Health", { exact: true }).fill("9");
  await page.getByLabel("Killer Health", { exact: true }).blur();
  await expect(page.getByLabel("Killer Health", { exact: true })).toHaveValue(
    "9",
  );
});
