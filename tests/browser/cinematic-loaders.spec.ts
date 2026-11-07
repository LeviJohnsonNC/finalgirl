import { resolve } from 'node:path';
import { test, expect, gameId, selection, opening } from './fixtures';

const image = 'https://example.test/poster.png';
const photo = resolve('src/assets/locations/ai/sunnydaze-mall.png');
const draft = { version: 1, id: gameId, phase: 'nowPlaying', selection, introStory: opening };
async function resume(page: import('@playwright/test').Page) {
  await page.goto('/'); await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await page.locator('.narration-title').waitFor();
}

test('story blood and darkroom appear in the real generation flow and hand off cleanly', async ({ page, archive }, info) => {
  archive.autoImages = true; archive.aiCastingArt = true;
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1440, height: 900 });
  await archive.install(page, { draft: { ...draft, introStory: undefined } });
  let finishStory!: () => void;
  await page.route('**/functions/v1/generate-story', async route => {
    await new Promise<void>(r => { finishStory = r; });
    await route.fulfill({ contentType: 'text/event-stream', headers: { 'Access-Control-Allow-Origin': '*' }, body: `data: ${JSON.stringify({ choices: [{ delta: { content: opening } }] })}\n\ndata: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n` });
  });
  let finishDownload!: () => void;
  await page.route(image, async route => { await new Promise<void>(r => { finishDownload = r; }); await route.fulfill({ contentType: 'image/png', path: photo }); });
  await resume(page);
  await expect(page.getByText('Every story leaves a stain')).toBeVisible();
  await expect(page.locator('.blood-loader canvas')).toHaveAttribute('data-renderer', 'webgl');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: info.outputPath('story-loader.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'desktop') await expect(page.getByRole('button', { name: 'WON', exact: true })).toBeInViewport();
  finishStory();
  await expect(page.locator('.narration-prose')).toContainText('Laurie');
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true);
  await expect(page.getByText('Developing the nightmare')).toBeVisible();
  await page.locator('.darkroom-loader').scrollIntoViewIfNeeded();
  await expect(page.locator('.darkroom-loader canvas')).toHaveAttribute('data-renderer', 'webgl');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: info.outputPath('image-loader.png'), fullPage: true });
  archive.releaseImage!();
  await expect.poll(() => Boolean(finishDownload)).toBe(true);
  await expect(page.getByText('Bringing the photograph into focus')).toBeVisible();
  await expect(page.locator('.narration-photo-mount')).toHaveAttribute('aria-busy', 'true');
  finishDownload();
  await expect(page.locator('.darkroom-developed-print img')).toHaveAttribute('src', image);
  await expect(page.getByText('Your photograph is ready')).toBeVisible();
  await page.screenshot({ path: info.outputPath('actual-photograph-in-bath.png'), fullPage: true });
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toBeVisible();
  await expect(page.locator('.narration-photo-development')).toHaveCount(0);
  await expect(page.locator('.narration-photo-mount')).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Expand scene still' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('download failure retries the photograph without another generation', async ({ page, archive }) => {
  archive.autoImages = true;
  await archive.install(page, { draft });
  let broken = true;
  await page.route(image, route => broken ? route.fulfill({ status: 503 }) : route.fulfill({ contentType: 'image/png', path: photo }));
  await resume(page); await expect.poll(() => Boolean(archive.releaseImage)).toBe(true);
  archive.releaseImage!();
  await expect(page.getByRole('button', { name: 'Reload photograph' })).toBeVisible();
  const calls = archive.generationRequests.filter(r => r.name === 'generate-scene-image').length;
  broken = false; await page.getByRole('button', { name: 'Reload photograph' }).click();
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toBeVisible();
  expect(archive.generationRequests.filter(r => r.name === 'generate-scene-image')).toHaveLength(calls);
});

test('graphics failure retains photographic fallback and completion', async ({ page, archive }, info) => {
  await page.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, options?: unknown) { if (type === 'webgl') return null; return get.call(this, type, options); } as typeof get; });
  archive.autoImages = true;
  await archive.install(page, { draft });
  await page.route(image, route => route.fulfill({ contentType: 'image/png', path: photo }));
  await resume(page); await expect(page.locator('.darkroom-loader canvas')).toHaveAttribute('data-renderer', 'fallback');
  await expect(page.locator('.darkroom-fallback')).toBeVisible();
  await page.screenshot({ path: info.outputPath('fallback.png'), fullPage: true });
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true); archive.releaseImage!();
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toBeVisible();
});

test('reduced motion shows a still and skips the completion animation', async ({ page, archive }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); archive.autoImages = true;
  await archive.install(page, { draft });
  await page.route(image, route => route.fulfill({ contentType: 'image/png', path: photo }));
  await resume(page); await expect(page.getByText('Developing the nightmare')).toBeVisible();
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true); archive.releaseImage!();
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toBeVisible();
  await expect(page.locator('.narration-photo-development')).toHaveCount(0);
});

