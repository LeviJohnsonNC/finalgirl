import {test,expect,activeGame,userId} from './fixtures';
import {openModule,statusPick,undoLatestObservation} from './play-helpers';
import type {Page} from '@playwright/test';
const key=`final-girl-active-game-v1:${userId}`;
const draft={...activeGame,evomorphSetupVersion:1,playMode:true,selection:{...activeGame.selection,killer:'Evomorph',location:'USS Konrad'}};
const log=(page:Page)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,key);
async function resume(page:Page){await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'evomorph');}
test('Evomorph portraits follow evolution, quiet correction, Undo and reload across Play',async({page,archive},info)=>{
 test.setTimeout(90000);
 await archive.install(page,{draft});await resume(page);
 const panel=page.locator('[data-module="evomorph"]');
 const evolution=panel.getByRole('button',{name:'View evolution and presence actions'});
 const banner=panel.locator(':scope > summary img');
 await page.getByRole('button',{name:'Track Killer health',exact:true}).click();
 const health=page.locator('.play-state--killerHealth .play-stat-portrait');
 const pictures=async()=>Promise.all([evolution.locator('img').getAttribute('src'),banner.getAttribute('src'),health.getAttribute('src')]);
 const hatchling=await pictures();expect(new Set(hatchling).size).toBe(1);expect(hatchling[0]).toContain('hatchling');
 await expect(panel.getByRole('combobox',{name:'Correct Evomorph stage',exact:true})).toHaveCount(0);
 const before=await log(page);
 await panel.getByRole('button',{name:'Correct stage',exact:true}).click();
 await expect(panel.getByRole('combobox',{name:'Correct Evomorph stage',exact:true})).toBeVisible();
 expect(await log(page)).toEqual(before);
 await panel.getByRole('button',{name:'Correct stage',exact:true}).click();
 await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
 await expect(dialog.locator('.play-cause-tile--killer img')).toHaveAttribute('src',hatchling[0]!);
 await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 await panel.getByRole('button',{name:'Evolve to Youngling',exact:true}).click();
 const youngling=await pictures();expect(new Set(youngling).size).toBe(1);expect(youngling[0]).toContain('youngling');expect(youngling[0]).not.toBe(hatchling[0]);
 await expect(panel.getByText('Records Adult recovery to 10 Health and the permanent Dark Power reveal. Entry effects are recorded separately.',{exact:true})).toHaveCount(0);
 await panel.getByRole('button',{name:'Evolve to Adult',exact:true}).click();
 const adult=await pictures();expect(new Set(adult).size).toBe(1);expect(adult[0]).not.toBe(youngling[0]);expect(adult[0]).not.toBe(hatchling[0]);
 await expect(panel.getByRole('combobox',{name:'Correct Power entry record',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
 await expect(dialog.locator('.play-cause-tile--killer img')).toHaveAttribute('src',hatchling[0]!);
 await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 // Failed corrections retain both the visible stage and its retry control.
 await panel.getByRole('button',{name:'Correct stage',exact:true}).click();
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('final-girl-active-game-v1:'))throw new Error('synthetic quota');return original.call(this,k,v);};});
 await statusPick(page,panel.getByRole('combobox',{name:'Correct Evomorph stage',exact:true}),'Youngling');
 await expect(panel.getByRole('alert')).toContainText('could not be saved');
 expect(await pictures()).toEqual(adult);
 await expect(panel.getByRole('combobox',{name:'Correct Evomorph stage',exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'evomorph');
 expect(await pictures()).toEqual(adult);
 await panel.getByRole('button',{name:'Correct stage',exact:true}).click();
 await statusPick(page,panel.getByRole('combobox',{name:'Correct Evomorph stage',exact:true}),'Youngling');
 await expect(panel.getByRole('combobox',{name:'Correct Evomorph stage',exact:true})).toHaveCount(0);
 expect(await pictures()).toEqual(youngling);
 await undoLatestObservation(page);expect(await pictures()).toEqual(adult);
 await panel.getByRole('button',{name:'Correct stage',exact:true}).click();
 await statusPick(page,panel.getByRole('combobox',{name:'Correct Evomorph stage',exact:true}),'Not recorded');
 const unknown=await pictures();expect(new Set(unknown).size).toBe(1);expect(unknown[0]).not.toBe(adult[0]);
 await expect(evolution).toContainText('Evolution not recorded');
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'evomorph');
 expect(await pictures()).toEqual(unknown);
 // Capture all live stage crops with the actual shared tracker and module header.
 const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
 for(const stage of ['Hatchling','Youngling','Adult']){
  await panel.getByRole('button',{name:'Correct stage',exact:true}).click();
  await statusPick(page,panel.getByRole('combobox',{name:'Correct Evomorph stage',exact:true}),stage);
  for(const [width,height]of sizes){
   await page.setViewportSize({width,height});
   await evolution.locator('img').evaluateAll(async images=>{await Promise.all(images.map(im=>(im as HTMLImageElement).decode()));});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await panel.locator('.evo-evolution').screenshot({path:info.outputPath(`stage-${stage}-${width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
   await panel.locator(':scope > summary').screenshot({path:info.outputPath(`header-${stage}-${width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
   await page.locator('.play-state--killerHealth').screenshot({path:info.outputPath(`health-${stage}-${width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
  }
 }
});
test('all Evomorph cards have distinct custom photographs in choices, reveals and Remember this',async({page,archive},info)=>{
 await archive.install(page,{draft});await resume(page);
 const panel=page.locator('[data-module="evomorph"]');
 await panel.getByText('Dark Power & Finale',{exact:true}).click();
 const sources=new Set<string>();
 for(const name of ['Dead Silence','Shadow Dread','Sideswipe']){
  const card=panel.getByRole('article',{name,exact:true});
  const src=(await card.locator('.module-minor-art img').getAttribute('src'))!;expect(src).toMatch(/\.webp$/);sources.add(src);
  await card.getByRole('button',{name:`Reveal ${name}`,exact:true}).click();
  await expect(card.locator('.module-minor-art img')).toHaveAttribute('src',src);
  await card.locator('.module-minor-art img').evaluate(async image=>{await(image as HTMLImageElement).decode();});
  await card.screenshot({path:info.outputPath(`minor-${name.replaceAll(' ','-')}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
  const add=panel.getByRole('button',{name:'Add another Minor Power',exact:true});if(await add.isVisible())await add.click();
 }
 for(const [type,names]of [['Dark Power',['Acid Blood','Razor Claws','Razor Tail','Symbiotic Camouflage']],['Finale',['Blitz of Death','Death in the Dark','The Perfect Organism']]] as const){
  const region=panel.getByRole('region',{name:`${type} selection`,exact:true});
  for(const name of names){
   const choice=region.getByRole('button',{name:`Choose ${name}`,exact:true});
   const src=(await choice.locator('img').getAttribute('src'))!;expect(src).toMatch(/\.webp$/);sources.add(src);
   await choice.click();
   await expect(region.locator('.module-revealed-hero img')).toHaveAttribute('src',src);
   await expect(page.getByRole('button',{name:type,exact:true}).locator('img')).toHaveAttribute('src',src);
   await region.locator('.module-revealed-hero img').evaluate(async image=>{await(image as HTMLImageElement).decode();});
   await region.screenshot({path:info.outputPath(`card-${name.replaceAll(' ','-')}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
   await region.getByRole('button',{name:`Clear ${type} card name`,exact:true}).click();
  }
 }
 expect(sources.size).toBe(10);
});
