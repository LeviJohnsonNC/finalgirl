import { test, expect } from './fixtures';
import { statsHistory } from './stats-data';

test('matched performance includes losses, preserves unknowns, and opens the evidence case', async ({ page, archive }, info) => {
  archive.history = statsHistory().slice(0, 40).map((g, i) => ({ ...g,
    killer: 'Hans', location: 'Camp Happy Trails', final_girl: 'Laurie',
    outcome: i < 10 || i >= 20 && i < 25 ? 'won' : 'lost',
    victims_saved: i < 20 ? 0 : 4, final_horror_level: null,
  }));
  await archive.install(page);
  await page.goto('/'); await page.getByRole('button', { name: 'Stats', exact: true }).click();
  const report = page.getByRole('region', { name: 'Recent versus earlier results' });
  await expect(report.getByRole('heading')).toHaveText('A higher win rate in repeated casts');
  await expect(report).toContainText('25% → 50%');
  await expect(report).toContainText('+25 percentage points');
  await expect(report).toContainText('5 → 10 wins across 20 matched pairs');
  await expect(report).toContainText('4.0 → 0.0 · 20 pairs');
  await expect(report).toContainText('0 pairs with both values recorded');
  await report.scrollIntoViewIfNeeded();
  await report.screenshot({ path: info.outputPath('performance-comparison.png') });
  const originalViewport = page.viewportSize()!;
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize(originalViewport);
  const disclosure = report.getByText('How this comparison works', { exact: false });
  await disclosure.scrollIntoViewIfNeeded();
  await disclosure.click();
  await expect(report.getByRole('listitem')).toHaveCount(20);
  const evidence = report.getByRole('button', { name: /^Open earlier case/ }).first();
  await evidence.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.story-page-content')).toContainText('Case 21:');
  expect(archive.calls).toEqual([]);
});

test('changed casting and sparse histories show insufficient evidence instead of a skill claim', async ({ page, archive }, info) => {
  archive.history = statsHistory().slice(0, 40).map((g, i) => ({ ...g,
    final_girl: i < 20 ? 'Laurie' : 'Sally', killer: 'Hans', location: 'Camp Happy Trails', outcome: i < 20 ? 'won' : 'lost',
  }));
  await archive.install(page); await page.goto('/'); await page.getByRole('button', { name: 'Stats', exact: true }).click();
  const report = page.getByRole('region', { name: 'Recent versus earlier results' });
  await expect(report).toContainText('0 matched pairs across these periods');
  await expect(report).not.toContainText('percentage points');
  await report.scrollIntoViewIfNeeded();
  await report.screenshot({ path: info.outputPath('performance-insufficient.png') });
  archive.history = archive.history.slice(0, 3);
  await page.reload(); await page.getByRole('button', { name: 'Stats', exact: true }).click();
  await expect(report).toContainText('Earlier comparisons begin after 20 recorded games');
  expect(archive.calls).toEqual([]);
});
