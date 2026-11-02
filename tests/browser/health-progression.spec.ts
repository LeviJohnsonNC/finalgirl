import { test, expect, activeGame } from './fixtures';
import { newPlayEvent } from '../../src/lib/play/events';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../../src/assets/play/final-girl-health/manifest.json', import.meta.url), 'utf8')) as Array<{name: string; slug: string; injured?: unknown}>;

for (const girl of manifest) test(`${girl.name} health progression remains legible in the tracker`, async ({ page, archive }, info) => {
  archive.aiCastingArt = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true,
    selection: { ...activeGame.selection, finalGirl: girl.name, finalGirlStartingHealth: 5 },
    playEvents: [newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 }),
      newPlayEvent({ kind: 'state', field: 'finalGirlHealth', value: 2 })] } });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  const card = page.locator('.play-state--finalGirlHealth'), photo = card.locator('.play-stat-portrait');
  for (const [value, state] of [[2, 'critical'], [3, 'injured' in girl ? 'injured' : 'original'], [5, 'healthy']] as const) {
    if (value !== 2) {
      await page.getByRole('button', { name: 'Set Final Girl health', exact: true }).click();
      await page.getByLabel('Final Girl health value', { exact: true }).fill(String(value));
      await card.getByRole('button', { name: 'Set', exact: true }).click();
    }
    if (state === 'original') await expect(photo).not.toHaveAttribute('data-health-portrait');
    else await expect(photo).toHaveAttribute('data-health-portrait', state);
    await photo.evaluate(async (node: HTMLImageElement) => node.decode());
    expect(await photo.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(500);
    await card.screenshot({ path: info.outputPath(`${girl.slug}-${state}.png`), style: '.app-footer { visibility: hidden }' });
  }
});
