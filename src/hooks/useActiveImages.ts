import { useMemo } from 'react';
import {
  CHARACTER_IMAGES,
  CHARACTER_IMAGES_AI,
  LOCATION_IMAGES,
  LOCATION_IMAGES_AI,
  FEATURE_FILMS,
  FeatureFilm,
} from '@/types/gameData';
import { useImageGeneration } from './useImageGeneration';

type CastingType = 'killer' | 'location' | 'finalGirl';

export function useActiveImages() {
  const { useAiCastingArt } = useImageGeneration();

  return useMemo(() => {
    const characterImages = useAiCastingArt ? CHARACTER_IMAGES_AI : CHARACTER_IMAGES;
    const locationImages = useAiCastingArt ? LOCATION_IMAGES_AI : LOCATION_IMAGES;

    const getBoxArt = (film: FeatureFilm | undefined | null): string | undefined => {
      if (!film) return undefined;
      if (useAiCastingArt) return film.boxArtAi ?? film.boxArt;
      return film.boxArt;
    };

    const getImageForValue = (type: CastingType, value: string | null): string | null => {
      if (!value) return null;
      if ((type === 'killer' || type === 'finalGirl') && characterImages[value]) {
        return characterImages[value];
      }
      if (type === 'location' && locationImages[value]) {
        return locationImages[value];
      }
      const film = FEATURE_FILMS.find(f => {
        if (type === 'killer') return f.killer === value;
        if (type === 'location') return f.location === value;
        if (type === 'finalGirl') return f.finalGirls.some(fg => fg === value);
        return false;
      });
      return getBoxArt(film) ?? null;
    };

    return {
      aiEnabled: useAiCastingArt,
      characterImages,
      locationImages,
      getBoxArt,
      getImageForValue,
    };
  }, [useAiCastingArt]);
}
