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
