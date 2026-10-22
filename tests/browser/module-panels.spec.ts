import { test, expect, activeGame, userId } from './fixtures';
import { openModule } from './play-helpers';

for (const [killer, location, expected] of [
  ['Billy the Bear', 'Buddyland', ['billy', 'buddyland']],
  ['Billy the Bear', 'Camp Happy Trails', ['billy', 'camp']],
  ['Hans', 'Buddyland', ['hans', 'buddyland']],
  ['Hans', 'Camp Happy Trails', ['hans', 'camp']],
] as const) {
  test(`independent illustrated panels: ${killer} at ${location}`, async ({ page, archive }, info) => {
    await archive.install(page, { draft: { ...activeGame, playMode: true, selection: { ...activeGame.selection, killer, location } } });
    await page.goto('/');
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    const panels = page.locator('.play-module-panel');
    await expect(panels).toHaveCount(2);
    expect(await panels.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-module')))).toEqual([...expected]);
    for (const panel of await panels.all()) await expect(panel).not.toHaveAttribute('open', '');
    const storageKey = `final-girl-active-game-v1:${userId}`;
    // Source initialization is the existing Billy setup, independent of panels.
    if (killer === 'Billy the Bear') await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).playEvents.some((e: {moduleData?:{changes:{powerSourcesReady?:boolean}}}) => e.moduleData?.changes.powerSourcesReady), storageKey)).toBe(true);
    const before = await page.evaluate(key => localStorage.getItem(key), storageKey);
    await openModule(page, expected[0]);
    await openModule(page, expected[1]);
    for (const panel of await panels.all()) await panel.locator(':scope > summary').click();
    expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(before);
    await panels.first().locator(':scope > summary').focus();
    await panels.first().locator(':scope > summary').press('Enter');
    await expect(panels.first()).toHaveAttribute('open', '');
    await page.reload();
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    await expect(panels.first()).toHaveAttribute('open', '');
    await expect(panels.last()).not.toHaveAttribute('open', '');
    await openModule(page, expected[1]);
    for (const width of info.project.name === 'mobile' ? [320, 390] : [1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    for (const [index, panel] of (await panels.all()).entries()) await panel.screenshot({ path: info.outputPath(`panel-${index}.png`), animations: 'disabled', style: '.app-footer { visibility: hidden }' });
    await page.screenshot({ path: info.outputPath('module-panels.png'), fullPage: true, animations: 'disabled' });
    expect(archive.calls).toEqual([]);
  });
}
