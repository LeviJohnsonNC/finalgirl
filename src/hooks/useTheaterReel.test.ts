import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameResult } from './useGameHistory';
import { useTheaterReel } from './useTheaterReel';

const games: GameResult[] = ['a', 'b', 'c'].map((id, i) => ({ id, timestamp: 3 - i, outcome: 'won', finalGirl: 'Laurie', killer: 'Hans', location: 'Camp Happy Trails', sceneImageUrl: `https://test.invalid/${id}.png` }));
class TestImage {
  static instances: TestImage[] = [];
  src = '';
  naturalWidth = 1600;
  naturalHeight = 900;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() { TestImage.instances.push(this); }
}
const lastImage = (id: string) => TestImage.instances.filter(image => image.src === `https://test.invalid/${id}.png`).slice(-1)[0]!;
const loaded = (id: string) => act(() => lastImage(id).onload?.());

beforeEach(() => { vi.spyOn(Math, 'random').mockReturnValue(0); vi.useFakeTimers(); TestImage.instances = []; vi.stubGlobal('Image', TestImage); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('projection lifecycle', () => {
  it('starts from session-random history rather than the newest and preserves its order on refresh', () => {
    vi.mocked(Math.random).mockReturnValueOnce(.9).mockReturnValueOnce(.1).mockReturnValueOnce(.5);
    const { result, rerender } = renderHook(({ rows }) => useTheaterReel(rows, false), { initialProps: { rows: games } });
    loaded('b');
    expect(result.current.current?.id).toBe('b');
    rerender({ rows: games.map(game => ({ ...game })) });
    expect(result.current.current?.id).toBe('b');
    act(() => vi.advanceTimersByTime(16000));
    loaded('c');
    expect(result.current.current?.id).toBe('c');
  });
  it('rejects a portrait stored as a scene and continues without loading posters', () => {
    const { result } = renderHook(() => useTheaterReel([{ ...games[0], posterImageUrl: 'https://test.invalid/poster.png' }, games[1]], false));
    lastImage('a').naturalWidth = 1000;
    lastImage('a').naturalHeight = 1500;
    loaded('a');
    expect(result.current.current).toBeUndefined();
    loaded('b');
    expect(result.current.current?.id).toBe('b');
    expect(TestImage.instances.some(image => image.src.includes('poster.png'))).toBe(false);
  });
  it('retains legacy square opening stills', () => {
    const { result } = renderHook(() => useTheaterReel(games, false));
    lastImage('a').naturalWidth = lastImage('a').naturalHeight = 1024;
    loaded('a');
    expect(result.current.current?.id).toBe('a');
  });
  it('holds the visible picture until the automatic next scene loads', () => {
    const { result } = renderHook(() => useTheaterReel(games, false));
    loaded('a');
    act(() => vi.advanceTimersByTime(16000));
    expect(result.current.current?.id).toBe('a');
    expect(result.current.pending).toBe(true);
    loaded('b');
    expect(result.current.current?.id).toBe('b');
    expect(result.current.previous?.id).toBe('a');
    expect(result.current.playing).toBe(true);
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.previous).toBeUndefined();
  });
  it('does not restart the automatic timer on unrelated history updates', () => {
    const { result, rerender } = renderHook(({ rows }) => useTheaterReel(rows, false), { initialProps: { rows: games } });
    loaded('a');
    act(() => vi.advanceTimersByTime(8000));
    rerender({ rows: games.map(g => ({ ...g })) });
    act(() => vi.advanceTimersByTime(8000));
    expect(result.current.pending).toBe(true);
    loaded('b');
    expect(result.current.current?.id).toBe('b');
  });
  it('ignores late image completions after its case is removed', () => {
    const { result, rerender } = renderHook(({ rows }) => useTheaterReel(rows, false), { initialProps: { rows: games } });
    const lateLoad = lastImage('a').onload!;
    rerender({ rows: games.slice(1) });
    loaded('b');
    act(() => lateLoad());
    expect(result.current.current?.id).toBe('b');
  });
  it('keeps the selected case when a newer history record arrives', () => {
    const { result, rerender } = renderHook(({ rows }) => useTheaterReel(rows, false), { initialProps: { rows: games } });
    loaded('a');
    rerender({ rows: [{ ...games[0], id: 'new', timestamp: 100, sceneImageUrl: 'https://test.invalid/new.png' }, ...games] });
    expect(result.current.current?.id).toBe('a');
    expect(result.current.pending).toBe(false);
  });
  it('falls through failures and timeouts, and lets the user retry', () => {
    const { result } = renderHook(() => useTheaterReel(games.slice(0, 2), false));
    act(() => lastImage('a').onerror?.());
    loaded('b');
    expect(result.current.current?.id).toBe('b');
    act(() => result.current.fail(games[1].sceneImageUrl!));
    expect(result.current.current).toBeUndefined();
    act(() => result.current.retryImages());
    act(() => vi.advanceTimersByTime(12000));
    expect(result.current.failedCount).toBe(1);
    loaded('b');
    expect(result.current.current?.id).toBe('b');
  });
  it('stops rotation during interaction and while the tab is hidden', () => {
    const { result, rerender } = renderHook(({ interacting }) => useTheaterReel(games, interacting), { initialProps: { interacting: true } });
    loaded('a');
    act(() => vi.advanceTimersByTime(20000));
    expect(result.current.pending).toBe(false);
    rerender({ interacting: false });
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => vi.advanceTimersByTime(20000));
    expect(result.current.current?.id).toBe('a');
    expect(result.current.playing).toBe(false);
  });
  it('respects reduced motion without advancing the scene', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList);
    const { result } = renderHook(() => useTheaterReel(games, false));
    loaded('a');
    act(() => vi.advanceTimersByTime(20000));
    expect(result.current.pending).toBe(false);
    expect(result.current.current?.id).toBe('a');
    expect(result.current.playing).toBe(false);
  });
  it('removes deleted pictures immediately and cancels callbacks on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ rows }) => useTheaterReel(rows, false), { initialProps: { rows: games } });
    loaded('a');
    rerender({ rows: games.slice(1) });
    expect(result.current.current).toBeUndefined();
    const late = lastImage('b').onload!;
    unmount();
    expect(() => act(() => late())).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });
});

