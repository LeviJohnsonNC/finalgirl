import {test,expect,activeGame,userId} from './fixtures';
import {openModule} from './play-helpers';
import {newPlayEvent,validPlayLog,type PlayEvent} from '../../src/lib/play/events';
import {initialStation,resolveStationAction,STATION_MODULE,type StationAction} from '../../supabase/functions/_shared/play/station';

// The first PR exposes the pilot only in the station-pilot preview build.
test.skip(!process.env.STATION_PILOT, 'Run against the station-pilot preview build');

const storageKey = `final-girl-active-game-v1:${userId}`;

test('Station helicopter records a named passenger and resolves a delayed trip once', async ({page,archive},info) => {
  const seed = newPlayEvent({kind:'module',moduleData:{module:STATION_MODULE,changes:initialStation()}});
  const stationAction: StationAction = {kind:'role',id:'doctor',status:'present',parent:seed.id};
  const changes = resolveStationAction(stationAction,initialStation(),[seed])!;
  const role = newPlayEvent({kind:'module',stationAction,moduleData:{module:STATION_MODULE,changes}});
  await archive.install(page,{draft:{...activeGame,playMode:true,stationSetupVersion:1,
    selection:{...activeGame.selection,killer:'Hans',location:'Station 2891',finalGirl:'Kate'},
    playEvents:[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),seed,role]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,STATION_MODULE);
  const rescue = page.getByRole('region',{name:'Helicopter rescue'});
  await rescue.getByLabel('Total passengers').selectOption('3');
  await rescue.getByLabel('Doctor aboard').check();
  await rescue.getByRole('button',{name:'Transfer to Helicopter Card'}).click();
  await rescue.getByRole('button',{name:'Move into the air'}).click();
  await expect(rescue.getByRole('button',{name:'Fly back toward Station'})).toHaveCount(0);
  await rescue.getByLabel('Move from').selectOption('Terror card');
  await rescue.getByRole('button',{name:'Arrive outside Action'}).click();
  await expect(rescue).toContainText('Rescue effects pending');
  await expect(rescue).toContainText('Doctor aboard');
  await expect(rescue.getByRole('button',{name:'Fly back toward Station'})).toHaveCount(0);
  for (const [width,height] of info.project.name==='mobile' ? [[390,844],[320,568]] : [[1280,640],[1366,768],[1440,900]]) {
    await page.setViewportSize({width,height});
    await rescue.locator('img').evaluate(async img=>(img as HTMLImageElement).decode());
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await rescue.screenshot({path:info.outputPath(`station-pending-${width}.jpg`),type:'jpeg',quality:87,style:'.app-footer{visibility:hidden}'});
  }
  await rescue.getByRole('button',{name:'Apply rescue effects'}).click();
  await expect(rescue.getByRole('button',{name:'Apply rescue effects'})).toHaveCount(0);
  await rescue.getByRole('button',{name:'Fly back toward Station'}).click();
  await rescue.getByRole('button',{name:'Fly back toward Station'}).click();
  await rescue.getByRole('button',{name:'Land at helipad'}).click();
  await expect(rescue).toContainText('Helipad · 0/3 aboard');
  const log = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents as PlayEvent[],storageKey);
  expect(validPlayLog(log)).toBe(true);
  expect(log.filter(event=>event.stationAction?.kind==='confirm-rescue')).toHaveLength(1);
});
