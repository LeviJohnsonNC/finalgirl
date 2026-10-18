import { test, expect, activeGame } from './fixtures';

test('collection Back returns through its real origin, including the theater', async ({ page, archive }) => {
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Collection', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'MY COLLECTION' })).toBeVisible();
  await page.locator('footer').getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('button', { name: 'START THE TAPE' })).toBeVisible();
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'STATS', exact: true })).toBeVisible();
  await page.locator('footer').getByRole('button', { name: 'COLLECTION', exact: true }).click();
  // Selecting the current destination again must not create a self-return loop.
  await page.locator('footer').getByRole('button', { name: 'COLLECTION', exact: true }).click();
  await page.locator('footer').getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'STATS', exact: true })).toBeVisible();
  await page.locator('footer').getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('button', { name: 'START THE TAPE' })).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test('returning from collection preserves a live game and its recorded count', async ({ page, archive }) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true, playEvents: [{ id: '33333333-3333-4333-8333-333333333333', at: 1, kind: 'start', round: 3, saved: 2, killed: 1 }] } });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save one victim' })).toBeVisible();
  await page.locator('footer').getByRole('button', { name: 'COLLECTION', exact: true }).click();
  await page.locator('footer').getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save one victim' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next round' }).locator('strong')).toHaveText('3');
  expect(archive.calls).toEqual([]);
});

test('module cards show the supplied Buddyland cover, blurb and complete cast on small screens', async ({ page, archive }, testInfo) => {
  archive.films.push('s4-buddyland');
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Collection', exact: true }).click();
  const card = page.locator('.collection-film').filter({ has: page.getByRole('heading', { name: 'Bad Times at Buddyland', exact: true }) });
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByText(/The party is over/)).toBeVisible();
  for (const name of ['Billy the Bear', 'Buddyland', 'Rena & Gwynn']) await expect(card.getByText(name, { exact: true })).toBeVisible();
  await expect.poll(() => card.getByRole('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeLessThanOrEqual(288);
  await expect(card.getByRole('img')).toHaveAttribute('src', /\.webp$/);
  expect(await card.getByRole('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(card.getByRole('switch')).toBeChecked();
  await page.screenshot({ path: testInfo.outputPath('collection-buddyland.png'), fullPage: false });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  expect(archive.calls).toEqual([]);
});
