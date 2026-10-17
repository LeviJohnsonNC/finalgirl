import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useGameHistory } from './useGameHistory';
import { useOwnedFilms } from './useOwnedFilms';

const mock = vi.hoisted(() => ({
  auth: { user: { id: 'A' } as { id: string } | null, isAuthReady: true, isLoading: false, authError: null },
  history: new Map<string, Record<string, unknown>>(), films: ['cloud-film'],
  failSave: false, failRead: false, writes: [] as Array<Record<string, unknown>>,
  summary: null as null | (() => Promise<unknown>),
}));
vi.mock('./useAuth', () => ({ useAuth: () => mock.auth }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  rpc: (name: string, args: { p_add: string[]; p_remove: string[] }) => ({ abortSignal: () => {
    if (name === 'apply_collection_delta') {
      if (mock.failRead || mock.failSave) return Promise.resolve({ data: null, error: { message: 'offline' } });
      mock.films = [...new Set([...mock.films.filter(id => !args.p_remove.includes(id)), ...args.p_add])];
      mock.writes.push({ owned_films: mock.films });
      return Promise.resolve({ data: mock.films, error: null });
    }
    return mock.summary ? mock.summary() : Promise.resolve({
    data: [...mock.history.values()], error: mock.failRead ? { message: 'offline' } : null,
  }); } }),
  from: (table: string) => {
    let mode = 'select'; let payload: Record<string, unknown>; let id: string;
    const execute = () => {
      if (mode === 'select') return { data: table === 'user_settings' ? { owned_films: mock.films } : mock.history.get(id), error: mock.failRead ? { message: 'offline' } : null };
      if (mock.failSave) return { data: null, error: { message: 'offline' } };
      mock.writes.push(payload);
      if (table === 'user_settings') mock.films = payload.owned_films as string[];
      else if (mode === 'upsert' && !mock.history.has(payload.id as string)) mock.history.set(payload.id as string, payload);
      else if (mode === 'update' && mock.history.has(id)) mock.history.set(id, { ...mock.history.get(id), ...payload });
      else if (mode === 'delete') mock.history.delete(id);
      return { data: mode === 'update' && !mock.history.has(id) ? null : { id }, error: null };
    };
    const builder = {
      select: () => builder, eq: (key: string, value: string) => { if (key === 'id') id = value; return builder; },
      maybeSingle: () => builder,
      upsert: (value: Record<string, unknown>) => { mode = 'upsert'; payload = value; return builder; },
      update: (value: Record<string, unknown>) => { mode = 'update'; payload = value; return builder; },
      delete: () => { mode = 'delete'; return builder; },
      abortSignal: () => builder,
      then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => Promise.resolve(execute()).then(resolve, reject),
    };
    return builder;
  },
  storage: { from: () => ({ remove: async () => ({ error: null }) }) },
} }));

