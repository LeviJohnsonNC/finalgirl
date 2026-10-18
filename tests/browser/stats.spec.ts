import { test, expect } from './fixtures';
import { statsHistory } from './stats-data';

const openStats = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'STATS', exact: true })).toBeVisible();
};

test('the cinematic record retains exact totals, chart controls, and keyboard highlights', async ({ page, archive }, testInfo) => {
  archive.history = statsHistory();
  await archive.install(page);
  await openStats(page);
  const totals = page.getByRole('region', { name: 'All-time session totals' });
  await expect(totals).toContainText('56');
  await expect(totals).toContainText('54%');
  await expect(totals).toContainText('200');
  await expect(totals).toContainText('299');
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext', '54 percent win rate, 30 wins and 26 losses');
  await expect(page.locator('.record-form-tick')).toHaveCount(20);
  // Changing the rate clips a full-size still instead of resizing its trees.
  const sceneWidths = await page.locator('.footage-scene').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().width));
  const meterWidth = (await page.getByRole('meter').boundingBox())!.width;
  for (const width of sceneWidths) expect(Math.abs(width - meterWidth)).toBeLessThan(3);

  await page.getByRole('button', { name: 'Table', exact: true }).click();
  await expect(page.locator('.chart-table')).toContainText('Saved');
  await page.getByRole('button', { name: 'Games', exact: true }).click();
  await expect(page.locator('.chart-title')).toContainText('Sessions per');
  await expect(page.locator('.chart-table thead')).toContainText('Games');
  await page.getByRole('button', { name: 'W / L', exact: true }).click();
  await expect(page.locator('.chart-table thead')).toContainText('Wins');
  await page.getByRole('button', { name: '30D', exact: true }).click();
  await expect(page.locator('.filter-chip-active')).toHaveText('30D');
  await page.getByRole('button', { name: 'Chart', exact: true }).click();
  const badge = page.locator('button.narrative-badge').first();
  await badge.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.screenshot({ path: testInfo.outputPath('stats-interactions.png'), fullPage: true });
  expect(archive.calls).toEqual([]);
});

