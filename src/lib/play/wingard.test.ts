import { describe, expect, it } from 'vitest';
import { WINGARD, WINGARD_MODULE, WINGARD_CRAFTS, WINGARD_EVENTS, WINGARD_SETUPS, WINGARD_STANDARD_ITEMS, WINGARD_SUPPLIES, WINGARD_TERRORS } from '../../../supabase/functions/_shared/play/wingardCatalog';
import { initialWingard, resolveWingardAction, wingardParent, wingardState, type WingardCommand } from '../../../supabase/functions/_shared/play/wingardCottage';
import { suggestedDeathCards } from '../../../supabase/functions/_shared/play/catalog';
import { deathFacts, deathSignature } from './death';
import { newPlayEvent, summarizePlay, validPlayLog, type PlayEvent } from './events';
import { moduleState, moduleStoryBeats } from './modules';
import { isActiveGame } from '@/lib/activeGame';

const selection={location:WINGARD,killer:'Hans',finalGirl:'Ginny',startingEvent:'Home Security',setupScenario:null,mission:null,filmId:'s2-knock-at-door'};
function play(fresh=true) {
  const log:PlayEvent[]=[newPlayEvent({kind:'start',saved:0,killed:0,round:1})];
  if(fresh)log.push(newPlayEvent({kind:'module',moduleData:{module:WINGARD_MODULE,changes:initialWingard(selection.startingEvent)}}));
  const entries=()=>summarizePlay(log).entries;
  const fields=()=>moduleState(entries(),WINGARD_MODULE);
  function apply(command:WingardCommand) {
    const action={...command,parent:wingardParent(entries())};
    const changes=resolveWingardAction(action,fields(),entries());
    if(!changes)throw Error('invalid action');
    const event=newPlayEvent({kind:'module',moduleData:{module:WINGARD_MODULE,changes},wingardAction:action});
    log.push(event);
    expect(validPlayLog(JSON.parse(JSON.stringify(log)))).toBe(true);
    return event;
  }
  return {log,apply,state:()=>wingardState(fields())};
}

