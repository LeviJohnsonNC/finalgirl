import { activeGame, test, expect, userId } from './fixtures';
import { openMinorPowers, openModule, statusPick } from './play-helpers';
import { AFFLICTIONS, razorfaceState } from '../../supabase/functions/_shared/play/razorface';
import { newPlayEvent, summarizePlay, type PlayEvent } from '../../src/lib/play/events';

const key = `final-girl-active-game-v1:${userId}`;
const draft = {...activeGame, playMode:true, coreTrackersVersion:1, razorfaceSetupVersion:1,
  selection:{...activeGame.selection, killer:'Razorface', finalGirl:'Kenzie', filmId:'s3-hell-to-pay', finalGirlStartingHealth:5}};

function observed(cards: string[]) {
  return newPlayEvent({kind:'module', moduleData:{module:'razorface',changes:{action:JSON.stringify({kind:'correct',parent:'root',cards})}}});
}

test('showcase records a purge, preserves other play and restores effects after reload', async ({page,archive}, info) => {
  await archive.install(page,{draft});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  if (info.project.name === 'mobile') await page.setViewportSize({width:320,height:568});
  await openModule(page,'razorface');
  const module = page.locator('[data-module="razorface"]');
  const objective = page.getByRole('region',{name:'Afflictions'});
  const read = () => page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents as PlayEvent[],key);
  const state = async () => razorfaceState(summarizePlay(await read()).entries);
  const gift = objective.locator('[data-affliction="the-gift-of-pain"]');
  await objective.getByRole('button',{name:'Record the opening three'}).click();
  for (const title of ['Experience Unbound','The Gift of Pain','Explorers of the Flesh'])
    await objective.getByRole('button',{name:title,exact:true}).click();
  await objective.getByRole('button',{name:'Set opening Afflictions'}).click();
  await expect(objective.getByText('Final Health protected',{exact:true})).toBeVisible();
  await expect(objective.locator('.razorface-card')).toHaveCount(3);
  await objective.locator('.razorface-card img').evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
  await objective.screenshot({path:info.outputPath('opening-afflictions.png'), animations:'disabled',style:'.app-footer, [data-sonner-toaster] { visibility:hidden; }'});
  await openMinorPowers(module);
  for (const power of ['The Pain of Judgment','The Pain of Salvation']) {
    if (power.includes('Salvation')) await module.getByRole('button',{name:'Add another Minor Power'}).click();
    await module.getByRole('button',{name:`Reveal ${power}`,exact:true}).click();
  }
  await module.locator('.module-card-section > summary').click();
  await module.getByText('Life Drain',{exact:true}).click();
  await expect.poll(async () => (await read()).some(e => e.killerCard === 'Life Drain')).toBe(true);
  await gift.getByRole('button',{name:/The Gift of Pain/}).click();
  await expect(gift.getByText(/Life Drain/)).toBeVisible();
  await gift.screenshot({path:info.outputPath('affliction-purge.png'),animations:'disabled',style:'.app-footer { visibility:hidden; }'});
  await gift.getByText('Record Health after effects').click();
  await gift.getByLabel('Final Girl Health',{exact:true}).fill('3');
  await page.evaluate(k=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(name,value){
      const events = name === k ? JSON.parse(value).playEvents as PlayEvent[] | undefined : undefined;
      if(events?.at(-1)?.moduleData?.module === 'razorface' &&
          JSON.parse(String(events.at(-1)?.moduleData?.changes.action)).kind === 'purge') {
        Storage.prototype.setItem=original;
        throw new Error('Test write failure');
      }
      return original.call(this,name,value);
    };
  }, key);
  await gift.getByRole('button',{name:'Record purge',exact:true}).click();
  await expect(gift).toBeVisible();
  expect((await state()).minors).toHaveLength(2);
  await gift.getByRole('button',{name:'Record purge',exact:true}).click();
  await expect(gift).toHaveCount(0);
  expect((await state()).minors).toEqual([]);
  expect(summarizePlay(await read()).finalGirlHealth).toBe(3);
  await page.getByRole('button',{name:'Decrease Horror',exact:true}).click();
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'razorface');
  await objective.getByRole('button',{name:'Undo purge',exact:true}).click();
  await expect(gift).toBeVisible();
  expect((await state()).minors).toHaveLength(2);
  const after = summarizePlay(await read());
  expect([after.finalGirlHealth,after.finalHorrorLevel]).toEqual([5,4]);
});

