import {test,expect,activeGame,userId} from './fixtures';
import {openModule,undoLatestObservation} from './play-helpers';
import {newPlayEvent,summarizePlay,type PlayEvent} from '../../src/lib/play/events';
import {moduleState} from '../../src/lib/play/modules';
import {initialKonrad,konradParent,resolveKonradAction,konradState,type KonradAction} from '../../src/lib/play/konrad';
import type {Page,Locator,TestInfo} from '@playwright/test';
const key=`final-girl-active-game-v1:${userId}`;
const log=(page:Page):Promise<PlayEvent[]>=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,key);
const snapshot=async(page:Page)=>konradState(moduleState(summarizePlay(await log(page)).entries,'konrad'));
const draft={...activeGame,konradSetupVersion:1,playMode:true,selection:{...activeGame.selection,killer:'Poltergeist',location:'USS Konrad',setupScenario:'Bloody Feast'}};
async function resume(page:Page){await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'konrad');}
const sizes=(info:TestInfo)=>info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
async function capture(scope:Locator,info:TestInfo,name:string){
 await scope.locator('img').evaluateAll(async images=>{await Promise.all(images.map(im=>{const image=im as HTMLImageElement;image.loading='eager';return image.decode();}));});
 await scope.screenshot({path:info.outputPath(name+'.jpg'),type:'jpeg',quality:75,scale:'css',animations:'disabled',style:'.app-footer{visibility:hidden}'});
}
const switchNames=['Crusher','Incinerator','Airlock','Self Destruct','Upper left shaft','Upper right shaft','Lower left shaft','Lower right shaft','Remote Beacon','Hull breach'];
function fixture(startingEvent?:string){
 const events:PlayEvent[]=[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),newPlayEvent({kind:'module',moduleData:{module:'konrad',changes:initialKonrad('Bloody Feast',startingEvent)}})];
 const act=(fields:Record<string,unknown>)=>{const entries=summarizePlay(events).entries,action={...fields,parent:konradParent(entries)} as KonradAction,changes=resolveKonradAction(action,moduleState(entries,'konrad'),entries);if(!changes)throw new Error('Invalid Konrad fixture: '+JSON.stringify(fields));events.push(newPlayEvent({kind:'module',konradAction:action,moduleData:{module:'konrad',changes}}));};
 return {events,act};
}
test('Konrad picture switches record only state with no forms, costs or inferred outcomes',async({page,archive},info)=>{
 test.setTimeout(90000);
 await archive.install(page,{draft:{...draft,playEvents:fixture().events}});await resume(page);
 const panel=page.locator('[data-module="konrad"]'),before=await log(page);
 await panel.locator(':scope > summary').click();await openModule(page,'konrad');expect(await log(page)).toEqual(before);
 for(const name of switchNames){
  const button=panel.getByRole('button',{name:`Toggle ${name}`,exact:true});
  expect(await button.locator('img').evaluate(im=>getComputedStyle(im).filter)).toContain('grayscale(1)');
  const off=await button.locator('img').getAttribute('src');
  await button.click();await expect(button).toHaveAttribute('aria-pressed','true');
  expect(await button.locator('img').evaluate(im=>getComputedStyle(im).filter)).not.toContain('grayscale(1)');
  if(!['Remote Beacon','Hull breach'].includes(name))expect(await button.locator('img').getAttribute('src')).not.toBe(off);
  await button.click();await expect(button).toHaveAttribute('aria-pressed','false');
 }
 const s=await snapshot(page);expect(s.held).toBe(1);expect(s.systems).toEqual({});expect(s.fate).toBe('unknown');expect(s.airlock).toBe('inactive');expect(s.countdown).toBe('inactive');expect(s.beaconSpace).toBeNull();expect(s.breach).toBeNull();
 expect(summarizePlay(await log(page)).killed).toBe(0);expect(summarizePlay(await log(page)).saved).toBe(0);
 await expect(panel.getByRole('combobox')).toHaveCount(0);await expect(panel.getByRole('spinbutton')).toHaveCount(0);
 for(const name of ['Keycards & relocation','Correct ship markers & ending','Temporary access ended','Change status'])await expect(panel.getByText(name,{exact:true})).toHaveCount(0);
 for(const [width,height]of sizes(info)){
  await page.setViewportSize({width,height});await capture(panel.getByRole('region',{name:'Maintenance systems',exact:true}),info,`off-systems-${width}`);
  await capture(panel.getByRole('region',{name:'Maintenance shafts',exact:true}),info,`off-shafts-${width}`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 const crusher=panel.getByRole('button',{name:'Toggle Crusher',exact:true}),persisted=await log(page);
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('final-girl-active-game-v1:'))throw new Error('synthetic quota');return original.call(this,k,v);};});
 await crusher.click();await expect(panel.getByRole('alert')).toContainText('could not be saved');
 await expect(crusher).toHaveAttribute('aria-pressed','false');expect(await log(page)).toEqual(persisted);
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'konrad');
 await crusher.click();await expect(crusher).toHaveAttribute('aria-pressed','true');
 await undoLatestObservation(page);await expect(crusher).toHaveAttribute('aria-pressed','false');
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'konrad');await expect(crusher).toHaveAttribute('aria-pressed','false');
 expect(archive.calls).toEqual([]);
});

