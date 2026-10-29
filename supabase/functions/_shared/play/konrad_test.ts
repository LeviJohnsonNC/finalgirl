import {assertEquals} from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {newPlayEvent,summarizePlay,validPlayLog} from './events.ts';
import {moduleState} from './modules.ts';
import {initialKonrad,konradParent,resolveKonradAction,konradState} from './konrad.ts';
import {deathFacts} from './death.ts';
Deno.test('Konrad canonical snapshot replay preserves multiplicity through native JSONB-shaped data',()=>{
 const log=[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),newPlayEvent({kind:'module',moduleData:{module:'konrad',changes:initialKonrad('Bloody Feast')}})];
 const entries=summarizePlay(log).entries,a={command:'solar' as const,parent:konradParent(entries),counts:{'shaft:upper-left':2},complete:true};
 log.push(newPlayEvent({kind:'module',konradAction:a,moduleData:{module:'konrad',changes:resolveKonradAction(a,moduleState(entries,'konrad'),entries)!}}));
 assertEquals(validPlayLog(JSON.parse(JSON.stringify(log))),true);
 assertEquals(konradState(moduleState(summarizePlay(log).entries,'konrad')).tokens['shaft:upper-left'],2);
 const killed=newPlayEvent({kind:'killed',quantity:1,cause:'hazard',mechanism:'Airlock'});log.push(killed);
 assertEquals(!!deathFacts({killer:'Poltergeist',location:'USS Konrad',finalGirl:'Laurie'},log,killed.id),true);
 assertEquals(deathFacts({killer:'Poltergeist',location:'Creech Manor',finalGirl:'Laurie'},log,killed.id),null);
 const tampered=structuredClone(log);tampered[2].moduleData!.changes.snapshot=String(tampered[2].moduleData!.changes.snapshot).replace('"shaft:upper-left":2','"shaft:upper-left":1');assertEquals(validPlayLog(tampered),false);
});
