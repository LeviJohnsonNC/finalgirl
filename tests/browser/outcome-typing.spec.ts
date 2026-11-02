import { test, expect, activeGame, userId } from './fixtures';
import { newPlayEvent } from '../../src/lib/play/events';

test('long-session review typing batches saves and preserves the final keystroke on reload', async ({ page, archive }, info) => {
  const playEvents = [newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 }),
    ...Array.from({ length: 600 }, (_, i) => newPlayEvent({ kind: 'state', field: 'finalHorrorLevel', value: i % 7 }))];
  const result = { id: activeGame.id, timestamp: 1, outcome: 'lost' as const,
    ...activeGame.selection, playEvents };
  await archive.install(page, { draft: { ...activeGame, phase: 'outcome', result, playEvents } });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  const highlights = page.getByLabel('Game Highlights', { exact: true });
  await highlights.focus();
  await page.evaluate(() => {
    const measurements = { writes: 0, inputMs: [] as number[] };
    Object.assign(window, { typingMeasurements: measurements });
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('final-girl-active-game-v1:')) measurements.writes++;
      return setItem.call(this, key, value);
    };
    let inputStart = 0;
    document.addEventListener('input', () => { inputStart = performance.now(); }, true);
    document.addEventListener('input', () => { measurements.inputMs.push(performance.now() - inputStart); });
  });
  const text = 'The blade dropped as the lights failed.';
  await highlights.pressSequentially(text);
  await expect(highlights).toHaveValue(text);
  const metrics = await page.evaluate(() => (window as unknown as { typingMeasurements: { writes: number; inputMs: number[] } }).typingMeasurements);
  const sorted = metrics.inputMs.slice().sort((a, b) => a - b);
  const report = { writes: metrics.writes, characters: text.length,
    medianInputMs: sorted[Math.floor(sorted.length / 2)], p95InputMs: sorted[Math.floor(sorted.length * .95)] };
  console.log(info.project.name, JSON.stringify(report));
  await info.attach('typing-measurements', { body: JSON.stringify(report), contentType: 'application/json' });
  expect(metrics.writes).toBeLessThan(5);
  // Reload without blurring or waiting for autosave: lifecycle flush owns this boundary.
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(highlights).toHaveValue(text);
  const saved = await page.evaluate(owner => JSON.parse(localStorage.getItem('final-girl-active-game-v1:' + owner)!), userId);
  expect(saved.playEvents).toEqual(playEvents);
});
