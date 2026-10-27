import { test, expect, activeGame, userId, installTestAudio } from './fixtures';
import { openModule, searchPick } from './play-helpers';
import { deathFacts } from '../../src/lib/play/death';
import type { PlayEvent } from '../../src/lib/play/events';
const key = `final-girl-active-game-v1:${userId}`;
for (const location of ['Camp Happy Trails', 'Buddyland', 'Carnival of Blood', 'Maple Lane', 'Sacred Groves', 'Creech Manor']) {
    test(`Poltergeist rescue and ownership at ${location}`, async ({ page, archive }, info) => {
        await archive.install(page, { draft: { ...activeGame, poltergeistSetupVersion: 1, playMode: true, selection: { ...activeGame.selection, killer: 'Poltergeist', location } } });
        await page.goto('/');
        await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
        await openModule(page, 'poltergeist');
        const panel = page.locator('[data-module="poltergeist"]');
        await expect(panel.getByRole('button', { name: 'View Carolyn actions' })).toBeVisible();
        await panel.getByRole('button', { name: 'Activate Psychic Confusion', exact: true }).click();
        await panel.getByRole('button', { name: 'Add another Minor Power', exact: true }).click();
        await panel.getByRole('button', { name: 'Activate Unseen Forces', exact: true }).click();
        await expect(panel.getByRole('button', { name: 'End effect: Psychic Confusion', exact: true })).toHaveAttribute('aria-pressed', 'true');
        await panel.getByRole('button', { name: 'View Carolyn actions' }).click();
        await panel.getByRole('button', { name: 'Carolyn joins you', exact: true }).click();
        await expect.poll(() => page.evaluate(key => { const es = JSON.parse(localStorage.getItem(key)!).playEvents; return es.filter((e: {
            moduleData?: {
                module: string;
                changes: Record<string, unknown>;
            };
        }) => e.moduleData?.module === 'poltergeist').at(-1)?.moduleData.changes; }, key)).toMatchObject({ carolyn: 'with-you', minorsRemoved: true, 'minor.psychic-confusion': 'removed', 'minor.unseen-forces': 'removed' });
        await expect(panel.getByRole('button', { name: 'Activate Psychic Confusion', exact: true })).toHaveAttribute('aria-disabled', 'true');
        await panel.getByRole('button', { name: 'Shuffle Carolyn back', exact: true }).click();
        await panel.getByRole('button', { name: 'Carolyn joins you', exact: true }).click();
        await panel.getByRole('button', { name: 'Record Carolyn rescued', exact: true }).click();
        await expect(panel.getByRole('button', { name: 'View Carolyn actions' })).toContainText('Rescued');
        await page.reload();
        await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
        await openModule(page, 'poltergeist');
        await expect(panel.getByRole('button', { name: 'View Carolyn actions' })).toContainText('Rescued');
        await expect(page.getByRole('button', { name: 'Back from the dead', exact: true })).toHaveCount(0);
        for (const size of info.project.name === 'mobile' ? [{ width: 390, height: 844 }, { width: 320, height: 568 }] : [{ width: 1280, height: 640 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }]) {
            await page.setViewportSize(size);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            await panel.screenshot({ path: info.outputPath(`${location.replaceAll(' ', '-')}-${size.width}.png`), animations: 'disabled', style: '.app-footer {visibility:hidden}' });
        }
        expect(archive.calls).toEqual([]);
    });
}
test('Epic escape, shared reveal correction, and ordinary Power protection', async ({ page, archive }, info) => {
    await archive.install(page, { draft: { ...activeGame, poltergeistSetupVersion: 1, playMode: true, selection: { ...activeGame.selection, killer: 'Poltergeist', location: 'Camp Happy Trails' } } });
    await page.goto('/');
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    await openModule(page, 'poltergeist');
    const panel = page.locator('[data-module="poltergeist"]');
    await panel.getByText('Dark Power & Finale', { exact: true }).click();
    await panel.getByRole('button', { name: 'Choose Forgetting Something?', exact: true }).click();
    await panel.getByRole('button', { name: 'View Carolyn actions' }).click();
    await panel.getByRole('button', { name: 'Carolyn joins you', exact: true }).click();
    await expect(panel.getByRole('button', { name: 'Record Carolyn rescued', exact: true })).toBeDisabled();
    await panel.getByRole('button', { name: 'View Mr. Floppy actions' }).click();
    await panel.getByRole('button', { name: 'Found Mr. Floppy', exact: true }).click();
    await panel.getByRole('button', { name: 'View Carolyn actions' }).click();
    await expect(panel.getByRole('button', { name: 'Record Carolyn rescued', exact: true })).toBeEnabled();
    await panel.getByRole('button', { name: 'View Mr. Floppy actions' }).click();
    await expect(panel.getByRole('button', { name: 'Protect Carolyn', exact: true })).toBeDisabled();
    await panel.getByRole('button', { name: 'Clear Dark Power card name', exact: true }).click();
    await expect(panel.getByText('Power name not recorded · escape requirement uncertain.', { exact: true })).toBeVisible();
    await panel.getByRole('button', { name: 'Choose Stiff Wind', exact: true }).click();
    await panel.getByRole('button', { name: 'Protect Carolyn', exact: true }).click();
    await expect(panel.getByRole('button', { name: 'View Mr. Floppy actions' })).toContainText('Removed from the game');
    await expect(panel.getByRole('button', { name: 'View Carolyn actions' })).toContainText('With you');
    await page.getByRole('button', { name: 'Dark Power', exact: true }).click();
    await expect(page.locator('.play-moment-editor .module-revealed-hero')).toBeVisible();
    const revealCount = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents.filter((e: {
        kind: string;
        momentType?: string;
    }) => e.kind === 'moment' && e.momentType === 'dark-power').length, key);
    expect(revealCount).toBe(1);
    await panel.screenshot({ path: info.outputPath('normal-power-protection.png'), animations: 'disabled', style: '.app-footer{visibility:hidden}' });
});
test('legacy finds stay distinct from rescue when reviewing a result', async ({ page, archive }) => {
    const result = { id: activeGame.id, timestamp: 1, outcome: 'won', killer: 'Poltergeist', location: 'Camp Happy Trails', finalGirl: 'Laurie' };
    archive.history.push({ id: result.id, timestamp: 1, outcome: 'won', killer: 'Poltergeist', location: result.location, final_girl: 'Laurie' });
    await archive.install(page, { draft: { ...activeGame, phase: 'outcome', result, formDraft: { foundCarolyn: true, foundMrFloppy: true }, selection: { ...activeGame.selection, killer: 'Poltergeist' } } });
    await page.goto('/');
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Rescued Carolyn', exact: true })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Escaped with Mr. Floppy', exact: true })).not.toBeChecked();
    await page.getByRole('checkbox', { name: 'Rescued Carolyn', exact: true }).check();
    await page.reload();
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Rescued Carolyn', exact: true })).toBeChecked();
    await expect(page.getByLabel('Killer Health', { exact: true })).toHaveCount(0);
});
test('photographic cards and healthless Minor states match the baseline at every target viewport', async ({ page, archive }, info) => {
    await archive.install(page, { draft: { ...activeGame, poltergeistSetupVersion: 1, playMode: true, selection: { ...activeGame.selection, killer: 'Poltergeist', location: 'Camp Happy Trails' } } });
    await page.goto('/');
    await page.getByRole('button', { name: 'RESUME GAME', exact: true }).click();
    await openModule(page, 'poltergeist');
    const panel = page.locator('[data-module="poltergeist"]');
    await panel.getByText('Dark Power & Finale', { exact: true }).click();
    const widths = info.project.name === 'mobile' ? [{ width: 390, height: 844 }, { width: 320, height: 568 }] : [{ width: 1280, height: 640 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }];
    for (const size of widths) {
        await page.setViewportSize(size);
        await panel.screenshot({ path: info.outputPath(`choices-${size.width}.png`), animations: 'disabled', style: '.app-footer{visibility:hidden}' });
    }
    for (const [kind, names] of [['Dark Power', ['Stiff Wind', 'Eternal Despair', 'Invisible Barrier', 'Forgetting Something?']], ['Finale', ['Relentless Assault', 'Nothing Is Easy', 'She Will Soon Be Lost']]] as const) {
        for (const name of names) {
            await panel.getByRole('button', { name: `Choose ${name}`, exact: true }).click();
            const hero = panel.getByLabel(`Revealed ${kind}: ${name}`, { exact: true });
            await expect(hero).toBeVisible();
            await expect(hero.locator('img')).toHaveJSProperty('complete', true);
            for (const size of widths) {
                await page.setViewportSize(size);
                expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
                await hero.screenshot({ path: info.outputPath(`${name.toLowerCase().replace(/[^a-z]+/g, '-')}-${size.width}.png`), animations: 'disabled', style: '.app-footer{visibility:hidden}' });
            }
            await panel.getByRole('button', { name: `Clear ${kind} card name`, exact: true }).click();
        }
    }
    await panel.getByRole('button', { name: 'Activate Psychic Confusion', exact: true }).click();
    const before = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents.length, key);
    await panel.getByRole('button', { name: 'Add another Minor Power', exact: true }).click();
    expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!).playEvents.length, key)).toBe(before);
    await panel.getByRole('button', { name: 'Activate Unseen Forces', exact: true }).click();
    await expect(panel.locator('[data-module-control="minor-effect"][data-active=true]')).toHaveCount(2);
    await expect(panel.locator('.module-health-tokens')).toHaveCount(0);
    for (const size of widths) {
        await page.setViewportSize(size);
        await panel.locator('.polter-minors').screenshot({ path: info.outputPath(`active-minors-${size.width}.png`), animations: 'disabled', style: '.app-footer{visibility:hidden}' });
    }
});

