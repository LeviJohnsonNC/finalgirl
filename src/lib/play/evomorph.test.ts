import { describe,it,expect } from 'vitest';
import { newPlayEvent as event,summarizePlay,validPlayLog,canUndoEvomorph,playStoryBeats,type PlayEvent } from './events';
import { moduleState,moduleContext,killerMomentCards } from './modules';
import { deathFacts,deathSignature } from './death';
import { EVOMORPH_TERRORS,EVOMORPH_AMBUSH,EVOMORPH_MINORS,EVOMORPH_SCAN,initialEvomorph,evomorphParent,resolveEvomorphAction,evomorphOpeningGuidance,type EvomorphAction } from '../../../supabase/functions/_shared/play/evomorph';
const start=()=>event({kind:'start',saved:0,killed:0,round:1});
const setup=()=>event({kind:'module',moduleData:{module:'evomorph',changes:initialEvomorph()}});
function table(fresh=true){
 const log:PlayEvent[]=[start(),...(fresh?[setup()]:[])];
 const state=()=>moduleState(summarizePlay(log).entries,'evomorph');
 const request=(command:EvomorphAction['command'],fields:Partial<EvomorphAction>={})=>({parent:evomorphParent(summarizePlay(log).entries),command,...fields});
 const act=(command:EvomorphAction['command'],fields:Partial<EvomorphAction>={})=>{
  const a=request(command,fields),changes=resolveEvomorphAction(a,state(),summarizePlay(log).entries);expect(changes).not.toBeNull();
  const e=event({kind:'module',evomorphAction:a,moduleData:{module:'evomorph',changes:changes!}});log.push(e);return e;
 };
 return{log,state,act,request};
}
describe('Evomorph source-backed domain',()=>{
 it('reconciles physical quantities, card pairing and the three identical Scan copies',()=>{
  expect(EVOMORPH_TERRORS.reduce((n,c)=>n+c.quantity,0)).toBe(16);
  expect(EVOMORPH_TERRORS).toHaveLength(12);
  expect(EVOMORPH_AMBUSH).toHaveLength(10);
  expect(EVOMORPH_AMBUSH.find(c=>c.youngling===10)?.adult).toBe(1);
  expect(new Set(EVOMORPH_AMBUSH.map(c=>c.adult)).size).toBe(10);
  expect(EVOMORPH_MINORS.map(p=>p.health)).toEqual([3,2,2]);
  expect(killerMomentCards('Evomorph','dark-power')).toHaveLength(4);
  expect(killerMomentCards('Evomorph','finale')).toHaveLength(3);
  expect(EVOMORPH_SCAN).toContain('reduce Horror by 1');
 });
 it('keeps fresh/legacy unknowns and number edits separate from evolution',()=>{
  const a=table();expect(a.state().stage).toBe('hatchling');
  a.log.push(event({kind:'state',field:'bloodlust',value:5}));expect(a.state().stage).toBe('hatchling');
  a.act('evolve');expect(a.state()).toMatchObject({stage:'youngling',presence:'vanished'});
  expect(table(false).state()).toEqual({});
  expect(evomorphOpeningGuidance(undefined,false)).toContain('stage for this scene: unknown');
  expect(evomorphOpeningGuidance(undefined,true)).toContain('stage for this scene: hatchling');
 });
 it('projects Adult recovery once and preserves the permanent reveal through Undo',()=>{
  const a=table();a.act('evolve');
  a.log.push(event({kind:'state',field:'killerHealth',value:2}),event({kind:'state',field:'killerHealth',value:null}));
  const reveal=event({kind:'moment',momentType:'dark-power',text:'Dark Power revealed',permanent:true});a.log.push(reveal);
  const adult=a.act('evolve');
  expect(summarizePlay(a.log)).toMatchObject({killerHealth:10,killerHealthTracking:false});
  a.log.push(event({kind:'undo',target:adult.id}));
  expect(a.state().stage).toBe('youngling');
  expect(summarizePlay(a.log).killerHealth).toBeUndefined();
  expect(summarizePlay(a.log).entries.some(e=>e.id===reveal.id)).toBe(true);
  expect(validPlayLog(a.log)).toBe(true);
  a.log.push(event({kind:'state',field:'killerHealth',value:3}));
  expect(summarizePlay(a.log).killerHealth).toBe(3);
 });
 it('captures the Youngling face even when that Ambush triggers Adult evolution',()=>{
  const a=table();a.act('evolve');a.act('ambush',{key:'ambush-y10',face:'youngling'});a.act('evolve');
  expect(a.state()).toMatchObject({stage:'adult',ambushId:'ambush-y10',ambushFace:'youngling'});
  expect(resolveEvomorphAction(a.request('ambush',{key:'ambush-y1',face:'youngling'}),a.state(),summarizePlay(a.log).entries)).toBeNull();
  expect(playStoryBeats(a.log,{killer:'Evomorph',location:'Maple Lane'})).toContain('youngling / ambush-y10');
 });
 it('bounds Scan tokens, rejects duplicate labels and allows a selected token to move at capacity',()=>{
  const a=table();a.act('evolve');
  for(let i=1;i<=6;i++)a.act('scan-place',{slot:i,space:`Room ${i}`});
  expect(resolveEvomorphAction(a.request('scan-place',{slot:7,space:'Other'}),a.state(),summarizePlay(a.log).entries)).toBeNull();
  expect(resolveEvomorphAction(a.request('scan-place',{slot:2,space:'room 1'}),a.state(),summarizePlay(a.log).entries)).toBeNull();
  a.act('scan-place',{slot:3,space:'Far room'});expect(a.state()['scan.3']).toBe('Far room');
  const success=a.act('scan-success',{space:'Final Girl space'});
  expect(a.state()).toMatchObject({presence:'on-board',scanRemoved:1,skipPhase:true,'scan.3':'Far room'});
  a.log.push(event({kind:'round'}));expect(a.state().skipPhase).toBe(true);
  a.act('skip-consumed');expect(a.state().skipPhase).toBe(false);
  expect(canUndoEvomorph(a.log,success.id)).toBe(false);
  const bad=[...a.log,event({kind:'undo',target:success.id})];expect(validPlayLog(bad)).toBe(false);
 });
 it('does not infer an available hand, removes at most three Scan copies and never clears markers on Scan success',()=>{
  const a=table();a.act('evolve');a.act('scan-place',{slot:1,space:'Cabin'});
  for(let i=0;i<3;i++) {if(i)a.act('vanish');a.act('scan-success',{space:'Cabin'});a.act('skip-consumed');}
  expect(a.state()).toMatchObject({scanRemoved:3,'scan.1':'Cabin'});
  a.act('vanish');expect(resolveEvomorphAction(a.request('scan-success',{space:'Cabin'}),a.state(),summarizePlay(a.log).entries)).toBeNull();
  const legacy=table(false);legacy.act('correct',{key:'presence',value:'vanished'});
  expect(resolveEvomorphAction(legacy.request('scan-success',{space:'Cabin'}),legacy.state(),summarizePlay(legacy.log).entries)).toBeNull();
 });
 it('separates reveal metadata, entry effects, casualties and concealed token values',()=>{
  const a=table();a.act('evolve');a.act('scan-place',{slot:1,space:'Cabin'});
  const reveal=event({kind:'moment',momentType:'dark-power',text:'Dark Power',permanent:true,killerCard:'Razor Tail'});a.log.push(reveal);
  a.act('power-resolve',{space:'Meadow'});expect(a.state()['scan.1']).toBeUndefined();
  expect(summarizePlay(a.log).killed).toBe(0);
  a.log.push(event({kind:'details',target:reveal.id,killerCard:'Acid Blood'}));
  expect(resolveEvomorphAction(a.request('power-resolve',{space:'Meadow'}),a.state(),summarizePlay(a.log).entries)).toBeNull();
  a.act('extra-health',{value:true});expect(summarizePlay(a.log).killerHealth).toBe(4);
  const facts=JSON.stringify(moduleContext({killer:'Evomorph',location:'Camp Happy Trails'},summarizePlay(a.log).entries));
  expect(facts).not.toContain('initialized');expect(facts).not.toContain('parent');
 });
 it('rejects stale and tampered shared/server observations after a JSONB roundtrip',()=>{
  const a=table();const request=a.request('evolve');a.act('evolve');
  expect(resolveEvomorphAction(request,a.state(),summarizePlay(a.log).entries)).toBeNull();
  const wrong=event({kind:'module',evomorphAction:a.request('evolve'),moduleData:{module:'evomorph',changes:{stage:'hatchling'}}});
  expect(validPlayLog([...a.log,wrong])).toBe(false);
  const jsonb=(v:unknown):unknown=>Array.isArray(v)?v.map(jsonb):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.length-b.length||a.localeCompare(b)).map(([k,w])=>[k,jsonb(w)])):v;
  expect(validPlayLog(jsonb(a.log))).toBe(true);
 });
 it('preserves historical death signatures, captured face and owner isolation',async()=>{
  const a=table();a.act('evolve');a.act('ambush',{key:'ambush-y10',face:'youngling'});
  const death=event({kind:'killed',quantity:1,cause:'killer',attacker:'Evomorph'});a.log.push(death);
  const cast={killer:'Evomorph',location:'Camp Happy Trails',finalGirl:'Laurie'};
  const before=deathFacts(cast,a.log,death.id)!;a.act('evolve');
  const after=deathFacts(cast,a.log,death.id)!;
  expect(before.moduleContext?.evomorph.stage).toBe('youngling');
  expect(after.moduleContext?.evomorph.ambushFace).toBe('youngling');
  expect(await deathSignature(before)).toBe(await deathSignature(after));
  expect(deathFacts({...cast,killer:'Hans'},a.log,death.id)).toBeNull();
 });
});
