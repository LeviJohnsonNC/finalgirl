import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { ImageLightbox } from '@/components/ImageLightbox';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import type { GameResult } from '@/hooks/useGameHistory';
import { getKillerDescription } from '@/data/killerDescriptions';
import { getFinalGirlDescription } from '@/data/finalGirlDescriptions';
import { getLocationDescription } from '@/data/locationDescriptions';
import { getModulePromptContext } from '@/data/rules/moduleRules';
import { isKillerUnkillable } from '@/data/killerHealth';
import { getMissionByName } from '@/data/falconwoodMissions';
import { getKillerNarrativeRules } from '@/data/killerSpecialRules';

interface Props {
  game: GameResult;
  kind: 'scene' | 'poster';
  className?: string;
  loading?: boolean;
  beforeGenerate?: () => Promise<GameResult | null>;
  onGenerated: (id: string, updates: Partial<GameResult>) => void;
}

/** Recover only missing artwork. Failed URLs are recoverable too. */
export function ScrapbookArtwork({ game, kind, className, loading, onGenerated, beforeGenerate }: Props) {
  const { generateImage, isGeneratingImage, imageError, isAuthenticated } = useImageGeneration();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const busy = useRef(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const url = kind === 'poster' ? game.posterImageUrl : game.sceneImageUrl;
  const label = kind === 'poster' ? 'Game Poster' : 'Scene evidence';
  const hasImage = Boolean(url) && url !== failedUrl;

  const recover = async () => {
    if (busy.current || loading) return;
    busy.current = true;
    setRecovering(true);
    setRecoveryError(null);
    try {
      const source = beforeGenerate ? await beforeGenerate() : game;
      if (!source) throw new Error('Could not load this case file. Try again.');
      const module = getModulePromptContext(source.killer, source.location);
      const image = await generateImage({
        gameId: source.id,
        story: (kind === 'poster' ? source.endingNarration : source.introStory)
          || source.gameHighlights || `An archived game with ${source.finalGirl} facing ${source.killer} at ${source.location}.`,
        killer: source.killer, killerDescription: getKillerDescription(source.killer),
        finalGirl: source.finalGirl, finalGirlDescription: getFinalGirlDescription(source.finalGirl),
        location: source.location, locationDescription: getLocationDescription(source.location),
        moduleVisualGuidance: module?.visualGuidance,
        scenarioRules: [getKillerNarrativeRules(source.killer), module?.rulesSummary, module?.narrativeGuidance].filter(Boolean).join('\n'),
        visualBible: source.visualBible,
        sceneType: kind === 'poster' ? 'ending' : 'beginning',
        ...(kind === 'poster' ? { outcome: source.outcome, introStory: source.introStory,
          finalGirlHealth: source.finalGirlHealth, killerHealth: isKillerUnkillable(source.killer) ? undefined : source.killerHealth,
          mission: getMissionByName(source.mission),
          referenceImageUrl: source.sceneImageUrl } : {}),
        previousImageUrl: url,
      });
      if (image) {
        onGenerated(source.id, kind === 'poster' ? { posterImageUrl: image } : { sceneImageUrl: image });
      }
    } catch (error) {
      setRecoveryError(error instanceof Error ? error.message : 'Could not recover the picture. Try again.');
    } finally { busy.current = false; setRecovering(false); }
  };

  if (hasImage) return <ImageLightbox imageUrl={url!} caption={label}>
    <button type="button" className="scrapbook-artwork-open" aria-label={`View ${label.toLowerCase()} full size`}>
      <img src={url} alt={label} className={className} loading="lazy" decoding="async" onError={() => setFailedUrl(url!)} />
    </button>
  </ImageLightbox>;

  return <div className={`scrapbook-missing-art scrapbook-missing-art--${kind}`}>
    <button type="button" onClick={() => void recover()} disabled={!isAuthenticated || isGeneratingImage || recovering || loading}
      aria-label={`Generate ${kind} picture`} title={!isAuthenticated ? 'Sign in to generate a picture' : undefined}>
      {isGeneratingImage || recovering ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
      {isGeneratingImage || recovering ? 'Developing...' : loading ? 'Loading...' : 'Generate pic'}
    </button>
    {(imageError || recoveryError) && <p role="status">{imageError || recoveryError}</p>}
    {!isAuthenticated && <span>Sign in to develop</span>}
  </div>;
}
