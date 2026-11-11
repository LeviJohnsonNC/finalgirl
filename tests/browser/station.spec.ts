import {test,expect,activeGame,userId} from './fixtures';
import {openModule,searchPick} from './play-helpers';
import {newPlayEvent,validPlayLog,type PlayEvent} from '../../src/lib/play/events';
import {initialStation,resolveStationAction,STATION_MODULE,STATION_ROLES,STATION_ALLIES,STATION_TERRORS,type StationAction} from '../../supabase/functions/_shared/play/station';

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
  await rescue.getByRole('combobox',{name:'Total passengers',exact:true}).selectOption('3');
  await rescue.getByLabel('Doctor aboard').check();
  await rescue.getByRole('button',{name:'Transfer to Helicopter Card'}).click();
  await rescue.getByRole('button',{name:'Move into the air'}).click();
  await expect(rescue.getByRole('button',{name:'Fly back toward Station'})).toHaveCount(0);
  await rescue.getByRole('combobox',{name:'Move from',exact:true}).selectOption('Terror card');
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
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,STATION_MODULE);
  await expect(rescue).toContainText('Rescue effects pending');
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    Object.assign(window,{restoreStationStorage:()=>{Storage.prototype.setItem=original;}});
    Storage.prototype.setItem=function(key,value){
      if(key.startsWith('final-girl-active-game-v1:'))throw Error('test write failure');
      original.call(this,key,value);
    };
  });
  await rescue.getByRole('button',{name:'Apply rescue effects'}).click();
  await expect(page.getByRole('alert').filter({hasText:'This change could not be saved'})).toBeVisible();
  await expect(rescue).toContainText('Rescue effects pending');
  await page.evaluate(()=>(window as unknown as {restoreStationStorage:()=>void}).restoreStationStorage());
  await rescue.getByRole('button',{name:'Apply rescue effects'}).click();
  await expect(rescue.getByRole('button',{name:'Apply rescue effects'})).toHaveCount(0);
  await rescue.getByRole('button',{name:'Fly back toward Station'}).click();
  await rescue.getByRole('button',{name:'Fly back toward Station'}).click();
  await rescue.getByRole('button',{name:'Land at helipad'}).click();
  await expect(rescue).toContainText('Helipad · 0/3 aboard');
  const log = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents as PlayEvent[],storageKey);
  expect(validPlayLog(log)).toBe(true);
  expect(log.filter(event=>event.stationAction?.kind==='confirm-rescue')).toHaveLength(1);
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Lost',exact:true}).click();
  await page.getByRole('button',{name:'Save record only',exact:true}).click();
  await expect.poll(()=>archive.history.length).toBe(1);
  expect(archive.history[0].victims_saved).toBe(0);
  expect(archive.history[0].play_events).toEqual(expect.arrayContaining([expect.objectContaining({stationAction:expect.objectContaining({kind:'confirm-rescue'})})]));
});

