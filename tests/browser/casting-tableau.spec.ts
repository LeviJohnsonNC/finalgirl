import { test, expect } from './fixtures';

test('reference collage review', async ({ page, archive }, info) => {
  archive.films = ['s4-buddyland'];
  await archive.install(page);
  await page.route('**/rest/v1/user_image_settings**', route => route.fulfill({
    contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify({ auto_generate_images: false, use_ai_casting_art: true }),
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Collection', exact: true }).click();
  await expect(page.getByText('Image Engine', { exact: true })).toHaveCount(0);
  await page.locator('footer').getByRole('button', { name: 'Back', exact: true }).click();
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  await page.locator('.casting-tableau').screenshot({ path: info.outputPath('empty-collage.png') });
  for (const [index, name] of ['Billy the Bear', 'Buddyland', 'Rena'].entries()) {
    await page.getByRole('button', { name: 'Choose', exact: true }).nth(index).click();
    await page.getByRole('dialog').getByRole('button', { name: new RegExp(name) }).click();
  }
  for (const img of await page.locator('.casting-photo-image').all()) await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('casting-page.png'), fullPage: true });
  await page.locator('.casting-tableau').screenshot({ path: info.outputPath('casting-collage.png') });
  await page.getByRole('button', { name: 'View Rena info' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.locator('.casting-slot-buttons button').all()) await expect(button).toBeVisible();
  }
  expect(archive.calls).toEqual([]);
});

test('the Podarchs use a portrait composition in the killer picker and casting slot', async ({ page, archive }, info) => {
  archive.films = ['s4-terror-from-beyond', 's1-camp-happy-trails'];
  await archive.install(page);
  const widths = info.project.name === 'mobile' ? [320, 390] : [1280, 1440];
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  await page.getByRole('button', { name: 'Choose', exact: true }).first().click();
  const picker = page.getByRole('dialog');
  const option = picker.getByRole('button', { name: /The Podarchs/ });
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 400 ? 640 : 800 });
    const image = option.getByRole('img', { name: 'The Podarchs', exact: true });
    await expect.poll(() => image.evaluate((img: HTMLImageElement) =>
      [img.naturalWidth, img.naturalHeight])).toEqual([768, 1152]);
    await option.screenshot({ path: info.outputPath(`podarchs-picker-${width}.png`) });
  }
  await option.click();
  const selected = page.locator('.casting-photo-image[alt="The Podarchs"]');
  await expect.poll(() => selected.evaluate((img: HTMLImageElement) =>
    [img.naturalWidth, img.naturalHeight])).toEqual([768, 1152]);
  await selected.screenshot({ path: info.outputPath('podarchs-slot.png') });
  await page.getByRole('button', { name: 'View The Podarchs info', exact: true }).click();
  const dossier = page.getByRole('dialog').getByRole('img', { name: 'The Podarchs', exact: true });
  await expect.poll(() => dossier.evaluate((img: HTMLImageElement) =>
    [img.naturalWidth, img.naturalHeight])).toEqual([768, 1152]);
});
