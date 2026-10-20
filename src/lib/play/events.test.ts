import { describe, expect, it } from 'vitest';
import { newPlayEvent as event, summarizePlay, validPlayLog, playStoryBeats, PERMANENT_MOMENTS } from './events';

describe('play observations', () => {
  it('locks new milestones, deduplicates merged repeats, and still permits detail edits', () => {
    for (const momentType of PERMANENT_MOMENTS) {
      const start = event({kind:'start', saved:0, killed:0, round:1});
      const milestone = event({kind:'moment', momentType, text:'Recorded milestone', permanent:true});
      const duplicate = event({kind:'moment', momentType, text:'Duplicate from another device', permanent:true});
      const log = [start, milestone, event({kind:'undo', target:milestone.id}), duplicate, event({kind:'details', target:milestone.id, detail:'A remembered detail.'})];
      expect(validPlayLog(log)).toBe(true);
      const s = summarizePlay(log);
      expect(s.inactive.has(milestone.id)).toBe(false);
      expect(s.entries.filter(e => e.momentType === momentType)).toHaveLength(1);
      expect(s.entries.find(e => e.id === milestone.id)?.detail).toBe('A remembered detail.');
      expect(s.killed).toBe(0);
    }
  });
  it('preserves legacy corrections and rejects permanent flags on repeatable moments', () => {
    const old = event({kind:'moment',momentType:'dark-power',text:'Old mistaken reveal'});
    expect(summarizePlay([event({kind:'start',saved:0,killed:0,round:1}),old,event({kind:'undo',target:old.id})]).entries.some(e => e.id === old.id)).toBe(false);
    expect(validPlayLog([{...old, momentType:'item',permanent:true}])).toBe(false);
    expect(validPlayLog([{...old,permanent:'yes'}])).toBe(false);
  });
  it('keeps untracked distinct from a recorded zero and starts rounds explicitly', () => {
    expect(summarizePlay()).toMatchObject({ tracked: false, saved: null, killed: null, round: null });
    expect(summarizePlay([event({kind:'start',saved:0,killed:0,round:null})])).toMatchObject({tracked:true,saved:0,killed:0,round:null});
  });
  it('supports catch-up, bulk counts, corrections and stable death identity', () => {
    const death=event({kind:'killed',quantity:3});
    const log=[event({kind:'start',saved:2,killed:4,round:6}),death,event({kind:'round'}),event({kind:'saved',quantity:2}),event({kind:'details',target:death.id,room:'Kitchen',cause:'event'})];
    const s=summarizePlay(log);
    expect(s).toMatchObject({saved:4,killed:7,round:7});
    expect(s.entries.find(e=>e.id===death.id)).toMatchObject({room:'Kitchen',cause:'event',currentRound:6});
    expect(summarizePlay([...log,event({kind:'adjust',saved:5,killed:6,round:8})])).toMatchObject({saved:5,killed:6,round:8});
  });
  it('undoes and restores without duplicating a death or later observations', () => {
    const start=event({kind:'start',saved:0,killed:0,round:1});const death=event({kind:'killed',quantity:2});
    const log=[start,death,event({kind:'round'}),event({kind:'undo',target:death.id})];
    expect(summarizePlay(log)).toMatchObject({killed:0,round:2});
    expect(summarizePlay([...log,event({kind:'restore',target:death.id})]).killed).toBe(2);
  });
  it('rejects malformed, duplicate and excessive logs', () => {
    const e=event({kind:'killed',quantity:1});
    expect(validPlayLog([e,e])).toBe(false);
    expect(validPlayLog([{...e,quantity:-1}])).toBe(false);
    expect(validPlayLog([{...e,cause:'a guessed official rule'}])).toBe(false);
    expect(validPlayLog([{...e,room:{bad:true}}])).toBe(false);
    expect(validPlayLog(Array(1001).fill(e))).toBe(false);
    expect(()=>event({kind:'state',field:'finalHorrorLevel',value:8})).toThrow();
  });
  it('bounds story context, excludes undone beats and retains exact observed state', () => {
    const death=event({kind:'killed',quantity:1,room:'Kitchen'});
    const log=[event({kind:'start',saved:0,killed:0,round:1}),death,event({kind:'undo',target:death.id}),event({kind:'state',field:'finalGirlHealth',value:1}),...Array.from({length:15},()=>event({kind:'moment',text:'A'.repeat(230)}))];
    expect(playStoryBeats(log).length).toBeLessThanOrEqual(1800);
    expect(playStoryBeats(log)).not.toContain('Kitchen');
    expect(summarizePlay(log).finalGirlHealth).toBe(1);
  });
});

describe('corrections and meaningful moments', () => {
  it('decrements the matching counter without touching intervening moments', async () => {
    const {decrementPlay} = await import('./events');
    const death = event({kind: 'killed', quantity: 1});
    const moment = event({kind: 'moment', text: 'Narrow escape', momentType: 'escape'});
    const log = [event({kind: 'start', saved: 0, killed: 0, round: 1}), death, moment];
    const correction = event(decrementPlay(log, 'killed')!);
    expect(summarizePlay([...log, correction])).toMatchObject({killed: 0});
    expect(playStoryBeats([...log, correction])).toContain('Narrow escape');
    expect(decrementPlay([...log, correction], 'killed')).toBeNull();
    expect(decrementPlay(log, 'round')).toBeNull();
  });
  it('partially corrects legacy groups and allows undoing the correction', async () => {
    const {decrementPlay} = await import('./events');
    const group = event({kind:'killed',quantity:3,room:'Kitchen'});
    const log = [event({kind:'start',saved:0,killed:0,round:1}),group];
    const correction = event(decrementPlay(log,'killed')!);
    const summary = summarizePlay([...log,correction]);
    expect(summary.killed).toBe(2);
    expect(summary.entries.find(e=>e.id===group.id)).toMatchObject({quantity:2,room:'Kitchen'});
    expect(summarizePlay([...log,correction,event({kind:'undo',target:correction.id})]).killed).toBe(3);
  });
  it('corrects legacy baselines and leaves unknown rounds unknown', async () => {
    const {decrementPlay} = await import('./events');
    const log = [event({kind:'start',saved:4,killed:2,round:null})];
    expect(summarizePlay([...log,event(decrementPlay(log,'saved')!)])).toMatchObject({saved:3,killed:2,round:null});
  });
  it('keeps a weapon and its edited detail despite many routine observations', () => {
    const item = event({kind:'moment',text:'Found a weapon or key item',momentType:'item'});
    const log = [event({kind:'start',saved:0,killed:0,round:1}),item,event({kind:'details',target:item.id,detail:'Flamethrower'}),...Array.from({length:40},()=>event({kind:'state',field:'bloodlust',value:5}))];
    expect(playStoryBeats(log)).toContain('Flamethrower');
    expect(playStoryBeats([...log,event({kind:'undo',target:item.id})])).not.toContain('Flamethrower');
  });
  it('records zero Horror and clears optional tracking without fabricating a value', () => {
    const log = [event({kind:'start',saved:0,killed:0,round:1}),event({kind:'state',field:'finalHorrorLevel',value:0})];
    expect(summarizePlay(log).finalHorrorLevel).toBe(0);
    expect(summarizePlay([...log,event({kind:'state',field:'finalHorrorLevel',value:null})]).finalHorrorLevel).toBeUndefined();
  });
});
