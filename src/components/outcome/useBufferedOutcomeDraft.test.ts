import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBufferedOutcomeDraft } from './useBufferedOutcomeDraft';

afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('outcome text autosave', () => {
  it('merges rapid edits across fields into one write after a pause', () => {
    vi.useFakeTimers();
    const save = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() => useBufferedOutcomeDraft(save));
    act(() => {
      result.current.queue({ weaponUsed: 'Ax' });
      result.current.queue({ weaponUsed: 'Axe' });
      result.current.queue({ gameHighlights: 'The lights failed.' });
    });
    expect(save).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(600); });
    expect(save).toHaveBeenCalledExactlyOnceWith({ weaponUsed: 'Axe', gameHighlights: 'The lights failed.' });
  });
  it('flushes the last edit before continuing and cancels the timer', () => {
    vi.useFakeTimers();
    const save = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() => useBufferedOutcomeDraft(save));
    act(() => { result.current.queue({ gameHighlights: 'Last character!' }); });
    act(() => { expect(result.current.flush()).toBe(true); });
    act(() => { vi.runAllTimers(); });
    expect(save).toHaveBeenCalledExactlyOnceWith({ gameHighlights: 'Last character!' });
  });
  it('keeps rejected edits, reports failure and retries the newest text', () => {
    vi.useFakeTimers();
    const save = vi.fn().mockReturnValue(false);
    const { result } = renderHook(() => useBufferedOutcomeDraft(save));
    act(() => { result.current.queue({ weaponUsed: 'Axe' }); vi.advanceTimersByTime(600); });
    expect(result.current.saveFailed).toBe(true);
    act(() => { result.current.queue({ weaponUsed: 'Fire axe' }); });
    save.mockReturnValue(true);
    act(() => { expect(result.current.flush()).toBe(true); });
    expect(save).toHaveBeenLastCalledWith({ weaponUsed: 'Fire axe' });
    expect(result.current.saveFailed).toBe(false);
  });
  it('flushes on tab hiding, immediate reload, and unmount without a late write into a new session', () => {
    vi.useFakeTimers();
    const first = vi.fn().mockReturnValue(true), second = vi.fn().mockReturnValue(true);
    const view = renderHook(() => useBufferedOutcomeDraft(first));
    act(() => { view.result.current.queue({ gameHighlights: 'Hidden' }); window.dispatchEvent(new Event('pagehide')); });
    expect(first).toHaveBeenLastCalledWith({ gameHighlights: 'Hidden' });
    act(() => { view.result.current.queue({ gameHighlights: 'Reload' }); window.dispatchEvent(new Event('beforeunload')); });
    expect(first).toHaveBeenLastCalledWith({ gameHighlights: 'Reload' });
    act(() => { view.result.current.queue({ gameHighlights: 'Navigate' }); });
    view.unmount();
    renderHook(() => useBufferedOutcomeDraft(second));
    act(() => { vi.runAllTimers(); });
    expect(first).toHaveBeenLastCalledWith({ gameHighlights: 'Navigate' });
    expect(second).not.toHaveBeenCalled();
  });
});
