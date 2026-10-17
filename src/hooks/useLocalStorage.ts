import { useCallback, useEffect, useRef, useState } from 'react';

const CHANGE_EVENT = 'final-girl-storage-change';

export function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item === null ? fallback : JSON.parse(item);
  } catch (error) {
    console.error('Error reading localStorage key "' + key + '":', error);
    return fallback;
  }
}

/** Persist before acknowledging a change. Never erase the last good value. */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((previous: T) => T)) => boolean] {
  const initialRef = useRef(initialValue);
  const [entry, setEntry] = useState(() => ({ key, value: readStoredValue(key, initialRef.current) }));
  // Never show the previous account's value while the key changes.
  const value = entry.key === key ? entry.value : readStoredValue(key, initialRef.current);
  const current = useRef({ key, value });
  current.current = { key, value };

  useEffect(() => {
    const refresh = (event: Event) => {
      const changedKey = event instanceof StorageEvent ? event.key : (event as CustomEvent<string>).detail;
      if (changedKey !== null && changedKey !== key) return;
      const next = readStoredValue(key, initialRef.current);
      current.current = { key, value: next };
      setEntry({ key, value: next });
    };
    window.addEventListener('storage', refresh);
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, [key]);

  const setValue = useCallback((next: T | ((previous: T) => T)): boolean => {
    const previous = readStoredValue(key, current.current.key === key ? current.current.value : initialRef.current);
    const valueToStore = typeof next === 'function' ? (next as (value: T) => T)(previous) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage key "' + key + '":', error);
      return false;
    }
    current.current = { key, value: valueToStore };
    setEntry({ key, value: valueToStore });
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: key }));
    return true;
  }, [key]);

  return [value, setValue];
}

