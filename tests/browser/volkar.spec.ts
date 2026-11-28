import { activeGame, expect, test, userId } from "./fixtures";
import {
  openModule,
  chooseKillerCard,
  openMinorPowers,
  showMinorChoices,
  undoLatestObservation,
} from "./play-helpers";
import { newPlayEvent } from "../../src/lib/play/events";
import {
  VOLKAR,
  VOLKAR_WIN,
} from "../../supabase/functions/_shared/play/volkar";

test("a concealed hunt, blind attack and Self-Destruct survive correction and reload", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(100000);
  const key = "final-girl-active-game-v1:" + userId;
  const start = newPlayEvent({ kind: "start", round: 1, saved: 0, killed: 0 });
  const concealed = newPlayEvent({
    kind: "module",
    moduleData: { module: "volkar", changes: { hunt: "concealed" } },
  });
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: {
        ...activeGame.selection,
        killer: VOLKAR,
        location: "Pesadilla Verde",
        filmId: "s4-green-terror",
        finalGirl: "Dakota",
      },
      playMode: true,
      playEvents: [start, concealed],
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "volkar");
  const panel = page.locator("[data-module=volkar]");
  const label = panel.locator(".play-module-summary");
  await expect(label).toHaveText("Concealed");
  await panel
    .getByRole("button", { name: "Blind attack", exact: true })
    .click();
  await panel.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).playEvents.length,
      key,
    ),
  ).toBe(2);
  await panel.getByRole("button", { name: /Concealed Reveal/ }).click();
  await expect(label).toHaveText("Visible");
  await panel.getByRole("button", { name: /Visible Record Concealed/ }).click();
  await panel
    .getByRole("button", { name: "Blind attack", exact: true })
    .click();
  await page.evaluate((k) => {
    const save = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === k) {
        Storage.prototype.setItem = save;
        throw new Error("storage unavailable");
      }
      save.call(this, key, value);
    };
  }, key);
  await panel.getByRole("button", { name: "Ambushed", exact: true }).click();
  await expect(
    panel.getByText("This change could not be saved. Please try again."),
  ).toBeVisible();
  await panel.getByRole("button", { name: "Ambushed", exact: true }).click();
  await expect(label).toHaveText("Visible · Ambushed");
  await panel
    .locator(".volkar-controls > .play-illustrated-tile")
    .screenshot({ path: info.outputPath("ambush.jpg") });
  await undoLatestObservation(page);
  await expect(label).toHaveText("Concealed");
  await panel
    .getByRole("button", { name: "Blind attack", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Hit the Volk’ar", exact: true })
    .click();
  await expect(label).toContainText("Hit the Volk’ar");
  await panel
    .locator(".volkar-controls > .play-illustrated-tile")
    .screenshot({ path: info.outputPath("hit.jpg") });
  await openMinorPowers(panel);
  await panel.getByRole("button", { name: "Reveal Energy Shield" }).click();
  await panel
    .getByRole("button", { name: "Add one Health to Energy Shield" })
    .click();
  await panel
    .getByRole("button", { name: "Add one Health to Energy Shield" })
    .click();
  await showMinorChoices(panel);
  await panel.getByRole("button", { name: "Reveal Collector" }).click();
  await expect(
    panel.getByRole("article", { name: "Energy Shield" }),
  ).toContainText("3 health");
  for (let i = 0; i < 3; i++)
    await panel
      .getByRole("button", { name: "Remove one Health from Energy Shield" })
      .click();
  await expect(
    panel.getByRole("article", { name: "Energy Shield" }),
  ).toContainText("Removed · 0 health");
  await undoLatestObservation(page);
  await expect(
    panel.getByRole("article", { name: "Energy Shield" }),
  ).toContainText("1 health");
  await expect(panel.getByRole("article", { name: "Collector" })).toContainText(
    "3/3 health",
  );
  const timeline = page.getByRole("button", { name: /^The night so far/ });
  await timeline.click();
  await page
    .getByRole("region", { name: "Game timeline" })
    .getByRole("button", { name: /^Restore / })
    .first()
    .click();
  await timeline.click();
  await expect(
    panel.getByRole("article", { name: "Energy Shield" }),
  ).toContainText("Removed · 0 health");
  await panel.locator(".module-card-section > summary").click();
  await chooseKillerCard(panel, "Dark Power", "Merciless Ambush");
  await chooseKillerCard(panel, "Finale", "Self-Destruct");
  await expect(label).toHaveText("Visible");
  await expect(panel).toContainText("3 charges remaining");
  await panel
    .getByRole("button", { name: "Set remaining charges to 2" })
    .click();
  await panel.getByRole("button", { name: /Visible Record Concealed/ }).click();
  await chooseKillerCard(panel, "Finale", "Rampage");
  await chooseKillerCard(panel, "Finale", "Self-Destruct");
  await expect(panel).toContainText("2 charges remaining");
  await expect(label).toHaveText("Concealed");
  await page.reload();
  const resume = page.getByRole("button", { name: "RESUME GAME", exact: true });
  if (await resume.isVisible()) await resume.click();
  await openModule(page, "volkar");
  await expect(label).toHaveText("Concealed");
  const disclosure = panel.locator(".module-card-section");
  if ((await disclosure.getAttribute("open")) === null)
    await disclosure.locator("summary").first().click();
  await expect(panel).toContainText("2 charges remaining");
  await panel.locator(".module-revealed-hero img").evaluateAll((images) =>
    Promise.all(
      images.map(async (node) => {
        const image = node as HTMLImageElement;
        image.loading = "eager";
        await image.decode();
      }),
    ),
  );
  await panel.screenshot({
    style: "footer { visibility: hidden; }",
    path: info.outputPath("populated-hunt.jpg"),
  });
  await page.getByRole("button", { name: "Finish game" }).click();
  await page.getByRole("button", { name: VOLKAR_WIN }).click();
  await expect(
    page.getByRole("combobox", { name: "Game result" }),
  ).toContainText(VOLKAR_WIN);
  if (info.project.name === "desktop") {
    await page
      .getByRole("button", { name: "Generate ending", exact: true })
      .click();
    await expect
      .poll(() =>
        JSON.stringify(
          archive.generationRequests.find((r) => r.name === "generate-ending")
            ?.body ?? {},
        ),
      )
      .toContain(VOLKAR_WIN);
    await expect(
      page.getByText(archive.endingText, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Save to scrapbook", exact: true })
      .click();
  } else {
    await page.getByRole("button", { name: "Save record only" }).click();
  }
  await expect
    .poll(() => JSON.stringify(archive.history))
    .toContain(VOLKAR_WIN);
});

test("the film alone supplies both girls, a killer and a location for casting", async ({
  page,
  archive,
}, info) => {
  archive.films = ["s4-green-terror"];
  archive.aiCastingArt = info.project.name === "mobile";
  await archive.install(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "START THE TAPE", exact: true })
    .click();
  for (const [index, name] of [VOLKAR, "Pesadilla Verde", "Alois"].entries()) {
    await page
      .getByRole("button", { name: "Choose", exact: true })
      .nth(index)
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: new RegExp(name) })
      .click();
  }
  await page
    .getByRole("button", { name: "Choose", exact: true })
    .nth(2)
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Dakota/ })
    .click();
  await expect(
    page.getByRole("button", { name: "View Dakota info" }),
  ).toBeVisible();
  await page
    .locator(".casting-tableau")
    .screenshot({ path: info.outputPath("film-cast.jpg") });
  if (info.project.name === "desktop") {
    await page
      .getByRole("button", { name: "Choose", exact: true })
      .nth(2)
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Alois/ })
      .click();
  }
  await page.getByRole("button", { name: "Press Play" }).click();
  await expect(page.locator(".casting-tableau")).toHaveCount(0);
});