test('replacement remains separate from a purge, and the clear state allows revival', async ({page,archive},info) => {
  const log = [
    newPlayEvent({kind:'start',saved:0,killed:0,round:null}),
    newPlayEvent({kind:'state',field:'killerHealth',value:1}),
    observed(['the-gift-of-pain']),
  ];
  await archive.install(page,{draft:{...draft,playEvents:log,razorfaceSetupVersion:undefined}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  if (info.project.name === 'mobile') await page.setViewportSize({width:320,height:568});
  await openModule(page,'razorface');
  const objective = page.getByRole('region',{name:'Afflictions'});
  await expect(objective.getByRole('button',{name:'Record Final Health result'})).toHaveCount(0);
  await objective.getByRole('button',{name:/The Gift of Pain/}).click();
  await objective.getByRole('button',{name:'Replace Affliction',exact:true}).click();
  await statusPick(page,objective.getByRole('combobox',{name:'Replacement Affliction'}),'A Lamb to the Slaughter');
  await objective.getByRole('button',{name:'Record replacement',exact:true}).click();
  await expect(objective.getByText('1 in play',{exact:true})).toBeVisible();
  await objective.getByRole('button',{name:/A Lamb to the Slaughter/}).click();
  await objective.getByText('Record Horror after effects').click();
  await objective.getByLabel('Horror',{exact:true}).fill('6');
  await objective.getByRole('button',{name:'Record purge',exact:true}).click();
  const logAfterPurge = await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents as PlayEvent[],key);
  expect(summarizePlay(logAfterPurge).finalHorrorLevel).toBe(6);
  await expect(objective.getByText('Final Health can be revealed',{exact:true})).toBeVisible();
  await objective.locator('.razorface-release img').evaluate((image:HTMLImageElement) => image.decode());
  await objective.screenshot({path:info.outputPath('afflictions-cleared.png'), animations:'disabled',style:'.app-footer, [data-sonner-toaster] { visibility:hidden; }'});
  await objective.getByRole('button',{name:'Record Final Health result'}).click();
  await statusPick(page,objective.getByRole('combobox',{name:'Revival Health'}),'2 Health');
  await objective.getByRole('button',{name:'Record revival',exact:true}).click();
  await expect(objective.getByText('Final Health revealed',{exact:true})).toBeVisible();
});

test('every Affliction loads unique art in a populated module without clipping',async ({page,archive},info)=>{
  const log = [newPlayEvent({kind:'start',saved:0,killed:0,round:null}), observed(AFFLICTIONS.map(card=>card.id))];
  await archive.install(page,{draft:{...draft,playEvents:log}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const sizes=info.project.name==='mobile'?[[320,568],[390,844]]:[[1280,640],[1366,768],[1440,900]];
  for (const [width,height] of sizes) {
    await page.setViewportSize({width,height});
    await openModule(page,'razorface');
    const objective=page.getByRole('region',{name:'Afflictions'});
    const images=objective.locator('.razorface-card img');
    await expect(images).toHaveCount(8);
    const sources=await images.evaluateAll(async elements=>Promise.all(elements.map(async element=>{
      const image=element as HTMLImageElement;
      await image.decode();
      return image.currentSrc;
    })));
    expect(new Set(sources).size).toBe(8);
    expect(await objective.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    if(width===1366||width===320) await objective.screenshot({path:info.outputPath(`afflictions-${width}.png`),animations:'disabled',style:'.app-footer, [data-sonner-toaster] { visibility:hidden; }'});
  }
});

test('exhaustion forces a loss with both Razorface and Falconwood on the table', async ({page,archive}) => {
  const log = [newPlayEvent({kind:'start',saved:1,killed:0,round:2}), observed(['a-waste-of-good-suffering'])];
  await archive.install(page,{draft:{...draft,playEvents:log,
    selection:{...draft.selection,location:'Falconwood',mission:'Expose the Lab',finalGirl:'Christie'}}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'razorface');
  await openModule(page,'falconwood');
  const objective = page.getByRole('region',{name:'Afflictions'});
  await expect(page.locator('[data-module="falconwood"]')).toBeVisible();
  await objective.getByRole('button',{name:/A Waste of Good Suffering/}).click();
  await objective.getByRole('button',{name:'Replace Affliction',exact:true}).click();
  await objective.getByRole('checkbox',{name:/A required draw failed/}).check();
  await objective.getByRole('button',{name:'Record Affliction deck loss',exact:true}).click();
  await expect(objective.getByText('Affliction deck exhausted',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Won',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Game result'})).toHaveText('Lost');
  await expect(page.getByRole('status').filter({hasText:'Affliction deck exhaustion'})).toBeVisible();
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
  await expect.poll(() => archive.generationRequests.find(request=>request.name==='generate-ending')?.body.playSummary)
    .toContain('required Affliction draw failed');
  await expect.poll(() => archive.history[0]?.outcome).toBe('lost');
});

test('both shared power entry points use the same staged reveal', async ({page,archive},info) => {
  await archive.install(page,{draft});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'razorface');
  const module = page.locator('[data-module="razorface"]');
  await module.locator('.module-card-section > summary').click();
  const choices = module.getByRole('region',{name:'Dark Power selection'});
  const lifeDrain = choices.getByRole('button',{name:/Life Drain/});
  await expect(lifeDrain).toBeVisible();
  await page.getByRole('button',{name:'Dark Power',exact:true}).click();
  const remember = page.locator('.play-moment-editor').getByRole('region',{name:'Dark Power selection'});
  const otherChoice=remember.getByRole('button',{name:/Life Drain/});
  const [localBox,otherBox] = await Promise.all([lifeDrain.boundingBox(),otherChoice.boundingBox()]);
  expect(Math.abs(localBox!.height-otherBox!.height)).toBeLessThan(16);
  await otherChoice.click();
  await expect(choices.locator('.module-revealed-hero')).toContainText('Life Drain');
  await expect(remember.locator('.module-revealed-hero')).toContainText('Life Drain');
  await choices.locator('.module-revealed-hero img').evaluate((img:HTMLImageElement)=>img.decode());
  await choices.screenshot({path:info.outputPath('razorface-dark-power.png'),animations:'disabled',style:'.app-footer, [data-sonner-toaster] { visibility:hidden; }'});
  const log = await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents as PlayEvent[],key);
  expect(summarizePlay(log).entries.filter(e=>e.momentType==='dark-power')).toHaveLength(1);
});

for (const girl of ['Christie','Kenzie','Julie']) {
  test(`${girl} keeps her own identity in a mixed cast`, async ({page,archive}) => {
    archive.aiCastingArt = true;
    await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,
      selection:{...activeGame.selection,killer:'Hans',finalGirl:girl,filmId:'s3-hell-to-pay'}}});
    await page.goto('/');
    await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
    const dossier = page.getByRole('button',{name:`View ${girl} info`,exact:true});
    await expect(dossier).toBeVisible();
    await expect(page.locator('[data-module="razorface"]')).toHaveCount(0);
    await expect(page.getByRole('group',{name:'Health tracker',exact:true}).locator('img')).toHaveAttribute('src',new RegExp(girl.toLowerCase()));
    if (girl !== 'Julie') {
      await dossier.click();
      const view = page.getByRole('dialog');
      await view.getByText('Ultimate ability',{exact:true}).click();
      await expect(view).toContainText(girl === 'Christie' ? 'Resolve one of your choice' : 'cost of a single copy');
    }
  });
}

