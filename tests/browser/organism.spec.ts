import {test,expect,activeGame,userId} from './fixtures';
import {ORGANISM_FINALES,ORGANISM_MINORS,ORGANISM_TERRORS} from '../../src/lib/play/organism';
import {newPlayEvent,summarizePlay,validPlayLog,type PlayEvent} from '../../src/lib/play/events';
import {chooseKillerCard,openModule,openMinorPowers,searchPick,undoLatestObservation} from './play-helpers';

const storageKey=`final-girl-active-game-v1:${userId}`;
test('Organism portrait reveal and tracked Health',async({page,archive},info)=>{
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,organismSetupVersion:1,
    selection:{...activeGame.selection,killer:'The Organism',location:'Station 2891',finalGirl:'Kate'},playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const roster=page.getByRole('region',{name:'The Organism roster'});
  const red=roster.getByRole('button',{name:'Red · Exposed',exact:true});
  const exposedSource=await red.locator('img').getAttribute('src');
  await red.click();
  await roster.getByRole('button',{name:'Assimilated',exact:true}).click();
  await page.evaluate(()=>{
    const prior=Storage.prototype.setItem;
    Object.assign(window,{restoreOrganismStorage:()=>{Storage.prototype.setItem=prior;}});
    Storage.prototype.setItem=function(key,value){
      if(key.startsWith('final-girl-active-game-v1:'))throw Error('test write failure');
      prior.call(this,key,value);
    };
  });
  await roster.getByRole('combobox',{name:'Revealed mutation'}).click();
  await page.getByRole('option',{name:'Tough',exact:true}).click();
  await expect(roster.getByRole('alert')).toContainText('could not be saved');
  await expect(red).toBeVisible();
  await page.evaluate(()=>(window as unknown as {restoreOrganismStorage:()=>void}).restoreOrganismStorage());
  await roster.getByRole('combobox',{name:'Revealed mutation'}).click();
  await page.getByRole('option',{name:'Tough',exact:true}).click();
  const tough=roster.getByRole('button',{name:'Red · Tough',exact:true});
  await expect(tough).toBeVisible();
  expect(await tough.locator('img').getAttribute('src')).not.toBe(exposedSource);
  await expect(roster.getByLabel('Mutation Health',{exact:true})).toHaveText('7');
  for(const [width,height] of info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900],[1920,1080],[2560,1440]]){
    await page.setViewportSize({width,height});
    await roster.locator('img').evaluateAll(async images=>Promise.all(images.map(img=>(img as HTMLImageElement).decode())));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const geometry = await page.locator('.play-workspace').evaluate(workspace => ({
      width: workspace.clientWidth,
      portraitHeight: workspace.querySelector('.organism-portraits')!.getBoundingClientRect().height,
      healthPhotoHeight: workspace.querySelector('.play-state--finalGirlHealth .play-state-picture')!.getBoundingClientRect().height,
    }));
    expect(geometry.portraitHeight).toBeGreaterThanOrEqual(geometry.healthPhotoHeight);
    if (width >= 1920) expect(geometry.width).toBeGreaterThan(width === 1920 ? 1500 : 1700);
    if (width === 1920 || width === 1366 || width === 390) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({path:info.outputPath(`play-workspace-${width}.jpg`),type:'jpeg',quality:83,animations:'disabled'});
    }
    await roster.screenshot({path:info.outputPath(`organism-roster-${width}.jpg`),type:'jpeg',quality:86,animations:'disabled',style:'.app-footer{visibility:hidden}'});
  }
  await tough.click();
  await expect(tough).toHaveAttribute('aria-pressed','false');
  await expect(roster.getByLabel('Mutation Health',{exact:true})).toHaveCount(0);
  const correct = roster.getByRole('button',{name:'Correct record',exact:true});
  await correct.focus();
  await correct.press('Enter');
  const correction=page.getByRole('dialog',{name:'Correct Organism record'});
  await correction.getByRole('combobox',{name:'Organism color'}).click();
  await page.getByRole('option',{name:'Red',exact:true}).click();
  await correction.getByRole('spinbutton',{name:'Health'}).fill('1');
  await correction.getByRole('button',{name:'Save observation'}).click();
  await expect(correction).toBeHidden();
  await expect(correct).toBeFocused();
  await tough.click();
  await expect(roster.getByLabel('Mutation Health',{exact:true})).toHaveText('1');
  await expect(roster.getByText('+1 Horror die')).toHaveCount(0);
  await roster.getByRole('button',{name:'Decrease mutation Health'}).click();
  const killed=roster.getByRole('button',{name:'Red · Tough · Killed',exact:true});
  await expect(killed).toHaveAttribute('data-status','defeated');
  await expect(roster.getByLabel('Mutation Health',{exact:true})).toHaveCount(0);
  await undoLatestObservation(page);
  await expect(tough).toBeVisible();
  const log:PlayEvent[]=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,storageKey);
  expect(validPlayLog(log)).toBe(true);
  expect(summarizePlay(log)).toMatchObject({finalHorrorLevel:5,bloodlust:0,killed:0});
  expect(summarizePlay(log).killerHealth).toBeUndefined();
});

