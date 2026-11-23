import { test, expect, activeGame, userId } from './fixtures';
import { openMinorPowers, openModule, statusPick } from './play-helpers';
import { summarizePlay, type PlayEvent } from '../../src/lib/play/events';
import { birdsState } from '../../supabase/functions/_shared/play/birds';

const key = `final-girl-active-game-v1:${userId}`;
const newDraft = {
  ...activeGame, coreTrackersVersion:1 as const, playMode:true,
  selection:{...activeGame.selection,killer:'Birds',finalGirl:'Melanie',birdsRequired:2 as const,finalGirlStartingHealth:5},
};
test('Birds rescue syncs both counters and survives reload', async ({page,archive}, info) => {
  await archive.install(page,{draft:newDraft});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'birds');
  const birds = page.locator('[data-module="birds"]');
  await expect(birds.getByText(/Special Victims hidden · target 2/)).toBeVisible();
  await expect(birds.getByText('Spawn Birds reference', {exact:true})).toHaveCount(0);
  const readLog = () => page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents as PlayEvent[],key);
  await expect.poll(async ()=>{
    const summary=summarizePlay(await readLog());
    return [summary.finalGirlHealth,summary.finalHorrorLevel,summary.bloodlust,summary.killerHealth];
  }).toEqual([5,4,0,undefined]);
  await birds.getByRole('button',{name:'No normal Victims remain'}).click();
  await page.evaluate(k=>{
    const original=Storage.prototype.setItem;
    Object.assign(window,{restoreBirdsWrite:()=>{Storage.prototype.setItem=original;}});
    Storage.prototype.setItem=function(name,value) {
      if(name===k) throw new Error('Synthetic storage failure');
      return original.call(this,name,value);
    };
  },key);
  await birds.getByRole('button',{name:'Record Special Victim rescued'}).click();
  await expect(birds.getByRole('alert')).toContainText('could not be saved');
  await expect(birds.getByRole('status')).toContainText('0 of 2 rescued');
  await page.evaluate(()=>(window as unknown as {restoreBirdsWrite:()=>void}).restoreBirdsWrite());
  await birds.getByRole('button',{name:'Record Special Victim rescued'}).click();
  await expect(birds.getByRole('status')).toContainText('1 of 2 rescued');
  await expect.poll(async()=>summarizePlay(await readLog()).saved).toBe(1);
  await birds.getByRole('button',{name:'Undo rescue observation'}).click();
  await expect(birds.getByRole('status')).toContainText('0 of 2 rescued');
  await expect.poll(async()=>summarizePlay(await readLog()).saved).toBe(0);
  await birds.getByRole('button',{name:'Record Special Victim rescued'}).click();
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'birds');
  await expect(birds.getByRole('status')).toContainText('1 of 2 rescued');
  await expect(page.getByText('Killer Health',{exact:true})).toHaveCount(0);
  expect(birdsState(summarizePlay(await readLog()).entries)).toMatchObject({rescued:1,required:2});
  await birds.screenshot({path:info.outputPath('birds-rescue.png'),animations:'disabled',style:'.app-footer {visibility:hidden}'});
});

