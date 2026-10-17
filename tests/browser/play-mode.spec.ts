import { test, expect, activeGame } from './fixtures';

const tracked = {
  ...activeGame,
  playMode: true,
  playEvents: [
    {
      id: '22222222-2222-4222-8222-222222222222',
      at: 1,
      kind: 'start',
      saved: 0,
      killed: 0,
      round: 1,
    },
  ],
};
test('lightweight Play tracking survives reload, undo, bulk recording and quiet mode', async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: { ...activeGame.selection, location: 'Buddyland' },
    },
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await page
    .getByRole('button', { name: 'Enter Play mode', exact: true })
    .click();
  await page.getByRole('button', { name: 'Track this game' }).click();
  await page.getByRole('button', { name: 'Start from round 1' }).click();
  for (let i = 0; i < 5; i++)
    await page
      .getByRole('button', { name: 'Save one victim', exact: true })
      .click();
  await page
    .getByRole('button', { name: 'Record one victim killed', exact: true })
    .click();
  await page.getByRole('button', { name: 'Next round', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Next round', exact: true }),
  ).toContainText('2');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Next round', exact: true }),
  ).toContainText('1');
  await page.screenshot({
    path: info.outputPath('play-overview.png'),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Details & log' }).click();
  await page
    .getByLabel('Game moment')
    .fill('Barricaded the arcade with a broken cabinet.');
  await page.getByRole('button', { name: 'Add moment', exact: true }).click();
  await expect(
    page
      .getByRole('paragraph')
      .filter({ hasText: 'Barricaded the arcade with a broken cabinet.' }),
  ).toBeVisible();
  await page.getByLabel('Victim quantity').fill('3');
  await page.screenshot({
    path: info.outputPath('play-case-notes.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Save group', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Save one victim', exact: true }),
  ).toContainText('8');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Save one victim', exact: true }),
  ).toContainText('8');
  await page
    .getByRole('button', { name: 'Collapse tracking controls' })
    .click();
  await expect(
    page.getByRole('button', {
      name: 'Saved 8 · Killed 1 · Round 1',
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath('play-quiet.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Read story', exact: true }).click();
  await expect(
    page.getByText(archive.storyText, { exact: true }),
  ).toBeVisible();
  expect(archive.calls.filter((c) => c === 'generate-story')).toHaveLength(0);
  await expect
    .poll(() => archive.sessions[0]?.state.playEvents)
    .toHaveLength(11);
});

test('joining midgame preserves an unknown round and offline taps until retry', async ({
  page,
  archive,
}) => {
  archive.failWrites = true;
  await archive.install(page, { draft: { ...activeGame, playMode: true } });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await page.getByRole('button', { name: 'Track this game' }).click();
  await page.getByLabel('Starting Saved').fill('4');
  await page.getByLabel('Starting Killed').fill('2');
  await page.getByRole('button', { name: 'Use current totals' }).click();
  await expect(
    page.getByRole('button', { name: 'Start round tracking' }),
  ).toContainText('—');
  await page
    .getByRole('button', { name: 'Save one victim', exact: true })
    .click();
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Save one victim', exact: true }),
  ).toContainText('5');
  await page.getByRole('button', { name: 'Details & log' }).click();
  const retry = page
    .getByRole('button', { name: 'Retry cloud sync', exact: true })
    .last();
  await expect(retry).toBeVisible();
  archive.failWrites = false;
  await retry.click();
  await expect
    .poll(() => archive.sessions[0]?.state.playEvents)
    .toHaveLength(2);
});

test('cloud handoff resumes a session on a fresh device without creating another game', async ({
  page,
  archive,
}) => {
  archive.sessions = [
    { id: tracked.id, revision: 4, state: tracked, closed: false },
  ];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME CLOUD GAME' }).click();
  await expect(
    page.getByRole('button', { name: 'Save one victim', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Record one victim killed', exact: true })
    .click();
  await expect.poll(() => archive.sessions[0].revision).toBeGreaterThan(4);
  expect(archive.sessions).toHaveLength(1);
  expect(archive.history).toHaveLength(0);
});
