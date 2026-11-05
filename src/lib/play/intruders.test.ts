import {describe,expect,it} from 'vitest';
import {
  INTRUDERS, INTRUDER_ALL, INTRUDER_EPIC, INTRUDER_FINALES, INTRUDER_MINORS, INTRUDER_TERRORS,
  initialIntruders, intruderFigure, intruderParent, resolveIntruderAction, type IntruderAction,
} from './intruders';
import {newPlayEvent,summarizePlay,validPlayLog,playStoryBeats,type PlayEvent} from './events';
import {moduleState} from './modules';
import {deathFacts,deathSignature,detailsForCause} from './death';
import {playStartingValues} from './defaults';

type Input<T=IntruderAction> = T extends IntruderAction ? Omit<T,'parent'> : never;
const selection={killer:INTRUDERS,location:'Maple Lane',finalGirl:'Ginny'};
function session() {
  const log:PlayEvent[]=[
    newPlayEvent({kind:'start',round:1,saved:0,killed:0}),
    newPlayEvent({kind:'module',moduleData:{module:'intruders',changes:initialIntruders()}}),
  ];
  const entries=()=>summarizePlay(log).entries;
  const state=()=>moduleState(entries(),'intruders');
  const event=(input:Input)=>{
    const intruderAction={...input,parent:intruderParent(entries())};
    const changes=resolveIntruderAction(intruderAction,state(),entries());
    return changes&&newPlayEvent({kind:'module',intruderAction,moduleData:{module:'intruders',changes}});
  };
  const act=(input:Input)=>{
    const next=event(input);
    expect(next).toBeDefined();
    log.push(next!);
    expect(validPlayLog(log)).toBe(true);
    return next!;
  };
  const reveal=(momentType:'dark-power'|'finale',killerCard:string)=>{
    const e=newPlayEvent({kind:'moment',momentType,killerCard,permanent:true,text:'Revealed'});
    log.push(e);
    return (name:string)=>log.push(newPlayEvent({kind:'details',target:e.id,killerCard:name}));
  };
  return {log,state,event,act,reveal};
}
describe('Intruders owner contract',()=>{
  it('reconciles the complete physical deck and fresh tracker defaults',()=>{
    expect(INTRUDER_TERRORS).toHaveLength(9);
    expect(INTRUDER_TERRORS.reduce((n,c)=>n+c.quantity,0)+INTRUDER_MINORS.length).toBe(16);
    expect(playStartingValues(INTRUDERS,'Ginny')).toEqual({finalGirlHealth:6,finalHorrorLevel:3,bloodlust:0});
  });
  it('follows the worked Trish handoff, both rotations, and zero-damage activation',()=>{
    const {state,act,event,log}=session();
    act({command:'activate',who:'baghead'});
    expect(intruderFigure(state(),'baghead').health).toBe(6);
    act({command:'activate',who:'trish'});
    act({command:'health',who:'trish',value:1});
    act({command:'down',who:'trish'});
    expect(state()).toMatchObject({active:'baghead','trish.token':'pending'});
    act({command:'shift',direction:'up'});
    expect(state().active).toBe('zeke');
    act({command:'shift',direction:'up'});
    expect(state().active).toBe('baghead');
    act({command:'shift',direction:'down'});
    expect(state().active).toBe('zeke');
    expect(event({command:'activate',who:'trish'})).toBeUndefined();
    act({command:'dead',who:'trish'});
    expect(state()).toMatchObject({active:'zeke','trish.token':'dead'});
    expect(summarizePlay(log).killed).toBe(0);
  });
  it('handles independently pending figures, white depletion and an atomic Epic return',()=>{
    const {state,event,act,reveal,log}=session();
    const power=reveal('dark-power',INTRUDER_EPIC.name);
    act({command:'down',who:'trish'});
    act({command:'down',who:'baghead'});
    act({command:'down',who:'zeke'});
    expect(state()).toMatchObject({active:'none','trish.token':'pending','baghead.token':'pending','zeke.token':'pending'});
    act({command:'return',who:'trish',value:2});
    expect(intruderFigure(state(),'trish')).toEqual({health:2,token:'white'});
    expect(event({command:'down',who:'trish'})).toBeUndefined();
    power('');
    expect(event({command:'dead',who:'trish'})).toBeUndefined();
    const epic=act({command:'epic',who:'trish'});
    expect(state()).toMatchObject({spent:true,'trish.health':3,'trish.token':'black'});
    expect(event({command:'epic',who:'baghead'})).toBeUndefined();
    log.push(newPlayEvent({kind:'undo',target:epic.id}));
    expect(validPlayLog(log)).toBe(true);
    expect(state()).not.toHaveProperty('spent');
    log.push(newPlayEvent({kind:'restore',target:epic.id}));
    expect(validPlayLog(log)).toBe(true);
    expect(state().spent).toBe(true);
    act({command:'dead',who:'baghead'});
  });
  it('keeps Finale mode when cleared and restores marker controls when corrected',()=>{
    const {state,event,act,reveal}=session();
    const rename=reveal('finale','');
    expect(state().mode).toBe('unknown');
    rename(INTRUDER_ALL);
    expect(state().mode).toBe('all');
    expect(event({command:'activate',who:'baghead'})).toBeUndefined();
    rename('');
    expect(state().mode).toBe('all');
    rename(INTRUDER_FINALES[0].name);
    expect(state().mode).toBe('single');
    act({command:'shift',direction:'down'});
    expect(state().active).toBe('baghead');
  });
  it('rejects stale and forged observations and dependent Undo',()=>{
    const {log,event,act}=session();
    const stale=event({command:'activate',who:'baghead'})!;
    const earlier=act({command:'minor',card:'amphetamines',value:2});
    expect(validPlayLog([...log,stale])).toBe(false);
    const good=act({command:'minor',card:'coordinated-attack',value:1});
    expect(validPlayLog([...log,newPlayEvent({kind:'undo',target:earlier.id})])).toBe(false);
    expect(validPlayLog([...log.slice(0,-1),{...good,moduleData:{module:'intruders',changes:{'coordinated-attack':0}}}])).toBe(false);
  });
  it('freezes Intruder context at new deaths and preserves legacy hashes',async()=>{
    const {log,act,reveal}=session();
    const rename=reveal('finale',INTRUDER_ALL);
    const old=newPlayEvent({kind:'killed',quantity:1,cause:'killer',attacker:INTRUDERS});
    const now=newPlayEvent({kind:'killed',quantity:1,cause:'killer',intruderReference:true,attacker:'Baghead'});
    log.push(old,now);
    const baseline=deathFacts(selection,log,now.id)!;
    expect(baseline.moduleContext?.intruders).toMatchObject({mode:'all','trish.health':6});
    expect(baseline.attacker).toBe('Baghead');
    const oldSignature=await deathSignature(deathFacts(selection,log,old.id)!);
    rename(INTRUDER_FINALES[0].name);
    const damage=act({command:'health',who:'trish',value:2});
    log.push(newPlayEvent({kind:'undo',target:damage.id}));
    expect(deathFacts(selection,log,now.id)).toEqual(baseline);
    expect(await deathSignature(deathFacts(selection,log,old.id)!)).toBe(oldSignature);
    expect(deathFacts({...selection,killer:'Hans'},log,now.id)).toBeNull();
    expect(detailsForCause({cause:'terror',attacker:'Zeke'},INTRUDERS).attacker).toBe('Zeke');
    expect(detailsForCause({cause:'event',attacker:'Zeke'},INTRUDERS).attacker).toBe('');
    expect(playStoryBeats(log,selection)).toContain('Trish 6 HP');
  });
});
