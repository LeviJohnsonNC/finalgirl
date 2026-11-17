import {activeGame,expect,test,userId} from './fixtures';
import {openModule,searchPick,undoLatestObservation} from './play-helpers';
import {summarizePlay,validPlayLog,type PlayEvent} from '../../src/lib/play/events';
import {moduleState} from '../../src/lib/play/modules';

const key=`final-girl-active-game-v1:${userId}`;
const selection={...activeGame.selection,killer:'Ratchet Lady',location:'Wolfe Asylum',finalGirl:'Heather',startingEvent:'Hospital Gurney'};
test('Wolfe pills and gurney share the durable play log',async ({page,archive},info)=>{
  await archive.install(page,{draft:{...activeGame,selection,playMode:true,coreTrackersVersion:1,ratchetSetupVersion:1,wolfeSetupVersion:1,playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'wolfe');
  const panel=page.locator('.play-module-panel[data-module="wolfe"]');
  await expect(panel.getByText('Starting pill unrecorded',{exact:true}).last()).toBeVisible();
  await panel.getByRole('button',{name:'Yellow',exact:true}).click();
  await panel.getByRole('button',{name:'Record blue pill pickup'}).click();
  await panel.getByRole('button',{name:'Record wild pill pickup'}).click();
  await panel.getByRole('button',{name:'Record an event'}).click();
  await panel.getByRole('button',{name:/Powerful Meds/}).click();
  await panel.getByRole('button',{name:'Spend pills'}).click();
  await panel.getByRole('button',{name:'Draw an Amped card'}).click();
  await expect(panel.getByText('Draw an Amped card · 4 Side Effects')).toBeVisible();
  await panel.getByRole('button',{name:'Spend Wild as Pink'}).click();
  await expect(panel.getByLabel('Wild held pills')).toHaveText('0');
  await panel.getByRole('button',{name:'Resistance',exact:true}).click();
  await panel.getByRole('button',{name:/Hospital Gurney/}).click();
  await panel.getByRole('combobox',{name:'Gurney riders'}).click();
  await page.getByRole('option',{name:'2 riders'}).click();
  await expect(panel.getByText('3 damage to the Enemy · 2 riders die')).toBeVisible();

  const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
  for(const [width,height] of sizes){
    await page.setViewportSize({width,height});
    await panel.locator('img').evaluateAll(images=>Promise.all(images.map(img=>(img as HTMLImageElement).decode())));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await panel.screenshot({path:info.outputPath(`wolfe-${width}.jpg`),style:'.app-footer{visibility:hidden}'});
  }

  await page.evaluate(()=>{
    const write=Storage.prototype.setItem;
    Object.assign(window,{restoreWolfeStorage:()=>{Storage.prototype.setItem=write;}});
    Storage.prototype.setItem=function(name,data){
      if(name.startsWith('final-girl-active-game-v1:'))throw Error('Interrupted save');
      write.call(this,name,data);
    };
  });
  await panel.getByRole('button',{name:'Confirm ram'}).click();
  await expect(panel.getByRole('status').last()).toContainText('could not be saved');
  await expect(panel.getByText('3 damage to the Enemy · 2 riders die')).toBeVisible();
  await page.evaluate(()=>(window as unknown as {restoreWolfeStorage:()=>void}).restoreWolfeStorage());
  await panel.getByRole('button',{name:'Confirm ram'}).click();
  await expect(page.getByRole('dialog',{name:'Gruesome Death'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Add one victim to this death'})).toBeDisabled();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await panel.getByRole('button',{name:'Open Gruesome Death'}).click();
  await expect(page.getByLabel('Victim count')).toHaveText('2');
  const death=page.getByRole('dialog',{name:'Gruesome Death'});
  await death.screenshot({path:info.outputPath('wolfe-gurney-death.jpg')});
  await searchPick(page,'Death location','Common Room');
  await death.getByRole('button',{name:'Gruesome Death',exact:true}).click();
  await expect(death.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await death.getByRole('button',{name:'Narrate death scene',exact:true}).click();
  await expect.poll(()=>archive.calls.filter(name=>name==='narrate-story').length).toBe(1);
  await death.getByRole('button',{name:'Save and exit',exact:true}).click();
  await panel.getByRole('button',{name:'Open Gruesome Death'}).click();
  await expect(death.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  expect(archive.calls.filter(name=>name==='generate-death-scene')).toHaveLength(1);
  await death.getByRole('button',{name:'Save and exit',exact:true}).click();
  let log:PlayEvent[]=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,key);
  expect(validPlayLog(log)).toBe(true);
  expect(summarizePlay(log).killed).toBe(2);
  await undoLatestObservation(page);
  log=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,key);
  expect(summarizePlay(log).killed).toBe(0);
  expect(moduleState(summarizePlay(log).entries,'wolfe').gurney).toBe(2);
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'wolfe');
  await expect(panel.getByText('2 riders',{exact:true})).toBeVisible();
  await expect(panel.getByRole('button',{name:'Resistance'})).toBeVisible();
});

test('resumed Wolfe with a different killer keeps holdings unknown',async({page,archive})=>{
  await archive.install(page,{draft:{...activeGame,selection:{...selection,killer:'Hans'},playMode:true,playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'wolfe');
  const panel=page.locator('.play-module-panel[data-module="wolfe"]');
  await expect(panel.getByText('Held pills unrecorded',{exact:true}).last()).toBeVisible();
  await panel.getByRole('button',{name:'Record held pills'}).click();
  await panel.getByRole('button',{name:'Save held pills'}).click();
  await expect(panel.getByRole('button',{name:'Spend pills'})).toBeDisabled();
});

test('Wolfe photographs and mixed-killer controls render together',async({page,archive},info)=>{
  await archive.install(page,{draft:{...activeGame,selection:{...selection,killer:'The Intruders',startingEvent:'Dr. Sunshine'},playMode:true,wolfeSetupVersion:1,playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'wolfe');
  const panel=page.locator('.play-module-panel[data-module="wolfe"]');
  await panel.getByRole('button',{name:'Wild',exact:true}).click();
  await panel.getByRole('button',{name:'Record an event'}).click();
  for(const name of ['Hannibal the Cannibal','Dr. Death'])
    await panel.getByRole('button',{name:'Add '+name,exact:true}).click();
  for(const name of ['Scratching and Biting','Medical Stockpile','Powerful Meds','Welcome to the Madhouse'])
    await panel.getByRole('button',{name:new RegExp(name)}).click();
  for(const name of ['Rapid Healing','Extreme Agility','Final Girl 2.0','Rabid Fury','Resistance']){
    await panel.getByRole('button',{name:/^Record (another )?Amped$/}).click();
    await panel.getByRole('button',{name,exact:true}).click();
  }
  await panel.getByRole('button',{name:/^Final Girl 2.0/}).click();
  await panel.getByRole('combobox',{name:'Second Ultimate'}).click();
  await page.getByRole('option',{name:'Veronica',exact:true}).click();
  await expect(panel.getByText('Veronica’s Ultimate',{exact:true})).toBeVisible();
  await panel.getByRole('button',{name:'Stunned',exact:true}).click();
  await panel.getByRole('combobox',{name:'Stunned Enemy'}).click();
  await page.getByRole('option',{name:'Baghead',exact:true}).click();
  await panel.getByRole('button',{name:'Record Stunned'}).click();
  await expect(panel.getByText('Baghead · 1',{exact:true})).toBeVisible();
  await panel.getByRole('button',{name:'Mark Dr. Death saved',exact:true}).click();
  await expect(panel.locator('.module-character').filter({hasText:'Dr. Death'}).locator('img')).toHaveAttribute('src',/dr-death-saved/);
  await panel.getByRole('button',{name:'Mark Dr. Death killed',exact:true}).click();
  await expect(panel.locator('.module-character').filter({hasText:'Dr. Death'}).locator('img')).toHaveAttribute('src',/dr-death-killed/);
  await panel.getByRole('button',{name:'Clear at Upkeep'}).click();
  await expect(panel.getByText('Baghead · 1',{exact:true})).toHaveCount(0);

  const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
  for(const [width,height] of sizes){
    await page.setViewportSize({width,height});
    await panel.locator('img').evaluateAll(images=>Promise.all(images.map(img=>(img as HTMLImageElement).decode())));
    const clipped=await panel.locator('.wolfe-controls').evaluate(el=>el.scrollWidth>el.clientWidth+1);
    expect(clipped).toBe(false);
    await panel.screenshot({path:info.outputPath(`wolfe-populated-${width}.jpg`),style:'.app-footer{visibility:hidden}'});
  }
});