test('large archives scroll beneath sticky headings and keep long names inside the page', async ({ page, archive }) => {
  archive.history = statsHistory().map((row, i) => ({ ...row, final_girl: `Final Girl ${i + 1} with an exceptionally long recorded name`, killer: `Killer ${i + 1}`, location: `Location ${i + 1}` }));
  await archive.install(page); await openStats(page);
  for (const name of ['Final Girls', 'Killers', 'Locations']) {
    await page.getByRole('tab', { name, exact: true }).click();
    const scroll = page.getByRole('tabpanel').locator('.breakdown-scroll');
    expect(await scroll.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    await scroll.focus();
    await page.keyboard.press('End');
    await expect.poll(() => scroll.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    const box = (await scroll.boundingBox())!;
    const head = (await scroll.locator('th').first().boundingBox())!;
    expect(Math.abs(box.y - head.y)).toBeLessThan(2);
    await expect(scroll.locator('tbody tr').last()).toBeInViewport();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
  const weapons = page.getByLabel('All recorded weapons', { exact: true });
  expect(await weapons.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await weapons.focus(); await page.keyboard.press('End');
  await expect.poll(() => weapons.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  expect(archive.calls).toEqual([]);
});

test('one-session 0% and 100% records stay honest and fully readable without missing-data claims', async ({ page, archive }) => {
  for (const outcome of ['lost', 'won']) {
    archive.history = [{ ...statsHistory()[0], outcome, victims_saved: null, victims_killed: null, rounds_played: null, weapon_used: null, final_horror_level: null }];
    await archive.install(page); await openStats(page);
    const rate = outcome === 'won' ? 100 : 0;
    await expect(page.getByRole('meter')).toHaveAttribute('aria-valuenow', String(rate));
    const meter = (await page.getByRole('meter').boundingBox())!;
    const readout = (await page.locator('.winloss-readout').boundingBox())!;
    expect(readout.x).toBeGreaterThanOrEqual(meter.x);
    expect(readout.x + readout.width).toBeLessThanOrEqual(meter.x + meter.width);
    await expect(page.locator('.record-form')).toHaveCount(0);
    await expect(page.locator('.footage-boundary')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Recorded play statistics' })).toContainText('—');
    await expect(page.locator('.horror-chart')).toHaveCount(0);
    await expect(page.locator('.stats-summary-card').filter({ hasText: 'Saved' }).locator('dd')).toHaveText('—');
    await expect(page.locator('.stats-summary-card').filter({ hasText: 'Killed' }).locator('dd')).toHaveText('—');
    await expect(page.locator('.chart-empty')).toContainText('not recorded');
    await expect(page.getByText('Play more to unlock').first()).toBeVisible();
    expect(await page.locator('.footage-scene-wins').evaluate(el => getComputedStyle(el).clipPath)).toBe(`inset(0px ${100 - rate}% 0px 0px)`);
  }
  expect(archive.calls).toEqual([]);
});

test('recent sessions open the exact case and the complete player profile remains available', async ({ page, archive }) => {
  archive.history = statsHistory();
  await archive.install(page); await openStats(page);
  const summary = page.locator('.archetype-more summary');
  await expect(summary).toBeVisible(); await summary.click();
  await expect(page.locator('.archetype-more')).toHaveAttribute('open', '');
  await expect(page.locator('.archetype-score-row')).toHaveCount(4);
  const recent = page.getByLabel('Latest recorded sessions', { exact: true });
  await recent.focus(); await page.keyboard.press('End');
  const last = recent.getByRole('button').last();
  await last.click();
  await expect(page.locator('.story-page-content')).toContainText('Case 8:');
  expect(archive.calls).toEqual([]);
});

test('missing and failed artwork keep names, numbers and actions readable at small widths', async ({ page, archive }, testInfo) => {
  archive.history = statsHistory();
  await archive.install(page);
  await page.route(/\.(png|webp|jpe?g)(\?.*)?$/, route => route.abort());
  await openStats(page);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('meter')).toBeVisible();
    await expect(page.locator('button.narrative-badge').first()).toContainText('Nemesis');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    for (const selector of ['.record-jacket', '.footage-plate', '.trends-chart', '.breakdown-section', '.archetype-badge']) {
      const box = (await page.locator(selector).boundingBox())!;
      expect(box.x, selector).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, selector).toBeLessThanOrEqual(width + 1);
    }
  }
  await page.screenshot({ path: testInfo.outputPath('stats-artwork-fallback.png'), fullPage: true });
  expect(archive.calls).toEqual([]);
});

test('an empty archive retains Back and navigation without leaking the stats layout', async ({ page, archive }) => {
  await archive.install(page); await openStats(page);
  await expect(page.getByRole('heading', { name: 'No Games Recorded' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back', exact: true }).locator('svg')).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.theater-reel')).toBeVisible();
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  await page.getByRole('button', { name: 'RULES', exact: true }).click();
  await expect(page.locator('.stats-page')).toHaveCount(0);
  await expect(page.locator('.rules-cinema')).toBeVisible();
  // The rulebook has its own colophon and intentionally quiets the ticker.
  // The global contentinfo footer must still retain the app navigation.
  await expect(page.getByRole('contentinfo')).toHaveCSS('position', 'fixed');
  await expect(page.locator('.news-ticker')).toHaveCount(0);
  await page.getByRole('button', { name: 'COLLECTION', exact: true }).click();
  await expect(page.locator('.rules-cinema')).toHaveCount(0);
  await expect(page.locator('.stats-page')).toHaveCount(0);
  await expect(page.getByRole('contentinfo')).toHaveCSS('position', 'fixed');
  await expect(page.locator('.news-ticker').last()).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test('signed-out visitors see the sign-in state inside the new archive', async ({ page, archive }) => {
  await archive.install(page, { signedIn: false }); await openStats(page);
  await expect(page.getByRole('heading', { name: 'Sign In Required' })).toBeVisible();
  await expect(page.getByRole('meter')).toHaveCount(0);
  await expect(page.locator('.stats-legal')).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test('archive retrieval errors remain recoverable without displaying invented statistics', async ({ page, archive }) => {
  await archive.install(page);
  let fail = true;
  await page.route('**/rest/v1/rpc/get_game_history_summary', route => route.fulfill({
    status: fail ? 503 : 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json',
    body: JSON.stringify(fail ? { message: 'The archive is temporarily unavailable.' } : []),
  }));
  await openStats(page);
  await expect(page.getByRole('heading', { name: 'Archive Retrieval Failed' })).toBeVisible();
  await expect(page.getByRole('meter')).toHaveCount(0);
  fail = false;
  await page.getByRole('button', { name: 'RETRY ARCHIVE LOAD' }).click();
  await expect(page.getByRole('heading', { name: 'No Games Recorded' })).toBeVisible();
  expect(archive.calls).toEqual([]);
});
