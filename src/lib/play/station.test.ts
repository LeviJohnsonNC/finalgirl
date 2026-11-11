import {describe,expect,it} from 'vitest';
import {newPlayEvent,playStoryBeats,summarizePlay,validPlayLog,type PlayEvent} from './events';
import {deathFacts,deathSignature} from './death';
import {moduleState} from './modules';
import {
  initialStation,resolveStationAction,stationFacts,stationParent,stationState,stationSetup,
  STATION,STATION_MODULE,STATION_EVENTS,STATION_ITEMS,STATION_OUTDOORS,STATION_SEARCH,
  STATION_SETUPS,STATION_SPACES,STATION_TERRORS,type StationAction,type StationCommand,
} from '../../../supabase/functions/_shared/play/station';

const selection = {killer:'Hans',location:STATION,finalGirl:'Kate'};
function fixture(fresh = true) {
  const log:PlayEvent[] = [newPlayEvent({kind:'start',saved:0,killed:0,round:1})];
  if (fresh) log.push(newPlayEvent({kind:'module',moduleData:{module:STATION_MODULE,changes:initialStation()}}));
  const entries = () => summarizePlay(log).entries;
  const fields = () => moduleState(entries(),STATION_MODULE);
  const draft = (command:StationCommand) => {
    const action:StationAction = {...command,parent:stationParent(entries())};
    const changes = resolveStationAction(action,fields(),entries());
    if (changes) return newPlayEvent({kind:'module',stationAction:action,moduleData:{module:STATION_MODULE,changes}});
  };
  const add = (command:StationCommand) => {
    const event = draft(command);
    if (!event) throw new Error('Unexpected invalid Station action '+command.kind);
    log.push(event);
    expect(validPlayLog(log)).toBe(true);
    return event;
  };
  return {log,add,draft,state:()=>stationState(fields())};
}
describe('Station 2891',()=>{
  it('reconciles the printed catalog, shelters and legacy setup alias',()=>{
    expect(Object.keys(STATION_SPACES)).toHaveLength(20);
    expect(STATION_SEARCH).toEqual(['supply','shed','hut']);
    expect(STATION_OUTDOORS).toEqual(['west','labApproach','eastCenter','east','helipad']);
    expect(STATION_SETUPS).toHaveLength(5);
    for (const setup of STATION_SETUPS) expect(Object.values(setup.victims).reduce((total,n)=>total+n,0)).toBe(12);
    expect(STATION_TERRORS).toHaveLength(8);
    expect(STATION_EVENTS).toHaveLength(10);
    expect(STATION_ITEMS.reduce((total,card)=>total+card.quantity,0)).toBe(18);
    expect(stationSetup('A New Stew')?.name).toBe('A Nice Stew');
    expect(stationSetup('R&R')?.name).toBe('R & R');
  });

  it('atomically saves a named passenger on delayed arrival and rejects stale actions',()=>{
    const game=fixture();
    game.add({kind:'role',id:'doctor',status:'present'});
    expect(game.draft({kind:'depart',count:0,roles:['doctor']})).toBeUndefined();
    game.add({kind:'depart',count:3,roles:['doctor']});
    expect(game.draft({kind:'role',id:'doctor',status:'killed'})).toBeUndefined();
    game.add({kind:'move',direction:'outbound',source:'Fly Faster!'});
    expect(game.draft({kind:'move',direction:'return',source:'Fly Faster!'})).toBeUndefined();
    expect(game.draft({kind:'help'})).toBeUndefined();
    game.add({kind:'move',direction:'outbound',source:'Terror card',arrival:'later'});
    expect(stationFacts(game.state())).toContain('rescue effects are still pending');
    expect(game.state().rescued).toBeUndefined();
    const sameTap=game.draft({kind:'confirm-rescue'})!;
    const rescue=game.add({kind:'confirm-rescue'});
    expect(validPlayLog([...game.log,sameTap])).toBe(false);
    expect(game.state()).toMatchObject({flight:{position:'airport',count:0},roles:{doctor:'saved'},rescued:3});
    expect(summarizePlay(game.log).saved).toBe(0);
    game.log.push(newPlayEvent({kind:'undo',target:rescue.id}));
    expect(game.state()).toMatchObject({flight:{pending:true},roles:{doctor:'present'}});
    game.log.push(newPlayEvent({kind:'restore',target:rescue.id}));
    expect(game.state().rescued).toBe(3);
    game.add({kind:'move',direction:'return',source:'Fly Faster!'});
    expect(validPlayLog([...game.log,newPlayEvent({kind:'undo',target:rescue.id})])).toBe(false);
    game.add({kind:'move',direction:'return',source:'Fly Faster!'});
    game.add({kind:'land'});
    game.add({kind:'depart',count:1,roles:[]});
    game.add({kind:'move',direction:'outbound',source:'Fly Faster!'});
    game.add({kind:'move',direction:'outbound',source:'Fly Faster!',arrival:'action'});
    expect(game.state().rescued).toBe(4);
  });

  it('keeps legacy unknowns, empty rescue effects, and corrections separate',()=>{
    const game=fixture(false);
    expect(game.state()).toEqual({});
    game.add({kind:'flight-correction',flight:{position:'air',count:null,pending:false,roles:[]}});
    expect(game.draft({kind:'help'})).toBeUndefined();
    game.add({kind:'move',direction:'outbound',source:'Terror card',arrival:'later'});
    game.add({kind:'confirm-rescue'});
    expect(game.state().rescued).toBeUndefined();
    expect(game.state().uncountedRescue).toBe(true);
    game.add({kind:'help'});
    game.add({kind:'depart',count:0,roles:[]});
    game.add({kind:'move',direction:'outbound',source:'Fly Faster!'});
    game.add({kind:'move',direction:'outbound',source:'Fly Faster!'});
    expect(game.state().flight?.pending).toBe(false);
    expect(game.draft({kind:'confirm-rescue'})).toBeUndefined();
  });

  it('expires the Generator once and freezes Station context for a versioned death',async()=>{
    const game=fixture();
    game.add({kind:'frost',target:'girl',status:'marked'});
    game.add({kind:'generator'});
    game.add({kind:'upkeep'});
    expect(game.draft({kind:'upkeep'})).toBeUndefined();
    expect(game.state().frost?.girl).toBe('marked');
    game.add({kind:'breach',status:'keys'});
    const historical = newPlayEvent({kind:'killed',quantity:1,cause:'hazard',mechanism:'Frostbite',stationReference:true});
    const old = newPlayEvent({kind:'killed',quantity:1});
    game.log.push(historical,old);
    const facts=deathFacts(selection,game.log,historical.id)!;
    expect(facts.moduleContext?.[STATION_MODULE]?.facts).toContain('made by the Skidozer');
    expect(deathFacts(selection,game.log,old.id)?.moduleContext?.[STATION_MODULE]).toBeUndefined();
    game.add({kind:'breach',status:'intact'});
    const json=JSON.parse(JSON.stringify(game.log));
    expect(await deathSignature(deathFacts(selection,json,historical.id)!)).toBe(await deathSignature(facts));
    expect(deathFacts({...selection,location:'Maple Lane'},json,historical.id)).toBeNull();
    expect(playStoryBeats(json,selection)).toContain('Final Girl had a recorded Frostbite token');
  });
});
