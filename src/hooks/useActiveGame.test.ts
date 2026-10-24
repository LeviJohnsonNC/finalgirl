import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useActiveGame } from './useActiveGame';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import type { ActiveGame } from '@/lib/activeGame';
import {moduleState} from '@/lib/play/modules';
import {frightState,frightTransition,parseFright} from '../../supabase/functions/_shared/play/fright';
const mock = vi.hoisted(() => ({ user: { id: 'A' } as { id: string } | null }));
vi.mock('./useAuth', () => ({ useAuth: () => ({ user: mock.user, isAuthReady: true }) }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => { localStorage.clear(); mock.user = { id: 'A' }; });
const game: ActiveGame = { version: 1, id: 'session-A', phase: 'nowPlaying', selection: {
  killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', setupScenario: null, startingEvent: null, mission: null, filmId: 's1-camp-happy-trails',
} };

describe('recoverable active game', () => {
  it('seeds only fresh Dr. Fright games; rejects stale, foreign and impossible Boiler Room writes',()=>{
    const {result}=renderHook(useActiveGame);
    const fresh={...game,frightSetupVersion:1 as const,selection:{...game.selection,killer:'Dr. Fright'},formDraft:{killerHealth:8}};
    act(()=>{result.current.save(fresh);result.current.appendPlayEvent(game.id,newPlayEvent({kind:'start',saved:0,killed:0,round:1}));});
    let raw=result.current.activeGame.playEvents;
    expect(frightState(summarizePlay(raw).entries)?.sleep).toBe('awake');
    expect(result.current.activeGame.formDraft.killerHealth).toBe(8);
    const digital=frightTransition(frightState(summarizePlay(raw).entries),{command:'digital'},raw,summarizePlay(raw).entries,()=> '0123');
    act(()=>{
      expect(result.current.appendPlayEvent(game.id,newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(digital)}}}))).toBe(true);
      expect(result.current.appendPlayEvent(game.id,newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(digital)}}}))).toBe(false);
    });
    raw=result.current.activeGame.playEvents;
    const current=frightState(summarizePlay(raw).entries);
    const skipped=parseFright(JSON.stringify({...current,eventId:undefined,parent:current.eventId,command:'slide',sleep:'asleep',path:'U',pending:false}));
    act(()=>expect(result.current.appendPlayEvent(game.id,newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(skipped)}}}))).toBe(false));
    act(()=>{result.current.save({...fresh,frightSetupVersion:undefined,playEvents:[]});result.current.appendPlayEvent(game.id,newPlayEvent({kind:'saved',quantity:1}));});
    expect(frightState(summarizePlay(result.current.activeGame.playEvents).entries)).toBeNull();
    act(()=>result.current.save(game));
    act(()=>expect(result.current.appendPlayEvent(game.id,newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(digital)}}}))).toBe(false));
  });
  it('seeds fresh Billy sources once with the first observation and never backfills older games', () => {
    const { result } = renderHook(useActiveGame);
    const fresh = {...game,billySetupVersion:1 as const,selection:{...game.selection,killer:'Billy the Bear',startingEvent:'Girlfriend'}};
    act(()=>{ result.current.save(fresh); });
    act(()=>{ result.current.appendPlayEvent(game.id,newPlayEvent({kind:'saved',quantity:1})); });
    const initial = result.current.activeGame.playEvents;
    expect(initial.filter(e=>e.moduleData?.changes.powerSourcesReady)).toHaveLength(1);
    expect(initial.find(e=>e.moduleData?.changes.powerSourcesReady).moduleData.changes).toMatchObject({'source.1.status':'active','source.5.status':'set-aside'});
    act(()=>{ result.current.appendPlayEvent(game.id,newPlayEvent({kind:'module',moduleData:{module:'billy',changes:{'source.1.status':'inactive'}}})); });
    expect(result.current.activeGame.playEvents.filter(e=>e.moduleData?.changes.powerSourcesReady)).toHaveLength(1);
    act(()=>{ result.current.save({...fresh,billySetupVersion:undefined,playEvents:[]}); });
    act(()=>{ result.current.appendPlayEvent(game.id,newPlayEvent({kind:'saved',quantity:1})); });
    expect(result.current.activeGame.playEvents.some(e=>e.moduleData?.module === 'billy')).toBe(false);
  });
  it('keeps one permanent reveal when separate entry points race and allows details corrections', () => {
    const {result} = renderHook(useActiveGame);
    act(()=>{result.current.save(game);});
    const reveal = newPlayEvent({kind:'moment',momentType:'dark-power',text:'Dark Power',permanent:true,killerCard:'Feed'});
    act(()=>{
      expect(result.current.appendPlayEvent(game.id,reveal)).toBe(true);
      expect(result.current.appendPlayEvent(game.id,newPlayEvent({kind:'moment',momentType:'dark-power',text:'Dark Power',permanent:true,killerCard:'Dark Obsession'}))).toBe(false);
      expect(result.current.appendPlayEvent(game.id,newPlayEvent({kind:'details',target:reveal.id,killerCard:'Dark Obsession'}))).toBe(true);
    });
    const entries = summarizePlay(result.current.activeGame.playEvents).entries.filter(e=>e.momentType === 'dark-power');
    expect(entries).toHaveLength(1);
    expect(entries[0].killerCard).toBe('Dark Obsession');
  });
  it('atomically appends rapid taps, ignores duplicate IDs and keeps unknown fields recoverable', () => {
    const { result } = renderHook(useActiveGame);
    act(() => { result.current.save(game); });
    const start = newPlayEvent({kind:'start',saved:0,killed:0,round:1});
    act(() => {
      result.current.appendPlayEvent(game.id,start);
      for (let n=0;n<10;n++) result.current.appendPlayEvent(game.id,newPlayEvent({kind:'saved',quantity:1}));
      expect(result.current.appendPlayEvent(game.id,start)).toBe(false);
      result.current.updateFormDraft(game.id,{buddiesInPlay:null});
    });
    expect(summarizePlay(result.current.activeGame.playEvents).saved).toBe(10);
    expect(result.current.activeGame.formDraft.buddiesInPlay).toBeNull();
  });

  it('restores completed story and all edited fields after unmount', () => {
    const first = renderHook(useActiveGame);
    act(() => { first.result.current.save(game); });
    act(() => { first.result.current.checkpoint(game.id, { introStory: 'The cold open' }); });
    act(() => { first.result.current.updateFormDraft(game.id, { weaponUsed: 'Axe', foundCarolyn: true, victimsSaved: 0 }); });
    first.unmount();
    const second = renderHook(useActiveGame);
    expect(second.result.current.activeGame.introStory).toBe('The cold open');
    expect(second.result.current.activeGame.formDraft).toEqual({ weaponUsed: 'Axe', foundCarolyn: true, victimsSaved: 0 });
  });
  it('keeps different accounts and guests isolated', () => {
    const { result, rerender } = renderHook(useActiveGame);
    act(() => { result.current.save(game); });
    mock.user = { id: 'B' }; rerender(); expect(result.current.activeGame).toBeNull();
    mock.user = null; rerender(); expect(result.current.activeGame).toBeNull();
    mock.user = { id: 'A' }; rerender(); expect(result.current.activeGame.id).toBe(game.id);
  });
  it('ignores a late completion from a discarded or replaced session', () => {
    const { result } = renderHook(useActiveGame);
    act(() => { result.current.save(game); });
    act(() => { result.current.save({ ...game, id: 'new-session' }); });
    act(() => { result.current.checkpoint(game.id, { posterImageUrl: 'https://example.test/old.png' }); });
    expect(result.current.activeGame.id).toBe('new-session');
    expect(result.current.activeGame.posterImageUrl).toBeUndefined();
  });
  it('preserves the saved draft if storage refuses a checkpoint', () => {
    const { result } = renderHook(useActiveGame);
    act(() => { result.current.save(game); });
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    act(() => { expect(result.current.checkpoint(game.id, { introStory: 'Unsaved' })).toBe(false); });
    expect(result.current.activeGame.introStory).toBeUndefined();
    spy.mockRestore();
  });
  it('does not try to render a malformed stored session', () => {
    localStorage.setItem('final-girl-active-game-v1:A', JSON.stringify({ version: 1, phase: 'ending' }));
    expect(renderHook(useActiveGame).result.current.activeGame).toBeNull();
  });
});