for(const name of ['The Captain','Jonas the Cat','Orphan Girl'])test(`Konrad ${name} has off, active, saved, killed and Left play pictures`,async({page,archive},info)=>{
 await archive.install(page,{draft:{...draft,playEvents:fixture().events}});await resume(page);
 const panel=page.locator('[data-module="konrad"]'),card=panel.locator('.konrad-crew .module-character').filter({has:page.getByText(name,{exact:true})});
 const width=info.project.name==='mobile'?390:1366;await page.setViewportSize({width,height:width===390?844:768});
 const original=await card.locator('img').getAttribute('src');
 expect(await card.locator('img').evaluate(im=>getComputedStyle(im).filter)).toContain('grayscale(1)');
 await card.getByRole('button',{name:`Add ${name}`,exact:true}).click();
 await capture(card,info,`crew-${name}-active`);
 await expect(card.getByRole('combobox')).toHaveCount(0);await expect(card.getByText('Change status',{exact:true})).toHaveCount(0);
 const pictures=new Set([original]);
 for(const status of ['saved','killed']){
  await card.getByRole('button',{name:`Mark ${name} ${status}`,exact:true}).click();
  await expect(card).toHaveAttribute('data-state',status);
  const src=await card.locator('img').getAttribute('src');expect(src).toContain('-'+status);pictures.add(src);
  await expect(card.getByRole('button',{name,exact:true})).toBeDisabled();
  await capture(card,info,`crew-${name}-${status}`);
  await undoLatestObservation(page);await expect(card).toHaveAttribute('data-state','in-play');
 }
 expect(pictures.size).toBe(3);
 await card.getByRole('button',{name:`Mark ${name} left`,exact:true}).click();await expect(card).toHaveAttribute('data-state','left');
 await expect(card.locator('img')).toHaveAttribute('src',original!);expect(await card.locator('img').evaluate(im=>getComputedStyle(im).filter)).toContain('grayscale(1)');
 await capture(card,info,`crew-${name}-left`);
 await card.getByRole('button',{name:`Add ${name}`,exact:true}).click();await expect(card).toHaveAttribute('data-state','in-play');
 const s=await snapshot(page),id=name==='The Captain'?'captain':name==='Jonas the Cat'?'jonas':'orphan';
 expect(s.people[id]).toBe('in-play');expect(s.events[id]).toBe('active');
 expect(summarizePlay(await log(page)).saved).toBe(0);expect(summarizePlay(await log(page)).killed).toBe(0);expect(archive.calls).toEqual([]);
});

for(const name of ['The Captain','Jonas the Cat','Orphan Girl'])test(`Konrad starting Event automatically lights ${name}`,async({page,archive})=>{
 await archive.install(page,{draft:{...draft,selection:{...draft.selection,startingEvent:name}}});await resume(page);
 const card=page.locator('[data-module="konrad"] .konrad-crew .module-character').filter({has:page.getByText(name,{exact:true})});
 await expect(card).toHaveAttribute('data-state','in-play');expect(await card.locator('img').evaluate(im=>getComputedStyle(im).filter)).not.toContain('grayscale(1)');
 await expect(card.getByRole('button',{name:`Mark ${name} saved`,exact:true})).toBeEnabled();
});

