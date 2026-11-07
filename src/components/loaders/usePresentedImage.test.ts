import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePresentedImage } from './usePresentedImage';

class PendingImage {
  static instances: PendingImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  naturalWidth = 1600;
  naturalHeight = 900;
  decode = vi.fn(async () => {});
  constructor() { PendingImage.instances.push(this); }
}
beforeEach(() => { PendingImage.instances = []; vi.stubGlobal('Image', PendingImage); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const finish = async (img: PendingImage) => act(async () => { img.onload?.(); await Promise.resolve(); });

describe('image presentation lifecycle', () => {
  it('opens saved pictures directly without replaying development', () => {
    const { result } = renderHook(() => usePresentedImage('saved', false));
    expect(result.current.shown.url).toBe('saved');
    expect(result.current.revealing).toBe(false);
    expect(PendingImage.instances).toHaveLength(0);
  });
  it('keeps the prior picture until the replacement has decoded, then reveals once', async () => {
    const { result, rerender } = renderHook(({ url, busy }) => usePresentedImage(url, busy), { initialProps: { url: 'old', busy: false } });
    rerender({ url: 'old', busy: true });
    rerender({ url: 'new', busy: false });
    expect(result.current.shown.url).toBe('old');
    expect(result.current.loading).toBe(true);
    let decoded!: () => void;
    const img = PendingImage.instances[PendingImage.instances.length - 1]!;
    img.decode.mockImplementation(() => new Promise<void>(r => { decoded = r; }));
    await finish(img);
    expect(result.current.shown.url).toBe('old');
    await act(async () => { decoded(); await Promise.resolve(); });
    expect(result.current.shown.url).toBe('new');
    expect(result.current.revealing).toBe(true);
    act(() => vi.advanceTimersByTime(600));
    expect(result.current.revealing).toBe(false);
  });
  it('ignores stale decoding after a newer request starts', async () => {
    const { result, rerender } = renderHook(({ url, busy }) => usePresentedImage(url, busy), { initialProps: { url: '', busy: true } });
    rerender({ url: 'first', busy: false });
    const first = PendingImage.instances[PendingImage.instances.length - 1]!;
    let resolve!: () => void;
    first.decode.mockImplementation(() => new Promise<void>(r => { resolve = r; }));
    await finish(first);
    rerender({ url: 'first', busy: true });
    rerender({ url: 'second', busy: false });
    await act(async () => { resolve(); await Promise.resolve(); });
    expect(result.current.shown.url).toBe('');
    await finish(PendingImage.instances[PendingImage.instances.length - 1]!);
    expect(result.current.shown.url).toBe('second');
  });
  it('retains the old display on failure and retries only the existing URL', async () => {
    const { result, rerender } = renderHook(({ url, busy }) => usePresentedImage(url, busy), { initialProps: { url: 'old', busy: false } });
    rerender({ url: 'old', busy: true }); rerender({ url: 'new', busy: false });
    act(() => PendingImage.instances[PendingImage.instances.length - 1]!.onerror?.());
    expect(result.current.failed).toBe(true);
    expect(result.current.shown.url).toBe('old');
    expect(result.current.loading).toBe(false);
    act(() => result.current.retryLoad());
    expect(PendingImage.instances[PendingImage.instances.length - 1]!.src).toBe('new');
    await finish(PendingImage.instances[PendingImage.instances.length - 1]!);
    expect(result.current.failed).toBe(false);
    expect(result.current.shown.url).toBe('new');
  });
  it('bounds a stalled download and detaches handlers on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ url, busy }) => usePresentedImage(url, busy), { initialProps: { url: '', busy: true } });
    rerender({ url: 'slow', busy: false });
    const img = PendingImage.instances[PendingImage.instances.length - 1]!;
    act(() => vi.advanceTimersByTime(25000));
    expect(result.current.failed).toBe(true);
    unmount(); expect(img.onload).toBeNull(); expect(img.onerror).toBeNull();
  });
});