beforeEach(() => {
  localStorage.clear(); mock.auth.user = { id: 'A' }; mock.failSave = false; mock.failRead = false;
  mock.summary = null; mock.history.clear(); mock.films = ['cloud-film']; mock.writes = [];
});
afterEach(cleanup);
const sample = { outcome: 'won' as const, killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie' };

describe('cloud history write-ahead log', () => {
  it('preserves recorded zero health and victim counts from the cloud', async () => {
    mock.history.set('zero', { id: 'zero', timestamp: 1, outcome: 'lost', killer: 'Hans', location: 'Camp Happy Trails', final_girl: 'Laurie', final_girl_health: 0, killer_health: 0, victims_saved: 0, victims_killed: 0 });
    const { result } = renderHook(useGameHistory);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.gameHistory[0]).toMatchObject({ finalGirlHealth: 0, killerHealth: 0, victimsSaved: 0, victimsKilled: 0 });
  });
  it('keeps failed inserts across unmount and replays them with the same id', async () => {
    mock.failSave = true;
    const first = renderHook(useGameHistory);
    await waitFor(() => expect(first.result.current.isLoading).toBe(false));
    let id: string;
    act(() => { id = first.result.current.recordGame(sample).id; });
    await waitFor(() => expect(first.result.current.saveError).toBeTruthy());
    expect(first.result.current.gameHistory[0].id).toBe(id!);
    first.unmount();
    mock.failSave = false;
    const second = renderHook(useGameHistory);
    await waitFor(() => expect(second.result.current.pendingSaveCount).toBe(0));
    expect(mock.history.has(id!)).toBe(true);
    expect(mock.history.size).toBe(1);
    await waitFor(() => expect(second.result.current.gameHistory.some(game => game.id === id!)).toBe(true));
  });

  it('sends the ending after its initial record and preserves it on retry', async () => {
    mock.failSave = true;
    const { result } = renderHook(useGameHistory);
    let id: string;
    act(() => {
      id = result.current.recordGame(sample).id;
      result.current.updateGame(id, { endingNarration: 'The end', victimsSaved: 2 });
    });
    await waitFor(() => expect(result.current.saveError).toBeTruthy());
    expect(result.current.gameHistory[0].endingNarration).toBe('The end');
    mock.failSave = false;
    await act(async () => { expect(await result.current.retryPendingSaves()).toBe(true); });
    expect(mock.history.get(id!).ending_narration).toBe('The end');
  });

  it('ignores the old shared cache and another account cache during failure', async () => {
    mock.auth.user = { id: 'B' }; mock.failRead = true;
    const game = { ...sample, id: 'private-A', timestamp: 1 };
    localStorage.setItem('final-girl-cloud-game-history-cache-v2', JSON.stringify([game]));
    localStorage.setItem('final-girl-history-v3:A', JSON.stringify([game]));
    const { result } = renderHook(useGameHistory);
    await waitFor(() => expect(result.current.loadError).toBeTruthy());
    expect(result.current.gameHistory).toEqual([]);
  });

  it('does not apply an old account fetch after switching accounts', async () => {
    let finish: (value: unknown) => void;
    mock.summary = () => new Promise(resolve => { finish = resolve; });
    const { result, rerender } = renderHook(useGameHistory);
    mock.auth.user = { id: 'B' }; mock.summary = null; rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => { finish!({ data: [{ id: 'A-private', timestamp: 1 }], error: null }); });
    expect(result.current.gameHistory).toEqual([]);
  });

  it('leaves the editor recoverable when durable storage rejects a write', () => {
    const { result } = renderHook(useGameHistory);
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => result.current.recordGame(sample)).toThrow('could not save');
    expect(result.current.gameHistory).toEqual([]);
    spy.mockRestore();
  });
});

describe('collection migration', () => {
  it('merges guest films with the loaded cloud collection', async () => {
    localStorage.setItem('final-girl-owned-films', JSON.stringify(['guest-film']));
    const { result } = renderHook(useOwnedFilms);
    await waitFor(() => expect(mock.films).toEqual(['cloud-film', 'guest-film']));
    await waitFor(() => expect(result.current.pendingSaveCount).toBe(0));
    expect(JSON.parse(localStorage.getItem('final-girl-owned-films')!)).toEqual([]);
  });

  it('does not migrate or overwrite anything when the cloud read fails', async () => {
    mock.failRead = true;
    localStorage.setItem('final-girl-owned-films', JSON.stringify(['guest-film']));
    const { result } = renderHook(useOwnedFilms);
    await waitFor(() => expect(result.current.loadError).toBeTruthy());
    expect(mock.writes).toEqual([]);
    expect(mock.films).toEqual(['cloud-film']);
    expect(JSON.parse(localStorage.getItem('final-girl-owned-films')!)).toEqual(['guest-film']);
  });

  it('serializes rapid edits and retains them after failed sends', async () => {
    const { result } = renderHook(useOwnedFilms);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mock.failSave = true;
    act(() => {
      result.current.setOwnedFilms(previous => [...previous, 'one']);
      result.current.setOwnedFilms(previous => [...previous, 'two']);
    });
    await waitFor(() => expect(result.current.saveError).toBeTruthy());
    expect(result.current.ownedFilms).toEqual(['cloud-film', 'one', 'two']);
    mock.failSave = false;
    await act(async () => { await result.current.retryPendingSaves(); });
    expect(mock.films).toEqual(['cloud-film', 'one', 'two']);
  });
});
