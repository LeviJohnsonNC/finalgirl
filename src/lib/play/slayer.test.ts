import { describe, expect, it, vi } from 'vitest';

vi.mock('https://deno.land/x/zod@v3.22.4/mod.ts', async () => import('zod'));
import { SceneImageRequestSchema, EndingRequestSchema } from '../../../supabase/functions/_shared/validation';
import { endingFacts } from '../../../supabase/functions/_shared/storyFacts';
import { deathFacts, deathSignature, slayerVictimSetting } from './death';
import { newPlayEvent, summarizePlay, validPlayLog, type PlayEvent } from './events';
import { moduleState } from './modules';
import { playStartingValues } from './defaults';
import {
  initialSlayer, resolveSlayerAction, slayerParent, slayerState, validSlayerAction,
  SLAYER_BLOODLUST, SLAYER_COLLAPSE, SLAYER_FINALES, SLAYER_MINORS, SLAYER_POWERS, SLAYER_TERRORS,
  type SlayerCommand,
} from './slayer';

const selection = {killer:'Slayer',location:'Creech Manor',finalGirl:'Nancy'};
const start = () => [
  newPlayEvent({kind:'start', saved:0, killed:0, round:1}),
  newPlayEvent({kind:'module', moduleData:{module:'slayer', changes:initialSlayer()}}),
];
const projected = (log: PlayEvent[]) => moduleState(summarizePlay(log).entries,'slayer');
const state = (log: PlayEvent[]) => slayerState(projected(log));
function record(log: PlayEvent[], command: SlayerCommand) {
  const {entries} = summarizePlay(log);
  const action = {...command, parent:slayerParent(entries)};
  const changes = resolveSlayerAction(action, projected(log), entries);
  if (!changes) throw new Error('Invalid test observation');
  return newPlayEvent({kind:'module', slayerAction:action, moduleData:{module:'slayer', changes}});
}

