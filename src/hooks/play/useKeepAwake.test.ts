import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useKeepAwake } from './useKeepAwake';
afterEach(() => vi.unstubAllGlobals());
describe('screen wake lock', () => {
  it('releases a late permission result after the player leaves Play mode', async () => {
    let resolve!: (lock: WakeLockSentinel) => void;
    const request = vi.fn(
      () =>
        new Promise<WakeLockSentinel>((r) => {
          resolve = r;
        }),
    );
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request },
    });
    const release = vi.fn().mockResolvedValue(undefined);
    const hook = renderHook(() => useKeepAwake());
    act(() => hook.result.current.toggle());
    await waitFor(() => expect(request).toHaveBeenCalledOnce());
    hook.unmount();
    await act(async () =>
      resolve({
        release,
        released: false,
        addEventListener: vi.fn(),
      } as unknown as WakeLockSentinel),
    );
    expect(release).toHaveBeenCalledOnce();
    delete (navigator as unknown as Record<string, unknown>).wakeLock;
  });
});
