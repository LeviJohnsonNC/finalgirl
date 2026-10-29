import {test,expect,activeGame,userId} from './fixtures';
import {openModule,statusPick} from './play-helpers';
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