test('Birds casting keeps the separate location and excludes the incompatible starting Event', async ({page,archive},info) => {
  archive.films=['s1-camp-happy-trails','s1-creech-manor','s1-terror-from-above'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button',{name:'START THE TAPE',exact:true}).click();
  async function choose(slot:number,name:RegExp) {
    await page.getByRole('button',{name:'Choose',exact:true}).nth(slot).click();
    await page.getByRole('dialog').getByRole('button',{name}).click();
  }
  await choose(0,/Poltergeist/);
  await choose(1,/Creech Manor/);
  await choose(2,/Melanie/);
  const startEvent=page.getByRole('combobox',{name:'Starting Event'});
  await startEvent.click();
  await page.getByRole('option',{name:'Ghost Hunters',exact:true}).click();
  await choose(0,/Birds/);
  await expect(startEvent).not.toContainText('Ghost Hunters');
  await startEvent.click();
  await expect(page.getByRole('option',{name:/Ghost Hunters/})).toBeDisabled();
  await page.getByRole('option',{name:'Helicopter Rescue',exact:true}).click();
  if (info.project.name === 'mobile') await page.setViewportSize({width:320,height:568});
  const difficulty=page.getByRole('combobox',{name:'Rescue difficulty'});
  await expect(difficulty).toHaveText('Normal · 2 Special Victims');
  expect(await difficulty.locator('span').evaluate(label => label.scrollWidth <= label.clientWidth)).toBe(true);
  await difficulty.press('Enter');
  const menu=page.getByRole('listbox');
  await expect(menu).toHaveClass(/themed-select-menu/);
  await expect(menu).toHaveClass(/casting-console-menu/);
  await expect(menu.getByRole('option')).toHaveText([
    'Easy · 1 Special Victim', 'Normal · 2 Special Victims', 'Hard · 3 Special Victims',
  ]);
  await expect(menu.getByRole('option',{name:'Normal · 2 Special Victims'})).toBeFocused();
  await page.screenshot({path:info.outputPath('birds-difficulty-menu.png'),animations:'disabled'});
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('option',{name:'Hard · 3 Special Victims'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(difficulty).toHaveText('Hard · 3 Special Victims');
  await page.getByText('Birds setup',{exact:true}).click();
  await expect(page.getByText(/Start with Horror 4 and Bloodlust at the bottom/)).toBeVisible();
  await page.getByRole('region',{name:'Scenario and playback'}).screenshot({path:info.outputPath('birds-casting.png'),animations:'disabled'});
  await page.getByRole('button',{name:'Press Play',exact:true}).click();
  await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).selection,key))
    .toMatchObject({killer:'Birds',location:'Creech Manor',finalGirl:'Melanie',birdsRequired:3,startingEvent:'Helicopter Rescue'});
});

