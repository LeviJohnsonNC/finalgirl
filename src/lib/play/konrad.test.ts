import {deathFacts,deathSignature} from './death';
import {initialEvomorph,evomorphParent,resolveEvomorphAction,type EvomorphAction} from '../../../supabase/functions/_shared/play/evomorph';
import {describe,it,expect} from 'vitest';
import {newPlayEvent as event,summarizePlay,validPlayLog,type PlayEvent} from './events';
import {moduleState,moduleContext,moduleStoryBeats} from './modules';
import {initialKonrad,konradState,konradParent,konradToggle,parseKonrad,emptyKonrad,validKonradAction,konradFacts,resolveKonradAction,konradCost,KONRAD_SETUPS,KONRAD_ITEMS,KONRAD_EVENTS,KONRAD_TERRORS,type KonradAction} from './konrad';
type Command=KonradAction extends infer A?A extends KonradAction?Omit<A,'parent'>:never:never;
function table(fresh=true){const log:PlayEvent[]=[event({kind:'start',saved:0,killed:0,round:1}),...(fresh?[event({kind:'module',moduleData:{module:'konrad',changes:initialKonrad('Bloody Feast')}})]:[])];const entries=()=>summarizePlay(log).entries;const state=()=>moduleState(entries(),'konrad');const act=(c:Command)=>{const action={...c,parent:konradParent(entries())} as KonradAction;const changes=resolveKonradAction(action,state(),entries());expect(changes).not.toBeNull();const e=event({kind:'module',konradAction:action,moduleData:{module:'konrad',changes:changes!}});log.push(e);return e;};return {log,entries,state,act,s:()=>konradState(state())};}
describe('USS Konrad verified source and durable system contract',()=>{
 it('reconciles five 12-Victim setups, eight Terrors, ten Events and twenty Items',()=>{expect(KONRAD_TERRORS).toHaveLength(8);expect(KONRAD_EVENTS).toHaveLength(10);expect(KONRAD_ITEMS.reduce((n,x)=>n+x.quantity,0)).toBe(20);for(const s of KONRAD_SETUPS){expect(Object.values(s.victims).reduce((n,x)=>n+(x??0),0)).toBe(12);expect(s.keycards).toHaveLength(2);}expect(KONRAD_ITEMS.find(x=>x.id==='pills')?.effect).toMatch(/Horror by 1 OR recover 2 Health/);});
 it('preserves unknown legacy state, partial counts and held-charge independence',()=>{const t=table(false);expect(t.s().tokens).toEqual({});t.act({command:'token',destination:'shaft:upper-left',count:2});expect(t.s().tokens['shaft:upper-left']).toBe(2);expect(t.s().tokens['shaft:upper-right']).toBeUndefined();t.act({command:'reboot'});expect(t.s().held).toBeNull();expect(Object.values(t.s().tokens).every(n=>n===0)).toBe(true);expect(validPlayLog(t.log)).toBe(true);});
 it('retains every Solar token and rejects lost/created tokens when the ledger is complete',()=>{const t=table();const a={command:'solar',counts:{'shaft:upper-left':2},complete:true,parent:konradParent(t.entries())} as Extract<KonradAction,{command:'solar'}>;expect(resolveKonradAction({...a,counts:{'shaft:upper-left':1}},t.state(),t.entries())).toBeNull();t.act(a);expect(t.s().tokens['shaft:upper-left']).toBe(2);t.act({command:'reboot'});expect(t.s().tokens['shaft:upper-left']).toBe(0);expect(t.s().held).toBe(1);});
 it('records activation discounts once, cancels on any funding removal and undoes atomically',()=>{const t=table();t.act({command:'event',id:'emergency-override',active:true});t.act({command:'add-person',id:'captain'});expect(konradCost('crusher',true,true)).toBe(1);expect(konradCost('incinerator',true,true)).toBe(1);expect(konradCost('airlock',true,true)).toBe(2);expect(konradCost('self-destruct',true,true)).toBe(2);t.act({command:'held',count:4});t.act({command:'activate',system:'self-destruct',atStation:true,override:true,captainBridge:true,useHeld:true});t.act({command:'token',destination:'function:self-destruct',count:4});const removed=t.act({command:'token',destination:'function:self-destruct',count:3});expect(t.s().countdown).toBe('inactive');expect(t.s().systems['self-destruct']).toBeUndefined();t.log.push(event({kind:'undo',target:removed.id}));expect(t.s().countdown).toBe('start');expect(t.s().tokens['function:self-destruct']).toBe(4);t.log.push(event({kind:'restore',target:removed.id}));expect(t.s().countdown).toBe('inactive');expect(validPlayLog(t.log)).toBe(true);});
 it('uses exactly two explicit Upkeeps and preserves the fatal ending above stale Health',()=>{const t=table();t.act({command:'held',count:4});t.act({command:'activate',system:'self-destruct',atStation:true,override:false,captainBridge:false,useHeld:true});t.act({command:'upkeep',atExit:null});expect(t.s().countdown).toBe('middle');t.log.push(event({kind:'round',round:8}));expect(t.s().countdown).toBe('middle');t.act({command:'upkeep',atExit:false});t.log.push(event({kind:'state',field:'finalGirlHealth',value:5}));expect(t.s().fate).toBe('explosion-loss');expect(moduleStoryBeats({killer:'Hans',location:'USS Konrad'},t.entries())).toContain('loss even if Killer');});
 it('consumes Airlock marker once and records Loader loss without inventing casualties',()=>{const t=table();t.act({command:'held',count:3});t.act({command:'activate',system:'airlock',atStation:true,override:false,captainBridge:false,useHeld:true});t.act({command:'airlock',position:'inside',fate:'airlock-loss',loaderInHangar:true});expect(t.s()).toMatchObject({airlock:'released',loader:'lost',fate:'airlock-loss'});expect(resolveKonradAction({command:'airlock',parent:konradParent(t.entries()),position:'inside',fate:'survived',loaderInHangar:false},t.state(),t.entries())).toBeNull();expect(summarizePlay(t.log).killed).toBe(0);});
 it('ends character Event atomically and never writes generic Bloodlust or victim totals',()=>{const t=table();t.act({command:'add-person',id:'captain'});t.act({command:'person',id:'captain',status:'killed'});expect(t.s().events.captain).toBe('ended');expect(t.s().captainSpace).toBeNull();expect(summarizePlay(t.log).bloodlust).toBeUndefined();expect(summarizePlay(t.log).killed).toBe(0);});
 it('rejects stale, forged, wrong-source relocation and out-of-order Undo; JSONB key order is harmless',()=>{const t=table();const first=t.act({command:'held',count:3});const stale={parent:first.konradAction!.parent,command:'reboot'} as KonradAction;expect(resolveKonradAction(stale,t.state(),t.entries())).toBeNull();t.act({command:'token',destination:'function:crusher',count:1});expect(resolveKonradAction({parent:konradParent(t.entries()),command:'remote',from:'function:crusher',to:'shaft:upper-left'},t.state(),t.entries())).toBeNull();expect(validPlayLog([...t.log,event({kind:'undo',target:first.id})])).toBe(false);const forged=structuredClone(t.log);forged[2].moduleData!.changes.snapshot=JSON.stringify({...t.s(),held:99});expect(validPlayLog(forged)).toBe(false);const reordered=t.log.map(e=>e.moduleData?{...e,moduleData:{...e.moduleData,changes:{snapshot:JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(String(e.moduleData.changes.snapshot))).reverse()))}}}:e);expect(validPlayLog(reordered)).toBe(true);});
 it('keeps location ownership independent with every supported Killer and legacy signatures unchanged',()=>{const t=table();for(const killer of ['Hans','Billy the Bear','Geppetto','Dr. Fright','Inkanyamba','Poltergeist','Evomorph']){expect(moduleContext({killer,location:'USS Konrad'},t.entries())?.konrad).toBeDefined();expect(moduleContext({killer,location:'Maple Lane'},t.entries())?.konrad).toBeUndefined();}expect(moduleContext({killer:'Evomorph',location:'USS Konrad'},[])?.konrad).toBeUndefined();});
});

