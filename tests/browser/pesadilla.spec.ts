import { activeGame, expect, test, userId } from './fixtures';
import { openMinorPowers, openModule, searchPick, setTracker } from './play-helpers';
import { newPlayEvent } from '../../src/lib/play/events';
import { freshPesadilla } from '../../supabase/functions/_shared/play/pesadilla';

const storageKey = "final-girl-active-game-v1:" + userId;
const playLog = [
  newPlayEvent({kind:'start',saved:4,killed:0,round:1}),
  newPlayEvent({kind:'state',field:'killerHealth',value:7}),
  newPlayEvent({kind:'state',field:'finalHorrorLevel',value:3}),
];

test('evacuation, write failure and Undo preserve an unrelated killer observation',async({page,archive},info)=>{
  const startingEvent='Get to the Choppa!';
  await archive.install(page,{draft:{
    ...activeGame, playMode:true, pesadillaSetupVersion:1,
    selection:{...activeGame.selection,killer:'Hans',location:'Pesadilla Verde',startingEvent},
    playEvents:[...playLog,newPlayEvent({kind:'module',moduleData:{module:'pesadilla-verde',changes:freshPesadilla('Hans',startingEvent)}})],
  }});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'pesadilla-verde');
  const panel=page.locator('[data-module="pesadilla-verde"]');
  await expect(panel.getByRole('button',{name:/The Huey/})).toContainText('Choppa rewards active');
  await panel.getByRole('button',{name:/The Huey/}).click();
  await panel.getByLabel('Victims newly saved').fill('3');
  await page.evaluate(k=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value) {
      if (key===k) {
        Storage.prototype.setItem=original;
        throw new Error('Storage is full');
      }
      original.call(this,key,value);
    };
  },storageKey);
  await panel.getByRole('button',{name:'Record evacuation',exact:true}).click();
  await expect(panel.getByRole('alert')).toContainText('could not be saved');
  await panel.getByRole('button',{name:'Record evacuation',exact:true}).click();
  await expect(page.getByRole('button',{name:'Save one victim',exact:true})).toContainText('7');
  await expect(panel.getByRole('button',{name:/The Huey/})).toContainText('Away');
  await panel.getByRole('button',{name:/The Huey/}).screenshot({path:info.outputPath('huey-away.jpg')});
  await setTracker(page,'Killer health',6);
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'pesadilla-verde');
  await expect(panel.getByRole('button',{name:/The Huey/})).toContainText('Away');
  const timeline=page.getByRole('button',{name:/^The night so far/});
  if (await timeline.getAttribute('aria-expanded')==='false') await timeline.click();
  await page.getByRole('button',{name:/^Undo Huey departed/}).click();
  await expect(page.getByRole('button',{name:'Save one victim',exact:true})).toContainText('4');
  await expect(page.getByRole('button',{name:'Set Killer health',exact:true})).toHaveText('6');
  await expect(panel.getByRole('button',{name:/The Huey/})).toContainText('Choppa rewards active');
  await panel.getByRole('button',{name:/The Huey/}).click();
  await panel.getByRole('button',{name:'Record departure only'}).click();
  await expect(page.getByRole('button',{name:'Save one victim',exact:true})).toContainText('4');
  await expect(panel.getByRole('button',{name:/The Huey/})).toContainText('Away');
});

