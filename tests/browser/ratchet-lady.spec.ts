import { RATCHET_FINALES, RATCHET_POWERS, RATCHET_TERRORS } from '../../supabase/functions/_shared/play/ratchetLady';
import { activeGame, expect, test, userId } from './fixtures';
import { chooseKillerCard, openMinorPowers, openModule, searchPick, undoLatestObservation } from './play-helpers';
import { summarizePlay, validPlayLog, type PlayEvent } from '../../src/lib/play/events';
import { moduleState } from '../../src/lib/play/modules';

const key = `final-girl-active-game-v1:${userId}`;
const selection = {
  ...activeGame.selection, killer: 'Ratchet Lady', location: 'Wolfe Asylum', finalGirl: 'Heather',
};

test('Ratchet Lady Health, images and permanent reveal', async ({ page, archive }, info) => {
  await archive.install(page, { draft: {
    ...activeGame, selection, playMode: true, coreTrackersVersion: 1, ratchetSetupVersion: 1, playEvents: [],
  } });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await openModule(page, 'ratchet-lady');
  const panel = page.locator('.play-module-panel[data-module="ratchet-lady"]');
  const tracker = panel.getByRole('article', { name: 'Maniacs tracker' });
  const count = tracker.getByRole('button', { name: 'Set Maniac count' });
  await expect(count).toHaveText('2');
  const editCount = async (value: number) => {
    await count.click();
    await tracker.getByRole('combobox', { name: 'Maniac count to record' }).click();
    await page.getByRole('option', {name: String(value), exact: true}).click();
    await expect(count).toHaveText(String(value));
  };

  const health = page.getByRole('group', { name: 'Killer Health tracker' });
  await health.getByRole('button', { name: 'Set Killer health', exact: true }).click();
  await health.getByRole('textbox', { name: 'Killer health value' }).fill('100');
  await health.getByRole('button', { name: 'Set', exact: true }).click();
  await expect(health.getByRole('button', { name: 'Set Killer health' })).toHaveText('100');

  await tracker.locator('img').evaluate(img => (img as HTMLImageElement).decode());
  await tracker.screenshot({ path: info.outputPath('maniacs-start.jpg') });
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    Object.assign(window, { restoreRatchetStorage: () => { Storage.prototype.setItem = write; } });
    Storage.prototype.setItem = function (name, data) {
      if (name.startsWith('final-girl-active-game-v1:')) throw Error('Interrupted save');
      write.call(this, name, data);
    };
  });
  await tracker.getByRole('button', { name:'Increase Maniacs' }).click();
  await expect(panel.getByRole('alert')).toContainText('could not be saved');
  await expect(count).toHaveText('2');
  await page.evaluate(() => (window as unknown as {restoreRatchetStorage:()=>void}).restoreRatchetStorage());
  await tracker.getByRole('button', { name:'Increase Maniacs' }).click();
  await expect(count).toHaveText('3');

  await editCount(0);
  await expect(tracker.getByRole('button', { name: 'Decrease Maniacs' })).toBeDisabled();
  await tracker.screenshot({ path: info.outputPath('maniacs-empty.jpg') });
  await editCount(6);
  await expect(tracker.getByRole('button', { name: 'Increase Maniacs' })).toBeDisabled();
  await tracker.getByRole('button', { name: 'Calm', exact: true }).click();
  await tracker.getByRole('button', { name: 'Calmed 2', exact: true }).click();
  await expect(count).toHaveText('4');
  await editCount(6);
  await panel.locator('details.module-card-section > summary').click();
  await chooseKillerCard(panel, 'Dark Power', 'Shield of Madness');
  await expect(health.getByText('Shield of Madness · 6 Maniacs')).toBeVisible();
  await chooseKillerCard(panel, 'Finale', 'Hold Her Down');
  await panel.getByRole('button', { name: 'Record reveal effect' }).click();
  await panel.getByRole('combobox', { name: 'Maniacs after resolving the Finale' }).click();
  await page.getByRole('option', {name:'0',exact:true}).click();
  await panel.getByRole('button', { name: 'Record Calm removed' }).click();
  await expect(count).toHaveText('0');
  await expect(tracker.getByText('Calm removed')).toBeVisible();
  await undoLatestObservation(page);
  await expect(count).toHaveText('6');
  await panel.getByRole('button', { name: 'Record reveal effect' }).click();
  await panel.getByRole('combobox', { name: 'Maniacs after resolving the Finale' }).click();
  await page.getByRole('option', {name:'6',exact:true}).click();
  await panel.getByRole('button', { name: 'Record Calm removed' }).click();
  await panel.getByRole('button', { name: 'Clear Finale card name' }).click();
  await expect(tracker.getByText('Calm removed')).toBeVisible();
  await chooseKillerCard(panel, 'Finale', 'Hold Her Down');
  await openMinorPowers(panel);
  await panel.getByText('Blood Drive', { exact: true }).click();
  await panel.getByRole('button', { name: 'Add another Minor Power' }).click();
  await panel.getByText('Insanity-Lust', { exact: true }).click();

  const sizes = info.project.name === 'mobile' ? [[390, 844], [320, 568]] : [[1280, 640], [1366, 768], [1440, 900]];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await panel.locator('img').evaluateAll(images => Promise.all(images.map(img => (img as HTMLImageElement).decode())));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await tracker.getByRole('button', { name: 'Set Maniac count' }).boundingBox()).toMatchObject({ width: expect.any(Number) });
    expect((await count.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    const art = await tracker.locator('img').boundingBox();
    const outer = await tracker.boundingBox();
    expect(outer!.width - art!.width).toBeLessThanOrEqual(2);
    await panel.screenshot({ path: info.outputPath(`ratchet-${width}.jpg`), style: '.app-footer{visibility:hidden}' });
  }
  const log: PlayEvent[] = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).playEvents, key);
  expect(validPlayLog(log)).toBe(true);
  expect(summarizePlay(log)).toMatchObject({ killerHealth: 100, finalHorrorLevel: 5, bloodlust: 0, killed: 0, saved: 0 });
  expect(moduleState(summarizePlay(log).entries, 'ratchet-lady')).toMatchObject({ maniacs: 6, calmRemoved: true });
});

