import { test, expect, activeGame, userId } from "./fixtures";
import { openModule } from "./play-helpers";

test("Dark Power keeps one compact selection across both choosers, corrections and reload", async ({
  page,
  archive,
}, info) => {
  await page.setViewportSize({
    width: info.project.name === "desktop" ? 1366 : 390,
    height: 768,
  });
  await archive.install(page, {
    draft: {
      ...activeGame,
      playMode: true,
      selection: { ...activeGame.selection, killer: "Dr. Fright" },
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Dark Power", exact: true }).click();
  const chooser = page.locator(
    '.module-reveals [aria-label="Dark Power selection"]',
  );
  const cards = chooser.locator(".module-compact-reveal-grid > button");
  const order = await cards.locator("strong").allTextContents();
  await chooser
    .getByRole("button", { name: "Choose Shock Factor", exact: true })
    .click();
  const selected = chooser.locator('[aria-pressed="true"]');
  await expect(selected).toHaveCount(1);
  await expect(selected.locator(".module-power-selected")).toHaveText(
    "Selected",
  );
  await expect(selected).toHaveAttribute("data-epic", "true");
  const bounds = (await selected.boundingBox())!;
  const alternative = (await chooser
    .getByRole("button", { name: "Choose Never Really Dead", exact: true })
    .boundingBox())!;
  expect(bounds.width).toBeCloseTo(alternative.width, 0);
  expect(bounds.height).toBeLessThan(260);
  expect(Math.abs(bounds.height - alternative.height)).toBeLessThan(35);
  await chooser.scrollIntoViewIfNeeded();
  await chooser.screenshot({
    path: info.outputPath("dark-power-selected.png"),
    animations: "disabled",
  });
  if (info.project.name === "mobile") {
    await page.setViewportSize({ width: 320, height: 568 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await chooser.screenshot({
      path: info.outputPath("dark-power-320.png"),
      animations: "disabled",
    });
  }
  const other = chooser.getByRole("button", {
    name: "Choose Never Really Dead",
    exact: true,
  });
  await other.focus();
  await other.press("Enter");
  await expect(other).toHaveAttribute("aria-pressed", "true");
  await expect(selected).toHaveCount(1);
  // Selection preserves visual and keyboard order.
  expect(await cards.locator("strong").allTextContents()).toEqual(order);
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await openModule(page, "fright");
  const panel = page.locator('[data-module="fright"]');
  await panel.locator(".fright-details > summary").click();
  await panel.locator(".module-card-section > summary").click();
  await expect(
    panel.getByRole("button", {
      name: "Choose Never Really Dead",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await panel
    .getByRole("button", { name: "Clear Dark Power card name", exact: true })
    .click();
  await expect(
    panel.locator('.module-compact-reveal-grid [aria-pressed="true"]'),
  ).toHaveCount(0);
  // Permanent reveals are corrected explicitly; they cannot be undone.
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await panel
    .getByRole("button", { name: "Choose Never Really Dead", exact: true })
    .click();
  await expect(
    panel.getByRole("button", {
      name: "Choose Never Really Dead",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Dark Power", exact: true }).click();
  await expect(
    chooser.getByRole("button", {
      name: "Choose Never Really Dead",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  const reveals = await page.evaluate(
    (owner) =>
      JSON.parse(
        localStorage.getItem(`final-girl-active-game-v1:${owner}`)!,
      ).playEvents.filter(
        (event: { kind: string; momentType?: string }) =>
          event.kind === "moment" && event.momentType === "dark-power",
      ),
    userId,
  );
  expect(reveals).toHaveLength(1);
});
