import { resolve } from 'node:path';
import { test, expect, gameId, activeGame } from './fixtures';

const id2 = '22222222-2222-4222-8222-222222222222';
const id3 = '33333333-3333-4333-8333-333333333333';
const poster = (id: string) => `http://127.0.0.1:4173/lobby-poster-${id}.png`;
const rows = [gameId, id2, id3].map((id, i) => ({ id, timestamp: Date.UTC(2026, 9, 18 - i, 18), outcome: i === 1 ? 'lost' : 'won',
  killer: i === 1 ? 'Billy the Bear' : 'Hans', location: i === 1 ? 'Buddyland' : 'Camp Happy Trails', final_girl: i === 1 ? 'Rena' : 'Laurie',
  poster_image_url: poster(id), intro_story: `Exact case ${id}.` }));

test('the lobby is separate, browses real posters and opens the exact case without generating images', async ({ page, archive }, info) => {
  archive.history = rows;
  const requested: string[] = [];
  await archive.install(page);
  await page.route('**/lobby-poster-*.png', route => { requested.push(route.request().url()); return route.fulfill({ contentType: 'image/png', path: resolve('src/assets/scrapbooks/final-girl-cover.png') }); });
  await page.goto('/');
  await expect(page.locator('.theater-projection')).toHaveCount(0);
  await expect(page.locator('.poster-lobby')).toHaveCount(0);
  expect(requested).toEqual([]);
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some(entry => /\/(wall|cabinet)-/.test(entry.name)))).toBe(false);
  const before = await page.locator('.theater-screen').boundingBox();
  await page.getByRole('navigation', { name: 'Theater navigation' }).getByRole('button', { name: 'Lobby', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Starlight Lobby' })).toBeVisible();
  const expected = info.project.name === 'mobile' ? 1 : 2;
  await expect(page.locator('.lobby-artwork img')).toHaveCount(expected);
  await page.locator('.lobby-artwork img').evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
  expect(requested.length).toBe(expected);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('starlight-lobby.png'), fullPage: true, animations: 'disabled' });
  await page.locator('.lobby-gallery').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('img').first()).toHaveAttribute('src', poster(info.project.name === 'mobile' ? id2 : id3));
  await page.getByRole('button', { name: 'Previous posters' }).click();
  await page.getByRole('button', { name: 'View poster for Laurie vs. Hans at Camp Happy Trails', exact: true }).click();
  const viewer = page.getByRole('dialog');
  await expect(viewer).toBeVisible();
  await expect(viewer.locator('.lobby-full-poster')).toHaveCSS('object-fit', 'contain');
  await page.screenshot({ path: info.outputPath('lobby-viewer.png'), animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await expect(page.getByRole('button', { name: 'View poster for Laurie vs. Hans at Camp Happy Trails', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Back to theater' }).click();
  await expect(page.locator('.theater-screen')).toBeVisible();
  expect(await page.locator('.theater-screen').boundingBox()).toEqual(before);
  await page.getByRole('navigation', { name: 'Theater navigation' }).getByRole('button', { name: 'Lobby', exact: true }).click();
  await page.getByRole('button', { name: 'View poster for Laurie vs. Hans at Camp Happy Trails', exact: true }).click();
  await viewer.getByRole('button', { name: 'Open case file' }).click();
  await expect(page.locator('.story-page-content').getByText(`Exact case ${gameId}.`)).toBeVisible();
  expect(archive.calls).toEqual([]);
});

test('single posters stay centered, preserve portrait artwork, and recover a failed download', async ({ page, archive }) => {
  archive.history = [rows[0]];
  let working = false;
  await archive.install(page);
  await page.route('**/lobby-poster-*.png', route => working ? route.fulfill({ contentType: 'image/png', path: resolve('src/assets/scrapbooks/final-girl-cover.png') }) : route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Lobby', exact: true }).click();
  await expect(page.getByText('Poster unavailable', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous posters' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next posters' })).toBeDisabled();
  working = true;
  await page.getByRole('button', { name: 'Retry poster', exact: true }).click();
  await expect(page.locator('.lobby-artwork img')).toBeVisible();
  await expect(page.locator('.lobby-artwork img')).toHaveCSS('object-fit', 'contain');
  const exhibit = (await page.locator('.lobby-exhibit').boundingBox())!, gallery = (await page.locator('.lobby-gallery').boundingBox())!;
  expect(Math.abs(exhibit.x + exhibit.width / 2 - gallery.x - gallery.width / 2)).toBeLessThan(2);
  expect(archive.calls).toEqual([]);
});

test('portrait artwork in the scene field never reaches the projection, even for an active game', async ({ page, archive }) => {
  archive.history = [rows[0], { ...rows[1], scene_image_url: poster(id2) }];
  await archive.install(page, { draft: { ...activeGame, sceneImageUrl: poster(gameId), posterImageUrl: poster(id3) } });
  await page.route('**/lobby-poster-*.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/scrapbooks/final-girl-cover.png') }));
  await page.goto('/');
  await expect(page.getByText('Artwork unavailable.', { exact: false })).toBeVisible();
  await expect(page.locator('.theater-projection')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'RESUME GAME', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Past screenings' }).click();
  await expect(page.getByText('Stills unavailable. Your case files are safe.')).toBeVisible();
  await expect(page.locator('.theater-projection')).toHaveCount(0);
  expect(archive.calls).toEqual([]);
});

test('lobby links work from shared footers and returning keeps the active session intact', async ({ page, archive }) => {
  await archive.install(page, { draft: activeGame });
  await page.goto('/');
  await page.getByRole('button', { name: 'Lobby', exact: true }).click();
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  await page.getByRole('button', { name: 'LOBBY', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Starlight Lobby' })).toBeVisible();
  await page.getByRole('button', { name: 'Rules', exact: true }).click();
  await page.getByRole('button', { name: 'LOBBY', exact: true }).click();
  await page.getByRole('button', { name: 'Scrapbooks', exact: true }).click();
  await page.getByRole('button', { name: 'LOBBY', exact: true }).click();
  await page.getByRole('button', { name: 'Back to theater' }).click();
  await expect(page.getByRole('button', { name: 'RESUME GAME', exact: true })).toBeVisible();
  expect(archive.sessions.every(session => session.id === gameId)).toBe(true);
  expect(archive.calls).toEqual([]);
});

for (const signedIn of [true, false]) test(`empty lobby is honest and private (${signedIn ? 'signed in' : 'guest'})`, async ({ page, archive }) => {
  await archive.install(page, { signedIn });
  await page.goto('/');
  await page.getByRole('button', { name: 'Lobby', exact: true }).click();
  await expect(page.getByRole('heading', { name: signedIn ? 'The lobby is waiting.' : 'Your films belong here.' })).toBeVisible();
  await expect(page.locator('.lobby-cabinet')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Back to theater' })).toBeVisible();
  if (!signedIn) {
    await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
    await expect(page).toHaveURL(/\/auth$/);
  }
  expect(archive.calls).toEqual([]);
});

test('the narrow lobby supports swiping, keyboard dismissal, and resizing without overflow', async ({ page, archive }) => {
  archive.history = rows;
  await archive.install(page);
  await page.route('**/lobby-poster-*.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/scrapbooks/final-girl-cover.png') }));
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Lobby', exact: true }).click();
  await expect(page.locator('.lobby-artwork img')).toHaveCount(1);
  await page.locator('.lobby-gallery').evaluate(el => {
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [new Touch({ identifier: 1, target: el, clientX: 270, clientY: 220 })] }));
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [new Touch({ identifier: 1, target: el, clientX: 100, clientY: 220 })] }));
  });
  await expect(page.locator('.lobby-artwork img')).toHaveAttribute('src', poster(id2));
  await page.locator('.lobby-gallery').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.lobby-artwork img')).toHaveAttribute('src', poster(gameId));
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.lobby-artwork img')).toHaveCount(2);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole('button', { name: 'View poster for Laurie vs. Hans at Camp Happy Trails', exact: true }).focus();
  await page.keyboard.press('Enter');
  const viewer = page.getByRole('dialog');
  await expect(viewer).toBeVisible();
  expect(await viewer.evaluate(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight; })).toBe(true);
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('legacy inline posters are read only as they enter the gallery', async ({ page, archive }, info) => {
  archive.history = rows.map(row => ({ ...row, poster_image_url: undefined, has_legacy_poster: true }));
  await archive.install(page);
  const reads: string[] = [];
  await page.route('**/rest/v1/game_history?*', route => {
    const id = new URL(route.request().url()).searchParams.get('id')?.slice(3);
    if (id) reads.push(id);
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...rows.find(row => row.id === id), poster_image_url: poster(id!) }) });
  });
  await page.route('**/lobby-poster-*.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/scrapbooks/final-girl-cover.png') }));
  await page.goto('/');
  expect(reads).toEqual([]);
  await page.getByRole('button', { name: 'Lobby', exact: true }).click();
  const count = info.project.name === 'mobile' ? 1 : 2;
  await expect(page.locator('.lobby-artwork img')).toHaveCount(count);
  expect(reads).toHaveLength(count);
  expect(reads).not.toContain(id3);
  await page.getByRole('button', { name: 'Next posters' }).click();
  await expect(page.locator('.lobby-artwork img')).toHaveCount(1);
  expect(archive.calls).toEqual([]);
});
