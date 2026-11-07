import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { createPrimedAudio, base64ToBlob } from '@/lib/audioUtils';
import {
  deleteNarrationClip,
  getNarrationClip,
  putNarrationClip,
  narrationKey,
} from '@/lib/play/narrationCache';
import { claimNarrator } from '@/lib/play/narrationCoordinator';
import { NarrationPcmPlayer } from '@/lib/narration/pcmPlayer';
import { narrationMessages, NARRATION_PROFILE } from '../../supabase/functions/_shared/narration';
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
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const pcmRef = useRef<NarrationPcmPlayer | null>(null);
  const pausedRef = useRef(false);
  const [progress, setProgress] = useState({ elapsed: 0, duration: 0 });
  const alive = useRef(true),
    serial = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null),
    urlRef = useRef<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null),
    releaseRef = useRef<(() => void) | null>(null);
  const cleanup = useCallback(() => {
    pcmRef.current?.dispose(); pcmRef.current = null;
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.ontimeupdate = null;
      audio.onwaiting = null; audio.onplaying = null;
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
      setIsPaused(false); pausedRef.current = false; setIsBuffering(false); setIsComplete(false);
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
      const started = performance.now();
      let firstAudio = false;
      const update = (state: { elapsed: number; duration: number; playing: boolean; buffering: boolean; complete: boolean }) => {
        if (!current() || state.duration === 0) return;
        if (!firstAudio && state.duration > 0 && state.playing && !state.buffering) {
          firstAudio = true;
          console.info('narration_first_audio', { milliseconds: Math.round(performance.now() - started), streamed: true });
        }
        setProgress({ elapsed: state.elapsed, duration: state.duration });
        setIsPlaying(state.playing); setIsPaused(!state.playing); pausedRef.current = !state.playing;
        setIsBuffering(state.buffering); setIsComplete(state.complete);
        if (state.duration > 0) setIsNarrating(false);
      };
      if (typeof AudioContext !== 'undefined') {
        try { pcmRef.current = new NarrationPcmPlayer(update, () => { if (current()) stopNarration(); }); }
        catch { /* Legacy whole-clip fallback still supports manual playback. */ }
      }
      setIsNarrating(true);
      setIsPlaying(false);
      const timer = setTimeout(
        () => controller.abort(),
        150000,
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
                stream: Boolean(pcmRef.current),
                kind: casting?.kind,
                outcome: casting?.outcome,
                filmId: casting?.filmId ?? undefined,
                deathSceneId: casting?.deathSceneId,
              }),
              signal: controller.signal,
            },
          );
          if (response.ok && response.headers.get('Content-Type')?.includes('application/x-ndjson')) {
            const player = pcmRef.current;
            if (!player || !response.body) throw new Error('Streaming audio is unavailable.');
            let complete = false, begun = false;
            for await (const message of narrationMessages(response.body)) {
              if (!current()) return;
              if (message.type === 'error') throw new Error(String(message.error).slice(0, 200));
              if (message.type === 'start') {
                if (begun || message.sampleRate !== 48000 || message.profile !== NARRATION_PROFILE) throw new Error('The narrator needs an app refresh.');
                begun = true;
              } else if (message.type === 'audio') {
                if (!begun || complete || typeof message.audio !== 'string') throw new Error('Invalid narration stream.');
                player.append(message.audio);
              } else if (message.type === 'done') {
                if (!begun || complete) throw new Error('Invalid narration completion.');
                complete = true;
              }
            }
            if (!current()) return;
            if (!complete) throw new Error('Narration was interrupted. Your story is still saved.');
            player.finish();
            void putNarrationClip(requestOwner, key, player.toBlob(), gameId);
            setIsComplete(true);
            return;
          }
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
        pcmRef.current?.dispose(); pcmRef.current = null;
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
        audio.onwaiting = () => { if (current()) setIsBuffering(true); };
        audio.onplaying = () => { if (current()) setIsBuffering(false); };
        audio.onended = () => {
          if (current()) stopNarration();
        };
        audio.onerror = () => {
          if (current()) {
            void deleteNarrationClip(requestOwner, key);
            stopNarration();
            toast.error(
              'Audio playback failed. Tap Narrate to create a fresh recording.',
            );
          }
        };
        await audio.play();
        if (current()) { setIsPlaying(true); setIsComplete(true); }
      } catch (reason) {
        if (current()) {
          toast.error('Narration failed', {
            description:
              reason instanceof Error ? reason.message : 'Try again later.',
          });
          cleanup(); setIsPlaying(false); setIsPaused(false); setIsBuffering(false);
        } else if (
          alive.current &&
          serial.current === request &&
          ownerRef.current === requestOwner
        ) {
          cleanup(); setIsPlaying(false); setIsPaused(false); setIsBuffering(false);
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
  const pauseResume = useCallback(async () => {
    const pcm = pcmRef.current, audio = audioRef.current;
    if (!audio) return;
    try {
      if (pausedRef.current) { if (pcm) await pcm.resume(); else await audio.play(); }
      else { if (pcm) pcm.pause(); else audio.pause(); }
      if (audioRef.current !== audio) return;
      const paused = !pausedRef.current;
      // PCM publishes state itself; HTMLAudio needs an explicit state update.
      if (!pcm) { pausedRef.current = paused; setIsPaused(paused); setIsPlaying(!paused); }
    } catch { toast.error('Playback could not resume. Try again.'); }
  }, []);
  const seek = useCallback((seconds: number) => {
    if (pcmRef.current) pcmRef.current.seek(seconds);
    else if (audioRef.current) {
      const a = audioRef.current;
      a.currentTime = Math.max(0, Math.min(seconds, Number.isFinite(a.duration) ? a.duration : 0));
      setProgress({ elapsed: a.currentTime, duration: Number.isFinite(a.duration) ? a.duration : 0 });
    }
  }, []);
  return { isNarrating, isPlaying, isPaused, isBuffering, isComplete, progress, toggleNarration, stopNarration, pauseResume, seek };
};
