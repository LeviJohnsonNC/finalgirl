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

test('laptop selectors keep readable text and clear the rim before and after casting', async ({ page, archive }, info) => {
  archive.films = ['s1-camp-happy-trails'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  const panel = page.locator('.casting-console');
  const play = page.getByRole('button', { name: 'Press Play', exact: true });
  const sizes = [{ width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 949, height: 649 }];
  const before: number[] = [];
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.evaluate(() => document.fonts.ready);
    const metrics = await panel.evaluate(el => {
      const box = el.getBoundingClientRect();
      const rim = parseFloat(getComputedStyle(el, '::before').borderImageWidth);
      return {
        width: box.width,
        labels: Array.from(el.querySelectorAll('.casting-console-label')).map(label => label.getBoundingClientRect().top - box.top),
        rim,
        fields: Array.from(el.querySelectorAll<HTMLButtonElement>('[role=combobox]')).map(control => {
          const span = control.querySelector('span')!;
          const bounds = control.getBoundingClientRect();
          return { fontSize: parseFloat(getComputedStyle(control).fontSize), height: bounds.height, clipped: span.scrollWidth > span.clientWidth + 1,
            left: bounds.left - box.left, right: box.right - bounds.right };
        }),
        playY: el.querySelector('button.casting-console-play')!.getBoundingClientRect().top - box.top,
      };
    });
    expect(metrics.width).toBeGreaterThanOrEqual(640);
    for (const top of metrics.labels) expect(top - metrics.rim).toBeGreaterThanOrEqual(8);
    for (const field of metrics.fields) {
      expect(field.fontSize).toBeGreaterThanOrEqual(17);
      expect(field.height).toBeGreaterThanOrEqual(48);
      expect(field.clipped).toBe(false);
      expect(Math.min(field.left, field.right) - metrics.rim).toBeGreaterThanOrEqual(8);
    }
    before.push(metrics.playY);
    if (size.width === 1366) await panel.screenshot({ path: info.outputPath('laptop-console-empty.png') });
  }
  for (const [slot, name] of ['Hans', 'Camp Happy Trails', 'Laurie'].entries()) await choose(page, slot, name);
  await page.getByRole('combobox', { name: 'Setup Scenario' }).click();
  await page.getByRole('option', { name: 'The Bonfire', exact: true }).click();
  await page.getByRole('combobox', { name: 'Starting Event' }).click();
  await page.getByRole('option', { name: 'Secret Tunnel', exact: true }).click();
  for (const [index, size] of sizes.entries()) {
    await page.setViewportSize(size);
    const box = (await panel.boundingBox())!, button = (await play.boundingBox())!;
    expect(button.y - box.y).toBeCloseTo(before[index], 0);
    if (size.width === 1366) {
      await panel.screenshot({ path: info.outputPath('laptop-console-selected.png') });
      await page.screenshot({ path: info.outputPath('laptop-setup-page.png'), fullPage: true });
    }
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => { document.documentElement.style.zoom = '1.25'; });
  await expect(play).toBeEnabled();
  const box = (await panel.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(1280);
  expect(await panel.locator('.casting-console-select > span').evaluateAll(spans => spans.every(span => span.scrollWidth <= span.clientWidth + 1))).toBe(true);
});

test('long menu names and Mission controls remain contained at laptop and phone widths', async ({ page, archive }, info) => {
  archive.films = ['s1-camp-happy-trails', 's3-falconwood-files'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  for (const [slot, name] of ['Hans', 'Falconwood', 'Laurie'].entries()) await choose(page, slot, name);
  for (const size of [{ width: 1366, height: 768 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(size);
    for (const control of ['Setup Scenario', 'Starting Event', 'Mission']) {
      await page.getByRole('combobox', { name: control, exact: true }).click();
      const options = await page.getByRole('option').allTextContents();
      const longest = options.sort((a, b) => b.length - a.length)[0];
      const option = page.getByRole('option', { name: longest, exact: true });
      await option.scrollIntoViewIfNeeded();
      const menu = (await page.getByRole('listbox').boundingBox())!;
      expect(menu.x).toBeGreaterThanOrEqual(0);
      expect(menu.x + menu.width).toBeLessThanOrEqual(size.width);
      expect(await option.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await option.click();
    }
    const description = page.locator('.casting-console-mission-description');
    await expect(description).toBeVisible();
    expect(await description.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const panel = (await page.locator('.casting-console').boundingBox())!, button = (await page.getByRole('button', { name: 'Press Play', exact: true }).boundingBox())!;
    expect(button.y + button.height).toBeLessThan(panel.y + panel.height - 24);
    expect(button.y + button.height).toBeLessThan((await page.locator('footer').boundingBox())!.y);
    expect(button.y + button.height).toBeLessThan((await page.locator('.news-broadcast').boundingBox())!.y - 8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.casting-console').screenshot({ path: info.outputPath(`console-mission-${size.width}.png`) });
  }
});
