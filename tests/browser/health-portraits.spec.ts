import { test, expect, activeGame, userId } from './fixtures';
import { newPlayEvent } from '../../src/lib/play/events';
import { openModule, chooseKillerCard, undoLatestObservation } from './play-helpers';
import type { Page } from '@playwright/test';

const start = () => newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 });
const state = (value: number) => newPlayEvent({ kind: 'state', field: 'finalGirlHealth', value });
async function resume(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
}
async function setHealth(page: Page, value: number) {
  await page.getByRole('button', { name: 'Set Final Girl health', exact: true }).click();
  await page.getByLabel('Final Girl health value', { exact: true }).fill(String(value));
  await page.locator('.play-state--finalGirlHealth').getByRole('button', { name: 'Set', exact: true }).click();
}

test('health photos follow damage, recovery, Undo and reload with stable crops and no unrelated downloads', async ({ page, archive }, info) => {
  archive.aiCastingArt = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true,
    selection: { ...activeGame.selection, finalGirl: 'Cassie', finalGirlStartingHealth: 5 }, playEvents: [start(), state(5)] } });
  const downloads: string[] = [];
  page.on('request', req => { if (/-(healthy|critical)-.*\.webp/.test(req.url())) downloads.push(req.url()); });
  await resume(page);
  const card = page.locator('.play-state--finalGirlHealth'), photo = card.locator('.play-stat-portrait');
  const original = async () => expect(photo).not.toHaveAttribute('data-health-portrait');
  for (const [health, variant] of [[5, 'healthy'], [3, 'original'], [2, 'critical'], [0, 'critical']] as const) {
    if (health !== 5) await setHealth(page, health);
    if (variant === 'original') await original();
    else await expect(photo).toHaveAttribute('data-health-portrait', variant);
    await photo.evaluate(async (node: HTMLImageElement) => { await node.decode(); });
    expect(await photo.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(500);
    if (variant === 'critical') await expect(card.locator('.play-critical-art')).toHaveCount(0);
    if (health === 0) await expect(card).toContainText('No health remaining');
    for (const [width, height] of [[1280,640], [1366,768], [1440,900], [390,844], [320,568]]) {
      await page.setViewportSize({ width, height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 320) {
        expect(await card.locator('.play-state-title').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      }
      await card.screenshot({ path: info.outputPath(`health-${health}-${width}.png`), style: '.app-footer{visibility:hidden}' });
    }
  }
  await setHealth(page, 5);
  await expect(photo).toHaveAttribute('data-health-portrait', 'healthy');
  await undoLatestObservation(page);
  await expect(card.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText('0');
  await expect(photo).toHaveAttribute('data-health-portrait', 'critical');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(photo).toHaveAttribute('data-health-portrait', 'critical');
  expect(downloads.every(url => url.includes('cassie-'))).toBe(true);
  const log = await page.evaluate(owner => JSON.parse(localStorage.getItem('final-girl-active-game-v1:' + owner)!).playEvents, userId);
  expect(log.filter((e: {kind: string}) => e.kind === 'killed' || e.kind === 'moment')).toHaveLength(0);
});

test('health input stops at the observed maximum through buttons and manual entry', async ({ page, archive }, info) => {
  archive.aiCastingArt = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true,
    selection: { ...activeGame.selection, finalGirl: 'Cassie', finalGirlStartingHealth: 5 }, playEvents: [start(), state(5)] } });
  await resume(page);
  const card = page.locator('.play-state--finalGirlHealth'), photo = card.locator('.play-stat-portrait');
  const increase = card.getByRole('button', { name: 'Increase Final Girl health', exact: true });
  const log = () => page.evaluate(owner => JSON.parse(localStorage.getItem('final-girl-active-game-v1:' + owner)!).playEvents, userId);
  await expect(increase).toBeDisabled();
  const before = await log();
  await setHealth(page, 6);
  await expect(page.locator('.play-screen > .play-feedback')).toContainText('Use a whole number from 0 to 5.');
  expect(await log()).toEqual(before);
  await card.getByRole('button', { name: 'Cancel', exact: true }).click();
  await card.getByRole('button', { name: 'Decrease Final Girl health', exact: true }).click();
  await expect(increase).toBeEnabled();
  await expect(photo).not.toHaveAttribute('data-health-portrait');
  await increase.click();
  await expect(increase).toBeDisabled();
  await expect(photo).toHaveAttribute('data-health-portrait', 'healthy');
  await photo.evaluate(async (node: HTMLImageElement) => node.decode());
  await card.screenshot({ path: info.outputPath('health-at-maximum.png'), style: '.app-footer{visibility:hidden}' });
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(increase).toBeDisabled();
  await expect(card.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText('5');
});

test('Kate changes portrait maximum after Ultimate without automatically healing', async ({ page, archive }) => {
  archive.aiCastingArt = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true,
    selection: { ...activeGame.selection, finalGirl: 'Kate', finalGirlStartingHealth: 4 }, playEvents: [start(), state(4)] } });
  await resume(page);
  const card = page.locator('.play-state--finalGirlHealth'), photo = card.locator('.play-stat-portrait');
  const increase = card.getByRole('button', { name: 'Increase Final Girl health', exact: true });
  await expect(photo).toHaveAttribute('data-health-portrait', 'healthy');
  await expect(increase).toBeDisabled();
  await page.getByRole('button', { name: 'Ultimate unlocked', exact: true }).click();
  await expect(photo).not.toHaveAttribute('data-health-portrait');
  await expect(increase).toBeEnabled();
  await expect(card.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText('4');
  await page.getByRole('button', { name: 'Record', exact: true }).click();
  await setHealth(page, 7);
  await expect(photo).toHaveAttribute('data-health-portrait', 'healthy');
  await expect(increase).toBeDisabled();
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(photo).toHaveAttribute('data-health-portrait', 'healthy');
  await expect(increase).toBeDisabled();
});

