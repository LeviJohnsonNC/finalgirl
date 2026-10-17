import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDurableQueue } from '@/hooks/useDurableQueue';
import { supabase } from '@/integrations/supabase/client';

interface CollectionChange { add: string[]; remove: string[] }
const applyChange = (films: string[], change: CollectionChange) =>
  [...new Set([...films.filter(id => !change.remove.includes(id)), ...change.add])];

export const useOwnedFilms = () => {
  const { user, isLoading: authLoading, isAuthReady, authError } = useAuth();
  const userId = user?.id ?? null;
  const ownerRef = useRef(userId);
  ownerRef.current = userId;
  const [localFilms, setLocalFilms] = useLocalStorage<string[]>('final-girl-owned-films', []);
  const [cachedFilms, setCachedFilms] = useLocalStorage<string[]>(`final-girl-collection-v2:${userId ?? 'guest'}`, []);
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestId = useRef(0);

  const send = useCallback(async (change: CollectionChange) => {
    if (!userId || ownerRef.current !== userId) throw new Error('Sign in to finish saving your collection.');
    // Narrow boundary until the platform regenerates its schema types for this
    // additive RPC. The generated integration files are intentionally untouched.
    const { data, error } = await supabase.rpc('apply_collection_delta' as never,
      { p_add: change.add, p_remove: change.remove } as never)
      .abortSignal(AbortSignal.timeout(20000));
    if (error) throw new Error(error.message);
    if (!Array.isArray(data)) throw new Error('The archive returned an invalid collection.');
    const films = data as string[];
    if (ownerRef.current === userId && !setCachedFilms(films)) throw new Error('This device could not acknowledge the saved collection. Please free browser storage.');
  }, [userId, setCachedFilms]);

  const { pending, enqueue, flush, error: saveError } = useDurableQueue<CollectionChange>(`final-girl-collection-outbox-v1:${userId ?? 'guest'}`, Boolean(userId && isAuthReady && (loadedOwner === userId || loadError)), send);
  const ownedFilms = userId ? pending.reduce(applyChange, cachedFilms) : localFilms;
  const filmsRef = useRef(ownedFilms);
  filmsRef.current = ownedFilms;

  const fetchFromDb = useCallback(async () => {
    if (!userId) return;
    const id = ++requestId.current;
    setIsDbLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.from('user_settings').select('owned_films')
        .eq('user_id', userId).abortSignal(AbortSignal.timeout(20000)).maybeSingle();
      if (error) throw new Error(error.message);
      if (id !== requestId.current || ownerRef.current !== userId) return;
      setCachedFilms(Array.isArray(data?.owned_films) ? data.owned_films as string[] : []);
      setLoadedOwner(userId);
    } catch (error) {
      if (id === requestId.current && ownerRef.current === userId) {
        setLoadError(error instanceof Error ? error.message : 'Collection archive is temporarily unavailable.');
      }
    } finally {
      if (id === requestId.current && ownerRef.current === userId) setIsDbLoading(false);
    }
  }, [userId, setCachedFilms]);

  useEffect(() => {
    if (isAuthReady && userId) void fetchFromDb();
    return () => { requestId.current += 1; };
  }, [isAuthReady, userId, fetchFromDb]);

  useEffect(() => {
    if (!userId || loadedOwner !== userId || loadError || !localFilms.length) return;
    try {
      enqueue({ add: localFilms, remove: [] });
      setLocalFilms([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not import your collection.');
    }
  }, [userId, loadedOwner, loadError, localFilms, enqueue, setLocalFilms]);

  const setOwnedFilms = useCallback((updater: (previous: string[]) => string[]) => {
    try {
      if (!userId) {
        if (!setLocalFilms(updater)) throw new Error('This device could not save your collection.');
        return;
      }
      if (loadedOwner !== userId || isDbLoading || loadError) {
        toast.error('Wait for your collection to reconnect before editing it.');
        return;
      }
      const previous = filmsRef.current;
      const next = updater(previous);
      enqueue({ add: next.filter(id => !previous.includes(id)), remove: previous.filter(id => !next.includes(id)) });
      filmsRef.current = next;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save your collection.');
    }
  }, [userId, loadedOwner, isDbLoading, loadError, enqueue, setLocalFilms]);

  return {
    ownedFilms, setOwnedFilms,
    isLoading: authLoading || !isAuthReady || Boolean(userId && (isDbLoading || loadedOwner !== userId && !loadError)),
    loadError: userId ? loadError : authError,
    isDegraded: Boolean(userId && loadError && cachedFilms.length),
    retryLoadOwnedFilms: fetchFromDb,
    pendingSaveCount: userId ? pending.length : 0,
    saveError: saveError,
    retryPendingSaves: flush,
  };
};
