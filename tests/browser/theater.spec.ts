import { resolve } from 'node:path';
import { test, expect, activeGame, gameId, selection, userId } from './fixtures';

test('the theater keeps the screen and controls inside narrow and wide layouts', async ({ page, archive }, testInfo) => {
  await archive.install(page, { signedIn: false });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Some nights/ })).toBeVisible();
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const selector of ['.theater-screen', '.theater-play', '.theater-footer nav', '.theater-account']) {
      const box = await page.locator(selector).boundingBox();
      expect(box, selector).not.toBeNull();
      expect(box!.x, selector).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, selector).toBeLessThanOrEqual(viewport.width + 1);
    }
    await page.getByRole('button', { name: 'Collection', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Collection', exact: true })).toBeInViewport();
  }
  await page.screenshot({ path: testInfo.outputPath('theater-first-visit.png'), fullPage: true });
  expect(archive.calls).toEqual([]);
});

test('projected scenes preserve the full artwork and the theater opens casting', async ({ page, archive }, testInfo) => {
  archive.history = [{ id: gameId, timestamp: 1, outcome: 'won', killer: selection.killer, location: selection.location, final_girl: selection.finalGirl, scene_image_url: 'http://127.0.0.1:4173/theater-test-still.png' }];
  await archive.install(page);
  await page.route('**/theater-test-still.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/locations/ai/camp-happy-trails.png') }));
  await page.goto('/');
  const art = page.locator('.theater-projection-art').last();
  await expect(art).toBeVisible();
  await expect(art).toHaveCSS('object-fit', 'contain');
  await expect.poll(() => art.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath('theater-projection.png'), fullPage: true });
  await page.getByRole('button', { name: 'START THE TAPE' }).click();
  await expect(page.getByRole('button', { name: /Choose KILLER/i })).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test('projection controls identify the game and open its exact case file', async ({ page, archive }, testInfo) => {
  const olderId = '22222222-2222-4222-8222-222222222222';
  archive.history = [
    { id: gameId, timestamp: 2000, outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', final_girl: 'Laurie', scene_image_url: 'http://127.0.0.1:4173/theater-a.png' },
    { id: olderId, timestamp: 1000, outcome: 'lost', killer: 'Billy the Bear', location: 'Buddyland', final_girl: 'Rena', scene_image_url: 'http://127.0.0.1:4173/theater-b.png', intro_story: 'This is the older Buddyland case file.' },
  ];
  await archive.install(page);
  await page.route(/\/theater-[ab]\.png$/, route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/locations/ai/buddyland.png') }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Laurie vs. Hans' })).toBeVisible();
  await page.getByRole('button', { name: 'Next scene' }).click();
  await expect(page.getByRole('heading', { name: 'Rena vs. Billy the Bear' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play slideshow' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('personal-screening.png'), fullPage: true });
  await page.getByRole('button', { name: 'Open case file' }).click();
  await expect(page.locator('.story-page-content').getByText('This is the older Buddyland case file.')).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test('broken artwork falls back to the same game’s poster and an exhausted reel can retry', async ({ page, archive }) => {
  archive.history = [{ id: gameId, timestamp: 1, outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', final_girl: 'Laurie', scene_image_url: 'http://127.0.0.1:4173/broken-scene.png', poster_image_url: 'http://127.0.0.1:4173/recoverable-poster.png' }];
  await archive.install(page);
  await page.route('**/broken-scene.png', route => route.abort());
  let working = false;
  await page.route('**/recoverable-poster.png', route => working ? route.fulfill({ contentType: 'image/png', path: resolve('src/assets/characters/ai/laurie.png') }) : route.abort());
  await page.goto('/');
  await expect(page.getByText('Stills unavailable. Your case files are safe.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'START THE TAPE' })).toBeEnabled();
  working = true;
  await page.getByRole('button', { name: 'Retry projection' }).click();
  await expect(page.getByRole('img', { name: /Poster from Laurie/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next scene' })).toBeDisabled();
  expect(archive.calls).toEqual([]);
});

test('reduced motion keeps the reel still while manual navigation works', async ({ page, archive }) => {
  archive.history = ['a', 'b'].map((id, i) => ({ id: i ? '22222222-2222-4222-8222-222222222222' : gameId, timestamp: 2000 - i, outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', final_girl: i ? 'Reiko' : 'Laurie', scene_image_url: `http://127.0.0.1:4173/theater-${id}.png` }));
  await archive.install(page);
  await page.route(/\/theater-[ab]\.png$/, route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/locations/ai/camp-happy-trails.png') }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Laurie vs. Hans' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Automatic playback off for reduced motion' })).toBeDisabled();
  await page.getByRole('button', { name: 'Next scene' }).click();
  await expect(page.getByRole('heading', { name: 'Reiko vs. Hans' })).toBeVisible();
  await expect(page.locator('.theater-projection')).toHaveCount(1);
  await expect(page.locator('.theater-projection')).toHaveCSS('animation-name', 'none');
});

test('an unfinished game owns the main screening while past cases remain available', async ({ page, archive }, testInfo) => {
  const draft = { ...activeGame, playMode: true, sceneImageUrl: 'http://127.0.0.1:4173/theater-a.png', playEvents: [{ id: '33333333-3333-4333-8333-333333333333', at: 1, kind: 'start', saved: 3, killed: 2, round: 4 }] };
  archive.history = [{ id: '22222222-2222-4222-8222-222222222222', timestamp: 1000, outcome: 'lost', killer: 'Billy the Bear', location: 'Buddyland', final_girl: 'Rena', scene_image_url: 'http://127.0.0.1:4173/theater-b.png' }];
  await archive.install(page, { draft });
  await page.route(/\/theater-[ab]\.png$/, route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/locations/ai/buddyland.png') }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Laurie vs. Hans' })).toBeVisible();
  await expect(page.getByText('Round 4 · 3 saved · 2 killed')).toBeVisible();
  await expect(page.getByRole('button', { name: 'RESUME GAME', exact: true })).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath('theater-resume.png'), fullPage: true });
  await page.getByRole('button', { name: 'Past screenings' }).click();
  await expect(page.getByRole('heading', { name: 'Rena vs. Billy the Bear' })).toBeVisible();
  await page.getByRole('button', { name: 'Now playing', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Laurie vs. Hans' })).toBeVisible();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save one victim' })).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test('starting another tape requires confirmation and preserves the draft if close cannot be queued', async ({ page, archive }) => {
  await archive.install(page, { draft: activeGame });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start another tape' }).click();
  await page.getByRole('button', { name: 'Keep this game' }).click();
  await expect(page.getByRole('button', { name: 'RESUME GAME', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, '__restoreTheaterStorage', { configurable: true, value: () => { Storage.prototype.setItem = original; } });
    Storage.prototype.setItem = function(key, value) { if (key.startsWith('final-girl-play-outbox-v1:')) throw new DOMException('Full', 'QuotaExceededError'); return original.call(this, key, value); };
  });
  await page.getByRole('button', { name: 'Start another tape' }).click();
  await page.getByRole('button', { name: 'Close game & start another' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  expect(await page.evaluate(id => JSON.parse(localStorage.getItem('final-girl-active-game-v1:' + id)!).id, userId)).toBe(gameId);
  await page.evaluate(() => (window as unknown as { __restoreTheaterStorage: () => void }).__restoreTheaterStorage());
  await page.getByRole('button', { name: 'Close game & start another' }).click();
  await expect(page.getByRole('button', { name: /Choose KILLER/i })).toBeVisible();
  expect(await page.evaluate(id => JSON.parse(localStorage.getItem('final-girl-active-game-v1:' + id)!), userId)).toBeNull();
});

test('a cloud-only game is offered as the primary resume action', async ({ page, archive }) => {
  archive.sessions = [{ id: gameId, revision: 3, closed: false, state: { ...activeGame } }];
  await archive.install(page);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'RESUME CLOUD GAME', exact: true })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Laurie vs. Hans' })).toBeVisible();
  await page.getByRole('button', { name: 'RESUME CLOUD GAME', exact: true }).click();
  await expect(page.getByRole('button', { name: 'WON', exact: true }).first()).toBeVisible();
  expect(await page.evaluate(id => JSON.parse(localStorage.getItem('final-girl-active-game-v1:' + id)!).id, userId)).toBe(gameId);
});

test('signing out removes personal projections and resume details', async ({ page, archive }) => {
  archive.history = [{ id: gameId, timestamp: 1000, outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', final_girl: 'Laurie', scene_image_url: 'http://127.0.0.1:4173/theater-a.png' }];
  await archive.install(page, { draft: activeGame });
  await page.route('**/theater-a.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/locations/ai/camp-happy-trails.png') }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Laurie vs. Hans' })).toBeVisible();
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('button', { name: 'SIGN OUT', exact: true }).click();
  await expect(page.getByText('You have been signed out successfully.', { exact: true })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'START THE TAPE' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Laurie vs. Hans' })).toHaveCount(0);
  await expect(page.locator('.theater-projection-art')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /RESUME/ })).toHaveCount(0);
});
