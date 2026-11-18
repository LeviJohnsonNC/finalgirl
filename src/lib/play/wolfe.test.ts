import {describe,expect,it} from 'vitest';
import {deathFacts,deathSignature} from './death';
import {canChangeDeathCount,canUndoWolfe,decrementPlay,newPlayEvent,playStoryBeats,summarizePlay,validPlayLog} from './events';
import {moduleItemBeats,moduleState} from './modules';
import {suggestedDeathCards} from './catalog';
import {
  WOLFE,WOLFE_AMPED,WOLFE_EVENTS,WOLFE_ITEMS,WOLFE_MODULE,WOLFE_RECIPES,WOLFE_SETUPS,WOLFE_SIDE_EFFECTS,WOLFE_TERRORS,
} from '../../../supabase/functions/_shared/play/wolfeCatalog';
import {
  emptyPills,initialWolfe,resolveWolfe,wolfeCasualties,wolfeAmped,wolfeOwnsLog,wolfeParent,wolfePills,wolfeRecipeOptions,type WolfeCommand,
} from '../../../supabase/functions/_shared/play/wolfe';

const selection={killer:'Ratchet Lady',location:WOLFE,finalGirl:'Heather'};
const start=()=>newPlayEvent({kind:'start',round:1,killed:0,saved:0});
function table(event?:string,legacy=false) {
  const log=[start()];
  if(!legacy)log.push(newPlayEvent({kind:'module',moduleData:{module:WOLFE_MODULE,changes:initialWolfe(event)}}));
  const entries=()=>summarizePlay(log).entries;
  const state=()=>moduleState(entries(),WOLFE_MODULE);
  const next=(command:WolfeCommand)=>{
    const wolfeAction={...command,parent:wolfeParent(entries())};
    const changes=resolveWolfe(wolfeAction,state(),entries());
    if(!changes) return;
    const moduleData={module:WOLFE_MODULE,changes} as const;
    const quantity=wolfeCasualties(wolfeAction);
    return newPlayEvent(quantity?{kind:'killed',quantity,moduleData,wolfeAction,wolfeReference:true,cause:'event',eventCard:'Hospital Gurney'}
      :{kind:'module',moduleData,wolfeAction});
  };
  const act=(command:WolfeCommand)=>{
    const e=next(command);
    if(!e)throw Error('Invalid command');
    log.push(e);
    expect(validPlayLog(log)).toBe(true);
    return e;
  };
  return {log,entries,state,next,act};
}

