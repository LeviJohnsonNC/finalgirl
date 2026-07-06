import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

interface UseOwnedFilmsReturn {
  ownedFilms: string[];
  setOwnedFilms: (updater: (prev: string[]) => string[]) => void;
  isLoading: boolean;
  loadError: string | null;
  isDegraded: boolean;
  retryLoadOwnedFilms: () => Promise<void>;
}

export const useOwnedFilms = (): UseOwnedFilmsReturn => {
  const { user, isLoading: authLoading, isAuthReady, authError } = useAuth();
  const [localOwnedFilms, setLocalOwnedFilms] = useLocalStorage<string[]>('final-girl-owned-films', []);
  const [cachedCloudOwnedFilms, setCachedCloudOwnedFilms] = useLocalStorage<string[]>('final-girl-cloud-owned-films-cache', []);
  const [dbOwnedFilms, setDbOwnedFilms] = useState<string[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDegraded, setIsDegraded] = useState(false);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Ref mirrors so fetchFromDb / setOwnedFilms can read current values without
  // depending on them. With cachedCloudOwnedFilms as a dependency, every fetch
  // that updated the cache re-created fetchFromDb, re-ran the mount effect,
  // and queried user_settings twice per sign-in.
  const cachedCloudOwnedFilmsRef = useRef(cachedCloudOwnedFilms);
  cachedCloudOwnedFilmsRef.current = cachedCloudOwnedFilms;
  const dbOwnedFilmsRef = useRef(dbOwnedFilms);
  dbOwnedFilmsRef.current = dbOwnedFilms;

  const fetchFromDb = useCallback(async () => {
    if (!user) return;

    setIsDbLoading(true);
    setLoadError(null);
    setIsDegraded(false);

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('owned_films')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user settings:', error);
        const cached = cachedCloudOwnedFilmsRef.current;
        setLoadError(error.message || 'Collection archive is temporarily unavailable.');
        setIsDegraded(cached.length > 0);
        if (cached.length > 0) setDbOwnedFilms(cached);
        return;
      }

      const films = Array.isArray(data?.owned_films) ? data.owned_films as string[] : [];
      setDbOwnedFilms(films);
      setCachedCloudOwnedFilms(prev => JSON.stringify(prev) === JSON.stringify(films) ? prev : films);
    } catch (err) {
      console.error('Collection fetch failed:', err);
      const cached = cachedCloudOwnedFilmsRef.current;
      setLoadError(err instanceof Error ? err.message : 'Collection archive is temporarily unavailable.');
      setIsDegraded(cached.length > 0);
      if (cached.length > 0) setDbOwnedFilms(cached);
    } finally {
      setIsDbLoading(false);
    }
  }, [user, setCachedCloudOwnedFilms]);

  // Fetch from database when authenticated
  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      setIsDbLoading(false);
      setLoadError(authError);
      setIsDegraded(false);
      return;
    }

    fetchFromDb();
  }, [user, isAuthReady, authError, fetchFromDb]);

  // Migrate localStorage data on first sign-in
  useEffect(() => {
    if (!user || !isAuthReady || hasMigrated || isDbLoading) return;
    if (localOwnedFilms.length === 0) return;
    if (dbOwnedFilms.length > 0) return; // Already has data in DB

    const migrateData = async () => {
      setHasMigrated(true);
      
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            owned_films: localOwnedFilms,
          }, {
            onConflict: 'user_id',
          });

        if (error) {
          console.error('Error migrating user settings:', error);
          return;
        }

        // Clear localStorage after successful migration
        setLocalOwnedFilms([]);
        setDbOwnedFilms(localOwnedFilms);
        setCachedCloudOwnedFilms(localOwnedFilms);
      } catch (err) {
        console.error('Migration error:', err);
      }
    };

    migrateData();
  }, [user, isAuthReady, localOwnedFilms, dbOwnedFilms, hasMigrated, isDbLoading, setLocalOwnedFilms, setCachedCloudOwnedFilms]);

  const setOwnedFilms = useCallback((updater: (prev: string[]) => string[]) => {
    if (user) {
      // Compute the next value from the ref mirror so the cache write and the
      // network upsert happen OUTSIDE the state updater — React updaters must
      // be pure (they can be invoked more than once per update).
      const newFilms = updater(dbOwnedFilmsRef.current);
      setDbOwnedFilms(newFilms);
      setCachedCloudOwnedFilms(newFilms);

      // Save to database in background
      supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          owned_films: newFilms,
        }, {
          onConflict: 'user_id',
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error saving user settings:', error);
            toast.error('Failed to save collection', { description: 'Your film collection changes were not saved to the cloud.' });
          }
        });
    } else {
      setLocalOwnedFilms(updater);
    }
  }, [user, setLocalOwnedFilms, setCachedCloudOwnedFilms]);

  // Return appropriate data based on auth state
  const ownedFilms = user ? dbOwnedFilms : localOwnedFilms;
  const isLoading = authLoading || !isAuthReady || (user ? isDbLoading : false);

  return {
    ownedFilms,
    setOwnedFilms,
    isLoading,
    loadError,
    isDegraded,
    retryLoadOwnedFilms: fetchFromDb,
  };
};
