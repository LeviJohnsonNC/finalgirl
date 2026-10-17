import { test, expect, activeGame } from './fixtures';
const start = {
  id: '22222222-2222-4222-8222-222222222222',
  at: 1,
  kind: 'start',
  saved: 0,
  killed: 0,
  round: 2,
};
const draft = {
  ...activeGame,
  selection: {
    ...activeGame.selection,
    killer: 'Billy the Bear',
    location: 'Buddyland',
    finalGirl: 'Gwynn',
  },
  playMode: true,
  playEvents: [start],
};
async function resume(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
}

test('record first, contextualize optionally, cache and replay without another generation', async ({
  page,
  archive,
}, info) => {
  test.setTimeout(90000);
  await archive.install(page, { draft });
  await resume(page);
  await page
    .getByRole('button', { name: 'Record one victim killed', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Latest death scene' }).click();
  await page.getByLabel('Death location', { exact: true }).fill('Kitchen');
  await page
    .getByLabel('Cause of death', { exact: true })
    .selectOption('event');
  await page
    .getByLabel('Death context', { exact: true })
    .fill('Tragic Collapse');
  await page
    .getByRole('button', { name: 'Develop death scene · uses AI', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Generated death scene' }),
  ).toContainText(archive.deathText);
  await page.screenshot({
    path: info.outputPath('death-scene.png'),
    fullPage: true,
  });
  expect(
    archive.calls.filter((c) => c === 'generate-death-scene'),
  ).toHaveLength(1);
  expect(archive.sessions[0].state.playEvents).toHaveLength(3);
  expect(
    archive.generationRequests.find((r) => r.name === 'generate-death-scene')
      ?.body,
  ).toMatchObject({ eventId: archive.deathScenes[0].event_id, take: 0 });
  expect(
    JSON.stringify(
      archive.generationRequests.find((r) => r.name === 'generate-death-scene')
        ?.body,
    ),
  ).not.toContain('killer');
  await page
    .getByRole('button', { name: 'Back to the game', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Record one victim killed', exact: true }),
  ).toContainText('1');
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await page.getByRole('button', { name: 'Latest death scene' }).click();
  await expect(
    page.getByRole('region', { name: 'Generated death scene' }),
  ).toContainText(archive.deathText);
  expect(
    archive.calls.filter((c) => c === 'generate-death-scene'),
  ).toHaveLength(1);
  await page
    .getByRole('button', { name: 'Another take · uses AI', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Take 2', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Another take · uses AI', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Take 3', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Another take · uses AI', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Back to the game', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Record one victim killed', exact: true }),
  ).toContainText('1');
});

test('AI failure and a late death response cannot lose or revive a recorded count', async ({
  page,
  archive,
}) => {
  test.setTimeout(90000);
  archive.failDeaths = true;
  await archive.install(page, { draft: { ...draft, showDeathPanel: true } });
  await resume(page);
  await page
    .getByRole('button', { name: 'Record one victim killed', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'The last thing they saw' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Develop death scene · uses AI', exact: true })
    .click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Scene unavailable.' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Back to the game', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Record one victim killed', exact: true }),
  ).toContainText('1');
  archive.failDeaths = false;
  archive.holdDeath = true;
  await page.getByRole('button', { name: 'Latest death scene' }).click();
  await page
    .getByRole('button', { name: 'Develop death scene · uses AI', exact: true })
    .click();
  await expect.poll(() => Boolean(archive.releaseDeath)).toBe(true);
  await page
    .getByRole('button', { name: 'Back to the game', exact: true })
    .click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  archive.releaseDeath!();
  await expect(
    page.getByRole('button', { name: 'Record one victim killed', exact: true }),
  ).toContainText('0');
  await expect(
    page.getByRole('button', { name: 'Latest death scene' }),
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Record one victim killed', exact: true }),
  ).toContainText('0');
});

test('a conflicting phone or desktop keeps both versions before explicit handoff',async({page,archive})=>{
 await archive.install(page,{draft});await resume(page);
 await expect.poll(()=>archive.sessions.length).toBe(1);
 archive.sessions[0].revision=42;
 archive.sessions[0].state={...archive.sessions[0].state,playEvents:[start,{id:'55555555-5555-4555-8555-555555555555',at:3,kind:'saved',quantity:3}]};
 await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Another device changed this game.');
 await page.getByRole('button',{name:'Keep this device’s version',exact:true}).click();
 await expect(page.getByRole('alert')).toHaveCount(0);
 await expect.poll(()=>archive.sessions[0].revision).toBeGreaterThan(42);
 const backup=await page.evaluate(()=>JSON.parse(localStorage.getItem('final-girl-play-backup-v1:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:11111111-1111-4111-8111-111111111111')??'{}'));
 expect(backup.local.playEvents.at(-1).kind).toBe('killed');expect(backup.cloud.state.playEvents.at(-1).kind).toBe('saved');
});
