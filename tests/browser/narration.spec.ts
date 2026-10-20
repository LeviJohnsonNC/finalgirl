import { resolve } from 'node:path';
import { test, expect, gameId, installTestAudio } from './fixtures';

const selection = { killer: 'Billy the Bear', location: 'Buddyland', finalGirl: 'Rena', setupScenario: 'Birthday Bash', startingEvent: 'Birthday Girl', mission: null, filmId: 's4-buddyland' };
const paragraph = 'The chain on the side door of Buddyland had been cut years ago, though nobody in Rena’s group admitted knowing that before tonight. Her classmates entered in nervous pairs, flashlights skating over the Dining Area and the Prize Counter. From somewhere near the Party Room, a recorded child’s voice whispered, *“Nobody goes alone.”*';
const story = Array.from({ length: 12 }, () => paragraph).join('\n\n');
const stillUrl = 'http://127.0.0.1:4173/narration-still.png';
const posterUrl = 'http://127.0.0.1:4173/narration-poster.png';
const draft = { version: 1, id: gameId, phase: 'nowPlaying', selection, introStory: story, sceneImageUrl: stillUrl };
const formData = { finalHorrorLevel: 4, finalGirlHealth: 2, killerHealth: 0, weaponUsed: 'Flashlight', victimsSaved: 3, victimsKilled: 6, endingSubLocation: 'Arcade', gameHighlights: '' };

async function photos(page: import('@playwright/test').Page) {
  await page.route('**/narration-still.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/locations/ai/buddyland.png') }));
  await page.route('**/narration-poster.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/scrapbooks/final-girl-cover.png') }));
}

async function resume(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await page.locator('.narration-title').waitFor();
  await page.evaluate(() => document.fonts.ready);
}

