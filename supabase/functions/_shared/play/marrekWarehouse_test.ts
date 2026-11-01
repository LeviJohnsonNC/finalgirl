import {assertEquals} from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {initialMarrek,marrekState,marrekParent,resolveMarrekAction,type MarrekCommand} from './marrekWarehouse.ts';
import {newPlayEvent,summarizePlay,validPlayLog,type PlayEvent} from './events.ts';
import {moduleState} from './modules.ts';
import {deathFacts} from './death.ts';
Deno.test('native Warehouse replay: real unlock and delivery are atomic; correction is not arrival',()=>{
 const log:PlayEvent[]=[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),newPlayEvent({kind:'module',moduleData:{module:'marrek',changes:initialMarrek('Trucks Are Here!')}})];
 const act=(command:MarrekCommand)=>{const entries=summarizePlay(log).entries,action={...command,parent:marrekParent(entries)},changes=resolveMarrekAction(action,moduleState(entries,'marrek'),entries)!;log.push(newPlayEvent({kind:'module',marrekAction:action,moduleData:{module:'marrek',changes}}));};
 act({command:'correct-exit',id:'dock-a',locked:false});assertEquals(marrekState(moduleState(summarizePlay(log).entries,'marrek')).trucks?.a,'waiting');
 act({command:'exit',id:'dock-b',locked:false,intent:'resolve'});assertEquals(marrekState(moduleState(summarizePlay(log).entries,'marrek')).trucks?.b,'entered');assertEquals(validPlayLog(log),true);
 const death=newPlayEvent({kind:'killed',quantity:1,cause:'hazard',mechanism:'Rack fall'});log.push(death);assertEquals(deathFacts({killer:'Hans',location:'Camp Happy Trails',finalGirl:'Mandy'},log,death.id),null);assertEquals(Boolean(deathFacts({killer:'Hans',location:'Marrek Warehouse',finalGirl:'Mandy'},log,death.id)),true);
});
