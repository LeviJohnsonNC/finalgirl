import { test, expect, activeGame, userId } from "./fixtures";
import { openModule } from "./play-helpers";
for (const [killer, id] of [
  ["Inkanyamba", "inkanyamba"],
  ["Hans", "hans"],
  ["Billy the Bear", "billy"],
  ["Geppetto", "geppetto"],
  ["Dr. Fright", "fright"],
]) {
  test(`${killer} retains compact Power and Finale selections in source order`, async ({
    page,
    archive,
  }, info) => {
    if (info.project.name === "mobile")
      await page.setViewportSize({ width: 320, height: 568 });
    await archive.install(page, {
      draft: {
        ...activeGame,
        playMode: true,
        selection: { ...activeGame.selection, killer, startingEvent: null },
      },
    });
    await page.goto("/");
    await page
      .getByRole("button", { name: "RESUME GAME", exact: true })
      .click();
    await openModule(page, id);
    const panel = page.locator(`[data-module="${id}"]`);
    if (id === "fright")
      await panel.locator(".fright-details > summary").click();
    await panel.locator(".module-card-section > summary").click();
    expect(
      await panel.evaluate((el) =>
        Boolean(
          el
            .querySelector(".module-minor")!
            .compareDocumentPosition(
              el.querySelector(".module-card-section")!,
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
    ).toBe(true);
    for (const type of ["Dark Power", "Finale"]) {
      const cards = panel
        .getByRole("region", { name: `${type} selection` })
        .locator(".module-killer-card");
      const before = await cards.evaluateAll((els) =>
        els.map((el) => ({
          label: el.getAttribute("aria-label"),
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
          height: el.getBoundingClientRect().height,
        })),
      );
      await cards.last().click();
      await expect(cards.last()).toHaveAttribute("aria-pressed", "true");
      const after = await cards.evaluateAll((els) =>
        els.map((el) => ({
          label: el.getAttribute("aria-label"),
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
          height: el.getBoundingClientRect().height,
        })),
      );
      // Clicking scrolls the card into view; module reminders may also grow
      // above the grid. Compare the layout within the grid, not page position.
      expect(
        after.map((card) => ({ ...card, y: card.y - after[0].y })),
      ).toEqual(before.map((card) => ({ ...card, y: card.y - before[0].y })));
      for (const art of await cards.locator("svg").all()) {
        expect((await art.boundingBox())!.height).toBeLessThanOrEqual(150);
      }
    }
  });
}
test("both Wrath tracks stay fully inside a 320px panel and changes remain owner-specific", async ({
  page,
  archive,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      grovesSetupVersion: 1,
      inkanyambaSetupVersion: 1,
      selection: {
        ...activeGame.selection,
        killer: "Inkanyamba",
        location: "Sacred Groves",
        startingEvent: null,
      },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "inkanyamba");
  await openModule(page, "groves");
  for (const kind of ["killer", "divine"]) {
    const board = page.locator(`.wrath-board--${kind}`);
    const bounds = (await board.boundingBox())!;
    for (const button of await board.locator("button").all()) {
      const b = (await button.boundingBox())!;
      expect(b.width).toBeGreaterThanOrEqual(44);
      expect(b.height).toBeGreaterThanOrEqual(44);
      expect(b.x).toBeGreaterThanOrEqual(bounds.x);
      expect(b.x + b.width).toBeLessThanOrEqual(bounds.x + bounds.width - 2);
    }
  }
  await page
    .getByRole("button", { name: "Set Killer Wrath to 10", exact: true })
    .click();
  await expect(page.getByLabel("Current Divine Wrath")).toHaveText("2/10");
  await expect(
    page.getByRole("button", { name: "Increase Killer Wrath", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Current Killer Wrath")).toHaveText("2/10");
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
test("simple Camp effects toggle independently while Secret Tunnel retains its endpoint workflow", async ({
  page,
  archive,
}) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await openModule(page, "camp");
  const p = page.locator('[data-module="camp"]');
  for (const name of ["Deathwish", "Star Crossed Lovers", "Stubborn Kids"]) {
    await p
      .getByRole("button", { name: `Activate ${name}`, exact: true })
      .click();
    await expect(
      p.getByRole("button", { name: `End effect: ${name}`, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await p
      .getByRole("button", { name: `End effect: ${name}`, exact: true })
      .click();
    await expect(
      p.getByRole("button", { name: `Activate ${name}`, exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
  }
  await p
    .getByRole("button", { name: "Activate Secret Tunnel", exact: true })
    .click();
  await expect(
    p.getByRole("combobox", { name: "Secret Tunnel endpoint 1", exact: true }),
  ).toBeVisible();
  await expect(p.locator(".module-character .module-card-rules")).toHaveCount(
    0,
  );
});