test('opening reader supports long stories, full-size photos, narration and results', async ({ page, archive }, testInfo) => {
  if (testInfo.project.name === 'desktop') await page.setViewportSize({ width: 1672, height: 941 });
  await archive.install(page, { draft });
  await installTestAudio(page);
  await photos(page);
  await resume(page);
  await expect(page.locator('.narration-tagline, .narration-cast')).toHaveCount(0);
  const reader = page.getByRole('region', { name: 'Opening narration' });
  const image = page.getByRole('img', { name: 'Scene still', exact: true });
  await image.evaluate((img: HTMLImageElement) => img.decode());
  await page.screenshot({ path: testInfo.outputPath('opening.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  if (testInfo.project.name === 'desktop') {
    expect(await reader.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    await reader.focus();
    await reader.press('End');
    await expect.poll(() => reader.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await expect(page.getByRole('button', { name: 'WON', exact: true })).toBeInViewport();
  } else {
    expect(await reader.evaluate(el => getComputedStyle(el).maxHeight)).toBe('none');
  }
  await page.getByRole('button', { name: 'View scene still full size' }).click();
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('src', stillUrl);
  await expect(page.getByRole('dialog').locator('.image-lightbox-edge')).toBeVisible();
  await expect(page.getByRole('dialog').locator('p')).toHaveCount(0);
  if (testInfo.project.name === 'desktop') expect((await page.getByRole('dialog').boundingBox())!.width).toBeGreaterThan(1000);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Narrate', exact: true }).click();
  await expect(page.getByRole('progressbar', { name: 'Narration progress' })).toBeVisible();
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await page.getByRole('button', { name: 'Special Rules', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  if (testInfo.project.name === 'desktop') expect((await page.getByRole('dialog').boundingBox())!.width).toBeGreaterThan(900);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'WON', exact: true }).click();
  await expect(page.getByLabel('Weapon Used', { exact: true })).toBeVisible();
});

for (const outcome of ['won', 'lost'] as const) {
  test(`ending ${outcome} preserves the full portrait poster, narration and saved result`, async ({ page, archive }, testInfo) => {
    if (testInfo.project.name === 'desktop') await page.setViewportSize({ width: 1672, height: 941 });
    archive.history.push({ id: gameId, timestamp: 1, outcome, killer: selection.killer, location: selection.location, final_girl: selection.finalGirl, intro_story: story });
    await archive.install(page, { draft: { ...draft, phase: 'ending', result: { ...selection, id: gameId, timestamp: 1, outcome }, endingStory: story, posterImageUrl: posterUrl, formData } });
    await installTestAudio(page);
    await photos(page);
    await resume(page);
    const poster = page.getByRole('img', { name: 'Movie poster', exact: true });
    await poster.evaluate((img: HTMLImageElement) => img.decode());
    const ratio = await poster.evaluate((img: HTMLImageElement) => img.clientWidth / img.clientHeight);
    expect(Math.abs(ratio - 341 / 512)).toBeLessThan(.01);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`ending-${outcome}.png`), fullPage: true });
    await expect(page.getByRole('button', { name: 'SAVE', exact: true })).toBeInViewport();
    await page.getByRole('button', { name: 'Narrate', exact: true }).click();
    await expect(page.getByRole('progressbar', { name: 'Narration progress' })).toBeVisible();
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await page.getByRole('button', { name: 'SAVE', exact: true }).click();
    await expect.poll(() => archive.history[0]?.outcome).toBe(outcome);
    await expect.poll(() => archive.history[0]?.ending_narration).toBe(story);
  });
}

test('ending gives its story the spare screen width and keeps only Save and Narrate', async ({ page, archive }, info) => {
  await archive.install(page, { draft: { ...draft, phase: 'ending', result: { ...selection, id: gameId, timestamp: 1, outcome: 'lost' }, endingStory: story, posterImageUrl: posterUrl, formData } });
  await photos(page);
  await resume(page);
  await expect(page.getByRole('button', { name: 'Session options', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'SAVE', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Narrate', exact: true })).toBeVisible();
  const sizes = info.project.name === 'desktop'
    ? [{ width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1382, height: 766 }, { width: 1672, height: 941 }, { width: 1920, height: 1080 }]
    : [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }];
  for (const size of sizes) {
    await page.setViewportSize(size);
    const reader = page.getByRole('region', { name: 'Ending narration' });
    await expect(reader).toContainText('The chain on the side door');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = (await reader.boundingBox())!;
    expect(await reader.locator('.narration-prose').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(19);
    if (info.project.name === 'desktop') {
      expect(box.width).toBeGreaterThan(size.width * .48);
      // The reader's ResizeObserver recalculates available height after a resize.
      await expect.poll(async () => {
        const bounds = (await reader.boundingBox())!;
        const footer = (await page.locator('.app-footer').boundingBox())!;
        return bounds.y + bounds.height - footer.y;
      }).toBeLessThan(0);
      expect((await page.getByRole('button', { name: 'SAVE', exact: true }).boundingBox())!.width).toBeLessThanOrEqual(440);
    } else {
      await expect(reader).toHaveCSS('max-height', 'none');
      await expect(reader).toHaveCSS('overflow-y', 'visible');
      expect(box.width).toBeGreaterThanOrEqual(Math.min(size.width, 700) - 60);
    }
    if (size.width === 1382 || size.width === 390) await page.screenshot({ path: info.outputPath(`ending-refined-${size.width}.png`), fullPage: true });
  }
});

test('a broken opening photograph can be developed again without losing the story', async ({ page, archive }) => {
  await archive.install(page, { draft });
  await page.route('**/narration-still.png', route => route.fulfill({ status: 404 }));
  await page.route('https://example.test/poster.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/locations/ai/buddyland.png') }));
  await resume(page);
  await expect(page.getByText('This photograph could not be loaded.')).toBeVisible();
  await page.getByRole('button', { name: 'Try Again', exact: true }).click();
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true);
  archive.releaseImage!();
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toHaveAttribute('src', 'https://example.test/poster.png');
  await expect(page.getByRole('region', { name: 'Opening narration' })).toContainText('The chain on the side door');
  await expect(page.getByRole('button', { name: 'WON', exact: true })).toBeEnabled();
});

