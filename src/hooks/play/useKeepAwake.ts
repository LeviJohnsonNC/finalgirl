import { useEffect, useState } from 'react';
export function useKeepAwake() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  useEffect(() => {
    if (!enabled || !supported) return;
    let alive = true;
    let lock: WakeLockSentinel | undefined;
    let requesting = false;
    const acquire = async () => {
      if (
        !alive ||
        requesting ||
        document.visibilityState !== 'visible' ||
        (lock && !lock.released)
      )
        return;
      requesting = true;
      try {
        const next = await navigator.wakeLock.request('screen');
        if (!alive) {
          await next.release();
          return;
        }
        lock = next;
        setActive(true);
        next.addEventListener('release', () => {
          if (alive) setActive(false);
        });
      } catch {
        if (alive) setActive(false);
      } finally {
        requesting = false;
      }
    };
    void acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      alive = false;
      setActive(false);
      document.removeEventListener('visibilitychange', acquire);
      void lock?.release();
    };
  }, [enabled, supported]);
  return { enabled, active, supported, toggle: () => setEnabled((v) => !v) };
}
