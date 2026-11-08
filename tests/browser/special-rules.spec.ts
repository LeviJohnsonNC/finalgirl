import type { Locator, Page } from '@playwright/test';
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

async function expectNoHorizontalOverflow(panel: Locator) {
  const overflow = await panel.evaluate((reader) => {
    const elements = reader.querySelectorAll('.rule-table-wrap, .rule-table, .rule-record, .rule-record-fields, dd');
    return [reader, ...Array.from(elements)].filter((node) => node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1)
      .map((node) => ({ element: node.className, width: node.clientWidth, content: node.scrollWidth }));
  });
  expect(overflow).toEqual([]);
}

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
  await expectNoHorizontalOverflow(panel);

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
  const diagram = panel.getByRole('img', { name: /setup diagram/ }).last();
  const heading = panel.getByRole('heading', { name: 'Worship Service', exact: true });
  await dialog.getByRole('combobox', { name: 'Jump to setup' }).selectOption({ label: 'Worship Service' });
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toBeInViewport({ ratio: 0.98 });
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('groves-setup.png'), animations: 'disabled' });
  await dialog.getByRole('tab', { name: 'Rules', exact: true }).click();
  await expect(panel.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Unleash Divine Wrath' }) })).toBeVisible();
  await expectNoHorizontalOverflow(panel);
});

test('Sunnydaze placements and card effects reflow within the modal', async ({ page, archive }, info) => {
  archive.films = ['s3-killer-from-tomorrow'];
  const hunter = { ...selection, killer: 'The Hunter', location: 'Sunnydaze Mall', finalGirl: 'Kat', filmId: archive.films[0] };
  await archive.install(page, { draft: { ...activeGame, selection: hunter } });
  await (await resumeGame(page)).click();
  const dialog = page.getByRole('dialog', { name: 'Special Rules', exact: true });
  await dialog.getByRole('button', { name: 'Sunnydaze Mall' }).click();
  await page.evaluate(() => document.fonts.ready);
  const panel = dialog.getByRole('tabpanel');
  const sizes = info.project.name === 'mobile'
    ? [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 740, height: 360 }]
    : [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 530 }];

  for (const { width, height } of sizes) {
    await page.setViewportSize({ width, height });
    await dialog.getByRole('tab', { name: 'Setup', exact: true }).click();
    const setupJump = dialog.getByRole('combobox', { name: 'Jump to setup' });
    await setupJump.selectOption({ label: 'Setup card placements' });
    await expect(panel.getByRole('heading', { name: 'Setup card placements' })).toBeFocused();
    const placements = panel.getByRole('list', { name: 'Setup', exact: true });
    await expect(placements).toBeInViewport();
    await expect(placements.locator(':scope > li')).toHaveCount(5);
    const firstSetup = placements.locator(':scope > li').first();
    await expect(firstSetup).toContainText('Foodcourt Faceoff');
    await expect(firstSetup.locator('dt')).toHaveText(['Final Girl', 'Killer', 'Savior', 'Victims · all unlisted spaces 0']);
    await expect(firstSetup.locator('dd').nth(2)).toHaveText('North Railing · West');
    await expect(firstSetup.getByRole('listitem').filter({ hasText: 'Smokin’ Subject: 2' })).toHaveCount(1);
    await expectNoHorizontalOverflow(panel);
    expect(await panel.evaluate((reader) => reader.clientHeight)).toBeGreaterThan(height / 2);
    await page.screenshot({ path: info.outputPath(`sunnydaze-placements-${width}.png`) });
    await setupJump.selectOption({ label: 'Family Dinner' });
    const lastSetup = placements.locator(':scope > li').last();
    await expect(lastSetup).toBeFocused();
    await expect(lastSetup.getByText('Family Dinner', { exact: true })).toBeInViewport();
    await setupJump.selectOption({ label: 'Start of setup' });
    await expect(panel.getByRole('heading', { name: 'Setup checklist' })).toBeInViewport();

    await dialog.getByRole('tab', { name: 'Rules', exact: true }).click();
    const topics = dialog.getByRole('combobox', { name: 'Jump to topic' });
    await topics.selectOption({ label: 'Savior cards and Upkeep' });
    const savior = panel.getByRole('list', { name: 'Savior card', exact: true });
    await expect(savior.locator(':scope > li')).toHaveCount(8);
    await expect(savior.locator('dt').nth(4)).toHaveText('I Believe You!');
    await expect(savior.locator('dd').nth(4)).toHaveText('Move him up to two spaces in any direction.');
    await savior.locator(':scope > li').first().scrollIntoViewIfNeeded();
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeInViewport();
    await expectNoHorizontalOverflow(panel);
    await page.screenshot({ path: info.outputPath(`sunnydaze-savior-${width}.png`) });
    await topics.selectOption({ label: 'Events' });
    if (width < 560) {
      await expect(panel.getByRole('list', { name: 'Event', exact: true })).toBeInViewport();
      await expect(panel.getByRole('table')).toHaveCount(0);
    } else {
      await expect(panel.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Event', exact: true }) })).toBeInViewport();
    }
  }
});
