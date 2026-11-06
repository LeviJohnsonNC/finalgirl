import {describe,it,expect} from 'vitest';
import {HUNTER,HUNTER_TERRORS,HUNTER_MINORS,HUNTER_POWERS,HUNTER_FINALES,HUNTER_ACTIONS,hunterHasReveal,initialHunter,hunterState,hunterParent,resolveHunterAction,hunterReview,hunterReviewFacts,type HunterAction} from './hunter';
import {newPlayEvent,summarizePlay,validPlayLog,canUndoHunter,playStoryBeats,type PlayEvent} from './events';
import {moduleState,moduleStoryBeats,validModuleObservation,killerMomentCards} from './modules';
import {deathFacts,deathSignature} from './death';
import {isActiveGame} from '../activeGame';
import {applicablePlayCards} from './catalog';
import {playStartingValues} from './defaults';
type Command<T=HunterAction>=T extends HunterAction?Omit<T,'parent'>:never;
function session(fresh=true){
 const log:PlayEvent[]=[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),newPlayEvent({kind:'state',field:'bloodlust',value:0}),...(fresh?[newPlayEvent({kind:'module',moduleData:{module:'hunter',changes:initialHunter()}})]:[])];
 const entries=()=>summarizePlay(log).entries;
 const fields=()=>moduleState(entries(),'hunter');const state=()=>hunterState(fields());
 const next=(input:Command)=>{const hunterAction={...input,parent:hunterParent(entries())} as HunterAction;const changes=resolveHunterAction(hunterAction,fields(),entries());return changes&&newPlayEvent({kind:'module',hunterAction,moduleData:{module:'hunter',changes}});};
 const act=(input:Command)=>{const e=next(input);expect(e).toBeDefined();log.push(e!);expect(validPlayLog(log)).toBe(true);return e!;};
 const power=(index:number)=>log.push(newPlayEvent({kind:'moment',momentType:'dark-power',killerCard:HUNTER_POWERS[index].name,permanent:true,text:'Dark Power revealed'}));
 return {log,entries,fields,state,next,act,power};
}
describe('Hunter photographed mechanics',()=>{
 it('accounts for 16 deck cards plus the special Terror and distinct printed tracks',()=>{
  expect(HUNTER_TERRORS.reduce((n,c)=>n+c.quantity,0)+HUNTER_MINORS.length).toBe(17);
  expect(HUNTER_TERRORS.filter(c=>'special'in c)).toHaveLength(1);
  expect(HUNTER_POWERS).toHaveLength(4);expect(HUNTER_FINALES).toHaveLength(3);
  expect(HUNTER_ACTIONS.map(c=>c.cooldown)).toEqual([2,2,1,2]);
  expect(playStartingValues(HUNTER,'Ginny')).toMatchObject({killerHealth:15,finalHorrorLevel:5,bloodlust:0});
  expect(killerMomentCards(HUNTER,'dark-power')).toHaveLength(4);
  expect(applicablePlayCards({killer:HUNTER,location:'Maple Lane'},'terror').filter(c=>c.killer===HUNTER)).toHaveLength(HUNTER_TERRORS.length);
 });
 it('pins the photographed conditional Terror order and distinct roll targets',()=>{const card=(id:string)=>HUNTER_TERRORS.find(c=>c.id===id)!.effect;expect(card('impersonation-mode')).toContain('Make a Horror roll');expect(card('impersonation-mode')).toContain('move yourself');expect(card('move-or-be-eliminated')).toContain('move twice');expect(card('terminate-obstacles')).toContain('Then target the Final Girl and move');expect(card('counter-measures')).toContain('a Victim');expect(card('terminate-mark-v')).toContain('After that movement');expect(card('hunter-mark-x')).toContain('before discarding');expect(HUNTER_FINALES[0].effect).toContain('recover one Health');});
 it('combines damage within a phase, clears partial damage, shuts down and arrives naturally without Finale',()=>{
  const s=session();s.act({command:'damage',value:1});expect(s.state().remaining).toBe(3);s.act({command:'end-action'});
  expect(s.state().damage).toBe(0);s.act({command:'damage',value:3});expect(s.state()).toMatchObject({remaining:2,damage:1});
  s.act({command:'damage',value:3});expect(s.state()).toMatchObject({phase:'countdown',remaining:0,countdown:2});
  expect(hunterHasReveal(s.state(),'dark-power')).toBe(true);expect(s.state().parts).toHaveLength(3);expect(s.next({command:'damage',value:1})).toBeUndefined();
  s.act({command:'countdown'});expect(s.state().phase).toBe('countdown');
  const arrival=s.act({command:'countdown'});expect(s.state()).toMatchObject({phase:'mark-x',countdown:0,forced:false});
  expect(summarizePlay(s.log)).toMatchObject({bloodlust:2,killerHealth:15,killed:0,saved:0});
  expect(s.entries().some(e=>e.momentType==='finale')).toBe(false);
  s.log.push(newPlayEvent({kind:'undo',target:arrival.id}));expect(validPlayLog(s.log)).toBe(true);expect(s.state().phase).toBe('countdown');expect(summarizePlay(s.log).bloodlust).toBe(1);
  s.log.push(newPlayEvent({kind:'restore',target:arrival.id}));expect(validPlayLog(s.log)).toBe(true);expect(s.state().phase).toBe('mark-x');
 });
 it('forces arrival atomically, drops remaining Parts and retains Minor Health',()=>{
  const s=session();s.power(1);s.act({command:'minor',card:'titanium-shield',value:3});
  s.act({command:'damage',value:2});const before=s.state();const forced=s.act({command:'force-mark-x'});
  expect(s.state()).toMatchObject({phase:'mark-x',remaining:0,countdown:0,forced:true,ally:'unrepaired'});expect(s.state().parts).toHaveLength(3);
  expect(s.fields()['minor.titanium-shield']).toBe(3);expect(summarizePlay(s.log)).toMatchObject({bloodlust:10,killerHealth:15,killed:0});
  expect(s.next({command:'force-mark-x'})).toBeUndefined();
  s.log.push(newPlayEvent({kind:'undo',target:forced.id}));expect(validPlayLog(s.log)).toBe(true);expect(s.state()).toEqual(before);
  expect(playStoryBeats(s.log,{killer:HUNTER,location:'Maple Lane'})).toContain('Mark V active');
 });
 it('forced Finale after natural arrival does not heal Mark X or change Bloodlust',()=>{
  const s=session();s.act({command:'damage',value:6});s.act({command:'countdown'});s.act({command:'countdown'});
  s.log.push(newPlayEvent({kind:'state',field:'killerHealth',value:4}));s.act({command:'force-mark-x'});
  expect(summarizePlay(s.log)).toMatchObject({killerHealth:4,bloodlust:2});
 });
 it('System Reboot adds a hidden Part for Mark V and heals only active Mark X',()=>{
  const s=session();s.act({command:'reboot'});expect(s.state().remaining).toBe(4);s.act({command:'damage',value:8});
  expect(s.next({command:'reboot'})).toBeUndefined();s.act({command:'countdown'});s.act({command:'countdown'});
  s.log.push(newPlayEvent({kind:'state',field:'killerHealth',value:7}));s.act({command:'reboot'});expect(summarizePlay(s.log).killerHealth).toBe(11);
 });
 it('Bio Tissue raises Part threshold and applies the printed bonus on each Repair',()=>{
  const s=session();s.power(0);s.act({command:'damage',value:2});expect(s.state()).toMatchObject({remaining:3,damage:2});s.act({command:'damage',value:7});
  s.act({command:'pickup',part:1});s.act({command:'repair',part:1,value:2});expect(s.state()).toMatchObject({ally:'alive',allyHealth:3});
  s.act({command:'pickup',part:2});s.act({command:'repair',part:2,value:1});expect(s.state().allyHealth).toBe(5);
  expect(s.next({command:'repair',part:2,value:1})).toBeUndefined();expect(s.state().parts[1].status).toBe('installed');
 });
 it('keeps independent Ally cooldowns, prohibits repeat use, and permanently destroys at zero',()=>{
  const s=session();s.act({command:'damage',value:6});s.act({command:'pickup',part:1});s.act({command:'repair',part:1,value:4});
  const attack=s.act({command:'use',action:'attack'});s.act({command:'use',action:'quick-move'});
  expect(s.next({command:'use',action:'attack'})).toBeUndefined();expect(canUndoHunter(s.log,attack.id)).toBe(false);s.act({command:'pickup',part:3});s.act({command:'repair',part:3,value:1});expect(s.state().cooldowns.attack).toBe(2);
  s.act({command:'upkeep'});expect(s.state().cooldowns).toMatchObject({attack:1,'quick-move':0});
  s.act({command:'upkeep'});expect(s.state().cooldowns.attack).toBe(0);
  const destroy=s.act({command:'ally-health',value:0});expect(s.state().ally).toBe('destroyed');s.act({command:'pickup',part:2});
  expect(s.next({command:'repair',part:2,value:2})).toBeUndefined();expect(s.next({command:'use',action:'move'})).toBeUndefined();
  expect(canUndoHunter(s.log,destroy.id)).toBe(false);expect(summarizePlay(s.log).killed).toBe(0);
 });
 it('rejects forged snapshots, stale commands, repeated setup and out-of-order Undo',()=>{
  const s=session();const e=s.act({command:'damage',value:2});
  const forged={...e,id:crypto.randomUUID(),moduleData:{module:'hunter' as const,changes:initialHunter()}};
  expect(validPlayLog([...s.log,forged])).toBe(false);expect(validPlayLog([...s.log,newPlayEvent({kind:'module',moduleData:{module:'hunter',changes:initialHunter()}})])).toBe(false);
  s.act({command:'pickup',part:1});expect(validPlayLog([...s.log,newPlayEvent({kind:'undo',target:e.id})])).toBe(false);
  expect(validModuleObservation({module:'hunter',changes:{snapshot:'{}'}})).toBe(false);
  expect(validModuleObservation({module:'hunter',changes:{'minor.titanium-shield':5}})).toBe(false);
 });
 it('keeps legacy model state unknown and permits explicit observed-state recovery without changing scalar history',()=>{
  const s=session(false);s.log.push(newPlayEvent({kind:'state',field:'killerHealth',value:9}));
  expect(s.state()).toMatchObject({phase:'unknown',remaining:null,countdown:null,allyHealth:null});
  expect(s.next({command:'force-mark-x'})).toBeUndefined();
  s.act({command:'recover',phase:'mark-v',remaining:2,countdown:2,ally:'unrepaired',health:0});expect(s.state().remaining).toBe(2);expect(summarizePlay(s.log).killerHealth).toBe(9);
 });
 it('does not overwrite old Mark X Health when recording a legacy model',()=>{const s=session(false);s.log.push(newPlayEvent({kind:'state',field:'killerHealth',value:9}));s.act({command:'recover',phase:'mark-x',remaining:0,countdown:0,ally:'unrepaired',health:0});expect(summarizePlay(s.log).killerHealth).toBe(9);s.act({command:'record-part',status:'backpack'});s.act({command:'repair',part:1,value:2});expect(s.state()).toMatchObject({ally:'alive',allyHealth:2});expect(s.state().cooldowns.attack).toBe(0);s.act({command:'use',action:'attack'});expect(s.state().cooldowns.attack).toBe(2);expect(summarizePlay(s.log).killerHealth).toBe(9);});
 it('freezes each new death model at its raw log prefix; legacy signatures do not acquire Hunter state',async()=>{
  const s=session();const selection={killer:HUNTER,location:'Maple Lane',finalGirl:'Ginny'};
  const legacy=newPlayEvent({kind:'killed',quantity:1});s.log.push(legacy);
  expect(deathFacts(selection,s.log,legacy.id)?.moduleContext?.hunter).toBeUndefined();
  const death=newPlayEvent({kind:'killed',quantity:1,hunterReference:true});s.log.push(death);
  const before=deathFacts(selection,s.log,death.id)!;expect(before.moduleContext?.hunter.facts).toContain('Mark V active');
  s.act({command:'force-mark-x'});expect(await deathSignature(deathFacts(selection,s.log,death.id)!)).toBe(await deathSignature(before));
  expect(deathFacts({...selection,killer:'Hans'},s.log,death.id)).toBeNull();
 });
 it('preserves both selected owners and a distinct Ally in ending budgets for every supported location',()=>{
  const s=session();s.act({command:'force-mark-x'});s.act({command:'pickup',part:1});s.act({command:'repair',part:1,value:3});
  const places=['Maple Lane','Camp Happy Trails','Buddyland','Carnival of Blood','Sacred Groves','Creech Manor','USS Konrad','Shady Acres','Marrek Warehouse','Storybook Woods','Wingard Cottage'];
  for(const location of places){const text=moduleStoryBeats({killer:HUNTER,location},s.entries());expect(text.length).toBeLessThanOrEqual(895);expect(text).toContain('Mark X active');}
  expect(hunterReviewFacts(hunterReview(s.fields()))).toContain('Mark V Ally state: alive, 3 Health');
  expect(isActiveGame({version:1,id:crypto.randomUUID(),selection:{killer:'Hans',location:'Maple Lane',finalGirl:'Ginny'},playEvents:s.log})).toBe(false);
 });
 it('direct removals preserve detached Parts when Reboot exceeds three',()=>{
  const s=session();s.act({command:'remove-part'});s.act({command:'pickup',part:1});
  s.act({command:'reboot'});s.act({command:'reboot'});
  expect(s.state().remaining).toBe(4);expect(s.state().parts).toEqual([{id:1,status:'backpack',health:null}]);
  for(let i=0;i<4;i++)s.act({command:'remove-part'});
  expect(s.state()).toMatchObject({phase:'countdown',remaining:0,countdown:2});expect(s.state().parts).toHaveLength(5);
  expect(summarizePlay(s.log).bloodlust).toBe(0);
 });
 it('restores countdown and only its applied Bloodlust delta, preserving repairs',()=>{
  const s=session();for(let i=0;i<3;i++)s.act({command:'remove-part'});
  s.act({command:'countdown'});s.act({command:'pickup',part:1});s.act({command:'repair',part:1,value:2});
  s.log.push(newPlayEvent({kind:'state',field:'bloodlust',value:6}));s.act({command:'countdown-back'});
  expect(s.state()).toMatchObject({countdown:2,ally:'alive',allyHealth:2});expect(summarizePlay(s.log).bloodlust).toBe(5);
  expect(s.next({command:'countdown-back'})).toBeUndefined();
  s.act({command:'countdown'});expect(summarizePlay(s.log).bloodlust).toBe(6);
 });
 it('countdown correction at the cap does not subtract Bloodlust that was never added',()=>{
  const s=session();s.act({command:'damage',value:6});s.log.push(newPlayEvent({kind:'state',field:'bloodlust',value:10}));
  s.act({command:'countdown'});s.act({command:'countdown-back'});expect(summarizePlay(s.log).bloodlust).toBe(10);
 });
 it('keeps unknown Bloodlust unknown and rejects invented legacy countdown reversals',()=>{
  const s=session();s.act({command:'damage',value:6});s.log.push(newPlayEvent({kind:'state',field:'bloodlust',value:null}));
  s.act({command:'countdown'});s.act({command:'countdown-back'});expect(summarizePlay(s.log).bloodlust).toBeUndefined();
  const old=session(false);old.act({command:'recover',phase:'countdown',remaining:0,countdown:1,ally:'unrepaired',health:0});
  expect(old.next({command:'countdown-back'})).toBeUndefined();
 });
 it('installs a blank token without activating or permanently destroying Mark V',()=>{
  const s=session();s.act({command:'damage',value:6});s.act({command:'pickup',part:1});const blank=s.act({command:'repair',part:1,value:0});
  expect(s.state()).toMatchObject({ally:'unrepaired',allyHealth:0});expect(s.state().parts[0]).toMatchObject({status:'installed',health:0});
  expect(s.next({command:'repair',part:1,value:1})).toBeUndefined();expect(s.next({command:'use',action:'attack'})).toBeUndefined();
  s.log.push(newPlayEvent({kind:'undo',target:blank.id}));expect(validPlayLog(s.log)).toBe(true);expect(s.state().parts[0].status).toBe('backpack');
  s.log.push(newPlayEvent({kind:'restore',target:blank.id}));expect(validPlayLog(s.log)).toBe(true);
  s.act({command:'pickup',part:2});s.act({command:'repair',part:2,value:3});expect(s.state()).toMatchObject({ally:'alive',allyHealth:3});
  s.act({command:'ally-health',value:0});s.act({command:'pickup',part:3});expect(s.next({command:'repair',part:3,value:3})).toBeUndefined();
 });
 it('Bio Tissue activates Mark V even when the printed token is blank',()=>{
  const s=session();s.power(0);s.act({command:'damage',value:9});s.act({command:'pickup',part:1});s.act({command:'repair',part:1,value:0});
  expect(s.state()).toMatchObject({ally:'alive',allyHealth:1});
 });
 it('arrival Undo cannot reset later Mark X Health or invalidate a historical death',()=>{
  const s=session();s.act({command:'damage',value:6});s.act({command:'countdown'});const arrival=s.act({command:'countdown'});
  expect(canUndoHunter(s.log,arrival.id)).toBe(true);s.log.push(newPlayEvent({kind:'state',field:'killerHealth',value:7}));
  expect(canUndoHunter(s.log,arrival.id)).toBe(false);expect(validPlayLog([...s.log,newPlayEvent({kind:'undo',target:arrival.id})])).toBe(false);
  expect(summarizePlay(s.log).killerHealth).toBe(7);
 });

});
