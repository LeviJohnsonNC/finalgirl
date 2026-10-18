import { test, expect } from './fixtures';

// The redesign changes navigation, so exercise the reader against the real
// corpus and mocked account/collection rather than asserting CSS details.
test('illustrated index opens a focused article and restores its filtered index', async ({ page, archive }, info) => {
  await archive.install(page, { signedIn: false });
  await page.goto('/');
  await page.getByRole('button', { name: 'Rules', exact: true }).click();
  const rules = page.locator('.rules-cinema');
  await expect(rules.getByRole('heading', { name: 'Rulebook.', exact: true })).toBeVisible();
  await expect(rules.getByRole('button', { name: /^Open / })).toHaveCount(10);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => rules.locator('.rule-index-row img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await page.screenshot({ path: info.outputPath('rulebook-index.png'), fullPage: true });
  await rules.getByRole('button', { name: 'COMBAT', exact: true }).click();
  const chapter = rules.getByRole('button', { name: 'Open Attacking the Killer', exact: true });
  await expect(chapter).toHaveCount(1);
  await chapter.focus();
  await chapter.press('Enter');
  await expect(rules.getByRole('article')).toHaveCount(1);
  await expect(rules.getByRole('heading', { name: 'Attacking the Killer', exact: true })).toBeFocused();
  await expect(rules.getByRole('button', { name: /^Open / })).toHaveCount(0);
  await rules.getByRole('button', { name: 'Back to Chapters', exact: true }).first().click();
  await expect(rules.getByRole('button', { name: 'COMBAT', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(chapter).toBeFocused();
  await expect(rules.getByRole('button', { name: /^Open / })).toHaveCount(1);
});

test('reader supports keyboard sections, glossary definitions and related-rule jumps', async ({ page, archive }, info) => {
  await archive.install(page, { signedIn: false });
  await page.goto('/');
  await page.getByRole('button', { name: 'Rules', exact: true }).click();
  const rules = page.locator('.rules-cinema');
  await rules.getByRole('button', { name: 'Open Game Overview', exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('rulebook-overview.png'), fullPage: true });
  await rules.locator('#overview').getByRole('button', { name: 'The Game Turn', exact: true }).click();
  await expect(rules.getByRole('heading', { name: 'The Game Turn', exact: true }).first()).toBeVisible();
  const firstTab = rules.getByRole('tab', { name: 'The Game Turn', exact: true });
  await expect(firstTab).toHaveAttribute('aria-selected', 'true');
  await firstTab.focus();
  await firstTab.press('ArrowRight');
  await expect(rules.getByRole('tab', { name: 'The Action Phase', exact: true })).toBeFocused();
  await expect(rules.getByRole('tabpanel')).toContainText('Action Phase');
  await rules.getByRole('tab', { name: 'The Action Phase', exact: true }).press('Home');
  await expect(firstTab).toBeFocused();
  // Search through nested sections, render the actual dice table and open a glossary definition.
  await rules.getByRole('textbox', { name: 'Search rules' }).fill('Horror Rolls');
  await expect(rules.getByRole('table')).toBeVisible();
  await expect(rules.getByRole('columnheader', { name: 'Die Result', exact: true })).toBeVisible();
  await rules.locator('#horror-rolls').getByRole('button', { name: 'Horror Level', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Determines how many dice');
  await page.getByRole('dialog').getByRole('button', { name: /Jump to section/ }).click();
  await expect(rules.locator('#horror-level')).toBeVisible();
  await page.screenshot({ path: info.outputPath('rulebook-game-turn.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('live search keeps typing focus and opens owned files after delayed collection load', async ({ page, archive }) => {
  archive.films = ['s4-buddyland'];
  archive.holdCollection = true;
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Rules', exact: true }).click();
  const search = page.getByRole('textbox', { name: 'Search rules' });
  await search.pressSequentially('battery-heart', { delay: 35 });
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('battery-heart');
  await expect(page.getByText(/No chapters match/)).toBeVisible();
  archive.releaseCollection();
  await expect(page.locator('#killer-billy-the-bear-rules')).toContainText('Spend 1 Time');
  await expect(search).toBeFocused();
  await search.fill('Arcade spaces');
  await expect(page.locator('#location-buddyland-rules')).toContainText('4 spaces in the center of the board');
  await page.getByRole('button', { name: 'Back to Chapters', exact: true }).first().click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByRole('button', { name: 'Open Buddyland', exact: true })).toBeVisible();
});

test('owned deep links wait for collection loading and chapter navigation works at both sizes', async ({ page, archive }, info) => {
  archive.films = ['s4-buddyland'];
  archive.holdCollection = true;
  await archive.install(page);
  await page.goto('/#rules/location-buddyland-rules');
  await page.getByRole('button', { name: 'Rules', exact: true }).click();
  archive.releaseCollection();
  await expect(page.locator('#location-buddyland-rules')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Special Rules', exact: true })).toHaveAttribute('aria-selected', 'true');
  if (info.project.name === 'mobile') {
    await page.getByRole('combobox', { name: 'Choose chapter' }).selectOption('ch-overview');
  } else {
    await page.getByRole('navigation', { name: 'Chapter navigation', exact: true }).getByRole('button', { name: '01 Game Overview', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Game Overview', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Next chapter.*The Boards/ }).click();
  await expect(page.getByRole('heading', { name: 'The Boards', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'The Location Board', exact: true }).click();
  await expect(page.locator('#location-board')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