test('Organism records a forced casualty once and an unnamed Finale atomically',async({page,archive},info)=>{
  test.setTimeout(90000);
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,organismSetupVersion:1,
    selection:{...activeGame.selection,killer:'The Organism',location:'Falconwood'},playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const roster=page.getByRole('region',{name:'The Organism roster'});
  await roster.getByRole('button',{name:'Grey · Exposed'}).click();
  await roster.getByText('Other test results',{exact:true}).click();
  await roster.getByRole('button',{name:'Forced by an effect'}).click();
  await roster.getByRole('button',{name:'Safe',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
  await dialog.getByRole('button',{name:'Location hazard',exact:true}).click();
  await dialog.getByRole('button',{name:'Gruesome Death',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await dialog.getByRole('button',{name:'Save and exit',exact:true}).click();
  await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  expect(archive.calls.filter(name=>name==='generate-death-scene')).toHaveLength(1);
  await dialog.getByRole('button',{name:'Narrate death scene',exact:true}).click();
  await expect.poll(()=>archive.calls.includes('narrate-story')).toBe(true);
  await dialog.getByRole('button',{name:'Save and exit',exact:true}).click();
  await expect(roster.getByRole('button',{name:'Grey · Killed'})).toBeVisible();
  let log:PlayEvent[]=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,storageKey);
  expect(summarizePlay(log)).toMatchObject({bloodlust:1,killed:1});
  expect(log.filter(event=>event.kind==='killed')).toHaveLength(1);
  await undoLatestObservation(page);
  await expect(roster.getByRole('button',{name:'Grey · Exposed'})).toBeVisible();
  await openModule(page,'organism');
  const panel=page.locator('.play-module-panel[data-module="organism"]');
  await panel.locator('details.module-card-section > summary').click();
  await panel.getByRole('button',{name:'Record Finale card name'}).click();
  await panel.getByRole('button',{name:'Record Finale assimilation'}).click();
  for(const [color,form] of [['Grey','Fast'],['Red','Tough'],['Black','Strong']]){
    if(color!=='Black'){
      await panel.getByRole('combobox',{name:'Exposed Victim revealed'}).click();
      await page.getByRole('option',{name:color,exact:true}).click();
    }
    await panel.getByRole('combobox',{name:'Finale mutation form'}).click();
    await page.getByRole('option',{name:form,exact:true}).click();
  }
  await panel.getByRole('button',{name:'Confirm assimilation'}).click();
  await expect(roster.getByRole('button',{name:'Grey · Fast'})).toBeVisible();
  await roster.locator('img').evaluateAll(async images=>Promise.all(images.map(img=>(img as HTMLImageElement).decode())));
  await roster.screenshot({path:info.outputPath('three-mutations.jpg'),type:'jpeg',quality:86,style:'.app-footer{visibility:hidden}'});

  await expect(panel.getByRole('button',{name:'Record Finale assimilation'})).toHaveCount(0);
  log=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,storageKey);
  expect(validPlayLog(log)).toBe(true);
  expect(log.filter(event=>event.organismAction?.command==='finale')).toHaveLength(1);
  expect(summarizePlay(log)).toMatchObject({bloodlust:0,killed:0});
  await page.getByRole('button',{name:'Finale',exact:true}).click();
  await chooseKillerCard(page.locator('.play-moment-editor'),'Finale','Cognitive Assimilation');
  await expect(panel.getByRole('region',{name:'Finale selection'})).toContainText('Cognitive Assimilation');
  await expect(panel.getByRole('button',{name:'Record Finale assimilation'})).toHaveCount(0);
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(roster.getByRole('button',{name:'Black · Strong'})).toBeVisible();
});

test('legacy Organism resumes without invented Health, Horror or victim states',async({page,archive})=>{
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,
    selection:{...activeGame.selection,killer:'The Organism',location:'Station 2891'},
    playEvents:[newPlayEvent({kind:'start',round:2,saved:1,killed:0}),newPlayEvent({kind:'state',field:'killerHealth',value:10})]}});
  await page.goto('/');
  const resume=page.getByRole('button',{name:'RESUME GAME',exact:true});
  const roster=page.getByRole('region',{name:'The Organism roster'});
  await expect(async()=>{
    if(await resume.isVisible()) await resume.click();
    await expect(roster).toBeVisible({timeout:2000});
  }).toPass({timeout:15000});
  await expect(roster.getByRole('button',{name:/Unrecorded/})).toHaveCount(3);
  const log:PlayEvent[]=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,storageKey);
  expect(summarizePlay(log).killerHealth).toBe(10);
  expect(summarizePlay(log).finalHorrorLevel).toBeUndefined();
});