describe('Wolfe Asylum',()=>{
  it('reconciles cards and applies the Mysterious Pills effect only in Wolfe',()=>{
    expect([WOLFE_SETUPS.length,WOLFE_EVENTS.length,WOLFE_TERRORS.length,WOLFE_AMPED.length]).toEqual([5,10,8,5]);
    expect(WOLFE_ITEMS.reduce((n,c)=>n+c.quantity,0)).toBe(18);
    expect(WOLFE_SIDE_EFFECTS.reduce((n,c)=>n+c.quantity,0)).toBe(10);
    const item=newPlayEvent({kind:'moment',momentType:'item',text:'Found item',detail:'Mysterious Pills'});
    expect(moduleItemBeats(selection,[item])).toContain('take two Pill tokens');
    expect(moduleItemBeats({...selection,location:'Creech Manor'},[item])).toContain('recover 2 Health');
    expect(suggestedDeathCards(selection,'terror').some(card=>card.name==='I Found Some Candy!')).toBe(true);
    expect(suggestedDeathCards({...selection,location:'Camp Happy Trails'},'terror').some(card=>card.name==='I Found Some Candy!')).toBe(false);
  });

  it('distinguishes fresh, legacy and known empty and seeds only persistent facts',()=>{
    expect(table().state()).toEqual({startingPill:true});
    expect(table('The New Patients Are Here!').state()).toEqual({startingPill:true});
    expect(table('Powerful Meds').state()).toEqual({startingPill:true,'active.powerful-meds':true});
    const t=table(undefined,true);
    expect(wolfePills(t.state())).toBeUndefined();
    expect(t.next({command:'pickup',color:'yellow'})).toBeUndefined();
    t.act({command:'inventory',pills:emptyPills()});
    expect(wolfePills(t.state())).toEqual(emptyPills());
  });

  it.each(WOLFE_RECIPES.map(card=>[card.id,card.colors.length]))('debits each exact %s recipe', (id,size)=>{
    const t=table();
    t.act({command:'inventory',pills:{yellow:1,blue:1,pink:1,wild:1}});
    t.act({command:'spend',recipe:String(id)});
    expect(Object.values(wolfePills(t.state())!).reduce((a,b)=>a+b,0)).toBe(4-Number(size));
  });

  it('updates pill inventory, Health and Horror together, with ordered undo and restore',()=>{
    const t=table();
    t.log.push(newPlayEvent({kind:'state',field:'finalGirlHealth',value:2}),newPlayEvent({kind:'state',field:'finalHorrorLevel',value:2}));
    t.act({command:'inventory',pills:{yellow:2,blue:2,pink:1,wild:0}});
    t.act({command:'remove-pill',color:'yellow'});
    expect(t.next({command:'remove-pill',color:'wild'})).toBeUndefined();
    const heal=t.act({command:'eat',recipe:'yellow-blue',maxHealth:5});
    expect(summarizePlay(t.log).finalGirlHealth).toBe(5);
    expect(wolfePills(t.state())).toEqual({yellow:0,blue:1,pink:1,wild:0});
    t.log.push(newPlayEvent({kind:'undo',target:heal.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(summarizePlay(t.log).finalGirlHealth).toBe(2);
    expect(wolfePills(t.state())?.yellow).toBe(1);
    t.log.push(newPlayEvent({kind:'restore',target:heal.id}));
    expect(validPlayLog(t.log)).toBe(true);
    const calm=t.act({command:'eat',recipe:'blue-pink'});
    expect(summarizePlay(t.log)).toMatchObject({finalGirlHealth:5,finalHorrorLevel:0});
    t.log.push(newPlayEvent({kind:'undo',target:calm.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(summarizePlay(t.log).finalHorrorLevel).toBe(2);
  });

  it('leaves legacy spends manual and caps one-pill healing without inventing unknown Health',()=>{
    const t=table();
    t.act({command:'inventory',pills:{yellow:3,blue:0,pink:0,wild:0}});
    t.act({command:'eat',recipe:'yellow',maxHealth:5});
    expect(summarizePlay(t.log).finalGirlHealth).toBeUndefined();
    t.log.push(newPlayEvent({kind:'state',field:'finalGirlHealth',value:4}));
    t.act({command:'spend',recipe:'yellow'});
    expect(summarizePlay(t.log).finalGirlHealth).toBe(4);
    t.act({command:'eat',recipe:'yellow',maxHealth:5});
    expect(summarizePlay(t.log).finalGirlHealth).toBe(5);
    t.act({command:'pickup',color:'yellow'});
    t.act({command:'eat',recipe:'yellow',maxHealth:5});
    expect(summarizePlay(t.log).finalGirlHealth).toBe(5);
  });

  it('toggles Amped in the old and new logs without losing revealed cards or the second Ultimate',()=>{
    const t=table();
    t.act({command:'amped',id:'final-girl-2',active:true});
    t.act({command:'ultimate',name:'Veronica'});
    expect(wolfeAmped(t.state())).toBe(true);
    t.act({command:'toggle-amped',active:false});
    expect(wolfeAmped(t.state())).toBe(false);
    expect(t.state().secondUltimate).toBe('Veronica');
    expect(playStoryBeats(t.log,selection)).not.toContain('Second Ultimate is from Veronica');
    t.act({command:'amped',id:'resistance',active:true,enable:true});
    expect(wolfeAmped(t.state())).toBe(true);
    expect(playStoryBeats(t.log,selection)).toContain('Second Ultimate is from Veronica');
  });

  it('uses a Wild once, preserves exact tokens, and keeps Amped observations independent',()=>{
    const t=table('Powerful Meds');
    t.act({command:'inventory',pills:{yellow:1,blue:1,pink:0,wild:1}});
    expect(wolfeRecipeOptions(wolfePills(t.state())!,'amped')).toEqual(['pink']);
    t.act({command:'spend',recipe:'amped',wildFor:'pink'});
    const p=wolfePills(t.state());
    expect(p).toEqual(emptyPills());
    t.act({command:'amped',id:'final-girl-2',active:true});
    t.act({command:'ultimate',name:'Veronica'});
    t.act({command:'amped',id:'resistance',active:true});
    expect(playStoryBeats(t.log,selection)).toContain('Second Ultimate is from Veronica');
    t.act({command:'amped',id:'final-girl-2',active:false});
    expect(t.state()).not.toHaveProperty('secondUltimate');
    expect(t.state()['amped.resistance']).toBe(true);
  });

  it.each([0,1,2])('records a ram with %s riders once and rolls both sides back together',riders=>{
    const t=table('Hospital Gurney');
    if(riders)t.act({command:'gurney',riders});
    const ram=t.act({command:'ram',riders});
    expect(t.state().gurney).toBe('spent');
    expect(summarizePlay(t.log).killed).toBe(riders);
    const undo=newPlayEvent({kind:'undo',target:ram.id});
    if(riders) {
      expect(deathFacts(selection,t.log,ram.id)?.quantity).toBe(riders);
      const edit=newPlayEvent({kind:'death-count',target:ram.id,delta:1});
      expect(canChangeDeathCount(t.log,edit)).toBe(false);
      expect(validPlayLog([...t.log,edit])).toBe(false);
      expect(decrementPlay(t.log,'killed')).toEqual({kind:'undo',target:ram.id});
    }
    expect(wolfeOwnsLog('Creech Manor',t.log)).toBe(false);
    t.log.push(undo);
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.state().gurney).toBe(riders);
    expect(summarizePlay(t.log).killed).toBe(0);
    t.log.push(newPlayEvent({kind:'restore',target:ram.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(summarizePlay(t.log).killed).toBe(riders);
  });

  it('undoes and restores a ram across unrelated Asylum records',()=>{
    const t=table('Hospital Gurney');
    t.act({command:'gurney',riders:2});
    const ram=t.act({command:'ram',riders:2});
    expect(t.next({command:'clear-gurney'})).toBeUndefined();
    t.act({command:'inventory',pills:{...emptyPills(),yellow:1}});
    t.act({command:'event',id:'powerful-meds',active:true});

    const undo=newPlayEvent({kind:'undo',target:ram.id});
    t.log.push(undo);
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.state()).toMatchObject({gurney:2,'active.powerful-meds':true});
    expect(wolfePills(t.state())?.yellow).toBe(1);
    expect(summarizePlay(t.log).killed).toBe(0);

    const restore=newPlayEvent({kind:'restore',target:ram.id});
    expect(validPlayLog([...t.log,restore])).toBe(true);
    expect(summarizePlay([...t.log,restore]).killed).toBe(2);
    t.act({command:'gurney',riders:1});
    expect(canUndoWolfe(t.log,ram.id,true)).toBe(false);
    expect(validPlayLog([...t.log,restore])).toBe(false);
  });

  it('clears a gurney and recovers unknown or recorded riders without adding deaths',()=>{
    const t=table(undefined,true);
    expect(t.next({command:'clear-gurney'})).toBeUndefined();
    t.act({command:'gurney',riders:null});
    const spent=t.act({command:'spent'});
    t.log.push(newPlayEvent({kind:'undo',target:spent.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.state().gurney).toBe('unknown');
    expect(summarizePlay(t.log).killed).toBe(0);
    t.act({command:'gurney',riders:1});
    const clear=t.act({command:'clear-gurney'});
    expect(t.state()).not.toHaveProperty('gurney');
    t.act({command:'toggle-amped',active:true});
    t.log.push(newPlayEvent({kind:'undo',target:clear.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.state()).toMatchObject({gurney:1,'amped.on':true});
  });

  it('rejects stale actions and preserves historical context across later corrections',async()=>{
    const t=table('Hospital Gurney');
    const old=newPlayEvent({kind:'killed',quantity:1,cause:'unspecified'});
    t.log.push(old);
    const original=await deathSignature(deathFacts(selection,t.log,old.id)!);
    t.act({command:'gurney',riders:2});
    const ram=t.act({command:'ram',riders:2});
    const facts=deathFacts(selection,t.log,ram.id)!;
    expect(facts.moduleContext?.wolfe?.facts).toContain('Gurney is recorded spent');
    const stale=t.next({command:'stun',enemy:'maniacs',count:2})!;
    t.act({command:'event',id:'powerful-meds',active:true});
    expect(validPlayLog([...t.log,stale])).toBe(false);
    expect(deathFacts(selection,t.log,ram.id)).toEqual(facts);
    expect(await deathSignature(deathFacts(selection,t.log,old.id)!)).toBe(original);
    t.act({command:'stun',enemy:'maniacs',count:2});
    const clear=t.act({command:'clear-stun'});
    expect(t.state()['stun.maniacs']).toBeUndefined();
    t.log.push(newPlayEvent({kind:'undo',target:clear.id}));
    expect(t.state()['stun.maniacs']).toBe(2);
  });
});
