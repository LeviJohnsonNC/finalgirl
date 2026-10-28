import { test, expect, activeGame, userId } from './fixtures';
import { newPlayEvent } from '../../src/lib/play/events';
import type { Page } from '@playwright/test';

const fields = ['finalGirlHealth', 'killerHealth', 'finalHorrorLevel', 'bloodlust'] as const;
const titles = ['Health', 'Killer Health', 'Horror', 'Bloodlust'];
const labels = ['Final Girl health', 'Killer health', 'Horror', 'Bloodlust'];
const observed = (values: number[]) => [newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 }),
  ...fields.map((field, i) => newPlayEvent({ kind: 'state', field, value: values[i] }))];
const session = { ...activeGame, playMode: true, selection: { ...activeGame.selection, finalGirl: 'Cassie', finalGirlStartingHealth: 5 } };
const log = (page: Page) => page.evaluate(owner => JSON.parse(localStorage.getItem('final-girl-active-game-v1:' + owner)!).playEvents, userId);
async function resume(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
}

test('tracker film strips keep every title and control below the artwork at laptop and phone sizes', async ({ page, archive }, info) => {
  archive.aiCastingArt = true;
  await archive.install(page, { draft: { ...session, playEvents: observed([3, 12, 4, 3]) } });
  await resume(page);
  const before = await log(page);
  for (const label of labels) await expect(page.getByRole('button', { name: `Stop tracking ${label}`, exact: true })).toHaveText('×');
  for (const [width, height] of [[1280,640], [1366,768], [1440,900], [390,844], [320,568]]) {
    await page.setViewportSize({ width, height });
    for (const title of titles) {
      const card = page.getByRole('group', { name: `${title} tracker`, exact: true });
      await card.locator('.play-stat-portrait').evaluate(async (node: HTMLImageElement) => node.decode());
      const layout = await card.evaluate(node => {
        const picture = node.querySelector('.play-state-picture')!, bar = node.querySelector('.play-state-control-bar')!;
        const imageBounds = picture.getBoundingClientRect(), barBounds = bar.getBoundingClientRect();
        return { imageBottom: imageBounds.bottom, barTop: barBounds.top, overflow: bar.scrollWidth > bar.clientWidth,
          titleOverflow: node.querySelector('.play-state-title')!.scrollWidth > node.querySelector('.play-state-title')!.clientWidth,
          pictureText: picture.textContent?.trim(), controls: Array.from(bar.querySelectorAll('button')).map(button => {
            const b = button.getBoundingClientRect();
            return { width: b.width, height: b.height, inside: b.top >= barBounds.top && b.bottom <= barBounds.bottom && b.left >= barBounds.left && b.right <= barBounds.right };
          }) };
      });
      expect(layout.imageBottom).toBeLessThanOrEqual(layout.barTop + 1);
      expect(layout.pictureText).toBe('');
      expect(layout.overflow, `${title}, ${width}px`).toBe(false);
      expect(layout.titleOverflow, `${title}, ${width}px`).toBe(false);
      for (const control of layout.controls) {
        expect(control.width).toBeGreaterThanOrEqual(44);
        expect(control.height).toBeGreaterThanOrEqual(44);
        expect(control.inside).toBe(true);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.play-track-more').screenshot({ path: info.outputPath(`trackers-${width}.png`), style: '.app-footer{visibility:hidden}' });
    await page.getByRole('button', { name: 'Set Final Girl health', exact: true }).click();
    const editor = page.locator('.play-state--finalGirlHealth form');
    expect(await editor.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.getByLabel('Final Girl health value', { exact: true }).fill('4');
    await page.locator('.play-state--finalGirlHealth').screenshot({ path: info.outputPath(`editing-${width}.png`), style: '.app-footer{visibility:hidden}' });
    await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  }
  await page.addStyleTag({ content: '.play-workspace .play-state-title { font-family: Arial, sans-serif; }' });
  for (const width of [1280,390,320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const title of titles) {
      const heading = page.getByRole('group', { name: `${title} tracker`, exact: true }).locator('.play-state-title');
      expect(await heading.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
  }
  expect(await log(page)).toEqual(before);
});

test('close, Undo, reload, rejected writes and opt-in tracking preserve existing observations', async ({ page, archive }, info) => {
  await archive.install(page, { draft: { ...session, playEvents: observed([0, 1, 7, 99]) } });
  await resume(page);
  await expect(page.getByRole('group', { name: 'Health tracker', exact: true })).toContainText('No health remaining');
  await expect(page.getByRole('group', { name: 'Killer Health tracker', exact: true })).toContainText('Low health');
  for (const width of [1366,320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('.play-track-more').screenshot({ path: info.outputPath(`critical-${width}.png`), style: '.app-footer{visibility:hidden}' });
  }
  for (const label of labels) await page.getByRole('button', { name: `Stop tracking ${label}`, exact: true }).click();
  for (const label of labels) await expect(page.getByRole('button', { name: `Track ${label}`, exact: true })).toBeVisible();
  await page.locator('.play-track-more').screenshot({ path: info.outputPath('untracked-320.png'), style: '.app-footer{visibility:hidden}' });
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Set Bloodlust', exact: true })).toHaveText('99');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Track Final Girl health', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Track Final Girl health', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText('5');
  await expect(page.getByRole('button', { name: 'Increase Final Girl health', exact: true })).toBeDisabled();
  const before = await log(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('final-girl-active-game-v1:')) throw new Error('synthetic quota');
      return original.call(this, key, value);
    };
  });
  const close = page.getByRole('button', { name: 'Stop tracking Final Girl health', exact: true });
  await close.focus(); await page.keyboard.press('Enter');
  await expect(close).toBeVisible();
  await expect(page.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText('5');
  expect(await log(page)).toEqual(before);
});

test('healthless killers retain three independent tracker strips', async ({ page, archive }, info) => {
  await archive.install(page, { draft: { ...session, selection: { ...session.selection, killer: 'Poltergeist' }, playEvents: observed([2, 0, 3, 0]) } });
  await resume(page);
  await expect(page.locator('.play-track-more .play-state')).toHaveCount(3);
  await expect(page.getByRole('group', { name: 'Killer Health tracker', exact: true })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Health tracker', exact: true })).toContainText('Low health');
  await page.locator('.play-track-more').screenshot({ path: info.outputPath('healthless-trackers.png'), style: '.app-footer{visibility:hidden}' });
});
