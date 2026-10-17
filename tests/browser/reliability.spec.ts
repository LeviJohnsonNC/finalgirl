import { test, expect, activeGame, gameId, opening, selection, userId } from './fixtures';

async function resume(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
}

test('sign in, edit collection, reload, and sign out', async ({ page, archive }) => {
  await archive.install(page, { signedIn: false });
  await page.goto('/auth');
  await page.getByLabel('EMAIL', { exact: true }).fill('qa@example.test');
  await page.getByLabel('PASSWORD', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'SIGN IN', exact: true }).click();
  await page.getByRole('button', { name: /My Collection|^Collection$/ }).click();
  const toggle = page.getByRole('switch', { name: 'Own The Haunting of Creech Manor' });
  await expect(toggle).toBeEnabled(); await toggle.click();
  await expect.poll(() => archive.films).toContain('s1-creech-manor');
  await page.reload();
  await page.getByRole('button', { name: /My Collection|^Collection$/ }).click();
  await expect(page.getByRole('switch', { name: 'Own The Haunting of Creech Manor' })).toBeChecked();
  // The desktop account link is hidden text on mobile; use the footer button
  // containing the User icon's sibling text via an explicit accessible label.
  await page.getByRole('button', { name: 'ACCOUNT', exact: true }).click();
  await expect(page.getByRole('button', { name: 'SIGN OUT', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'SIGN OUT', exact: true }).click();
  await expect(page.getByRole('button', { name: 'SIGN IN', exact: true })).toBeVisible();
});

test('resume form edits and retry a failed save without losing the result', async ({ page, archive }, testInfo) => {
  archive.failWrites = true;
  await archive.install(page, { draft: activeGame }); await resume(page);
  await page.getByRole('button', { name: 'WON', exact: true }).first().click();
  await page.getByLabel('Weapon Used', { exact: true }).fill('Axe');
  await page.getByLabel('Final Girl Health', { exact: true }).fill('1');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await expect(page.getByLabel('Weapon Used', { exact: true })).toHaveValue('Axe');
  await expect(page.getByLabel('Final Girl Health', { exact: true })).toHaveValue('1');
  await page.screenshot({ path: testInfo.outputPath('recovered-outcome.png'), fullPage: true });
  await page.getByRole('button', { name: 'SAVE RESULT WITHOUT NARRATION' }).click();
  await expect(page.getByText(/saved on this device and waiting/)).toBeVisible();
  archive.failWrites = false;
  await page.getByRole('button', { name: 'RETRY SAVE' }).click();
  await expect.poll(() => archive.history.length).toBe(1);
  await expect.poll(() => archive.history[0].weapon_used).toBe('Axe');
  expect(archive.history[0].victims_saved).toBe(0);
  await expect(page.getByText(/saved on this device and waiting/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'RESUME GAME' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Scrapbooks', exact: true }).click();
  await page.getByRole('button', { name: /Final Girl Scrapbook/ }).click();
  await page.locator('.scrapbook-thumbnail').first().click();
  await expect(page.locator('.story-page-content').getByText('Axe', { exact: true })).toBeVisible();
});

test('record and save a result through an AI outage', async ({ page, archive }, testInfo) => {
  archive.failStory = true;
  await archive.install(page, { draft: { ...activeGame, introStory: undefined } }); await resume(page);
  await expect(page.locator('.scenario-description').getByText('Generation temporarily unavailable', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'LOST', exact: true }).first().click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Your result is saved. An opening story is needed to generate an ending.')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('no-ai-save.png'), fullPage: true });
  await page.getByRole('button', { name: 'SAVE RESULT', exact: true }).first().click();
  await expect.poll(() => archive.history[0]?.outcome).toBe('lost');
  await expect.poll(() => archive.history[0]?.final_girl_health).toBe(0);
  expect(archive.calls.filter(name => name === 'generate-ending')).toHaveLength(0);
});

test('attach a poster that finishes after Save', async ({ page, archive }) => {
  archive.autoImages = true;
  const record = { id: gameId, timestamp: 1, outcome: 'won', killer: selection.killer, location: selection.location, final_girl: selection.finalGirl, intro_story: opening };
  archive.history.push(record);
  await archive.install(page, { draft: { ...activeGame, phase: 'ending', result: { ...selection, id: gameId, timestamp: 1, outcome: 'won' }, endingStory: 'Laurie reached the road. She had survived the night.', formData: { finalHorrorLevel: 4, finalGirlHealth: 1, killerHealth: 0, weaponUsed: '', victimsSaved: 0, victimsKilled: 0, endingSubLocation: '', gameHighlights: '' } } });
  await resume(page);
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true);
  await page.getByRole('button', { name: 'SAVE', exact: true }).first().click();
  archive.releaseImage!();
  await expect.poll(() => archive.history[0].poster_image_url).toBe('https://example.test/poster.png');
  await expect.poll(() => page.evaluate(id => JSON.parse(localStorage.getItem('final-girl-history-v3:' + id) ?? '[]')[0]?.posterImageUrl, userId)).toBe('https://example.test/poster.png');
});