it('initializes once for early rapid taps and merges independent durable drafts', () => {
  const {result} = renderHook(useActiveGame);
  act(()=> { result.current.save(game); });
  act(()=> {
    result.current.appendPlayEvent(game.id,newPlayEvent({kind:'saved',quantity:1}));
    result.current.appendPlayEvent(game.id,newPlayEvent({kind:'start',saved:0,killed:0,round:1}));
    result.current.checkpoint(game.id,{playDrafts:{one:{detail:'Axe'}}});
    result.current.checkpoint(game.id,{playDrafts:{two:{room:'Kitchen'}}});
    expect(summarizePlay(result.current.getCurrentGame()!.playEvents).saved).toBe(1);
  });
  expect(result.current.activeGame!.playEvents!.filter(e=>e.kind==='start')).toHaveLength(1);
  expect(result.current.activeGame!.playDrafts).toEqual({one:{detail:'Axe'},two:{room:'Kitchen'}});
});

it('saves starting-event setup atomically and never reapplies it after player edits or reload', () => {
  const first = renderHook(useActiveGame);
  act(() => { first.result.current.save({ ...game, selection: { ...game.selection, startingEvent: 'Girlfriend' } }); });
  act(() => {
    expect(first.result.current.appendPlayEvent(game.id, newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 }))).toBe(true);
  });
  const setup = first.result.current.activeGame!.playEvents!.find(e => e.moduleData?.changes['victim.girlfriend']);
  expect(setup?.moduleData?.changes['victim.girlfriend']).toBe('in-play');
  act(() => { first.result.current.appendPlayEvent(game.id, newPlayEvent({ kind: 'undo', target: setup!.id })); });
  first.unmount();
  const second = renderHook(useActiveGame);
  act(() => {
    expect(second.result.current.appendPlayEvent(game.id, newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 }))).toBe(false);
    second.result.current.appendPlayEvent(game.id, newPlayEvent({ kind: 'round' }));
  });
  expect(second.result.current.activeGame!.playEvents!.filter(e => e.moduleData?.changes['victim.girlfriend'])).toHaveLength(1);
  expect(summarizePlay(second.result.current.activeGame!.playEvents).inactive.has(setup!.id)).toBe(true);
});

