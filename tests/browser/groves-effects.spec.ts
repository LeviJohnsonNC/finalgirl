import { test, expect, activeGame, userId } from "./fixtures";
import { openModule } from "./play-helpers";
import type { PlayEvent } from "../../src/lib/play/events";
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
test("starting Event, token placement and observed Wrath remain explicit and independent", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...draft,
      selection: { ...selection, startingEvent: "Loud and Obnoxious" },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "groves");
  const p = page.locator('[data-module="groves"]');
  await p
    .getByRole("button", { name: "Activate starting Event", exact: true })
    .click();
  const holy = p.getByRole("button", {
    name: "Cycle tokens: Holy Groves",
    exact: true,
  });
  await holy.click();
  await holy.click();
  await expect(holy).toContainText("Fire and Brimstone");
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
  await p
    .getByRole("button", { name: "Set Divine Wrath to 6", exact: true })
    .click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
  await expect(holy).toContainText("Fire and Brimstone");
});
test("both Finale entry points preserve one reveal without executing Wrath effects", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "groves");
  await openModule(page, "inkanyamba");
  const p = page.locator('[data-module="groves"]'),
    ink = page.locator('[data-module="inkanyamba"]');
  await p
    .getByRole("button", { name: "Set Divine Wrath to 4", exact: true })
    .click();
  await ink
    .getByRole("button", { name: "Set Killer Wrath to 6", exact: true })
    .click();
  await page.getByRole("button", { name: "Finale", exact: true }).click();
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await expect(p.getByText("Bloodlust & Finale", { exact: true })).toHaveCount(
    0,
  );
  await ink.locator(".module-card-section > summary").click();
  await ink
    .getByRole("button", { name: "Choose Violent Tantrum", exact: true })
    .click();
  const raw: PlayEvent[] = await page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
  const finales = raw.filter((e) => e.momentType === "finale");
  expect(finales).toHaveLength(1);
  expect(finales[0].grovesReference).toBe(true);
  expect(finales[0].inkanyambaReference).toBe(true);
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("4/10");
  await expect(ink.getByLabel("Current Killer Wrath")).toHaveText("6/10");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "groves");
  await expect(p.getByText("Bloodlust & Finale", { exact: true })).toHaveCount(
    0,
  );
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("4/10");
});
