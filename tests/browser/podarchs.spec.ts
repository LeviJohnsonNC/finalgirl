import { activeGame, expect, test, userId } from './fixtures';
import { chooseKillerCard, openModule, openMinorPowers, showMinorChoices } from './play-helpers';
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
  await page.getByRole('button',{name:'View Joan info',exact:true}).click();
  const dossier = page.getByRole('dialog');
  await dossier.locator('.girl-ability > summary').click();
  await expect(dossier).toContainText('Weak Attack');
  await expect(dossier).toContainText('Take any top Item card');
  await dossier.screenshot({path:info.outputPath('joan-dossier.jpg')});
  await page.keyboard.press('Escape');
  const panel = page.locator('[data-module="podarchs"]');
  const banner = panel.locator(':scope > summary');
  await expect(banner).toContainText('Docile');
  await banner.screenshot({path:info.outputPath('docile-banner.jpg')});
  await expect(page.getByRole('group',{name:'Killer Health tracker'})).toHaveCount(0);
  await openModule(page,'podarchs');
  expect((await log()).length).toBe(2);
  const assimilation = panel.getByRole('button',{name:/Victim assimilated/});
  const receipt = page.getByText('Victim assimilation recorded', { exact: true });
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) {
        Storage.prototype.setItem = original;
        throw new Error('Synthetic storage failure');
      }
      return original.call(this, name, value);
    };
  }, key);
  await assimilation.click();
  await expect(panel.getByRole('alert')).toContainText('could not be saved');
  await expect(receipt).toHaveCount(0);
  expect(await log()).toHaveLength(2);
  await assimilation.click();
  await expect(receipt).toBeVisible();
  await expect.poll(async()=>summarizePlay(await log()).entries.length).toBe(3);
  expect(summarizePlay(await log())).toMatchObject({saved:0,killed:0,bloodlust:3});
  await page.getByRole('group',{name:'Bloodlust tracker'}).getByRole('button',{name:/increase bloodlust/i}).click();
  await expect(banner).toContainText('Hostile');
  await banner.screenshot({path:info.outputPath('hostile-banner.jpg')});
  await openMinorPowers(panel);
  await panel.getByRole('button',{name:'Activate Targeted Growth'}).click();
  await showMinorChoices(panel);
  await panel.getByRole('button',{name:'Activate Sense of Urgency'}).click();
  await panel.getByRole('button',{name:'End effect: Sense of Urgency'}).screenshot({
    style:'[data-sonner-toaster] { visibility: hidden; }',
    path:info.outputPath('sense-of-urgency.jpg'),
  });
  await page.getByRole('button',{name:'Save one victim',exact:true}).click();
  await page.getByRole('group',{name:'Choose a Minor to discard for this rescue'}).getByRole('button',{name:'Targeted Growth'}).click();
  await expect.poll(async()=>summarizePlay(await log()).saved).toBe(1);
  const remember = page.getByRole('region',{name:'Remember this',exact:true});
  await remember.getByRole('button',{name:'Finale',exact:true}).click();
  await chooseKillerCard(remember,'Finale','Luxuriant Growth');
  await remember.getByRole('button',{name:'Record',exact:true}).click();
  await expect(panel.locator('.module-card-section')).toHaveAttribute('open','');
  await chooseKillerCard(panel,'Dark Power','Obstinate Victims');
  const objective = panel.getByRole('region',{name:'Finale objective'});
  const heart = objective.getByRole('button',{name:/Remove one Greenhouse health/});
  for(let i=0;i<6;i++) await heart.first().click();
  await expect(objective).toContainText('Escape at an exit');
  await page.reload();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  await expect(objective).toContainText('Escape at an exit');
  for(const [width,height] of (info.project.name==='desktop'?[[1280,640],[1366,768],[1440,900]]:[[320,568],[390,844]])){
    await page.setViewportSize({width,height});
    const images = panel.locator('img');
    await images.evaluateAll(elements => {
      for (const image of elements) (image as HTMLImageElement).loading = 'eager';
    });
    await expect.poll(() => images.evaluateAll(elements => elements.every(element => {
      const image = element as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    }))).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await panel.scrollIntoViewIfNeeded();
    await panel.screenshot({animations:'disabled',style:'footer { visibility: hidden; }',path:info.outputPath('podarch-panel-'+width+'.jpg')});
  }
  const finale = panel.getByRole('region',{name:'Finale selection',exact:true});
  const hero = finale.locator('.module-revealed-hero');
  const scene = hero.locator('.module-revealed-art img');
  const expectCorrectionBelow = async () => {
    const cardBottom = await hero.evaluate(element => element.getBoundingClientRect().bottom);
    const correctionTop = await finale.getByRole('button', {name:'Clear Finale card name',exact:true})
      .evaluate(element => element.getBoundingClientRect().top);
    expect(correctionTop).toBeGreaterThanOrEqual(cardBottom);
  };
  await chooseKillerCard(panel,'Finale','Born Again');
  await expect(assimilation).toHaveCount(0);
  const countdown = objective.getByLabel('Countdown remaining');
  for (const count of [6, 5, 4, 3, 2, 1, 0]) {
    if (count !== 6) {
      await countdown.click();
      await page.getByRole('option',{name:`${count} remaining`,exact:true}).click();
    }
    await expect(countdown).toHaveText(`${count} remaining`);
    await expect(scene).toHaveAttribute('src',new RegExp(`/countdown-${count}(?:-[\\w-]+)?\\.webp$`));
    await expect.poll(() => scene.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await hero.screenshot({path:info.outputPath(`countdown-${count}.jpg`)});
  }
  await expect(objective).toContainText('start of the Killer phase');
  await expectCorrectionBelow();
  await chooseKillerCard(panel,'Finale','You’re Next!');
  await expect(hero).toHaveCount(1);
  await expect(hero.getByRole('group',{name:'Leader health'}).getByRole('button')).toHaveCount(5);
  await expectCorrectionBelow();
  await hero.screenshot({path:info.outputPath('youre-next.jpg')});
  if (info.project.name === 'mobile') {
    await page.setViewportSize({width:320,height:568});
    const bounds = (await hero.boundingBox())!;
    const hearts = await hero.getByRole('group',{name:'Leader health'}).getByRole('button').last().boundingBox();
    expect(hearts!.x + hearts!.width).toBeLessThanOrEqual(bounds.x + bounds.width);
  }
  const leaderHeart = objective.getByRole('button',{name:/Remove one Leader health/});
  for(let i=0;i<5;i++) await leaderHeart.first().click();
  await objective.getByLabel('Leader Final Health').click();
  await page.getByRole('option',{name:'Leader defeated',exact:true}).click();
  const summary = summarizePlay(await log());
  expect(summary.killed).toBe(0);
  expect(summary.saved).toBe(1);
});

