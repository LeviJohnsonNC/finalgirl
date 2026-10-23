import { resolve } from 'node:path';
import { test, expect, activeGame, userId, installTestAudio } from './fixtures';
import { openModule, searchPick } from './play-helpers';
import type { Page } from '@playwright/test';

const start = {id:'22222222-2222-4222-8222-222222222222',at:1,kind:'start',saved:0,killed:0,round:2};
const draft = {...activeGame,playMode:true,geppettoSetupVersion:1,carnivalSetupVersion:1,
 selection:{...activeGame.selection,killer:'Geppetto',location:'Carnival of Blood'},playEvents:[start]};
async function resume(page:Page) {await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await page.evaluate(()=>document.fonts.ready);}
const log = (page:Page) => page.evaluate(owner => JSON.parse(localStorage.getItem('final-girl-active-game-v1:'+owner)!).playEvents,userId);
async function actionsVisible(page:Page) {
 const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
 for(const name of ['Cancel','Save and exit']) await expect(dialog.getByRole('button',{name,exact:true})).toBeInViewport({ratio:1});
 await expect(dialog.locator('.play-gruesome-action')).toBeInViewport({ratio:1});
 const frame=(await dialog.boundingBox())!;const footer=(await dialog.locator('.play-death-actions').boundingBox())!;
 expect(footer.y+footer.height).toBeLessThanOrEqual(frame.y+frame.height+1);
 expect(await dialog.evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
}

test('death editing, loading, reading, corrections and errors keep laptop/phone actions anchored',async({page,archive},info)=>{
 if(info.project.name==='desktop') await page.setViewportSize({width:1280,height:640});
 else await page.setViewportSize({width:320,height:568});
 archive.deathText=Array.from({length:5},()=>archive.deathText).join('\n\n');
 await archive.install(page,{draft});await installTestAudio(page);await resume(page);
 await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
 await dialog.getByRole('button',{name:'Puppet / minion',exact:true}).click();
 await actionsVisible(page);await searchPick(page,'Death attacker','Puppet 2');
 await dialog.getByRole('textbox',{name:'Death context',exact:true}).fill('At the puppet theatre.');
 await page.screenshot({path:info.outputPath('death-editing.png')});
 archive.holdDeath=true;await dialog.getByRole('button',{name:'Gruesome Death',exact:true}).click();
 await expect.poll(()=>Boolean(archive.releaseDeath)).toBe(true);await actionsVisible(page);
 await expect(dialog.getByRole('button',{name:'Edit death details',exact:true})).toBeDisabled();
 await page.screenshot({path:info.outputPath('death-loading.png')});
 archive.holdDeath=false;archive.releaseDeath!();
 await expect(dialog.getByRole('region',{name:'Generated death scene',exact:true})).toContainText('The ceiling');
 await actionsVisible(page);
 const prose=dialog.getByRole('region',{name:'Death scene text',exact:true});
 expect((await prose.boundingBox())!.height).toBeGreaterThan(100);
 expect(await prose.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
 await prose.focus();await prose.press('End');await expect.poll(()=>prose.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
 await actionsVisible(page);await prose.press('Home');await page.screenshot({path:info.outputPath('death-reading.png')});
 for (const size of info.project.name==='desktop' ? [{width:1366,height:768},{width:1440,height:900}] : [{width:390,height:844}]) {
  await page.setViewportSize(size);await actionsVisible(page);
  expect((await prose.boundingBox())!.height).toBeGreaterThan(100);
  await page.screenshot({path:info.outputPath(`death-reading-${size.width}.png`)});
 }
 await dialog.getByRole('button',{name:'Narrate death scene',exact:true}).click();
 await expect(dialog.getByRole('button',{name:'Stop death narration',exact:true})).toBeVisible();await actionsVisible(page);
 await dialog.getByRole('button',{name:'Stop death narration',exact:true}).click();
 await dialog.getByRole('button',{name:'Edit death details',exact:true}).click();
 await expect(dialog.getByRole('textbox',{name:'Death context',exact:true})).toHaveValue('At the puppet theatre.');
 const before=await log(page);
 await dialog.getByRole('textbox',{name:'Death context',exact:true}).fill('An unsaved correction.');
 await actionsVisible(page);await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 expect(await log(page)).toEqual(before);
 await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
 await expect(prose).toContainText('The ceiling');
 expect(archive.calls.filter(c=>c==='generate-death-scene')).toHaveLength(1);
 await dialog.getByRole('button',{name:'Edit death details',exact:true}).click();
 await dialog.getByRole('button',{name:'Terror card',exact:true}).click();
 await expect(dialog.getByRole('combobox',{name:'Terror card',exact:true})).toBeVisible();
 await expect(dialog.getByRole('combobox',{name:'Death attacker',exact:true})).toHaveCount(0);
 archive.failDeaths=true;await dialog.getByRole('button',{name:'Gruesome Death',exact:true}).click();
 await expect(dialog.getByRole('region',{name:'Death scene result',exact:true})).toContainText('Scene unavailable');await actionsVisible(page);
 await page.screenshot({path:info.outputPath('death-error.png')});
});

test('killer selection, Epic borders and rules disclosure stay distinct and never write gameplay',async({page,archive},info)=>{
 await archive.install(page,{draft});await resume(page);await openModule(page,'geppetto');
 const panel=page.locator('[data-module="geppetto"]');
 await panel.locator('.module-card-section > summary').click();
 const cards=panel.getByRole('region',{name:'Dark Power selection',exact:true});
 const selected=cards.getByRole('button',{name:'Choose Massive Abominations',exact:true});
 const epic=cards.getByRole('button',{name:'Choose Join the Family',exact:true});
 await selected.click();await expect(selected).toHaveAttribute('aria-pressed','true');
 await expect(epic).toHaveAttribute('data-epic','true');
 await expect.poll(()=>selected.locator('.play-module-art').evaluate(el=>getComputedStyle(el).filter)).toBe('none');
 const dimming=await epic.locator('.play-module-art').evaluate(el=>Number(getComputedStyle(el).filter.match(/brightness\(([.\d]+)\)/)?.[1] ?? 1));
 expect(dimming).toBeLessThanOrEqual(.45);
 await expect(panel.locator('.module-selected-card')).toHaveCount(0);
 const before=await log(page);await cards.locator('.module-card-rules > summary').click();
 await expect(cards.locator('.module-card-rules')).toContainText('first damage');expect(await log(page)).toEqual(before);
 await epic.click();await expect(epic).toHaveAttribute('aria-pressed','true');
 await expect(epic).toHaveAttribute('data-epic','true');await expect(selected).toHaveAttribute('aria-pressed','false');
 await cards.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('killer-epic-selected.png')});
 await page.getByRole('button',{name:'Dark Power',exact:true}).click();
 const remembered=page.locator('.play-moment-editor');await expect(remembered.getByRole('button',{name:'Choose Join the Family',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Ultimate used',exact:true}).click();
 await expect(page.getByText('Details are optional.',{exact:false})).toHaveCount(0);
 await openModule(page,'carnival');const carnival=page.locator('[data-module="carnival"]');
 await carnival.locator('.carnival-section > summary').filter({hasText:'Item Trap encounters'}).click();
 const cobra=carnival.locator('.carnival-item-traps > article').filter({hasText:'Hidden Cobra Trap'});
 const rule=cobra.getByText('Place beside the Final Girl.',{exact:false});await expect(rule).not.toBeVisible();
 const logBefore=await log(page);await cobra.locator('.module-card-rules > summary').click();await expect(rule).toBeVisible();expect(await log(page)).toEqual(logBefore);
 await expect(carnival).not.toContainText('Record what actually happened');
 if(info.project.name==='mobile') {await page.setViewportSize({width:320,height:568});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

test('ending poster reclaims image area while the surrounding laptop layout stays fixed',async({page,archive},info)=>{
 test.skip(info.project.name!=='desktop','Desktop-only fit; existing narration tests cover mobile');
 const posterUrl='http://127.0.0.1:4173/polish-poster.png';
 await archive.install(page,{draft:{...activeGame,phase:'ending',endingStory:'Laurie reached the road. '.repeat(100),posterImageUrl:posterUrl,result:{...activeGame.selection,id:activeGame.id,timestamp:1,outcome:'won'},formData:{finalGirlHealth:2}}});
 await page.route('**/polish-poster.png',route=>route.fulfill({contentType:'image/png',path:resolve('src/assets/scrapbooks/final-girl-cover.png')}));
 await resume(page);const poster=page.getByRole('img',{name:'Movie poster',exact:true});await poster.evaluate((img:HTMLImageElement)=>img.decode());
 for(const size of [{width:1280,height:640},{width:1366,height:768},{width:1440,height:900}]) {
 await page.setViewportSize(size);await page.evaluate(()=>document.fonts.ready);
 const image=(await poster.boundingBox())!;const reader=await page.locator('.narration-reader').boundingBox();const header=await page.locator('.ending-header').boundingBox();
 // Recreate only the former internal mat/fit, keeping this same layout and image.
 const old=await page.addStyleTag({content:`.narration-layout--ending .ending-poster-window{display:block;flex:0 1 auto;height:calc(100cqw * 1.5 + 20px)}.narration-layout--ending .ending-poster-window > .narration-photo-mount{width:min(100cqw,calc((100cqh - 20px) * 2 / 3));padding:20px 20px 16px}.narration-layout--ending .narration-photo--poster .narration-photo-edge{border-width:30px}`});
 const before=(await poster.boundingBox())!;
 expect(await page.locator('.narration-reader').boundingBox()).toEqual(reader);expect(await page.locator('.ending-header').boundingBox()).toEqual(header);
 await old.evaluate(el=>el.parentNode?.removeChild(el));
 await expect.poll(async()=> (await poster.boundingBox())!.width).toBeCloseTo(image.width,0);
 const gain=(image.width*image.height)/(before.width*before.height)-1;
 console.log('Poster image-area gain',size,Math.round(gain*100)+'%',before,image);
 expect(gain).toBeGreaterThan(.10);expect(image.width/image.height).toBeCloseTo(2/3,2);
 await expect(poster).toBeInViewport({ratio:1});await expect(page.getByRole('button',{name:'Reshoot',exact:true})).toBeInViewport({ratio:1});
 await page.screenshot({path:info.outputPath(`ending-${size.width}.png`)});
 }
});
