import { resolve } from 'node:path';
import { test, expect, gameId, selection } from './fixtures';

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
