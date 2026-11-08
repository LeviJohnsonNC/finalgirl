import type { Locator, TestInfo } from '@playwright/test';
import { FALCONWOOD_TERRORS } from '../../supabase/functions/_shared/play/falconwoodCatalog';
import { test, expect, activeGame, userId } from './fixtures';
import { openModule, searchPick } from './play-helpers';
import { summarizePlay, validPlayLog, type PlayEvent } from '../../src/lib/play/events';
import { moduleState } from '../../src/lib/play/modules';
import { falconwoodState } from '../../supabase/functions/_shared/play/falconwood';

const reviewSizes = {desktop:[[1280,640],[1366,768],[1440,900]], mobile:[[390,844],[320,568]]};
const sizesFor = (info: TestInfo) => info.project.name === 'mobile' ? reviewSizes.mobile : reviewSizes.desktop;

const key = `final-girl-active-game-v1:${userId}`;

test('Missing Friend distinguishes a clue solution, finding and reviving the Friend', async ({page, archive}, info) => {
  await archive.install(page, {draft:{...activeGame,selection:{...activeGame.selection,killer:'Slayer',location:'Falconwood',mission:'Missing Friend'},
    falconwoodSetupVersion:1, slayerSetupVersion:1, coreTrackersVersion:1, playMode:true, playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page, 'falconwood');
  const panel = page.locator('[data-module="falconwood"]');
  const log = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents as PlayEvent[],key);
  const state = async () => falconwoodState(moduleState(summarizePlay(await log()).entries,'falconwood'));
  expect((await log()).filter(event => event.falconwoodAction)).toEqual([]);
  const before = await log();
  await page.evaluate(k => {
    const original = Storage.prototype.setItem;
    Object.assign(window,{restoreFalconwoodWrite:() => {Storage.prototype.setItem = original;}});
    Storage.prototype.setItem = function (name,value) {
      if (name === k) throw new Error('Synthetic full storage');
      return original.call(this,name,value);
    };
  },key);
  await panel.getByRole('button',{name:/^A1/}).click();
  await expect(panel.getByRole('alert')).toContainText('could not be saved');
  expect(await log()).toEqual(before);
  await page.evaluate(() => (window as unknown as {restoreFalconwoodWrite:() => void}).restoreFalconwoodWrite());
  await panel.getByRole('button',{name:/^A1/}).click();
  await expect(panel.getByRole('button',{name:/^A2/})).toBeDisabled();
  await panel.getByRole('button',{name:/^B1/}).click();
  await panel.getByRole('button',{name:/^C1/}).click();
  await expect(panel.getByRole('button',{name:'Record friend revived'})).toHaveCount(0);
  await panel.getByRole('button',{name:'Record Friend found · Library'}).click();
  expect(await state()).toMatchObject({complete:false,friend:'prone',proneAt:'Library'});
  for (const [width,height] of sizesFor(info)) {
    await page.setViewportSize({width,height});
    await panel.locator('img').evaluateAll(async images => {await Promise.all(images.map(async image => {
      const img = image as HTMLImageElement; img.loading = 'eager'; await img.decode();
    }));});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await panel.screenshot({path:info.outputPath(`friend-prone-${width}.jpg`),style:'.app-footer,[data-sonner-toaster]{visibility:hidden}'});
  }
  await panel.getByRole('button',{name:'Record friend revived'}).click();
  expect(await state()).toMatchObject({complete:true,friend:'in-play',uses:1});
  expect(validPlayLog(await log())).toBe(true);
  await page.getByRole('button',{name:/The night so far/i}).click();
  const timeline = page.getByRole('region',{name:'Game timeline'});
  await timeline.getByRole('button',{name:'Undo Falconwood mission completed',exact:true}).click();
  expect(await state()).toMatchObject({complete:false,friend:'prone'});
  await timeline.getByRole('button',{name:'Restore Falconwood mission completed',exact:true}).click();
  expect(await state()).toMatchObject({complete:true,friend:'in-play',uses:1});
  await panel.getByRole('button',{name:'Mark Best Friend left'}).click();
  await panel.getByRole('button',{name:'Add Best Friend'}).click();
  await expect(panel.locator('[data-module-control="character"]')).toHaveAttribute('data-state','in-play');
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'falconwood');
  await expect(panel).toContainText('Mission complete');
  expect((await state()).friend).toBe('in-play');
});