describe('Wingard Cottage',()=>{
  it('reconciles the 53 photographed cards and filters contextual death suggestions',()=>{
    const standard=WINGARD_STANDARD_ITEMS.reduce((n,card)=>n+card.count,0);
    expect([WINGARD_SETUPS.length,WINGARD_EVENTS.length,WINGARD_TERRORS.length,WINGARD_SUPPLIES.length,WINGARD_CRAFTS.length,standard]).toEqual([5,10,8,4,10,16]);
    expect(suggestedDeathCards(selection,'terror').some(card=>card.name==='Is Tammy Home?')).toBe(false);
    expect(suggestedDeathCards(selection,'event').some(card=>card.name==='Booby Traps')).toBe(true);
    expect(suggestedDeathCards({...selection,location:'Camp Happy Trails'},'event').some(card=>card.name==='Booby Traps'&&card.location===WINGARD)).toBe(false);
  });

  it('preserves unknowns and atomically returns the exact ingredients of a recorded craft',()=>{
    const {apply,state,log}=play(false);
    expect(state().supplies).toEqual({});
    apply({command:'supply',id:'rope',value:'held'});
    apply({command:'supply',id:'nails',value:'held'});
    const craft=apply({command:'craft',id:'nail-bat'});
    expect(state()).toMatchObject({supplies:{rope:'held',nails:'available'},recipes:{'nail-bat':{status:'crafted'}}});
    expect(state().supplies.wood).toBeUndefined();
    log.push(newPlayEvent({kind:'undo',target:craft.id}));
    expect(state().supplies.nails).toBe('held');
    expect(state().recipes['nail-bat']).toBeUndefined();
    log.push(newPlayEvent({kind:'restore',target:craft.id}));
    expect(validPlayLog(log)).toBe(true);
    expect(state().supplies.nails).toBe('available');
    const {wingardAction,moduleData}=craft;
    expect(validPlayLog([...log,newPlayEvent({kind:'module',wingardAction,moduleData})])).toBe(false);
  });

  it('keeps inherited uses, handles the Slingshot exception and preserves placed traps independently',()=>{
    const {apply,state}=play();
    apply({command:'craft',id:'sawed-off',uses:1});
    expect(state().recipes['sawed-off'].uses).toBe(1);
    apply({command:'use',id:'sawed-off'});
    expect(state().recipes['sawed-off']).toEqual({status:'offered'});
    apply({command:'craft',id:'porcupine'});
    expect(state().recipes.porcupine).toEqual({status:'crafted'});
    apply({command:'craft',id:'slingshot'});
    for(let i=0;i<3;i++)apply({command:'use',id:'slingshot'});
    expect(state().recipes.slingshot).toEqual({status:'crafted',uses:0});
    apply({command:'supply',id:'nails',value:'held'});
    apply({command:'refill',id:'slingshot'});
    expect(state()).toMatchObject({recipes:{slingshot:{status:'crafted',uses:3}},supplies:{nails:'available'}});
    apply({command:'craft',id:'snare'});
    for(const space of ['Kitchen','Porch','Foyer'])apply({command:'place',id:'snare',space});
    expect(state().recipes.snare.status).toBe('offered');
    apply({command:'craft',id:'snare'});
    apply({command:'craft',id:'nail-trap'});
    apply({command:'place',id:'nail-trap',space:'Garage'});
    expect(state().traps).toHaveLength(4);
    apply({command:'trigger',id:'snare',space:'Kitchen'});
    expect(state().traps).toHaveLength(3);
    expect(state().recipes.snare.uses).toBe(3);
  });

  it('supports both alarm disable paths and an explicit boat escape without editing victim totals',()=>{
    const {apply,state,log}=play();
    expect(state().alarm).toBe('ready');
    apply({command:'alarm',value:'activate'});
    for(let i=0;i<3;i++)apply({command:'alarm',value:'block'});
    expect(state().alarm).toBe('disabled');
    apply({command:'alarm',value:'ready'});
    apply({command:'alarm',value:'activate'});
    apply({command:'alarm',value:'cross'});
    expect(state().alarm).toBe('disabled');
    apply({command:'resourceful',value:true});
    apply({command:'person',id:'neighbor',value:'present'});
    apply({command:'person',id:'neighbor',value:'saved',boatSaved:4});
    expect(state()).toMatchObject({people:{neighbor:'saved'},resourceful:true,boatSaved:4});
    expect(summarizePlay(log)).toMatchObject({saved:0,killed:0});
    expect(moduleStoryBeats(selection,summarizePlay(log).entries)).toContain('4 saved including the Neighbor');
  });

  it('authorizes setup ownership, freezes new death context and keeps the pre-import Cottage signature',async()=>{
    const {apply,log}=play();
    const older=newPlayEvent({kind:'killed',quantity:1});
    const fresh=newPlayEvent({kind:'killed',quantity:1,wingardReference:true});
    const before=await deathSignature(deathFacts(selection,[log[0],older],older.id)!);
    log.push(older);
    apply({command:'craft',id:'nail-bat'});
    log.push(fresh);
    const facts=deathFacts(selection,log,fresh.id)!;
    apply({command:'return',id:'nail-bat'});
    expect(deathFacts(selection,log,fresh.id)).toEqual(facts);
    expect(facts.moduleContext?.[WINGARD_MODULE].facts).toContain('Nail Bat');
    expect(await deathSignature(deathFacts(selection,log,older.id)!)).toBe(before);
    expect(deathFacts({...selection,location:'Camp Happy Trails'},log,fresh.id)).toBeNull();
    const game={version:1,phase:'nowPlaying',id:crypto.randomUUID(),selection,wingardSetupVersion:1,playEvents:log};
    expect(isActiveGame(game)).toBe(true);
    expect(isActiveGame({...game,selection:{...selection,startingEvent:'Kick-Scooter'}})).toBe(false);
  });
});
