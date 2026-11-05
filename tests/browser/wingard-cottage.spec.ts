import { test, expect, activeGame, userId } from './fixtures';
import { openModule, searchPick, statusPick, undoLatestObservation } from './play-helpers';

test('Wingard Workbench records the physical offers and returns spent supplies', async ({page,archive},info) => {
  const selection={...activeGame.selection,killer:info.project.name==='mobile'?'Hans':'The Intruders',location:'Wingard Cottage',startingEvent:'Home Security'};
  await archive.install(page,{draft:{...activeGame,selection,playMode:true,playEvents:[],wingardSetupVersion:1}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'wingard-cottage');
  const panel=page.locator('[data-module="wingard-cottage"]');
  const nails=panel.getByRole('button',{name:'Nails: available',exact:true});
  await expect(nails).toBeVisible();
  await expect(nails.locator('img')).toHaveAttribute('src',/nails-tile/);
  await nails.click();
  await panel.getByRole('button',{name:'Add recipe'}).click();
  await panel.getByRole('combobox',{name:'Choose recipe'}).click();
  await page.getByRole('option',{name:'Nail Bat',exact:true}).click();
  await panel.getByRole('button',{name:'Record offer'}).click();
  const bat=panel.getByRole('button',{name:/Nail Bat/});
  await bat.click();
  await expect(panel.getByText(/Wooden Bat \+ Nails/)).toBeVisible();
  await expect(bat.locator('img')).toHaveAttribute('src',/nail-bat/);
  await panel.getByRole('button',{name:'Record craft'}).click();
  await expect(bat).toContainText('Crafted');
  await expect(nails).toBeVisible();
  const key=`final-girl-active-game-v1:${userId}`;
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,key);
  expect(saved.filter((event:{wingardAction?:{command:string}})=>event.wingardAction?.command==='craft')).toHaveLength(1);
  const sizes=info.project.name==='mobile'?[[390,844],[320,568]]:[[1280,640],[1366,768],[1440,900]];
  for(const [width,height] of sizes) {
    await page.setViewportSize({width,height});
    await panel.locator('img:visible').evaluateAll(images=>Promise.all(images.map(image=>{
      const img=image as HTMLImageElement; img.loading='eager'; return img.decode();
    })));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await panel.screenshot({path:info.outputPath(`wingard-${width}.jpg`),animations:'disabled',style:'.app-footer{visibility:hidden}'});
  }
});

