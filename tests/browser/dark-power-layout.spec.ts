import { test, expect, activeGame, userId } from "./fixtures";
import { openModule } from "./play-helpers";

test("Dark Power focuses one photograph across both entry points, explicit corrections and reload", async ({
  page,
  archive,
}, info) => {
  await page.setViewportSize({
    width: info.project.name === "desktop" ? 1366 : 320,
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
  const chooser = page
    .locator(".play-moment-editor")
    .getByRole("region", { name: "Dark Power selection", exact: true });
  const cards = chooser.locator(".module-killer-card");
  const order = await cards.locator("strong").allTextContents();
  await chooser
    .getByRole("button", { name: "Choose Shock Factor", exact: true })
    .click();
  const hero = chooser.locator(".module-revealed-hero");
  await expect(hero).toHaveAttribute("data-epic", "true");
  await expect(hero.locator("h4")).toHaveText("Shock Factor");
  await expect(cards).toHaveCount(0);
  await expect(hero.locator("img")).toHaveJSProperty("complete", true);
  expect(
    await hero
      .locator("img")
      .evaluate((el: HTMLImageElement) => el.naturalWidth / el.naturalHeight),
  ).toBeCloseTo(16 / 9, 1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await chooser.screenshot({
    path: info.outputPath("focused-power.png"),
    animations: "disabled",
    style: ".app-footer{visibility:hidden}",
  });
  await chooser
    .getByRole("button", { name: "Clear Dark Power card name", exact: true })
    .click();
  expect(await cards.locator("strong").allTextContents()).toEqual(order);
  await expect(
    chooser.getByRole("button", { name: "Choose Shock Factor", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  const other = chooser.getByRole("button", {
    name: "Choose Never Really Dead",
    exact: true,
  });
  await other.focus();
  await other.press("Enter");
  await expect(hero.locator("h4")).toHaveText("Never Really Dead");
  await expect(cards).toHaveCount(0);
  await page.getByRole("button", { name: "Record", exact: true }).click();
  await openModule(page, "fright");
  const panel = page.locator('[data-module="fright"]');
  await panel.locator(".fright-details > summary").click();
  await panel.locator(".module-card-section > summary").click();
  await expect(
    panel
      .getByRole("region", { name: "Dark Power selection", exact: true })
      .locator(".module-revealed-hero h4"),
  ).toHaveText("Never Really Dead");
  await panel
    .getByRole("button", { name: "Clear Dark Power card name", exact: true })
    .click();
  await expect(panel.locator(".module-revealed-hero")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }),
  ).toBeDisabled();
  await panel
    .getByRole("button", { name: "Choose Never Really Dead", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "RESUME GAME", exact: true }).click();
  await page.getByRole("button", { name: "Dark Power", exact: true }).click();
  await expect(chooser.locator(".module-revealed-hero h4")).toHaveText(
    "Never Really Dead",
  );
  await expect(chooser.locator(".module-killer-card")).toHaveCount(0);
  const reveals = await page.evaluate(
    (owner) =>
      JSON.parse(
        localStorage.getItem("final-girl-active-game-v1:" + owner)!,
      ).playEvents.filter(
        (e: { kind: string; momentType?: string }) =>
          e.kind === "moment" && e.momentType === "dark-power",
      ),
    userId,
  );
  expect(reveals).toHaveLength(1);
});
