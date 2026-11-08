import {test,expect,activeGame,userId} from './fixtures';
import {openMinorPowers, openModule,chooseKillerCard,undoLatestObservation} from './play-helpers';
import {newPlayEvent,summarizePlay,validPlayLog,type PlayEvent} from '../../src/lib/play/events';
import {moduleState} from '../../src/lib/play/modules';
const storageKey=`final-girl-active-game-v1:${userId}`;

test('Intruders worked example, direct portrait activation, loaded artwork and finish',async({page,archive},info)=>{
  test.setTimeout(90000);
  archive.aiCastingArt=true;
  archive.autoImages=true;
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,intrudersSetupVersion:1,
    selection:{...activeGame.selection,killer:'The Intruders',location:'Maple Lane',finalGirl:'Ginny'},playEvents:[]}});
  await page.route('https://example.test/poster.png',route=>route.fulfill({contentType:'image/png',path:'src/assets/scrapbooks/final-girl-cover.png'}));
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const roster=page.getByRole('group',{name:'Intruder Killer Health tracker'});
  await expect(roster.locator('.intruder-portraits > button')).toHaveText(['Trish','Baghead','Zeke']);
  await expect(roster.getByRole('button',{name:'Trish',exact:true})).toHaveAttribute('data-active','true');
  await roster.getByRole('button',{name:'Baghead',exact:true}).click();
  await expect(roster.getByRole('button',{name:'Baghead',exact:true})).toHaveAttribute('data-active','true');
  const portraits=roster.locator('.intruder-portraits > button');
  expect(await portraits.evaluateAll(buttons=>buttons.map(button=>button.getAttribute('aria-label')))).toEqual(['Trish','Baghead','Zeke']);
  const boxes=await portraits.evaluateAll(buttons=>buttons.map(button=>{const box=button.getBoundingClientRect();return {top:box.top,width:box.width};}));
  expect(new Set(boxes.map(box=>box.top)).size).toBe(1);
  expect(Math.max(...boxes.map(box=>box.width))-Math.min(...boxes.map(box=>box.width))).toBeLessThan(1);
  await expect(roster.getByRole('button',{name:'Baghead',exact:true}).locator('img')).toHaveCSS('filter','none');
  await expect(roster.getByRole('button',{name:'Trish',exact:true}).locator('img')).toHaveCSS('filter',/grayscale\(1\)/);
  await roster.getByRole('button',{name:'Trish',exact:true}).click();
  await roster.getByRole('button',{name:'Edit Trish health'}).click();
  await roster.getByRole('spinbutton',{name:'Set Trish health'}).fill('1');
  await roster.getByRole('button',{name:'Set',exact:true}).click();
  await expect(roster.getByText('+1 Horror die')).toBeVisible();
  await roster.getByRole('button',{name:'Decrease Trish health'}).click();
  await expect(roster.getByRole('button',{name:'Trish',exact:true})).toContainText('Down');
  await expect(roster.getByRole('button',{name:'Baghead',exact:true})).toHaveAttribute('data-active','true');
  await roster.getByRole('button',{name:'Zeke',exact:true}).click();
  await expect(roster.getByRole('button',{name:'Zeke',exact:true})).toHaveAttribute('data-active','true');
  await roster.getByRole('button',{name:'Trish',exact:true}).click();
  await roster.getByRole('combobox',{name:'Resolve Trish at zero health'}).click();
  await page.getByRole('option',{name:'Blank · confirm death',exact:true}).click();
  await expect(roster.getByRole('button',{name:'Trish',exact:true})).toContainText('Dead');
  await undoLatestObservation(page);
  await roster.getByRole('button',{name:'Trish',exact:true}).click();
  await expect(roster.getByRole('combobox',{name:'Resolve Trish at zero health'})).toBeVisible();
  await roster.getByRole('combobox',{name:'Resolve Trish at zero health'}).click();
  await page.getByRole('option',{name:'Returns with 2 HP',exact:true}).click();
  await expect(roster.getByRole('button',{name:'Trish',exact:true})).toHaveText('Trish');
  await expect(roster.getByRole('button',{name:'Trish',exact:true})).toHaveAttribute('aria-description',/2 HP/);
  await openModule(page,'intruders');
  const panel=page.locator('.play-module-panel[data-module="intruders"]');
  await panel.locator('details.module-card-section > summary').click();
  await chooseKillerCard(panel,'Finale','Release the Beast');
  await openMinorPowers(panel);
  await panel.getByRole('button',{name:'Reveal Amphetamines'}).click();
  await expect(panel.getByRole('article',{name:'Amphetamines',exact:true})).toContainText('2/2 health');
  await panel.getByRole('button',{name:'Add another Minor Power'}).click();
  await panel.getByRole('button',{name:'Reveal Coordinated Attack'}).click();
  await expect(panel.getByRole('article',{name:'Coordinated Attack',exact:true})).toContainText('2/2 health');
  await page.getByRole('button',{name:'Dark Power',exact:true}).click();
  const remember=page.locator('.play-moment-editor');
  await chooseKillerCard(remember,'Dark Power','Won’t Stay Down');
  await expect(panel.getByRole('region',{name:'Dark Power selection',exact:true})).toContainText('Won’t Stay Down');
  await expect(remember.getByRole('combobox',{name:'Dark Power card'})).toHaveCount(0);
  await expect(roster.getByText('All Killers Active')).toBeVisible();
  for(const name of ['Trish','Baghead','Zeke'])await expect(roster.getByRole('button',{name,exact:true}).locator('img')).toHaveCSS('filter','none');
  await expect(roster.getByRole('button',{name:'Shift Active Killer up'})).toHaveCount(0);
  for(const [width,height] of info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]]){
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:'reduce'});
    for(const [name,subject] of [['roster',roster],['cards',panel]] as const){
      await subject.locator('img:visible').evaluateAll(async imgs=>Promise.all(imgs.map(img=>{
        const image=img as HTMLImageElement;
        image.loading='eager';
        return image.decode();
      })));
      await subject.screenshot({path:info.outputPath(`intruders-${name}-${width}.jpg`),type:'jpeg',quality:86,animations:'disabled',style:'.app-footer{visibility:hidden}'});
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(roster.getByText('All Killers Active')).toBeVisible();
  const log:PlayEvent[]=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,storageKey);
  expect(validPlayLog(log)).toBe(true);
  expect(summarizePlay(log)).toMatchObject({killed:0,finalHorrorLevel:3,bloodlust:0});
  expect(summarizePlay(log).killerHealth).toBeUndefined();
  expect(moduleState(summarizePlay(log).entries,'intruders')).toMatchObject({'trish.token':'white','trish.health':2,mode:'all'});
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('button',{name:'Won',exact:true}).click();
  await expect(page.getByRole('region',{name:'Intruders ending review'})).toContainText('Trish 2 HP');
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
  await expect(page.getByRole('region',{name:'Ending narration',exact:true})).toContainText(archive.endingText);
  const ending=archive.generationRequests.find(request=>request.name==='generate-ending')?.body;
  expect(ending?.playSummary).toContain('Trish 2 HP');
  expect(ending?.playSummary).toContain('All living Intruders active');
  expect(ending).not.toHaveProperty('killerHealth');
  await expect.poll(()=>archive.generationRequests.find(request=>request.name==='generate-scene-image'&&request.body.sceneType==='ending')?.body.scenarioRules).toContain('Trish 2 HP');
  await expect.poll(()=>Boolean(archive.releaseImage)).toBe(true);
  archive.releaseImage!();
  const poster=page.getByRole('img',{name:'Movie poster',exact:true});
  await expect(poster).toBeVisible();
  await poster.evaluate((image:HTMLImageElement)=>{image.loading='eager';});
  await poster.scrollIntoViewIfNeeded();
  await expect.poll(()=>poster.evaluate((image:HTMLImageElement)=>image.naturalWidth)).toBeGreaterThan(0);
  await expect(poster).toHaveCSS('object-fit','contain');
  await page.getByRole('button',{name:'Save to scrapbook',exact:true}).click();
  await expect.poll(()=>archive.history.length).toBe(1);
  expect(archive.history[0].killer_health).toBeNull();
});

