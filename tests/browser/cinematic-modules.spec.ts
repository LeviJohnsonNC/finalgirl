import { test, expect, activeGame, userId } from "./fixtures";
import { openModule } from "./play-helpers";
import { newPlayEvent } from "../../src/lib/play/events";

const selection = {
  ...activeGame.selection,
  killer: "Inkanyamba",
  location: "Sacred Groves",
  startingEvent: null,
};
const draft = {
  ...activeGame,
  selection,
  playMode: true,
  grovesSetupVersion: 1,
  inkanyambaSetupVersion: 1,
};

test("Minor powers expand independently and depleted health stays editable through Undo and reload", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "inkanyamba");
  const panel = page.locator('[data-module="inkanyamba"]');
  const power = panel.locator(".module-minor").filter({
    has: page.getByRole("button", {
      name: "Reveal Boiling Anger",
      exact: true,
    }),
  });
  const before = (await power.boundingBox())!.height;
  await panel
    .getByRole("button", { name: "Reveal Boiling Anger", exact: true })
    .click();
  const active = panel.locator(".module-minor").filter({
    has: page.getByRole("heading", { name: "Boiling Anger", exact: true }),
  });
  await expect(active).toHaveAttribute("data-active", "true");
  expect((await active.boundingBox())!.height).toBeGreaterThan(before * 1.5);
  await panel
    .getByRole("button", { name: "Reveal Outrageholic", exact: true })
    .click();
  await expect(panel.locator('.module-minor[data-active="true"]')).toHaveCount(
    2,
  );
  for (let i = 0; i < 3; i++)
    await panel
      .getByRole("button", { name: /^Remove one Boiling Anger health/ })
      .first()
      .click();
  await expect(active).toHaveAttribute("data-state", "removed");
  await expect(active).toContainText("Removed · 0/3 health");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(active).toHaveAttribute("data-active", "true");
  await expect(active).toContainText("1/3 health");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "inkanyamba");
  await expect(active).toContainText("1/3 health");
  await expect(panel.getByText("Wrath reference", { exact: true })).toHaveCount(
    0,
  );
  const raw = await page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
  expect(
    raw.filter(
      (e: { kind: string }) => e.kind === "killed" || e.kind === "state",
    ),
  ).toHaveLength(0);
});

test("Wrath scenery escalates without Unleash text; mixed Sacred states and Terror retain their actual observations", async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...draft,
      playEvents: [
        newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }),
        newPlayEvent({
          kind: "module",
          moduleData: {
            module: "groves",
            changes: {
              wrath: 2,
              closed: "burial",
              fire: "burial",
              hallowed: "burial",
              fickleness: "ended",
            },
          },
        }),
      ],
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "inkanyamba");
  await openModule(page, "groves");
  for (const [kind, name] of [
    ["killer", "Killer"],
    ["divine", "Divine"],
  ]) {
    const board = page.locator(`.wrath-board--${kind}`);
    const sources = new Set<string>();
    for (const level of [1, 3, 5, 7, 9]) {
      await board
        .getByRole("button", {
          name: `Set ${name} Wrath to ${level}`,
          exact: true,
        })
        .click();
      await expect(board).toHaveAttribute(
        "data-wrath-stage",
        String(Math.ceil(level / 2)),
      );
      sources.add((await board.locator("img").getAttribute("src"))!);
      await expect(board.locator("img")).toHaveJSProperty("complete", true);
      expect(
        await board
          .locator("img")
          .evaluate((el: HTMLImageElement) => el.naturalWidth),
      ).toBeGreaterThan(0);
    }
    expect(sources.size).toBe(5);
    await expect(board.locator(".wrath-unleash")).toHaveCount(0);
  }
  const space = page.getByRole("button", {
    name: "Cycle tokens: Burial Ground",
    exact: true,
  });
  await expect(space).toContainText(
    "Closed · Fire and Brimstone · Hallowed Ground",
  );
  const cells = await space.locator("svg").getAttribute("viewBox");
  expect(cells).toBe("1155 387 378 378");
  const snapshots = await page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents.length,
    userId,
  );
  await space.click(); // mixed state opens editor, never cycles away observations
  expect(
    await page.evaluate(
      (owner) =>
        JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
          .playEvents.length,
      userId,
    ),
  ).toBe(snapshots);
  const terror = page.locator(".groves-ongoing-terror");
  await expect(terror.locator(".module-active-reminder")).toHaveCount(0);
  expect(
    (await terror.getByRole("button").boundingBox())!.height,
  ).toBeGreaterThanOrEqual(195);
  await terror
    .getByRole("button", {
      name: "Activate Fickleness of the Gods",
      exact: true,
    })
    .click();
  await expect(terror).toHaveAttribute("data-state", "active");
  await terror
    .getByRole("button", {
      name: "End effect: Fickleness of the Gods",
      exact: true,
    })
    .click();
  await expect(terror).toHaveAttribute("data-state", "ended");
});

test("Hans keeps two distinct revealed powers in both entry points and reduced motion disables entrance effects", async ({
  page,
  archive,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "hans");
  const panel = page.locator('[data-module="hans"]');
  await panel.locator(".module-card-section > summary").click();
  await panel
    .getByRole("button", { name: "Choose Dark Obsession", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Choose Dark, Darker, Darkest", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Choose second power Feed", exact: true })
    .click();
  await expect(
    panel.locator(".module-second-power .module-revealed-hero h4"),
  ).toHaveText("Feed");
  await expect(
    panel.getByRole("button", { name: "Choose Feed", exact: true }),
  ).toBeDisabled();
  const hero = panel
    .getByRole("region", { name: "Dark Power selection", exact: true })
    .locator(".module-revealed-hero");
  expect(await hero.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "none",
  );
  await expect(hero.getByRole("button")).toHaveCount(0);
  await page.getByRole("button", { name: "Dark Power", exact: true }).click();
  const remembered = page.locator(".play-moment-editor");
  await expect(
    remembered
      .getByRole("region", { name: "Dark Power selection", exact: true })
      .locator(".module-revealed-hero h4"),
  ).toHaveText("Dark Obsession");
  await expect(
    remembered.locator(".module-second-power .module-revealed-hero h4"),
  ).toHaveText("Feed");
  await page.getByRole("button", { name: "Record", exact: true }).click();
  const raw = await page.evaluate(
    (owner) =>
      JSON.parse(localStorage.getItem("final-girl-active-game-v1:" + owner)!)
        .playEvents,
    userId,
  );
  expect(
    raw.filter(
      (e: { kind: string; momentType?: string }) =>
        e.kind === "moment" && e.momentType === "dark-power",
    ),
  ).toHaveLength(1);
});
