import {describe,expect,it} from 'vitest';
import {deathFacts,deathSignature,organismDeathAttackers} from './death';
import {findPlayCard,selectionItems,suggestedDeathCards} from './catalog';
import {newPlayEvent,playStoryBeats,summarizePlay,validPlayLog,type PlayEvent} from './events';
import {moduleState} from './modules';
import {playStartingValues} from './defaults';
import {
  ORGANISM, ORGANISM_FINALES, ORGANISM_FORMS, ORGANISM_MINORS, ORGANISM_MODULE, ORGANISM_TERRORS,
  initialOrganism,isOrganismCasualty,minorOwnerKey,organismBonus,organismFigure,organismLiving,organismParent,
  organismRevealEffects,resolveOrganismAction,type OrganismAction,type OrganismCommand,
} from './organism';
import {buildBeginningPrompt,buildVisualBiblePrompt} from '../../../supabase/functions/_shared/prompts';
import {buildOpeningUser} from '../../../supabase/functions/_shared/storyPrompts';

const selection={killer:ORGANISM,location:'Falconwood',finalGirl:'Kate'};
function session(bloodlust:number|null=0) {
  const log=[
    newPlayEvent({kind:'start',round:1,saved:0,killed:0}),
    newPlayEvent({kind:'state',field:'bloodlust',value:bloodlust}),
    newPlayEvent({kind:'module',moduleData:{module:ORGANISM_MODULE,changes:initialOrganism()}}),
  ];
  const summary=()=>summarizePlay(log);
  const state=()=>moduleState(summary().entries,ORGANISM_MODULE);
  const next=(command:OrganismCommand)=>{
    const organismAction:OrganismAction={...command,parent:organismParent(summary().entries)};
    const changes=resolveOrganismAction(organismAction,state(),summary().entries);
    if(!changes) return;
    const moduleData={module:ORGANISM_MODULE,changes} as const;
    return newPlayEvent(isOrganismCasualty(organismAction)
      ? {kind:'killed',quantity:1,cause:'hazard',organismReference:true,organismAction,moduleData}
      : {kind:'module',organismAction,moduleData});
  };
  const act=(command:OrganismCommand)=>{
    const event=next(command);
    expect(event).toBeDefined();
    log.push(event!);
    expect(validPlayLog(log)).toBe(true);
    return event!;
  };
  return {log,summary,state,act,next};
}