test('the complete physical companion supports training, concurrent conditions and known people',async({page,archive},info)=>{
  await archive.install(page,{draft:{
    ...activeGame, playMode:true, pesadillaSetupVersion:1,
    selection:{...activeGame.selection,killer:'Hans',location:'Pesadilla Verde',startingEvent:'Piranhas!'},
    playEvents:[],
  }});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'pesadilla-verde');
  const panel=page.locator('[data-module="pesadilla-verde"]');
  await expect(panel.getByRole('button',{name:/Starting Move/})).toHaveAttribute('aria-pressed','true');
  await expect(panel.getByRole('button',{name:/Extra Move/})).toHaveAttribute('aria-pressed','false');
  await expect(panel.getByRole('button',{name:/Piranhas!/})).toContainText('River reach unrecorded');
  await panel.getByRole('button',{name:/Piranhas!/}).click();
  await panel.getByRole('button',{name:'Central River',exact:true}).click();
  await panel.getByText('Events, people and landmarks',{exact:true}).click();
  await panel.getByRole('button',{name:'Activate Heavy Rains',exact:true}).click();
  await panel.getByRole('button',{name:/Cave Exit open/}).click();
  await panel.getByRole('button',{name:/Cursed Temple No curse/}).click();
  await panel.getByRole('button',{name:/Cursed Idol/}).click();
  for (const name of ['Sgt. Weathers','Archeologist','Rebel Leader'])
    await panel.getByRole('button',{name:'Add '+name,exact:true}).click();
  await expect(panel.getByRole('button',{name:/Piranhas!/})).toContainText('Central River');
  await expect(panel.getByRole('button',{name:'End effect: Heavy Rains',exact:true})).toBeVisible();
  await panel.getByRole('button',{name:/Saving Soldiers/}).click();
  await expect(panel.getByRole('button',{name:/Saving Soldiers/})).toContainText('Free rescue');
  await panel.getByRole('button',{name:/No Friendly Fire/}).click();
  await panel.getByText('Soldier Event',{exact:true}).click();
  await panel.getByRole('button',{name:/Twitchy Soldiers Record/}).click();
  await expect(panel.getByText('Twitchy Soldiers · Friendly fire 1–3')).toBeVisible();
  await panel.getByRole('button',{name:/No Friendly Fire/}).click();
  await expect(panel.getByText('No friendly fire',{exact:true})).toBeVisible();
  await setTracker(page,'Horror',3);
  await panel.getByRole('button',{name:'Mark Sgt. Weathers killed',exact:true}).click();
  await panel.getByRole('button',{name:'Confirm Sgt. Weathers killed',exact:true}).click();
  await expect(page.getByRole('button',{name:'Set Horror',exact:true})).toHaveText('5');
  await panel.getByRole('button',{name:'Mark Archeologist saved',exact:true}).click();
  await openMinorPowers(panel);
  await panel.getByRole('button',{name:'Reveal Rivermaster',exact:true}).click();
  await expect(panel.getByRole('article',{name:'Rivermaster'})).toContainText('2/2 health');
  await panel.locator('img').evaluateAll(images=>images.forEach(image=>(image as HTMLImageElement).loading='eager'));
  await expect.poll(()=>panel.locator('img:visible').evaluateAll(images=>images.every(image=>image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  await page.addStyleTag({content:'footer { visibility: hidden; }'});
  for (const [width,height] of [[320,568],[390,844],[1280,640],[1366,768],[1440,900]]) {
    await page.setViewportSize({width,height});
    expect(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
    await panel.screenshot({path:info.outputPath(`pesadilla-${width}.jpg`)});
  }
});

test('Podarch rescues remove the chosen Minor before a departure-only Huey record',async({page,archive})=>{
  await archive.install(page,{draft:{
    ...activeGame,playMode:true,pesadillaSetupVersion:1,
    selection:{...activeGame.selection,killer:'The Podarchs',location:'Pesadilla Verde'},
    playEvents:[playLog[0],newPlayEvent({kind:'module',moduleData:{module:'pesadilla-verde',changes:freshPesadilla('The Podarchs')}})],
  }});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'pesadilla-verde');
  const location=page.locator('[data-module="pesadilla-verde"]');
  await openMinorPowers(location);
  await location.getByRole('button',{name:'Activate Rivermaster',exact:true}).click();
  await expect(location.getByRole('button',{name:'End effect: Rivermaster',exact:true})).toBeVisible();
  await expect(location.getByRole('button',{name:/Health.*Rivermaster/})).toHaveCount(0);
  await page.getByRole('button',{name:'Save one victim',exact:true}).click();
  await expect(page.getByRole('button',{name:'Save one victim',exact:true})).toContainText('5');
  await expect(location.getByRole('button',{name:'Activate Rivermaster',exact:true})).toHaveAttribute('aria-disabled','true');
  await location.getByRole('button',{name:/The Huey/}).click();
  await expect(location.getByLabel('Victims newly saved')).toHaveCount(0);
  await location.getByRole('button',{name:'Record departure only',exact:true}).click();
  await expect(location.getByRole('button',{name:/The Huey/})).toContainText('Away');
  await expect(page.getByRole('button',{name:'Save one victim',exact:true})).toContainText('5');
});

test('searchable Rules link the publisher and distinguish the two river exceptions',async({page,archive})=>{
  archive.films=['s4-green-terror'];
  await archive.install(page);
  await page.goto('/');
  await page.getByRole('button',{name:'Rules',exact:true}).click();
  await page.getByRole('textbox',{name:'Search rules',exact:true}).fill('Rivermaster');
  await page.getByRole('tab',{name:'Special Rules',exact:true}).click();
  const article=page.locator('#location-pesadilla-verde-rules');
  await expect(article).toContainText('Wet Suit');
  await expect(article).toContainText('Rivermaster');
  await expect(article).toContainText('Cursed Idol');
  await page.getByRole('textbox',{name:'Search rules',exact:true}).fill('High Ground');
  await page.getByRole('tab',{name:'Special Setup',exact:true}).click();
  const setup=page.locator('#location-pesadilla-verde-setup');
  await expect(setup).toContainText('River Rats');
  await expect(setup.getByRole('link',{name:'Official Pesadilla Verde rulebook'})).toHaveAttribute('href',/FG_FF19_PesadillaVerde_Rules\.pdf/);
});

test('a Piranhas death retains its historical reach through replay and narration',async({page,archive},info)=>{
  await archive.install(page,{draft:{
    ...activeGame,playMode:true,pesadillaSetupVersion:1,
    selection:{...activeGame.selection,location:'Pesadilla Verde',startingEvent:'Piranhas!'},
    playEvents:[...playLog,newPlayEvent({kind:'module',moduleData:{module:'pesadilla-verde',changes:freshPesadilla('Hans','Piranhas!')}})],
  }});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'pesadilla-verde');
  const panel=page.locator('[data-module="pesadilla-verde"]');
  await panel.getByRole('button',{name:/Piranhas!/}).click();
  await panel.getByRole('button',{name:'Lower River',exact:true}).click();
  await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
  await dialog.getByRole('button',{name:'Event',exact:true}).click();
  await searchPick(page,'Death event card','Piranhas!');
  await searchPick(page,'Death location','Lower River');
  await dialog.getByRole('button',{name:'Event',exact:true}).screenshot({path:info.outputPath('piranhas-death.jpg')});
  await dialog.getByRole('button',{name:'Gruesome Death',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await dialog.getByRole('button',{name:'Save and exit',exact:true}).click();
  await panel.getByRole('button',{name:/Piranhas!/}).click();
  await panel.getByRole('button',{name:'Upper River',exact:true}).click();
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await openModule(page,'pesadilla-verde');
  await expect(panel.getByRole('button',{name:/Piranhas!/})).toContainText('Upper River');
  await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
  await expect(dialog.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
  await dialog.getByRole('button',{name:'Narrate death scene',exact:true}).click();
  await expect.poll(()=>archive.calls.includes('narrate-story')).toBe(true);
  expect(archive.calls.filter(name=>name==='generate-death-scene')).toHaveLength(1);
});
