import {test,expect,activeGame,userId} from './fixtures';
import {openModule} from './play-helpers';
import type {PlayEvent} from '../../src/lib/play/events';
const key=`final-girl-active-game-v1:${userId}`;
const log=(page:import('@playwright/test').Page):Promise<PlayEvent[]>=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,key);
async function resume(page:import('@playwright/test').Page){await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'evomorph');}
for(const location of ['Camp Happy Trails','Buddyland','Carnival of Blood','Maple Lane','Sacred Groves','Creech Manor','Marrek Warehouse'])test(`Evomorph evolution and owner isolation at ${location}`,async({page,archive},info)=>{
 await archive.install(page,{draft:{...activeGame,evomorphSetupVersion:1,playMode:true,selection:{...activeGame.selection,killer:'Evomorph',location}}});
 await resume(page);const panel=page.locator('[data-module="evomorph"]');
 await expect(panel.getByRole('button',{name:'Evolve to Youngling',exact:true})).toBeVisible();
 const before=(await log(page)).length;
 await panel.getByRole('button',{name:'Correct stage',exact:true}).click();
 await panel.getByRole('button',{name:'Correct stage',exact:true}).click();
 expect((await log(page)).length).toBe(before);
 await panel.getByRole('button',{name:'Evolve to Youngling',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Evomorph visibility',exact:true})).toContainText('Hidden');
 await panel.getByRole('button',{name:'Evomorph visibility',exact:true}).click();
 await panel.getByRole('button',{name:'Evolve to Adult',exact:true}).click();
 await expect(panel.getByText('Scan & Ambush',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Set Killer health',exact:true})).toHaveText('10');
 await panel.getByText('Dark Power & Finale',{exact:true}).click();
 await panel.getByRole('button',{name:'Choose Acid Blood',exact:true}).click();
 await expect(panel.getByRole('region',{name:'Dark Power entry effects'})).toHaveCount(0);
 await expect(panel.getByRole('button',{name:'Record Power entry resolved',exact:true})).toHaveCount(0);
 const events=await log(page);
 expect(events.filter(e=>e.kind==='moment'&&e.momentType==='dark-power')).toHaveLength(1);
 expect(events.some(e=>e.kind==='killed')).toBe(false);
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'evomorph');
 await expect(panel.getByRole('button',{name:'Evomorph visibility'})).toContainText('Adult');
 expect(archive.calls).toEqual([]);
 await panel.screenshot({path:info.outputPath('adult-entry.png'),animations:'disabled',style:'.app-footer{visibility:hidden}'});
});
test('Evomorph controls and photographic states at all target sizes',async({page,archive},info)=>{
 await archive.install(page,{draft:{...activeGame,evomorphSetupVersion:1,playMode:true,selection:{...activeGame.selection,killer:'Evomorph'}}});
 await resume(page);const panel=page.locator('[data-module="evomorph"]');
 await panel.getByRole('button',{name:'Evolve to Youngling',exact:true}).click();
 await panel.getByRole('button',{name:'Evolve to Adult',exact:true}).click();
 await panel.getByText('Dark Power & Finale',{exact:true}).click();
 await panel.getByRole('button',{name:'Choose Razor Tail',exact:true}).click();
 await panel.getByRole('button',{name:'Choose Death in the Dark',exact:true}).click();
 await panel.getByRole('button',{name:'Reveal Sideswipe',exact:true}).click();
 await panel.getByRole('button',{name:'Add another Minor Power',exact:true}).click();
 await panel.getByRole('button',{name:'Reveal Dead Silence',exact:true}).click();
 const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
 for(const [width,height]of sizes){
  await page.setViewportSize({width,height});
  await panel.locator('img').evaluateAll(async images=>{await Promise.all(images.map(im=>(im as HTMLImageElement).decode()));});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await panel.screenshot({path:info.outputPath(`evo-active-${width}.png`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
 }
 await panel.getByRole('button',{name:'Remove one Sideswipe health, heart 1',exact:true}).click();
 await panel.getByRole('button',{name:'Remove one Sideswipe health, heart 1',exact:true}).click();
 await panel.getByRole('button',{name:'Remove one Sideswipe health, heart 1',exact:true}).click();
 await expect(panel.getByText('Removed · 0/3 health',{exact:true})).toBeVisible();
});
