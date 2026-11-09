import {describe, expect, it} from 'vitest';
import {falconwoodDestination, falconwoodParent, falconwoodState, initialFalconwood,
  missionByName, resolveFalconwoodAction, type FalconwoodAction} from '../../../supabase/functions/_shared/play/falconwood';
import {FALCONWOOD_SETUPS} from '../../../supabase/functions/_shared/play/falconwoodCatalog';
import {canUndoFalconwood, newPlayEvent, summarizePlay, validPlayLog} from './events';
import {moduleState} from './modules';
import {deathFacts} from './death';
import {applicablePlayCards} from './catalog';

function scenario(mission: string, startingEvent?: string) {
  const id = missionByName(mission)!.id;
  const events = [newPlayEvent({kind:'start',round:1,saved:0,killed:0}),newPlayEvent({kind:'module',moduleData:{module:'falconwood',changes:initialFalconwood(mission,startingEvent)!}})];
  const entries = () => summarizePlay(events).entries;
  const fields = () => moduleState(entries(),'falconwood');
  return {
    events,
    state: () => falconwoodState(fields()),
    act(command: FalconwoodAction['command'], value?: FalconwoodAction['value'], key?: string) {
      const action: FalconwoodAction = {parent:falconwoodParent(entries()),mission:id,command,value,key};
      const changes = resolveFalconwoodAction(action,fields(),entries());
      if (!changes) return false;
      events.push(newPlayEvent({kind:'module',falconwoodAction:action,moduleData:{module:'falconwood',changes}}));
      return true;
    },
  };
}

