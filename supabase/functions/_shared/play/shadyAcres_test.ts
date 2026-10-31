import {assertEquals} from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {newPlayEvent,summarizePlay,validPlayLog} from './events.ts';
import {moduleState} from './modules.ts';
import {initialShady,shadyParent,resolveShadyAction,shadyState,type ShadyCommand} from './shadyAcres.ts';
import {deathFacts} from './death.ts';

Deno.test('Shady Acres canonical replay preserves linked Curse writes and historical location ownership',()=>{
 const log=[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),newPlayEvent({kind:'module',moduleData:{module:'shady-acres',changes:initialShady()}})];
 const act=(command:ShadyCommand)=>{const entries=summarizePlay(log).entries,action={...command,parent:shadyParent(entries)},changes=resolveShadyAction(action,moduleState(entries,'shady-acres'),entries)!;const event=newPlayEvent({kind:'module',shadyAction:action,moduleData:{module:'shady-acres',changes}});log.push(event);return event;};
 act({command:'sacrifices',value:3});
 const reveal=act({command:'reveal',id:'physical-curse',card:'dark-fields',reset:true});
 const death=newPlayEvent({kind:'killed',quantity:1,cause:'minion',attacker:'Child 2'});log.push(death);
 act({command:'curse',id:'physical-curse',status:'removed'});
 assertEquals(validPlayLog(JSON.parse(JSON.stringify(log))),true);
 assertEquals(shadyState(moduleState(summarizePlay(log).entries,'shady-acres')).sacrifices,0);
 assertEquals(!!deathFacts({killer:'Hans',location:'Shady Acres',finalGirl:'Laurie'},log,death.id),true);
 assertEquals(deathFacts({killer:'Hans',location:'Camp Happy Trails',finalGirl:'Laurie'},log,death.id),null);
 assertEquals(validPlayLog([...log,newPlayEvent({kind:'undo',target:reveal.id})]),false);
 const forged=structuredClone(log);forged[3].moduleData!.changes.snapshot=String(forged[3].moduleData!.changes.snapshot).replace('"sacrifices":0','"sacrifices":3');assertEquals(validPlayLog(forged),false);
});
