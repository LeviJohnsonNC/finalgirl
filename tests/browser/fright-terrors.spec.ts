import { test, expect, installTestAudio } from "./fixtures";
import {
  draft,
  panel,
  dialog,
  resume,
  log,
  slide,
  footerVisible,
} from "./fright-helpers";
import { searchPick, openHistory } from "./play-helpers";
import {
  frightState,
  frightForcedSleep,
} from "../../supabase/functions/_shared/play/fright";
import { summarizePlay } from "../../src/lib/play/events";
import { deathFacts } from "../../src/lib/play/death";

test("Minor Power artwork, empty/full/removed states and temporary reminders fit laptop and phone layouts", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft });
  await resume(page);
  const sizes =
    info.project.name === "desktop"
      ? [
          { width: 1280, height: 640 },
          { width: 1366, height: 768 },
          { width: 1440, height: 900 },
        ]
      : [
          { width: 320, height: 568 },
          { width: 390, height: 844 },
        ];
  for (const size of sizes) {
    await page.setViewportSize(size);
    await panel(page).locator(".fright-minors").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await panel(page)
      .locator(".fright-minors")
      .screenshot({
        path: info.outputPath(`minor-unknown-${size.width}.png`),
        animations: "disabled",
      });
  }
  await panel(page)
    .getByRole("button", { name: "Reveal Endless Sleep", exact: true })
    .click();
  await panel(page)
    .getByRole("button", { name: "Reveal Hellish Pursuit", exact: true })
    .click();
  await panel(page)
    .locator(".fright-minors")
    .screenshot({
      path: info.outputPath("minor-full.png"),
      animations: "disabled",
    });
  for (const button of await panel(page)
    .locator(".fright-minors")
    .getByRole("button")
    .all()) {
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await panel(page)
    .getByRole("button", { name: "Remove one Endless Sleep health, heart 1" })
    .click();
  for (let i = 0; i < 2; i++)
    await panel(page)
      .getByRole("button", {
        name: "Remove one Hellish Pursuit health, heart 1",
      })
      .click();
  await panel(page)
    .locator(".fright-minors")
    .screenshot({
      path: info.outputPath("minor-removed.png"),
      animations: "disabled",
    });
  await panel(page)
    .getByText("Terror cards & temporary effects", { exact: true })
    .click();
  await searchPick(
    page,
    "Dr. Fright Terror card reference",
    "Better Stay Up Late",
  );
  await panel(page)
    .getByRole("button", {
      name: "Track Better Stay Up Late effect",
      exact: true,
    })
    .click();
  await panel(page)
    .locator(".fright-active-effect")
    .screenshot({
      path: info.outputPath("temporary-effect.png"),
      animations: "disabled",
    });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

for (const location of [
  "Maple Lane",
  "Camp Happy Trails",
  "Buddyland",
  "Carnival of Blood",
]) {
  test(`Minor Powers preserve one/two Health and forced sleep with ${location}`, async ({
    page,
    archive,
  }, info) => {
    await archive.install(page, {
      draft: { ...draft, selection: { ...draft.selection, location } },
    });
    await resume(page);
    const before = await log(page);
    await panel(page)
      .getByRole("button", { name: "Reveal Hellish Pursuit", exact: true })
      .click();
    // The labelled article remains stable as its compact reveal button becomes
    // an expanded health panel, then a compact removed state.
    const hellish = panel(page).getByRole("article", { name: "Hellish Pursuit", exact: true });
    const endless = panel(page).getByRole("article", { name: "Endless Sleep", exact: true });
    await expect(
      hellish
        .getByRole("group", { name: "Hellish Pursuit health" })
        .getByRole("button"),
    ).toHaveCount(2);
    await hellish
      .getByRole("button", {
        name: "Remove one Hellish Pursuit health, heart 2",
      })
      .click();
    await expect(
      hellish.getByText("1/2 health", { exact: true }),
    ).toBeVisible();
    await endless
      .getByRole("button", { name: "Reveal Endless Sleep", exact: true })
      .click();
    await expect(
      endless
        .getByRole("group", { name: "Endless Sleep health" })
        .getByRole("button"),
    ).toHaveCount(1);
    await expect(
      endless.getByText("1/1 health", { exact: true }),
    ).toBeVisible();
    await expect(
      panel(page).getByRole("button", {
        name: "Record Final Girl Awake",
        exact: true,
      }),
    ).toBeDisabled();
    const saved = await log(page);
    expect(saved.length).toBe(before.length + 3);
    expect(frightState(summarizePlay(saved).entries)).toMatchObject({
      sleep: "asleep",
      minor: { "hellish-pursuit": 1, "endless-sleep": 1 },
    });
    await page.reload();
    await resume(page);
    await expect(
      endless.getByText("1/1 health", { exact: true }),
    ).toBeVisible();
    if (location === "Maple Lane") {
      await page.setViewportSize(
        info.project.name === "desktop"
          ? { width: 1280, height: 640 }
          : { width: 320, height: 568 },
      );
      await panel(page).locator(".fright-minors").scrollIntoViewIfNeeded();
      await panel(page)
        .locator(".fright-minors")
        .screenshot({
          path: info.outputPath("fright-minor-active.png"),
          animations: "disabled",
        });
    }
    await endless
      .getByRole("button", { name: "Remove one Endless Sleep health, heart 1" })
      .click();
    await expect(
      panel(page).getByRole("button", {
        name: "Record Final Girl Awake",
        exact: true,
      }),
    ).toBeEnabled();
    expect(frightState(summarizePlay(await log(page)).entries)?.sleep).toBe(
      "asleep",
    );
    await openHistory(page);
    await page
      .getByRole("region", { name: "Game timeline", exact: true })
      .getByRole("button", { name: /^Undo / })
      .first()
      .click();
    await expect(
      panel(page).getByRole("button", {
        name: "Record Final Girl Awake",
        exact: true,
      }),
    ).toBeDisabled();
    expect(summarizePlay(await log(page))).toMatchObject({
      saved: 0,
      killed: 0,
    });
  });
}

test("temporary card references never write until tracked; reminders end explicitly and optional resets stay Asleep", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await resume(page);
  const before = await log(page);
  await panel(page)
    .getByText("Terror cards & temporary effects", { exact: true })
    .click();
  await searchPick(page, "Dr. Fright Terror card reference", "Blurred Reality");
  expect(await log(page)).toEqual(before);
  await panel(page)
    .getByRole("button", { name: "Track Blurred Reality effect", exact: true })
    .click();
  await expect(
    panel(page).locator(".fright-consequence").first(),
  ).toContainText("damage each other while Awake");
  await page.reload();
  await resume(page);
  await expect(panel(page).locator(".fright-active-effect")).toContainText(
    "Blurred Reality",
  );
  await panel(page)
    .getByRole("button", { name: "End effect: Blurred Reality", exact: true })
    .click();
  await expect(panel(page).locator(".fright-active-effect")).toHaveCount(0);
  await panel(page)
    .getByRole("button", { name: "Record Final Girl Asleep", exact: true })
    .click();
  await panel(page)
    .getByRole("button", { name: /Continue Boiler Room/ })
    .click();
  await slide(page, "up");
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  await panel(page)
    .getByText("Terror cards & temporary effects", { exact: true })
    .click();
  await searchPick(
    page,
    "Dr. Fright Terror card reference",
    "Never Sleep Again",
  );
  await panel(page)
    .getByRole("button", {
      name: "Reset Boiler Room · remain Asleep",
      exact: true,
    })
    .click();
  expect(frightState(summarizePlay(await log(page)).entries)).toMatchObject({
    sleep: "asleep",
    path: "",
    deal: "2301",
  });
});

