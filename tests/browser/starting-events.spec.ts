import { test, expect, activeGame, userId } from './fixtures';
import { openModule, statusPick } from './play-helpers';

test('Girlfriend starting event is in play once and respects later changes across reload', async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: {
        ...activeGame.selection,
        killer: 'Billy the Bear',
        startingEvent: 'Girlfriend',
      },
      playMode: true,
    },
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await openModule(page, 'camp');
  const girlfriend = page
    .locator('.play-camp-person')
    .filter({ hasText: 'Girlfriend' });
  await expect(girlfriend).toHaveAttribute('data-state', 'in-play');
  await expect(
    page.locator('.play-camp-person').filter({ hasText: 'Boyfriend' }),
  ).toHaveAttribute('data-state', 'unrecorded');
  await girlfriend
    .getByRole('button', { name: 'Mark Girlfriend killed', exact: true })
    .click();
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await openModule(page, 'camp');
  await expect(girlfriend).toHaveAttribute('data-state', 'killed');
  await girlfriend.locator('.module-correction > summary').click();
  await statusPick(page,girlfriend.getByRole('combobox',{name:'Girlfriend status',exact:true}),'Not recorded');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await openModule(page, 'camp');
  await expect(girlfriend).toHaveAttribute('data-state', 'unrecorded');
  const seeded = await page.evaluate(
    (owner) =>
      JSON.parse(
        localStorage.getItem('final-girl-active-game-v1:' + owner)!,
      ).playEvents.filter(
        (e: { moduleData?: { changes: Record<string, unknown> } }) =>
          e.moduleData?.changes['victim.girlfriend'] === 'in-play',
      ).length,
    userId,
  );
  expect(seeded).toBe(1);
});

for (const name of ['Dark Waters', 'Secret Tunnel'])
  test(`${name} starting event activates its Play control without resolving board choices`, async ({
    page,
    archive,
  }) => {
    await archive.install(page, {
      draft: {
        ...activeGame,
        selection: { ...activeGame.selection, startingEvent: name },
        playMode: true,
      },
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'RESUME GAME' }).click();
    await openModule(page, 'camp');
    await expect(
      page.getByRole('button', {
        name: (name === 'Dark Waters' ? 'End effect: ' : 'View ') + name,
        exact: true,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    if (name === 'Secret Tunnel') {
      await expect(
        page.getByRole('combobox', {
          name: 'Secret Tunnel endpoint 1',
          exact: true,
        }),
      ).toContainText('Not recorded');
      await expect(
        page.getByRole('combobox', {
          name: 'Secret Tunnel endpoint 2',
          exact: true,
        }),
      ).toContainText('Not recorded');
    } else {
      await page
        .getByRole('button', { name: 'End effect: Dark Waters', exact: true })
        .click();
      await page.reload();
      await page.getByRole('button', { name: 'RESUME GAME' }).click();
      await openModule(page, 'camp');
      await expect(
        page.getByRole('button', { name: 'Activate Dark Waters', exact: true }),
      ).toHaveAttribute('aria-pressed', 'false');
      const observations = await page.evaluate(
        (owner) => JSON.parse(localStorage.getItem('final-girl-active-game-v1:' + owner)!).playEvents,
        userId,
      );
      expect(observations.filter(
        (event: { moduleData?: { changes: Record<string, unknown> } }) =>
          event.moduleData?.changes['event.dark-waters'] === 'active',
      )).toHaveLength(1);
      expect(observations.some(
        (event: { kind: string }) => event.kind === 'killed' || event.kind === 'state',
      )).toBe(false);
    }
  });

test('Pizza Delivery starts Pizza Guy at Buddyland even with a different killer', async ({
  page,
  archive,
}) => {
  await archive.install(page, {
    draft: {
      ...activeGame,
      selection: {
        ...activeGame.selection,
        location: 'Buddyland',
        startingEvent: 'Pizza Delivery',
      },
      playMode: true,
    },
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME' }).click();
  await openModule(page, 'buddyland');
  const pizza = page.locator('.module-character').filter({has:page.locator('strong',{hasText:'Pizza Guy'})});
  await expect(pizza).toHaveAttribute('data-state','on-board');
  await expect(pizza.getByRole('button',{name:'View Pizza Guy',exact:true})).toContainText('In play');
});

test('casting a Girlfriend starting event carries its setup through the opening into Play', async ({
  page,
  archive,
}) => {
  await archive.install(page);
  await page.goto('/');
  await page
    .getByRole('button', { name: 'START THE TAPE', exact: true })
    .click();
  for (const [slot, name] of [
    'Hans',
    'Camp Happy Trails',
    'Laurie',
  ].entries()) {
    await page
      .getByRole('button', { name: 'Choose', exact: true })
      .nth(slot)
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: new RegExp(name) })
      .click();
  }
  await page
    .getByRole('combobox', { name: 'Starting Event', exact: true })
    .click();
  await page.getByRole('option', { name: 'Girlfriend', exact: true }).click();
  await page.getByRole('button', { name: 'Press Play', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Opening narration' }),
  ).toContainText(archive.storyText);
  await page
    .getByRole('button', { name: 'Enter Play mode', exact: true })
    .click();
  await openModule(page, 'camp');
  await expect(
    page.locator('.play-camp-person').filter({ hasText: 'Girlfriend' }),
  ).toHaveAttribute('data-state', 'in-play');
  const totals = await page.evaluate((owner) => {
    const log = JSON.parse(
      localStorage.getItem('final-girl-active-game-v1:' + owner)!,
    ).playEvents;
    return log.filter((event: { kind: string }) =>
      ['start', 'saved', 'killed'].includes(event.kind),
    );
  }, userId);
  expect(totals).toEqual([
    expect.objectContaining({ kind: 'start', saved: 0, killed: 0, round: 1 }),
  ]);
});