describe('Falconwood observations', () => {
  it('maps every physical clue triple and reconciles all setup counts', () => {
    const values = [1,2] as const;
    const destinations = values.flatMap(A => values.flatMap(B => values.map(C => falconwoodDestination({A,B,C}))));
    expect(destinations).toEqual(['Library','Shopping Mall','Community Pool','Town Fair','Best Friend’s House','School','Fanghorn Forest','Government Lab']);
    for (const setup of FALCONWOOD_SETUPS) expect(Object.values(setup.victims).reduce((a:number,b:number) => a+b,0)).toBe(12);
  });

  it('leaves Helping Hands unresolved, and only banks the observed key result', () => {
    const s = scenario('Save Your Father','Helping Hands');
    expect(s.state()).toMatchObject({complete:false,count:0,target:3});
    expect(s.act('complete')).toBe(false);
    expect(s.act('count',2)).toBe(true);
    expect(s.act('target',2)).toBe(true);
    expect(s.act('complete')).toBe(true);
    expect(s.state()).toMatchObject({complete:true,friend:'in-play'});
    expect(validPlayLog(s.events)).toBe(true);
  });

  it('records trackable mission success with the final count and can undo both at once', () => {
    const father = scenario('Save Your Father');
    expect(father.act('target',2)).toBe(true);
    expect(father.act('progress-count',1)).toBe(true);
    expect(father.state()).toMatchObject({count:1,complete:false});
    expect(father.act('progress-count',2)).toBe(true);
    expect(father.state()).toMatchObject({count:2,complete:true,friend:'in-play'});
    const hunt = scenario('Survive the Hunt');
    expect(hunt.act('progress-count',0)).toBe(false);
    expect(hunt.act('start',3)).toBe(true);
    expect(hunt.act('progress-count',1)).toBe(true);
    expect(hunt.act('progress-count',0)).toBe(true);
    expect(hunt.state()).toMatchObject({count:0,complete:true,friend:'in-play',uses:2});
    expect(hunt.act('complete')).toBe(false);
    const last = hunt.events[hunt.events.length - 1];
    const undone = [...hunt.events,newPlayEvent({kind:'undo',target:last.id})];
    expect(validPlayLog(undone)).toBe(true);
    const state = falconwoodState(moduleState(summarizePlay(undone).entries,'falconwood'));
    expect(state).toMatchObject({count:1,complete:false});
    expect(state.uses).toBeUndefined();
    expect(state.friend).toBeUndefined();
    expect(summarizePlay(hunt.events).killed).toBe(0);
    expect(validPlayLog(father.events)).toBe(true);
  });

  it('uses physical dice, evidence handoff and single lead observations', () => {
    const code = scenario('Crack the Code');
    expect(code.act('token',5)).toBe(true);
    expect(code.act('complete',14)).toBe(false);
    expect(code.act('complete',15)).toBe(true);
    const lab = scenario('Expose the Lab');
    expect(lab.act('lead',1)).toBe(true);
    expect(lab.act('recover',5)).toBe(true);
    expect(lab.state()).toMatchObject({count:1,lead:5});
    expect(lab.act('target',2)).toBe(true);
    expect(lab.act('recover',null)).toBe(true);
    expect(lab.state()).toMatchObject({count:2,complete:false});
    expect(lab.act('complete')).toBe(true);
    expect(lab.state().friend).toBe('in-play');
  });

  it('distinguishes the waiting Hunt, modifiers, start, zero and completion', () => {
    const s = scenario('Survive the Hunt');
    expect(s.state()).toMatchObject({started:false,complete:false});
    expect(s.act('count',0)).toBe(false);
    expect(s.act('reduced',true)).toBe(true);
    expect(s.act('attack',true)).toBe(true);
    expect(s.act('start',3)).toBe(true);
    expect(s.act('count',0)).toBe(true);
    expect(s.state().complete).toBe(false);
    expect(s.act('complete')).toBe(true);
    expect(s.state()).toMatchObject({complete:true,uses:2,friend:'in-play'});
    expect(s.act('uses',0)).toBe(true);
    expect(s.act('friend','killed')).toBe(true);
    expect(s.act('correct-completion',false)).toBe(true);
    expect(s.act('attest')).toBe(true);
    expect(s.state()).toMatchObject({complete:true,uses:0,friend:'killed'});
    expect(summarizePlay(s.events).killed).toBe(0);
  });

  it('rejects forged snapshots and stale dependencies and preserves historical death facts', () => {
    const s = scenario('Missing Friend');
    expect(s.act('clue',1,'A')).toBe(true);
    const first = s.events[s.events.length - 1];
    expect(s.act('clue',2,'A')).toBe(false);
    expect(s.act('clue',1,'B')).toBe(true);
    expect(canUndoFalconwood(s.events,first.id)).toBe(false);
    const death = newPlayEvent({kind:'killed',quantity:1,falconwoodReference:true});
    s.events.push(death);
    const selection = {killer:'Slayer',location:'Falconwood',finalGirl:'Nancy',mission:'Missing Friend'};
    const facts = deathFacts(selection,s.events,death.id);
    expect(facts?.moduleContext?.falconwood.facts).toContain('2 of 3 clues');
    expect(s.act('clue',1,'C')).toBe(true);
    expect(s.act('found')).toBe(true);
    expect(s.act('complete')).toBe(true);
    expect(deathFacts(selection,s.events,death.id)).toEqual(facts);
    expect(deathFacts({...selection,location:'Sunnydaze Mall'},s.events,death.id)).toBeNull();
    const last = s.events[s.events.length - 1];
    expect(validPlayLog([...s.events.slice(0,-1),{...last,moduleData:first.moduleData}])).toBe(false);
    const undone = [...s.events,newPlayEvent({kind:'undo',target:last.id})];
    expect(validPlayLog(undone)).toBe(true);
    expect(falconwoodState(moduleState(summarizePlay(undone).entries,'falconwood'))).toMatchObject({friend:'prone',complete:false});
    expect(validPlayLog([...undone,newPlayEvent({kind:'restore',target:last.id})])).toBe(true);
  });

  it('only offers the Hunt card to the Falconwood Hunt mission', () => {
    for (const [location,mission,expected] of [['Falconwood','Survive the Hunt',true],['Falconwood','Missing Friend',false],['Wingard Cottage','Survive the Hunt',false]] as const) {
      expect(applicablePlayCards({killer:'Slayer',location,mission},'terror').some(c => c.name === 'Survive the Hunt')).toBe(expected);
    }
  });
});
