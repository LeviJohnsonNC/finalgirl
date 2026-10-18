import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {isDeathScene,type DeathScene} from '@/lib/play/death';
export type {DeathScene} from '@/lib/play/death';
export function useDeathScenes(
  sessionId: string,
  syncNow?: () => Promise<boolean>,
) {
  const { user } = useAuth();
  const owner = user?.id ?? 'guest';
  const [saved, setSaved] = useState<{
    key: string;
    rows: DeathScene[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const key = owner + ':' + sessionId;
  const current = useRef(key);
  current.current = key;
  const generation = useRef<AbortController | null>(null);
  const active = useRef(true);
  const refresh = useCallback(async () => {
    if (!user) return;
    const requestKey = key;
    const { data, error } = await supabase
      .from('play_death_scenes' as never)
      .select('id,session_id,event_id,signature,take,scene_text,model,status')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .eq('status', 'ready')
      .order('created_at', { ascending: true })
      .abortSignal(AbortSignal.timeout(20000));
    if (!active.current || current.current !== requestKey) return;
    if (error) {
      setError('Saved scenes could not be loaded. Your game is still safe.');
      return;
    }
    setSaved({
      key: requestKey,
      rows: (Array.isArray(data) ? data : []).filter(isDeathScene),
    });
    setError(null);
  }, [user, key, sessionId]);
  useEffect(() => {
    active.current = true;
    setError(null);
    setBusy(false);
    void refresh();
    return () => {
      active.current = false;
      generation.current?.abort();
    };
  }, [refresh]);
  const generate = async (eventId: string, take: number) => {
    if (!user || generation.current || !syncNow) return;
    const requestKey = key;
    const controller = new AbortController();
    generation.current = controller;
    setBusy(true);
    setError(null);
    const timer = setTimeout(() => controller.abort(), 35000);
    try {
      if (!(await syncNow()))
        throw new Error(
          'Could not sync this death yet. Try generating the scene again when connected.',
        );
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token || session.user.id !== user.id)
        throw new Error('Sign in to generate a death scene.');
      if (current.current !== requestKey || !active.current) return;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-death-scene`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId, eventId, take }),
          signal: controller.signal,
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'The scene could not be developed.',
        );
      if (
        !isDeathScene(data.scene) ||
        data.scene.session_id !== sessionId ||
        data.scene.event_id !== eventId
      )
        throw new Error(
          'The scene response was invalid. Check saved scenes before trying again.',
        );
      if (current.current === requestKey && active.current)
        setSaved((previous) => ({
          key: requestKey,
          rows: [
            ...(previous?.key === requestKey ? previous.rows : []).filter(
              (r) => r.id !== data.scene.id,
            ),
            data.scene,
          ],
        }));
    } catch (reason) {
      if (current.current === requestKey && active.current)
        setError(
          controller.signal.aborted
            ? 'The scene is taking longer than expected. Check saved scenes before retrying. Your death is recorded.'
            : reason instanceof Error
              ? reason.message
              : 'Scene unavailable. Your death is recorded.',
        );
    } finally {
      clearTimeout(timer);
      if (generation.current === controller) generation.current = null;
      if (current.current === requestKey && active.current) setBusy(false);
    }
  };
  return {
    rows: saved?.key === key ? saved.rows : [],
    error,
    busy,
    generate,
    refresh,
    signedIn: Boolean(user),
  };
}

