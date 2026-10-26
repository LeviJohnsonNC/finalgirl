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
  const choice = section.getByRole("button", {
    name: `Choose ${name}`,
    exact: true,
  });
  if (!(await choice.isVisible()))
    await section
      .getByRole("button", { name: `Change ${type}`, exact: true })
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
