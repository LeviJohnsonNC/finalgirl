import { test, expect, activeGame, userId } from './fixtures';
import { openHistory } from './play-helpers';
const draft = {...activeGame,playMode:true,selection:{...activeGame.selection,killer:'Billy the Bear',location:'Buddyland',finalGirl:'Rena',filmId:'s4-buddyland'}};
const key = `final-girl-active-game-v1:${userId}`;
test('compact session actions fit small phones with the display font and a wider fallback', async ({page,archive}) => {
  await archive.install(page,{draft});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const actions = page.getByRole('navigation',{name:'Session actions'});
  for (const font of ['"IM Fell English", Georgia, serif','Arial, sans-serif']) {
    await page.addStyleTag({content:`.play-workspace .play-heading nav > button { font-family: ${font}; }`});
    for (const width of [320,359,360,390]) {
      await page.setViewportSize({width,height:900});
      const layout = await actions.evaluate(el => {
        const nav = el.getBoundingClientRect();
        return {available:el.clientWidth,needed:el.scrollWidth,buttons:Array.from(el.querySelectorAll('button'),button=>{
          const rect = button.getBoundingClientRect();
          return {label:button.getAttribute('aria-label'),left:rect.left-nav.left,right:rect.right-nav.left,top:rect.top-nav.top,height:rect.height};
        })};
      });
      expect(layout.needed,JSON.stringify({width,font,layout})).toBeLessThanOrEqual(layout.available);
      expect(new Set(layout.buttons.map(button=>button.top)).size).toBe(1);
      for (const button of layout.buttons) {
        expect(button.left).toBeGreaterThanOrEqual(0);
        expect(button.right).toBeLessThanOrEqual(layout.available + 1);
        expect(button.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
});
test('Ultimate unlocks once, keeps its artwork after reload and still accepts first-record details', async ({page,archive},info) => {
  await archive.install(page,{draft});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const ultimate = page.getByRole('button',{name:'Ultimate unlocked',exact:true});
  await expect(ultimate).toBeEnabled();
  await expect(ultimate).toContainText('Locked');
  const lockedArt = await ultimate.locator('img').getAttribute('src');
  await ultimate.click();
  await expect(ultimate).toBeDisabled();
  await expect(ultimate).toHaveAttribute('aria-pressed','true');
  await expect(ultimate).toContainText('Unlocked');
  const unlockedArt = await ultimate.locator('img').getAttribute('src');
  expect(unlockedArt).not.toBe(lockedArt);
  await page.getByLabel('Moment detail',{exact:true}).fill('The last victim escaped just in time.');
  await page.getByRole('button',{name:'Record',exact:true}).click();
  await page.getByRole('button',{name:'Save one victim',exact:true}).click();
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(ultimate).toBeDisabled();
  await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(ultimate).toBeDisabled();
  await expect(ultimate.locator('img')).toHaveAttribute('src',unlockedArt!);
  const log = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,key);
  expect(log.filter((e:{momentType?:string})=>e.momentType==='ultimate-unlocked')).toHaveLength(1);
  await openHistory(page);
  const entry = page.getByRole('region',{name:'Game timeline'}).locator('li').filter({has:page.locator('p',{hasText:'Ultimate unlocked'})});
  await expect(entry).toContainText('The last victim escaped just in time.');
  await expect(entry.getByRole('button',{name:/^Undo/})).toHaveCount(0);
  await ultimate.scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath('ultimate-unlocked.png'),animations:'disabled'});
});
test('sources and permanent milestones persist without repeat recording or Undo', async ({page,archive}) => {
  await archive.install(page,{draft});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(page.getByRole('group',{name:'Power sources'}).locator('[aria-pressed="true"]')).toHaveCount(4);
  await page.getByRole('button',{name:'Power source 2, On. Turn off'}).click();
  await page.getByRole('button',{name:'Add fifth power source'}).click();
  await page.getByRole('button',{name:'Power source 5, On. Turn off'}).click();
  for(const name of ['Dark Power','Finale','Second wind','Back from the dead']) {
    const button = page.getByRole('button',{name,exact:true});
    const original = await button.locator('img').getAttribute('src');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed','true');
    expect(await button.locator('img').getAttribute('src')).not.toBe(original);
    await page.getByRole('button',{name:'Record',exact:true}).click();
    await button.click();
    await page.getByRole('button',{name:'Record',exact:true}).click();
  }
  const log = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).playEvents,key);
  expect(log.filter((e:{kind:string})=>e.kind==='moment')).toHaveLength(4);
  await openHistory(page);
  const timeline = page.getByRole('region',{name:'Game timeline'});
  for(const type of ['Dark Power','Finale','Second wind','Back from the dead']) {
    const entry = timeline.locator('li').filter({has:page.locator('p',{hasText:type})});
    await expect(entry.getByRole('button',{name:/^Undo/})).toHaveCount(0);
  }
  // Undo skips the protected moments and corrects the last ordinary source observation.
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  await expect(page.getByRole('button',{name:'Back from the dead',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Power source 5, On. Turn off'})).toBeVisible();
  await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(page.getByRole('button',{name:'Power source 2, Off. Turn on'})).toBeVisible();
  for(const name of ['Dark Power','Finale','Second wind','Back from the dead']) await expect(page.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');
});
test('horror bands and critical health change artwork without inventing death or revival', async ({page,archive},info) => {
  await archive.install(page,{draft});await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(page.getByRole('button',{name:'Session options'})).toBeVisible();
  for (const name of ['Read story','Narrate introduction','Finish game']) {
    const bounds = await page.getByRole('button',{name,exact:true}).boundingBox();
    expect(bounds!.width).toBeLessThan(115);
    expect(bounds!.height).toBeLessThanOrEqual(44);
  }
  await page.screenshot({path:info.outputPath('play-header.png'),animations:'disabled'});
  for(const label of ['Final Girl health','Killer health','Bloodlust','Horror'])await page.getByRole('button',{name:`Track ${label}`,exact:true}).click();
  async function set(label:string,value:number) {
    await page.getByRole('button',{name:`Set ${label}`,exact:true}).click();
    await page.getByRole('textbox',{name:`${label} value`,exact:true}).fill(String(value));
    await page.getByRole('button',{name:'Set',exact:true}).click();
  }
  const horror = page.locator('.play-state--finalHorrorLevel');
  const seen = new Set<string>();
  for(const [value,band] of [[0,'low'],[1,'low'],[2,'mid'],[6,'mid'],[7,'high']] as const) {
    await set('Horror',value);await expect(horror).toHaveAttribute('data-horror',band);
    seen.add((await horror.locator('.play-stat-portrait').getAttribute('src'))!);
  }
  expect(seen.size).toBe(3);
  await set('Final Girl health',2);await set('Killer health',1);
  await expect(page.locator('.play-state--finalGirlHealth')).toHaveAttribute('data-critical','true');
  await expect(page.locator('.play-state--killerHealth')).toHaveAttribute('data-critical','true');
  await set('Final Girl health',0);
  await expect(page.locator('.play-state--finalGirlHealth')).toContainText('No health remaining');
  await expect(page.getByRole('button',{name:'Second wind',exact:true})).toHaveAttribute('aria-pressed','false');
  await expect(page.getByRole('button',{name:'Back from the dead',exact:true})).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.play-moment-choices svg')).toHaveCount(0);
  await expect(page.getByText('Rena reference',{exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('play-states.png'),fullPage:true,animations:'disabled'});
  await set('Bloodlust',99);
  await page.setViewportSize({width:320,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const controls = page.getByRole('navigation',{name:'Session actions'});
  expect(await controls.evaluate(el=>el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.getByRole('button',{name:'Read story',exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath('play-small-phone.png'),animations:'disabled'});
});
