import { test, expect, activeGame, userId } from "./fixtures";
import { openModule, statusPick } from "./play-helpers";
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
test("starting Event activation, Fire and Brimstone doubling and explicit Incense combine in one previewed increase", async ({
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
  await expect(p.getByRole("region", { name: "Starting Event" })).toContainText(
    "Loud and Obnoxious",
  );
  await p
    .getByRole("button", { name: "Activate starting Event", exact: true })
    .click();
  await statusPick(
    page,
    p.getByRole("combobox", {
      name: "Fire and Brimstone token placement",
      exact: true,
    }),
    "Fire and Brimstone token · Holy Groves",
  );
  await p.getByText("Sacred-space increase", { exact: true }).click();
  await p.getByLabel("Victims at Burial Ground", { exact: true }).fill("0");
  await p.getByLabel("Victims at Sacred Shrine", { exact: true }).fill("0");
  await p.getByLabel("Victims at Holy Groves", { exact: true }).fill("2");
  await expect(
    p.getByRole("button", { name: "Apply increase · 2 → 7", exact: true }),
  ).toBeEnabled();
  await p
    .getByRole("checkbox", {
      name: "Incense applies to this increase",
      exact: true,
    })
    .check();
  await p
    .getByRole("button", { name: "Apply increase · 2 → 6", exact: true })
    .click();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("6/10");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("2/10");
  await expect(
    p.getByRole("combobox", {
      name: "Fire and Brimstone token placement",
      exact: true,
    }),
  ).toContainText("Holy Groves");
});
test("both Finale entry points enable one recurring location reminder without executing Wrath effects", async ({
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
  await expect(p.getByText("Finale revealed:", { exact: true })).toBeVisible();
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
  await expect(p.getByText("Finale revealed:", { exact: true })).toBeVisible();
  await expect(p.getByLabel("Current Divine Wrath")).toHaveText("4/10");
});