it('puts setup before an early player observation and never backfills an existing game', () => {
  const { result } = renderHook(useActiveGame);
  const selected = { ...game, selection: { ...game.selection, startingEvent: 'Girlfriend' } };
  act(() => { result.current.save(selected); });
  act(() => { result.current.appendPlayEvent(game.id, newPlayEvent({ kind: 'module', moduleData: { module: 'camp', changes: { 'victim.girlfriend': 'killed' } } })); });
  const observations = result.current.activeGame!.playEvents!.filter(e => e.kind === 'module');
  expect(observations.map(e => e.moduleData!.changes['victim.girlfriend'])).toEqual(['in-play', 'killed']);
  act(() => { result.current.save({ ...selected, playEvents: [newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 3 })] }); });
  act(() => { result.current.appendPlayEvent(game.id, newPlayEvent({ kind: 'round' })); });
  expect(result.current.activeGame!.playEvents!.some(e => e.kind === 'module')).toBe(false);
});

it('does not partly apply starting-event setup when durable storage fails', () => {
  const { result } = renderHook(useActiveGame);
  act(() => { result.current.save({ ...game, selection: { ...game.selection, startingEvent: 'Girlfriend' } }); });
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  act(() => { expect(result.current.appendPlayEvent(game.id, newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 }))).toBe(false); });
  expect(result.current.activeGame!.playEvents).toBeUndefined();
  spy.mockRestore();
});

it('initializes Gepetto once and preserves unknown legacy trays and explicit first-tap corrections', () => {
  const selected={...game,geppettoSetupVersion:1 as const,selection:{...game.selection,killer:'Geppetto',startingEvent:'Girlfriend'}};
  const first=renderHook(useActiveGame);
  act(()=>{first.result.current.save(selected);});
  act(()=>{expect(first.result.current.appendPlayEvent(game.id,newPlayEvent({kind:'module',moduleData:{module:'geppetto',changes:{'puppet.1.status':'on-board'}}}))).toBe(true);});
  const log=first.result.current.activeGame!.playEvents!;
  expect(log.filter(e=>e.moduleData?.module==='geppetto')).toHaveLength(2);
  expect(log.find(e=>e.moduleData?.module==='camp')?.moduleData?.changes['victim.girlfriend']).toBe('in-play');
  first.unmount();
  const second=renderHook(useActiveGame);
  act(()=>{second.result.current.appendPlayEvent(game.id,newPlayEvent({kind:'round'}));});
  expect(second.result.current.activeGame!.playEvents!.filter(e=>e.moduleData?.module==='geppetto')).toHaveLength(2);
  act(()=>{second.result.current.save({...selected,playEvents:[newPlayEvent({kind:'start',round:5,saved:2,killed:1})]});});
  act(()=>{second.result.current.appendPlayEvent(game.id,newPlayEvent({kind:'round'}));});
  expect(second.result.current.activeGame!.playEvents!.some(e=>e.moduleData?.module==='geppetto')).toBe(false);
});