it('Konrad character corrections do not replay entry placement or restore a Captain discount',()=>{
 const t=table();t.act({command:'add-person',id:'captain'});t.act({command:'person',id:'captain',status:'killed'});t.act({command:'person',id:'captain',status:'in-play'});expect(t.s().captainSpace).toBeNull();expect(konradCost('self-destruct',false,t.s().captainSpace==='Bridge')).toBe(4);
});
it('Konrad Loader/Beacon state and space are linked, and a Keycard cannot be normally spent on an already open shaft',()=>{
 const t=table();t.act({command:'loader',status:'parked',space:'Armory'});expect(t.s()).toMatchObject({loader:'parked',loaderSpace:'Armory'});const e=t.act({command:'beacon',status:'placed',space:'Mess Hall'});t.act({command:'beacon',status:'absent',space:null});expect(t.s().beaconSpace).toBeNull();t.log.push(event({kind:'undo',target:t.log[t.log.length-1].id}));expect(t.s().beaconSpace).toBe('Mess Hall');expect(e.konradAction?.command).toBe('beacon');t.act({command:'place',destination:'shaft:upper-left'});t.act({command:'held',count:1});expect(resolveKonradAction({command:'place',destination:'shaft:upper-left',parent:konradParent(t.entries())},t.state(),t.entries())).toBeNull();
});
it('Konrad bounded ending context retains fatal cause and Evomorph stage/captured Ambush face under crowding',()=>{
 const t=table();t.act({command:'observe',key:'fate',value:'explosion-loss'});for(const e of KONRAD_EVENTS.filter(e=>e.kind==='ongoing'))t.act({command:'event',id:e.id,active:true});
 t.log.push(event({kind:'module',moduleData:{module:'evomorph',changes:initialEvomorph()}}));
 const evo=(fields:Omit<EvomorphAction,'parent'>)=>{const entries=t.entries(),a={...fields,parent:evomorphParent(entries)};const changes=resolveEvomorphAction(a,moduleState(entries,'evomorph'),entries)!;t.log.push(event({kind:'module',evomorphAction:a,moduleData:{module:'evomorph',changes}}));};
 evo({command:'evolve'});evo({command:'ambush',key:'ambush-y10',face:'youngling'});evo({command:'evolve'});evo({command:'correct',key:'room',value:'A'.repeat(120)});const entries=t.entries();
 const text=moduleStoryBeats({killer:'Evomorph',location:'USS Konrad'},entries);expect(text.length).toBeLessThanOrEqual(900);expect(text).toContain('explicitly died');expect(text).toContain('stage: adult');expect(text).toContain('Ambush face youngling, Danger 10');
});

