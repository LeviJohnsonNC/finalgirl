import { describe, expect, it } from 'vitest';
import { newPlayEvent as event, summarizePlay, validPlayLog, playStoryBeats } from './events';

describe('play observations', () => {
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
