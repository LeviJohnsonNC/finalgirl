import { searchPick, statusPick, openHistory, openModule } from "./play-helpers";
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
  await openModule(page, "billy");
  await openModule(page, "buddyland");
}
const buddies = ["Allie", "Billy Jr.", "Boris", "Cam", "Ramey", "Roxy", "Toby"];
const victims = ["Birthday Girl", "Nick the Janitor", "Pizza Guy"];
function portrait(page: import("@playwright/test").Page, name: string) {
  return page.locator(".play-character").filter({
    has: page.locator("strong", {
      hasText: new RegExp(
        "^" + name.replace(/[.*+?^$()|[\]\\]/g, "\\$&") + "$",
      ),
    }),
  });
}
async function reveal(
  page: import("@playwright/test").Page,
  kind: "Dark Power" | "Finale",
  name: string,
) {
  await page.getByRole("button", { name: kind, exact: true }).click();
  const trigger = page.getByRole("combobox", {
    name: kind + " card",
    exact: true,
  });
  await expect(trigger).toHaveText("Not specified");
  await trigger.click();
  const options = (await page.getByRole("option").allTextContents()).filter(
    (x) => x !== "Not specified",
  );
  expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)));
  expect(options).toHaveLength(kind === "Dark Power" ? 6 : 4);
  await page.getByRole("option", { name, exact: true }).click();
}

test("streamlined portraits and reveals survive reload and reach deaths and ending review", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: { ...activeGame, selection, playMode: true },
  });
  await open(page);
  await expect(page.locator(".play-count-add > span")).toHaveText([
    "Round",
    "Victims saved",
    "Victims killed",
  ]);
  await expect(page.locator(".play-state > span")).toHaveText([
    "Final Girl health",
    "Killer health",
    "Bloodlust",
    "Horror",
  ]);
  expect(await page.locator(".play-moment-choices button").evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')))).toEqual([
    "Found a weapon/item",
    "Dark Power",
    "Finale",
    "Ultimate unlocked",
    "Ultimate used",
    "Second wind",
    "Back from the dead",
    "Other moment",
  ]);
  await expect(page.locator(".play-character strong")).toHaveText([
    ...buddies,
    ...victims,
  ]);
  for (const removed of [
    "Narrow escape",
    "Turned the tables",
    "Add revealed Buddy",
    "Record starting Power Sources",
    "Record revealed power",
    "Record drawn Event",
    "Track found Item",
  ])
    await expect(
      page.getByRole("button", { name: removed, exact: true }),
    ).toHaveCount(0);
  await expect(
    page.getByLabel("Tragic Collapse location", { exact: true }),
  ).toHaveCount(0);
  const toby = portrait(page, "Toby"),
    boris = portrait(page, "Boris"),
    birthday = portrait(page, "Birthday Girl");
  await toby.click();
  await boris.click();
  await boris.click();
  await birthday.click();
  await birthday.click();
  await expect(toby).toHaveAttribute("data-state", "active");
  await expect(boris).toHaveAttribute("data-state", "killed");
  await expect(birthday).toHaveAttribute("data-state", "killed");
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("0");
  await reveal(page, "Dark Power", "Backup Generator");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await reveal(page, "Finale", "Power Surge");
  await page
    .getByLabel("Moment detail", { exact: true })
    .fill("Boris emerged from behind the Prize Counter.");
  await page
    .getByRole("combobox", { name: "Finale card", exact: true })
    .click();
  await page.screenshot({
    path: info.outputPath("play-reveal.png"),
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await page.reload();
  await open(page);
  await expect(toby).toHaveAttribute("data-state", "active");
  await expect(boris).toHaveAttribute("data-state", "killed");
  await expect(birthday).toHaveAttribute("data-state", "killed");
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline" }),
  ).toContainText("Finale: Power Surge. Boris emerged");
  await page.getByRole("button", { name: /^The night so far/ }).click();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const causes = await page.locator(".play-cause-choices button").allTextContents();
  expect(causes).toEqual([
    "Killer attack", "Terror card", "Event", "Buddy / minion", "Location hazard", "Other / not sure",
  ]);
  await page
    .getByRole("button", { name: "Buddy / minion", exact: true })
    .click();
  await searchPick(page, "Death attacker", "Toby");
  await page
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText(archive.deathText);
  await page
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 768, height: 1024 },
    info.project.name === "mobile"
      ? { width: 390, height: 844 }
      : { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(toby).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const box = await toby.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(90);
  }
  await page.screenshot({
    path: info.outputPath("streamlined-play.png"),
    fullPage: true,
    animations: "disabled",
    style: ".app-footer,.news-broadcast { visibility:hidden !important }",
  });
  await page.locator(".play-module-stack").screenshot({
    path: info.outputPath("play-roster.png"),
    animations: "disabled",
    style: ".app-footer,.news-broadcast { visibility:hidden !important }",
  });
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lost", exact: true })
    .click();
  await expect(
    page.getByLabel("Billy Finale (optional)", { exact: true }),
  ).toHaveText("Power Surge");
  await expect(
    page.getByLabel("Boris at Game End", { exact: true }),
  ).toHaveText("Defeated");
  // Off portraits mean untracked, not a confirmed complete roster or zero.
  await expect(
    page.getByLabel("Buddies in Play at End (0–7)", { exact: true }),
  ).toHaveValue("");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(
      () =>
        archive.generationRequests.find((r) => r.name === "generate-ending")
          ?.body.playSummary,
    )
    .toContain("Toby: active");
  const ending = archive.generationRequests.find(
    (r) => r.name === "generate-ending",
  )!.body.playSummary;
  expect(ending).toContain("Power Surge");
  expect(ending).toContain("Backup Generator");
  expect(ending).not.toContain("Health ?");
});

