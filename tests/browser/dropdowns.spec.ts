import {test,expect,activeGame} from './fixtures';
import type {Page,Locator} from '@playwright/test';

// Headless Chromium otherwise hides every scrollbar, masking the UI we need to verify.
test.use({launchOptions:{ignoreDefaultArgs:['--hide-scrollbars']}});

async function ordered(page:Page) {
  const names = await page.getByRole('option').allTextContents();
  expect(names.length).toBeGreaterThan(1);
  expect(names).toEqual([...names].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base',numeric:true,ignorePunctuation:true})));
  return names;
}
async function scrollable(viewport:Locator,page:Page) {
  const sizes = await viewport.evaluate(el=>({client:el.clientHeight,total:el.scrollHeight,gutter:(el as HTMLElement).offsetWidth-el.clientWidth,bar:getComputedStyle(el).scrollbarWidth,pseudo:getComputedStyle(el,'::-webkit-scrollbar').display}));
  expect(sizes.total).toBeGreaterThan(sizes.client);
  expect(sizes.bar).not.toBe('none');
  expect(sizes.pseudo).not.toBe('none');
  // Touch browsers draw overlay scrollbars rather than reserving desktop gutter space.
  if (!await page.evaluate(()=>matchMedia('(pointer:coarse)').matches)) expect(sizes.gutter).toBeGreaterThan(0);
  await viewport.hover();await page.mouse.wheel(0,1500);
  await expect.poll(()=>viewport.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
}
test('setup choices are alphabetical with a visible draggable scrollbar and keyboard selection',async({page,archive},info)=>{
  archive.films=['s4-buddyland'];await archive.install(page);await page.goto('/');
  await page.getByRole('button',{name:'START THE TAPE',exact:true}).click();
  for (const [index,name] of ['Billy the Bear','Buddyland','Rena'].entries()) {
    await page.getByRole('button',{name:'Choose',exact:true}).nth(index).click();
    await page.getByRole('dialog').getByRole('button',{name:new RegExp(name)}).click();
  }
  await page.getByRole('combobox',{name:'Setup Scenario',exact:true}).click();await ordered(page);
  await page.getByRole('option',{name:'Birthday Bash',exact:true}).click();
  const event = page.getByRole('combobox',{name:'Starting Event',exact:true});await event.click();
  const names=await ordered(page);const viewport=page.locator('[data-radix-select-viewport]');
  await scrollable(viewport,page);
  await page.screenshot({path:info.outputPath('setup-dropdown.png'),animations:'disabled'});
  await page.getByRole('option').last().press('End');await page.keyboard.press('Enter');
  await expect(event).toHaveText(names.at(-1)!);
});
test('death pickers browse every card without searching and stay sorted after selection',async({page,archive},info)=>{
  await archive.install(page,{draft:{...activeGame,playMode:true,selection:{...activeGame.selection,killer:'Billy the Bear',location:'Buddyland',finalGirl:'Rena'}}});
  await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
  await page.getByRole('button',{name:'Terror card',exact:true}).click();
  await page.getByRole('combobox',{name:'Terror card',exact:true}).click();
  const names=await ordered(page);await scrollable(page.locator('.play-search-menu [cmdk-list]'),page);
  await page.screenshot({path:info.outputPath('death-dropdown.png'),animations:'disabled'});
  await page.getByRole('option',{name:names.at(-1)!,exact:true}).click();
  await page.getByRole('combobox',{name:'Terror card',exact:true}).click();await ordered(page);
  await page.getByRole('combobox',{name:'Search Terror card',exact:true}).fill('a');await ordered(page);
  const menu=await page.locator('.play-search-menu').boundingBox();
  expect(menu!.y).toBeGreaterThanOrEqual(0);expect(menu!.y+menu!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
});
test('outcome suggestions are themed, browsable and retain custom text and selected rooms',async({page,archive},info)=>{
  const result={id:activeGame.id,timestamp:1,outcome:'won',killer:'Billy the Bear',location:'Buddyland',finalGirl:'Rena'};
  await archive.install(page,{draft:{...activeGame,phase:'outcome',result,selection:{...activeGame.selection,killer:result.killer,location:result.location,finalGirl:result.finalGirl}}});
  await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const weapon=page.getByLabel('Weapon Used',{exact:true});await weapon.click();const weapons=await ordered(page);
  await page.screenshot({path:info.outputPath('outcome-suggestions.png'),animations:'disabled'});
  await weapon.press('ArrowDown');await weapon.press('Enter');await expect(weapon).toHaveValue(weapons[0]);
  await expect(weapon).toHaveAttribute('aria-expanded','false');
  await weapon.fill('A sharpened crowbar');await weapon.press('Escape');
  const room=page.getByLabel('Ending Location',{exact:true});await room.click();await ordered(page);
  await scrollable(page.locator('.themed-suggestion-list'),page);
  await page.getByRole('option',{name:'Prize Counter',exact:true}).click();await expect(room).toHaveValue('Prize Counter');
  await page.getByLabel('Billy Finale (optional)',{exact:true}).click();await ordered(page);
  await page.getByRole('option',{name:'Power Surge',exact:true}).click();
  await page.getByLabel('Boris at Game End',{exact:true}).click();
  expect(await ordered(page)).toEqual(['Defeated','Not recorded','Still in play']);
  await page.getByRole('option',{name:'Defeated',exact:true}).click();
  await expect(page.locator('select,datalist')).toHaveCount(0);
  await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(weapon).toHaveValue('A sharpened crowbar');await expect(room).toHaveValue('Prize Counter');
});
test('revealed killer identities sort alphabetically and retain the selected identity',async({page,archive})=>{
  const result={id:activeGame.id,timestamp:1,outcome:'won',killer:'Mort the Teenage Dirtbag',location:'MegaBGCon',finalGirl:'Adrianne'};
  await archive.install(page,{draft:{...activeGame,phase:'outcome',result,selection:{...activeGame.selection,killer:result.killer,location:result.location,finalGirl:result.finalGirl}}});
  await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const identity=page.getByRole('combobox',{name:'Final Killer Identity',exact:true});await identity.click();
  expect(await ordered(page)).toEqual(['Big Bad Wolf','Dr. Fright','Evomorph','Geppetto','Hans','Inkanyamba','Mort','Ratchet Lady','The Intruders','The Organism','Unknown']);
  await page.getByRole('option',{name:'Geppetto',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(identity).toHaveText('Geppetto');
});
test('mobile rule chapter dropdown is themed, alphabetical and scrollable',async({page,archive},info)=>{
  archive.films=['s4-buddyland'];await archive.install(page);await page.setViewportSize({width:390,height:700});
  await page.goto('/');await page.getByRole('button',{name:'Rules',exact:true}).click();
  await page.getByRole('button',{name:'Open Game Overview',exact:true}).click();
  const chapters=page.getByRole('combobox',{name:'Choose chapter',exact:true});await chapters.click();
  await ordered(page);await scrollable(page.locator('[data-radix-select-viewport]'),page);
  await page.screenshot({path:info.outputPath('rules-dropdown.png'),animations:'disabled'});
  await page.getByRole('option',{name:'The Game Turn',exact:true}).click();
  await expect(page.getByRole('heading',{name:'The Game Turn',exact:true})).toBeVisible();
  await expect(page.locator('select,datalist')).toHaveCount(0);
});