it('Konrad historical death fingerprints normalize snapshot key order and keep the state at that death',async()=>{
 const t=table();t.act({command:'token',destination:'shaft:upper-left',count:2});const death=event({kind:'killed',quantity:1,cause:'hazard',mechanism:'Airlock'});t.log.push(death);const selection={killer:'Hans',location:'USS Konrad',finalGirl:'Laurie'};const before=deathFacts(selection,t.log,death.id)!;
 const reversed=t.log.map(e=>e.moduleData?.module==='konrad'?{...e,moduleData:{...e.moduleData,changes:{snapshot:JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(String(e.moduleData.changes.snapshot))).reverse()))}}}:e);expect(await deathSignature(deathFacts(selection,reversed,death.id)!)).toBe(await deathSignature(before));t.act({command:'reboot'});expect(await deathSignature(deathFacts(selection,t.log,death.id)!)).toBe(await deathSignature(before));
});

it('Konrad funding removal clears independently observed armed/countdown markers even with unknown activation payment',()=>{
 const t=table(false);t.act({command:'observe',key:'airlock',value:'armed'});t.act({command:'token',destination:'function:airlock',count:0});expect(t.s().airlock).toBe('inactive');t.act({command:'observe',key:'countdown',value:'middle'});t.act({command:'token',destination:'function:self-destruct',count:null});expect(t.s().countdown).toBe('inactive');
});