describe('Slayer', () => {
  it('reconciles the printed board and all 16 Terror-deck faces', () => {
    expect(playStartingValues('Slayer','Nancy')).toMatchObject({killerHealth:11,finalHorrorLevel:4,bloodlust:0});
    expect(SLAYER_TERRORS).toHaveLength(10);
    expect(SLAYER_TERRORS.reduce((count, card) => count + card.quantity, SLAYER_MINORS.length)).toBe(16);
    expect(SLAYER_MINORS.map(card=>card.health)).toEqual([2,2,2]);
    expect(SLAYER_POWERS).toHaveLength(4);
    expect(SLAYER_FINALES).toHaveLength(3);
    expect(SLAYER_BLOODLUST).toHaveLength(11);
    expect(SLAYER_BLOODLUST[5]).toEqual([3,3,'Reveal Dark Power']);
    expect(state([])).toMatchObject({girl:null,slayer:null});
  });

  it('seeds two victims only for new games and replays the original setup unchanged', () => {
    expect(state(start()).mirrorVictims).toBe(2);
    expect(validPlayLog(start())).toBe(true);
    const legacy = start();
    const snapshot = JSON.parse(initialSlayer().snapshot);
    delete snapshot.mirrorVictims;
    legacy[1].moduleData!.changes.snapshot = JSON.stringify(snapshot);
    expect(validPlayLog(legacy)).toBe(true);
    expect(state(legacy).mirrorVictims).toBeUndefined();
    legacy.push(record(legacy,{command:'mirror-victims',count:0}));
    expect(validPlayLog(legacy)).toBe(true);
    expect(state(legacy).mirrorVictims).toBe(0);
    const saved = start();
    saved.push(record(saved,{command:'mirror-victims',count:4}));
    expect(state(JSON.parse(JSON.stringify(saved))).mirrorVictims).toBe(4);
  });

  it('keeps Slayer victim attacks in Mirror and freezes the resolved Collapse exception', async () => {
    const log = start();
    const before = newPlayEvent({kind:'killed',quantity:1,cause:'killer',slayerReference:true});
    log.push(before);
    const reveal = newPlayEvent({kind:'moment',momentType:'finale',killerCard:SLAYER_COLLAPSE,permanent:true,text:'Finale revealed'});
    log.push(reveal);
    const revealed = newPlayEvent({kind:'killed',quantity:1,cause:'killer',slayerReference:true});
    log.push(revealed);
    log.push(record(log,{command:'collapse',reveal:reveal.id,includeUnknown:[]}));
    const after = newPlayEvent({kind:'killed',quantity:1,cause:'killer',slayerReference:true});
    log.push(after);
    expect(slayerVictimSetting(deathFacts(selection,log,before.id)!)).toBe('Mirror Dimension');
    expect(slayerVictimSetting(deathFacts(selection,log,revealed.id)!)).toBe('Mirror Dimension');
    expect(slayerVictimSetting(deathFacts(selection,log,after.id)!)).toBe('Our Dimension after Rift Collapse');
    const {deathPrompt} = await import('../../../supabase/functions/_shared/deathPrompt');
    const facts = deathFacts(selection,log,before.id)!;
    const prompt = deathPrompt(facts,[]);
    expect(JSON.parse(prompt.user).slayerVictimSetting).toBe('Mirror Dimension');
    expect(prompt.system).toContain('He never emerges into Our Dimension');
    expect(JSON.parse(deathPrompt(deathFacts(selection,log,after.id)!,[]).user).slayerVictimSetting).toBe('Our Dimension after Rift Collapse');
    expect(JSON.parse(deathPrompt({...facts,cause:'hazard',attacker:''},[]).user).slayerVictimSetting).toBeUndefined();
    expect(slayerVictimSetting({...facts,cause:'hazard',attacker:''})).toBeNull();
    expect(slayerVictimSetting({...facts,killer:'Hans'})).toBeNull();
    expect(slayerVictimSetting({...facts,cause:'terror',terrorCard:SLAYER_TERRORS[2].name})).toBe('Mirror Dimension');
    expect(slayerVictimSetting({...facts,cause:'other',attacker:'Slayer'})).toBe('Mirror Dimension');
  });

  it('moves just selected markers, records independent pulls, and rejects stale or forged observations', () => {
    const log = start();
    for (const id of ['1','2','3'] as const) log.push(record(log,{command:'track-marker',id,label:`Role ${id}`,dimension:'our'}));
    const old = record(log,{command:'pull',id:'3'});
    log.push(record(log,{command:'cross',to:'mirror',companions:['1','2']}));
    expect(state(log)).toMatchObject({girl:'mirror',markers:{'1':{dimension:'mirror'},'2':{dimension:'mirror'},'3':{dimension:'our'}}});
    expect(validPlayLog([...log,old])).toBe(false);
    log.push(record(log,{command:'pull',id:'3'}));
    expect(state(log).markers['3']?.dimension).toBe('mirror');
    const back = record(log,{command:'cross',to:'our',companions:['1']});
    expect(validPlayLog([...log,{...back,moduleData:{module:'slayer',changes:initialSlayer()}}])).toBe(false);
    log.push(back);
    expect(validPlayLog(JSON.parse(JSON.stringify(log)))).toBe(true);
    expect(state(log)).toMatchObject({girl:'our',markers:{'1':{dimension:'our'},'2':{dimension:'mirror'},'3':{dimension:'mirror'}}});
    expect(validSlayerAction({parent:'root',command:'cross',to:'mirror',companions:['1','1']})).toBe(false);
  });

  it('gates Collapse on the current named reveal and preserves the accepted physical transition after clearing it', () => {
    const log = start();
    expect(state(log).mirrorVictims).toBe(2);
    expect(validSlayerAction({parent:'root',command:'mirror-victims',count:7})).toBe(false);
    log.push(record(log,{command:'mirror-victims',count:1}));
    log.push(record(log,{command:'track-marker',id:'1',label:'Best Friend',dimension:'mirror'}));
    log.push(record(log,{command:'track-marker',id:'2',label:'Another',dimension:null}));
    log.push(record(log,{command:'track-marker',id:'3',label:'Unconfirmed',dimension:null}));
    const reveal = newPlayEvent({kind:'moment',momentType:'finale',killerCard:SLAYER_COLLAPSE,permanent:true,text:'Finale revealed'});
    log.push(reveal);
    expect(state(log).collapsed).toBe(false);
    const collapse = record(log,{command:'collapse',reveal:reveal.id,includeUnknown:['2']});
    const clear = newPlayEvent({kind:'details',target:reveal.id,killerCard:''});
    expect(validPlayLog([...log,clear,collapse])).toBe(false);
    log.push(collapse);
    const undo = newPlayEvent({kind:'undo',target:collapse.id});
    const restore = newPlayEvent({kind:'restore',target:collapse.id});
    expect(validPlayLog([...log,undo,restore])).toBe(true);
    expect(state([...log,undo])).toMatchObject({slayer:'mirror',mirrorVictims:1});
    expect(state([...log,clear])).toMatchObject({collapsed:true,girl:'our',slayer:'our',mirrorVictims:0,
      markers:{'1':{dimension:'our'},'2':{dimension:'our'},'3':{dimension:null}}});
    const later = record(log,{command:'set-dimension',who:'girl',to:'mirror'});
    expect(validPlayLog([...log,later,undo])).toBe(false);
    expect(summarizePlay(log)).toMatchObject({saved:0,killed:0});
  });

  it('freezes new death context and excludes it from old or wrong-owner records', async () => {
    const log = start();
    log.push(record(log,{command:'cross',to:'mirror',companions:[]}));
    const death = newPlayEvent({kind:'killed',quantity:1,slayerReference:true});
    const legacy = newPlayEvent({kind:'killed',quantity:1});
    log.push(death,legacy);
    const before = deathFacts(selection,log,death.id)!;
    expect(before.moduleContext?.slayer?.facts).toContain('Final Girl last observed in Mirror Dimension');
    expect(before.moduleContext?.slayer?.facts).toContain('do not establish the dimension of the Victim');
    expect(deathFacts(selection,log,legacy.id)?.moduleContext?.slayer).toBeUndefined();
    expect(deathFacts({...selection,killer:'Hans'},log,death.id)).toBeNull();
    log.push(record(log,{command:'set-dimension',who:'girl',to:'our'}));
    const after = deathFacts(selection,JSON.parse(JSON.stringify(log)),death.id)!;
    expect(await deathSignature(after)).toBe(await deathSignature(before));
  });

  it('uses one owner-validated reviewed dimension for the ending and its poster', () => {
    const slayerReview = {finalDimension:'our' as const};
    const ending = {killer:{name:'Slayer'},location:{name:'Creech Manor'},finalGirl:{name:'Nancy'},
      introStory:'Nancy watched her reflection fall behind as she closed the door. The lock clicked a second time.', outcome:'won', slayerReview};
    const poster = {sceneType:'ending',story:ending.introStory,killer:'Slayer',location:'Creech Manor',finalGirl:'Nancy',slayerReview};
    expect(EndingRequestSchema.safeParse(ending).success).toBe(true);
    expect(SceneImageRequestSchema.safeParse(poster).success).toBe(true);
    expect(EndingRequestSchema.safeParse({...ending,killer:{name:'Hans'}}).success).toBe(false);
    expect(SceneImageRequestSchema.safeParse({...poster,sceneType:'beginning'}).success).toBe(false);
    expect(endingFacts({killer:'Slayer',slayerReview})).toContain('Reviewed Final Girl dimension at finish: Our Dimension');
    expect(endingFacts({killer:'Slayer',slayerReview:{finalDimension:null}})).toContain('explicitly unrecorded');
  });
});
