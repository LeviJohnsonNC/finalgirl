import { describe,it,expect } from 'vitest';
import { CREECH_EVENTS,CREECH_ITEMS,CREECH_TERRORS,CREECH_SETUPS,CREECH_SPACES,CREECH_HUNTERS,resolveCreechAction,validCreechAction,creechStartingObservations,creechFacts } from './creech';
import { newPlayEvent,isPlayEvent,summarizePlay } from './events';
import { moduleState,moduleStoryBeats } from './modules';
import { deathFacts } from './death';
const selection={killer:'Poltergeist',location:'Creech Manor',finalGirl:'Laurie'};
const parent='root';
const start=newPlayEvent({kind:'start',saved:0,killed:0,round:1});
function observation(action:import('./creech').CreechAction,state:import('./modules').ModuleState,polter:import('./modules').ModuleState={},killer='Poltergeist'){
 const result=resolveCreechAction(action,state,polter,killer)!;expect(result).not.toBeNull();return newPlayEvent({kind:'module',moduleData:{module:'creech',changes:result.changes},creechAction:action,...(result.linkedModule?{linkedModule:result.linkedModule}:{})});
}
describe('source-backed Creech mechanics',()=>{
 it('reconciles every card and ten Victims on each setup to real space IDs',()=>{
  expect([CREECH_TERRORS.length,CREECH_EVENTS.length,CREECH_ITEMS.length,CREECH_SETUPS.length]).toEqual([8,10,18,5]);
  for(const s of CREECH_SETUPS){expect(Object.values(s.victims).reduce((a,b)=>a+b,0)).toBe(10);for(const id of [s.girl,s.killer,...Object.keys(s.victims)])expect(CREECH_SPACES.some(x=>x.id===id)).toBe(true);}
  expect(CREECH_TERRORS.find(c=>c.name.startsWith('It’s coming'))?.effect).toContain('three times');
  expect(CREECH_ITEMS.find(i=>i.name==='Shotgun')?.effect).toContain('6 dice');
 });
 it('initializes only known physical defaults and leaves special group allocation pending',()=>{
  expect(creechStartingObservations('Ghost Hunters')).toMatchObject({'event.hunters':'active','helicopter.used':false});
  expect(creechStartingObservations('Ghost Hunters')).not.toHaveProperty('hunter.orange');
  expect(creechStartingObservations('Pushed to the Edge')).not.toHaveProperty('event.pushed');
 });
 it.each([0,1,2,3])('allocates %i replacement hunters without creating totals',n=>{
  const event=observation({parent,kind:'hunters',colors:CREECH_HUNTERS.slice(0,n)},{'event.hunters':'active'});
  expect(isPlayEvent(event)).toBe(true);expect(Object.values(event.moduleData!.changes).filter(v=>v==='in-play')).toHaveLength(n);
  expect(summarizePlay([start,event])).toMatchObject({saved:0,killed:0});
 });
 it('records a final reported Bloodlust once; Undo restores the entire outcome',()=>{
  const value=newPlayEvent({kind:'state',field:'bloodlust',value:8});
  const e=observation({parent,kind:'hunter',color:'orange',outcome:'killed',bloodlust:8},{'hunter.orange':'in-play'});
  expect(isPlayEvent(e)).toBe(true);expect(summarizePlay([start,value,e])).toMatchObject({bloodlust:8,killed:0});
  const undo=newPlayEvent({kind:'undo',target:e.id});expect(moduleState(summarizePlay([start,value,e,undo]).entries,'creech')).not.toHaveProperty('hunter.orange');
  expect(summarizePlay([start,value,e,undo]).bloodlust).toBe(8);
  const restore=newPlayEvent({kind:'restore',target:e.id});expect(moduleState(summarizePlay([start,value,e,undo,restore]).entries,'creech')['hunters.firstDeath']).toBe(true);
  expect(resolveCreechAction({parent,kind:'hunter',color:'orange',outcome:'killed',bloodlust:9},{'hunter.orange':'killed'},{},'Hans')).toBeNull();
 });
 it('does not require a fabricated Bloodlust value for an explicit death',()=>{
  const e=observation({parent,kind:'hunter',color:'orange',outcome:'killed'},{'hunter.orange':'in-play','hunter.blue':'in-play'});
  expect(summarizePlay([start,e]).bloodlust).toBeUndefined();expect(e.moduleData!.changes).not.toHaveProperty('event.hunters');
 });
 it('records helicopter Carolyn rescue as one event and does not infer victory/totals',()=>{
  const e=observation({parent,kind:'helicopter',victims:2,carolyn:true,floppy:null,confirmed:true},{'event.helicopter':'active'},{carolyn:'with-you'});
  expect(isPlayEvent(e)).toBe(true);expect(moduleState(summarizePlay([start,e]).entries,'poltergeist').carolyn).toBe('rescued');expect(summarizePlay([start,e])).toMatchObject({saved:0,killed:0});
  expect(isPlayEvent({...e,linkedModule:undefined})).toBe(false);expect(isPlayEvent({...e,linkedModule:{module:'poltergeist',changes:{carolyn:'rescued',floppy:'carried'}}})).toBe(false);
  const undo=newPlayEvent({kind:'undo',target:e.id});expect(moduleState(summarizePlay([start,e,undo]).entries,'poltergeist').carolyn).toBeUndefined();
  expect(resolveCreechAction(e.creechAction!,{'event.helicopter':'active'},{carolyn:'with-you'},'Hans')).toBeNull();
 });
 it('retains one-use history when the Event ends and rejects repeated use',()=>{
  const a={parent,kind:'helicopter' as const,victims:null,carolyn:false,floppy:null,confirmed:true as const};
  const e=observation(a,{'event.helicopter':'active'});expect(e.moduleData!.changes['event.helicopter']).toBe('ended');
  expect(resolveCreechAction(a,{'event.helicopter':'active','helicopter.used':true},{},'Hans')).toBeNull();
  expect(resolveCreechAction({parent,kind:'event',id:'helicopter',active:true},{'helicopter.used':true},{},'Hans')).toBeNull();
 });
 it('distinguishes repair, rope placement and reported blocked attack',()=>{
  expect(resolveCreechAction({parent,kind:'repair'},{ladder:'broken',rope:'upper-window'},{},'Hans')?.changes).toEqual({ladder:'usable'});
  expect(resolveCreechAction({parent,kind:'rope',position:'left-drop'},{ladder:'broken'},{},'Hans')?.changes).toEqual({rope:'left-drop'});
  expect(resolveCreechAction({parent,kind:'block-attack'},{padlock:'unplaced'},{},'Hans')).toBeNull();
  expect(validCreechAction({parent,kind:'hunter',color:'orange',outcome:'saved',bloodlust:3})).toBe(false);
 });
 it('freezes historical death context and preserves old unknown signatures',()=>{
  const death=newPlayEvent({kind:'killed',quantity:1,cause:'hazard'});
  expect(deathFacts(selection,[start,death],death.id)).not.toHaveProperty('moduleContext');
  const group=observation({parent,kind:'hunters',colors:['orange']},{'event.hunters':'active'});
  const later=observation({parent,kind:'hunter',color:'orange',outcome:'killed'},{'hunter.orange':'in-play'});
  expect(deathFacts(selection,[start,group,death,later],death.id)?.moduleContext?.creech['hunter.orange']).toBe('in-play');
  expect(deathFacts({...selection,location:'Maple Lane'},[start,group,death],death.id)).toBeNull();
 });
 it('keeps rescue and both owners inside the bounded story summary',()=>{
  const e=observation({parent,kind:'helicopter',victims:2,carolyn:true,floppy:true,confirmed:true},{'event.helicopter':'active'},{carolyn:'with-you'});
  const beats=moduleStoryBeats(selection,summarizePlay([start,e]).entries);expect(beats).toContain('Helicopter used once');expect(beats).toContain('Carolyn: rescued');expect(beats.length).toBeLessThanOrEqual(900);
  expect(creechFacts({})).toEqual([]);
 });
});
