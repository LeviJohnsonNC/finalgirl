import {test,expect,activeGame,userId} from './fixtures';
import {openModule,undoLatestObservation} from './play-helpers';
import type {Page} from '@playwright/test';
const key=`final-girl-active-game-v1:${userId}`;
const log=(page:Page)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,key);
const draft={...activeGame,evomorphSetupVersion:1,playMode:true,selection:{...activeGame.selection,killer:'Evomorph',location:'Sacred Groves'}};
async function resume(page:Page){await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'evomorph');}
test('one visibility picture records only presence through failure, retry, Undo and reload',async({page,archive},info)=>{
 await archive.install(page,{draft});await resume(page);
 const panel=page.locator('[data-module="evomorph"]');
 const toggle=panel.getByRole('button',{name:'Evomorph visibility',exact:true});
 await expect(toggle).toBeDisabled();await expect(toggle).toContainText('Visible');
 await panel.getByRole('button',{name:'Evolve to Youngling',exact:true}).click();
 await expect(toggle).toBeEnabled();await expect(toggle).toHaveAttribute('aria-pressed','true');await expect(toggle).toContainText('Hidden');
 const hidden=(await toggle.locator('img').getAttribute('src'))!;
 const before=await log(page);
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('final-girl-active-game-v1:'))throw new Error('synthetic quota');return original.call(this,k,v);};});
 await toggle.click();await expect(panel.getByRole('alert')).toContainText('could not be saved');
 await expect(toggle).toContainText('Hidden');expect(await log(page)).toEqual(before);
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'evomorph');
 await toggle.click();await expect(toggle).toContainText('Visible');
 const after=await log(page);expect(after.length).toBe(before.length+1);
 expect(after.at(-1).moduleData).toEqual({module:'evomorph',changes:{presence:'on-board'}});
 expect(after.some((e:{kind:string})=>e.kind==='killed')).toBe(false);
 expect(await toggle.locator('img').getAttribute('src')).toContain('youngling');
 await undoLatestObservation(page);await expect(toggle).toContainText('Hidden');
 await expect(toggle.locator('img')).toHaveAttribute('src',hidden);
 await toggle.click();await toggle.click();await expect(toggle).toContainText('Hidden');
 await panel.getByRole('button',{name:'Evolve to Adult',exact:true}).click();
 const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
 for(const presence of ['hidden','visible']){
  if(presence==='visible')await toggle.click();
  for(const [width,height]of sizes){
   await page.setViewportSize({width,height});
   await toggle.locator('img').evaluate(async im=>{await(im as HTMLImageElement).decode();});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await panel.locator('.evo-evolution').screenshot({path:info.outputPath(`presence-${presence}-${width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
  }
 }
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'evomorph');
 await expect(toggle).toContainText('Visible');await expect(toggle.locator('img')).not.toHaveAttribute('src',hidden);
 for(const name of ['Scan & Ambush','Dark Power entry','Correct presence'])await expect(panel.getByText(name,{exact:true})).toHaveCount(0);
 expect(archive.calls).toEqual([]);
});

const pairs=[
  ['Billy the Bear','Buddyland','billy'],
  ['Hans','Camp Happy Trails','hans'],
  ['Dr. Fright','Maple Lane','fright'],
  ['Geppetto','Carnival of Blood','geppetto'],
  ['Inkanyamba','Sacred Groves','inkanyamba'],
  ['Poltergeist','Creech Manor','poltergeist'],
  ['Evomorph','USS Konrad','evomorph'],
 ];
for(const [killer,location,id]of pairs)test(`shared owner headers and Minor Power hearts: ${killer} / ${location}`,async({page,archive},info)=>{
  await archive.install(page,{draft:{...activeGame,evomorphSetupVersion:1,playMode:true,selection:{...activeGame.selection,killer,location}}});
  await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const panels=page.locator('.play-module-panel');
  await expect(panels).toHaveCount(2);
  const before=await log(page);
  const srcs=await panels.locator(':scope > summary img').evaluateAll(images=>images.map(im=>(im as HTMLImageElement).src));
  expect(new Set(srcs).size).toBe(2);
  await openModule(page,id);
  expect(await log(page)).toEqual(before);
  if(id!=='poltergeist'){
   const panel=page.locator(`[data-module="${id}"]`);
   if(id==='geppetto')await panel.getByText('Minor Dark Powers',{exact:true}).click();
   await panel.locator('.module-minor-choice').first().click();
   const hearts=panel.locator('.play-health-tokens').first();
   const source=(await hearts.locator('image').first().getAttribute('href'))!;
   expect(source).toMatch(/cards.*\.webp/);
   await hearts.locator('button').first().click();
   await expect(hearts.locator('button[aria-pressed="false"]')).toHaveCount(1);
   await hearts.screenshot({path:info.outputPath(`hearts-${id}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
  }else await expect(page.locator('[data-module="poltergeist"] .play-health-tokens')).toHaveCount(0);
  // Close without recording; all photographs stay the same.
  await panels.first().locator(':scope > summary').click();
  const stable=await log(page);
  const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
  for(const [width,height]of sizes){
   await page.setViewportSize({width,height});
   await panels.locator(':scope > summary img').evaluateAll(async images=>{await Promise.all(images.map(im=>(im as HTMLImageElement).decode()));});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.locator('.play-module-stack').screenshot({path:info.outputPath(`headers-${id}-${width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
  }
  expect(await log(page)).toEqual(stable);
});
