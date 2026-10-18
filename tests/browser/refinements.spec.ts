import { test, expect } from './fixtures';

test('desktop setup fits without scrolling and keeps its faceplate clear of navigation', async ({ page, archive }, info) => {
  if (info.project.name !== 'desktop') return;
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  await expect(page.locator('.casting-console')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  for (const size of [{ width: 1672, height: 941 }, { width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(size);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const bounds = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, viewport: innerHeight,
      panel: document.querySelector('.casting-console')!.getBoundingClientRect().bottom,
      footer: document.querySelector('footer')!.getBoundingClientRect().top }));
    expect(bounds.height, JSON.stringify({ size, bounds })).toBeLessThanOrEqual(size.height + 1);
    expect(bounds.panel).toBeLessThan(bounds.footer);
  }
  await page.screenshot({ path: info.outputPath('setup-fit.png') });
});

test('scrapbook recovers missing and broken photographs, saves them, and hides recovery controls', async ({ page, archive }, info) => {
  const row = { id: '11111111-1111-4111-8111-111111111111', timestamp: Date.now(), outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', final_girl: 'Laurie', intro_story: 'The camp gate was open. Laurie heard Hans outside.', ending_narration: 'Laurie made it back to the road.', scene_image_url: 'https://example.test/broken.png' };
  archive.history.push(row);
  await archive.install(page);
  await page.route('https://example.test/poster.png', route => route.fulfill({ path: 'src/assets/locations/ai/buddyland.png', contentType: 'image/png' }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Scrapbooks', exact: true }).click();
  await page.locator('.scrapbook-cover-button').first().click();
  const missingPoster = page.getByRole('button', { name: 'Generate poster picture' });
  await missingPoster.click();
  await expect.poll(() => archive.generationRequests.length).toBe(1);
  expect(archive.generationRequests[0].body.story).toBe(row.ending_narration);
  archive.releaseImage?.();
  await expect(missingPoster).toHaveCount(0);
  await page.getByRole('button', { name: 'Open Laurie story', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Generate scene picture' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate poster picture' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Generate scene picture' }).click();
  await expect.poll(() => archive.generationRequests.length).toBe(2);
  expect(archive.generationRequests[1].body.story).toBe(row.intro_story);
  archive.releaseImage?.();
  await expect(page.getByRole('button', { name: 'Generate scene picture' })).toHaveCount(0);
  await expect.poll(() => row.scene_image_url).toBe('https://example.test/poster.png');
  await expect.poll(() => page.getByRole('img', { name: 'Scene evidence', exact: true }).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: info.outputPath('scrapbook-recovered.png') });
});

test('stats stops at its content edge and uses contained list scrolling', async ({ page, archive }) => {
  archive.history.push({ id: '11111111-1111-4111-8111-111111111111', timestamp: Date.now(), outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', final_girl: 'Laurie' });
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  await expect(page.locator('.stats-legal')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const metrics = await page.evaluate(() => ({
    bottom: document.querySelector('.stats-legal')!.getBoundingClientRect().bottom + scrollY,
    total: document.documentElement.scrollHeight,
    overscroll: getComputedStyle(document.documentElement).overscrollBehaviorY,
    chartNote: getComputedStyle(document.querySelector('.trends-chart')!, '::after').content,
  }));
  expect(metrics.total - metrics.bottom).toBeLessThanOrEqual(30);
  expect(metrics.overscroll).toBe('none');
  expect(metrics.chartNote).not.toContain('Same lake');
});
