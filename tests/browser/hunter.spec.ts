import {test,expect,activeGame} from './fixtures';
import {openModule} from './play-helpers';
test('Hunter natural progression, repair and five-viewport controls',async({page,archive},info)=>{
 await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,hunterSetupVersion:1,selection:{...activeGame.selection,killer:'The Hunter',location:'Maple Lane',finalGirl:'Ginny'},playEvents:[]}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
 await openModule(page,'hunter');const panel=page.locator('[data-module="hunter"]');
 await panel.getByRole('spinbutton',{name:'Damage to Cybernetic Parts'}).fill('6');await panel.getByRole('button',{name:'Apply part damage',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Remove next Countdown token · 2 remaining'})).toBeVisible();
 const shutdownLogLength=(await readLog(page)).length;await expect(page.getByRole('button',{name:'Dark Power',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Dark Power',exact:true}).click();expect((await readLog(page)).length).toBe(shutdownLogLength);await page.locator('.play-moment-editor').getByRole('button',{name:'Record',exact:true}).click();
 await panel.getByRole('button',{name:'Retrieve Part 1 · 1 Time'}).click();await panel.getByRole('button',{name:'Install Part 1',exact:true}).click();
 await panel.getByRole('spinbutton',{name:'Part printed Health'}).fill('3');await panel.getByRole('button',{name:'Repair Mark V',exact:true}).click();
 await expect(panel.getByRole('region',{name:'Mark V Ally actions'})).toBeVisible();
 await panel.getByRole('button',{name:'Attack · 2 damage Ready',exact:true}).click();
 for(const [width,height] of [[1280,640],[1366,768],[1440,900],[390,844],[320,568]]) {
 await page.setViewportSize({width,height});await panel.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(img=>{(img as HTMLImageElement).loading='eager';return (img as HTMLImageElement).decode();})));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await panel.screenshot({path:info.outputPath(`hunter-pilot-${width}.jpg`),type:'jpeg',quality:85,animations:'disabled',style:'.app-footer{visibility:hidden}'});
 }
 await panel.getByRole('button',{name:'Remove next Countdown token · 2 remaining'}).click();
 await panel.getByRole('button',{name:'Remove next Countdown token · 1 remaining'}).click();
 await expect(panel.getByRole('article',{name:'Mark X',exact:true})).toContainText('Active Killer');
 const naturalLog=await readLog(page);expect(validPlayLog(naturalLog)).toBe(true);expect(summarizePlay(naturalLog)).toMatchObject({bloodlust:2,killerHealth:15});expect(hunterState(moduleState(summarizePlay(naturalLog).entries,'hunter')).forced).toBe(false);
});

import {userId} from './fixtures';
import {chooseKillerCard,undoLatestObservation} from './play-helpers';
import {newPlayEvent,summarizePlay,validPlayLog,type PlayEvent} from '../../src/lib/play/events';
import {hunterState} from '../../src/lib/play/hunter';
import {moduleState} from '../../src/lib/play/modules';
const storageKey=`final-girl-active-game-v1:${userId}`;
const readLog=(page:import('@playwright/test').Page):Promise<PlayEvent[]>=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,storageKey);

test('Hunter forced transition, failed-write retry, both reveal entry points, Ally cooldowns, reload, death and ending',async({page,archive},info)=>{
 test.setTimeout(90000);page.setDefaultTimeout(10000);archive.aiCastingArt=true;archive.autoImages=true;
 await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,hunterSetupVersion:1,selection:{...activeGame.selection,killer:'The Hunter',location:'Maple Lane',finalGirl:'Ginny'},playEvents:[]}});
 await page.route('https://example.test/poster.png',route=>route.fulfill({contentType:'image/png',path:'src/assets/scrapbooks/final-girl-cover.png'}));
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'hunter');
 const panel=page.locator('[data-module="hunter"]');
 await expect(page.getByRole('group',{name:'Killer Health tracker'})).toContainText('Mark V · Parts');
 const initial=(await readLog(page)).length;
 await panel.locator('summary').first().click();await panel.locator('summary').first().click();expect((await readLog(page)).length).toBe(initial);
 await page.evaluate(()=>{const prior=Storage.prototype.setItem;Object.assign(window,{restoreHunterStorage:()=>{Storage.prototype.setItem=prior;}});Storage.prototype.setItem=function(k,v){if(k.startsWith('final-girl-active-game-v1:'))throw Error('test write failure');prior.call(this,k,v);};});
 await panel.getByRole('button',{name:'Apply part damage',exact:true}).click();await expect(panel.getByRole('alert')).toContainText('could not be saved');
 expect((await readLog(page)).length).toBe(initial);
 await page.evaluate(()=>(window as unknown as {restoreHunterStorage:()=>void}).restoreHunterStorage());
 await panel.getByRole('spinbutton',{name:'Damage to Cybernetic Parts'}).fill('2');await panel.getByRole('button',{name:'Apply part damage',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Retrieve Part 1 · 1 Time'})).toBeVisible();
 await panel.locator('details.module-card-section > summary').click();await chooseKillerCard(panel,'Dark Power','Cybernetic Agility');
 await page.getByRole('button',{name:'Dark Power',exact:true}).click();
 await expect(page.locator('.play-moment-editor').getByRole('region',{name:'Dark Power selection',exact:true})).toContainText('Cybernetic Agility');
 await page.locator('.play-moment-editor').getByRole('button',{name:'Record',exact:true}).click();
 await panel.locator('.hunter-forced > summary').click();await panel.getByRole('button',{name:'Resolve Hunter Mark X',exact:true}).click();
 await expect(panel.getByRole('article',{name:'Mark X',exact:true})).toContainText('Active Killer');
 let log=await readLog(page);expect(summarizePlay(log)).toMatchObject({bloodlust:10,killerHealth:15,killed:0});
 const beforeFinaleView=(await readLog(page)).length;await page.getByRole('button',{name:'Finale',exact:true}).click();expect((await readLog(page)).length).toBe(beforeFinaleView);await page.locator('.play-moment-editor').getByRole('button',{name:'Record',exact:true}).click();
 await undoLatestObservation(page);await expect(panel.getByRole('article',{name:'Mark V',exact:true})).toContainText('Active Killer');
 await panel.locator('.hunter-forced > summary').click();
 await panel.getByRole('button',{name:'Resolve Hunter Mark X',exact:true}).click();
 await panel.getByRole('button',{name:'Retrieve Part 1 · 1 Time'}).click();await panel.getByRole('button',{name:'Install Part 1',exact:true}).click();await panel.getByRole('spinbutton',{name:'Part printed Health'}).fill('3');await panel.getByRole('button',{name:'Repair Mark V',exact:true}).click();
 await panel.getByRole('button',{name:'Attack · 2 damage Ready',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Attack · 2 damage 2 Upkeeps remaining',exact:true})).toBeDisabled();
 await panel.getByRole('button',{name:'Ally Upkeep · advance cooldowns',exact:true}).click();await panel.getByRole('button',{name:'Ally Upkeep · advance cooldowns',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Attack · 2 damage Ready',exact:true})).toBeEnabled();
 await chooseKillerCard(panel,'Finale','Adaptive A.I.');
 await panel.getByRole('button',{name:'Reveal Titanium Shield',exact:true}).click();
 for(let i=0;i<4;i++)await panel.getByRole('button',{name:'Remove one Titanium Shield health, heart 1',exact:true}).click();
 await expect(panel.getByRole('article',{name:'Titanium Shield',exact:true})).toContainText('Removed · 0/4 health');
 await panel.getByRole('button',{name:'Add another Minor Power',exact:true}).click();await panel.getByRole('button',{name:'Reveal Advanced A.I.',exact:true}).click();
 archive.failWrites=true;
 await panel.getByRole('button',{name:'Counter-Measures Not recorded in play',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
 await panel.locator('details.module-card-section > summary').click();
 await expect(panel.getByRole('article',{name:'Mark V',exact:true})).toContainText('Ally');
 await expect(panel.getByRole('button',{name:'Counter-Measures In play',exact:true})).toHaveAttribute('aria-pressed','true');
 archive.failWrites=false;await page.evaluate(()=>window.dispatchEvent(new Event('online')));
 await expect.poll(()=>archive.sessions.find(row=>row.id===activeGame.id)?.state.playEvents).toEqual(await readLog(page));
 log=await readLog(page);expect(validPlayLog(log)).toBe(true);expect(hunterState(moduleState(summarizePlay(log).entries,'hunter'))).toMatchObject({phase:'mark-x',ally:'alive',allyHealth:3});
 for(const [width,height] of info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]]) {
 await page.setViewportSize({width,height});await panel.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(img=>{(img as HTMLImageElement).loading='eager';return (img as HTMLImageElement).decode();})));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const clipped=await panel.locator('button:visible,input:visible').evaluateAll(nodes=>nodes.filter(n=>{const b=n.getBoundingClientRect(),p=n.closest('.play-module-content')!.getBoundingClientRect();return b.left<p.left-1||b.right>p.right+1;}).map(n=>n.textContent));expect(clipped).toEqual([]);
 await panel.screenshot({path:info.outputPath(`hunter-finished-${width}.jpg`),type:'jpeg',quality:87,animations:'disabled',style:'.app-footer{visibility:hidden}'});
 }
 await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();const death=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
 await death.getByRole('button',{name:'Killer attack',exact:true}).click();await death.getByRole('button',{name:'Gruesome Death',exact:true}).click();await expect(death.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
 await death.getByRole('button',{name:'Save and exit',exact:true}).click();await page.getByRole('button',{name:'Latest death scene',exact:true}).click();await expect(death.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);expect(archive.calls.filter(n=>n==='generate-death-scene')).toHaveLength(1);
 await death.getByRole('button',{name:'Narrate death scene',exact:true}).click();await expect.poll(()=>archive.calls.includes('narrate-story')).toBe(true);await death.getByRole('button',{name:'Save and exit',exact:true}).click();
 await page.getByRole('button',{name:'Finish game',exact:true}).click();await page.getByRole('button',{name:'Won',exact:true}).click();
 await expect(page.getByRole('region',{name:'Hunter ending review'})).toContainText('Mark X active');
 await page.getByRole('button',{name:'Generate ending',exact:true}).click();await expect(page.getByRole('region',{name:'Ending narration',exact:true})).toContainText(archive.endingText);
 expect(archive.generationRequests.find(r=>r.name==='generate-ending')?.body.hunterReview).toMatchObject({phase:'mark-x',ally:'alive',allyHealth:3});
 await expect.poll(()=>archive.generationRequests.find(r=>r.name==='generate-scene-image'&&r.body.sceneType==='ending')?.body.hunterReview).toMatchObject({phase:'mark-x',ally:'alive'});
 await expect.poll(()=>Boolean(archive.releaseImage)).toBe(true);archive.releaseImage!();await expect(page.getByRole('img',{name:'Movie poster',exact:true})).toBeVisible();
});

test('legacy Hunter stays unrecorded through expansion; Rules search finds printed timing',async({page,archive})=>{
 const old=[newPlayEvent({kind:'start',round:3,saved:2,killed:1}),newPlayEvent({kind:'state',field:'killerHealth',value:9})];
 archive.films=['s3-killer-from-tomorrow'];await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,selection:{...activeGame.selection,killer:'The Hunter',location:'Camp Happy Trails'},playEvents:old}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'hunter');
 const panel=page.locator('[data-module="hunter"]');await expect(panel.getByRole('article',{name:'Mark V',exact:true})).toContainText('Unrecorded');expect(await readLog(page)).toHaveLength(2);
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();expect(await readLog(page)).toHaveLength(2);
 await panel.locator('.hunter-recovery > summary').filter({hasText:'Record current Hunter state'}).click();
 await panel.getByRole('combobox',{name:'Current Hunter model',exact:true}).click();await page.getByRole('option',{name:'Mark X',exact:true}).click();
 await panel.getByRole('button',{name:'Record observed state',exact:true}).click();
 expect(summarizePlay(await readLog(page)).killerHealth).toBe(9);
 await panel.locator('summary').filter({hasText:'Record existing Parts'}).click();await panel.getByRole('button',{name:'Record carried Part',exact:true}).click();
 await panel.getByRole('button',{name:'Install Part 1',exact:true}).click();await panel.getByRole('spinbutton',{name:'Part printed Health'}).fill('2');await panel.getByRole('button',{name:'Repair Mark V',exact:true}).click();
 await expect(panel.getByRole('article',{name:'Mark V',exact:true})).toContainText('Ally');
 await panel.locator('summary').filter({hasText:'Record observed Ally cooldowns'}).click();await panel.getByRole('combobox',{name:'Record attack cooldown',exact:true}).click();await page.getByRole('option',{name:'Ready',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Attack · 2 damage Ready',exact:true})).toBeEnabled();
 expect(summarizePlay(await readLog(page))).toMatchObject({killerHealth:9,killed:1,saved:2});
});

for(const [location,id] of [['Buddyland','buddyland'],['Camp Happy Trails','camp'],['Maple Lane','maple'],['Carnival of Blood','carnival'],['Sacred Groves','groves'],['Creech Manor','creech'],['USS Konrad','konrad'],['Shady Acres','shady-acres'],['Marrek Warehouse','marrek'],['Storybook Woods','storybook-woods'],['Wingard Cottage','wingard-cottage'],['Sunnydaze Mall',null]] as const){
 test(`Hunter ownership and Part damage at ${location}`,async({page,archive})=>{
 await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,hunterSetupVersion:1,selection:{...activeGame.selection,killer:'The Hunter',location,startingEvent:null},playEvents:[]}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'hunter');
 if(id)await expect(page.locator(`[data-module="${id}"]`)).toHaveCount(1);
 await page.locator('[data-module="hunter"]').getByRole('spinbutton',{name:'Damage to Cybernetic Parts'}).fill('2');await page.getByRole('button',{name:'Apply part damage',exact:true}).click();
 const log=await readLog(page);expect(validPlayLog(log)).toBe(true);expect(hunterState(moduleState(summarizePlay(log).entries,'hunter')).remaining).toBe(2);expect(summarizePlay(log)).toMatchObject({saved:0,killed:0});
 });
}

import {HUNTER_POWERS,HUNTER_FINALES} from '../../src/lib/play/hunter';
test('every Hunter named photo loads at real card sizes, with stable model order and crops',async({page,archive},info)=>{
 test.setTimeout(90000);page.setDefaultTimeout(10000);
 await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,hunterSetupVersion:1,selection:{...activeGame.selection,killer:'The Hunter',location:'Maple Lane',finalGirl:'Ginny'},playEvents:[]}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'hunter');const panel=page.locator('[data-module="hunter"]');
 const capture=async(id:string,subject:import('@playwright/test').Locator)=>{
 for(const [width,height] of info.project.name==='desktop'?[[1366,768]]:[[390,844],[320,568]]){
 await page.setViewportSize({width,height});await subject.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(img=>{(img as HTMLImageElement).loading='eager';return (img as HTMLImageElement).decode();})));
 await subject.screenshot({path:info.outputPath(`hunter-${id}-${width}.jpg`),type:'jpeg',quality:85,animations:'disabled',style:'.app-footer{visibility:hidden}'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }};
 await capture('header',panel.locator(':scope > summary'));await capture('fresh-models',panel.locator('.hunter-models'));
 await panel.locator('details.module-card-section > summary').click();await capture('unselected',panel.locator('details.module-card-section'));
 for(const [type,cards] of [['Dark Power',HUNTER_POWERS],['Finale',HUNTER_FINALES]] as const){for(const card of cards){await chooseKillerCard(panel,type,card.name);await capture(card.id,panel.getByRole('region',{name:`${type} selection`,exact:true}));}}
 await panel.getByRole('button',{name:'Reveal Titanium Shield',exact:true}).click();await capture('titanium-shield',panel.getByRole('article',{name:'Titanium Shield',exact:true}));
 await panel.getByRole('button',{name:'Add another Minor Power',exact:true}).click();await panel.getByRole('button',{name:'Reveal Advanced A.I.',exact:true}).click();await capture('advanced-ai',panel.getByRole('article',{name:'Advanced A.I.',exact:true}));
 await panel.getByRole('button',{name:'Counter-Measures Not recorded in play',exact:true}).click();await panel.getByRole('button',{name:'Shock & Awe Not recorded in play',exact:true}).click();await capture('ongoing',panel.locator('.hunter-effects'));
 // Finale/card observations do not resolve the lifecycle on the physical board.
 await panel.getByRole('spinbutton',{name:'Damage to Cybernetic Parts'}).fill('6');await panel.getByRole('button',{name:'Apply part damage',exact:true}).click();await capture('shutdown-models',panel.locator('.hunter-models'));
 await panel.getByRole('button',{name:'Retrieve Part 1 · 1 Time'}).click();await panel.getByRole('button',{name:'Install Part 1',exact:true}).click();await panel.getByRole('spinbutton',{name:'Part printed Health'}).fill('1');await panel.getByRole('button',{name:'Repair Mark V',exact:true}).click();await capture('ally-models',panel.locator('.hunter-models'));
 await panel.getByRole('button',{name:'Decrease Mark V Ally Health',exact:true}).click();await capture('destroyed-models',panel.locator('.hunter-models'));
 await expect(panel.locator('.hunter-model h3')).toHaveText(['Mark V','Mark X']);
});

test('Hunter Rules search exposes the separate natural countdown and forced Terror',async({page,archive})=>{
 archive.films=['s3-killer-from-tomorrow'];await archive.install(page);await page.goto('/');await page.getByRole('button',{name:'Rules',exact:true}).click();await page.getByRole('textbox',{name:'Search rules',exact:true}).fill('Cybernetic');await page.getByRole('tab',{name:'Special Rules',exact:true}).click();
 const rules=page.locator('#killer-the-hunter-rules');await expect(rules).toContainText('This natural arrival does not reveal the Finale');await expect(rules).toContainText('3 damage');await expect(rules).toContainText('permanently destroyed');
});
