import { test, expect } from './fixtures';
import type { Locator, Page } from '@playwright/test';

const films = [
  's1-camp-happy-trails', 's1-maple-lane', 's1-carnival-of-blood', 's1-creech-manor', 's1-sacred-groves', 's1-terror-from-above',
  's2-once-upon-full-moon', 's2-into-the-void', 's2-panic-station-2891', 's2-madness-in-dark', 's2-knock-at-door', 's2-terror-from-grave',
  's3-killer-from-tomorrow', 's3-falconwood-files', 's3-hell-to-pay', 's3-dont-make-sound', 's3-marrek-murders', 's3-terror-from-destiny',
  's4-shriek', 's4-buddyland', 's4-rotten-harvest',
];

const portraits = [
  'Big Bad Wolf', 'Billy the Bear', 'Birds', 'Destiny', 'Dr. Fright', 'Evomorph',
  'Geppetto', 'Grimlash', 'Hans', 'Inkanyamba', 'Mort the Teenage Dirtbag', 'Poltergeist',
  'Ratchet Lady', 'Razorface', 'Slayer', 'The Eyeless', 'The Hunter', 'The Intruders', 'The Organism',
  'The Tormentor', 'Zombies',
];

const revised = new Set([
  'Birds', 'Geppetto', 'Grimlash', 'Mort the Teenage Dirtbag', 'Poltergeist', 'Razorface',
  'Slayer', 'The Eyeless', 'The Intruders', 'The Organism', 'Zombies',
]);

const crop = new Map([
  ['Destiny', '77% 50%'],
  ['Dr. Fright', '50% 35%'],
  ['Evomorph', '16% 50%'],
  ['The Hunter', '83% 50%'],
]);

async function openPicker(page: Page) {
  await page.locator('.casting-slot--killer').getByRole('button', { name: 'Choose', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'SELECT KILLER FILE' })).toBeVisible();
  return dialog;
}

async function inspect(image: Locator) {
  await image.scrollIntoViewIfNeeded();
  return image.evaluate(async element => {
    const img = element as HTMLImageElement;
    await img.decode();
    return {
      src: img.getAttribute('src'),
      position: getComputedStyle(img).objectPosition,
      ratio: img.naturalWidth / img.naturalHeight,
    };
  });
}

test('killer portraits keep the approved art, load each refresh, and agree with the selected slot', async ({ page, archive }, info) => {
  test.setTimeout(120_000);
  archive.films = films;
  archive.aiCastingArt = true;
  await archive.install(page);
  const mobile = info.project.name === 'mobile';
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1366, height: 768 });
  await page.goto('/');
  await page.getByRole('button', { name: 'START THE TAPE', exact: true }).click();
  const picker = await openPicker(page);
  await expect(picker.locator('.evidence-card img')).toHaveCount(portraits.length);
  const expected = new Map<string, string>();
  const capture = async (element: Locator, path: string) => element.screenshot({
    path: info.outputPath(path), type: 'jpeg', quality: 84, scale: 'css', animations: 'disabled',
    style: '.app-footer{visibility:hidden}',
  });
  for (const [index, name] of portraits.entries()) {
    const image = picker.getByRole('img', { name, exact: true });
    const asset = await inspect(image);
    expect(asset.src).toMatch(revised.has(name) ? /\.webp$/ : /\.png$/);
    if (revised.has(name)) expect(asset.ratio).toBeCloseTo(2 / 3, 3);
    if (crop.has(name)) expect(asset.position).toBe(crop.get(name));
    expected.set(name, asset.src!);
    await capture(image.locator('..'), `picker-${index}.jpg`);
    if (!mobile && (revised.has(name) || crop.has(name))) {
      await image.hover();
      await capture(image.locator('..'), `hover-${index}.jpg`);
      await picker.getByRole('heading').hover();
    }
  }
  await picker.getByRole('button', { name: 'Close', exact: true }).click();
  for (const [index, name] of portraits.entries()) {
    const dialog = await openPicker(page);
    await dialog.getByRole('img', { name, exact: true }).click();
    const selected = page.locator('.casting-slot--killer .casting-photo-image');
    const asset = await inspect(selected);
    expect(asset.src).toBe(expected.get(name));
    if (crop.has(name)) expect(asset.position).toBe(crop.get(name));
    await capture(page.locator('.casting-slot--killer .casting-photo-window'), `slot-${index}.jpg`);
  }
  if (mobile) await page.setViewportSize({ width: 320, height: 568 });
  for (const name of ['The Intruders', 'The Organism', 'Poltergeist', 'Evomorph']) {
    const dialog = await openPicker(page);
    await dialog.getByRole('img', { name, exact: true }).click();
    await page.locator('.casting-slot--killer .casting-heading-info button').click();
    const dossier = page.getByRole('dialog').getByRole('img', { name, exact: true });
    expect((await inspect(dossier)).src).toBe(expected.get(name));
    await capture(dossier, `dossier-${name}.jpg`);
    await page.keyboard.press('Escape');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
