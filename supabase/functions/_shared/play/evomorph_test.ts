import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
Deno.test('Evomorph shared observations survive JSONB order and reject a forged stage transition', async()=>{
 const {newPlayEvent,validPlayLog,summarizePlay}=await import('./events.ts');
 const {moduleState}=await import('./modules.ts');
 const {initialEvomorph,evomorphParent,resolveEvomorphAction}=await import('./evomorph.ts');
 const log=[newPlayEvent({kind:'start',saved:0,killed:0,round:1}),newPlayEvent({kind:'module',moduleData:{module:'evomorph',changes:initialEvomorph()}})];
 const entries=summarizePlay(log).entries;
 const action={parent:evomorphParent(entries),command:'evolve' as const};
 const changes=resolveEvomorphAction(action,moduleState(entries,'evomorph'),entries)!;
 log.push(newPlayEvent({kind:'module',evomorphAction:action,moduleData:{module:'evomorph',changes:Object.fromEntries(Object.entries(changes).reverse())}}));
 assertEquals(validPlayLog(JSON.parse(JSON.stringify(log))),true);
 const bad=[...log,newPlayEvent({kind:'module',evomorphAction:{parent:log.at(-1)!.id,command:'evolve'},moduleData:{module:'evomorph',changes:{stage:'hatchling'}}})];
 assertEquals(validPlayLog(bad),false);
 const {deathFacts}=await import('./death.ts');
 const death=newPlayEvent({kind:'killed',quantity:1,cause:'killer',attacker:'Evomorph'});log.push(death);
 assertEquals(deathFacts({killer:'Evomorph',location:'Maple Lane',finalGirl:'Nancy'},log,death.id)?.moduleContext?.evomorph.stage,'youngling');
 assertEquals(deathFacts({killer:'Hans',location:'Maple Lane',finalGirl:'Nancy'},log,death.id),null);
});
