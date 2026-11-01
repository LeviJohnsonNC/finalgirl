import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ImageSettings {
  /** Auto-generate the opening still and closing poster. On by default. */
  autoGenerate: boolean;
  /** Show AI casting art instead of official art. On by default. */
  useAiCastingArt: boolean;
}

const DEFAULT_SETTINGS: ImageSettings = {
  autoGenerate: true,
  useAiCastingArt: true,
};

export interface GenerateImageContext {
  tormentorOpening?:import('../../supabase/functions/_shared/play/tormentor').TormentorOpening;
  tormentorReview?:{loss:import('../../supabase/functions/_shared/play/tormentor').TormentorLoss};
  grimlashReview?:{loss:import('../../supabase/functions/_shared/play/grimlash').GrimlashLoss};
  konradReview?: {fate:import('../../supabase/functions/_shared/play/konrad').KonradFate};
  story: string;
  killer: string;
  killerDescription?: string;
  finalGirl: string;
  finalGirlDescription?: string;
  location: string;
  locationDescription?: string;
  moduleVisualGuidance?: string;
  visualBible?: string;
  sceneType: 'beginning' | 'ending';
  outcome?: 'won' | 'lost';
  introStory?: string;
  finalGirlHealth?: number;
  killerHealth?: number;
  mission?: { name: string; description: string };
  scenarioRules?: string;
  gameId?: string;
  previousImageUrl?: string;
  referenceImageUrl?: string;
}

/** POSTs to an edge function with the caller's session token. */
const callFunction = async <T>(name: string, body: unknown, signal?: AbortSignal): Promise<T> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('Please sign in first.');

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify(body),
    signal,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    const unavailable = name === 'generate-scene-image' && [502, 503, 504].includes(response.status);
    throw new Error(data.error || (unavailable
      ? 'The picture service could not finish. Your story and game result are safe. Please try again.'
      : `Request failed (${response.status})`));
  }
  return data as T;
};

/**
 * Image generation runs on the platform's AI key — no per-user API key, no
 * copy-and-paste prompt. Callers get a generate function plus the two display
 * preferences.
 */
export const useImageGeneration = () => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;
  const ownerRef = useRef(userId);
  ownerRef.current = userId;
  const [state, setState] = useState<{ owner: string | null; settings: ImageSettings; ready: boolean }>({ owner: null, settings: DEFAULT_SETTINGS, ready: false });
  const settings = state.owner === userId ? state.settings : DEFAULT_SETTINGS;
  const settingsReady = !userId || state.owner === userId && state.ready;
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const requestId = useRef(0);
  const savingRef = useRef(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const retryLoadSettings = useCallback(async () => {
    if (!userId) return;
    const id = ++requestId.current;
    try {
      const { data, error } = await supabase.from('user_image_settings')
        .select('auto_generate_images, use_ai_casting_art').eq('user_id', userId)
        .abortSignal(AbortSignal.timeout(20000)).maybeSingle();
      if (error) throw new Error(error.message);
      if (ownerRef.current !== userId || id !== requestId.current) return;
      setState({ owner: userId, ready: true, settings: {
        autoGenerate: data?.auto_generate_images ?? true,
        useAiCastingArt: data?.use_ai_casting_art ?? true,
      } });
      setSettingsError(null);
    } catch (error) {
      if (ownerRef.current === userId && id === requestId.current) {
        setSettingsError(error instanceof Error ? error.message : 'Could not load image preferences.');
      }
    }
  }, [userId]);

  useEffect(() => {
    void retryLoadSettings();
    const changed = (event: Event) => {
      const detail = (event as CustomEvent<{ owner: string; settings: ImageSettings }>).detail;
      if (detail.owner !== userId) return;
      requestId.current += 1;
      setState({ owner: userId, ready: true, settings: detail.settings });
    };
    window.addEventListener('final-girl-image-settings', changed);
    return () => { requestId.current += 1; window.removeEventListener('final-girl-image-settings', changed); };
  }, [userId, retryLoadSettings]);

  const updateSettings = useCallback(async (updates: Partial<ImageSettings>) => {
    if (!userId || !settingsReady || savingRef.current) return;
    savingRef.current = true;
    setIsSavingSettings(true);
    try {
      const patch: { user_id: string; auto_generate_images?: boolean; use_ai_casting_art?: boolean } = { user_id: userId };
      if (updates.autoGenerate !== undefined) patch.auto_generate_images = updates.autoGenerate;
      if (updates.useAiCastingArt !== undefined) patch.use_ai_casting_art = updates.useAiCastingArt;
      const { error } = await supabase.from('user_image_settings').upsert(patch, { onConflict: 'user_id' })
        .abortSignal(AbortSignal.timeout(20000));
      if (error) throw new Error(error.message);
      if (ownerRef.current !== userId) return;
      setSettingsError(null);
      window.dispatchEvent(new CustomEvent('final-girl-image-settings', { detail: { owner: userId, settings: { ...settings, ...updates } } }));
    } catch {
      if (ownerRef.current === userId) setSettingsError('Your image preferences could not be saved. Please try again.');
    } finally {
      savingRef.current = false;
      setIsSavingSettings(false);
    }
  }, [userId, settingsReady, settings]);

  /**
   * Generates a scene still or poster. Returns a storage URL, or null on
   * failure — the caller decides how loudly to complain, because an image
   * failing must never block the story.
   */
  const generateImage = useCallback(
    async (context: GenerateImageContext): Promise<string | null> => {
      if (!userId) return null;

      setIsGeneratingImage(true);
      setImageError(null);
      try {
        const data = await callFunction<{ imageUrl?: string }>('generate-scene-image', context, AbortSignal.timeout(155_000));
        if (!data.imageUrl) throw new Error('The image service returned no picture. Please try again.');
        return data.imageUrl;
      } catch (err) {
        const message = err instanceof Error && err.name === 'TimeoutError'
          ? 'The picture took too long to develop. Your story and game result are safe. Please try again.'
          : err instanceof Error ? err.message : 'Image generation failed';
        console.error('Image generation error:', err);
        setImageError(message);
        return null;
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [userId]
  );

  /** One short look-book paragraph per game, shared by both of its images. */
  const generateVisualBible = useCallback(
    async (context: {
      tormentorOpening?:import('../../supabase/functions/_shared/play/tormentor').TormentorOpening;
      killer: string;
      finalGirl: string;
      location: string;
      locationDescription?: string;
      killerDescription?: string;
      finalGirlDescription?: string;
      moduleVisualGuidance?: string;
    }): Promise<string | undefined> => {
      if (!userId) return undefined;
      try {
        const data = await callFunction<{ visualBible?: string }>('generate-visual-bible', context);
        return data.visualBible;
      } catch (err) {
        // Purely an enhancement — images still generate without it.
        console.warn('Visual bible generation failed:', err);
        return undefined;
      }
    },
    [userId]
  );

  return {
    isAuthenticated, settingsReady, settingsError, retryLoadSettings, isSavingSettings,
    autoGenerate: settings.autoGenerate,
    useAiCastingArt: settings.useAiCastingArt,
    isGeneratingImage,
    imageError,
    updateSettings,
    generateImage,
    generateVisualBible,
  };
};

