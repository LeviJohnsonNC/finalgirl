import { resolve } from 'node:path';
import { test, expect, gameId } from './fixtures';

test('casting keeps the console steady and puts tilted info controls in the headings', async ({ page, archive }, info) => {
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  const panel = page.getByRole('region', { name: 'Scenario and playback' });
  const play = page.getByRole('button', { name: 'Press Play', exact: true });
  const before = { panel: (await panel.boundingBox())!, play: (await play.boundingBox())! };
  await expect(page.getByText('Cast your feature to begin')).toBeVisible();
  for (const [slot, name] of ['Hans', 'Camp Happy Trails', 'Laurie'].entries()) {
    await page.getByRole('button', { name: 'Choose', exact: true }).nth(slot).click();
    await page.getByRole('dialog').getByRole('button', { name: new RegExp(name) }).click();
  }
  await expect(play).toBeEnabled();
  await expect(page.getByText('Cast your feature to begin')).toHaveCount(0);
  await expect(page.locator('.casting-slot-meta')).toHaveCount(0);
  await expect(page.locator('.casting-slot-heading button')).toHaveCount(3);
  for (const name of ['Hans', 'Camp Happy Trails', 'Laurie']) {
    await page.getByRole('button', { name: `View ${name} info`, exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
  }
  const after = { panel: (await panel.boundingBox())!, play: (await play.boundingBox())! };
  expect(Math.abs(after.play.y - before.play.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.panel.height - before.panel.height)).toBeLessThanOrEqual(1);
  const turns = await page.locator('.casting-slot-heading').evaluateAll(nodes => nodes.map(el => getComputedStyle(el).transform));
  expect(turns[0]).not.toBe('none');
  expect(turns[2]).not.toBe('none');
  await page.screenshot({ path: info.outputPath('cast-headings-and-console.png'), fullPage: true });
});

test('the shared footer stays fixed on Stats and highlights every selected destination', async ({ page, archive }, info) => {
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  const footer = page.locator('.app-footer');
  await expect(footer).toHaveCSS('position', 'fixed');
  for (const name of ['STATS', 'RULES', 'COLLECTION', 'SCRAPBOOKS', 'STATS']) {
    if (name !== 'STATS' || await footer.locator('[aria-current="page"]').getAttribute('aria-label') !== 'STATS') {
      await footer.getByRole('button', { name, exact: true }).click();
    }
    const current = footer.getByRole('button', { name, exact: true });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(footer.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(footer).toHaveCSS('position', 'fixed');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const bounds = (await footer.boundingBox())!;
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
    await expect(current).toBeInViewport();
  }
  await page.screenshot({ path: info.outputPath('sticky-stats-footer.png'), fullPage: true });
});

for (const outcome of ['won', 'lost'] as const) {
  test(`the ${outcome} theater verdict uses one compact word`, async ({ page, archive }, info) => {
    archive.history = [{ id: gameId, timestamp: 1, outcome, final_girl_health: outcome === 'won' ? 2 : 0,
      killer: 'Hans', location: 'Camp Happy Trails', final_girl: 'Laurie', scene_image_url: 'http://127.0.0.1:4173/theater-a.png' }];
    await archive.install(page);
    await page.route('**/theater-a.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/locations/ai/camp-happy-trails.png') }));
    await page.goto('/');
    await expect(page.locator('.theater-verdict')).toHaveAttribute('aria-label', outcome === 'won' ? 'Won' : 'Lost');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.theater-verdict')).toHaveText(outcome === 'won' ? 'Won' : 'Lost');
    await page.screenshot({ path: info.outputPath(`theater-${outcome}-verdict.png`), fullPage: true });
  });
}
