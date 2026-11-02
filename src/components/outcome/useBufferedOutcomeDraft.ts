import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Keep text input local; persist the merged draft after a pause or at a boundary. */
export function useBufferedOutcomeDraft(save?: (fields: Record<string, unknown>) => boolean) {
  const writer = useRef(save);
  useLayoutEffect(() => { writer.current = save; }, [save]);
  const pending = useRef<Record<string, unknown>>({});
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [saveFailed, setSaveFailed] = useState(false);

  const persist = useCallback(() => {
    clearTimeout(timer.current);
    if (!Object.keys(pending.current).length) return true;
    if (writer.current?.(pending.current) === false) return false;
    pending.current = {};
    return true;
  }, []);
  const flush = useCallback(() => {
    const saved = persist();
    setSaveFailed(!saved);
    return saved;
  }, [persist]);
  const queue = useCallback((fields: Record<string, unknown>) => {
    pending.current = { ...pending.current, ...fields };
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 600);
    return true;
  }, [flush]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!persist()) { event.preventDefault(); event.returnValue = ''; }
    };
    const hide = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('pagehide', persist);
      document.removeEventListener('visibilitychange', hide);
      // Use the last committed writer for this mounted game/account, not another session.
      persist();
    };
  }, [flush, persist]);

  return { queue, flush, saveFailed };
}