test('legacy Intruders save retains the scalar history and starts with unrecorded figures',async({page,archive})=>{
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,
    selection:{...activeGame.selection,killer:'The Intruders',location:'Wingard Cottage'},
    playEvents:[newPlayEvent({kind:'start',round:2,saved:1,killed:0}),newPlayEvent({kind:'state',field:'killerHealth',value:9})]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const roster=page.getByRole('group',{name:'Intruder Killer Health tracker'});
  await expect(roster.locator('.intruder-portraits > button')).toHaveText(['Trish','Baghead','Zeke']);
  await expect(roster.locator('.intruder-portraits > button[aria-description="? HP"]')).toHaveCount(3);
  await expect(roster.locator('button[aria-pressed=true]')).toHaveCount(0);
  const log:PlayEvent[]=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,storageKey);
  expect(summarizePlay(log).killerHealth).toBe(9);
  expect(log).toHaveLength(2);
});

test('mixed-location death attribution, retry and cached playback use the recorded Intruder',async({page,archive})=>{
  await archive.install(page,{draft:{...activeGame,playMode:true,coreTrackersVersion:1,intrudersSetupVersion:1,
    selection:{...activeGame.selection,killer:'The Intruders',location:'Maple Lane',finalGirl:'Ginny'},playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const roster=page.getByRole('group',{name:'Intruder Killer Health tracker'});
  await expect(roster.locator('.intruder-portraits > button')).toHaveText(['Trish','Baghead','Zeke']);
  await page.evaluate(()=>{
    const prior=Storage.prototype.setItem;
    Object.assign(window,{restoreIntruderStorage:()=>{Storage.prototype.setItem=prior;}});
    Storage.prototype.setItem=function(key,value){
      if(key.startsWith('final-girl-active-game-v1:'))throw Error('test write failure');
      prior.call(this,key,value);
    };
  });
  await roster.getByRole('button',{name:'Baghead',exact:true}).click();
  await expect(roster.getByRole('alert')).toContainText('could not be saved');
  await expect(roster.getByRole('button',{name:'Trish',exact:true})).toHaveAttribute('data-active','true');
  await page.evaluate(()=>(window as unknown as {restoreIntruderStorage:()=>void}).restoreIntruderStorage());
  await roster.getByRole('button',{name:'Baghead',exact:true}).click();
  await expect(roster.getByRole('button',{name:'Baghead',exact:true})).toHaveAttribute('data-active','true');

  await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
  await dialog.getByRole('button',{name:'Killer attack',exact:true}).click();
  await expect(dialog.getByRole('combobox',{name:'Death attacker'})).toContainText('Unknown');
  await dialog.getByRole('combobox',{name:'Death attacker'}).click();
  await page.getByRole('option',{name:'Zeke',exact:true}).click();
  await dialog.getByRole('button',{name:'Gruesome Death',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await dialog.getByRole('button',{name:'Save and exit',exact:true}).click();
  const log:PlayEvent[]=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,storageKey);
  expect(log).toContainEqual(expect.objectContaining({kind:'killed',intruderReference:true}));
  expect(log).toContainEqual(expect.objectContaining({kind:'details',attacker:'Zeke'}));
  await roster.getByRole('button',{name:'Zeke',exact:true}).click();
  await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  expect(archive.calls.filter(name=>name==='generate-death-scene')).toHaveLength(1);
  await dialog.getByRole('button',{name:'Narrate death scene',exact:true}).click();
  await expect.poll(()=>archive.calls.includes('narrate-story')).toBe(true);
});

test('Rules search opens the source-reconciled Intruders chapter',async({page,archive})=>{
  archive.films=['s2-knock-at-door'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button',{name:'Rules',exact:true}).click();
  await page.getByRole('textbox',{name:'Search rules',exact:true}).fill("Won't Stay Down");
  await page.getByRole('tab',{name:'Special Rules',exact:true}).click();
  const rules=page.locator('#killer-the-intruders-rules');
  await expect(rules).toContainText('Won’t Stay Down (Epic)');
  await expect(rules).toContainText('Trish, Baghead, then Zeke');
});
