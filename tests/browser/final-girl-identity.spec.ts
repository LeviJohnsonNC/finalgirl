import { resolve } from 'node:path';
import { test, expect, activeGame } from './fixtures';

const identities = [
  { name: 'Cassie', anchor: 'purple hoodie', filmId: 's3-marrek-murders' },
  { name: 'Mandy', anchor: 'black athletic hand wraps', filmId: 's3-marrek-murders' },
  { name: 'Alice', anchor: 'wavy copper-red hair', filmId: 's1-creech-manor' },
  { name: 'Selena', anchor: 'high round bun', filmId: 's1-creech-manor' },
];

for (const girl of identities) for (const legacy of [false, true]) test(`${girl.name} sends her reviewed identity on ${legacy ? 'legacy Reshoot' : 'fresh generation'}`, async ({ page, archive }, info) => {
  archive.autoImages = true;
  const url = `http://127.0.0.1:4173/identity-${girl.name.toLowerCase()}.png`;
  const bible = JSON.stringify({ finalGirl: 'A generic pale fighter in a mesh shirt.', killer: 'A masked figure in heavy work clothes.', location: 'A camp of old timber cabins.', palette: 'Cold moonlight across brown timber.' });
  await archive.install(page, { draft: {
    ...activeGame,
    selection: { ...activeGame.selection, finalGirl: girl.name, filmId: girl.filmId },
    introStory: `${girl.name} stopped at the locked door. Somewhere beyond it a floorboard creaked.`,
    ...(legacy ? { sceneImageUrl: url, visualBible: bible } : {}),
  } });
  await page.route('**/identity-*.png', route => route.fulfill({ path: resolve(`src/assets/characters/ai/${girl.name.toLowerCase()}.png`), contentType: 'image/png' }));
  // Use reviewed portrait pixels only as a mock response; this does not test provider likeness.
  await page.route('**/functions/v1/generate-scene-image', route => {
    archive.generationRequests.push({ name: 'generate-scene-image', body: route.request().postDataJSON() });
    return route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ imageUrl: url }) });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  const photo = page.getByRole('img', { name: 'Scene still', exact: true });
  if (legacy) {
    await expect(photo).toHaveAttribute('src', url);
    await page.getByRole('button', { name: 'Reshoot', exact: true }).click();
  }
  await expect(photo).toHaveAttribute('src', url);
  await expect.poll(() => archive.generationRequests.some(r => r.name === 'generate-scene-image')).toBe(true);
  for (const functionName of legacy ? ['generate-scene-image'] : ['generate-visual-bible', 'generate-scene-image']) {
    const request = archive.generationRequests.find(r => r.name === functionName)!;
    expect(request.body.finalGirl).toBe(girl.name);
    expect(request.body.finalGirlDescription).toContain(girl.anchor);
  }
  if (legacy) expect(archive.generationRequests.find(r => r.name === 'generate-scene-image')!.body.visualBible).toBe(bible);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath(`identity-${girl.name.toLowerCase()}-${legacy ? 'legacy' : 'fresh'}.png`), fullPage: true });
});