test('Station renders equipment, roles, allies and Terror crops across states',async({page,archive},info)=>{
  test.setTimeout(120000);
  page.setDefaultTimeout(10000);
  await archive.install(page,{draft:{...activeGame,playMode:true,stationSetupVersion:1,
    selection:{...activeGame.selection,killer:'Slayer',location:'Station 2891',finalGirl:'Kate'},playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await openModule(page,STATION_MODULE);
  const panel=page.locator('.play-module-panel[data-module="station-2891"]');
  const conditions=panel.getByRole('region',{name:'Station conditions'});
  const crew=panel.getByRole('region',{name:'Station special victims'});
  const allies=panel.getByRole('region',{name:'Station allies'});
  const capture=async(subject:typeof panel,name:string)=>{
    await subject.scrollIntoViewIfNeeded();
    const images=subject.locator('img:visible');
    await images.evaluateAll(all=>all.forEach(img=>{(img as HTMLImageElement).loading='eager';}));
    await expect.poll(()=>images.evaluateAll(all=>all.length>0&&all.every(img=>{
      const image=img as HTMLImageElement;
      return image.complete&&image.naturalWidth>0;
    }))).toBe(true);
    await images.evaluateAll(async all=>Promise.all(all.map(image=>(image as HTMLImageElement).decode())));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await subject.screenshot({path:info.outputPath(name+'.jpg'),type:'jpeg',quality:82,animations:'disabled',style:'.app-footer{visibility:hidden}'});
  };
  await capture(panel,'station-ready');
  await conditions.getByRole('button',{name:/Frostbite/}).click();
  await conditions.getByRole('combobox',{name:'Final Girl',exact:true}).selectOption('marked');
  await conditions.getByText('Generator',{exact:true}).click();
  await conditions.getByRole('button',{name:'Record next Upkeep exception'}).click();
  await expect(conditions.getByRole('button',{name:'Record skipped Upkeep clearing'})).toBeVisible();
  await conditions.getByRole('button',{name:'Record skipped Upkeep clearing'}).click();
  await expect(conditions.getByRole('combobox',{name:'Final Girl',exact:true})).toHaveValue('marked');
  await conditions.getByRole('button',{name:/Lab wall/}).click();
  await conditions.getByRole('combobox',{name:'Lab opening',exact:true}).selectOption('keys');
  await conditions.getByRole('combobox',{name:'Lab opening',exact:true}).selectOption('accident');
  await conditions.getByRole('button',{name:/Skidozer/}).click();
  await conditions.getByRole('combobox',{name:'Skidozer state',exact:true}).selectOption('in-use');
  await conditions.getByRole('combobox',{name:'Outdoor position',exact:true}).selectOption('west');
  await conditions.getByRole('button',{name:/Hidden Weapons Cache/}).click();
  await conditions.getByRole('combobox',{name:'Cache state',exact:true}).selectOption('hidden');
  await conditions.getByRole('combobox',{name:'Cache state',exact:true}).selectOption('revealed');
  await conditions.getByRole('combobox',{name:'Armory position',exact:true}).selectOption('east');
  await conditions.getByRole('button',{name:/Heavy Storm/}).click();
  for(const role of STATION_ROLES) await crew.getByRole('button',{name:'Add '+role.name,exact:true}).click();
  await crew.getByRole('button',{name:'Mark Doctor left',exact:true}).click();
  await crew.getByRole('button',{name:'Add Doctor',exact:true}).click();
  await crew.getByRole('button',{name:'Board Doctor',exact:true}).click();
  await expect(panel.getByLabel('Doctor aboard')).toBeChecked();
  await expect(panel.getByRole('combobox',{name:'Total passengers',exact:true})).toHaveValue('1');
  for(const ally of STATION_ALLIES) await allies.getByRole('button',{name:new RegExp(ally.name)}).click();
  await capture(panel,'station-active');
  for(const role of STATION_ROLES) await crew.getByRole('button',{name:`Mark ${role.name} killed`,exact:true}).click();
  await capture(crew,'station-crew-killed');
  for(const role of STATION_ROLES){
    await crew.getByText(`Correct ${role.name} status`,{exact:true}).click();
    await crew.getByRole('combobox',{name:'Status',exact:true}).selectOption('saved');
    await crew.getByText(`Correct ${role.name} status`,{exact:true}).click();
  }
  await capture(crew,'station-crew-saved');
  await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
  const terror=dialog.getByRole('button',{name:'Terror card',exact:true});
  await terror.click();
  for(const card of STATION_TERRORS){
    await searchPick(page,'Terror card',card.name);
    await expect(terror.locator('img')).toHaveAttribute('src',new RegExp(card.id));
    await capture(terror,`station-terror-${card.id}`);
  }
  await dialog.getByRole('button',{name:'Location hazard',exact:true}).click();
  await searchPick(page,'Death mechanism','Lab explosion');
  await expect(dialog.getByRole('button',{name:'Location hazard',exact:true}).locator('img')).toHaveAttribute('src',/lab-breached/);
});

test('Station and Organism facts reach both ending requests while rescue is pending',async({page,archive})=>{
  test.setTimeout(90000);
  archive.autoImages=true;
  archive.films=['s2-panic-station-2891'];
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,organismSetupVersion:1,stationSetupVersion:1,
    selection:{...activeGame.selection,killer:'The Organism',location:'Station 2891',finalGirl:'Kate'},playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,STATION_MODULE);
  const rescue=page.getByRole('region',{name:'Helicopter rescue'});
  await rescue.getByRole('combobox',{name:'Total passengers',exact:true}).selectOption('1');
  await rescue.getByRole('button',{name:'Transfer to Helicopter Card'}).click();
  await rescue.getByRole('button',{name:'Move into the air'}).click();
  await rescue.getByRole('combobox',{name:'Move from',exact:true}).selectOption('Terror card');
  await rescue.getByRole('button',{name:'Arrive outside Action'}).click();
  const roster=page.getByRole('region',{name:'The Organism roster'});
  await roster.getByRole('button',{name:'Grey · Exposed'}).click();
  await roster.getByText('Other test or correction',{exact:true}).click();
  await roster.getByRole('button',{name:'Forced by an effect'}).click();
  await roster.getByRole('button',{name:'Safe',exact:true}).click();
  const death=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
  await death.getByRole('button',{name:'Location hazard',exact:true}).click();
  await searchPick(page,'Death mechanism','Lab explosion');
  await death.getByRole('button',{name:'Gruesome Death',exact:true}).click();
  await expect(death.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await death.getByRole('button',{name:'Save and exit',exact:true}).click();
  await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
  await expect(death.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await death.getByRole('button',{name:'Narrate death scene',exact:true}).click();
  await expect.poll(()=>archive.calls.includes('narrate-story')).toBe(true);
  await death.getByRole('button',{name:'Save and exit',exact:true}).click();
  await roster.getByRole('button',{name:'Red · Exposed'}).click();
  const forced=roster.getByRole('button',{name:'Forced by an effect'});
  if (!(await forced.isVisible())) await roster.getByText('Other test or correction',{exact:true}).click();
  await forced.click();
  await roster.getByRole('button',{name:'Assimilated',exact:true}).click();
  await roster.getByRole('combobox',{name:'Revealed mutation'}).click();
  await page.getByRole('option',{name:'Tough · 7 HP',exact:true}).click();
  const observations=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents as PlayEvent[],storageKey);
  expect(observations.filter(event=>event.kind==='killed')).toHaveLength(1);
  expect(observations.some(event=>event.kind==='details'&&event.mechanism==='Lab explosion')).toBe(true);
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Lost',exact:true}).click();
  await page.getByRole('radio',{name:'Assimilated',exact:true}).check();
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
  await expect(page.getByRole('region',{name:'Ending narration',exact:true})).toContainText(archive.endingText);
  const prose=archive.generationRequests.find(request=>request.name==='generate-ending')?.body.playSummary;
  expect(prose).toContain('Tough (7 HP)');
  expect(prose).toContain('rescue effects are still pending');
  expect(prose).not.toContain('Confirmed helicopter evacuations');
  await expect.poll(()=>archive.generationRequests.find(request=>request.name==='generate-scene-image'&&request.body.sceneType==='ending')?.body.scenarioRules)
    .toContain('rescue effects are still pending');
  await page.getByRole('button',{name:'Save to scrapbook',exact:true}).click();
  await expect.poll(()=>archive.history.length).toBe(1);
  expect(archive.history[0].victims_killed).toBe(1);
  expect(archive.history[0].victims_saved).toBe(0);
});

test('Rules search finds the Station setup and rescue action',async({page,archive})=>{
  archive.films=['s2-panic-station-2891'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button',{name:'Rules',exact:true}).click();
  await page.getByRole('textbox',{name:'Search rules',exact:true}).fill('Fly Faster');
  await page.getByRole('tab',{name:'Special Rules',exact:true}).click();
  const rules=page.locator('#location-station-2891-rules');
  await expect(rules).toContainText('Fly Faster!');
  await expect(rules).toContainText('Arctic Airport');
  await expect(rules).toContainText('Indoor outbuilding');
});
