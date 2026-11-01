import { expect, type Page, type Locator } from "@playwright/test";
export async function searchPick(page: Page, label: string, value: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page
    .getByRole("combobox", { name: `Search ${label}`, exact: true })
    .fill(value);
  const option = page.getByRole("option", { name: value, exact: true });
  if (await option.count()) await option.click();
  else
    await page
      .getByRole("option", { name: `Use “${value}”`, exact: true })
      .click();
}
export async function statusPick(page: Page, trigger: Locator, label: string) {
  await trigger.click();
  await page.getByRole("option", { name: label, exact: true }).click();
}
export async function openHistory(page: Page) {
  const toggle = page.getByRole("button", { name: /^The night so far/ });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
}

/** Correct the latest eligible active observation through the visible timeline. */
export async function undoLatestObservation(page: Page) {
  const toggle = page.getByRole("button", { name: /^The night so far/ });
  const wasOpen = (await toggle.getAttribute("aria-expanded")) === "true";
  if (!wasOpen) await toggle.click();
  await page
    .getByRole("region", { name: "Game timeline", exact: true })
    .getByRole("button", { name: /^Undo / })
    .first()
    .click();
  if (!wasOpen) await toggle.click();
}

export async function saveResultOnly(page: Page) {
  await page.getByRole("button", { name: "More options", exact: true }).click();
  await page
    .getByRole("button", { name: "Save result without narration", exact: true })
    .click();
}

/** Open only the requested module; reopening a saved game may remember it. */
export async function openModule(page: Page, id: string) {
  await expect(page.locator(".play-module-stack")).toBeAttached();
  const panel = page.locator(`.play-module-panel[data-module="${id}"]`);
  if (!(await panel.count())) return;
  if (!(await panel.evaluate((el) => (el as HTMLDetailsElement).open)))
    await panel.locator(":scope > summary").click();
  await expect(panel).toHaveAttribute("open", "");
}

/** Open corrections explicitly now that named reveals hide their unused choices. */
export async function chooseKillerCard(
  scope: Locator,
  type: "Dark Power" | "Finale",
  name: string,
) {
  const section = scope.getByRole("region", {
    name: `${type} selection`,
    exact: true,
  });
  await expect(section).toBeVisible();
  const choice = section.getByRole("button", {
    name: `Choose ${name}`,
    exact: true,
  });
  // Asking for the current card is a no-op, not a clear/reselect observation.
  const current = section.locator('.module-revealed-hero h4');
  if (await current.count() && (await current.textContent())?.trim() === name) return;
  if (!(await choice.isVisible()))
    await section
      .getByRole("button", {
        name: `Clear ${type} card name`,
        exact: true,
      })
      .click();
  await choice.click();
  await expect(section.locator(".module-revealed-hero h4")).toHaveText(name);
}
export async function showMinorChoices(scope: Locator) {
  const add = scope.getByRole("button", {
    name: "Add another Minor Power",
    exact: true,
  });
  if (await add.isVisible()) await add.click();
}

/** Set an always-visible core tracker, including an unknown legacy value. */
export async function setTracker(page: Page, label: string, value: number) {
  await page.getByRole('button', {name: `Set ${label}`, exact: true}).click();
  await page.getByLabel(`${label} value`, {exact: true}).fill(String(value));
  await page.getByRole('button', {name: 'Set', exact: true}).click();
}