describe('Konrad simplified observations',()=>{
 it('records every switch without inventing payment, token counts, placement or outcomes',()=>{
  const t=table(false);
  const targets=['system:crusher','system:incinerator','system:airlock','system:self-destruct','shaft:upper-left','shaft:upper-right','shaft:lower-left','shaft:lower-right','breach','loader'];
  for(const target of targets){
   expect(konradToggle(t.s(),target)).toBeUndefined();
   for(const active of [true,false]){
    t.act({command:'toggle',target,active});expect(konradToggle(t.s(),target)).toBe(active);
    expect(t.s().held).toBeNull();expect(t.s().tokens).toEqual({});expect(t.s().systems).toEqual({});
    expect(t.s().fate).toBe('unknown');expect(t.s().people).toEqual({});
   }
  }
  expect(summarizePlay(t.log).killed).toBe(0);expect(summarizePlay(t.log).saved).toBe(0);
  expect(validPlayLog(t.log)).toBe(true);
 });
 it('keeps old paid/countdown/token observations intact until an explicit edit, and Undo restores them atomically',()=>{
  const t=table();t.act({command:'held',count:8});t.act({command:'activate',system:'self-destruct',atStation:true,override:false,captainBridge:false,useHeld:true});
  t.act({command:'upkeep',atExit:null});t.act({command:'token',destination:'shaft:upper-left',count:2});
  const original=t.s();expect(original.toggles).toBeUndefined();expect(konradToggle(original,'system:self-destruct')).toBe(true);
  const e=t.act({command:'toggle',target:'system:self-destruct',active:false});
  expect(t.s().countdown).toBe('inactive');expect(t.s().systems['self-destruct']).toBeUndefined();
  expect(t.s().held).toBe(original.held);expect(t.s().tokens['shaft:upper-left']).toBe(2);
  t.log.push(event({kind:'undo',target:e.id}));expect(t.s()).toEqual(original);
  t.log.push(event({kind:'restore',target:e.id}));expect(konradToggle(t.s(),'system:self-destruct')).toBe(false);
  const shaft=t.act({command:'toggle',target:'shaft:upper-left',active:true});
  expect(t.s().tokens['shaft:upper-left']).toBeUndefined();expect(konradToggle(t.s(),'shaft:upper-left')).toBe(true);
  t.log.push(event({kind:'undo',target:shaft.id}));expect(t.s().tokens['shaft:upper-left']).toBe(2);
  expect(validPlayLog(t.log)).toBe(true);
 });
 it('rejects stale, forged, unrecognized and non-boolean switches in both actions and snapshots',()=>{
  const t=table(),e=t.act({command:'toggle',target:'system:airlock',active:true});
  expect(resolveKonradAction({command:'toggle',target:'breach',active:true,parent:e.konradAction!.parent},t.state(),t.entries())).toBeNull();
  for(const action of [{target:'system:invented',active:true},{target:'breach',active:'yes'},{target:'loader',active:true,space:'Hangar'}])expect(validKonradAction({parent:'root',command:'toggle',...action})).toBe(false);
  for(const toggles of [{bogus:true},{breach:'yes'},null])expect(parseKonrad(JSON.stringify({...emptyKonrad(),toggles}))).toBeNull();
  const forged=structuredClone(t.log);const snapshot=JSON.parse(String(forged.at(-1)!.moduleData!.changes.snapshot));snapshot.toggles['system:airlock']=false;forged.at(-1)!.moduleData!.changes.snapshot=JSON.stringify(snapshot);expect(validPlayLog(forged)).toBe(false);
 });
 it('records Beacon and unlocated breach presence, and Loader tracking without assuming equipment or a location',()=>{
  const t=table(false);t.act({command:'toggle',target:'breach',active:true});expect(t.s().breach).toBeNull();
  expect(konradFacts(t.state()).join(' ')).toContain('Hull breach on; location unrecorded');
  t.act({command:'beacon',status:'placed',space:null});expect(t.s().beaconSpace).toBeNull();
  t.act({command:'toggle',target:'loader',active:true});expect(t.s().loader).toBe('unknown');
  t.act({command:'loader',status:'equipped',space:null});expect(konradFacts(t.state()).join(' ')).toContain('Super Loader equipped');
  t.act({command:'toggle',target:'loader',active:false});expect(konradFacts(t.state()).join(' ')).not.toContain('Super Loader equipped');
  expect(validPlayLog(t.log)).toBe(true);
 });
 it('preserves historical death snapshots, fatal outcomes and both selected owners after new toggles',async()=>{
  const t=table();t.act({command:'observe',key:'fate',value:'explosion-loss'});
  const death=event({kind:'killed',quantity:1,cause:'hazard',mechanism:'Airlock'});t.log.push(death);
  const cast={killer:'Hans',location:'USS Konrad',finalGirl:'Laurie'};
  const before=await deathSignature(deathFacts(cast,t.log,death.id)!);
  for(const target of ['system:crusher','system:incinerator','system:airlock','system:self-destruct'])t.act({command:'toggle',target,active:true});
  expect(t.s().fate).toBe('explosion-loss');expect(await deathSignature(deathFacts(cast,t.log,death.id)!)).toBe(before);
  const facts=konradFacts(t.state()).join(' ');expect(facts).toContain('Observed systems:');expect(facts).not.toContain('paid ');
  expect(facts).not.toContain('Self Destruct start');expect(facts).not.toContain('Airlock released');
  expect(moduleContext({killer:'Hans',location:'USS Konrad'},t.entries())?.konrad).toBeDefined();
  expect(moduleContext({killer:'Hans',location:'Maple Lane'},t.entries())?.konrad).toBeUndefined();
 });
});
