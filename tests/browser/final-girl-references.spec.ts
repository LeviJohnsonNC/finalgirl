import { test,expect,activeGame } from './fixtures';
import { searchPick,openHistory } from './play-helpers';
import type { Page } from '@playwright/test';
async function resume(page:Page){await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();}
test('character file is useful in Play without exposing a locked item or changing observations',async({page,archive},info)=>{
  await archive.install(page,{draft:{...activeGame,playMode:true}});await resume(page);
  const file=page.locator('.girl-play-file');
  await expect(file).not.toHaveAttribute('open','');
  await file.locator('summary').click();
  await expect(file.getByText('5 starting health',{exact:true})).toBeVisible();
  await expect(file.getByText('Secret item — not revealed')).toBeVisible();
  expect(archive.itemReads).toEqual([]);
  await file.getByRole('button',{name:'Ultimate side',exact:true}).click();
  await expect(file.getByText('When you are in the same space as an Enemy and inflict damage, deal 1 additional damage.')).toBeVisible();
  expect(archive.itemReads).toEqual([]);
  await page.getByRole('button',{name:'Save one victim'}).click();
  await page.getByRole('button',{name:'Ultimate unlocked',exact:true}).click();
  await expect(file.getByText('Ultimate recorded',{exact:true})).toBeVisible();
  expect(archive.itemReads).toEqual([]);
  for(const width of [320,390,1440]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  await file.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('character-file-play.png')});
  await openHistory(page);
  await expect(page.getByRole('region',{name:'Game timeline',exact:true})).not.toContainText('Private test reference');
  expect(archive.calls).toEqual([]);
});
test('unlock confirmation precedes retrieval; pending confirmation stays sealed and hide survives reload',async({page,archive},info)=>{
  archive.holdUnlock=true;
  await archive.install(page,{draft:{...activeGame,playMode:true}});await resume(page);
  const file=page.locator('.girl-play-file');await file.locator('summary').click();
  await file.getByRole('button',{name:'I have unlocked this item'}).click();
  await expect(page.getByRole('alertdialog')).toContainText('Have you unlocked Laurie’s item');
  expect(archive.itemReads).toEqual([]);
  await page.getByRole('button',{name:'Keep it hidden'}).click();
  expect(archive.itemReads).toEqual([]);
  await file.getByRole('button',{name:'I have unlocked this item'}).click();
  await page.getByRole('button',{name:'Confirm my unlock'}).click();
  await expect.poll(()=>Boolean(archive.releaseUnlock)).toBe(true);
  await expect(file.getByText('Secret item — not revealed')).toBeVisible();expect(archive.itemReads).toEqual([]);
  archive.holdUnlock=false;archive.releaseUnlock!();
  await expect(file.getByRole('heading',{name:'Private test reference'})).toBeVisible();
  await page.screenshot({path:info.outputPath('character-item-revealed.png')});
  await page.getByRole('button',{name:'Found a weapon/item',exact:true}).click();
  await searchPick(page,'Moment detail','Private test reference');
  // Opening a reference never records an Item; the existing picker does.
  await expect(page.getByRole('combobox',{name:'Moment detail',exact:true})).toContainText('Private test reference');
  await file.getByRole('button',{name:'Hide this item again'}).click();
  await expect(file.getByText('Secret item — not revealed')).toBeVisible();
  await expect.poll(()=>archive.unlocks.Laurie).toBe(false);
  await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await file.locator('summary').click();await expect(file.getByText('Secret item — not revealed')).toBeVisible();
  expect(archive.calls).toEqual([]);
});
test('Collection reuses the character file, and unavailable unlock services keep it sealed',async({page,archive},info)=>{
  archive.failUnlocks=true;await archive.install(page);await page.goto('/');
  await page.getByRole('button',{name:'Collection',exact:true}).click();
  await page.getByRole('button',{name:'Open Laurie character reference',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByText('Secret item — not revealed')).toBeVisible();
  await expect(dialog.getByRole('button',{name:'I have unlocked this item'})).toBeDisabled();
  await expect(dialog.getByText('Your unlocks could not be reached. Secret items stay hidden.')).toBeVisible();
  const image=dialog.getByRole('img',{name:'Laurie starting card',exact:true});
  await expect.poll(()=>image.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
  await page.screenshot({path:info.outputPath('character-file-collection.png')});
  expect(archive.itemReads).toEqual([]);expect(archive.calls).toEqual([]);
});
test('a mixed-film character uses her photographed starting health and never heals automatically on flip',async({page,archive})=>{
  await archive.install(page,{draft:{...activeGame,selection:{...activeGame.selection,finalGirl:'Kate',finalGirlStartingHealth:4},playMode:true}});await resume(page);
  await page.getByRole('button',{name:'Track Final Girl health',exact:true}).click();
  const file=page.locator('.girl-play-file');await file.locator('summary').click();
  await expect(file.getByText('4 starting health · 7 after flip',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Ultimate unlocked',exact:true}).click();
  await expect(file.getByText(/Your maximum health becomes 7/)).toBeVisible();
  // The physical card tells the player to heal; this remains an observation tool.
  await expect(page.getByRole('button',{name:'Set Final Girl health',exact:true})).toContainText('4');
  expect(archive.itemReads).toEqual([]);expect(archive.calls).toEqual([]);
});
