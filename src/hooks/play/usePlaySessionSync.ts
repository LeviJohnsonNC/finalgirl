import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDurableQueue } from '@/hooks/useDurableQueue';
import { readStoredValue, useLocalStorage } from '@/hooks/useLocalStorage';
import { isActiveGame, type ActiveGame } from '@/lib/activeGame';

interface Snapshot { id: string; state: ActiveGame; closed: boolean }
export interface RemotePlaySession { id: string; revision: number; state: ActiveGame; closed: boolean; updated_at?: string }
interface Reply { ok: boolean; revision: number; state?: ActiveGame; closed?: boolean }
const validRow = (value: unknown): value is RemotePlaySession => {
  const row = value as RemotePlaySession;
  return Boolean(row && typeof row.id === 'string' && Number.isSafeInteger(row.revision) && row.revision > 0 && isActiveGame(row.state) && row.state.id === row.id && typeof row.closed === 'boolean');
};

/** Snapshot CAS gives explicit device handoff without silently overwriting offline edits. */
export function usePlaySessionSync(game: ActiveGame | null) {
  const { user, isAuthReady } = useAuth();
  const owner = user?.id ?? 'guest';
  const revisionKey = `final-girl-play-revisions-v1:${owner}`;
  const [revisions, setRevisions] = useLocalStorage<Record<string, number>>(revisionKey, {});
  const [remoteGames, setRemoteGames] = useState<RemotePlaySession[]>([]);
  const remoteOwner = useRef<string | null>(null);
  const [conflict, setConflict] = useState<RemotePlaySession | null>(null);
  const conflictOwner = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const latest = useRef({ owner, game, signedIn: Boolean(user), revisions });
  latest.current = { owner, game, signedIn: Boolean(user), revisions };

  const send = useCallback(async (snapshot: Snapshot) => {
    if (latest.current.owner !== owner || !latest.current.signedIn) throw new Error('Sign in to sync this game.');
    // Newer local snapshots contain the complete event log. Never send an older open snapshot over them.
    if (!snapshot.closed && (!latest.current.game || latest.current.game.id !== snapshot.id || JSON.stringify(snapshot.state) !== JSON.stringify(latest.current.game))) return;
    const savedRevisions = readStoredValue<Record<string, number>>(revisionKey, {});
    const { data, error } = await supabase.rpc('save_play_session' as never, {
      p_id: snapshot.id, p_revision: savedRevisions[snapshot.id] ?? 0,
      p_state: snapshot.state, p_closed: snapshot.closed,
    } as never).abortSignal(AbortSignal.timeout(20000));
    if (latest.current.owner !== owner) throw new Error('Session changed. This game stays saved on its device.');
    if (error) throw new Error('Cloud sync unavailable. Your game is saved on this device.');
    const reply = data as unknown as Reply;
    if (!reply || !Number.isSafeInteger(reply.revision) || reply.revision < 1 || typeof reply.ok !== 'boolean') throw new Error('The archive returned an invalid session. Your local game is safe.');
    if (!reply.ok) {
      const row = { id: snapshot.id, revision: reply.revision, state: reply.state, closed: reply.closed };
      if (validRow(row)) { conflictOwner.current = owner; setConflict(row); }
      throw new Error('Another device changed this game. Choose which version to continue.');
    }
    if (!setRevisions(previous => ({ ...previous, [snapshot.id]: reply.revision }))) throw new Error('Cloud saved; this device could not acknowledge it. Retry safely.');
    if (snapshot.closed) setRemoteGames(rows => rows.filter(row => row.id !== snapshot.id));
  }, [owner, revisionKey, setRevisions]);
  const { pending, enqueue, flush, error } = useDurableQueue<Snapshot>(`final-girl-play-outbox-v1:${owner}`, Boolean(user && isAuthReady), send);

  useEffect(() => {
    if (!user || !isAuthReady || !game) return;
    const timer = setTimeout(() => {
      try { enqueue({ id: game.id, state: game, closed: false }); }
      catch (reason) { setLoadError(reason instanceof Error ? reason.message : 'Cloud sync paused.'); }
    }, 400);
    return () => clearTimeout(timer);
  }, [game, user, isAuthReady, enqueue]);

  useEffect(() => {
    setRemoteGames([]); setConflict(null); setLoadError(null);
    if (!user || !isAuthReady) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await supabase.from('play_sessions' as never).select('*').eq('user_id', user.id)
          .eq('closed', false).order('updated_at', { ascending: false }).limit(10).abortSignal(AbortSignal.timeout(20000));
        if (cancelled || latest.current.owner !== owner) return;
        if (error) throw new Error('Cloud games could not be loaded. Local tracking still works.');
        remoteOwner.current = owner;
        setRemoteGames(Array.isArray(data) ? (data as unknown[]).filter(validRow) : []);
      } catch (reason) { if (!cancelled) setLoadError(reason instanceof Error ? reason.message : 'Cloud games unavailable.'); }
    })();
    return () => { cancelled = true; };
  }, [user, isAuthReady, owner]);

  const close = useCallback(() => {
    const state = latest.current.game;
    if (!state || !user) return true;
    if (conflict && conflictOwner.current === owner) return false;
    try { enqueue({ id: state.id, state, closed: true }); return true; }
    catch { setLoadError('Keep this page open: the archive close could not be saved locally.'); return false; }
  }, [user, enqueue, conflict, owner]);

  const adopt = useCallback((row: RemotePlaySession, persist: (state: ActiveGame) => boolean) => {
    if (!validRow(row) || latest.current.owner !== owner) return false;
    const local = latest.current.game;
    // Both versions remain recoverable even after choosing a cloud copy.
    try {
      localStorage.setItem(`final-girl-play-backup-v1:${owner}:${row.id}`, JSON.stringify({ local, cloud: row, savedAt: Date.now() }));
    } catch { setLoadError('Free device storage before switching versions. Both copies are still safe.'); return false; }
    if (!setRevisions(previous => ({ ...previous, [row.id]: row.revision })) || !persist(row.state)) return false;
    latest.current.game = row.state;
    setConflict(null);
    return true;
  }, [owner, setRevisions]);
  const keepLocal = useCallback(() => {
    if (!conflict || !latest.current.game || latest.current.owner !== owner) return false;
    const local = latest.current.game;
    try { localStorage.setItem(`final-girl-play-backup-v1:${owner}:${conflict.id}`, JSON.stringify({ local, cloud: conflict, savedAt: Date.now() })); }
    catch { setLoadError('Free device storage before switching versions.'); return false; }
    if (!setRevisions(previous => ({ ...previous, [conflict.id]: conflict.revision }))) return false;
    setConflict(null);
    try { enqueue({ id: local.id, state: local, closed: false }); void flush(); return true; }
    catch { return false; }
  }, [conflict, owner, setRevisions, enqueue, flush]);
  const syncNow = useCallback(async () => {
    if (!user || conflict || latest.current.owner !== owner) return false;
    const state = readStoredValue<ActiveGame | null>(`final-girl-active-game-v1:${owner}`, latest.current.game);
    if (!isActiveGame(state) || state.id !== latest.current.game?.id) return false;
    // An edit and its Generate tap can occur before React rerenders. Read the durable copy.
    latest.current.game = state;
    try { enqueue({id:state.id,state,closed:false}); return await flush(); }
    catch { return false; }
  }, [user,conflict,owner,enqueue,flush]);
  return {
    syncNow,
    // Hide a prior account's rows on the very first render, before effects reset.
    remoteGames: remoteOwner.current === owner ? remoteGames.filter(row => !pending.some(p => p.id === row.id && p.closed)) : [],
    pendingCount: pending.length, error: error || loadError, conflict: conflictOwner.current === owner ? conflict : null,
    close, adopt, keepLocal,
  };
}