test('missing variants fall back and rejected health writes leave the observed portrait unchanged', async ({ page, archive }) => {
  archive.aiCastingArt = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true,
    selection: { ...activeGame.selection, finalGirl: 'Cassie', finalGirlStartingHealth: 5 }, playEvents: [start(), state(1)] } });
  let rejected = 0;
  await page.route('**/assets/cassie-critical-*.webp', route => { rejected++; return route.abort(); });
  await resume(page);
  const card = page.locator('.play-state--finalGirlHealth'), photo = card.locator('.play-stat-portrait');
  await expect.poll(() => rejected).toBeGreaterThan(0);
  await expect(photo).not.toHaveAttribute('data-health-portrait');
  await expect(photo).toHaveJSProperty('complete', true);
  expect(await photo.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
  await expect(card.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText('1');
  await setHealth(page, 5);
  await expect(photo).toHaveAttribute('data-health-portrait', 'healthy');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('final-girl-active-game-v1:')) throw new Error('synthetic quota');
      return original.call(this, key, value);
    };
  });
  await card.getByRole('button', { name: 'Decrease Final Girl health', exact: true }).click();
  await expect(card.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText('5');
  await expect(photo).toHaveAttribute('data-health-portrait', 'healthy');
});

for (const [maximum, health, ai, expected] of [[undefined,5,true,undefined],[5,5,false,undefined],[4,7,true,undefined],[undefined,1,true,'critical']] as const) {
  test(`legacy/official health ${health}, max ${maximum}, AI ${ai} preserves its interpretation`, async ({ page, archive }) => {
    archive.aiCastingArt = ai;
    await archive.install(page, { draft: { ...activeGame, playMode: true,
      selection: { ...activeGame.selection, finalGirl: 'Cassie', finalGirlStartingHealth: maximum }, playEvents: [start(), state(health)] } });
    await resume(page);
    const photo = page.locator('.play-state--finalGirlHealth .play-stat-portrait');
    if (expected) await expect(photo).toHaveAttribute('data-health-portrait', expected);
    else await expect(photo).not.toHaveAttribute('data-health-portrait');
    await expect(page.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText(String(health));
    if (health >= (maximum ?? 5)) await expect(page.getByRole('button', { name: 'Increase Final Girl health', exact: true })).toBeDisabled();
    if (maximum !== undefined && health > maximum) {
      await page.getByRole('button', { name: 'Decrease Final Girl health', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText(String(maximum));
      await undoLatestObservation(page);
      await expect(page.getByRole('button', { name: 'Set Final Girl health', exact: true })).toHaveText(String(health));
    }
  });
}

test('top Power and Finale reuse the chosen card art through either entry point, corrections and reload', async ({ page, archive }, info) => {
  await archive.install(page, { draft: { ...activeGame, playMode: true, selection: { ...activeGame.selection, killer: 'Poltergeist', location: 'Creech Manor' }, playEvents: [start()] } });
  await resume(page);
  for (const type of ['Dark Power', 'Finale'] as const) {
    const top = page.getByRole('button', { name: type, exact: true });
    await top.click();
    const region = page.locator('.play-moment-editor').getByRole('region', { name: `${type} selection`, exact: true });
    // Use real catalog names to avoid maintaining a duplicate card list here.
    const choices = await region.locator('.module-killer-card strong').allTextContents();
    expect(choices.length).toBeGreaterThan(1);
    const first = choices[0], second = choices[1];
    await chooseKillerCard(page.locator('.play-moment-editor'), type, first);
    const chosen = await region.locator('.module-revealed-hero img').getAttribute('src');
    await expect(top.locator('img')).toHaveAttribute('src', chosen!);
    await page.getByRole('button', { name: 'Record', exact: true }).click();
    await openModule(page, 'poltergeist');
    const panel = page.locator('[data-module="poltergeist"]');
    const section = panel.getByRole('region', { name: `${type} selection`, exact: true });
    // Open the card disclosure if the owner panel has it collapsed.
    if (!(await section.isVisible())) await panel.locator('.module-card-section > summary').click();
    await chooseKillerCard(panel, type, second);
    const updated = await section.locator('.module-revealed-hero img').getAttribute('src');
    expect(updated).not.toBe(chosen);
    await expect(top.locator('img')).toHaveAttribute('src', updated!);
    await section.getByRole('button', { name: `Clear ${type} card name`, exact: true }).click();
    await expect(top).toHaveAttribute('aria-pressed', 'true');
    expect(await top.locator('img').getAttribute('src')).not.toBe(updated);
    await chooseKillerCard(panel, type, first);
    await page.reload();
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    await expect(top.locator('img')).toHaveAttribute('src', chosen!);
    for (const width of [1366,390,320]) {
      await page.setViewportSize({ width, height: 844 });
      await top.screenshot({ path: info.outputPath(`${type}-${width}.png`), style: '.app-footer{visibility:hidden}' });
    }
  }
});