test('an off-app win requires confirmation before archive writes and preserves unknown totals', async ({page,archive}) => {
  archive.autoImages=true;
  await archive.install(page,{draft:{...newDraft,playMode:false,selection:{...newDraft.selection,birdsRequired:undefined}}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await page.getByRole('button',{name:'WON',exact:true}).click();
  const dialog=page.getByRole('alertdialog',{name:'Review Terror From Above result'});
  await expect(dialog).toBeVisible();
  expect(archive.history).toHaveLength(0);
  const confirm=dialog.getByRole('button',{name:'Confirm result'});
  await expect(confirm).toBeDisabled();
  await dialog.getByRole('checkbox',{name:'All required Special Victims were rescued'}).check();
  await confirm.click();
  await expect(page.getByRole('checkbox',{name:'All required Special Victims were rescued'})).toBeChecked();
  await expect.poll(()=>archive.history[0]?.victims_saved).toBeNull();
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
  const expected={reason:'rescued',required:null,rescued:null};
  await expect.poll(()=>archive.generationRequests.find(r=>r.name==='generate-ending')?.body.birdsReview).toEqual(expected);
  await expect.poll(()=>archive.generationRequests.find(r=>r.name==='generate-scene-image' && r.body.sceneType==='ending')?.body.birdsReview).toEqual(expected);
});

test('the mission and rescue confirmations are independent and an overrun records a living loss', async ({page,archive}) => {
  await archive.install(page,{draft:{
    ...newDraft, falconwoodSetupVersion:1,
    selection:{...newDraft.selection,location:'Falconwood',mission:'Expose the Lab',birdsRequired:1},
  }});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Won',exact:true}).click();
  const rescue=page.getByRole('alertdialog',{name:'Review Terror From Above result'});
  await rescue.getByRole('checkbox').check();
  await rescue.getByRole('button',{name:'Confirm result'}).click();
  const mission=page.getByRole('alertdialog',{name:'Did you complete the mission?'});
  await expect(mission).toBeVisible();
  expect(archive.history).toHaveLength(0);
  await mission.getByRole('button',{name:'Back to Play'}).click();
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Lost',exact:true}).click();
  await statusPick(page,rescue.getByRole('combobox',{name:'Loss reason'}),'Board overrun · Final Girl alive');
  await rescue.getByRole('button',{name:'Confirm result'}).click();
  await expect(page.getByRole('heading',{name:'DEFEAT'})).toBeVisible();
  await expect(page.getByRole('combobox',{name:'Loss reason'})).toHaveText('Board overrun · Final Girl alive');
  await page.getByRole('button',{name:'Save record only'}).click();
  await expect.poll(()=>archive.history[0]?.outcome).toBe('lost');
  const state=birdsState(summarizePlay(archive.history[0].play_events as PlayEvent[]).entries);
  expect(state).toMatchObject({reviewReason:'overrun-alive',reviewRequired:1,reviewRescued:0});
});

test('Melanie’s dossier works against another killer', async ({page,archive},info) => {
  await archive.install(page,{draft:{...newDraft,selection:{...newDraft.selection,killer:'Hans',birdsRequired:undefined}}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await page.getByRole('button',{name:'View Melanie info',exact:true}).click();
  const dossier=page.getByRole('dialog');
  await dossier.locator('.girl-ability > summary').click();
  await expect(dossier.getByText('5 starting health')).toBeVisible();
  await expect(dossier.getByText(/Unlock after saving 6 Victims/)).toBeVisible();
  await expect(dossier.locator('.girl-rescue-rewards li')).toHaveCount(6);
  await expect(dossier.getByText(/Once per Action phase, you may lose 1 Health/)).toBeVisible();
  await dossier.screenshot({path:info.outputPath('melanie-dossier.png'),animations:'disabled'});
});

test('Bird Wall and every selected reveal render with their own artwork', async ({page,archive},info) => {
  await archive.install(page,{draft:newDraft});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'birds');
  const panel=page.locator('[data-module="birds"]');
  await panel.getByRole('button',{name:'Ultimate unlocked',exact:true}).click();
  await expect(panel.getByRole('status')).toHaveText('0 of 2 rescued');
  await openMinorPowers(panel);
  await panel.getByRole('button',{name:'Record Bird Wall revealed'}).click();
  for (let count=0;count<5;count++) await panel.getByRole('button',{name:'Mark Bird killed'}).click();
  await expect(panel.locator('.birds-wall-status')).toHaveText('Removed · 5 tokens');
  await panel.getByRole('button',{name:'Undo Bird Wall observation'}).click();
  await expect(panel.locator('.birds-wall-status')).toHaveText('4/5 Bird tokens');
  await panel.getByText('Dark Power & Finale',{exact:true}).click();
  const powers=['Run for Your Life!','Birdnado','They’re Just Waiting to Strike'];
  const finales=['Insurmountable Odds','Endless Swarm','Fowl Agression'];
  const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
  for (const [index,power] of powers.entries()) {
    if (index) {
      await panel.getByRole('button',{name:'Clear Dark Power card name'}).click();
      await panel.getByRole('button',{name:'Clear Finale card name'}).click();
    }
    await panel.getByRole('button',{name:`Choose ${power}`,exact:true}).click();
    await panel.getByRole('button',{name:`Choose ${finales[index]}`,exact:true}).click();
    const heroes=panel.locator('.module-revealed-hero');
    await expect(heroes).toHaveCount(2);
    for(const [width,height] of sizes) {
      await page.setViewportSize({width,height});
      const loaded=await panel.locator('img').evaluateAll(async list=>Promise.all(list.map(async node=>{
        const image=node as HTMLImageElement;
        image.loading='eager';
        await image.decode();
        return image.naturalWidth;
      })));
      expect(loaded.every(width=>width>=1040)).toBe(true);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await panel.screenshot({path:info.outputPath(`birds-art-${index}-${width}.jpg`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
    }
  }
  await page.getByRole('button',{name:'Dark Power',exact:true}).click();
  await expect(page.locator('.play-moment-editor')).toContainText('They’re Just Waiting to Strike');
  const logs=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents as PlayEvent[],key);
  expect(logs.filter(e=>e.kind==='moment'&&e.momentType==='dark-power')).toHaveLength(1);
  expect(logs.filter(e=>e.kind==='moment'&&e.momentType==='finale')).toHaveLength(1);
});