test("Endless Sleep resets completed decks and cannot override a Finale when removed", async ({
  page,
  archive,
}, info) => {
  await archive.install(page, { draft });
  await resume(page);
  await panel(page)
    .getByRole("button", { name: "Reveal Endless Sleep", exact: true })
    .click();
  await panel(page)
    .getByRole("button", { name: /Continue Boiler Room/ })
    .click();
  for (const direction of ["up", "up", "left"]) await slide(page, direction);
  await dialog(page)
    .getByRole("button", { name: "Attack resolved", exact: true })
    .click();
  await slide(page, "down");
  const entries = summarizePlay(await log(page)).entries;
  expect(frightState(entries)).toMatchObject({
    sleep: "asleep",
    path: "",
    cycle: 2,
  });
  expect(frightForcedSleep(entries)).toBe(true);
  await expect(
    dialog(page).locator(".boiler-card-layer:not(.boiler-cover)"),
  ).toHaveCount(0);
  await expect(
    dialog(page).getByRole("button", {
      name: "Record Final Girl Awake",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(dialog(page).locator(".boiler-notice")).toContainText(
    "Endless Sleep",
  );
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  await panel(page).locator(".module-card-section > summary").click();
  await panel(page)
    .getByRole("button", { name: "Choose Face Your Fright", exact: true })
    .click();
  await page.setViewportSize(
    info.project.name === "desktop"
      ? { width: 1280, height: 640 }
      : { width: 320, height: 568 },
  );
  await panel(page)
    .getByRole("button", { name: /Continue Boiler Room/ })
    .click();
  await expect(dialog(page).locator(".boiler-notice")).toContainText(
    "Face Your Fright and Endless Sleep keep you Asleep",
  );
  await footerVisible(page);
  await page.screenshot({
    path: info.outputPath("fright-combined-forced.png"),
  });
  await dialog(page)
    .getByRole("button", { name: "Back to game", exact: true })
    .click();
  await panel(page)
    .getByRole("button", { name: "Remove one Endless Sleep health, heart 1" })
    .click();
  await expect(
    panel(page).getByRole("button", {
      name: "Record Final Girl Awake",
      exact: true,
    }),
  ).toBeDisabled();
});

test("failed Minor Power saves are retryable, keep sleep unchanged and do not consume a heart", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await resume(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, "restoreFrightStorage", {
      value: () => {
        Storage.prototype.setItem = original;
      },
    });
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("final-girl-active-game-v1:"))
        throw new DOMException("Full", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  const before = await log(page);
  await panel(page)
    .getByRole("button", { name: "Reveal Endless Sleep", exact: true })
    .click();
  expect(await log(page)).toEqual(before);
  await expect(
    panel(page).getByRole("button", {
      name: "Record Final Girl Awake",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() =>
    (
      window as unknown as { restoreFrightStorage: () => void }
    ).restoreFrightStorage(),
  );
  await panel(page)
    .getByRole("button", { name: "Reveal Endless Sleep", exact: true })
    .click();
  expect(frightState(summarizePlay(await log(page)).entries)).toMatchObject({
    sleep: "asleep",
    minor: { "endless-sleep": 1 },
  });
});

test("Crucifix Terror scenes use historical Minor context, cache and narrate; new Rules are searchable", async ({
  page,
  archive,
}) => {
  archive.films.push("s1-maple-lane");
  await archive.install(page, { draft });
  await installTestAudio(page);
  await resume(page);
  await panel(page)
    .getByRole("button", { name: "Reveal Endless Sleep", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Record one victim killed", exact: true })
    .click();
  const death = page.getByRole("dialog", {
    name: "Gruesome Death",
    exact: true,
  });
  await death.getByRole("button", { name: "Terror card", exact: true }).click();
  await searchPick(page, "Terror card", "Grab Your Crucifix");
  await death
    .getByRole("button", { name: "Gruesome Death", exact: true })
    .click();
  await expect(
    death.getByRole("region", { name: "Generated death scene", exact: true }),
  ).toContainText("The ceiling");
  const saved = await log(page);
  const event = saved.find((e) => e.kind === "killed")!;
  expect(
    deathFacts(draft.selection, saved, event.id)?.moduleContext?.fright,
  ).toMatchObject({ "minor.endless-sleep.health": 1 });
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
    .fill("Endless Sleep");
  await page.getByRole("tab", { name: "Special Rules", exact: true }).click();
  await expect(
    page.getByText("Minor Dark Powers", { exact: true }),
  ).toBeVisible();
});