test('Wingard legacy state, retry, Undo, live Events and death replay',async({page,archive},info)=>{
  test.setTimeout(90000);
  const selection={...activeGame.selection,killer:'Hans',location:'Wingard Cottage',startingEvent:'Home Security'};
  await archive.install(page,{draft:{...activeGame,selection,playMode:true,playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'wingard-cottage');
  const panel=page.locator('[data-module="wingard-cottage"]');
  const nails=panel.getByRole('button',{name:'Nails: unrecorded',exact:true});
  await expect(nails).toBeVisible();
  await expect(panel.getByRole('button',{name:/Home Security/})).toHaveCount(0);
  const key=`final-girl-active-game-v1:${userId}`;
  await page.evaluate(key=>{
    const set=Storage.prototype.setItem;
    (window as unknown as {restoreWingardStorage:()=>void}).restoreWingardStorage=()=>{Storage.prototype.setItem=set;};
    Storage.prototype.setItem=function(name,value){
      if(name===key)throw new Error('Synthetic full storage');
      return set.call(this,name,value);
    };
  },key);
  await nails.click();
  await expect(panel.getByRole('alert')).toContainText('could not be saved');
  await expect(nails).toBeVisible();
  await page.evaluate(()=>(window as unknown as {restoreWingardStorage:()=>void}).restoreWingardStorage());
  await nails.click();
  await expect(panel.getByRole('button',{name:'Nails: held',exact:true})).toBeVisible();
  await undoLatestObservation(page);
  await expect(nails).toBeVisible();
  await panel.getByRole('button',{name:'Record an event',exact:true}).click();
  await panel.getByRole('button',{name:/Home Security/}).click();
  await panel.getByRole('button',{name:/Home Security/}).click();
  await panel.getByRole('button',{name:/Activate · House clear/}).click();
  await panel.getByRole('button',{name:'Block entry',exact:true}).click();
  const alarm=panel.getByRole('button',{name:/Home Security/});
  await expect(alarm).toContainText('1/3 blocked');
  await expect(alarm.locator('img')).toHaveAttribute('src',/alarm-active-tile/);
  await panel.getByRole('button',{name:'Add Neighbor',exact:true}).click();
  await panel.getByRole('button',{name:/Boat.*At the lake/}).click();
  await statusPick(page,panel.getByRole('combobox',{name:'Boat party size including the Neighbor'}),'4');
  await panel.getByRole('button',{name:'Record boat escape',exact:true}).click();
  await expect(panel.getByRole('button',{name:/Boat escape/})).toContainText('4 saved');
  await expect(alarm).toContainText('1/3 blocked');
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'wingard-cottage');
  await expect(alarm).toContainText('1/3 blocked');
  await expect(panel.getByRole('button',{name:/Boat escape/})).toContainText('4 saved');
  await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Gruesome Death'});
  await dialog.getByRole('button',{name:'Event',exact:true}).click();
  await searchPick(page,'Death event card','Booby Traps');
  await searchPick(page,'Death location','Foyer');
  await expect(dialog.getByRole('button',{name:'Event',exact:true}).locator('img')).toHaveAttribute('src',/booby-traps-tile/);
  await dialog.screenshot({path:info.outputPath('wingard-death-edit.jpg'),animations:'disabled'});
  await dialog.getByRole('button',{name:'Gruesome Death',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await dialog.getByRole('button',{name:'Save and exit',exact:true}).click();
  await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
  await expect(page.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  expect(archive.calls.filter(call=>call==='generate-death-scene')).toHaveLength(1);
});

test('fresh Cottage casting reaches opening, ending, archive and Rules',async({page,archive})=>{
  test.setTimeout(90000);
  archive.films=['s2-knock-at-door'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button',{name:'START THE TAPE',exact:true}).click();
  for(const [index,name] of ['The Intruders','Wingard Cottage','Ginny'].entries()){
    await page.getByRole('button',{name:'Choose',exact:true}).nth(index).click();
    await page.getByRole('dialog').getByRole('button',{name:new RegExp(name)}).click();
  }
  await page.getByRole('button',{name:'Press Play',exact:true}).click();
  await expect(page.getByRole('region',{name:'Opening narration'})).toContainText(archive.storyText);
  const opening=archive.generationRequests.find(request=>request.name==='generate-story')!.body;
  expect(opening.location).toMatchObject({name:'Wingard Cottage'});
  expect(JSON.stringify(opening.location)).not.toContain('Sawed-off Shotgun');
  await page.getByRole('button',{name:'Enter Play mode',exact:true}).click();
  await openModule(page,'wingard-cottage');
  const panel=page.locator('[data-module="wingard-cottage"]');
  await expect(panel.getByRole('button',{name:'Nails: available',exact:true})).toBeVisible();
  await panel.getByRole('button',{name:'Add recipe'}).click();
  await statusPick(page,panel.getByRole('combobox',{name:'Choose recipe'}),'Nail Bat');
  await panel.getByRole('button',{name:'Record craft',exact:true}).click();
  await page.getByRole('button',{name:'Finish game',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Won',exact:true}).click();
  await page.getByRole('button',{name:'Generate ending',exact:true}).click();
  await expect(page.getByRole('region',{name:'Ending narration'})).toContainText(archive.endingText);
  const ending=archive.generationRequests.find(request=>request.name==='generate-ending')!.body;
  expect(ending.playSummary).toContain('Nail Bat');
  expect(ending.playSummary).toContain('Trish');
  await expect.poll(()=>archive.history[0]?.location).toBe('Wingard Cottage');
  await page.locator('footer').getByRole('button',{name:'RULES',exact:true}).click();
  await page.getByRole('textbox',{name:'Search rules',exact:true}).fill('Porcupine');
  await page.getByRole('tab',{name:'Special Rules',exact:true}).click();
  await expect(page.locator('#location-wingard-cottage-rules')).toContainText('Inherits the Trashcan Lid’s remaining uses');
});