test('reshoot failure keeps the previous picture and a later take waits for decoding', async ({ page, archive }) => {
  const old = 'https://example.test/previous.png';
  await archive.install(page, { draft: { ...draft, sceneImageUrl: old } });
  await page.route(old, route => route.fulfill({ contentType: 'image/png', path: photo }));
  let attempts = 0;
  await page.route('**/functions/v1/generate-scene-image', route => {
    attempts++;
    return route.fulfill({ status: attempts === 1 ? 503 : 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(attempts === 1 ? { error: 'The picture service could not finish.' } : { imageUrl: image }) });
  });
  let finish!: () => void;
  await page.route(image, async route => { await new Promise<void>(r => { finish = r; }); await route.fulfill({ contentType: 'image/png', path: photo }); });
  await resume(page);
  await page.getByRole('button', { name: 'Reshoot', exact: true }).click();
  await expect(page.getByText('The picture service could not finish.')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toHaveAttribute('src', old);
  await page.getByRole('button', { name: 'Reshoot', exact: true }).click();
  await expect.poll(() => Boolean(finish)).toBe(true);
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toHaveAttribute('src', old);
  await expect(page.getByText('Bringing the photograph into focus')).toBeVisible();
  finish();
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toHaveAttribute('src', image);
  await expect(page.locator('.narration-photo-development')).toHaveCount(0);
  expect(attempts).toBe(2);
});

test('losing a graphics context switches to the still without trapping generation', async ({ page, archive }) => {
  archive.autoImages = true;
  await archive.install(page, { draft });
  await page.route(image, route => route.fulfill({ contentType: 'image/png', path: photo }));
  await resume(page);
  const canvas = page.locator('.darkroom-loader canvas');
  await expect(canvas).toHaveAttribute('data-renderer', 'webgl');
  await canvas.evaluate((element: HTMLCanvasElement) => element.getContext('webgl')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(canvas).toHaveAttribute('data-renderer', 'fallback');
  await expect(page.locator('.darkroom-fallback')).toBeVisible();
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true); archive.releaseImage!();
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toBeVisible();
});

test('a permanently missing saved photograph can be explicitly reshot', async ({ page, archive }) => {
  const missing = 'https://example.test/missing.png';
  await archive.install(page, { draft: { ...draft, sceneImageUrl: missing } });
  await page.route(missing, route => route.fulfill({ status: 404 }));
  await page.route(image, route => route.fulfill({ contentType: 'image/png', path: photo }));
  await resume(page);
  await expect(page.getByRole('button', { name: 'Reload photograph' })).toBeVisible();
  expect(archive.generationRequests.some(r => r.name === 'generate-scene-image')).toBe(false);
  await page.getByRole('button', { name: 'Reshoot', exact: true }).click();
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true); archive.releaseImage!();
  await expect(page.getByRole('img', { name: 'Scene still', exact: true })).toHaveAttribute('src', image);
  await expect(page.getByRole('region', { name: 'Opening narration' })).toContainText(opening);
});

for (const viewport of [{ width: 1024, height: 530 }, { width: 1024, height: 600 }, { width: 1280, height: 640 }, { width: 1440, height: 800 }]) {
  test(`loading fits a ${viewport.width}x${viewport.height} laptop including the subtitle and result controls`, async ({ page, archive }, info) => {
    await page.setViewportSize(viewport);
    archive.autoImages = true; archive.aiCastingArt = true;
    const hunter = { ...selection, killer: 'The Hunter', location: 'Sunnydaze Mall', filmId: 's3-killer-from-tomorrow' };
    await archive.install(page, { draft: { ...draft, selection: hunter, introStory: undefined } });
    let finishStory!: () => void;
    await page.route('**/functions/v1/generate-story', async route => {
      await new Promise<void>(r => { finishStory = r; });
      await route.fulfill({ contentType: 'text/event-stream', headers: { 'Access-Control-Allow-Origin': '*' }, body: `data: ${JSON.stringify({ choices: [{ delta: { content: opening } }] })}\n\ndata: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n` });
    });
    await resume(page); await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.blood-loader canvas')).toHaveAttribute('data-renderer', 'webgl');
    const fits = () => page.evaluate(() => {
      const reader = document.querySelector('.narration-reader-scroll')!;
      return document.documentElement.scrollHeight <= innerHeight + 1 && reader.scrollHeight <= reader.clientHeight + 1;
    });
    await expect.poll(fits).toBe(true);
    await expect(page.getByText('Writing your opening scene')).toBeInViewport();
    await expect(page.getByRole('button', { name: 'WON', exact: true })).toBeInViewport();
    await page.screenshot({ path: info.outputPath('laptop-blood.png') });
    finishStory();
    await expect(page.locator('.darkroom-loader canvas')).toHaveAttribute('data-renderer', 'webgl');
    await expect(page.getByText('Your scene is coming into focus')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath('laptop-darkroom.png') });
  });
}

