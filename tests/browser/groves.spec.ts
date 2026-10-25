import { test, expect, activeGame, userId, installTestAudio } from "./fixtures";
import { openModule, statusPick, openHistory } from "./play-helpers";
import { newPlayEvent, type PlayEvent } from "../../src/lib/play/events";
import { deathFacts } from "../../src/lib/play/death";
import { grovesEdgeId } from "../../supabase/functions/_shared/play/groves";
import type { Page } from "@playwright/test";
const selection = {
  ...activeGame.selection,
  killer: "Inkanyamba",
  location: "Sacred Groves",
  filmId: "s1-sacred-groves",
  startingEvent: null,
};
const draft = {
  ...activeGame,
  selection,
  playMode: true,
  grovesSetupVersion: 1,
  inkanyambaSetupVersion: 1,
};
const panel = (page: Page) => page.locator('[data-module="groves"]');
const log = (page: Page): Promise<PlayEvent[]> =>
  page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
const observe = (changes: Record<string, string | number | boolean | null>) =>
  newPlayEvent({ kind: "module", moduleData: { module: "groves", changes } });
const start = () =>
  newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 });
async function resume(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "groves");
}
for (const [killer, id] of [
  ["Inkanyamba", "inkanyamba"],
  ["Hans", "hans"],
  ["Billy the Bear", "billy"],
  ["Geppetto", "geppetto"],
  ["Dr. Fright", "fright"],
  ["Poltergeist", ""],
]) {
  test(`Divine Wrath, Atonement and role outcomes remain independent with ${killer}`, async ({
    page,
    archive,
  }) => {
    await archive.install(page, {
      draft: { ...draft, selection: { ...selection, killer } },
    });
    await resume(page);
    const p = panel(page);
    await expect(page.locator(".play-module-panel")).toHaveCount(id ? 2 : 1);
    if (id)
      expect(
        await page
          .locator(".play-module-panel")
          .first()
          .getAttribute("data-module"),
      ).toBe(id);
    await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
    await p
      .getByRole("button", { name: "Set Divine Wrath to 5", exact: true })
      .click();
    await p.locator(".wrath-atonement > summary").click();
    await p
      .getByRole("button", { name: "2 successes 5 → 2", exact: true })
      .click();
    await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
    await p
      .getByRole("button", { name: "Add The Tour Guide", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Mark The Tour Guide killed", exact: true })
      .click();
    const outcome = p.getByRole("region", {
      name: "Resolve special Victim outcome",
    });
    await expect(outcome).toContainText("Divine Wrath → 8");
    await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
    await outcome
      .getByRole("button", { name: "Cancel outcome", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Mark The Tour Guide killed", exact: true })
      .click();
    await outcome
      .getByRole("button", { name: "Record outcome", exact: true })
      .click();
    await expect(p.getByLabel("Current Divine Wrath")).toHaveText("8/10");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
    await p
      .locator(".module-character")
      .filter({ hasText: "The Tour Guide" })
      .locator(".module-correction > summary")
      .click();
    await statusPick(
      page,
      p.getByRole("combobox", { name: "The Tour Guide status", exact: true }),
      "Killed",
    );
    await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
    expect(
      (await log(page)).filter(
        (e) => e.kind === "killed" || e.kind === "saved",
      ),
    ).toHaveLength(0);
    await page.reload();
    await resume(page);
    await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
  });
}
test("Holy Man allocation and shared Atonement update both owners with atomic Undo", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await resume(page);
  await openModule(page, "inkanyamba");
  const p = panel(page),
    ink = page.locator('[data-module="inkanyamba"]');
  await ink
    .getByRole("button", { name: "Set Killer Wrath to 7", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Set Divine Wrath to 8", exact: true })
    .click();
  await p.locator(".wrath-atonement > summary").click();
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Atonement target", exact: true }),
    "Killer Wrath · 7",
  );
  await p
    .getByRole("button", { name: "2 successes 7 → 3", exact: true })
    .click();
  await expect(ink.getByLabel("Current Killer Wrath")).toHaveText("3/10");
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("8/10");
  await p
    .getByRole("button", { name: "Add The Holy Man", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Met Killer · you were there", exact: true })
    .click();
  const outcome = p.getByRole("region", {
    name: "Resolve special Victim outcome",
  });
  await outcome
    .getByRole("button", { name: "Record outcome", exact: true })
    .click();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("1/10");
  await expect(ink.getByLabel("Current Killer Wrath")).toHaveText("1/10");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(ink.getByLabel("Current Killer Wrath")).toHaveText("3/10");
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("8/10");
  await p
    .getByRole("button", { name: "Set Divine Wrath to 9", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Met Killer · you were absent", exact: true })
    .click();
  await statusPick(
    page,
    outcome.getByRole("combobox", {
      name: "Holy Man Divine allocation",
      exact: true,
    }),
    "8 Divine · 2 Killer",
  );
  await expect(outcome).toContainText("Killer Wrath → 5");
  await outcome
    .getByRole("button", { name: "Record outcome", exact: true })
    .click();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("10/10");
  await expect(ink.getByLabel("Current Killer Wrath")).toHaveText("5/10");
  const raw = await log(page),
    resolution = raw.filter((e) => e.grovesAction?.kind === "outcome").pop()!;
  expect(resolution.linkedModule?.changes.wrath).toBe(5);
  await page.reload();
  await resume(page);
  await openModule(page, "inkanyamba");
  await expect(ink.getByLabel("Current Killer Wrath")).toHaveText("5/10");
});
test("Holy Man without Inkanyamba uses the approved, clearly provisional Divine-only interpretation", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, {
    draft: { ...draft, selection: { ...selection, killer: "Hans" } },
  });
  await resume(page);
  const p = panel(page);
  await p
    .getByRole("button", { name: "Add The Holy Man", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Met Killer · you were absent", exact: true })
    .click();
  const outcome = p.getByRole("region", {
    name: "Resolve special Victim outcome",
  });
  await expect(outcome).toContainText("Provisional interpretation");
  await expect(outcome).toContainText("entire 10-point increase");
  await outcome.screenshot({
    path: info.outputPath("holy-man-provisional.png"),
  });
  await outcome
    .getByRole("button", { name: "Record outcome", exact: true })
    .click();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("10/10");
  expect((await log(page)).some((e) => e.linkedModule)).toBe(false);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
});
test("placed tokens persist separately from Events; signs identify actual connections and viewing references never writes", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await resume(page);
  const p = panel(page);
  await statusPick(
    page,
    p.getByRole("combobox", {
      name: "Fire and Brimstone token placement",
      exact: true,
    }),
    "Fire and Brimstone token · Holy Groves",
  );
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Closed token placement", exact: true }),
    "Closed token · Burial Ground",
  );
  await p.getByText("Events", { exact: true }).click();
  await p
    .getByRole("button", { name: "Activate Fire and Brimstone", exact: true })
    .click();
  await p
    .getByRole("button", {
      name: "End effect: Fire and Brimstone",
      exact: true,
    })
    .click();
  await expect(
    p.getByRole("combobox", {
      name: "Fire and Brimstone token placement",
      exact: true,
    }),
  ).toContainText("Holy Groves");
  await p.getByText("Out of Order connections", { exact: true }).click();
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Out of Order 1 connection", exact: true }),
    "Sacred Shrine ↔ Southwest trail",
  );
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Out of Order 2 connection", exact: true }),
    "Northwest trail ↔ Welcome Center",
  );
  expect(
    (await log(page)).filter(
      (e) => e.moduleData?.changes["sign.1"] === grovesEdgeId(["sw", "shrine"]),
    ),
  ).toHaveLength(1);
  const before = (await log(page)).length;
  await p.getByText("Setup reference", { exact: true }).click();
  await statusPick(
    page,
    p.getByRole("combobox", { name: "Sacred Groves Setup", exact: true }),
    "Mob O' Tourists",
  );
  await expect(
    p.getByRole("img", { name: /Mob O' Tourists setup diagram/ }),
  ).toBeVisible();
  expect((await log(page)).length).toBe(before);
  await p
    .getByRole("button", {
      name: "Activate Fickleness of the Gods",
      exact: true,
    })
    .click();
  await expect(
    p
      .locator(".module-active-reminder")
      .filter({ hasText: "At the END of Upkeep" }),
  ).toBeVisible();
  await page.reload();
  await resume(page);
  await expect(
    p.getByRole("combobox", { name: "Closed token placement", exact: true }),
  ).toContainText("Burial Ground");
});
test("legacy unknown state, rejected writes and offline recovery remain usable", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: { ...draft, grovesSetupVersion: undefined },
  });
  await resume(page);
  const p = panel(page);
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("?/10");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k.startsWith("final-girl-active-game-v1:"))
        throw new DOMException("quota", "QuotaExceededError");
      return original.call(this, k, v);
    };
    (window as unknown as { restoreStorage: () => void }).restoreStorage =
      () => {
        Storage.prototype.setItem = original;
      };
  });
  await p
    .getByRole("button", { name: "Set Divine Wrath to 7", exact: true })
    .click();
  await expect(p.getByRole("alert")).toContainText("could not be saved");
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("?/10");
  await page.evaluate(() =>
    (window as unknown as { restoreStorage: () => void }).restoreStorage(),
  );
  archive.failWrites = true;
  await p
    .getByRole("button", { name: "Set Divine Wrath to 7", exact: true })
    .click();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("7/10");
  await page.reload();
  await resume(page);
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("7/10");
  archive.failWrites = false;
});
test("actual art, controls, token references and meaningful role states fit laptop and narrow phone", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft });
  await resume(page);
  const p = panel(page);
  const sizes =
    info.project.name === "desktop"
      ? [
          [1280, 640],
          [1366, 768],
          [1440, 900],
        ]
      : [
          [320, 568],
          [390, 844],
        ];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    await p.locator(".groves-wrath").screenshot({
      path: info.outputPath(`groves-wrath-${width}.png`),
      animations: "disabled",
    });
    const site = p.getByRole("button", {
      name: "View tokens: Burial Ground",
      exact: true,
    });
    await expect(site.locator("strong")).toBeVisible();
    const tileBounds = await site.boundingBox(),
      captionBounds = await site.locator(".play-tile-caption").boundingBox();
    expect(captionBounds!.y).toBeGreaterThanOrEqual(tileBounds!.y);
    expect(captionBounds!.y + captionBounds!.height).toBeLessThanOrEqual(
      tileBounds!.y + tileBounds!.height,
    );
    await p.locator(".groves-site-grid").screenshot({
      path: info.outputPath(`groves-sites-${width}.png`),
      animations: "disabled",
    });
    await p.locator(".groves-people-grid").screenshot({
      path: info.outputPath(`groves-people-${width}.png`),
      animations: "disabled",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const button of await p.locator(".groves-track button").all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }
  await p
    .getByRole("button", { name: "Add The Tour Guide", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Add The Holy Man", exact: true })
    .click();
  await p
    .locator(".groves-people-grid")
    .screenshot({ path: info.outputPath("groves-active-portraits.png") });
  const images = await p.locator("svg image").evaluateAll((nodes) =>
    Promise.all(
      [...new Set(nodes.map((el) => el.getAttribute("href")!))].map(
        (src) =>
          new Promise<number>((resolve, reject) => {
            const im = new Image();
            im.onload = () => resolve(im.naturalWidth);
            im.onerror = reject;
            im.src = src;
          }),
      ),
    ),
  );
  expect(images.every((n) => n > 0)).toBe(true);
  await p
    .getByRole("button", { name: "Add The Uber Tourist", exact: true })
    .click();
  await p
    .locator(".module-character")
    .filter({ hasText: "The Uber Tourist" })
    .locator(".module-correction > summary")
    .click();
  await statusPick(
    page,
    p.getByRole("combobox", { name: "The Uber Tourist status", exact: true }),
    "Saved",
  );
  await p
    .locator(".groves-people-grid")
    .screenshot({ path: info.outputPath("groves-saved-portrait.png") });
  await statusPick(
    page,
    p.getByRole("combobox", { name: "The Uber Tourist status", exact: true }),
    "Killed",
  );
  await p
    .locator(".groves-people-grid")
    .screenshot({ path: info.outputPath("groves-aftermath-portrait.png") });
  await p.getByText("Events", { exact: true }).click();
  await p
    .locator(".groves-event-grid")
    .screenshot({ path: info.outputPath("groves-events.png") });
  await p.getByText("Out of Order connections", { exact: true }).click();
  await p
    .locator(".groves-board")
    .first()
    .screenshot({ path: info.outputPath("groves-connection-reference.png") });
});
test("historical linked facts survive JSONB sync, cached death reopening and narration", async ({
  page,
  archive,
}) => {
  await installTestAudio(page);
  const death = newPlayEvent({
    kind: "killed",
    quantity: 1,
    cause: "killer",
    room: "Sacred Shrine",
    victim: "The Tour Guide",
  });
  const paired = newPlayEvent({
    kind: "module",
    moduleData: {
      module: "groves",
      changes: {
        wrath: 1,
        "person.holy-man": "removed",
        "event.holy-man": "ended",
      },
    },
    grovesAction: {
      kind: "outcome",
      parent: "root",
      person: "holy-man",
      outcome: "blessed",
      incense: false,
    },
    linkedModule: { module: "inkanyamba", changes: { wrath: 1 } },
  });
  await archive.install(page, {
    draft: {
      ...draft,
      playEvents: [
        start(),
        observe({ wrath: 7, fire: "holy" }),
        paired,
        death,
        observe({ wrath: 9 }),
      ],
    },
  });
  await resume(page);
  await openHistory(page);
  await page
    .getByRole("button", { name: "Death details", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  await dialog
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    dialog.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText("ceiling");
  const saved = archive.sessions.find((s) => s.id === draft.id)!;
  const facts = deathFacts(
    selection,
    saved.state.playEvents as PlayEvent[],
    death.id,
  )!;
  expect(facts.moduleContext?.groves.wrath).toBe(1);
  expect(facts.moduleContext?.inkanyamba.wrath).toBe(1);
  await dialog
    .getByRole("button", { name: "Narrate death scene", exact: true })
    .click();
  await expect
    .poll(() => archive.calls.filter((c) => c === "narrate-story").length)
    .toBe(1);
  await dialog
    .getByRole("button", { name: "Save and exit", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Death details", exact: true })
    .click();
  await expect(
    dialog.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText("ceiling");
  expect(
    archive.calls.filter((c) => c === "generate-death-scene"),
  ).toHaveLength(1);
});
test("fresh mixed casting reaches ending and archive with searchable complete location Rules", async ({
  page,
  archive,
}, info) => {
  archive.films = ["s1-sacred-groves", "s1-camp-happy-trails"];
  await archive.install(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "START THE TAPE", exact: true })
    .click();
  for (const [slot, name] of ["Hans", "Sacred Groves", "Laurie"].entries()) {
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
  await openModule(page, "groves");
  await expect(panel(page).getByLabel("Current Divine Wrath")).toHaveText(
    "2/10",
  );
  await panel(page)
    .getByRole("button", { name: "Set Divine Wrath to 6", exact: true })
    .click();
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Won", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Ending narration", exact: true }),
  ).toContainText(archive.endingText);
  expect(
    archive.generationRequests.find((r) => r.name === "generate-ending")?.body
      .playSummary,
  ).toContain("Divine Wrath 6/10");
  await expect.poll(() => archive.history.length).toBe(1);
  expect(archive.history[0].location).toBe("Sacred Groves");
  await page
    .locator("footer")
    .getByRole("button", { name: "RULES", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search rules", exact: true })
    .fill("Fickleness of the Gods");
  await page.getByRole("tab", { name: "Special Rules", exact: true }).click();
  await expect(page.locator("#location-sacred-groves-rules")).toContainText(
    "Provisional",
  );
  await expect(page.locator("#location-sacred-groves-rules")).toContainText(
    "Fickleness of the Gods",
  );
  await page.screenshot({
    path: info.outputPath("groves-rules.png"),
    fullPage: true,
  });
});