test("inspects card choices, the second reveal entry and Ultimate portraits at table sizes", async ({
  page,
  archive,
}, info) => {
  test.setTimeout(100000);
  const girl = info.project.name === "mobile" ? "Dakota" : "Alois";
  const start = newPlayEvent({ kind: "start", round: 1, killed: 0, saved: 0 });
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: { ...activeGame.selection, killer: VOLKAR, finalGirl: girl },
      playMode: true,
      playEvents: [start],
    },
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "volkar");
  const panel = page.locator("[data-module=volkar]");
  await expect(panel.locator(".play-module-summary")).toHaveText(
    "Visibility unrecorded",
  );
  await panel.locator(".module-card-section > summary").click();
  await openMinorPowers(panel);
  for (const width of info.project.name === "mobile"
    ? [320, 390]
    : [1280, 1366, 1440]) {
    await page.setViewportSize({
      width,
      height: width === 320 ? 568 : width === 390 ? 844 : 900,
    });
    const cards = panel.locator(".module-killer-card, .module-minor-choice");
    await expect(cards).toHaveCount(11);
    for (const card of await cards.all()) {
      const box = await card.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      const img = card.locator("img").first();
      await img.evaluate(async (i: HTMLImageElement) => {
        i.loading = "eager";
        await i.decode();
      });
    }
    await panel
      .locator(".module-card-section")
      .screenshot({
        style: "footer { visibility: hidden; }",
        path: info.outputPath("card-choices-" + width + ".jpg"),
      });
    await panel
      .locator(".module-minor-section")
      .screenshot({
        style: "footer { visibility: hidden; }",
        path: info.outputPath("minor-choices-" + width + ".jpg"),
      });
  }
  await page.getByRole("button", { name: "Finale", exact: true }).click();
  const editor = page
    .locator(".play-moment-editor")
    .filter({ has: page.locator(".module-reveals") });
  await editor
    .getByRole("button", { name: "Reveal without a card name (Finale)" })
    .click();
  await chooseKillerCard(editor, "Finale", "Self-Destruct");
  await expect(editor).toContainText("Countdown unrecorded");
  await expect(panel.locator(".play-module-summary")).toHaveText(
    "Visibility unrecorded",
  );
  await editor
    .getByRole("button", { name: "Set remaining charges to 0" })
    .click();
  await editor.getByRole("button", { name: "Record", exact: true }).click();
  const ultimate = page
    .locator(".play-moment-seal")
    .filter({ hasText: "Locked" })
    .locator("..");
  await ultimate.click();
  await expect(
    page
      .locator("button:has(.play-moment-seal)")
      .filter({ hasText: "Unlocked" })
      .locator("img"),
  ).toHaveAttribute("src", /ultimate/);
  await page.getByRole("button", { name: "View " + girl + " info" }).click();
  const dossier = page.getByRole("dialog");
  await expect(dossier.locator(".girl-dossier-photo img")).toHaveAttribute(
    "src",
    /ultimate/,
  );
  await dossier.locator(".girl-ability > summary").click();
  await expect(dossier).toContainText("Recorded this game");
  await dossier.screenshot({ path: info.outputPath("ultimate-dossier.jpg") });
  await page.keyboard.press("Escape");
  await undoLatestObservation(page);
  await expect(
    page.getByRole("button", { name: "Ultimate unlocked" }),
  ).toContainText("Locked");
  await page.getByRole("button", { name: "Ultimate unlocked" }).click();
  await expect(
    page.getByRole("button", { name: "Ultimate unlocked" }),
  ).toContainText("Unlocked");
  await page.getByRole("button", { name: "Finish game" }).click();
  await page.getByRole("button", { name: "Lost", exact: true }).click();
  await page.getByRole("combobox", { name: "Self-Destruct loss" }).click();
  await page.getByRole("option", { name: "The Countdown expired" }).click();
  await page.getByRole("button", { name: "Save record only" }).click();
  await expect
    .poll(() => JSON.stringify(archive.history))
    .toContain("The Countdown expired");
});

