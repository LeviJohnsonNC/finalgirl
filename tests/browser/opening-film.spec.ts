import type { Page } from '@playwright/test';
import { activeGame, expect, selection, test } from './fixtures';

const mall = { ...selection, killer: 'Hans', location: 'Sunnydaze Mall', filmId: 's3-killer-from-tomorrow' };
const story = 'The last escalator stopped. Across the atrium, one shop light kept burning.';
const stream = `data: ${JSON.stringify({ choices: [{ delta: { content: story }, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`;

async function holdStory(page: Page) {
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/functions/v1/generate-story', async route => {
    await hold;
    await route.fulfill({ contentType: 'text/event-stream', headers: { 'Access-Control-Allow-Origin': '*' }, body: stream });
  });
  return release;
}

async function resume(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  return page.locator('.opening-film-loader');
}

test('the selected location shows a readable strip on short laptops and narrow phones', async ({ page, archive }, info) => {
  await page.setViewportSize(info.project.name === 'mobile' ? { width: 320, height: 640 } : { width: 1024, height: 530 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const assets: string[] = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (/\/(sunnydaze-mall|camp-happy-trails)-(01|02|03)-/.test(url.pathname)) assets.push(url.pathname);
  });
  await archive.install(page, { draft: { ...activeGame, selection: mall, introStory: undefined } });
  const release = await holdStory(page);
  const loader = await resume(page);
  await expect(loader.getByText('Writing your opening scene')).toBeInViewport();
  await expect(loader.locator('canvas')).toHaveAttribute('data-renderer', 'webgl');
  const stills = loader.locator('.opening-film-still');
  await expect(stills).toHaveCount(3);
  await expect(stills.nth(1)).toHaveAttribute('href', /sunnydaze-mall-02-/);
  await expect.poll(() => new Set(assets.filter(url => url.includes('sunnydaze-mall'))).size).toBe(3);
  expect(assets.some(url => url.includes('camp-happy-trails'))).toBe(false);
  const gate = loader.locator('.opening-film-window');
  const bounds = await gate.boundingBox();
  expect(bounds?.width).toBeGreaterThan(info.project.name === 'mobile' ? 200 : 290);
  if (info.project.name === 'desktop') {
    await expect(page.getByRole('button', { name: 'WON', exact: true })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'LOST', exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('opening-film.png') });
  release();
  await expect(page.locator('.narration-prose')).toContainText(story);
  await expect(loader).toHaveCount(0);
});

test('graphics failure and a missing frame still allow the story to finish', async ({ page, archive }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, options?: unknown) {
      return type === 'webgl' ? null : get.call(this, type, options);
    } as typeof get;
  });
  await archive.install(page, { draft: { ...activeGame, selection: mall, introStory: undefined } });
  let missingFrame = false;
  await page.route('**/assets/sunnydaze-mall-02-*.webp', route => {
    missingFrame = true;
    return route.abort();
  });
  const release = await holdStory(page);
  const loader = await resume(page);
  await expect(loader.locator('canvas')).toHaveAttribute('data-renderer', 'fallback');
  await expect.poll(() => missingFrame).toBe(true);
  await expect(loader.locator('.opening-film-plate')).toBeVisible();
  await expect(loader.locator('.opening-film-still-blood')).toBeVisible();
  await expect(loader.getByText('Writing your opening scene')).toBeVisible();
  release();
  await expect(page.locator('.narration-prose')).toContainText(story);
  await expect(loader).toHaveCount(0);
});

test('a fast opening hands off while its reel artwork is still loading', async ({ page, archive }) => {
  await archive.install(page, { draft: { ...activeGame, selection: mall, introStory: undefined } });
  let releaseImages!: () => void;
  const holdImages = new Promise<void>(resolve => { releaseImages = resolve; });
  let pendingFrames = 0;
  await page.route('**/assets/sunnydaze-mall-0*-*.webp', async route => {
    pendingFrames++;
    await holdImages;
    await route.abort();
  });
  const release = await holdStory(page);
  const loader = await resume(page);
  await expect(loader.getByText('Writing your opening scene')).toBeVisible();
  await expect.poll(() => pendingFrames).toBe(3);
  release();
  await expect(page.locator('.narration-prose')).toContainText(story);
  await expect(loader).toHaveCount(0);
  releaseImages();
});

test('the reel travels one pitch while the settled artwork retains its position on resize', async ({ page, archive }, info) => {
  await page.addInitScript(() => {
    const track = { offsets: [] as number[] };
    Object.assign(window, { openingFilmTrack: track });
    const set = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(name, value, priority) {
      if (name === '--film-offset' && value) track.offsets.push(parseFloat(value));
      set.call(this, name, value, priority);
    };
  });
  await archive.install(page, { draft: { ...activeGame, selection: mall, introStory: undefined } });
  const release = await holdStory(page);
  const loader = await resume(page);
  await expect(loader.locator('canvas')).toHaveAttribute('data-renderer', 'webgl');
  const track = () => page.evaluate(() => (window as Window & { openingFilmTrack?: { offsets: number[] } }).openingFilmTrack?.offsets ?? []);
  await expect.poll(async () => (await track()).at(-1)).toBe(0);
  const positions = await track();
  expect(positions[0]).toBe(-240);
  expect(positions.some(x => x > -238 && x < -2)).toBe(true);
  expect(positions.every((x, i) => i === 0 || x >= positions[i - 1])).toBe(true);
  await page.setViewportSize(info.project.name === 'mobile' ? { width: 320, height: 680 } : { width: 1024, height: 530 });
  await expect.poll(async () => (await track()).at(-1)).toBe(0);
  await expect(loader.locator('.opening-film-still').nth(1)).toBeInViewport();
  release();
  await expect(loader).toHaveCount(0);
});

test('a locationless opening can retry with a neutral film leader', async ({ page, archive }) => {
  archive.failStory = true;
  await archive.install(page, { draft: { ...activeGame, selection: { ...selection, location: '' }, introStory: undefined } });
  const loader = await resume(page);
  const retry = page.getByRole('button', { name: 'Try Again', exact: true });
  await expect(retry).toBeVisible();
  archive.failStory = false;
  const release = await holdStory(page);
  await retry.click();
  await expect(loader.getByText('Writing your opening scene')).toBeVisible();
  await expect(loader.locator('.opening-film-still')).toHaveCount(0);
  release();
  await expect(page.locator('.narration-prose')).toContainText(story);
});
