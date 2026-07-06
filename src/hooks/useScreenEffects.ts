import { useState, useEffect } from 'react';

interface ScreenEffects {
  showFlicker: boolean;
  showFrameJump: boolean;
}

/**
 * Provides random VHS analog imperfection effects (flicker and frame jump).
 * Flicker fires every 15-30s for 150ms; frame jump fires every 40-60s for 120ms.
 */
export const useScreenEffects = (): ScreenEffects => {
  const [showFlicker, setShowFlicker] = useState(false);
  const [showFrameJump, setShowFrameJump] = useState(false);

  useEffect(() => {
    // Track every live timer: these chains reschedule themselves, so clearing
    // only the first handle (the old behavior) leaked the chain forever after
    // unmount and kept calling setState on an unmounted component.
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let cancelled = false;

    const later = (fn: () => void, delay: number) => {
      const handle = setTimeout(() => {
        timers.delete(handle);
        if (!cancelled) fn();
      }, delay);
      timers.add(handle);
    };

    const scheduleFlicker = () => {
      later(() => {
        setShowFlicker(true);
        later(() => setShowFlicker(false), 150);
        scheduleFlicker();
      }, Math.random() * 15000 + 15000);
    };

    const scheduleFrameJump = () => {
      later(() => {
        setShowFrameJump(true);
        later(() => setShowFrameJump(false), 120);
        scheduleFrameJump();
      }, Math.random() * 20000 + 40000);
    };

    scheduleFlicker();
    scheduleFrameJump();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return { showFlicker, showFrameJump };
};
