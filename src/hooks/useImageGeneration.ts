import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ImageSettings {
  /** Auto-generate the opening still and closing poster. On by default. */
  autoGenerate: boolean;
  /** Show the AI-rendered casting art instead of the photographic variants. */
  useAiCastingArt: boolean;
}

const DEFAULT_SETTINGS: ImageSettings = {
  autoGenerate: true,
  useAiCastingArt: false,
};

export interface GenerateImageContext {
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
  gameId?: string;
  previousImageUrl?: string;
}

/** POSTs to an edge function with the caller's session token. */
const callFunction = async <T>(name: string, body: unknown): Promise<T> => {
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
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || `Request failed (${response.status})`);
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
  const [settings, setSettings] = useState<ImageSettings>(DEFAULT_SETTINGS);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('user_image_settings')
        .select('auto_generate_images, use_ai_casting_art')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled || !data) return;
      setSettings({
        autoGenerate: data.auto_generate_images ?? true,
        useAiCastingArt: data.use_ai_casting_art ?? false,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  const updateSettings = useCallback(
    async (updates: Partial<ImageSettings>) => {
      if (!user) return;
      const next = { ...settings, ...updates };
      setSettings(next);

      const { error } = await supabase.from('user_image_settings').upsert(
        {
          user_id: user.id,
          auto_generate_images: next.autoGenerate,
          use_ai_casting_art: next.useAiCastingArt,
        },
        { onConflict: 'user_id' }
      );

      if (error) {
        console.error('Failed to update image settings:', error);
        setSettings(settings); // Roll back the optimistic update.
      }
    },
    [user, settings]
  );

  /**
   * Generates a scene still or poster. Returns a storage URL, or null on
   * failure — the caller decides how loudly to complain, because an image
   * failing must never block the story.
   */
  const generateImage = useCallback(
    async (context: GenerateImageContext): Promise<string | null> => {
      if (!user) return null;

      setIsGeneratingImage(true);
      setImageError(null);
      try {
        const data = await callFunction<{ imageUrl?: string }>('generate-scene-image', context);
        return data.imageUrl ?? null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Image generation failed';
        console.error('Image generation error:', err);
        setImageError(message);
        return null;
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [user]
  );

  /** One short look-book paragraph per game, shared by both of its images. */
  const generateVisualBible = useCallback(
    async (context: {
      killer: string;
      finalGirl: string;
      location: string;
      locationDescription?: string;
    }): Promise<string | undefined> => {
      if (!user) return undefined;
      try {
        const data = await callFunction<{ visualBible?: string }>('generate-visual-bible', context);
        return data.visualBible;
      } catch (err) {
        // Purely an enhancement — images still generate without it.
        console.warn('Visual bible generation failed:', err);
        return undefined;
      }
    },
    [user]
  );

  return {
    isAuthenticated,
    autoGenerate: settings.autoGenerate,
    useAiCastingArt: settings.useAiCastingArt,
    isGeneratingImage,
    imageError,
    updateSettings,
    generateImage,
    generateVisualBible,
  };
};
