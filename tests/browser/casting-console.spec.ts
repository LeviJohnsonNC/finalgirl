import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

async function choose(page: Page, slot: number, name: string) {
  await page.getByRole('button', { name: 'Choose', exact: true }).nth(slot).click();
  await page.getByRole('dialog').getByRole('button', { name: new RegExp(name) }).click();
}

test('console selections, keyboard access and responsive frame', async ({ page, archive }, info) => {
  archive.films = ['s1-camp-happy-trails'];
  await archive.install(page);
  await page.route('**/rest/v1/user_image_settings**', route => route.fulfill({
    contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify({ auto_generate_images: false, use_ai_casting_art: true }),
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  const consolePanel = page.getByRole('region', { name: 'Scenario and playback' });
  const setup = page.getByRole('combobox', { name: 'Setup Scenario' });
  const event = page.getByRole('combobox', { name: 'Starting Event' });
  const play = page.getByRole('button', { name: 'Press Play', exact: true });
  await expect(play).toBeDisabled();
  await expect(setup).toBeDisabled();
  await expect(event).toBeDisabled();
  await expect(page.getByText('CASE OPTIONS //', { exact: true })).toHaveCount(0);
  for (const [slot, name] of ['Hans', 'Camp Happy Trails', 'Laurie'].entries()) await choose(page, slot, name);
  await expect(play).toBeEnabled();
  await setup.focus();
  await setup.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.getByRole('option', { name: 'The Bonfire', exact: true }).click();
  await event.click();
  await page.getByRole('option', { name: 'Secret Tunnel', exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.screenshot({ path: info.outputPath('casting-console-page.png'), fullPage: true });
  await consolePanel.screenshot({ path: info.outputPath('casting-console-detail.png') });
  await page.setViewportSize({ width: 320, height: 1000 });
  for (const control of [setup, event]) {
    await control.click();
    const names = await page.getByRole('option').allTextContents();
    const longest = names.sort((a, b) => b.length - a.length)[0];
    const menu = (await page.getByRole('listbox').boundingBox())!;
    expect(menu.x).toBeGreaterThanOrEqual(0);
    expect(menu.x + menu.width).toBeLessThanOrEqual(320);
    await page.getByRole('option', { name: longest, exact: true }).click();
  }
  for (const width of [320, 390, 639, 640, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const panelBox = (await consolePanel.boundingBox())!;
    const playBox = (await play.boundingBox())!;
    expect(panelBox.width).toBeLessThanOrEqual(800);
    expect(panelBox.y + panelBox.height - (playBox.y + playBox.height)).toBeGreaterThanOrEqual(24);
    for (const control of [setup, event, play]) {
      const box = (await control.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(panelBox.x);
      expect(box.x + box.width).toBeLessThanOrEqual(panelBox.x + panelBox.width);
    }
  }
  await setup.click();
  await page.getByRole('option', { name: 'The Bonfire', exact: true }).click();
  await event.click();
  await page.getByRole('option', { name: 'Secret Tunnel', exact: true }).click();
  await play.click();
  await expect.poll(() => archive.generationRequests.some(r => r.name === 'generate-story')).toBe(true);
  const request = archive.generationRequests.find(r => r.name === 'generate-story')!;
  expect(JSON.stringify(request.body)).toContain('The Bonfire');
  expect(JSON.stringify(request.body)).toContain('Secret Tunnel');
});

test('mission row expands and location changes reset all cards', async ({ page, archive }, info) => {
  archive.films = ['s1-camp-happy-trails', 's3-falconwood-files'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  for (const [slot, name] of ['Hans', 'Falconwood', 'Laurie'].entries()) await choose(page, slot, name);
  const mission = page.getByRole('combobox', { name: 'Mission', exact: true });
  await expect(mission).toBeVisible();
  await page.getByRole('button', { name: 'Draw a random mission' }).click();
  await expect(mission).not.toContainText('Select Mission');
  await mission.click();
  await page.getByRole('option', { name: 'Save Your Father', exact: true }).click();
  await expect(page.getByText(/Government officials have imprisoned your father/)).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const playBox = (await page.getByRole('button', { name: 'Press Play', exact: true }).boundingBox())!;
  const footerBox = (await page.locator('footer').boundingBox())!;
  expect(playBox.y + playBox.height).toBeLessThan(footerBox.y - 24);
  await page.getByRole('region', { name: 'Scenario and playback' }).screenshot({ path: info.outputPath('casting-console-mission.png') });
  await page.getByRole('combobox', { name: 'Setup Scenario' }).click();
  await page.getByRole('option').first().click();
  await page.getByRole('combobox', { name: 'Starting Event' }).click();
  await page.getByRole('option').first().click();
  await choose(page, 1, 'Camp Happy Trails');
  await expect(mission).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Setup Scenario' })).toContainText('Select Setup');
  await expect(page.getByRole('combobox', { name: 'Starting Event' })).toContainText('Select Event');
  await page.getByRole('button', { name: 'Press Play', exact: true }).click();
  await expect.poll(() => archive.generationRequests.some(r => r.name === 'generate-story')).toBe(true);
  expect(JSON.stringify(archive.generationRequests.find(r => r.name === 'generate-story')!.body)).not.toContain('Save Your Father');
});