test('sacrificial wins carry reviewed fate and mission into story and poster without claiming survival', async ({ page, archive }) => {
  archive.autoImages = true;
  const selected = { ...selection, killer: 'Slayer', location: 'Falconwood', finalGirl: 'Nancy', mission: 'Save Your Father', filmId: 's3-falconwood' };
  const result = { id: gameId, timestamp: 1, outcome: 'won', ...selected, introStory: story };
  archive.history.push({ id: gameId, timestamp: 1, outcome: 'won', killer: selected.killer, location: selected.location, final_girl: selected.finalGirl });
  await archive.install(page, { draft: { ...draft, selection: selected, phase: 'ending', result, visualBible: 'Nancy and Slayer retain their established identities.', formData: { ...formData, finalGirlHealth: 0 } } });
  await resume(page);
  await expect(page.getByText('Victory came at a terrible cost.')).toBeVisible();
  await expect.poll(() => archive.generationRequests.some(r => r.name === 'generate-ending')).toBe(true);
  const ending = archive.generationRequests.find(r => r.name === 'generate-ending')!;
  expect(ending.body.finalGirlHealth).toBe(0);
  expect(ending.body.mission).toMatchObject({ name: 'Save Your Father' });
  await expect.poll(() => archive.generationRequests.some(r => r.name === 'generate-scene-image')).toBe(true);
  const poster = archive.generationRequests.find(r => r.name === 'generate-scene-image')!;
  expect(poster.body.finalGirlHealth).toBe(0);
  expect(poster.body.introStory).toBe(story);
  expect(poster.body.mission).toMatchObject({ name: 'Save Your Father' });
  expect(poster.body.scenarioRules).toContain('Mirror Dimension');
  archive.releaseImage?.();
});

test('blank health is unknown, explicit zero remains zero across reload and generation', async ({ page, archive }) => {
  await archive.install(page, { draft: { ...draft, sceneImageUrl: undefined } });
  await resume(page);
  await page.getByRole('button', { name: 'WON', exact: true }).first().click();
  const health = page.getByLabel('Final Girl Health', { exact: true });
  await expect(health).toHaveValue('');
  await health.fill('0');
  await expect(health).toHaveValue('0');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await expect(page.getByLabel('Final Girl Health', { exact: true })).toHaveValue('0');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Victory came at a terrible cost.')).toBeVisible();
  await expect.poll(() => archive.generationRequests.some(r => r.name === 'generate-ending')).toBe(true);
  const ending = archive.generationRequests.find(r => r.name === 'generate-ending')!;
  expect(ending.body.finalGirlHealth).toBe(0);
  expect(ending.body).not.toHaveProperty('killerHealth');
});

test('legacy unkillable zero health is omitted from both ending generation requests', async ({ page, archive }) => {
  archive.autoImages = true;
  const selected = { ...selection, killer: 'Poltergeist', location: 'Creech Manor', finalGirl: 'Alice' };
  const result = { id: gameId, timestamp: 1, outcome: 'won', ...selected, introStory: story };
  archive.history.push({ id: gameId, timestamp: 1, outcome: 'won', killer: selected.killer, location: selected.location, final_girl: selected.finalGirl });
  await archive.install(page, { draft: { ...draft, selection: selected, phase: 'ending', result, formData: { ...formData, finalGirlHealth: 2, killerHealth: 0 } } });
  await resume(page);
  await expect.poll(() => archive.generationRequests.some(r => r.name === 'generate-scene-image')).toBe(true);
  for (const name of ['generate-ending', 'generate-scene-image']) {
    const request = archive.generationRequests.find(r => r.name === name)!;
    expect(request.body).not.toHaveProperty('killerHealth');
    expect(JSON.stringify(request.body)).toContain('escape with her');
  }
  archive.releaseImage?.();
});
