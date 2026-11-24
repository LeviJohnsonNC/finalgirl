import { describe, expect, it } from 'vitest';
import { deathFacts, deathSignature } from './death';
import { canUndoRazorface, newPlayEvent, summarizePlay, validPlayLog, type PlayEvent } from './events';
import { moduleStoryBeats } from './modules';
import { getFinalGirlReference } from '@/data/finalGirlReferences';
import { getOwnedContent } from '@/types/gameData';
import {
  AFFLICTIONS, RAZORFACE_TERRORS, razorfaceLatest, razorfaceState, type RazorfaceCommand,
} from '../../../supabase/functions/_shared/play/razorface';

function table() {
  const log: PlayEvent[] = [
    newPlayEvent({kind:'start',saved:0,killed:0,round:null}),
    newPlayEvent({kind:'state',field:'finalGirlHealth',value:5}),
    newPlayEvent({kind:'state',field:'killerHealth',value:1}),
  ];
  const summary = () => summarizePlay(log);
  const state = () => razorfaceState(summary().entries);
  function act(command: RazorfaceCommand) {
    const event: PlayEvent = {id:crypto.randomUUID(), at:Date.now(), kind:'module',moduleData:{module:'razorface',changes:{
      action:JSON.stringify({...command,parent:razorfaceLatest(summary().entries)?.id ?? 'root'}),
    }}};
    if (!validPlayLog([...log,event])) return null;
    log.push(event);
    return event;
  }
  return {log,summary,state,act};
}

const selection = { killer:'Razorface', location:'Falconwood', finalGirl:'Christie' };

describe('Razorface observations', () => {
  it('reconciles the physical deck and the film’s cast', () => {
    expect(AFFLICTIONS).toHaveLength(8);
    expect(RAZORFACE_TERRORS.reduce((total,card)=>total+card.quantity,0)).toBe(16);
    const casting = getOwnedContent(['s3-hell-to-pay','s3-falconwood-files']);
    expect([...casting.locations].sort()).toEqual(['Falconwood','Hellscape']);
    expect([...casting.finalGirls].sort()).toEqual(['Christie','Janelle','Kenzie','Octavia']);
    expect(getFinalGirlReference('Kenzie')).toMatchObject({startingHealth:5,dossierRescues:5});
    expect(getFinalGirlReference('Christie')).toMatchObject({startingHealth:5,dossierRescues:4});
  });

  it('keeps unknown distinct from cleared, and replacements from purges', () => {
    const game = table();
    expect(game.state().active).toBeUndefined();
    expect(game.act({kind:'token',result:'defeated'})).toBeNull();
    expect(game.act({kind:'setup',cards:['experience-unbound','the-gift-of-pain','the-gift-of-pain']})).toBeNull();
    expect(game.act({kind:'setup',cards:['experience-unbound','the-gift-of-pain','you-call-i-come']})).toBeTruthy();
    game.act({kind:'minor',card:'the-pain-of-salvation',present:true});
    expect(game.act({kind:'replace',card:'you-call-i-come',replacement:'a-lamb-to-the-slaughter',reason:'impossible'})).toBeTruthy();
    expect(game.state()).toMatchObject({purged:[],removed:['you-call-i-come'],minors:['the-pain-of-salvation']});
    expect(game.act({kind:'draw',card:'you-call-i-come'})).toBeNull();
    expect(game.act({kind:'token',result:'revived',health:2})).toBeNull();
    expect(game.act({kind:'purge',card:'the-gift-of-pain',newTurn:false})).toBeTruthy();
    expect(game.state().minors).toEqual([]);
    expect(game.act({kind:'purge',card:'experience-unbound',newTurn:false})).toBeNull();
    expect(game.act({kind:'purge',card:'experience-unbound',newTurn:true})).toBeTruthy();
  });

  it('undoes and restores the linked result while retaining an unrelated action', () => {
    const game = table();
    game.act({kind:'correct',cards:['experience-unbound']});
    game.act({kind:'minor',card:'the-pain-of-judgment',present:true});
    game.act({kind:'minor',card:'the-pain-of-salvation',present:true});
    game.log.push(newPlayEvent({kind:'moment',momentType:'dark-power',text:'Dark Power revealed',killerCard:'Life Drain'}));
    const purge = game.act({kind:'purge',card:'experience-unbound',newTurn:false,girlHealth:4,killerHealth:5})!;
    expect(game.state()).toMatchObject({active:[],minors:[]});
    expect(game.summary().killerHealth).toBe(5);
    game.log.push(newPlayEvent({kind:'saved',quantity:1}));
    game.log.push(newPlayEvent({kind:'undo',target:purge.id}));
    expect(validPlayLog(game.log)).toBe(true);
    expect(game.state()).toMatchObject({active:['experience-unbound'],minors:['the-pain-of-judgment','the-pain-of-salvation']});
    expect(game.summary()).toMatchObject({killerHealth:1, finalGirlHealth:5, saved:1});
    game.log.push(newPlayEvent({kind:'restore',target:purge.id}));
    expect(validPlayLog(game.log)).toBe(true);
    expect(game.summary()).toMatchObject({killerHealth:5, finalGirlHealth:4, saved:1});
    game.log.push(newPlayEvent({kind:'state',field:'killerHealth',value:1}));
    expect(game.act({kind:'token',result:'revived',health:2})).toBeTruthy();
    expect(canUndoRazorface(game.log,purge.id)).toBe(false);
  });

  it('records resulting Horror in the purge and restores its prior value on Undo', () => {
    const game = table();
    game.log.push(newPlayEvent({kind:'state',field:'finalHorrorLevel',value:5}));
    game.act({kind:'correct',cards:['explorers-of-the-flesh']});
    const purge = game.act({kind:'purge',card:'explorers-of-the-flesh',newTurn:false,horror:6})!;
    expect(game.summary().finalHorrorLevel).toBe(6);
    game.log.push(newPlayEvent({kind:'undo',target:purge.id}));
    expect(validPlayLog(game.log)).toBe(true);
    expect(game.summary().finalHorrorLevel).toBe(5);
  });

  it('records exhaustion only after a required draw fails and can confirm a physical win', () => {
    const game = table();
    game.act({kind:'correct',cards:[]});
    expect(game.state().result).toBeUndefined();
    expect(game.act({kind:'exhausted'})).toBeTruthy();
    expect(game.act({kind:'token',result:'defeated',tabletop:true})).toBeNull();
    expect(moduleStoryBeats(selection,game.summary().entries)).toContain('required Affliction draw failed');
    const won = table();
    expect(won.act({kind:'token',result:'defeated',tabletop:true})).toBeTruthy();
    expect(won.state()).toMatchObject({active:[],purged:[],result:'defeated'});
    expect(won.summary().killerHealth).toBe(0);
  });

  it('freezes a historical death across later Undo and keeps casting owners separate', async () => {
    const game = table();
    const record = game.act({kind:'correct',cards:['the-gift-of-pain']})!;
    const death = newPlayEvent({kind:'killed',quantity:1,cause:'terror',terrorCard:'Scarlet Hymn'});
    game.log.push(death);
    const before = deathFacts(selection, game.log, death.id)!;
    expect(before.moduleContext?.razorface.facts).toContain('The Gift of Pain');
    game.log.push(newPlayEvent({kind:'undo',target:record.id}));
    const after = deathFacts(selection, game.log, death.id)!;
    expect(await deathSignature(after)).toBe(await deathSignature(before));
    expect(deathFacts({...selection,killer:'Hans'}, game.log, death.id)).toBeNull();
  });
});