it('leaves an older untracked Gepetto session’s tray unknown even when its first play log is empty',()=>{
 const {result}=renderHook(useActiveGame);
 act(()=>{result.current.save({...game,selection:{...game.selection,killer:'Geppetto'}});});
 act(()=>{result.current.appendPlayEvent(game.id,newPlayEvent({kind:'start',round:1,saved:0,killed:0}));});
 expect(result.current.activeGame!.playEvents!.some(e=>e.moduleData?.module==='geppetto')).toBe(false);
});


it('seeds Carnival and its starting Event with the first tap once, independently of the killer',()=>{
 const {result}=renderHook(useActiveGame);
 act(()=>{result.current.save({...game,carnivalSetupVersion:1,selection:{...game.selection,killer:'Hans',location:'Carnival of Blood',startingEvent:'So Much Junk'}});});
 act(()=>{expect(result.current.appendPlayEvent(game.id,newPlayEvent({kind:'module',moduleData:{module:'carnival',changes:{zappo:'lost',searchPenalty:true}}}))).toBe(true);});
 const log=result.current.activeGame!.playEvents!;
 expect(log.filter(e=>e.moduleData?.module==='carnival')).toHaveLength(2);
 expect(log.find(e=>e.moduleData?.changes['event.junk'])?.moduleData?.changes).toMatchObject({zappo:'with-you','event.junk':'active','trap.acid.status':'not-placed'});
 act(()=>{result.current.appendPlayEvent(game.id,newPlayEvent({kind:'round'}));});
 expect(result.current.activeGame!.playEvents!.filter(e=>e.moduleData?.module==='carnival')).toHaveLength(2);
});

it('never backfills Carnival for an older empty log, even with a selected starting Event',()=>{
 const {result}=renderHook(useActiveGame);
 act(()=>{result.current.save({...game,selection:{...game.selection,location:'Carnival of Blood',startingEvent:'Full Moon'}});});
 act(()=>{result.current.appendPlayEvent(game.id,newPlayEvent({kind:'start',round:1,saved:0,killed:0}));});
 expect(result.current.activeGame!.playEvents!.some(e=>e.moduleData?.module==='carnival')).toBe(false);
});


describe('Maple Lane durable setup and linked writes',()=>{
  const maple={...game,mapleSetupVersion:1 as const,selection:{...game.selection,location:'Maple Lane',startingEvent:'The Smalleys'}};
  const change=(changes:Record<string,string|number|boolean|null>)=>newPlayEvent({kind:'module',moduleData:{module:'maple',changes}});
  it('persists fresh setup and the first tap once; rapid independent departures end the Event atomically',()=>{
    const {result}=renderHook(useActiveGame);
    act(()=>{result.current.save(maple);});
    act(()=>{
      expect(result.current.appendPlayEvent(game.id,change({'person.smalley-1':'saved','event.smalleys':'active'}))).toBe(true);
      expect(result.current.appendPlayEvent(game.id,change({'person.smalley-2':'killed','event.smalleys':'active'}))).toBe(true);
    });
    const log=result.current.activeGame!.playEvents!;
    expect(log.filter(e=>e.moduleData?.changes['house.nw-west']===false)).toHaveLength(1);
    expect(moduleState(summarizePlay(log).entries,'maple')).toMatchObject({'person.smalley-1':'saved','person.smalley-2':'killed','event.smalleys':'ended'});
    expect(summarizePlay(log)).toMatchObject({saved:0,killed:0});
  });
  it('does not backfill a resumed game and refuses another Location’s observation',()=>{
    const {result}=renderHook(useActiveGame);
    act(()=>{result.current.save({...maple,mapleSetupVersion:undefined});result.current.appendPlayEvent(game.id,newPlayEvent({kind:'start',saved:0,killed:0,round:1}));});
    expect(moduleState(summarizePlay(result.current.activeGame!.playEvents!).entries,'maple')).toEqual({});
    act(()=>{result.current.save(game);});
    act(()=>{expect(result.current.appendPlayEvent(game.id,change({'house.nw-west':true}))).toBe(false);});
  });
  it('keeps a failed first write retryable with no half-initialized gameplay',()=>{
    const {result}=renderHook(useActiveGame);act(()=>{result.current.save(maple);});
    const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});
    act(()=>{expect(result.current.appendPlayEvent(game.id,change({'house.nw-west':true}))).toBe(false);});
    expect(result.current.activeGame!.playEvents).toBeUndefined();spy.mockRestore();
    act(()=>{expect(result.current.appendPlayEvent(game.id,change({'house.nw-west':true}))).toBe(true);});
    expect(moduleState(summarizePlay(result.current.activeGame!.playEvents!).entries,'maple')['house.nw-west']).toBe(true);
  });
});
