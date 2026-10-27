import { test, expect, activeGame, userId } from "./fixtures";
import { openModule } from "./play-helpers";
for (const [killer, id] of [
  ["Inkanyamba", "inkanyamba"],
  ["Hans", "hans"],
  ["Billy the Bear", "billy"],
  ["Geppetto", "geppetto"],
  ["Dr. Fright", "fright"],
]) {
  test(`${killer} focuses revealed Power and Finale and opens alternatives only for correction`, async ({
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
      const region = panel.getByRole("region", {
        name: `${type} selection`,
        exact: true,
      });
      const cards = region.locator(".module-killer-card");
      const names = await cards.locator("strong").allTextContents();
      const name = names.at(-1)!;
      const height = (await cards.last().boundingBox())!.height;
      await cards.last().click();
      await expect(cards).toHaveCount(0);
      const hero = region.locator(".module-revealed-hero");
      await expect(hero.locator("h4")).toHaveText(name);
      const photo = hero.locator("img");
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toHaveJSProperty("complete", true);
      expect(
        await photo.evaluate(
          (im: HTMLImageElement) => im.naturalWidth / im.naturalHeight,
        ),
      ).toBeCloseTo(16 / 9, 1);
      expect((await hero.boundingBox())!.height).toBeGreaterThan(height * 1.4);
      await expect(region.getByText("Card rules", { exact: true })).toHaveCount(
        0,
      );
      if (type === "Dark Power") {
        await expect(
          region.getByRole("button", {
            name: "Change Dark Power",
            exact: true,
          }),
        ).toHaveCount(0);
        const clear = region.getByRole("button", {
          name: "Clear Dark Power card name",
          exact: true,
        });
        expect((await clear.boundingBox())!.x).toBeCloseTo(
          (await hero.boundingBox())!.x,
          0,
        );
        await clear.click();
        expect(await cards.locator("strong").allTextContents()).toEqual(names);
        await expect(cards.last()).toHaveAttribute("aria-pressed", "false");
        await cards.last().click();
      } else {
        await region
          .getByRole("button", { name: "Change Finale", exact: true })
          .click();
        expect(await cards.locator("strong").allTextContents()).toEqual(names);
        await expect(cards.last()).toHaveAttribute("aria-pressed", "true");
        await region
          .getByRole("button", { name: "Cancel changing Finale", exact: true })
          .click();
      }
      await expect(cards).toHaveCount(0);
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
  for (const name of [
    "Clingy Campers",
    "Dark Waters",
    "Deathwish",
    "Star Crossed Lovers",
    "Stubborn Kids",
  ]) {
    await p
      .getByRole("button", { name: `Activate ${name}`, exact: true })
      .click();
    const card = p.locator('[data-module-control="event"]').filter({
      has: page.getByRole("button", {
        name: `End effect: ${name}`,
        exact: true,
      }),
    });
    await expect(card.getByRole("button")).toHaveCount(1);
    await expect(card.locator("details, .module-active-reminder")).toHaveCount(
      0,
    );
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
