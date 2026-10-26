import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { GameResult } from '@/hooks/useGameHistory';
import { activeScreenings, buildScreenings } from '@/lib/theater';
import type { ActiveGame } from '@/lib/activeGame';
import { useReducedMotion } from './useReducedMotion';

const subscribeVisibility = (notify: () => void) => {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
};

export function useTheaterReel(games: GameResult[], interacting: boolean, activeGame?: ActiveGame | null) {
  const reducedMotion = useReducedMotion();
  const visible = useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  // Rank once per case for this theater visit; unrelated refreshes preserve the reel.
  const ranks = useRef(new Map<string, number>());
  const screenings = useMemo(() => {
    if (activeGame) return activeScreenings(activeGame, failed);
    for (const game of games) if (!ranks.current.has(game.id)) ranks.current.set(game.id, Math.random());
    return buildScreenings(games, failed, ranks.current);
  }, [games, failed, activeGame]);
  const [requestedId, setRequestedId] = useState<string | null>(null);
  const target = screenings.find(s => s.id === requestedId) ?? screenings[0];
  const [projection, setProjection] = useState<{ key: string | null; previous: string | null }>({ key: null, previous: null });
  const current = screenings.find(s => s.key === projection.key);
  const previous = current ? screenings.find(s => s.key === projection.previous) : undefined;
  const currentIndex = current ? screenings.indexOf(current) : -1;
  const next = screenings[(currentIndex + 1) % screenings.length];
  const fail = useCallback((url: string) => {
    setFailed(old => old.has(url) ? old : new Set([...old, url]));
    setProjection(old => {
      const key = old.key?.endsWith(`:${url}`) ? null : old.key;
      const previous = old.previous?.endsWith(`:${url}`) ? null : old.previous;
      return key === old.key && previous === old.previous ? old : { key, previous };
    });
  }, []);
  const targetKey = target?.key;
  const targetUrl = target?.imageUrl;
  const targetId = target?.id;

  // Keep the old picture and its caption until the requested picture loads.
  // Cleanup ignores late loads after navigation, account changes or unmount.
  useEffect(() => {
    if (!targetKey || !targetUrl || !visible) return;
    let active = true;
    const image = new Image();
    const timeout = window.setTimeout(() => { if (active) fail(targetUrl); }, 12000);
    image.onload = () => {
      window.clearTimeout(timeout);
      if (active) {
        // Older records may put portrait artwork in the scene field. Never
        // commit it to the projector or fall back to that game's poster.
        if (!image.naturalWidth || image.naturalWidth < image.naturalHeight) { fail(targetUrl); return; }
        setProjection(old => old.key === targetKey ? old : { key: targetKey, previous: old.key });
        setRequestedId(id => id ?? targetId);
      }
    };
    image.onerror = () => { window.clearTimeout(timeout); if (active) fail(targetUrl); };
    image.src = targetUrl;
    return () => { active = false; window.clearTimeout(timeout); image.onload = null; image.onerror = null; };
  }, [targetKey, targetUrl, targetId, visible, fail]);

  useEffect(() => {
    if (!projection.previous) return;
    const timer = window.setTimeout(() => setProjection(old => ({ ...old, previous: null })), reducedMotion ? 0 : 3000);
    return () => window.clearTimeout(timer);
  }, [projection.key, projection.previous, reducedMotion]);

  // Only preload the next frame, not an entire account's image archive.
  const nextUrl = current && next?.key !== current.key ? next?.imageUrl : undefined;
  useEffect(() => {
    if (!nextUrl || !visible) return;
    const image = new Image();
    image.onload = () => { if (image.naturalWidth < image.naturalHeight) fail(nextUrl); };
    image.onerror = () => fail(nextUrl);
    image.src = nextUrl;
    return () => { image.onload = null; image.onerror = null; };
  }, [nextUrl, visible, fail]);

  const playing = !reducedMotion && visible && !interacting;
  const currentKey = current?.key;
  const currentId = current?.id;
  const nextId = next?.id;
  useEffect(() => {
    if (!playing || !currentKey || currentKey !== targetKey || !nextId || nextId === currentId) return;
    const timer = window.setTimeout(() => setRequestedId(nextId), 16000);
    return () => window.clearTimeout(timer);
  }, [playing, currentKey, currentId, targetKey, nextId]);

  return { current, previous, reducedMotion, playing,
    pending: Boolean(target && current?.key !== target.key), failedCount: failed.size,
    fail, retryImages: () => {
      setRequestedId(null);
      setProjection({ key: null, previous: null });
      setFailed(new Set());
    } };
}