test('Ratchet Lady legacy session keeps an unknown count', async ({page, archive}, info) => {
  await archive.install(page, { draft: {
    ...activeGame, selection: { ...selection, location: 'Falconwood' }, playMode: true, coreTrackersVersion: 1, playEvents: [],
  } });
  await page.goto('/');
  await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
  await openModule(page, 'ratchet-lady');
  const tracker = page.getByRole('article', { name: 'Maniacs tracker' });
  await expect(tracker.getByRole('button', { name: 'Set Maniac count' })).toHaveText('?');
  await expect(tracker.getByText('Count unrecorded')).toBeVisible();
  await tracker.locator('img').evaluate(img => (img as HTMLImageElement).decode());
  await tracker.screenshot({ path: info.outputPath('maniacs-unknown.jpg') });
});

test('Ratchet Lady Finish review sends the same facts to prose and poster', async ({ page, archive }) => {
  archive.autoImages = true;
  archive.films = ['s2-madness-in-dark'];
  await archive.install(page, { draft: {
    ...activeGame, selection, playMode: true, coreTrackersVersion:1, ratchetSetupVersion:1, playEvents: [],
  } });
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await page.getByRole('button',{name:'Finale',exact:true}).click();
  const remember = page.locator('.play-moment-editor');
  await chooseKillerCard(remember, 'Finale', 'Hold Her Down');
  await remember.getByRole('button',{name:'Record reveal effect'}).click();
  await remember.getByRole('combobox',{name:'Maniacs after resolving the Finale'}).click();
  await page.getByRole('option',{name:'Unknown',exact:true}).click();
  await remember.getByRole('button',{name:'Record Calm removed'}).click();
  const log: PlayEvent[] = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).playEvents, key);
  expect(moduleState(summarizePlay(log).entries,'ratchet-lady')).toMatchObject({calmRemoved:true});
  expect(moduleState(summarizePlay(log).entries,'ratchet-lady').maniacs).toBeUndefined();

  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Lost',exact:true}).click();
  const count = page.getByRole('textbox',{name:'Maniacs on board at finish',exact:true});
  await expect(count).toHaveValue('');
  await count.fill('0');
  await page.getByRole('textbox',{name:'Killer Health',exact:true}).fill('100');
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(count).toHaveValue('0');
  await expect(page.getByRole('textbox',{name:'Killer Health',exact:true})).toHaveValue('100');
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
  const prose = () => archive.generationRequests.find(request => request.name==='generate-ending')?.body;
  const poster = () => archive.generationRequests.find(request => request.name==='generate-scene-image' && request.body.sceneType==='ending')?.body;
  await expect.poll(() => prose()?.playSummary).toContain('Maniacs on board: 0.');
  await expect.poll(() => poster()?.scenarioRules).toContain('Maniacs on board: 0.');
  expect(prose()?.killerHealth).toBe(100);
  expect(poster()?.killerHealth).toBe(100);
  await expect.poll(() => archive.history[0]?.killer_health).toBe(100);
  archive.releaseImage?.();
});

test('Ratchet Lady artwork displays on the actual reveal and death surfaces', async ({ page, archive }, info) => {
  test.setTimeout(90000);
  await archive.install(page, { draft:{
    ...activeGame, selection:{...selection,location:'Falconwood'}, playMode:true,
    coreTrackersVersion:1, ratchetSetupVersion:1, playEvents:[],
  } });
  await page.setViewportSize(info.project.name==='mobile' ? {width:320,height:568} : {width:1366,height:768});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'ratchet-lady');
  const panel = page.locator('[data-module="ratchet-lady"]');
  await panel.locator('details.module-card-section > summary').click();
  for (const [type, cards] of [['Dark Power',RATCHET_POWERS], ['Finale',RATCHET_FINALES]] as const) {
    const region = panel.getByRole('region',{name:type+' selection'});
    for (const card of cards) {
      await chooseKillerCard(panel,type,card.name);
      const hero = region.locator('.module-revealed-hero');
      await expect(hero.locator('img')).toHaveAttribute('src',new RegExp(card.id));
      await hero.locator('img').evaluate(img => (img as HTMLImageElement).decode());
      await hero.screenshot({path:info.outputPath(card.id+'.jpg')});
    }
  }

  await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
  const terror=dialog.getByRole('button',{name:'Terror card',exact:true});
  await terror.click();
  for (const card of RATCHET_TERRORS.filter(item => item.death)) {
    await searchPick(page,'Terror card',card.name);
    await expect(terror.locator('img')).toHaveAttribute('src',new RegExp(card.id));
    await terror.locator('img').evaluate(img => (img as HTMLImageElement).decode());
    await terror.screenshot({path:info.outputPath(card.id+'.jpg')});
  }
  await searchPick(page,'Death attacker','Maniac');
  await dialog.getByRole('button',{name:'Gruesome Death',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await dialog.getByRole('button',{name:'Save and exit',exact:true}).click();
  await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  expect(archive.calls.filter(name=>name==='generate-death-scene')).toHaveLength(1);
});
