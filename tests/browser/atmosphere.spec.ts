import { test, expect } from './fixtures';
import { statsHistory } from './stats-data';

test('Stats has one outer scroll and hands wheel input back from compact lists', async ({ page, archive }) => {
  archive.history.push(...statsHistory());
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  const records = page.getByRole('region', { name: 'Scroll all records' });
  await expect(records).toBeVisible();
  await records.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => [document.body, document.querySelector('.app-shell')!, document.querySelector('main')!].map(el => getComputedStyle(el).overflowY))).toEqual(['visible', 'visible', 'visible']);
  await records.evaluate(el => { el.scrollTop = el.scrollHeight; });
  const box = (await records.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 450);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
  await records.scrollIntoViewIfNeeded();
  await records.evaluate(el => { el.scrollTop = 0; });
  const newBox = (await records.boundingBox())!;
  await page.mouse.move(newBox.x + newBox.width / 2, newBox.y + newBox.height / 2);
  const below = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -450);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(below - 100);
  expect(await page.evaluate(() => document.body.scrollTop)).toBe(0);
});

test('long weapon lists cannot create an empty tail below the Stats page', async ({ page, archive }, info) => {
  // The live archive has dozens of distinct weapon labels. Hidden absolute
  // labels in those off-screen rows used to escape the list and extend the page.
  archive.history = statsHistory().map((row, index) => ({ ...row, weapon_used: `Recovered weapon ${index + 1}` }));
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  const sizes = info.project.name === 'desktop'
    ? [{ width: 1382, height: 766 }, { width: 1024, height: 768 }, { width: 1920, height: 1080 }]
    : [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }];
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.evaluate(() => document.fonts.ready);
    const weapons = page.getByLabel('All recorded weapons', { exact: true });
    await expect(weapons.locator('.weapon-name')).toHaveCount(56);
    for (const listBottom of [false, true]) {
      await weapons.evaluate((el, bottom) => { el.scrollTop = bottom ? el.scrollHeight : 0; }, listBottom);
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      const metrics = await page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        contentEnd: document.querySelector('.stats-legal')!.getBoundingClientRect().bottom + scrollY,
        footer: document.querySelector('.app-footer')!.getBoundingClientRect().height,
        bodyScroll: document.body.scrollTop,
      }));
      expect(metrics.height - metrics.contentEnd - metrics.footer).toBeLessThanOrEqual(30);
      expect(metrics.bodyScroll).toBe(0);
    }
    await weapons.scrollIntoViewIfNeeded();
    await weapons.focus();
    await weapons.press('End');
    await expect.poll(() => weapons.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await expect(weapons.locator('.weapon-name').last()).toBeInViewport();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    if (size.width === 1382 || size.width === 390) await page.screenshot({ path: info.outputPath(`stats-bottom-${size.width}.png`), animations: 'disabled' });
  }
});

test('Rules broadcasts readable looping news with pause and reduced motion', async ({ page, archive }, info) => {
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Rules', exact: true }).click();
  const strip = page.getByRole('region', { name: 'Night Watch local bulletins' });
  await expect(strip).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.evaluate(() => {
    const strip = document.querySelector('.news-broadcast')!.getBoundingClientRect();
    const groups = Array.from(document.querySelectorAll('.news-ticker-group'));
    return { bottom: strip.bottom, footer: document.querySelector('.app-footer')!.getBoundingClientRect().top,
      widths: groups.map(el => el.getBoundingClientRect().width),
      content: groups.map(el => el.textContent),
      duration: parseFloat(getComputedStyle(document.querySelector('.news-ticker')!).animationDuration),
      overflow: document.documentElement.scrollWidth > innerWidth };
  });
  expect(Math.abs(metrics.bottom - metrics.footer)).toBeLessThanOrEqual(1);
  // Transformed ticker copies may differ by a fraction of a rendered pixel.
  expect(Math.abs(metrics.widths[0] - metrics.widths[1])).toBeLessThan(0.1);
  expect(metrics.content[0]).toBe(metrics.content[1]);
  expect(metrics.duration).toBeCloseTo(metrics.widths[0] / 48, 1);
  expect(metrics.overflow).toBe(false);
  await page.getByRole('button', { name: 'Pause news ticker' }).click();
  await expect(page.locator('.news-ticker')).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Resume news ticker' }).click();
  await expect(page.locator('.news-ticker')).toHaveCSS('animation-play-state', 'running');
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  expect(await page.locator('.rulebook-colophon').evaluate(el => el.getBoundingClientRect().bottom <= document.querySelector('.news-broadcast')!.getBoundingClientRect().top)).toBe(true);
  await page.screenshot({ path: info.outputPath('rules-broadcast.png') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.news-ticker')).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('button', { name: 'Pause news ticker' })).toBeHidden();
  const viewport = page.locator('.news-viewport');
  await viewport.evaluate(el => { el.scrollLeft = 200; });
  expect(await viewport.evaluate(el => el.scrollLeft)).toBe(200);
});

test('Scrapbooks sit on a quiet evidence desk with working covers', async ({ page, archive }, info) => {
  archive.history.push(...statsHistory().slice(0, 3));
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Scrapbooks', exact: true }).click();
  await expect(page.locator('.scrapbooks-backdrop')).toBeVisible();
  await expect(page.locator('.scrapbook-cover-button').first()).toBeEnabled();
  await expect(page.locator('.scrapbook-cover-button').last()).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator('.scrapbook-cover-button img').evaluateAll(images => images.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'desktop') {
    for (const cover of await page.locator('.scrapbook-cover-button').all()) {
      expect(await cover.evaluate(el => el.getBoundingClientRect().bottom + 12 < document.querySelector('.news-broadcast')!.getBoundingClientRect().top)).toBe(true);
    }
  }
  await page.screenshot({ path: info.outputPath('scrapbook-desk.png') });
  await page.locator('.scrapbook-cover-button').first().click();
  await expect(page.locator('.scrapbook-pages')).toHaveCSS('opacity', '1');
});
