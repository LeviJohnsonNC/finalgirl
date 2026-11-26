import { activeGame, expect, test, userId } from './fixtures';
import { chooseKillerCard, openModule } from './play-helpers';
import { newPlayEvent, summarizePlay, type PlayEvent } from '../../src/lib/play/events';

test('Podarch moments, hostile transition, paired Finale and persistence', async ({page,archive}, info) => {
  test.setTimeout(90000);
  const key = 'final-girl-active-game-v1:' + userId;
  const log = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).playEvents as PlayEvent[], key);
  const start = newPlayEvent({kind:'start',round:1,saved:0,killed:0});
  const track = newPlayEvent({kind:'state',field:'bloodlust',value:3});
  await archive.install(page,{draft:{...activeGame, selection:{...activeGame.selection,killer:'The Podarchs',finalGirl:'Joan',filmId:'s4-terror-from-beyond'}, playMode:true,playEvents:[start,track]}});
  await page.goto('/');
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const panel = page.locator('[data-module="podarchs"]');
  await expect(panel.locator('summary').first()).toContainText('Docile');
  await expect(page.getByRole('group',{name:'Killer Health tracker'})).toHaveCount(0);
  await openModule(page,'podarchs');
  expect((await log()).length).toBe(2);
  await panel.getByRole('button',{name:/Victim assimilated/}).click();
  await expect.poll(async()=>summarizePlay(await log()).entries.length).toBe(3);
  expect(summarizePlay(await log())).toMatchObject({saved:0,killed:0,bloodlust:3});
  await page.getByRole('group',{name:'Bloodlust tracker'}).getByRole('button',{name:/increase bloodlust/i}).click();
  await expect(panel.locator('summary').first()).toContainText('Hostile');
  await panel.locator('.module-card-section > summary').click();
  await chooseKillerCard(panel,'Finale','Luxuriant Growth');
  const objective = panel.getByRole('region',{name:'Finale objective'});
  const heart = objective.getByRole('button',{name:/Remove one Greenhouse health/});
  for(let i=0;i<6;i++) await heart.first().click();
  await expect(objective).toContainText('Escape at an exit');
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(objective).toContainText('Escape at an exit');
  for(const [width,height] of (info.project.name==='desktop'?[[1280,640],[1366,768],[1440,900]]:[[320,568],[390,844]])){
    await page.setViewportSize({width,height});
    await panel.locator('img').evaluateAll(images=>Promise.all(images.map(image=>{const img=image as HTMLImageElement; img.loading='eager'; return img.decode();})));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await panel.screenshot({path:info.outputPath('podarch-panel-'+width+'.jpg')});
  }
});