test("mixed casting supports shuffle and independent selections", async ({
  page,
  archive,
}) => {
  archive.films = ["s4-green-terror", "s1-camp-happy-trails"];
  await archive.install(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "START THE TAPE", exact: true })
    .click();
  const shuffles = page.getByRole("button", { name: "Shuffle", exact: true });
  await expect(shuffles).toHaveCount(3);
  for (const button of await shuffles.all()) await button.click();
  await expect(page.getByRole("button", { name: "Press Play" })).toBeEnabled();
  for (const [index, name] of [
    VOLKAR,
    "Camp Happy Trails",
    "Alois",
  ].entries()) {
    await page
      .getByRole("button", { name: "Choose", exact: true })
      .nth(index)
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: new RegExp(name) })
      .click();
  }
  await expect(
    page.getByRole("button", { name: "View Camp Happy Trails info" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Press Play" }).click();
  await expect(page.locator(".casting-tableau")).toHaveCount(0);
});

test("the Mall unlock changes the Ultimate face independently of low Health", async ({
  page,
  archive,
}, info) => {
  const name = info.project.name === "mobile" ? "Alois" : "Dakota";
  archive.aiCastingArt = true;
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      coreTrackersVersion: 1,
      mallSetupVersion: 1,
      selection: {
        ...activeGame.selection,
        killer: "Hans",
        location: "Sunnydaze Mall",
        finalGirl: name,
        finalGirlStartingHealth: name === "Alois" ? 5 : 6,
      },
      playEvents: [],
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "sunnydaze-mall");
  const panel = page.locator("[data-module=sunnydaze-mall]");
  await panel
    .getByRole("button", { name: "I Believe You!", exact: true })
    .click();
  await panel.getByRole("button", { name: "Escaped!", exact: true }).click();
  const face = page.getByRole("button", {
    name: "Ultimate unlocked",
    exact: true,
  });
  await expect(face.locator("img")).toHaveAttribute("src", /ultimate/);
  await undoLatestObservation(page);
  await expect(face).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("button", { name: "Set Final Girl health", exact: true })
    .click();
  await page.getByLabel("Final Girl health value", { exact: true }).fill("2");
  await page
    .locator(".play-state--finalGirlHealth")
    .getByRole("button", { name: "Set", exact: true })
    .click();
  await expect(
    page.locator(".play-state--finalGirlHealth .play-stat-portrait"),
  ).toHaveAttribute("data-health-portrait", "critical");
  await expect(face).toHaveAttribute("aria-pressed", "false");
});