test('blood still grows and receives visible droplets after a three-minute wait', async ({ page, archive }, info) => {
  await page.addInitScript(() => {
    const state = window as Window & { bloodTime?: number; bloodPixels?: { ink: number; hash: number } };
    state.bloodTime = 2;
    const times = new WeakSet<WebGLUniformLocation>();
    const proto = WebGLRenderingContext.prototype;
    const location = proto.getUniformLocation, uniform = proto.uniform1f, draw = proto.drawArrays;
    proto.getUniformLocation = function(program, name) {
      const result = location.call(this, program, name);
      if (name === 'time' && result) times.add(result);
      return result;
    };
    const isBlood = (gl: WebGLRenderingContext) => (gl.canvas as HTMLCanvasElement).closest('.blood-loader');
    proto.uniform1f = function(location, value) {
      uniform.call(this, location, location && times.has(location) && isBlood(this) ? state.bloodTime ?? value : value);
    };
    proto.drawArrays = function(mode, first, count) {
      draw.call(this, mode, first, count);
      if (!isBlood(this)) return;
      const pixels = new Uint8Array(this.drawingBufferWidth * this.drawingBufferHeight * 4);
      this.readPixels(0, 0, this.drawingBufferWidth, this.drawingBufferHeight, this.RGBA, this.UNSIGNED_BYTE, pixels);
      let ink = 0, hash = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] > 128) ink++;
        hash = (Math.imul(hash, 31) + pixels[i] + pixels[i + 3]) | 0;
      }
      state.bloodPixels = { ink, hash };
    };
  });
  await archive.install(page, { draft: { ...draft, introStory: undefined } });
  await page.route('**/functions/v1/generate-story', () => new Promise(() => {}));
  await resume(page);
  await expect(page.locator('.blood-loader canvas')).toHaveAttribute('data-renderer', 'webgl');
  const pixels = () => page.evaluate(() => (window as Window & { bloodPixels?: { ink: number; hash: number } }).bloodPixels!);
  const at = async (time: number) => {
    const previous = (await pixels()).hash;
    await page.evaluate(t => { (window as Window & { bloodTime?: number }).bloodTime = t; }, time);
    await expect.poll(async () => (await pixels()).hash).not.toBe(previous);
    return pixels();
  };
  const early = await pixels();
  const mid = await at(20);
  const late = await at(180);
  expect(mid.ink).toBeGreaterThan(early.ink * 1.2);
  expect(late.ink).toBeGreaterThan(mid.ink * 1.1);
  await page.screenshot({ path: info.outputPath('blood-three-minutes.png'), fullPage: true });
  await at(181.1); // Different late frame: arrivals continue after the stain expands.
  const extended = await at(300);
  expect(extended.ink).toBeGreaterThan(late.ink);
});


test('portrait remains animated after artwork preferences settle and reveals the real poster', async ({ page, archive }, info) => {
  archive.autoImages = true; archive.aiCastingArt = false;
  const formData = { finalHorrorLevel: 4, finalGirlHealth: 2, killerHealth: 0, weaponUsed: 'Flashlight', victimsSaved: 3, victimsKilled: 6, endingSubLocation: 'Camp', gameHighlights: '' };
  await archive.install(page, { draft: { ...draft, phase: 'ending', endingStory: opening, result: { ...selection, id: gameId, timestamp: 1, outcome: 'won' }, formData } });
  await page.route(image, route => route.fulfill({ contentType: 'image/png', path: resolve('src/assets/scrapbooks/final-girl-cover.png') }));
  await resume(page);
  const canvas = page.locator('.darkroom-loader--portrait canvas');
  await expect(canvas).toHaveAttribute('data-renderer', 'webgl');
  await expect.poll(() => Boolean(archive.releaseImage)).toBe(true);
  // Keep the check after async settings and preview changes have settled.
  await page.waitForTimeout(500);
  await expect(canvas).toHaveAttribute('data-renderer', 'webgl');
  archive.releaseImage!();
  await expect(page.locator('.darkroom-developed-print img')).toHaveAttribute('src', image);
  await page.waitForTimeout(500);
  await page.screenshot({ path: info.outputPath('portrait-real-photo.png'), fullPage: true });
  await expect(page.locator('.narration-photo-development')).toHaveCount(0);
  await expect(page.getByRole('img', { name: 'Movie poster', exact: true })).toBeVisible();
});
