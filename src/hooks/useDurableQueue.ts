import { useCallback, useEffect, useRef, useState } from 'react';
import { readStoredValue, useLocalStorage } from './useLocalStorage';

interface Queued<T> { id: string; value: T }
const workers = new Map<string, Promise<boolean>>();

/** An account-scoped write-ahead log; failed sends survive reloads. */
export function useDurableQueue<T>(key: string, enabled: boolean, send: (value: T) => Promise<void>) {
  const [pending, setPending] = useLocalStorage<Queued<T>[]>(key, []);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef({ key, enabled, send });
  latest.current = { key, enabled, send };

  const flush = useCallback((): Promise<boolean> => {
    if (!enabled || latest.current.key !== key) return Promise.resolve(false);
    const existing = workers.get(key);
    if (existing) return existing;
    const run = async () => {
      setError(null);
      while (latest.current.key === key && latest.current.enabled) {
        const next = readStoredValue<Queued<T>[]>(key, [])[0];
        if (!next) return true;
        try {
          await latest.current.send(next.value);
          if (latest.current.key !== key) return false;
          if (!setPending(items => items.filter(item => item.id !== next.id))) {
            throw new Error('This device could not acknowledge the saved record. It will retry safely.');
          }
        } catch (reason) {
          if (latest.current.key === key) setError(reason instanceof Error ? reason.message : 'The archive could not be reached.');
          return false;
        }
      }
      return false;
    };
    const worker = run().finally(() => workers.delete(key));
    workers.set(key, worker);
    return worker;
  }, [key, enabled, setPending]);

  const enqueue = useCallback((value: T) => {
    if (!setPending(items => [...items, { id: crypto.randomUUID(), value }])) {
      throw new Error('This device could not save your changes. Free some browser storage and try again.');
    }
    queueMicrotask(() => { void flush(); });
  }, [setPending, flush]);

  useEffect(() => {
    if (enabled) void flush();
    const online = () => { void flush(); };
    window.addEventListener('online', online);
    return () => window.removeEventListener('online', online);
  }, [enabled, flush]);

  return { pending: pending.map(item => item.value), enqueue, flush, error };
}
