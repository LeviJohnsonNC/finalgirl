import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { createPrimedAudio, base64ToBlob } from '@/lib/audioUtils';
import {
  getNarrationClip,
  putNarrationClip,
  narrationKey,
} from '@/lib/play/narrationCache';
import { claimNarrator } from '@/lib/play/narrationCoordinator';
import { isGameDiscarded } from '@/lib/discardedGames';
export interface NarrationCasting {
  kind: 'intro' | 'ending' | 'death';
  outcome?: 'won' | 'lost';
  filmId?: string | null;
  deathSceneId?: string;
  gameId?: string;
}

/** Manual playback, synchronous iOS priming, owned replay caching and one narrator at a time. */
export const useNarration = () => {
  const { user } = useAuth();
  const owner = user?.id ?? 'guest';
  const ownerRef = useRef(owner);
  ownerRef.current = owner;
  const [isNarrating, setIsNarrating] = useState(false),
    [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({ elapsed: 0, duration: 0 });
  const alive = useRef(true),
    serial = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null),
    urlRef = useRef<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null),
    releaseRef = useRef<(() => void) | null>(null);
  const cleanup = useCallback(() => {
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.ontimeupdate = null;
      audio.pause();
      audio.src = '';
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    releaseRef.current?.();
    releaseRef.current = null;
  }, []);
  const stopNarration = useCallback(() => {
    serial.current++;
    controllerRef.current?.abort();
    controllerRef.current = null;
    cleanup();
    if (alive.current) {
      setIsNarrating(false);
      setIsPlaying(false);
      setProgress({ elapsed: 0, duration: 0 });
    }
  }, [cleanup]);
  useEffect(() => {
    alive.current = true;
    stopNarration();
    return () => {
      alive.current = false;
      stopNarration();
    };
  }, [owner, stopNarration]);
  const toggleNarration = useCallback(
    async (text: string | null, casting?: NarrationCasting) => {
      if (!text) return;
      // Ref guards cover a second tap before React has painted its disabled state.
      if (audioRef.current) {
        stopNarration();
        return;
      }
      const requestOwner = owner;
      releaseRef.current = claimNarrator(stopNarration);
      const request = ++serial.current;
      const controller = new AbortController();
      controllerRef.current = controller;
      const current = () =>
        alive.current &&
        serial.current === request &&
        ownerRef.current === requestOwner &&
        (!casting?.gameId || !isGameDiscarded(requestOwner, casting.gameId)) &&
        !controller.signal.aborted;
      // This call must precede every await for iOS user-gesture activation.
      const audio = createPrimedAudio();
      audioRef.current = audio;
      setIsNarrating(true);
      setIsPlaying(false);
      const timer = setTimeout(
        () => controller.abort(),
        casting?.kind === 'death' ? 45000 : 150000,
      );
      try {
        if (requestOwner === 'guest')
          throw new Error('You must be signed in to narrate.');
        // Game association is metadata, not a different voice/cache identity.
        const { gameId, ...voiceCasting } = casting ?? { kind: 'intro' };
        const key = await narrationKey(text, voiceCasting);
        if (!current()) return;
        let blob = await getNarrationClip(requestOwner, key, gameId);
        if (!current()) return;
        if (!blob) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!current()) return;
          if (!session?.access_token || session.user.id !== requestOwner)
            throw new Error('Sign in to narrate this story.');
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/narrate-story`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                text,
                kind: casting?.kind,
                outcome: casting?.outcome,
                filmId: casting?.filmId ?? undefined,
                deathSceneId: casting?.deathSceneId,
              }),
              signal: controller.signal,
            },
          );
          const data = await response.json();
          if (!current()) return;
          if (!response.ok || data.error)
            throw new Error(
              typeof data.error === 'string'
                ? data.error.slice(0, 200)
                : 'Narration is unavailable. Try again later.',
            );
          if (
            typeof data.audioContent !== 'string' ||
            !data.audioContent.length ||
            data.audioContent.length > 18000000
          )
            throw new Error('The narration response was invalid.');
          blob = base64ToBlob(data.audioContent, 'audio/mpeg');
          // Playback does not wait on device storage, and memory is populated synchronously.
          void putNarrationClip(requestOwner, key, blob, gameId);
        }
        if (!current()) return;
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        audio.src = url;
        audio.ontimeupdate = () => {
          if (current())
            setProgress({
              elapsed: audio.currentTime,
              duration: Number.isFinite(audio.duration) ? audio.duration : 0,
            });
        };
        audio.onended = () => {
          if (current()) stopNarration();
        };
        audio.onerror = () => {
          if (current()) {
            stopNarration();
            toast.error(
              'Audio playback failed. The saved clip can be replayed.',
            );
          }
        };
        await audio.play();
        if (current()) setIsPlaying(true);
      } catch (reason) {
        if (current()) {
          toast.error('Narration failed', {
            description:
              reason instanceof Error ? reason.message : 'Try again later.',
          });
          cleanup();
        } else if (
          alive.current &&
          serial.current === request &&
          ownerRef.current === requestOwner
        ) {
          cleanup();
          toast.error('Narration timed out. Your story is still saved.');
        }
      } finally {
        clearTimeout(timer);
        if (
          alive.current &&
          serial.current === request &&
          ownerRef.current === requestOwner
        ) {
          setIsNarrating(false);
          if (!audioRef.current) setIsPlaying(false);
          controllerRef.current = null;
        }
      }
    },
    [owner, cleanup, stopNarration],
  );
  return { isNarrating, isPlaying, progress, toggleNarration, stopNarration };
};
