import {describe,it,expect} from 'vitest';
import {SHADY_CURSES,SHADY_EVENTS,SHADY_ITEMS,SHADY_SETUPS,SHADY_TERRORS,SHADY_TERRAIN,initialShady,shadyState,shadyParent,resolveShadyAction,shadyChildrenCount,shadyFacts,parseShady,validShadyAction,type ShadyCommand} from './shadyAcres';
import {newPlayEvent,summarizePlay,validPlayLog,playStoryBeats,type PlayEvent} from './events';
import {moduleState,moduleContext,initialModuleObservations} from './modules';
import {deathFacts,deathSignature} from './death';
import {applicablePlayCards,playItems,playVictims,PLAY_ROOMS} from './catalog';
import {isActiveGame} from '../activeGame';
import {initialGrimlash} from './grimlash';
function fixture(fresh=true){
 const log:PlayEvent[]=[newPlayEvent({kind:'start',saved:0,killed:0,round:1})];
 if(fresh)log.push(newPlayEvent({kind:'module',moduleData:{module:'shady-acres',changes:initialShady()}}));
 const act=(command:ShadyCommand)=>{const entries=summarizePlay(log).entries,action={...command,parent:shadyParent(entries)},changes=resolveShadyAction(action,moduleState(entries,'shady-acres'),entries);if(!changes)return null;const e=newPlayEvent({kind:'module',shadyAction:action,moduleData:{module:'shady-acres',changes}});log.push(e);return e;};
 return {log,act,state:()=>shadyState(moduleState(summarizePlay(log).entries,'shady-acres'))};
}
describe('source-backed Shady Acres companion',()=>{
 it('reports explicit Field on/off observations without inventing harvested or added tokens',()=>{
  const f=fixture();const west=f.state().fields['field-west'];
  f.act({command:'terrain',id:'field-west',value:{...west,field:false}});
  f.act({command:'terrain',id:'hayfield',value:{field:true,harvested:null,added:null}});
  const facts=shadyFacts(f.state()).join(' ');
  expect(facts).toContain('West Field: effective Field status not Field.');
  expect(facts).toContain('Hayfield: effective Field status Field.');
  expect(facts).not.toContain('harvested token recorded');expect(facts).not.toContain('added Field token recorded');
  expect(f.state().fields['field-west']).toEqual({field:false,harvested:false,added:false});
  expect(f.state().fields.hayfield).toEqual({field:true,harvested:null,added:null});expect(validPlayLog(f.log)).toBe(true);
 });
 it('tracks continuing Festering Rot explicitly without resolving Horror or Victim effects',()=>{
  expect(shadyState(initialShady('Festering Rot')).rot).toBe(true);const f=fixture(false);expect(f.state().rot).toBeUndefined();f.act({command:'rot',active:true});expect(shadyFacts(f.state()).join(' ')).toContain('Festering Rot active');f.act({command:'rot',active:false});expect(validPlayLog(f.log)).toBe(true);expect(summarizePlay(f.log).killed).toBe(0);expect(summarizePlay(f.log).finalHorrorLevel).toBeUndefined();
 });
 it('uses explicit finish review over an older roster without assigning identities or backfilling a cleared count',()=>{
  const f=fixture();f.act({command:'finish',value:2});expect(shadyChildrenCount(f.state())).toBe(1);expect(shadyFacts(f.state()).join(' ')).toContain('Children on board at finish: 2');expect(shadyFacts(f.state()).join(' ')).not.toContain('1 Children on board');f.act({command:'finish',value:null});expect(shadyFacts(f.state()).join(' ')).not.toContain('Children on board');
 });
 it('reconciles every card face, duplicate and 14-Victim Setup without guessing effects',()=>{
  expect([SHADY_CURSES.length,SHADY_EVENTS.length,SHADY_ITEMS.length,SHADY_SETUPS.length,SHADY_TERRORS.length]).toEqual([8,10,16,5,7]);
  expect(SHADY_TERRORS.reduce((n,c)=>n+c.quantity,0)).toBe(8);expect(SHADY_TERRAIN.filter(s=>s.type==='field')).toHaveLength(6);
  for(const s of SHADY_SETUPS)expect(Object.values(s.victims).reduce((n,v)=>n+v,0),s.name).toBe(14);
  expect(SHADY_EVENTS.find(c=>c.id==='hatred')!.effect).toContain('Bloodlust');expect(SHADY_EVENTS.find(c=>c.id==='hatred')!.effect).not.toContain('lose');
  expect(SHADY_CURSES.find(c=>c.id==='gnarled-stalks')!.effect).toContain('2 Time');
 });
 it('initializes only explicitly fresh location sessions and preserves legacy unknowns',()=>{
  const legacy=fixture(false);expect(shadyChildrenCount(legacy.state())).toBeNull();expect(legacy.state().sacrifices).toBeNull();
  expect(shadyChildrenCount(fixture().state())).toBe(1);
  expect(initialModuleObservations({killer:'Hans',location:'Shady Acres'},false)).toEqual([]);
  const seeded=initialModuleObservations({killer:'Hans',location:'Shady Acres',startingEvent:'Sally McCoy'},false,false,false,false,false,false,false,false,false,false,false,true);
  expect(shadyState(seeded[0].changes).people.sally).toBe('in-play');
  expect(shadyState(initialShady('Harvest Cultist')).people.cultist).toBe('in-play');
 });
 it('returns and re-adds Children repeatedly without a Victim casualty or resource change',()=>{
  const f=fixture();for(let i=0;i<3;i++){f.act({command:'child',id:'1',status:'on-card'});f.act({command:'child',id:'1',status:'on-board'});}
  expect(validPlayLog(f.log)).toBe(true);expect(shadyChildrenCount(f.state())).toBe(1);const sum=summarizePlay(f.log);expect([sum.killed,sum.saved,sum.bloodlust]).toEqual([0,0,undefined]);
 });
 it('records multiple Curses and a threshold reset atomically, without renaming replaying the reset',()=>{
  const f=fixture();f.act({command:'sacrifices',value:3});const e=f.act({command:'reveal',id:'a',card:null,reset:true});expect(e).not.toBeNull();expect(f.state().sacrifices).toBe(0);
  f.act({command:'sacrifices',value:2});f.act({command:'curse',id:'a',card:'dark-fields',correction:true});expect(f.state().sacrifices).toBe(2);
  f.act({command:'reveal',id:'b',card:'omen-of-plague',reset:false});expect(f.state().curses).toHaveLength(2);expect(f.act({command:'reveal',id:'c',card:'dark-fields',reset:true})).toBeNull();expect(f.state().sacrifices).toBe(2);expect(validPlayLog(f.log)).toBe(true);
 });
 it('removes a Curse from the game; only an explicit correction can restore its observation',()=>{
  const f=fixture();f.act({command:'reveal',id:'a',card:'omen-of-blood',reset:false});f.act({command:'curse',id:'a',status:'removed'});
  expect(f.act({command:'curse',id:'a',status:'active'})).toBeNull();expect(f.act({command:'curse',id:'a',status:'active',correction:true})).not.toBeNull();
 });
 it('keeps an unknown sacrifice count unknown unless marker clearing is explicitly recorded',()=>{
  const f=fixture(false);f.act({command:'reveal',id:'a',card:'dark-fields',reset:false});expect(f.state().sacrifices).toBeNull();f.act({command:'reveal',id:'b',card:'omen-of-blood',reset:true});expect(f.state().sacrifices).toBe(0);
 });
 it('preserves harvested terrain and conflicting tokens without regrowing crops',()=>{
  const f=fixture();f.act({command:'terrain',id:'hayfield',value:{field:false,harvested:true,added:false}});f.act({command:'fields'});
  expect(f.state().fields.hayfield).toEqual({field:null,harvested:true,added:true});expect(f.state().fields.pasture.field).toBe(true);
  f.act({command:'combine',active:true,space:'field-west',harvested:['field-west']});f.act({command:'combine',active:false,space:null});expect(f.state().fields['field-west'].harvested).toBe(true);
 });
 it('records Raven markers and role outcomes without inventing extra Victims, rewards or damage',()=>{
  const f=fixture();f.act({command:'person',id:'cultist',status:'in-play'});f.act({command:'person',id:'cultist',status:'saved'});expect(f.act({command:'person',id:'cultist',status:'in-play'})).toBeNull();
  f.act({command:'ravens',active:true,health:null});expect(f.state().ravenHealth).toBeNull();f.act({command:'ravens',active:true,health:3});f.act({command:'ravens',active:false,health:0});expect(f.state().ravens).toBe(false);expect(summarizePlay(f.log).saved).toBe(0);expect(summarizePlay(f.log).killerHealth).toBeUndefined();
 });
 it('rejects forged snapshots, invalid limits, extra fields and stale parents',()=>{
  const f=fixture();const entries=summarizePlay(f.log).entries;expect(resolveShadyAction({command:'child',id:'2',status:'on-board',parent:'stale'},moduleState(entries,'shady-acres'),entries)).toBeNull();
  expect(validShadyAction({command:'sacrifices',parent:'root',value:4})).toBe(false);expect(validShadyAction({command:'finish',parent:'root',value:0,secret:'x'})).toBe(false);
  expect(parseShady(JSON.stringify({...f.state(),children:{'4':'on-board'}}))).toBeNull();
  const event=f.act({command:'child',id:'2',status:'on-board'})!;event.moduleData!.changes.snapshot=initialShady().snapshot;expect(validPlayLog(f.log)).toBe(false);
 });
 it('orders linked Undo/restore by owner without blocking unrelated killer observations',()=>{
  const f=fixture();const first=f.act({command:'sacrifices',value:3})!;const last=f.act({command:'reveal',id:'a',card:'dark-fields',reset:true})!;
  expect(validPlayLog([...f.log,newPlayEvent({kind:'undo',target:first.id})])).toBe(false);
  f.log.push(newPlayEvent({kind:'state',field:'killerHealth',value:6}),newPlayEvent({kind:'undo',target:last.id}));expect(validPlayLog(f.log)).toBe(true);expect(f.state().sacrifices).toBe(3);expect(f.state().curses).toHaveLength(0);expect(summarizePlay(f.log).killerHealth).toBe(6);
  f.log.push(newPlayEvent({kind:'restore',target:last.id}));expect(validPlayLog(f.log)).toBe(true);expect(f.state().sacrifices).toBe(0);expect(f.state().curses).toHaveLength(1);
 });
 it('keeps source catalogs location-owned for all supported killers and rejects wrong-owner sessions',()=>{
  const f=fixture();for(const killer of ['Grimlash','Hans','Billy the Bear','Geppetto','Dr. Fright','Inkanyamba','Poltergeist','Evomorph']){
   const selection={killer,location:'Shady Acres',finalGirl:'Laurie'};expect(applicablePlayCards(selection,'terror').filter(c=>c.location==='Shady Acres')).toHaveLength(7);expect(moduleContext(selection,summarizePlay(f.log).entries)?.shady).toBeDefined();
  }
  expect(playItems('Shady Acres')).toHaveLength(16);expect(playVictims('Shady Acres')).toHaveLength(3);expect(PLAY_ROOMS['Shady Acres']).toHaveLength(16);
  expect(moduleContext({killer:'Grimlash',location:'Camp Happy Trails'},summarizePlay(f.log).entries)?.shady).toBeUndefined();
  expect(isActiveGame({version:1,id:'test',phase:'nowPlaying',selection:{killer:'Hans',location:'Camp Happy Trails',finalGirl:'Laurie'},playEvents:f.log})).toBe(false);
 });
 it('freezes death context at the death; later removal never rewrites it or invents its attacker',async()=>{
  const f=fixture();f.act({command:'reveal',id:'a',card:'dark-fields',reset:false});const death=newPlayEvent({kind:'killed',quantity:1,cause:'minion',attacker:'Child 2'});f.log.push(death);
  const selection={killer:'Hans',location:'Shady Acres',finalGirl:'Laurie'},facts=deathFacts(selection,f.log,death.id)!;expect(facts.attacker).toBe('Child 2');const signature=await deathSignature(facts);
  f.act({command:'curse',id:'a',status:'removed'});expect(await deathSignature(deathFacts(selection,f.log,death.id)!)).toBe(signature);
  expect(deathFacts({...selection,location:'Camp Happy Trails'},f.log,death.id)).toBeNull();
 });
 it('retains both owners within bounded story facts even with every Curse and character recorded',()=>{
  const f=fixture();f.log.push(newPlayEvent({kind:'module',moduleData:{module:'grimlash',changes:initialGrimlash()}}));
  for(const c of SHADY_CURSES)f.act({command:'reveal',id:c.id,card:c.id,reset:false});for(const p of ['sally','ralph','cultist'] as const)f.act({command:'person',id:p,status:'in-play'});
  const beats=playStoryBeats(f.log,{killer:'Grimlash',location:'Shady Acres'});expect(beats).toContain('Harvest Madness');expect(beats).toContain('Shady Acres');expect(beats.length).toBeLessThanOrEqual(1800);
 });
});