test('Collection and mixed-cast Rules show the photographic references without adding observations', async ({page, archive}, info) => {
  archive.films = ['s4-terror-from-beyond','s1-camp-happy-trails'];
  archive.aiCastingArt = true;
  await archive.install(page, {draft:{...activeGame, selection:{...activeGame.selection, killer:'The Podarchs', finalGirl:'Laurie', location:'Camp Happy Trails'}, playMode:true, playEvents:[]}});
  await page.goto('/');
  await page.getByRole('button',{name:'Collection',exact:true}).click();
  const card = page.locator('[data-film-id="s4-terror-from-beyond"]');
  await expect(card).toContainText('Your choice');
  await expect(card.getByRole('button',{name:'View Joan info'})).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  const cover = card.getByRole('img',{name:'Terror From Beyond box art',exact:true});
  await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBe(509);
  await card.screenshot({path:info.outputPath('podarch-collection.jpg')});
  await page.locator('footer').getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
  const readLog = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).playEvents as PlayEvent[], 'final-girl-active-game-v1:'+userId);
  await expect.poll(async () => (await readLog()).map(entry => entry.kind)).toEqual(['start']);
  const before = await readLog();
  await openModule(page,'camp');
  await expect(page.locator('[data-module="camp"]')).not.toContainText('Special characters');
  await page.getByRole('button',{name:'Read story',exact:true}).click();
  await page.getByRole('button',{name:'Special Rules',exact:true}).click();
  const dialog = page.getByRole('dialog',{name:'Special Rules'});
  await dialog.getByRole('tab',{name:'Rules',exact:true}).click();
  await expect(dialog.getByRole('tabpanel')).toContainText('Evolution');
  const stills = dialog.locator('.podarch-rule-stills');
  await expect(stills.locator('img')).toHaveCount(8);
  const gallery = stills.last();
  const photos = gallery.locator('img');
  await photos.evaluateAll(images => {
    for (const image of images) (image as HTMLImageElement).loading = 'eager';
  });
  await expect.poll(() => photos.evaluateAll(images => images.every(element => {
    const image = element as HTMLImageElement;
    return image.complete && image.naturalWidth > 0;
  }))).toBe(true);
  await gallery.screenshot({path:info.outputPath('podarch-terror-rules.jpg')});
  expect(await readLog()).toEqual(before);
});
