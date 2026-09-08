import { useState, useEffect, useRef } from 'react';
import { ImageIcon, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { streamChatCompletion } from '@/lib/streamChatCompletion';

import { toast } from 'sonner';
import { useNarration } from '@/hooks/useNarration';
import nowPlayingBg from '@/assets/now-playing-bg.png';
import projectorSound from '@/assets/sounds/projector-start.mp3';
import { SceneImageFrame } from '@/components/SceneImageFrame';
import { NarrationTransport } from '@/components/NarrationTransport';
import { StickyOutcomeBar } from '@/components/StickyOutcomeBar';
import { ProjectorLeader } from '@/components/ProjectorLeader';
import { GameResult } from '@/hooks/useGameHistory';
import { getFilmIdByLocation } from '@/types/gameData';
import { getKillerDescription } from '@/data/killerDescriptions';
import { getFinalGirlDescription } from '@/data/finalGirlDescriptions';
import { getLocationDescription } from '@/data/locationDescriptions';
import { getFinalGirlMaxHealth } from '@/data/finalGirlHealth';
import { getKillerSpecialRules } from '@/data/killerSpecialRules';
import { getModulePromptContext } from '@/data/rules/moduleRules';
import { renderStoryText } from '@/lib/textFormatting';
import { useImageGeneration } from '@/hooks/useImageGeneration';

export interface EndingFormData {
  finalHorrorLevel: number;
  finalGirlHealth: number;
  killerHealth: number;
  weaponUsed: string;
  victimsSaved: number;
  victimsKilled: number;
  endingSubLocation: string;
  gameHighlights: string;
}

interface TheEndProps {
  result: GameResult;
  introStory?: string;
  /** This game's look description, established on Now Playing. */
  visualBible?: string;
  formData: EndingFormData;
  onSave: (endingNarration: string, posterImageUrl?: string) => void;
  onDiscard: () => void;
}

const TheEnd = ({
  result,
  introStory,
  visualBible,
  formData,
  onSave,
  onDiscard,
}: TheEndProps) => {
  const [endingStory, setEndingStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posterImageUrl, setPosterImageUrl] = useState<string>('');
  const { isNarrating, isPlaying, progress, toggleNarration } = useNarration();
  const {
    isAuthenticated,
    autoGenerate,
    generateImage,
    isGeneratingImage,
    imageError,
  } = useImageGeneration();
  const autoGenerateTriggered = useRef(false);
  // Abort the ending stream when the user navigates away mid-generation.
  const streamAbortRef = useRef<AbortController | null>(null);
  const moduleContext = getModulePromptContext(result.killer, result.location);

  const isWin = result.outcome === 'won';
  // Reserve the poster column while it develops, not just once it exists.
  const showPosterSlot = Boolean(posterImageUrl) || isGeneratingImage || Boolean(imageError);

  // Auto-generate ending story on mount
  useEffect(() => {
    generateEnding();
    return () => streamAbortRef.current?.abort();
  }, []);

  const developPoster = async (previousImageUrl?: string) => {
    if (!endingStory) return;
    const url = await generateImage({
      story: endingStory,
      killer: result.killer,
      killerDescription: getKillerDescription(result.killer),
      finalGirl: result.finalGirl,
      finalGirlDescription: getFinalGirlDescription(result.finalGirl),
      location: result.location,
      locationDescription: getLocationDescription(result.location),
      moduleVisualGuidance: moduleContext?.visualGuidance,
      // Carried over from Now Playing so the poster matches the opening still.
      visualBible,
      sceneType: 'ending',
      outcome: result.outcome,
      gameId: result.id,
      previousImageUrl,
    });
    if (url) setPosterImageUrl(url);
  };

  // The poster develops on its own once the ending narration lands.
  //
  // Gated on `isGenerating` clearing, not on `endingStory` appearing: the stream
  // updates the story on every token, and a poster built from the first
  // half-sentence would be worse than no poster.
  useEffect(() => {
    if (!endingStory || isGenerating || error) return;
    if (!isAuthenticated || !autoGenerate) return;
    if (autoGenerateTriggered.current) return;
    autoGenerateTriggered.current = true;
    developPoster();
  }, [endingStory, isGenerating, error, isAuthenticated, autoGenerate]);

  const generateEnding = async () => {
    if (!introStory) {
      setError('Missing intro story. Cannot generate ending.');
      return;
    }

    streamAbortRef.current?.abort();
    const abortController = new AbortController();
    streamAbortRef.current = abortController;

    setIsGenerating(true);
    setError(null);

    // Play projector sound effect
    const projectorAudio = new Audio(projectorSound);
    projectorAudio.volume = 0.5;
    projectorAudio.play().catch(console.error);

    try {
      // Look up character descriptions
      const killerDescription = getKillerDescription(result.killer);
      const finalGirlBackstory = getFinalGirlDescription(result.finalGirl);
      const locationDescription = getLocationDescription(result.location);
      const killerRules = getKillerSpecialRules(result.killer);
      const moduleSpecialRules = moduleContext
        ? [moduleContext.rulesSummary, moduleContext.narrativeGuidance].filter(Boolean).join('\n')
        : undefined;
      const finalGirlMaxHealth = getFinalGirlMaxHealth(result.finalGirl);

      const payload = {
        introStory,
        outcome: result.outcome,
        killer: {
          name: result.killer,
          description: killerDescription,
          ...((killerRules?.narrativeNote || moduleSpecialRules) && {
            specialRules: [killerRules?.narrativeNote, moduleSpecialRules].filter(Boolean).join('\n'),
          }),
        },
        location: {
          name: result.location,
          description: locationDescription,
          ...(moduleSpecialRules && { specialRules: moduleSpecialRules }),
        },
        finalGirl: {
          name: result.finalGirl,
          backstory: finalGirlBackstory,
        },
        // Character-specific max health so the AI can contextualise HP fractions
        finalGirlMaxHealth,
        // Game stats from form
        ...(formData.finalHorrorLevel && { finalHorrorLevel: formData.finalHorrorLevel }),
        ...(formData.weaponUsed && { weaponUsed: formData.weaponUsed }),
        ...(formData.finalGirlHealth !== undefined && { finalGirlHealth: formData.finalGirlHealth }),
        ...(formData.killerHealth !== undefined && { killerHealth: formData.killerHealth }),
        ...(formData.victimsSaved !== undefined && { victimsSaved: formData.victimsSaved }),
        ...(formData.victimsKilled !== undefined && { victimsKilled: formData.victimsKilled }),
        ...(formData.endingSubLocation && { endingSubLocation: formData.endingSubLocation }),
        ...(formData.gameHighlights && { gameHighlights: formData.gameHighlights }),
      };


      const full = await streamChatCompletion({
        functionName: 'generate-ending',
        body: payload,
        onToken: (_delta, accumulated) => setEndingStory(accumulated),
        signal: abortController.signal,
      });

      if (!full) throw new Error('No ending returned from the generator');
      setEndingStory(full);

    } catch (err) {
      // Deliberate cancellation (unmount / regenerate) is not an error state.
      if (abortController.signal.aborted) return;
      console.error('Ending generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate ending';
      setError(errorMessage);
      toast.error('Ending generation failed', {
        description: errorMessage,
      });
    } finally {
      if (!abortController.signal.aborted) setIsGenerating(false);
    }
  };

  const handleNarrate = () =>
    toggleNarration(endingStory, {
      kind: 'ending',
      outcome: result.outcome,
      filmId: getFilmIdByLocation(result.location),
    });

  const handleSave = () => {
    if (endingStory) {
      onSave(endingStory, posterImageUrl || undefined);
    }
  };

  return (
    <div className="relative min-h-[80vh]">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
          backgroundImage: `url(${nowPlayingBg})`,
          opacity: 0.4,
        }}
      />
      
      {/* Film Grain Overlay */}
      <div className="film-grain fixed inset-0 pointer-events-none opacity-[0.07]" />
      
      {/* Vignette */}
      <div className="vignette fixed inset-0 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center py-6 sm:py-8 pt-16 sm:pt-24 px-3 sm:px-6">

        {/* Title */}
        <h1 
          className={`font-display text-2xl sm:text-3xl md:text-4xl tracking-[0.1em] sm:tracking-[0.15em] uppercase mb-1 sm:mb-2 text-center ${
            isWin ? 'text-secondary neon-text' : 'text-primary blood-glow'
          }`}
        >
          The End
        </h1>
        <p className="type-label text-muted-foreground mb-6 sm:mb-8 text-center px-2">
          {result.finalGirl} {isWin ? 'survived' : 'fell to'} {result.killer} at {result.location}
        </p>

        {/* Story Container */}
        <div className="w-full max-w-7xl flex flex-col gap-4 sm:gap-6">
          {/* Action Buttons - Above text */}
          {endingStory && (
            <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 px-2 w-full sm:w-auto">
              {/* Row 1: Narrate — full width on mobile */}
              <button
                onClick={handleNarrate}
                disabled={isNarrating}
                className="vcr-tape-button flex items-center justify-center gap-2 px-4 sm:px-6 py-3 font-display text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-50 min-h-[44px] w-full sm:w-auto"
              >
                {isNarrating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                {isNarrating ? 'Generating...' : isPlaying ? 'Stop' : 'Narrate'}
              </button>
            </div>

            {isPlaying && (
              <NarrationTransport elapsed={progress.elapsed} duration={progress.duration} />
            )}
            </div>
          )}
          
          {/* Ending + Poster — same layout rules as Now Playing: side by side
              only from xl up, stacked below that, and the text fills its track
              instead of being capped in ch of a font it is not set in. The
              poster is 2:3, so it is held slightly narrower than the 3:4 still
              to keep it from running past the fold on its own. */}
          <div
            className={`w-full px-1 sm:px-0 ${
              showPosterSlot
                ? 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] gap-6 xl:gap-10'
                : 'flex justify-center'
            }`}
          >
            {showPosterSlot && (
              <div className="order-first xl:order-last w-full max-w-[460px] mx-auto xl:mx-0">
                <div className="xl:sticky xl:top-24">
                  <SceneImageFrame
                    variant="poster"
                    imageUrl={posterImageUrl}
                    isGenerating={isGeneratingImage}
                    error={imageError}
                    onRetry={() => developPoster(posterImageUrl || undefined)}
                    caption={`${result.finalGirl} vs ${result.killer}`}
                  />
                </div>
              </div>
            )}

            {/* Capped at a readable measure everywhere except the two-column
                layout, where the track itself is already the right width. */}
            <div
              className={`scenario-description p-4 sm:p-8 rounded-sm w-full max-w-[46rem] mx-auto ${
                showPosterSlot ? 'xl:max-w-none xl:mx-0' : ''
              }`}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-10 sm:py-16">
                  <ProjectorLeader label="The projector is warming up" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-4">
                  <p className="type-label text-destructive text-center px-2">
                    {error}
                  </p>
                  <button
                    onClick={generateEnding}
                    className="font-display text-xs sm:text-sm tracking-wider uppercase px-4 py-2 vcr-tape-button min-h-[44px]"
                  >
                    Try Again
                  </button>
                </div>
              ) : endingStory ? (
                <div className="story-text story-ending story-text-dark">
                  {renderStoryText(endingStory)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="type-label text-muted-foreground">
                    Waiting for the ending...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Save — docks once scrolled past, same as the outcome buttons. */}
          {endingStory && !isGenerating && !error && (
            <StickyOutcomeBar enabled={Boolean(endingStory) && !isGenerating && !error}>
              <button
                onClick={handleSave}
                className={`outcome-btn ${isWin ? 'outcome-btn-won' : 'outcome-btn-lost'} group relative w-full sm:w-auto min-w-[200px] sm:min-w-[240px] h-14 sm:h-16 overflow-hidden rounded-sm transition-all duration-200`}
              >
                <span className={`relative z-10 font-display text-xl sm:text-2xl tracking-[0.2em] uppercase ${isWin ? 'text-secondary' : 'text-primary'} drop-shadow-lg`}>
                  SAVE
                </span>
              </button>
            </StickyOutcomeBar>
          )}

        </div>
      </div>
    </div>
  );
};

export default TheEnd;
