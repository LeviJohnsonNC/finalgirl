import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createPrimedAudio, base64ToBlob } from '@/lib/audioUtils';

/** Which moment is being narrated, so the edge function can cast a voice. */
export interface NarrationCasting {
  kind: 'intro' | 'ending';
  outcome?: 'won' | 'lost';
  filmId?: string | null;
}

/**
 * Shared narrate-story playback logic (extracted from NowPlaying / TheEnd,
 * which carried two identical copies of it).
 *
 * - Primes an Audio element synchronously in the tap handler for iOS.
 * - Fetches TTS audio from the narrate-story edge function, telling it which
 *   moment is being read so the narrator can be cast to match (see
 *   supabase/functions/_shared/voices.ts).
 * - Stops playback and revokes the blob URL on unmount, so audio no longer
 *   keeps playing after the user navigates away mid-narration.
 */
export const useNarration = () => {
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const releaseBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      releaseBlobUrl();
    };
  }, []);

  const toggleNarration = useCallback(async (text: string | null, casting?: NarrationCasting) => {
    if (!text) return;

    // If already playing, stop and reset
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    // Prime an Audio element immediately (synchronously in the tap handler)
    // so iOS Safari marks it as user-gesture-activated.
    const audio = createPrimedAudio();
    audioRef.current = audio;

    setIsNarrating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('You must be signed in to narrate.');
      }
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
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Narration request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Say which voice actually read it. The edge function falls back through
      // its candidate chain silently, so without this a rejected cast is
      // indistinguishable from a stale deploy — which is exactly how the first
      // casting bug hid.
      if (data.voiceId) {
        console.info(`Narrated by ${data.voiceId} (persona: ${data.persona ?? 'unknown'})`);
      }

      // Convert base64 to a Blob URL (avoids iOS data-URI size limits)
      const blob = base64ToBlob(data.audioContent, 'audio/mpeg');
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;

      if (!isMountedRef.current) {
        // Unmounted while the fetch was in flight — don't start playback.
        releaseBlobUrl();
        return;
      }

      audio.src = blobUrl;

      audio.onended = () => {
        if (isMountedRef.current) setIsPlaying(false);
        releaseBlobUrl();
      };

      audio.onerror = () => {
        if (isMountedRef.current) {
          setIsPlaying(false);
          toast.error('Audio playback failed');
        }
        releaseBlobUrl();
      };

      await audio.play();
      if (isMountedRef.current) setIsPlaying(true);
    } catch (err) {
      console.error('Narration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate narration';
      if (isMountedRef.current) {
        toast.error('Narration failed', { description: errorMessage });
      }
    } finally {
      if (isMountedRef.current) setIsNarrating(false);
    }
  }, [isPlaying]);

  return { isNarrating, isPlaying, toggleNarration };
};
