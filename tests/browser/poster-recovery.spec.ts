import { resolve } from 'node:path';
import { test, expect, activeGame, gameId, selection, opening } from './fixtures';

const ending = 'Laurie made it to the road. The camp fell silent behind her. She would never forget the last light in the cabin.';
const formData = { finalGirlHealth: 1, killerHealth: 0, weaponUsed: '', endingSubLocation: '', gameHighlights: '' };
const unavailable = 'The image service is temporarily unavailable. Your story and game result are safe. Try developing the picture again in a moment.';

for (const failure of ['provider outage', 'platform timeout', 'missing image'] as const) {
  test(`an ending poster ${failure} is visible, retryable and never loses the ending or result`, async ({ page, archive }) => {
    archive.autoImages = true;
    archive.history.push({ id: gameId, timestamp: 1, outcome: 'won', killer: selection.killer, location: selection.location, final_girl: selection.finalGirl, intro_story: opening });
    await archive.install(page, { draft: { ...activeGame, phase: 'ending', result: { ...selection, id: gameId, timestamp: 1, outcome: 'won' }, endingStory: ending, formData } });
    const requests: Array<Record<string, unknown>> = [];
    await page.route('**/functions/v1/generate-scene-image', route => {
      requests.push(route.request().postDataJSON());
      const headers = { 'access-control-allow-origin': '*' };
      if (requests.length === 1) {
        if (failure === 'provider outage') return route.fulfill({ status: 503, headers, json: { error: unavailable } });
        if (failure === 'platform timeout') return route.fulfill({ status: 504, headers, contentType: 'text/html', body: '<h1>Gateway Timeout</h1>' });
        return route.fulfill({ headers, json: {} });
      }
      return route.fulfill({ headers, json: { imageUrl: 'http://127.0.0.1:4173/recovered-poster.png' } });
    });
    await page.route('**/recovered-poster.png', route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/scrapbooks/final-girl-cover.png') }));
    await page.goto('/');
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    const photo = page.locator('.narration-photo--poster');
    await expect(photo.getByRole('button', { name: 'Try Again', exact: true })).toBeVisible();
    await expect(photo).toContainText(failure === 'provider outage' ? unavailable : failure === 'platform timeout' ? 'Your story and game result are safe' : 'returned no picture');
    await expect(page.getByRole('region', { name: 'Ending narration' })).toContainText(ending);
    await expect(page.getByRole('button', { name: 'SAVE', exact: true })).toBeEnabled();
    expect(requests).toHaveLength(1);
    await photo.getByRole('button', { name: 'Try Again', exact: true }).click();
    const poster = page.getByRole('img', { name: 'Movie poster', exact: true });
    await expect(poster).toBeVisible();
    await poster.evaluate((image: HTMLImageElement) => image.decode());
    expect(requests).toHaveLength(2);
    expect(requests[1]).toEqual(requests[0]);
    expect(requests[0]).toMatchObject({ gameId, sceneType: 'ending', story: ending, outcome: 'won' });
    await expect(photo.getByRole('button', { name: 'Try Again', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'SAVE', exact: true }).click();
    await expect.poll(() => archive.history[0].poster_image_url).toBe('http://127.0.0.1:4173/recovered-poster.png');
    expect(archive.history).toHaveLength(1);
    await expect.poll(() => archive.history[0].ending_narration).toBe(ending);
    expect(archive.calls).not.toContain('generate-ending');
  });
}
