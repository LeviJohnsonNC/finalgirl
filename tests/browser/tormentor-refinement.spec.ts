import {test,expect,activeGame,userId} from './fixtures';
import {openModule,undoLatestObservation,statusPick,chooseKillerCard} from './play-helpers';
import {newPlayEvent,summarizePlay,type PlayEvent} from '../../src/lib/play/events';
import {initialTormentor,resolveTormentorAction,tormentorParent,tormentorState,TORMENTOR_TRAPS} from '../../src/lib/play/tormentor';
import {moduleState} from '../../src/lib/play/modules';
const key=`final-girl-active-game-v1:${userId}`;
test('direct trap progress keeps deactivated and sprung photographs visible and correctable',async({page,archive},info)=>{
 const events:PlayEvent[]=[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),newPlayEvent({kind:'module',moduleData:{module:'tormentor',changes:initialTormentor()}})];
 const entries=summarizePlay(events).entries,action={parent:tormentorParent(entries),command:'add' as const,id:'guillotine',subject:'Victim',space:null};
 events.push(newPlayEvent({kind:'module',tormentorAction:action,moduleData:{module:'tormentor',changes:resolveTormentorAction(action,moduleState(entries,'tormentor'),entries)!}}));
 await archive.install(page,{draft:{...activeGame,playMode:true,selection:{...activeGame.selection,killer:'The Tormentor'},playEvents:events}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'tormentor');
 const panel=page.locator('[data-module="tormentor"]'),trap=panel.getByRole('article',{name:'Guillotine',exact:true}),photo=trap.locator('.tor-trap-photo img');
 await expect(trap.getByRole('button',{name:'Correct trap record',exact:true})).toHaveCount(0);
 const unchanged=await page.evaluate(k=>localStorage.getItem(k),key);await trap.getByRole('button',{name:'Set Guillotine stage 0: Start',exact:true}).click();expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(unchanged);await expect(panel.getByRole('alert')).toHaveCount(0);
 await trap.getByRole('button',{name:'Complete next task',exact:true}).click();
 await trap.getByRole('button',{name:'Complete final task',exact:true}).click();
 await expect(trap).toHaveAttribute('data-trap-state','escaped');await expect(photo).toHaveAttribute('src',/guillotine-deactivated/);
 await trap.getByRole('button',{name:'Toggle Guillotine task 2',exact:true}).click();
 await expect(trap).toHaveAttribute('data-trap-state','active');await expect(photo).toHaveAttribute('src',/guillotine-[^-]+\.webp|guillotine\.webp/);
 await trap.getByRole('button',{name:'Set Guillotine stage 4: Killed',exact:true}).click();
 await expect(trap).toHaveAttribute('data-trap-state','spent');await expect(photo).toHaveAttribute('src',/guillotine-sprung/);
 await expect(trap.locator('.tor-skull')).toHaveCount(1);await expect(panel.getByText(/Next advance:/)).toHaveCount(0);
 await trap.getByRole('button',{name:'Set Guillotine stage 1: Horror +1',exact:true}).click();await expect(trap).toHaveAttribute('data-trap-state','active');
 await undoLatestObservation(page);await expect(trap).toHaveAttribute('data-trap-state','spent');
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'tormentor');await expect(photo).toHaveAttribute('src',/guillotine-sprung/);
 const log:PlayEvent[]=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,key);expect(summarizePlay(log).killed).toBe(0);expect(tormentorState(moduleState(summarizePlay(log).entries,'tormentor')).traps.guillotine.status).toBe('spent');
 for(const [width,height] of info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]]){
  await page.setViewportSize({width,height});await photo.evaluate((im:HTMLImageElement)=>im.decode());expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await trap.screenshot({path:info.outputPath(`trap-sprung-${width}.png`),style:'.app-footer{visibility:hidden}'});
 }
});
test('all eleven traps retain distinct empty deactivated and sprung scenes with compact direct controls',async({page,archive},info)=>{
 test.setTimeout(180000);
 await archive.install(page,{draft:{...activeGame,tormentorSetupVersion:1,playMode:true,selection:{...activeGame.selection,killer:'The Tormentor'}}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'tormentor');
 await page.setViewportSize(info.project.name==='mobile'?{width:320,height:568}:{width:1366,height:768});
 const panel=page.locator('[data-module="tormentor"]');let deck='victim';
 for(const c of [...TORMENTOR_TRAPS].sort((a,b)=>a.deck===b.deck?0:a.deck==='victim'?-1:1)){
  await panel.getByRole('button',{name:'Add Death Trap',exact:true}).click();
  const add=panel.getByRole('region',{name:'Add Death Trap',exact:true});
  await expect(add.getByRole('textbox')).toHaveCount(0);
  const pictures=(await add.locator('.tor-choices').boundingBox())!,subject=(await add.locator('.tor-subject').boundingBox())!;expect(subject.y).toBeGreaterThanOrEqual(pictures.y+pictures.height);
  if(deck!==c.deck){await statusPick(page,add.getByRole('combobox',{name:'Trap deck',exact:true}),c.deck==='girl'?'Final Girl':'Victim');deck=c.deck;}
  await add.getByRole('button',{name:c.name,exact:true}).click();
  const trap=panel.getByRole('article',{name:c.name,exact:true}),photo=trap.locator('.tor-trap-photo img');
  for(let i=0;i<c.tasks.length;i++)await trap.getByRole('button',{name:i===c.tasks.length-1?'Complete final task':'Complete next task',exact:true}).click();
  await expect(trap).toHaveAttribute('data-trap-state','escaped');await expect(photo).toHaveAttribute('src',new RegExp(c.id+'-deactivated'));await photo.evaluate((im:HTMLImageElement)=>im.decode());
  await trap.locator('.tor-trap-photo').screenshot({path:info.outputPath(c.id+'-deactivated.png'),style:'.app-footer{visibility:hidden}'});
  await trap.getByRole('button',{name:`Set ${c.name} stage ${c.checkpoints.length-1}: Killed`,exact:true}).click();
  await expect(trap).toHaveAttribute('data-trap-state','spent');await expect(photo).toHaveAttribute('src',new RegExp(c.id+'-sprung'));await photo.evaluate((im:HTMLImageElement)=>im.decode());
  for(const button of await trap.locator('.tor-countdown button,.tor-tasks button').all()){const b=(await button.boundingBox())!;expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await trap.locator('.tor-trap-photo').screenshot({path:info.outputPath(c.id+'-sprung.png'),style:'.app-footer{visibility:hidden}'});
 }
 await panel.locator('details.module-card-section>summary').click();await chooseKillerCard(panel,'Dark Power','Unfair Traps');
 const clear=panel.getByRole('button',{name:'Clear Dark Power card name',exact:true});expect(await clear.evaluate(node=>getComputedStyle(node).borderTopWidth)).toBe('0px');
 const log:PlayEvent[]=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,key);expect(summarizePlay(log).saved).toBe(0);expect(summarizePlay(log).killed).toBe(0);expect(archive.calls).toEqual([]);
});