test("every portrait cycles distinct artwork, supports keyboard and Undo, and leaves totals alone", async ({
  page,
  archive,
}) => {
  test.setTimeout(90000);
  await archive.install(page, {
    draft: { ...activeGame, selection, playMode: true },
  });
  await open(page);
  for (const name of [...buddies, ...victims]) {
    const tile = portrait(page, name);
    const sources = new Set<string>();
    for (const state of ["off", "active", "killed"] as const) {
      await expect(tile).toHaveAttribute("data-state", state);
      await tile.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          tile
            .locator("img")
            .evaluate(
              (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
            ),
        )
        .toBe(true);
      sources.add((await tile.locator("img").getAttribute("src"))!);
      await tile.focus();
      await page.keyboard.press("Enter");
    }
    expect(sources.size).toBe(3);
    await expect(tile).toHaveAttribute("data-state", "off");
  }
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(portrait(page, "Pizza Guy")).toHaveAttribute(
    "data-state",
    "killed",
  );
  await page.reload();
  await open(page);
  await expect(portrait(page, "Pizza Guy")).toHaveAttribute(
    "data-state",
    "killed",
  );
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("0");
  await expect(
    page.getByRole("button", { name: "Save one victim", exact: true }),
  ).toContainText("0");
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(0);
});

test("reveal selection can be cleared, corrected and left unnamed; unfinished notes survive reload and finish", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: { ...activeGame, selection, playMode: true },
  });
  await open(page);
  await reveal(page, "Finale", "Encore");
  await statusPick(
    page,
    page.getByRole("combobox", { name: "Finale card", exact: true }),
    "Not specified",
  );
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await page.getByRole("button", { name: "Dark Power", exact: true }).click();
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await reveal(page, "Finale", "Power Surge");
  await page
    .getByLabel("Moment detail", { exact: true })
    .fill("The exit shutter slammed shut.");
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          (
            Object.values(
              JSON.parse(localStorage.getItem(key)!).playDrafts,
            ) as { detail?: string }[]
          ).some((v) => v.detail === "The exit shutter slammed shut."),
        "final-girl-active-game-v1:" + userId,
      ),
    )
    .toBe(true);
  await page.reload();
  await open(page);
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lost", exact: true })
    .click();
  await expect(
    page.getByLabel("Billy Finale (optional)", { exact: true }),
  ).toHaveText("Power Surge");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(
      () =>
        archive.generationRequests.find((r) => r.name === "generate-ending")
          ?.body.playSummary,
    )
    .toContain("The exit shutter slammed shut.");
  expect(
    archive.generationRequests.find((r) => r.name === "generate-ending")!.body
      .playSummary,
  ).not.toContain("Encore");
});

test("older detailed trackers and retired moments remain recoverable without recreating removed controls", async ({
  page,
  archive,
}) => {
  const event = (n: number, fields: Record<string, unknown>) => ({
    id: String(n).padStart(8, "0") + "-3333-4333-8333-333333333333",
    at: n,
    ...fields,
  });
  const legacy = [
    event(1, { kind: "start", saved: 1, killed: 2, round: 4 }),
    event(2, {
      kind: "module",
      moduleData: {
        module: "billy",
        changes: {
          "buddy.toby.status": "active",
          "buddy.toby.health": 2,
          "buddy.toby.room": "Kitchen",
          "source.1.status": "inactive",
          finale: "power-surge",
          rosterComplete: true,
        },
      },
    }),
    event(3, {
      kind: "module",
      moduleData: {
        module: "buddyland",
        changes: {
          "victim.nick": "saved",
          "victim.pizza-guy": "killed",
          "item.flash-camera.status": "carried",
          "item.flash-camera.uses": 1,
        },
      },
    }),
    event(4, {
      kind: "moment",
      momentType: "escape",
      text: "Narrow escape",
      detail: "Escaped through the kitchen hatch.",
    }),
  ];
  await archive.install(page, {
    draft: { ...activeGame, selection, playMode: true, playEvents: legacy },
  });
  await open(page);
  await expect(portrait(page, "Toby")).toHaveAttribute("data-state", "active");
  await expect(portrait(page, "Nick the Janitor")).toHaveAttribute(
    "data-state",
    "saved",
  );
  await expect(portrait(page, "Pizza Guy")).toHaveAttribute(
    "data-state",
    "killed",
  );
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline" }),
  ).toContainText("Escaped through the kitchen hatch.");
  await portrait(page, "Toby").click();
  await expect
    .poll(() => archive.sessions[0]?.state.playEvents)
    .toHaveLength(6);
  const log = archive.sessions[0].state.playEvents as {
    moduleData?: { changes: Record<string, unknown> };
  }[];
  expect(log[1].moduleData!.changes["buddy.toby.health"]).toBe(2);
  expect(log[5].moduleData!.changes).toMatchObject({
    "buddy.toby.status": "defeated",
    "buddy.toby.health": null,
    "buddy.toby.room": null,
    rosterComplete: null,
  });
  await expect(
    page.getByRole("button", { name: "Record one victim killed", exact: true }),
  ).toContainText("2");
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
    await page.getByRole("button", { name: "Dark Power", exact: true }).click();
    await expect(
      page.getByRole("combobox", { name: "Dark Power card", exact: true }),
    ).toHaveCount(1);
    await page.getByRole("button", { name: "Record", exact: true }).click();
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
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b,'en',{sensitivity:'base',numeric:true,ignorePunctuation:true})));
    expect(options.includes("Regroup")).toBe(killer === "Billy the Bear");
    expect(options.includes("Earthquake!")).toBe(location === "Buddyland");
  });
}