describe('The Organism',()=>{
  it('reconciles the deck and Tough worked example, and keeps killer items with the killer',()=>{
    expect(ORGANISM_TERRORS.reduce((count,card)=>count+card.quantity,0)+ORGANISM_MINORS.length).toBe(16);
    expect(ORGANISM_FORMS.every(form=>form.attack.length===8&&form.move.length===8&&form.effects.length===8)).toBe(true);
    expect(organismRevealEffects('tough',3)).toEqual([
      'Target the closest eligible Victim and move.','Target the closest eligible Victim and move.','Draw an Event.',
    ]);
    expect(ORGANISM_FORMS[0].move[3]).toBe(2);
    expect(playStartingValues(ORGANISM,'Kate')).toEqual({finalGirlHealth:4,bloodlust:0,finalHorrorLevel:5});
    expect(selectionItems(selection)).toContainEqual(expect.objectContaining({name:'Test Kit'}));
    expect(selectionItems({...selection,killer:'Hans'})).not.toContainEqual(expect.objectContaining({name:'Test Kit'}));
    expect(findPlayCard(selection,'terror','Who can we trust?')?.effect).toContain('panic');
    expect(suggestedDeathCards(selection,'terror').filter(card=>card.killer===ORGANISM)).toHaveLength(9);
  });

  it.each([[2,3],[7,7],[null,undefined]])('records a forced Safe once at Bloodlust %s and reverses it with the casualty', (before,after)=>{
    const t=session(before);
    const event=t.act({command:'safe',who:'red',source:'forced'});
    expect(t.summary().bloodlust).toBe(after);
    expect(t.summary().killed).toBe(1);
    expect(organismFigure(t.state(),'red').status).toBe('casualty');
    expect(t.next({command:'safe',who:'red',source:'forced'})).toBeUndefined();
    expect(validPlayLog([...t.log,newPlayEvent({kind:'death-count',target:event.id,delta:1})])).toBe(false);
    t.log.push(newPlayEvent({kind:'undo',target:event.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.summary().bloodlust).toBe(before??undefined);
    expect(t.summary().killed).toBe(0);
    expect(organismFigure(t.state(),'red').status).toBe('exposed');
    t.log.push(newPlayEvent({kind:'restore',target:event.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.summary().killed).toBe(1);
  });

  it('distinguishes ordinary Safe, already-counted Safe, and forced assimilation',()=>{
    const t=session(4);
    expect(t.next({command:'safe',who:'red',source:'alone'})).toBeUndefined();
    t.act({command:'safe',who:'red',source:'ordinary'});
    t.log.push(newPlayEvent({kind:'killed',quantity:1,cause:'event'}));
    t.act({command:'safe',who:'black',source:'forced',alreadyCounted:true});
    t.act({command:'assimilate',who:'grey',source:'forced',form:'five'});
    expect(t.summary()).toMatchObject({killed:1,saved:0,bloodlust:4});
    expect(organismFigure(t.state(),'red').status).toBe('safe');
    expect(organismFigure(t.state(),'grey').health).toBe(5);
  });

  it('applies a pending Minor to the first physical reveal and deduplicates a named or unnamed Finale',()=>{
    for(const killerCard of [undefined,ORGANISM_FINALES[1].name]){
      const t=session();
      t.act({command:'minor',card:'legs',owner:'waiting',health:2});
      const reveal=newPlayEvent({kind:'moment',momentType:'finale',killerCard,text:'Finale revealed',permanent:true});
      t.log.push(reveal);
      const assignments=[{who:'grey',form:'five'},{who:'red',form:'tough'},{who:'black',form:'six'}] as const;
      expect(t.next({command:'finale',reveal:reveal.id,assignments:[assignments[0],assignments[0],assignments[2]]})).toBeUndefined();
      const event=t.act({command:'finale',reveal:reveal.id,assignments:[...assignments]});
      expect(t.state()[minorOwnerKey('legs')]).toBe('grey');
      expect(organismFigure(t.state(),'grey').order).toBe(1);
      expect(organismFigure(t.state(),'black').order).toBe(3);
      expect(organismLiving(t.state())).toHaveLength(3);
      t.log.push(newPlayEvent({kind:'details',target:reveal.id,killerCard:''}));
      expect(t.next({command:'finale',reveal:reveal.id,assignments:[...assignments]})).toBeUndefined();
      t.log.push(newPlayEvent({kind:'undo',target:event.id}));
      expect(validPlayLog(t.log)).toBe(true);
      expect(t.state()[minorOwnerKey('legs')]).toBe('waiting');
      expect(organismLiving(t.state())).toHaveLength(0);
    }
  });

  it('keeps tokens separate from protected Minor hearts and resolves two pending forms independently',()=>{
    const t=session();
    t.act({command:'assimilate',who:'red',source:'ordinary',form:'tough'});
    t.act({command:'assimilate',who:'black',source:'ordinary',form:'six'});
    expect(t.next({command:'assimilate',who:'grey',source:'ordinary',form:'six'})).toBeUndefined();
    t.act({command:'minor',card:'acidic',owner:'red',health:1});
    t.act({command:'minor',card:'legs',owner:'red',health:2});
    t.act({command:'minor',card:'skin',owner:'red',health:3});
    expect(t.next({command:'minor',card:'acidic',owner:'red',health:0})).toBeUndefined();
    t.act({command:'health',who:'red',value:1});
    t.act({command:'health',who:'black',value:1});
    expect(organismBonus(t.state())).toBe(true);
    expect(t.next({command:'minor',card:'acidic',owner:'red',health:0})).toBeUndefined();
    t.act({command:'minor',card:'legs',owner:'red',health:0});
    t.act({command:'minor',card:'skin',owner:'red',health:0});
    t.act({command:'minor',card:'acidic',owner:'red',health:0});
    t.act({command:'token-loss',who:'red'});
    t.act({command:'token-loss',who:'black'});
    expect(organismBonus(t.state())).toBe(false);
    t.act({command:'token-result',who:'black',value:1});
    expect(organismFigure(t.state(),'red').pending).toBe(true);
    expect(organismFigure(t.state(),'black').token).toBe('white');
    const white=t.act({command:'token-loss',who:'black'});
    expect(t.next({command:'token-result',who:'black',value:2})).toBeUndefined();
    t.act({command:'token-result',who:'black',value:0});
    expect(validPlayLog([...t.log,newPlayEvent({kind:'undo',target:white.id})])).toBe(false);
    t.act({command:'token-result',who:'red',value:2});
    expect(organismFigure(t.state(),'red').health).toBe(2);
  });

  it('uses historical death context and leaves a legacy death signature untouched',async()=>{
    const t=session();
    const legacy=newPlayEvent({kind:'killed',quantity:1,cause:'event'});
    const old=deathFacts(selection,[t.log[0],legacy],legacy.id)!;
    t.log.push(legacy);
    t.act({command:'assimilate',who:'red',source:'ordinary',form:'tough'});
    const death=t.act({command:'safe',who:'grey',source:'forced'});
    const original=deathFacts(selection,t.log,death.id)!;
    expect(original.cause).toBe('hazard');
    expect(original.moduleContext?.organism?.facts).toContain('Grey: confirmed casualty');
    expect(organismDeathAttackers(t.log,death.id)).toEqual(['Tough']);
    t.act({command:'assimilate',who:'black',source:'ordinary',form:'six'});
    const sorted:PlayEvent[]=JSON.parse(JSON.stringify(t.log));
    expect(await deathSignature(deathFacts(selection,sorted,death.id)!)).toBe(await deathSignature(original));
    expect(await deathSignature(deathFacts(selection,t.log,legacy.id)!)).toBe(await deathSignature(old));
    expect(deathFacts({...selection,killer:'Hans'},t.log,death.id)).toBeNull();
    expect(playStoryBeats(t.log,selection)).toContain('6-HP form');
  });

  it('replaces stale creature guidance in the opening and Reshoot while preserving the selected cast',()=>{
    const ctx={...selection,story:'The crew waits.',killerDescription:'STALE CREATURE PORTRAIT',visualBible:JSON.stringify({
      killer:'STALE RUBBER MONSTER',finalGirl:'An ordinary woman',location:'Dim shared office',palette:'Available warm lamp',
    })};
    const story=buildOpeningUser({killer:{name:ORGANISM,appearance:ctx.killerDescription},finalGirl:{name:'Kate'},location:{name:'Falconwood'}});
    for(const prompt of [story,buildBeginningPrompt(ctx),buildVisualBiblePrompt(ctx)]){
      expect(prompt).toContain('Keep every person visibly human');
      expect(prompt).not.toContain('STALE');
      expect(prompt).toContain('Kate');
      expect(prompt).toContain('Falconwood');
    }
  });
});