test('Konrad Super Loader activates from its picture and has four independent state photographs',async({page,archive},info)=>{
 await archive.install(page,{draft:{...draft,playEvents:fixture().events}});await resume(page);
 const panel=page.locator('[data-module="konrad"]'),loader=panel.locator('.konrad-loader');
 const width=info.project.name==='mobile'?390:1366;await page.setViewportSize({width,height:width===390?844:768});
 expect(await loader.locator('img').evaluate(im=>getComputedStyle(im).filter)).toContain('grayscale(1)');
 await loader.getByRole('button',{name:'Add Super Loader',exact:true}).click();
 await expect(loader.getByRole('group',{name:'Super Loader state',exact:true})).toBeVisible();
 const pictures=new Set<string>();
 for(const state of ['Parked','Powered','Equipped','Lost']){
  const button=loader.getByRole('button',{name:state,exact:true});
  if(await button.isEnabled())await button.click();
  await expect(button).toHaveAttribute('aria-pressed','true');pictures.add((await loader.locator('img').getAttribute('src'))!);
  await capture(loader,info,`loader-${state}-${width}`);
 }
 expect(pictures.size).toBe(4);
 await loader.getByRole('button',{name:'Not in play',exact:true}).click();expect(await loader.locator('img').evaluate(im=>getComputedStyle(im).filter)).toContain('grayscale(1)');
 await expect(loader.getByRole('group',{name:'Super Loader state',exact:true})).toHaveCount(0);
 await undoLatestObservation(page);await expect(loader.getByRole('button',{name:'Lost',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'konrad');await expect(loader.getByRole('button',{name:'Lost',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(archive.calls).toEqual([]);
});

test('Konrad current pictures, outcomes and controls render at all five target sizes',async({page,archive},info)=>{
 test.setTimeout(90000);
 const f=fixture();
 for(const target of ['system:crusher','system:incinerator','system:airlock','system:self-destruct','shaft:upper-left','shaft:lower-left','breach','loader'])f.act({command:'toggle',target,active:true});
 f.act({command:'token',destination:'shaft:lower-right',count:null});f.act({command:'loader',status:'equipped',space:null});f.act({command:'beacon',status:'placed',space:null});
 for(const id of ['captain','jonas','orphan'])f.act({command:'add-person',id});
 f.act({command:'person',id:'captain',status:'saved'});f.act({command:'person',id:'jonas',status:'killed'});f.act({command:'observe',key:'slippery',value:1});
 for(const id of ['faulty-wiring','good-cookin','cramped-pods','cluttered-shafts','emergency-override'])f.act({command:'event',id,active:true});
 await archive.install(page,{draft:{...draft,playEvents:f.events}});await resume(page);await page.emulateMedia({reducedMotion:'reduce'});
 const panel=page.locator('[data-module="konrad"]'),before=await log(page);
 for(const [width,height]of sizes(info)){
  await page.setViewportSize({width,height});
  for(const region of ['Maintenance systems','Maintenance shafts','Ship crew','Ongoing ship Events','Ship equipment and hazards','Slippery Minor Dark Power'])await capture(panel.getByRole('region',{name:region,exact:true}),info,`on-${region}-${width}`);
  await capture(panel.locator(':scope > summary'),info,`header-${width}`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const button of await panel.locator('button').all())if(await button.isVisible())expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
 }
 expect(await log(page)).toEqual(before);
 const crusher=panel.getByRole('button',{name:'Toggle Crusher',exact:true});await crusher.focus();await crusher.press('Space');await expect(crusher).toHaveAttribute('aria-pressed','false');
 await undoLatestObservation(page);await expect(crusher).toHaveAttribute('aria-pressed','true');expect(archive.calls).toEqual([]);
});

test('Konrad legacy unknowns remain explicit and Slippery still has shared live hearts',async({page,archive},info)=>{
 await archive.install(page,{draft:{...activeGame,playMode:true,playEvents:[newPlayEvent({kind:'start',saved:0,killed:0,round:3})],selection:{...activeGame.selection,location:'USS Konrad'}}});await resume(page);
 const panel=page.locator('[data-module="konrad"]'),airlock=panel.getByRole('button',{name:'Toggle Airlock',exact:true});
 await expect(airlock).toContainText('Not recorded');expect(await airlock.getAttribute('aria-pressed')).toBeNull();expect((await snapshot(page)).toggles).toBeUndefined();
 await panel.getByRole('button',{name:'Add Super Loader',exact:true}).click();await expect(panel.locator('.konrad-loader')).toContainText('State not recorded');
 expect((await snapshot(page)).loader).toBe('unknown');
 await panel.getByRole('button',{name:'Toggle Hull breach',exact:true}).click();expect((await snapshot(page)).breach).toBeNull();expect((await snapshot(page)).toggles?.breach).toBe(true);
 await page.setViewportSize({width:320,height:568});await capture(panel.getByRole('region',{name:'Maintenance systems',exact:true}),info,'unknown-320');
 await panel.getByRole('button',{name:'Reveal Slippery',exact:true}).click();
 for(let i=0;i<2;i++)await panel.getByRole('button',{name:'Remove one Slippery health, heart 1',exact:true}).click();
 await expect(panel.getByText('Removed · 0/2 health',{exact:true})).toBeVisible();await capture(panel.getByRole('article',{name:'Slippery',exact:true}),info,'removed-320');
 await panel.getByRole('button',{name:'Clear record: Slippery',exact:true}).click();await expect(panel.getByText('Revealed earlier · health not recorded',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
