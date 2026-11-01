import { test, expect, installTestAudio } from "./fixtures";
import { chooseKillerCard, openModule, openHistory, setTracker } from "./play-helpers";
import { parseFright } from "../../supabase/functions/_shared/play/fright";
import { summarizePlay } from "../../src/lib/play/events";
import {
  start,
  draft,
  panel,
  dialog,
  resume,
  enter,
  log,
  slide,
  footerVisible,
} from "./fright-helpers";

for (const [location, id] of [
  ["Buddyland", "buddyland"],
  ["Camp Happy Trails", "camp"],
  ["Carnival of Blood", "carnival"],
  ["Maple Lane", "maple"],
]) {
  test(`Dr. Fright stays independent at ${location}; Rules disclosure never writes`, async ({
    page,
    archive,
  }, info) => {
    await archive.install(page, {
      draft: { ...draft, selection: { ...draft.selection, location } },
    });
    await resume(page);
    await openModule(page, id);
    await expect(page.locator(".play-module-panel")).toHaveCount(2);
    for (const title of ["Awake", "Asleep"]) {
      const tile = panel(page).getByRole("button", {
        name: `Record Final Girl ${title}`,
        exact: true,
      });
      const bounds = await tile.boundingBox();
      const caption = await tile
        .getByText(title, { exact: true })
        .boundingBox();
      expect(bounds!.height).toBeLessThanOrEqual(180);
      expect(caption!.y).toBeGreaterThanOrEqual(bounds!.y);
      expect(caption!.y + caption!.height).toBeLessThanOrEqual(
        bounds!.y + bounds!.height,
      );
    }
    const before = await log(page);
    await panel(page).locator(".fright-details > summary").click();
    expect(await log(page)).toEqual(before);
    await panel(page).locator(".module-card-section > summary").click();
    await panel(page)
      .getByRole("button", { name: "Choose Shock Factor", exact: true })
      .click();
    await expect(panel(page).getByRole("region",{name:"Dark Power selection",exact:true}).locator(".module-revealed-hero")).toHaveAttribute("data-epic","true");
    await expect(panel(page)).toContainText("Maximum three per turn");
    await panel(page).screenshot({
      path: info.outputPath("fright-mixed-panel.png"),
    });
    await enter(page);
    await slide(page, "up");
    await footerVisible(page);
    if (info.project.name === "mobile") {
      await page.setViewportSize({ width: 320, height: 568 });
      await footerVisible(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}

test("printed Boiler Room sequence, attack pause, quarter reveal and offline reload retain the same deals", async ({
  page,
  archive,
}, info) => {
  if (info.project.name === "desktop")
    await page.setViewportSize({ width: 1280, height: 640 });
  else await page.setViewportSize({ width: 320, height: 568 });
  await archive.install(page, { draft });
  await resume(page);
  await enter(page);
  await footerVisible(page);
  await page.screenshot({ path: info.outputPath("boiler-start.png") });
  await slide(page, "up");
  await expect(dialog(page)).toContainText("No attack from this reveal.");
  const blockedBefore = await log(page);
  await slide(page, "down");
  expect(await log(page)).toEqual(blockedBefore);
  await expect(dialog(page).locator('image[href*="doctor-"]')).toHaveCount(0);
  await slide(page, "up");
  await slide(page, "left");
  await expect(dialog(page)).toContainText("Dr. Fright attacks.");
  await footerVisible(page);
  await expect(dialog(page).locator(".boiler-stage")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.screenshot({ path: info.outputPath("boiler-attack.png") });
  const before = await log(page);
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  archive.failWrites = true;
  await page.reload();
  await resume(page);
  await panel(page)
    .getByRole("button", { name: /Continue Boiler Room/ })
    .click();
  await expect(dialog(page)).toContainText("Dr. Fright attacks.");
  expect(await log(page)).toEqual(before);
  await dialog(page)
    .getByRole("button", { name: "Attack resolved", exact: true })
    .click();
  await slide(page, "down");
  await expect(
    dialog(page).locator(".boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(4);
  await expect(dialog(page)).toContainText("Select Awake");
  await expect(dialog(page).locator(".boiler-cover image")).toHaveAttribute(
    "href",
    /asleep-back/,
  );
  const held = await log(page);
  await page.screenshot({
    path: info.outputPath("boiler-safe-fourth-awaiting-awake.png"),
  });
  await page.reload();
  await resume(page);
  await panel(page)
    .getByRole("button", { name: /Continue Boiler Room/ })
    .click();
  expect(await log(page)).toEqual(held);
  await expect(
    dialog(page).locator(".boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(4);
  await dialog(page)
    .getByRole("button", { name: "Record Final Girl Awake", exact: true })
    .click();
  await expect(dialog(page)).toContainText("You woke up.");
  await footerVisible(page);
  await expect(
    dialog(page).locator(".boiler-stage .boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(0);
  await page.screenshot({
    path: info.outputPath("boiler-quarter-complete.png"),
  });
  for (const size of info.project.name === "desktop"
    ? [
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
      ]
    : [{ width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await footerVisible(page);
    await page.screenshot({
      path: info.outputPath(`boiler-complete-${size.width}.png`),
    });
  }
  const snapshots = (await log(page))
    .filter((e) => e.moduleData?.module === "fright")
    .map((e) => parseFright(e.moduleData!.changes.snapshot));
  expect(snapshots[snapshots.length - 1]).toMatchObject({
    deal: "2301",
    lastDeal: "0132",
    lastPath: "UULD",
    sleep: "awake",
  });
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  await openHistory(page);
  await expect(
    page.getByRole("region", { name: "Game timeline", exact: true }),
  ).not.toContainText("snapshot");
  expect(summarizePlay(await log(page))).toMatchObject({ killed: 0, saved: 0 });
});

test("a failed durable save and rapid or canceled gestures never reveal or consume another card", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft });
  await resume(page);
  await enter(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, "restoreFrightStorage", {
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
  await slide(page, "up");
  await expect(dialog(page).getByRole("alert")).toContainText(
    "could not be saved",
  );
  await expect(
    dialog(page).locator(".boiler-stage .boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(0);
  await footerVisible(page);
  await page.evaluate(() =>
    (
      window as unknown as { restoreFrightStorage: () => void }
    ).restoreFrightStorage(),
  );
  const target = dialog(page).locator(".boiler-stage");
  await target.evaluate((stage) => {
    stage.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
    );
    stage.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
    );
  });
  await expect(
    dialog(page).locator(".boiler-stage .boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(1);
  // A sub-threshold drag is canceled without writing or exposing the next card.
  const before = await log(page);
  const art = dialog(page).getByRole("group", {
    name: "Boiler Room revealed cards",
    exact: true,
  });
  const b = (await art.locator(".boiler-cover").boundingBox())!;
  await expect(target).toHaveAttribute("aria-disabled", "false");
  await expect(target).toHaveAttribute("data-phase", "idle");
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + 10, b.y + b.height / 2);
  await page.mouse.up();
  await expect(art).toHaveAttribute("data-phase", "idle");
  expect(await log(page)).toEqual(before);
  await page.screenshot({ path: info.outputPath("boiler-save-retry.png") });
  // A committed drag and keyboard activation share the same durable slide path.
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 - 60, {
    steps: 4,
  });
  await expect(dialog(page).locator(".boiler-drag-preview")).toContainText(
    "Release to reveal",
  );
  expect(await log(page)).toEqual(before);
  await page.mouse.up();
  await expect(
    dialog(page).locator(".boiler-stage .boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(2);
  await slide(page, "left");
  await expect(dialog(page)).toContainText("Dr. Fright attacks.");
  expect((await log(page)).length).toBe(before.length + 2);
});

test("legacy games remain unknown; fresh games initialize once and physical cards remain usable", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: { ...draft, playEvents: [start] } });
  await resume(page);
  await expect(panel(page)).toContainText("Sleep state not recorded");
  await panel(page)
    .getByRole("button", { name: "Record Final Girl Asleep", exact: true })
    .click();
  await expect(
    panel(page).getByRole("button", {
      name: "Use digital Boiler Room · fresh deck",
      exact: true,
    }),
  ).toBeDisabled();
  await panel(page)
    .getByRole("button", { name: "Record Final Girl Awake", exact: true })
    .click();
  await panel(page)
    .getByRole("button", {
      name: "Use digital Boiler Room · fresh deck",
      exact: true,
    })
    .click();
  await expect(panel(page)).toContainText("Digital cards");
  await page.reload();
  await resume(page);
  await expect(panel(page)).toContainText("Digital cards");
  expect(
    (await log(page))
      .filter((e) => e.moduleData?.module === "fright")
      .map((e) => parseFright(e.moduleData!.changes.snapshot))
      .filter((s) => s?.command === "setup"),
  ).toHaveLength(0);
});

test("fresh casts use verified setup once, and timeline Undo rewinds a dependent trip without rerolling", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: { ...draft, frightSetupVersion: 1, playEvents: [] },
  });
  await resume(page);
  await expect(
    panel(page).getByRole("button", {
      name: "Record Final Girl Awake",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await setTracker(page, "Killer health", 9);
  expect(summarizePlay(await log(page)).killerHealth).toBe(9);
  await panel(page)
    .getByRole("button", {
      name: "Use digital Boiler Room · fresh deck",
      exact: true,
    })
    .click();
  await enter(page);
  for (let i = 0; i < 2; i++) {
    await slide(page, "up");
    if (
      await dialog(page)
        .getByRole("button", { name: "Attack resolved", exact: true })
        .count()
    )
      await dialog(page)
        .getByRole("button", { name: "Attack resolved", exact: true })
        .click();
  }
  const raw = await log(page);
  const original = raw
    .filter((e) => e.moduleData?.module === "fright")
    .map((e) => parseFright(e.moduleData!.changes.snapshot))
    .find((s) => s?.command === "digital")!;
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  await openHistory(page);
  const timeline = page.getByRole("region", {
    name: "Game timeline",
    exact: true,
  });
  await timeline
    .locator("li")
    .filter({ has: page.getByText(/^Boiler Room card 1 resolved/) })
    .getByRole("button", { name: /^Undo / })
    .click();
  await panel(page)
    .getByRole("button", { name: /Continue Boiler Room/ })
    .click();
  await expect(
    dialog(page).locator(".boiler-stage .boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(0);
  await slide(page, "up");
  const current = (await log(page))
    .filter((e) => e.moduleData?.module === "fright")
    .map((e) => parseFright(e.moduleData!.changes.snapshot))
    .pop()!;
  expect(current.deal).toBe(original.deal);
  expect(current.reserve).toBe(original.reserve);
  expect(
    (await log(page)).filter(
      (e) =>
        e.moduleData?.module === "fright" &&
        parseFright(e.moduleData.changes.snapshot)?.command === "setup",
    ),
  ).toHaveLength(1);
});

test("Finale correction never reapplies a reveal effect and forced sleep survives a completed trip", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft });
  await resume(page);
  await panel(page).locator(".module-card-section > summary").click();
  await chooseKillerCard(panel(page), "Finale", "Face Your Fright");
  await expect(
    panel(page).getByRole("button", {
      name: "Record Final Girl Awake",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await panel(page)
    .getByRole("button", { name: "Record Finale sleep effect", exact: true })
    .click();
  await panel(page)
    .getByRole("button", { name: /Continue Boiler Room/ })
    .click();
  for (const d of ["up", "up", "left", "down"]) {
    await slide(page, d);
    if (
      await dialog(page)
        .getByRole("button", { name: "Attack resolved", exact: true })
        .count()
    )
      await dialog(page)
        .getByRole("button", { name: "Attack resolved", exact: true })
        .click();
  }
  await expect(dialog(page)).toContainText(
    "Face Your Fright keeps you Asleep.",
  );
  await expect(
    dialog(page).locator(".boiler-stage .boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(0);
  await footerVisible(page);
  await page.screenshot({ path: info.outputPath("boiler-forced-sleep.png") });
  await expect(dialog(page)).toContainText("Choose your first direction.");
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  const before = await log(page);
  await chooseKillerCard(panel(page), "Finale", "Face Your Fright");
  expect(await log(page)).toEqual(before);
  await page.getByRole("button", { name: "Finale", exact: true }).click();
  await expect(
    page.locator(".play-moment-editor").getByRole("region",{name:"Finale selection",exact:true}).locator(".module-revealed-hero h4"),
  ).toHaveText("Face Your Fright");
  expect(
    (await log(page)).filter(
      (e) => e.kind === "moment" && e.momentType === "finale",
    ),
  ).toHaveLength(1);
});

test("verified Rules are searchable; contextual victim death and cached narration omit hidden mechanics", async ({
  page,
  archive,
}) => {
  archive.films.push("s1-maple-lane");
  await archive.install(page, { draft });
  await installTestAudio(page);
  await resume(page);
  await enter(page);
  await slide(page, "up");
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const death = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  await death
    .getByRole("button", { name: "Killer attack", exact: true })
    .click();
  await death
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    death.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText("The ceiling");
  const request = archive.generationRequests.find(
    (r) => r.name === "generate-death-scene",
  );
  expect(JSON.stringify(request)).not.toContain("0132");
  await death
    .getByRole("button", { name: "Narrate death scene", exact: true })
    .click();
  await expect(
    death.getByRole("button", { name: "Stop death narration", exact: true }),
  ).toBeVisible();
  await death
    .getByRole("button", { name: "Stop death narration", exact: true })
    .click();
  await death
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Latest death scene", exact: true })
    .click();
  await expect(
    death.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText("The ceiling");
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
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
    .fill("Boiler Room");
  await page.getByRole("tab", { name: "Special Rules", exact: true }).click();
  await expect(
    page.getByText("Awake and Asleep", { exact: true }),
  ).toBeVisible();
});