test('Organism Finish and Rules use the source-backed roster and named Finale',async({page,archive})=>{
  test.setTimeout(90000);
  archive.autoImages=true;
  archive.films=['s2-panic-station-2891'];
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,organismSetupVersion:1,
    selection:{...activeGame.selection,killer:'The Organism',location:'Station 2891',finalGirl:'Kate'},playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const roster=page.getByRole('region',{name:'The Organism roster'});
  await roster.getByRole('button',{name:'Red · Exposed'}).click();
  await roster.getByRole('button',{name:'Assimilated',exact:true}).click();
  await roster.getByRole('combobox',{name:'Revealed mutation'}).click();
  await page.getByRole('option',{name:'Tough',exact:true}).click();
  await page.getByRole('button',{name:'Finale',exact:true}).click();
  const remember=page.locator('.play-moment-editor');
  await chooseKillerCard(remember,'Finale','Regenerative Assimilation');
  await expect(remember.getByRole('button',{name:'Record Finale assimilation'})).toBeVisible();
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Lost',exact:true}).click();
  await expect(page.getByRole('region',{name:'Organism ending review'})).toContainText('Tough (7 HP)');
  await page.getByRole('radio',{name:'Assimilated',exact:true}).check();
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
  await expect(page.getByRole('region',{name:'Ending narration',exact:true})).toContainText(archive.endingText);
  const ending=archive.generationRequests.find(request=>request.name==='generate-ending')?.body;
  expect(ending?.playSummary).toContain('Tough (7 HP)');
  expect(ending?.gameHighlights).toContain('Regenerative Assimilation');
  expect(ending).not.toHaveProperty('killerHealth');
  await expect.poll(()=>archive.generationRequests.find(request=>request.name==='generate-scene-image'&&request.body.sceneType==='ending')?.body.scenarioRules).toContain('Tough (7 HP)');
});

test('Rules search finds all Organism cards, including the Horror-only Terror',async({page,archive})=>{
  archive.films=['s2-panic-station-2891'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button',{name:'Rules',exact:true}).click();
  await page.getByRole('textbox',{name:'Search rules',exact:true}).fill('How Disgusting It Is');
  await page.getByRole('tab',{name:'Special Rules',exact:true}).click();
  const rules=page.locator('#killer-the-organism-rules');
  await expect(rules).toContainText('Have You Seen How Disgusting It Is?');
  await expect(rules).toContainText('Regenerative Assimilation');
});

test('Organism artwork loads in the complete module and selected death causes',async({page,archive},info)=>{
  test.setTimeout(120000);
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,organismSetupVersion:1,
    selection:{...activeGame.selection,killer:'The Organism',location:'Station 2891'},playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const roster=page.getByRole('region',{name:'The Organism roster'});
  const capture=async(subject:typeof roster,name:string)=>{
    await subject.scrollIntoViewIfNeeded();
    const photos=subject.locator('img:visible');
    await photos.evaluateAll(images=>images.forEach(image=>{(image as HTMLImageElement).loading='eager';}));
    await expect.poll(()=>photos.evaluateAll(images=>images.length>0&&images.every(img=>{
      const image=img as HTMLImageElement;
      return image.complete&&image.naturalWidth>0;
    }))).toBe(true);
    await subject.screenshot({path:info.outputPath(name+'.jpg'),type:'jpeg',quality:83,animations:'disabled',style:'.app-footer{visibility:hidden}'});
  };
  await page.emulateMedia({reducedMotion:'reduce'});
  await capture(roster,'exposed');
  for(const color of ['Red','Black','Grey']){
    await roster.getByRole('button',{name:color+' · Exposed'}).click();
    await roster.getByRole('button',{name:'Safe',exact:true}).click();
  }
  await capture(roster,'safe');
  await openModule(page,'organism');
  const panel=page.locator('.play-module-panel[data-module="organism"]');
  await openMinorPowers(panel);
  for(const [index,power] of ORGANISM_MINORS.entries()){
    if(index>0)await panel.getByRole('button',{name:'Add another Minor Power'}).click();
    await panel.getByRole('button',{name:'Reveal '+power.name}).click();
  }
  await capture(panel,'minor-powers');
  await panel.locator('details.module-card-section > summary').click();
  await capture(panel.getByRole('region',{name:'Finale selection'}),'finale-choices');
  for(const card of ORGANISM_FINALES){
    await chooseKillerCard(panel,'Finale',card.name);
    await capture(panel.getByRole('region',{name:'Finale selection'}),'finale-'+card.id);
  }
  await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
  const terror=dialog.getByRole('button',{name:'Terror card',exact:true});
  await terror.click();
  for(const card of ORGANISM_TERRORS.filter(card=>card.death)){
    await searchPick(page,'Terror card',card.name);
    await expect(terror.locator('img')).toHaveAttribute('src',new RegExp(card.id));
    await capture(terror,'terror-'+card.id);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
