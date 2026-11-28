import { describe, expect, it } from 'vitest';
import { deathFacts } from './death';
import { decrementPlay, newPlayEvent, summarizePlay, validPlayLog, type PlayEvent } from './events';
import { moduleState } from './modules';
import { eligibleStartingEvent } from '../../../supabase/functions/_shared/play/podarchEvents';
import { freshPesadilla, pesadillaOwnsLog, pesadillaParent, resolvePesadilla, type PesadillaCommand } from '../../../supabase/functions/_shared/play/pesadilla';
import { PESADILLA, PESADILLA_EVENTS, PESADILLA_MODULE, PESADILLA_TERRORS } from '../../../supabase/functions/_shared/play/pesadillaCatalog';

function table(startingEvent: string | null = null, killer = 'Hans', fresh = true) {
  const log: PlayEvent[] = [
    newPlayEvent({kind:'start',saved:4,killed:0,round:1}),
    newPlayEvent({kind:'state',field:'finalHorrorLevel',value:3}),
  ];
  if (fresh) log.push(newPlayEvent({kind:'module',moduleData:{module:PESADILLA_MODULE,changes:freshPesadilla(killer,startingEvent)}}));
  const current = () => summarizePlay(log);
  const state = () => moduleState(current().entries,PESADILLA_MODULE);
  function record(command: PesadillaCommand) {
    const changes = resolvePesadilla(command,state());
    if (!changes) throw new Error('Invalid test setup');
    const group = command.command === 'evacuate' && command.count;
    const event = newPlayEvent({
      ...(group ? {kind:'saved',quantity:group} : {kind:'module'}),
      pesadillaAction:{...command,parent:pesadillaParent(current().entries)},
      moduleData:{module:PESADILLA_MODULE,changes},
    });
    log.push(event);
    expect(validPlayLog(log)).toBe(true);
    return event;
  }
  return {log, current, state, record};
}
describe('Pesadilla Verde location observations',()=>{
  it('evacuates once, corrects a last passenger without restoring and can undo with an unrelated observation',()=>{
    const t=table('Get to the Choppa!');
    const departure=t.record({command:'evacuate',count:3});
    const unrelated=newPlayEvent({kind:'state',field:'killerHealth',value:6});
    t.log.push(unrelated);
    expect(t.current().saved).toBe(7);
    expect(t.state()).toMatchObject({huey:false,choppa:false});
    t.log.push(newPlayEvent({kind:'undo',target:departure.id}));
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.current()).toMatchObject({saved:4,killerHealth:6});
    expect(t.state()).toMatchObject({huey:true,choppa:true});
    t.log.push(newPlayEvent({kind:'restore',target:departure.id}));
    for (let i=0;i<3;i++) t.log.push(newPlayEvent(decrementPlay(t.log,'saved')!));
    expect(validPlayLog(t.log)).toBe(true);
    expect(t.current().saved).toBe(4);
    expect(t.state()).toMatchObject({huey:false,choppa:false});
    t.record({command:'choppa'});
    expect(validPlayLog([...t.log,newPlayEvent({kind:'undo',target:departure.id})])).toBe(false);
  });
  it('preserves unknowns and links the Twitchy lock and re-unlock',()=>{
    const t=table(null,'Hans',false);
    expect(t.state()).toEqual({});
    t.record({command:'effect',id:'twitchy',active:true});
    expect(t.state()).toMatchObject({twitchy:true,'upgrade.friendly':false});
    const unlock=t.record({command:'upgrade',id:'friendly',unlocked:true});
    expect(t.state()).toMatchObject({twitchy:false,'upgrade.friendly':true});
    t.log.push(newPlayEvent({kind:'undo',target:unlock.id}));
    expect(t.state()).toMatchObject({twitchy:true,'upgrade.friendly':false});
  });
  it('leaves portrait outcomes separate and applies known in-range Horror once',()=>{
    const t=table('Sgt. Weathers');
    const defeated=t.record({command:'person',id:'weathers',status:'killed',resolve:true});
    expect(t.current()).toMatchObject({killed:0,finalHorrorLevel:5});
    t.log.push(newPlayEvent({kind:'undo',target:defeated.id}));
    expect(t.current().finalHorrorLevel).toBe(3);
    t.log.push(newPlayEvent({kind:'state',field:'finalHorrorLevel',value:6}));
    t.record({command:'person',id:'weathers',status:'killed',resolve:true});
    expect(t.current().finalHorrorLevel).toBe(6);
  });
  it('validates mixed ownership and preserves separate rescue routes',()=>{
    const t=table();
    const departure=t.record({command:'evacuate',count:2});
    expect(pesadillaOwnsLog({location:PESADILLA,killer:'Hans'},t.log)).toBe(true);
    expect(pesadillaOwnsLog({location:'USS Konrad',killer:'Hans'},t.log)).toBe(false);
    for (const killer of ['The Podarchs','Birds','Mort the Teenage Dirtbag']) {
      expect(pesadillaOwnsLog({location:PESADILLA,killer},[departure])).toBe(false);
    }
    for (const killer of ['The Podarchs','Birds']) {
      expect(eligibleStartingEvent(killer,PESADILLA,'Sgt. Weathers')).toBe(false);
      expect(eligibleStartingEvent(killer,PESADILLA,'Piranhas!')).toBe(true);
    }
  });
  it('freezes river context at the death and excludes unobserved reach',()=>{
    const t=table('Piranhas!');
    const selection={location:PESADILLA,killer:'Hans',finalGirl:'Dakota'};
    const death=()=>newPlayEvent({kind:'killed',quantity:1,cause:'event',eventCard:'Piranhas!'});
    const unknown=death();
    t.log.push(unknown);
    t.record({command:'piranhas',reach:'Lower River'});
    const known=death();
    t.log.push(known);
    const facts=deathFacts(selection,t.log,known.id);
    expect(JSON.stringify(facts)).toContain('Lower River');
    t.record({command:'piranhas',reach:'Upper River'});
    expect(deathFacts(selection,t.log,known.id)).toEqual(facts);
    expect(JSON.stringify(deathFacts(selection,t.log,unknown.id))).not.toContain('Lower River');
  });
  it('initializes the correct range of observations for every photographed Event',()=>{
    expect(PESADILLA_EVENTS).toHaveLength(10);
    expect(PESADILLA_TERRORS).toHaveLength(8);
    for (const {name} of PESADILLA_EVENTS) {
      expect(validPlayLog(table(name).log)).toBe(true);
    }
    expect(freshPesadilla('Hans','Piranhas!').piranhas).toBe('unrecorded');
    expect(freshPesadilla('Hans','Get to the Choppa!')).toMatchObject({huey:true,choppa:true});
  });
});
