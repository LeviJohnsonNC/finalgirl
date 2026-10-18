import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useActiveGame } from './useActiveGame';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import type { ActiveGame } from '@/lib/activeGame';
const mock = vi.hoisted(() => ({ user: { id: 'A' } as { id: string } | null }));
vi.mock('./useAuth', () => ({ useAuth: () => ({ user: mock.user, isAuthReady: true }) }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => { localStorage.clear(); mock.user = { id: 'A' }; });
const game: ActiveGame = { version: 1, id: 'session-A', phase: 'nowPlaying', selection: {
  killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', setupScenario: null, startingEvent: null, mission: null, filmId: 's1-camp-happy-trails',
} };

describe('recoverable active game', () => {
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