test('unknown legacy state and failed durable writes remain honest and retryable',async({page,archive},info)=>{
 await archive.install(page,{draft:{...activeGame,playMode:true,selection:{...activeGame.selection,killer:'Poltergeist'},playEvents:[{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',at:1,kind:'start',saved:2,killed:3,round:5}]}});
 await page.goto('/');await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();const before=await page.evaluate(k=>localStorage.getItem(k),key);await openModule(page,'poltergeist');const panel=page.locator('[data-module="poltergeist"]');
 expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(before);await expect(panel.getByRole('button',{name:'View Carolyn actions'})).toContainText('Not recorded');
 await panel.getByRole('button',{name:'Activate Psychic Confusion',exact:true}).click();
 await panel.getByRole('button',{name:'View Carolyn actions'}).click();
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('final-girl-active-game-v1:'))throw new Error('synthetic quota');return original.call(this,k,v);};});
 await panel.getByRole('button',{name:'Carolyn joins you',exact:true}).click();await expect(panel.getByRole('alert')).toContainText('could not be saved');
 await expect(panel.getByRole('button',{name:'End effect: Psychic Confusion',exact:true})).toHaveAttribute('aria-pressed','true');
 await panel.screenshot({path:info.outputPath('failed-join-unknown.png'),animations:'disabled',style:'.app-footer{visibility:hidden}'});
 await page.reload();await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();await openModule(page,'poltergeist');
 await panel.getByRole('button',{name:'View Carolyn actions'}).click();await panel.getByRole('button',{name:'Carolyn joins you',exact:true}).click();
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(panel.getByRole('button',{name:'End effect: Psychic Confusion',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'Save one victim',exact:true})).toContainText('2');await expect(page.getByRole('button',{name:'Record one victim killed',exact:true})).toContainText('3');
});

test('rescue review and temporary attacker death preserve their own historical facts', async ({page, archive}, info) => {
    const selection = {...activeGame.selection, killer:'Poltergeist'};
    await archive.install(page,{draft:{...activeGame, selection, poltergeistSetupVersion:1, playMode:true}});
    await installTestAudio(page);
    await page.goto('/');
    await page.getByRole('button',{name:'RESUME GAME',exact:true}).click();
    await openModule(page,'poltergeist');
    const panel=page.locator('[data-module="poltergeist"]');
    await panel.getByRole('button',{name:'View Carolyn actions'}).click();
    await panel.getByRole('button',{name:'Carolyn joins you',exact:true}).click();
    await page.getByRole('button',{name:'Record one victim killed',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Gruesome Death',exact:true});
    await dialog.getByRole('button',{name:'Buddy / minion',exact:true}).click();
    await searchPick(page,'Death attacker','Behemoth');
    await dialog.getByRole('button',{name:'Gruesome Death',exact:true}).click();
    await expect(page.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
    await dialog.screenshot({path:info.outputPath('temporary-attacker-death.png'),animations:'disabled'});
    await dialog.getByRole('button',{name:'Save and exit',exact:true}).click();
    await panel.getByRole('button',{name:'Record Carolyn rescued',exact:true}).click();
    await page.getByRole('button',{name:'Latest death scene',exact:true}).click();
    await expect(page.getByRole('region',{name:'Generated death scene'})).toContainText(archive.deathText);
    await page.getByRole('button',{name:'Narrate death scene',exact:true}).click();
    await expect(page.getByRole('button',{name:'Stop death narration',exact:true})).toBeVisible();
    expect(archive.calls.filter(c=>c==='generate-death-scene')).toHaveLength(1);
    const log=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).playEvents,key) as PlayEvent[];
    const facts=deathFacts(selection,log,archive.deathScenes[0].event_id)!;
    expect(facts.moduleContext?.poltergeist).toMatchObject({carolyn:'with-you'});
    expect(facts).toMatchObject({attacker:'Behemoth'});
    await dialog.getByRole('button',{name:'Save and exit',exact:true}).click();
    await page.getByRole('button',{name:'Finish game',exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:'Won',exact:true}).click();
    await expect(page.getByRole('checkbox',{name:'Rescued Carolyn',exact:true})).toBeChecked();
    await expect(page.getByLabel('Killer Health',{exact:true})).toHaveCount(0);
    await page.screenshot({path:info.outputPath('rescue-outcome.png'),fullPage:true,animations:'disabled',style:'.app-footer,.news-broadcast{visibility:hidden}'});
    await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect(page.getByText(archive.endingText,{exact:true})).toBeVisible();
    const body=archive.generationRequests.find(r=>r.name==='generate-ending')!.body;
    expect(body).toMatchObject({poltergeistReview:{carolynRescued:true,floppyAtEscape:null,epicRequired:null},victimsKilled:1});
    expect(body).not.toHaveProperty('killerHealth');
});

test('owned Rules search finds the complete Poltergeist card reference',async({page,archive})=>{
    archive.films=['s1-creech-manor'];
    await archive.install(page);
    await page.goto('/');
    await page.getByRole('button',{name:'Rules',exact:true}).click();
    await page.getByRole('textbox',{name:'Search rules'}).fill('Unstoppable Evil');
    const rules=page.locator('#killer-poltergeist-rules');
    await expect(rules).toContainText('16 physical cards');
    await expect(rules).toContainText('Roll a die');
    await expect(rules).toContainText('Healthless');
});
