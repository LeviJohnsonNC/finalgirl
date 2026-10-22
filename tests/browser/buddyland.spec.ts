import { saveResultOnly } from "./play-helpers";
import { test, expect, activeGame } from './fixtures';
import type { Page } from '@playwright/test';

async function choose(page: Page, slot: number, name: string) {
  await page.getByRole('button', { name: 'Choose', exact: true }).nth(slot).click();
  await page.getByRole('dialog').getByRole('button', { name: new RegExp(name) }).click();
}

test('unlock Buddyland, cast both girls, choose cards and save a complete game', async ({ page, archive }, info) => {
  // Full collection/casting/reload/save journey, including five review screenshots.
  test.setTimeout(120000);
  archive.storyText = 'Gwynn stepped between the silent arcade cabinets. Somewhere behind the Prize Counter, a motor began to turn.';
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: /My Collection|^Collection$/ }).click();
  const own = page.getByRole('switch', { name: 'Own Bad Times at Buddyland' });
  await expect(own).toBeEnabled(); await own.click();
  await expect.poll(() => archive.films).toContain('s4-buddyland');
  await page.screenshot({ path: info.outputPath('buddyland-collection.png'), fullPage: true });
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE' }).click();
  await choose(page, 0, 'Billy the Bear');
  await choose(page, 1, 'Buddyland');
  await choose(page, 2, 'Rena');
  await page.getByRole('button', { name: 'View Rena info' }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Ultimate ability', exact: true })).toBeVisible();
  await page.getByRole('dialog').locator('.girl-backstory > summary').click();
  await expect(page.getByRole('dialog').getByText(/therapist/)).toBeVisible();
  await page.screenshot({ path: info.outputPath('rena-dossier.png'), fullPage: true });
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
  await choose(page, 2, 'Gwynn');
  await page.getByRole('button', { name: 'View Gwynn info' }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Ultimate ability', exact: true })).toBeVisible();
  await page.getByRole('dialog').locator('.girl-backstory > summary').click();
  await expect(page.getByRole('dialog').getByText(/mechanic/)).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Buddyland case notes' })).toHaveCount(0);
  for (const name of ['Billy the Bear', 'Buddyland', 'Gwynn']) {
    const image = page.getByRole('img', { name, exact: true });
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(100);
  }
  await page.getByRole('combobox', { name: 'Setup Scenario' }).click();
  await expect(page.getByRole('option')).toHaveCount(5);
  await page.getByRole('option', { name: 'Birthday Bash' }).click();
  await page.getByRole('combobox', { name: 'Starting Event' }).click();
  await expect(page.getByRole('option')).toHaveCount(10);
  await page.getByRole('option', { name: 'Birthday Girl', exact: true }).click();
  await expect(page.getByText(/If she is alone during the Panic phase/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Birthday Bash', exact: true })).toHaveCount(0);
  await expect(page.getByText('Tape ready', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('buddyland-casting.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Press Play', exact: true }).click();
  await expect(page.getByText(archive.storyText, { exact: true })).toBeVisible();
  const request = archive.generationRequests.find(r => r.name === 'generate-story')!;
  expect(JSON.stringify(request.body)).toContain('mechanic');
  expect(JSON.stringify(request.body)).toContain('Six Victims');
  expect(JSON.stringify(request.body)).toContain('4 Time');
  await page.getByRole('button', { name: 'WON', exact: true }).first().click();
  await expect(page.getByLabel('Final Girl Health', { exact: true })).toHaveValue('');
  await page.getByLabel('Final Girl Health', { exact: true }).fill('5');
  await page.getByLabel('Killer Health', { exact: true }).fill('0');
  await page.getByLabel('Buddies in Play at End (0–7)').fill('2');
  await page.getByLabel('All Power Sources Inactive').check();
  await page.getByLabel('Billy Finale (optional)').click();
  await page.getByRole('option', { name: 'Power Surge', exact: true }).click();
  await page.getByLabel('Boris at Game End').click();
  await page.getByRole('option', { name: 'Defeated', exact: true }).click();
  await page.getByLabel('Victims Saved', { exact: true }).fill('4');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await expect(page.getByLabel('Buddies in Play at End (0–7)')).toHaveValue('2');
  await expect(page.getByLabel('All Power Sources Inactive')).toBeChecked();
  await expect(page.getByLabel('Boris at Game End')).toHaveText('Defeated');
  await page.screenshot({ path: info.outputPath('buddyland-outcome.png'), fullPage: true });
  await saveResultOnly(page);
  await expect.poll(() => archive.history.length).toBe(1);
  await expect.poll(() => archive.history[0]).toMatchObject({ killer: 'Billy the Bear', location: 'Buddyland', final_girl: 'Gwynn', victims_saved: 4, final_girl_health: 5, killer_health: 0 });
  expect(archive.history[0].game_highlights).toContain('Buddies in play at end: 2');
  expect(archive.history[0].game_highlights).toContain('All Power Sources Inactive');
  expect(archive.history[0].game_highlights).toContain('Boris: defeated');
  expect(archive.calls).not.toContain('generate-ending');
});

test('owned Buddyland rules are searchable with the correct power cost', async ({ page, archive }, info) => {
  archive.films = ['s4-buddyland'];
  archive.holdCollection=true;
  await archive.install(page); await page.goto('/');
  await page.getByRole('button', { name: 'Rules', exact: true }).click();
  const search = page.getByPlaceholder('SEARCH RULES, TERMS, ICONS...');
  await search.fill('battery-heart');
  await expect(page.getByText(/No chapters match/)).toBeVisible();
  archive.releaseCollection();
  await expect(page.getByText(/Spend 1 Time while in a Power Source/)).toBeVisible();
  await expect(page.locator('#killer-billy-the-bear-rules').getByText(/not automatic healing every turn/)).toBeVisible();
  await page.screenshot({ path: info.outputPath('billy-rules.png'), fullPage: true });
  await search.fill('Arcade spaces');
  await expect(page.locator('#location-buddyland-rules').getByText(/4 spaces in the center of the board/)).toBeVisible();
});

test('Billy brings Buddies to another Location', async ({ page, archive }) => {
  await archive.install(page, { draft: { ...activeGame, selection: { ...activeGame.selection, killer: 'Billy the Bear', finalGirl: 'Rena' } } });
  await page.goto('/'); await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await page.getByRole('button', { name: 'LOST', exact: true }).first().click();
  await expect(page.getByLabel('All Power Sources Inactive')).toBeVisible();
  await expect(page.getByLabel('Final Girl Health', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Killer Health', { exact: true })).toHaveValue('');
});

test('a different killer at Buddyland has no Billy-only outcome fields', async ({ page, archive }) => {
  await archive.install(page, { draft: { ...activeGame, selection: { ...activeGame.selection, location: 'Buddyland', finalGirl: 'Gwynn' } } });
  await page.goto('/'); await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await page.getByRole('button', { name: 'WON', exact: true }).first().click();
  await expect(page.getByLabel('All Power Sources Inactive')).toHaveCount(0);
  await expect(page.getByLabel('Final Girl Health', { exact: true })).toHaveValue('');
});


test('casting file pickers keep every category in alphabetical order', async ({ page, archive }) => {
  archive.films = ['s1-maple-lane', 's4-buddyland', 's1-camp-happy-trails'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE' }).click();
  const expected = [
    ['Billy the Bear', 'Dr. Fright', 'Hans'],
    ['Buddyland', 'Camp Happy Trails', 'Maple Lane'],
    ['Gwynn', 'Laurie', 'Nancy', 'Reiko', 'Rena', 'Sheila'],
  ];
  for (const [index, names] of expected.entries()) {
    await page.getByRole('button', { name: 'Choose', exact: true }).nth(index).click();
    await expect(page.getByRole('dialog').locator('.dossier-meta__value')).toHaveText(names);
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
  }
  expect(archive.calls).toEqual([]);
});