test('Casting Room offers both girls and the existing Hellscape alongside other films',async ({page,archive})=>{
  archive.films=['s3-hell-to-pay','s3-falconwood-files','s1-camp-happy-trails'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button',{name:'START THE TAPE',exact:true}).click();
  await page.getByRole('button',{name:'Choose',exact:true}).nth(0).click();
  await page.getByRole('dialog').getByRole('button',{name:/Razorface/}).click();
  await page.getByRole('button',{name:'Choose',exact:true}).nth(1).click();
  await expect(page.getByRole('dialog').getByRole('button',{name:/Hellscape/})).toBeVisible();
  await page.getByRole('dialog').getByRole('button',{name:/Falconwood/}).click();
  await page.getByRole('button',{name:'Choose',exact:true}).nth(2).click();
  const dossier = page.getByRole('dialog');
  await expect(dossier.getByRole('button',{name:/Kenzie/})).toBeVisible();
  await expect(dossier.getByRole('button',{name:/Julie/})).toHaveCount(0);
  await dossier.getByRole('button',{name:/Christie/}).click();
  await expect(page.getByRole('button',{name:'Choose FINAL GIRL: Christie',exact:true})).toBeVisible();
});

test('an off-app Razorface victory confirms the defeat without inventing totals',async ({page,archive})=>{
  await archive.install(page,{draft:{...draft,playMode:false}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await page.getByRole('button',{name:'WON',exact:true}).click();
  const dialog = page.getByRole('alertdialog',{name:'Confirm Razorface’s defeat'});
  await expect(dialog).toBeVisible();
  expect(archive.history).toHaveLength(0);
  await dialog.getByRole('button',{name:'Confirm tabletop win'}).click();
  await expect(page.getByRole('combobox',{name:'Game result'})).toHaveText('Won');
  await expect.poll(() => archive.history[0]).toMatchObject({outcome:'won',victims_saved:null,victims_killed:null,killer_health:0});
});
