import { test,expect,activeGame,userId } from './fixtures';
import { openModule, undoLatestObservation } from './play-helpers';
const key=`final-girl-active-game-v1:${userId}`;
const draft={...activeGame,creechSetupVersion:1,poltergeistSetupVersion:1,playMode:true,selection:{...activeGame.selection,location:'Creech Manor',killer:'Poltergeist',filmId:'s1-creech-manor'}};
async function settled(page:import('@playwright/test').Page){await page.locator('img').evaluateAll(async nodes=>{await Promise.all(nodes.map(async node=>{const img=node as HTMLImageElement;img.loading='eager';await img.decode().catch(()=>{});}));});}
test('hunter group and reported Bloodlust save together, undo and reload',async({page,archive},info)=>{
 await archive.install(page,{draft});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'creech');
 const panel=page.locator('[data-module="creech"]');
 await panel.getByRole('button',{name:'View Ghost Hunters',exact:true}).click();
 await panel.getByRole('button',{name:'Record participating hunters',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Mark Orange Ghost Hunter killed',exact:true})).toHaveCount(0);
 await panel.getByRole('button',{name:'View Orange Ghost Hunter',exact:true}).click();
 await panel.getByText('Bloodlust with death (optional)',{exact:true}).click();
 await panel.getByLabel('Observed final Bloodlust',{exact:true}).fill('4');
 await panel.getByRole('button',{name:'Mark Orange Ghost Hunter killed',exact:true}).click();
 await expect(panel.getByRole('button',{name:'View Ghost Hunters',exact:true})).toContainText('Survivors can follow');
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents.filter((e:{creechAction?:{kind:string}})=>e.creechAction?.kind==='hunter').length,key)).toBe(1);
 await undoLatestObservation(page);await expect(panel.getByRole('button',{name:'View Orange Ghost Hunter',exact:true})).toContainText('In play');await expect(panel.getByRole('button',{name:'View Ghost Hunters',exact:true})).toContainText('Will not follow yet');
 await panel.getByRole('button',{name:'View Orange Ghost Hunter',exact:true}).click();await panel.getByText('Bloodlust with death (optional)',{exact:true}).click();await panel.getByLabel('Observed final Bloodlust',{exact:true}).fill('4');await panel.getByRole('button',{name:'Mark Orange Ghost Hunter killed',exact:true}).click();
 for(const size of info.project.name==='mobile'?[{width:390,height:844},{width:320,height:568}]:[{width:1280,height:640},{width:1366,height:768},{width:1440,height:900}]){await page.setViewportSize(size);await settled(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await panel.screenshot({path:info.outputPath(`hunters-${size.width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});}
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'creech');await expect(panel.getByRole('button',{name:'View Orange Ghost Hunter',exact:true})).toContainText('Killed');
});
test('helicopter rescue is atomic with Carolyn and survives reload',async({page,archive},info)=>{
 await archive.install(page,{draft});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'poltergeist');
 const killer=page.locator('[data-module="poltergeist"]');await killer.getByRole('button',{name:'View Carolyn actions'}).click();await killer.getByRole('button',{name:'Carolyn joins you',exact:true}).click();
 await openModule(page,'creech');const panel=page.locator('[data-module="creech"]');await panel.getByRole('button',{name:'View Helicopter Rescue',exact:true}).click();await panel.getByRole('button',{name:'View Helicopter Rescue',exact:true}).click();
 await panel.getByLabel('Ordinary passengers saved',{exact:true}).fill('2');await panel.getByRole('checkbox',{name:'Carolyn rescued with you',exact:true}).check();await panel.getByRole('checkbox',{name:'I resolved this helicopter use on the physical board',exact:true}).check();
 await settled(page);await panel.screenshot({path:info.outputPath('helicopter-preview.png'),animations:'disabled',style:'.app-footer{visibility:hidden}'});
 await panel.getByRole('button',{name:'Record helicopter use',exact:true}).click();await expect(killer.getByRole('button',{name:'View Carolyn actions'})).toContainText('Rescued');await expect(panel.getByRole('button',{name:'View Helicopter Rescue',exact:true})).toContainText('Used');
 const last=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents.at(-1),key);expect(last).toMatchObject({moduleData:{module:'creech',changes:{'helicopter.used':true,'helicopter.victims':2}},linkedModule:{module:'poltergeist',changes:{carolyn:'rescued'}}});
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'creech');await expect(panel.getByRole('button',{name:'View Helicopter Rescue',exact:true})).toContainText('Used');
});
for(const killer of ['Poltergeist','Hans','Billy the Bear','Geppetto','Dr. Fright','Inkanyamba','The Organism'])test(`Creech controls preserve independent ownership with ${killer}`,async({page,archive},info)=>{
 await archive.install(page,{draft:{...draft,selection:{...draft.selection,killer}}});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'creech');const panel=page.locator('[data-module="creech"]');
 await panel.getByRole('button',{name:/^External ladder/}).click();await expect(panel.getByRole('button',{name:/^External ladder/})).toContainText('broken');
 await panel.getByRole('button',{name:'Cycle Rope Ladder',exact:true}).click();await panel.getByRole('button',{name:'Cycle Rope Ladder',exact:true}).click();await expect(panel.getByRole('button',{name:'Cycle Rope Ladder',exact:true})).toContainText('Upper-right Window ↔ right outside Exit');
 await panel.getByRole('button',{name:'Activate Frozen in Fear',exact:true}).click();await expect(panel.getByRole('button',{name:'End effect: Frozen in Fear',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(panel.getByRole('region',{name:'Temporary restriction',exact:true})).toHaveCount(0);await expect(panel.getByText('Windows & doors',{exact:true})).toHaveCount(0);
 await settled(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await panel.screenshot({path:info.outputPath('combined.png'),animations:'disabled',style:'.app-footer{visibility:hidden}'});expect(archive.calls).toEqual([]);
});
test('Creech Rules are searchable with five real setups and complete card catalogs',async({page,archive})=>{
 archive.films=['s1-creech-manor'];await archive.install(page);await page.goto('/');await page.getByRole('button',{name:'Rules',exact:true}).click();await page.getByRole('textbox',{name:'Search rules'}).fill('Rope Ladder');await page.getByRole('tab',{name:'Special Rules',exact:true}).click();await expect(page.locator('#location-creech-manor-rules')).toContainText('18 cards');await expect(page.locator('#location-creech-manor-rules')).toContainText('not an Exit');
});
test('reviewed helicopter route reaches the ending request',async({page,archive})=>{
 await archive.install(page,{draft});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'poltergeist');const p=page.locator('[data-module="poltergeist"]');await p.getByRole('button',{name:'View Carolyn actions'}).click();await p.getByRole('button',{name:'Carolyn joins you',exact:true}).click();await openModule(page,'creech');const c=page.locator('[data-module="creech"]');await c.getByRole('button',{name:'View Helicopter Rescue',exact:true}).click();await c.getByRole('button',{name:'View Helicopter Rescue',exact:true}).click();await c.getByRole('checkbox',{name:'Carolyn rescued with you',exact:true}).check();await c.getByRole('checkbox',{name:'I resolved this helicopter use on the physical board',exact:true}).check();await c.getByRole('button',{name:'Record helicopter use',exact:true}).click();await page.getByRole('button',{name:'Finish game',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Won',exact:true}).click();await expect(page.getByLabel('Carolyn rescue route',{exact:true})).toHaveValue('helicopter');await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByText(archive.endingText,{exact:true})).toBeVisible();expect(archive.generationRequests.find(r=>r.name==='generate-ending')!.body).toMatchObject({poltergeistReview:{carolynRescued:true,escapeRoute:'helicopter'}});
});

test('Rope Ladder cycles directly with Undo, retry and no editor; Poltergeist trackers fit their content',async({page,archive},info)=>{
 await archive.install(page,{draft});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
 const trackers=page.getByRole('region',{name:'Game trackers',exact:true});
 await expect(trackers.locator('.play-state')).toHaveCount(3);
 if(info.project.name==='desktop'){
  const bounds=await trackers.boundingBox();const last=await trackers.locator('.play-state').last().boundingBox();
  expect(bounds!.x+bounds!.width-(last!.x+last!.width)).toBeLessThan(30);
 }
 await openModule(page,'creech');const panel=page.locator('[data-module="creech"]');const rope=panel.getByRole('button',{name:'Cycle Rope Ladder',exact:true});
 await expect(panel.getByText('Place or correct Rope Ladder',{exact:true})).toHaveCount(0);
 await expect(panel.getByRole('button',{name:'Use Rope Ladder to repair external ladder',exact:true})).toHaveCount(0);
 for(const label of ['Upper-left room ↔ left washroom','Upper-right Window ↔ right outside Exit','Lower-right Window ↔ right outside Exit','Not placed']){await rope.click();await expect(rope).toContainText(label);}
 await undoLatestObservation(page);await expect(rope).toContainText('Lower-right Window');
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('final-girl-active-game-v1:'))throw new Error('synthetic quota');return original.call(this,k,v);};});
 await rope.click();await expect(panel.getByRole('alert')).toContainText('could not be saved');await expect(rope).toContainText('Lower-right Window');
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'creech');await rope.click();await expect(rope).toContainText('Not placed');
 await expect(panel.getByText('Windows & doors',{exact:true})).toHaveCount(0);
 for(const size of info.project.name==='mobile'?[{width:390,height:844},{width:320,height:568}]:[{width:1280,height:640},{width:1366,height:768},{width:1440,height:900}]){
  await page.setViewportSize(size);await settled(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await trackers.screenshot({path:info.outputPath(`trackers-${size.width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
  await page.locator('[data-module="poltergeist"] > summary').screenshot({path:info.outputPath(`polter-banner-${size.width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
 }
});
test('legacy Rope Ladder stays unknown until clicked, and hunter disclosure does not record gameplay',async({page,archive})=>{
 await archive.install(page,{draft:{...draft,creechSetupVersion:undefined,playEvents:[{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',at:1,kind:'start',saved:2,killed:3,round:5}]}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'creech');const panel=page.locator('[data-module="creech"]');const rope=panel.getByRole('button',{name:'Cycle Rope Ladder',exact:true});
 await expect(rope).toContainText('Not recorded');await rope.press('Enter');await expect(rope).toContainText('Not placed');await rope.press('Space');await expect(rope).toContainText('Upper-left room');
 await panel.getByRole('button',{name:'View Ghost Hunters',exact:true}).click();await panel.getByRole('button',{name:'Record participating hunters',exact:true}).click();
 const before=await page.evaluate(k=>localStorage.getItem(k),key);
 await panel.getByRole('button',{name:'View Orange Ghost Hunter',exact:true}).click();await panel.getByRole('button',{name:'View Blue Ghost Hunter',exact:true}).click();
 await expect(panel.getByRole('group',{name:'Orange Ghost Hunter actions',exact:true})).toHaveCount(0);await expect(panel.getByRole('group',{name:'Blue Ghost Hunter actions',exact:true})).toBeVisible();
 await panel.getByRole('button',{name:'View Ghost Hunters',exact:true}).click();await panel.getByRole('button',{name:'View Ghost Hunters',exact:true}).click();
 expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(before);
 await panel.getByRole('button',{name:'Mark Blue Ghost Hunter saved',exact:true}).click();await expect(panel.getByRole('button',{name:'View Blue Ghost Hunter',exact:true})).toContainText('Saved');
 await expect(page.getByRole('button',{name:'Save one victim',exact:true})).toContainText('2');await expect(page.getByRole('button',{name:'Record one victim killed',exact:true})).toContainText('3');
 await undoLatestObservation(page);await expect(panel.getByRole('button',{name:'View Blue Ghost Hunter',exact:true})).toContainText('In play');
});