test("the Rules and Collection can be consulted before finishing a sparse game", async ({
  page,
  archive,
}) => {
  archive.films = ["s4-green-terror"];
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      selection: {
        ...activeGame.selection,
        killer: VOLKAR,
        finalGirl: "Dakota",
        location: "Pesadilla Verde",
      },
      playEvents: [
        newPlayEvent({ kind: "start", round: 1, saved: 0, killed: 0 }),
      ],
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Collection", exact: true }).click();
  const film = page.locator('[data-film-id="s4-green-terror"]');
  await expect(
    film.getByRole("img", { name: "The Green Terror box art", exact: true }),
  ).toBeVisible();
  await expect(
    film.getByRole("button", { name: "View Dakota info" }),
  ).toBeVisible();
  await page
    .locator("footer")
    .getByRole("button", { name: "Back", exact: true })
    .click();
  await page.getByRole("button", { name: "Rules", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search rules", exact: true })
    .fill("Merciless Ambush");
  await page.getByRole("tab", { name: "Special Rules", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Attack Resolution");
  await expect(page.getByRole("tabpanel")).toContainText("Merciless Ambush");
  await page
    .locator("footer")
    .getByRole("button", { name: "Back", exact: true })
    .click();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "volkar");
  const module = page.locator("[data-module=volkar]");
  await expect(module.locator(".play-module-summary")).toHaveText(
    "Visibility unrecorded",
  );
  await module
    .getByRole("button", { name: "Record Visible", exact: true })
    .focus();
  await expect(
    module.getByRole("button", { name: "Record Visible", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Finish game", exact: true }).click();
  await page.getByRole("button", { name: "Lost", exact: true }).click();
  await page
    .getByRole("button", { name: "Save record only", exact: true })
    .click();
  await expect.poll(() => archive.history.length).toBe(1);
  expect(JSON.stringify(archive.history)).not.toContain("Countdown expired");
});
