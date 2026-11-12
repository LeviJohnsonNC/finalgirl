import { readFileSync } from 'node:fs';
import { test, expect, activeGame } from './fixtures';

const photo = new URL('../../src/assets/play/photos/organism/red-exposed.webp', import.meta.url);

test('Play header keeps headroom in a shallow crop and reframes on resize', async ({ page, archive }, info) => {
  const sceneImageUrl = 'https://example.test/play-header-test.webp';
  await archive.install(page, { draft: { ...activeGame, playMode: true, sceneImageUrl } });
  await page.route(sceneImageUrl, route => route.fulfill({
    body: readFileSync(photo),
    contentType: 'image/webp',
    headers: { 'access-control-allow-origin': '*' },
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();

  const header = page.locator('.play-heading');
  const image = header.getByRole('img', { name: "Laurie's night at Camp Happy Trails" });
  await expect(image).toHaveAttribute('style', /object-position/);
  const frame = header.locator('.play-hero-frame');
  const sizes = info.project.name === 'mobile' ? [[390, 844], [320, 568]] : [[1280, 640], [1366, 768], [1440, 900]];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => image.evaluate(img => {
      const element = img as HTMLImageElement;
      const [x, y] = element.style.objectPosition.split(' ').map(parseFloat);
      return Number.isFinite(x) && Number.isFinite(y) && (innerWidth < 600 || y < 15);
    })).toBe(true);
    if (width > 1000) await expect(frame).toHaveClass(/play-hero-frame--inset/);
    else await expect(frame).not.toHaveClass(/play-hero-frame--inset/);
    await expect(header.getByRole('button', { name: 'Finish game', exact: true })).toBeVisible();
    await header.screenshot({ path: info.outputPath(`play-header-${width}.jpg`), type: 'jpeg', quality: 87 });
  }
});
