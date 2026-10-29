import {test,expect,activeGame,userId} from './fixtures';
import {openModule,statusPick} from './play-helpers';
import {newPlayEvent,summarizePlay} from '../../src/lib/play/events';
import {moduleState} from '../../src/lib/play/modules';
import {initialKonrad,konradParent,resolveKonradAction,type KonradAction} from '../../src/lib/play/konrad';
const key=`final-girl-active-game-v1:${userId}`;
test('Konrad system preflight, deliberate activation, persistence and five viewport review',async({page,archive},info)=>{
 await archive.install(page,{draft:{...activeGame,konradSetupVersion:1,playMode:true,selection:{...activeGame.selection,killer:'Poltergeist',location:'USS Konrad',setupScenario:'Bloody Feast'}}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'konrad');
 const panel=page.locator('[data-module="konrad"]'),systems=panel.getByRole('region',{name:'Maintenance systems'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents.length,key);
 await panel.getByRole('button',{name:'View Airlock actions',exact:true}).click();
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents.length,key)).toBe(before);
 await panel.getByText('Keycards & relocation',{exact:true}).click();await panel.getByRole('spinbutton',{name:'Held charged Keycards',exact:true}).fill('3');
 await panel.getByRole('checkbox',{name:'Final Girl is at Hangar during Action',exact:true}).check();await panel.getByRole('button',{name:'Activate Airlock',exact:true}).click();
 await expect(panel.getByRole('button',{name:'View Airlock actions',exact:true})).toContainText('armed');
 await statusPick(page,panel.getByRole('combobox',{name:'Final Girl Airlock position',exact:true}),'In Hangar');await statusPick(page,panel.getByRole('combobox',{name:'Airlock survival result',exact:true}),'1–4 · Lost, no Final Health reveal');
 for(const [width,height]of(info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]])){
  await page.setViewportSize({width,height});await systems.locator('img').evaluateAll(async images=>Promise.all(images.map(im=>(im as HTMLImageElement).decode())));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const bytes=await systems.screenshot({path:info.outputPath(`konrad-system-${width}.jpg`),type:'jpeg',quality:65,animations:'disabled',style:'.app-footer{visibility:hidden}'});
  if(process.env.KONRAD_REVIEW_LOGS==='1')console.log(`KONRAD_REVIEW:${width}:${bytes.toString('base64')}`);
 }
 await panel.getByRole('checkbox',{name:'Super Loader is in Hangar and will be lost'}).check();await panel.getByRole('button',{name:'Record Airlock opened',exact:true}).click();
 await expect(panel.getByRole('button',{name:'Record Airlock opened',exact:true})).toHaveCount(0);
 const log=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,key);expect(log.some((e:{kind:string})=>e.kind==='killed')).toBe(false);
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'konrad');await expect(panel.getByRole('button',{name:'View Airlock actions',exact:true})).toContainText('released');
 expect(archive.calls).toEqual([]);
});

test('Konrad Solar quantities and linked reset preview',async({page,archive},info)=>{
 const log=[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),newPlayEvent({kind:'module',moduleData:{module:'konrad',changes:initialKonrad('Bloody Feast')}})];
 const add=(fields:Record<string,unknown>)=>{const entries=summarizePlay(log).entries,a={...fields,parent:konradParent(entries)} as KonradAction;log.push(newPlayEvent({kind:'module',konradAction:a,moduleData:{module:'konrad',changes:resolveKonradAction(a,moduleState(entries,'konrad'),entries)!}}));};
 add({command:'held',count:7});for(const system of ['airlock','self-destruct'])add({command:'activate',system,atStation:true,override:false,captainBridge:false,useHeld:true});
 await archive.install(page,{draft:{...activeGame,playMode:true,playEvents:log,selection:{...activeGame.selection,location:'USS Konrad'}}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'konrad');const panel=page.locator('[data-module="konrad"]');
 await panel.getByText('Keycards & relocation',{exact:true}).click();await panel.getByText('Solar Interference',{exact:true}).click();
 await panel.getByRole('spinbutton',{name:'Solar tokens Shaft · upper left',exact:true}).fill('2');await panel.getByRole('spinbutton',{name:'Solar tokens crusher',exact:true}).fill('3');await panel.getByRole('spinbutton',{name:'Solar tokens incinerator',exact:true}).fill('4');await panel.getByRole('checkbox',{name:'All board and Maintenance tokens accounted for',exact:true}).check();
 const ledger=panel.locator('details').filter({has:page.getByRole('spinbutton',{name:'Held charged Keycards',exact:true})}).first();
 const width=info.project.name==='mobile'?390:1366;await page.setViewportSize({width,height:info.project.name==='mobile'?844:768});
 const bytes=await ledger.screenshot({path:info.outputPath(`konrad-solar-${width}.jpg`),type:'jpeg',quality:65,animations:'disabled',style:'.app-footer{visibility:hidden}'});if(process.env.KONRAD_REVIEW_LOGS==='1')console.log(`KONRAD_REVIEW:solar-${width}:${bytes.toString('base64')}`);
 await panel.getByRole('button',{name:'Record redistribution',exact:true}).click();await expect(panel.getByRole('button',{name:'View upper-left shaft',exact:true})).toContainText('2 Keycards');await expect(panel.getByRole('button',{name:'View Airlock actions',exact:true})).toContainText('inactive');await expect(panel.getByRole('button',{name:'View Self Destruct actions',exact:true})).toContainText('inactive');
 await panel.getByText('System Reboot',{exact:true}).click();await panel.getByRole('checkbox',{name:'I resolved the physical return',exact:true}).check();await panel.getByRole('button',{name:'Record System Reboot',exact:true}).click();await expect(panel.getByRole('button',{name:'View upper-left shaft',exact:true})).toContainText('0 Keycards');
});