test('Falconwood confirms a physical win before writing history, then shares the review across ending requests', async ({page, archive}) => {
  archive.autoImages = true;
  await archive.install(page, {draft:{...activeGame,selection:{...activeGame.selection,killer:'Poltergeist',location:'Falconwood',mission:'Expose the Lab'},
    falconwoodSetupVersion:1, coreTrackersVersion:1, playMode:true, playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'falconwood');
  const panel = page.locator('[data-module="falconwood"]');
  await expect(panel).not.toContainText('Final Health protected');
  await panel.getByRole('button',{name:'Increase Evidence recovered'}).click();
  await panel.getByRole('button',{name:'Increase Evidence recovered'}).click();
  await panel.getByRole('button',{name:'Increase Evidence recovered'}).click();
  await expect(panel.getByRole('button',{name:'Record evidence delivered'})).toBeVisible();
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Won',exact:true}).click();
  const confirmation = page.getByRole('alertdialog',{name:'Did you complete the mission?'});
  await expect(confirmation).toBeVisible();
  expect(archive.history).toHaveLength(0);
  await confirmation.getByRole('button',{name:'Confirm mission completed'}).click();
  await expect(page.getByRole('radio',{name:'Completed',exact:true})).toBeChecked();
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
  const review = {mission:'lab',complete:true};
  await expect.poll(() => archive.generationRequests.find(r => r.name === 'generate-ending')?.body.falconwoodReview).toEqual(review);
  await expect.poll(() => archive.generationRequests.find(r => r.name === 'generate-scene-image' && r.body.sceneType === 'ending')?.body.falconwoodReview).toEqual(review);
  await expect.poll(() => archive.history[0]?.game_highlights).toContain('Expose the Lab · Completed');
  expect(archive.history[0]?.game_highlights).not.toContain('Reporter');
});

test('Falconwood blocks a Lost-to-Won edit in save-only until completion is reviewed', async ({page,archive}) => {
  await archive.install(page,{draft:{...activeGame,selection:{...activeGame.selection,killer:'The Intruders',location:'Falconwood',mission:'Survive the Hunt'},
    falconwoodSetupVersion:1, intrudersSetupVersion:1, coreTrackersVersion:1, playMode:true, playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'falconwood');
  const panel = page.locator('[data-module="falconwood"]');
  await expect(panel).toContainText('Waiting for Terror');
  await panel.getByRole('button',{name:'Start with three'}).click();
  await panel.getByRole('button',{name:'Record Attack 3'}).click();
  await panel.getByRole('button',{name:'Start hunt',exact:true}).click();
  await expect(panel).toContainText('3 Agents remaining');
  await expect(panel).toContainText('Agents attack at 3');
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Lost',exact:true}).click();
  const result = page.getByRole('combobox',{name:'Game result'});
  await result.click();
  await page.getByRole('option',{name:'Won',exact:true}).click();
  const save = page.getByRole('button',{name:'Save record only',exact:true});
  await expect(save).toBeDisabled();
  await page.getByRole('radio',{name:'Completed',exact:true}).check();
  await save.click();
  await expect.poll(() => archive.history[0]?.outcome).toBe('won');
  await expect.poll(() => archive.history[0]?.game_highlights).toContain('Survive the Hunt · Completed');
  expect(archive.generationRequests.some(r => r.name === 'generate-ending')).toBe(false);
});

async function captureArtwork(element: Locator, id: string, info: TestInfo) {
  const image = element.locator('img').first();
  const source = await image.evaluate(async (node: HTMLImageElement) => {
    node.loading = 'eager';
    await node.decode();
    return node.getAttribute('src');
  });
  expect(source).toMatch(new RegExp('/' + id + '(?:[-.])'));
  await element.screenshot({path:info.outputPath(`${id}.jpg`),style:'.app-footer,[data-sonner-toaster]{visibility:hidden}'});
}

for (const [mission,character,photo] of [
  ['Save Your Father','Adopted Father','father-person'],
  ['Crack the Code','Jockette','code-person'],
  ['Expose the Lab','Reporter','lab-person'],
  ['Survive the Hunt','Kind Scientist','hunt-person'],
  ['Missing Friend','Best Friend','friend-person'],
] as const) {
  test(`Falconwood ${mission} and Friend outcomes render with stable artwork`, async ({page,archive},info) => {
    await archive.install(page,{draft:{...activeGame,selection:{...activeGame.selection,killer:'Hans',location:'Falconwood',mission},
      falconwoodSetupVersion:1, coreTrackersVersion:1, playMode:true, playEvents:[]}});
    await page.goto('/');
    await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
    await openModule(page,'falconwood');
    const panel = page.locator('[data-module="falconwood"]');
    const hero = panel.locator('.falconwood-hero');
    const id = photo.replace('-person','');
    await captureArtwork(hero,id,info);
    if (id === 'hunt') {
      await panel.getByRole('button',{name:'Start hunt',exact:true}).click();
      await captureArtwork(hero,'hunt-active',info);
      for (let n = 0; n < 4; n++) await panel.getByRole('button',{name:'Decrease Agents remaining'}).click();
      await panel.getByRole('button',{name:'Record hunt survived'}).click();
      await captureArtwork(hero,'hunt-cleared',info);
      await captureArtwork(panel.getByRole('button',{name:/Telekinesis Uses remaining/}),'telekinesis',info);
    } else if (id === 'father') {
      const completion = panel.getByRole('button',{name:'Record father freed'});
      await expect(completion).toBeDisabled();
      await expect(panel.getByText('0 of 3 keys',{exact:true})).toHaveCount(0);
      await expect(panel.getByText('Adjust requirement',{exact:true})).toHaveCount(0);
      for (let n = 0; n < 3; n++) await panel.getByRole('button',{name:'Increase Banked keys'}).click();
      await expect(panel.getByRole('group',{name:'Banked keys'}).locator('output')).toHaveText('3');
      await panel.locator('.falconwood-mission').screenshot({path:info.outputPath('father-ready.jpg'),style:'.app-footer,[data-sonner-toaster]{visibility:hidden}'});
      await completion.click();
    } else if (id === 'code') {
      await panel.getByRole('button',{name:'Code token 6'}).click();
      await panel.getByRole('combobox',{name:'Physical d20 result'}).click();
      await page.getByRole('option',{name:'13',exact:true}).click();
      await expect(panel.getByRole('button',{name:'Record code cracked'})).toHaveCount(0);
      await panel.getByRole('combobox',{name:'Physical d20 result'}).click();
      await page.getByRole('option',{name:'14',exact:true}).click();
      await panel.getByRole('button',{name:'Record code cracked'}).click();
    } else if (id === 'lab') {
      await panel.getByRole('combobox',{name:'Revealed lead',exact:true}).click();
      await page.getByRole('option',{name:'1 · Best Friend’s House',exact:true}).click();
      await panel.getByRole('combobox',{name:'Next revealed lead'}).click();
      await page.getByRole('option',{name:'School',exact:true}).click();
      await panel.getByRole('button',{name:'Record evidence recovered'}).click();
      await expect(panel.getByRole('combobox',{name:'Revealed lead',exact:true})).toHaveText('2 · School');
      await panel.getByRole('button',{name:'Increase Evidence recovered'}).click();
      await panel.getByRole('button',{name:'Increase Evidence recovered'}).click();
      await panel.getByRole('button',{name:'Record evidence delivered'}).click();
    } else {
      for (const clue of ['A1','B1','C1']) await panel.getByRole('button',{name:new RegExp('^'+clue)}).click();
      await panel.getByRole('button',{name:'Record Friend found · Library'}).click();
      await panel.getByRole('button',{name:'Record friend revived'}).click();
      await captureArtwork(panel.getByRole('button',{name:/Spell Book Uses remaining/}),'spell-book',info);
    }
    await expect(hero).toContainText('Mission complete');
    if (id !== 'hunt') await captureArtwork(hero,`${id}-success`,info);
    const portrait = panel.getByRole('button',{name:character,exact:true});
    await captureArtwork(portrait,photo,info);
    const height = (await portrait.boundingBox())!.height;
    for (const status of ['saved','killed']) {
      await panel.getByRole('button',{name:`Mark ${character} ${status}`}).click();
      await captureArtwork(portrait,`${photo}-${status}`,info);
      expect((await portrait.boundingBox())!.height).toBeCloseTo(height,0);
    }
    if (id === 'friend') {
      await panel.getByRole('button',{name:'Location rules'}).click();
      const rules = page.getByRole('dialog',{name:'Special Rules'});
      await expect(rules).toBeVisible();
      await expect(rules.getByText('Back to School',{exact:true}).and(rules.locator('strong'))).toBeVisible();
      for (const [width,height] of sizesFor(info)) {
        await page.setViewportSize({width,height});
        expect(await rules.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
        await rules.screenshot({path:info.outputPath(`rules-${width}.jpg`)});
      }
    }
  });
}

test('Falconwood Event and Terror photographs load in the actual Play and death crops', async ({page,archive},info) => {
  test.setTimeout(90000);
  await archive.install(page,{draft:{...activeGame,selection:{...activeGame.selection,killer:'Hans',location:'Falconwood',mission:'Survive the Hunt'},
    falconwoodSetupVersion:1, coreTrackersVersion:1, playMode:true, playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'falconwood');
  const panel = page.locator('[data-module="falconwood"]');
  await captureArtwork(panel.locator(':scope > summary'),'falconwood',info);
  await panel.getByRole('button',{name:'Record Event',exact:true}).click();
  for (const [name,id] of [['Dry Spell','dry'],['Packed Bridge','packed'],['Freaks and Geeks','freaks'],['Grand Opening','opened'],['Bridge Repair','closed'],['Pizza Delivery','van']]) {
    const tile = panel.locator('[data-module-control="event"]').filter({hasText:name}).locator('.play-illustrated-tile');
    await tile.click();
    await captureArtwork(tile,id,info);
    if (id === 'dry' || id === 'van') {
      await tile.click();
      await captureArtwork(tile,id+'-off',info);
    }
  }
  for (const [name,id] of [['Head Researcher','head-researcher'],['Conspiracy Theorist','conspiracy-theorist']]) {
    await panel.getByRole('button',{name:`Add ${name}`}).click();
    const portrait = panel.getByRole('button',{name,exact:true});
    await captureArtwork(portrait,id,info);
    for (const status of ['saved','killed']) {
      await panel.getByRole('button',{name:`Mark ${name} ${status}`}).click();
      await captureArtwork(portrait,`${id}-${status}`,info);
    }
  }
  await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
  const dialog = page.getByRole('dialog',{name:'Gruesome Death',exact:true});
  const terror = dialog.locator('.play-cause-tile--terror');
  await terror.click();
  for (const card of FALCONWOOD_TERRORS) {
    await searchPick(page,'Terror card',card.name);
    await captureArtwork(terror,card.id,info);
  }
  for (const [width,height] of sizesFor(info)) {
    await page.setViewportSize({width,height});
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await expect(dialog.getByRole('button',{name:'Save and exit',exact:true})).toBeInViewport();
    await dialog.screenshot({path:info.outputPath(`death-${width}.jpg`)});
  }
});
