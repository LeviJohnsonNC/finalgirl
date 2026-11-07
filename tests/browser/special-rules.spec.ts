import type { Page } from '@playwright/test';
import { activeGame, expect, selection, test, userId } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function resumeGame(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  return page.getByRole('button', { name: 'Special Rules', exact: true });
}

const playLog = (page: Page) => page.evaluate((key) => {
  const draft = localStorage.getItem(key);
  return draft ? JSON.parse(draft).playEvents : undefined;
}, `final-girl-active-game-v1:${userId}`);

test('special rules navigate from Now Playing without moving the page or recording gameplay', async ({ page, archive }, info) => {
  await page.setViewportSize(info.project.name === 'mobile' ? { width: 320, height: 680 } : { width: 1024, height: 600 });
  archive.films = ['s3-killer-from-tomorrow'];
  const hunter = { ...selection, killer: 'The Hunter', location: 'Sunnydaze Mall', finalGirl: 'Kat', filmId: archive.films[0] };
  await archive.install(page, { draft: { ...activeGame, selection: hunter, introStory: 'Kat watched the mall gates come down. Across the atrium, the Hunter stepped out of the dark.', playEvents: [] } });
  const trigger = await resumeGame(page);
  await expect(trigger).toBeVisible();
  await expect(trigger.locator('svg')).toHaveCount(0);
  await trigger.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('special-rules-trigger.png') });
  const before = await playLog(page);

  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Special Rules', exact: true });
  const setup = dialog.getByRole('tab', { name: 'Setup', exact: true });
  const rules = dialog.getByRole('tab', { name: 'Rules', exact: true });
  const panel = dialog.getByRole('tabpanel');
  await expect(setup).toHaveAttribute('aria-selected', 'true');
  await expect(panel).toContainText('Start with Mark V');
  await expect(dialog.getByRole('button', { name: 'The Hunter', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => dialog.locator('.special-rules-header img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: info.outputPath('hunter-setup.png'), animations: 'disabled' });

  await setup.focus();
  await setup.press('ArrowRight');
  await expect(rules).toBeFocused();
  await expect(rules).toHaveAttribute('aria-selected', 'true');
  await expect(panel.getByRole('table').first()).toBeVisible();
  await page.screenshot({ path: info.outputPath('hunter-rules.png') });
  expect(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);

  await dialog.getByRole('button', { name: 'Sunnydaze Mall', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'The Savior and targeting', exact: true })).toBeInViewport();
  const pageScroll = await page.evaluate(() => scrollY);
  const topics = dialog.getByRole('combobox', { name: 'Jump to topic' });
  await topics.selectOption({ label: 'Exiting the mall' });
  const exits = panel.getByRole('heading', { name: 'Exiting the mall', exact: true });
  await expect(exits).toBeFocused();
  await expect(exits).toBeInViewport();
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBe(pageScroll);
  await page.screenshot({ path: info.outputPath('sunnydaze-topic.png') });

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press('Enter');
  await expect(dialog.getByRole('button', { name: 'Sunnydaze Mall', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(rules).toHaveAttribute('aria-selected', 'true');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  expect(await playLog(page)).toEqual(before);
});

test('a single applicable location opens directly and renders its setup diagrams', async ({ page, archive }, info) => {
  archive.films = ['s1-sacred-groves', 's2-madness-in-dark'];
  const groves = { ...selection, killer: 'Ratchet Lady', location: 'Sacred Groves', finalGirl: 'Adelaide', filmId: archive.films[0] };
  await archive.install(page, { draft: { ...activeGame, selection: groves } });
  await (await resumeGame(page)).click();
  const dialog = page.getByRole('dialog', { name: 'Special Rules', exact: true });
  await expect(dialog.getByRole('group', { name: 'Killer and location' })).toHaveCount(0);
  await expect(dialog.getByRole('tab', { name: 'Setup', exact: true })).toHaveAttribute('aria-selected', 'true');
  const panel = dialog.getByRole('tabpanel');
  const diagram = panel.getByRole('img', { name: /setup diagram/ }).first();
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toBeInViewport({ ratio: 0.98 });
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('groves-setup.png'), animations: 'disabled' });
});
