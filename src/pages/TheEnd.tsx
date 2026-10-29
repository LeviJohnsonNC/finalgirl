import {konradState} from '@/lib/play/konrad';
import { evomorphOpeningGuidance } from '../../supabase/functions/_shared/play/evomorph';
import { moduleState as endingModuleState } from '@/lib/play/modules';
import { summarizePlay as endingSummary } from '@/lib/play/events';
import {playStoryBeats} from '@/lib/play/events';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { streamChatCompletion } from '@/lib/streamChatCompletion';

import { toast } from 'sonner';
import { useNarration } from '@/hooks/useNarration';
import nowPlayingBg from '@/assets/now-playing-bg.png';
import projectorSound from '@/assets/sounds/projector-start.mp3';
import { NarrationPhoto } from '@/components/NarrationPhoto';
import { NarrationTransport } from '@/components/NarrationTransport';
import { NarrationLayout, NarrationReader, NarrationTitle } from '@/components/NarrationLayout';
import { useActiveImages } from '@/hooks/useActiveImages';
import { GameResult } from '@/hooks/useGameHistory';
import { getFilmIdByLocation, getFilmIdByFinalGirl } from '@/types/gameData';
import { getFilmDetails } from '@/types/featureFilmDetails';
import { getKillerDescription } from '@/data/killerDescriptions';
import { getFinalGirlDescription } from '@/data/finalGirlDescriptions';
import { getLocationDescription } from '@/data/locationDescriptions';
import { reviewedCharacterFate } from '../../supabase/functions/_shared/storyFacts';
import { getMissionByName } from '@/data/falconwoodMissions';
import { isKillerUnkillable } from '@/data/killerHealth';
import { getLegacyFinalGirlHealth } from '@/data/finalGirlHealth';
import { getKillerNarrativeRules } from '@/data/killerSpecialRules';
import { getStoryRequestRules } from '@/lib/storyRequestContext';
import { getModulePromptContext } from '@/data/rules/moduleRules';
import { useImageGeneration } from '@/hooks/useImageGeneration';

import type { EndingFormData, ActiveGame } from '@/lib/activeGame';
export type { EndingFormData } from '@/lib/activeGame';

interface TheEndProps {
  initialEndingStory?: string;
  initialPosterImageUrl?: string;
  onCheckpoint: (updates: Partial<ActiveGame>) => void;
  result: GameResult;
  introStory?: string;
  sceneImageUrl?: string;
  /** This game's look description, established on Now Playing. */
  visualBible?: string;
  formData: EndingFormData;
  onSave: (endingNarration: string, posterImageUrl?: string) => void;
}

const TheEnd = ({
  initialEndingStory, initialPosterImageUrl, onCheckpoint,
  result,
  introStory,
  sceneImageUrl,
  visualBible,
  formData,
  onSave,
}: TheEndProps) => {
  const [endingStory, setEndingStory] = useState<string | null>(initialEndingStory ?? null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posterImageUrl, setPosterImageUrl] = useState<string>(initialPosterImageUrl ?? '');
  const { isNarrating, isPlaying, progress, toggleNarration } = useNarration();
  const {
    isAuthenticated,
    autoGenerate,
    settingsReady,
    generateImage,
    isGeneratingImage,
    imageError,
  } = useImageGeneration();
  const checkpointRef = useRef(onCheckpoint);
  checkpointRef.current = onCheckpoint;
  const autoGenerateTriggered = useRef(false);
  // Abort the ending stream when the user navigates away mid-generation.
  const streamAbortRef = useRef<AbortController | null>(null);
  const moduleContext = getModulePromptContext(result.killer, result.location);

  const evomorphGuidance=result.killer==='Evomorph'?evomorphOpeningGuidance(endingModuleState(endingSummary(result.playEvents).entries,'evomorph').stage,false):undefined;
  const endingVisualGuidance=[evomorphGuidance,moduleContext?.visualGuidance].filter(Boolean).join('\n');
  const isWin = result.outcome === 'won';
  const shipReview=result.location==='USS Konrad'?{fate:konradState(endingModuleState(endingSummary(result.playEvents).entries,'konrad')).fate}:undefined;
  const fate = reviewedCharacterFate(formData.finalGirlHealth,shipReview);
  const endingKillerHealth = isKillerUnkillable(result.killer) ? undefined : formData.killerHealth;
  const { locationImages } = useActiveImages();
  const background = locationImages[result.location] ?? nowPlayingBg;
  // Reserve the poster column while it develops, not just once it exists.
  const showPosterSlot = Boolean(posterImageUrl) || isGeneratingImage || Boolean(imageError) || (settingsReady && isAuthenticated && autoGenerate);

  // Auto-generate ending story on mount
  useEffect(() => {
    if (!initialEndingStory) void generateEnding();
    return () => streamAbortRef.current?.abort();
    // Initial content belongs to this mounted record. Retry is explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.id]);

  const developPoster = useCallback(async (previousImageUrl?: string) => {
    if (!endingStory) return;
    const url = await generateImage({
      story: endingStory,
      killer: result.killer,
      killerDescription: evomorphGuidance ?? getKillerDescription(result.killer),
      finalGirl: result.finalGirl,
      finalGirlDescription: getFinalGirlDescription(result.finalGirl),
      location: result.location,
      locationDescription: getLocationDescription(result.location),
      moduleVisualGuidance: endingVisualGuidance,
      // Carried over from Now Playing so the poster matches the opening still.
      visualBible,
      sceneType: 'ending',
      referenceImageUrl: sceneImageUrl ?? result.sceneImageUrl,
      outcome: result.outcome,
      introStory,
      finalGirlHealth: formData.finalGirlHealth,
      killerHealth: endingKillerHealth,
      mission: getMissionByName(result.mission),
      scenarioRules: [result.killer==='Evomorph'||result.location==='USS Konrad'?playStoryBeats(result.playEvents,result):undefined, evomorphGuidance, getKillerNarrativeRules(result.killer), moduleContext?.rulesSummary, moduleContext?.narrativeGuidance].filter(Boolean).join('\n'),
      gameId: result.id,
      previousImageUrl,
    });
    if (url) { setPosterImageUrl(url); checkpointRef.current({ posterImageUrl: url }); }
  }, [endingStory, result, result.killer, result.finalGirl, result.location, result.outcome, result.id, moduleContext?.visualGuidance, moduleContext?.rulesSummary, moduleContext?.narrativeGuidance, introStory, sceneImageUrl, result.sceneImageUrl, result.mission, formData.finalGirlHealth, endingKillerHealth, visualBible, generateImage, evomorphGuidance, endingVisualGuidance]);

  // The poster develops on its own once the ending narration lands.
  //
  // Gated on `isGenerating` clearing, not on `endingStory` appearing: the stream
  // updates the story on every token, and a poster built from the first
  // half-sentence would be worse than no poster.
  useEffect(() => {
    if (!endingStory || isGenerating || error) return;
    if (!settingsReady || posterImageUrl || !isAuthenticated || !autoGenerate) return;
    if (autoGenerateTriggered.current) return;
    autoGenerateTriggered.current = true;
    developPoster();
  }, [endingStory, isGenerating, error, isAuthenticated, autoGenerate, settingsReady, posterImageUrl, developPoster]);

  const generateEnding = async () => {
    if (!introStory) {
      setError('Your result is saved. An opening story is needed to generate an ending.');
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
      const killerDescription = evomorphGuidance ?? getKillerDescription(result.killer);
      const finalGirlFilmId = getFilmIdByFinalGirl(result.finalGirl);
      const finalGirlBackstory = (finalGirlFilmId
        ? getFilmDetails(finalGirlFilmId)?.finalGirls.find(girl => girl.name === result.finalGirl)?.backstory
        : undefined) ?? getFinalGirlDescription(result.finalGirl);
      const locationDescription = getLocationDescription(result.location);
      const { killerRules, locationRules } = getStoryRequestRules(result.killer, result.location);
      const finalGirlMaxHealth = result.finalGirlMaxHealth ?? getLegacyFinalGirlHealth(result.finalGirl);

      const payload = {
        mission: getMissionByName(result.mission),
        introStory,
        outcome: result.outcome,
        killer: {
          name: result.killer,
          description: killerDescription,
          ...(killerRules && { specialRules: killerRules }),
        },
        location: {
          name: result.location,
          description: locationDescription,
          ...(locationRules && { specialRules: locationRules }),
        },
        finalGirl: {
          name: result.finalGirl,
          backstory: finalGirlBackstory,
        },
        // Character-specific max health so the AI can contextualise HP fractions
        finalGirlMaxHealth,
        // Game stats from form
        ...(formData.finalHorrorLevel !== undefined && { finalHorrorLevel: formData.finalHorrorLevel }),
        ...(formData.weaponUsed && { weaponUsed: formData.weaponUsed }),
        ...(formData.finalGirlHealth !== undefined && { finalGirlHealth: formData.finalGirlHealth }),
        ...(endingKillerHealth !== undefined && { killerHealth: endingKillerHealth }),
        ...(formData.victimsSaved != null && { victimsSaved: formData.victimsSaved }),
        ...(formData.victimsKilled != null && { victimsKilled: formData.victimsKilled }),
        ...(formData.roundsPlayed != null && {roundsPlayed:formData.roundsPlayed}),
        ...(result.playEvents?.length && {playSummary:playStoryBeats(result.playEvents, result)}),
        ...(shipReview&&{konradReview:shipReview}),
        ...(result.killer==='Poltergeist'&&formData.poltergeistReview&&{poltergeistReview:formData.poltergeistReview}),
        ...(formData.endingSubLocation && { endingSubLocation: formData.endingSubLocation }),
        ...(formData.gameHighlights && { gameHighlights: formData.gameHighlights }),
      };


      const full = await streamChatCompletion({
        functionName: 'generate-ending',
        body: {
          ...payload,
          evaluation: {
            gameId: result.id,
            context: {
              selection: {
                killer: result.killer, location: result.location, finalGirl: result.finalGirl,
                setupScenario: result.setupScenario, startingEvent: result.startingEvent,
                mission: result.mission, finalGirlMaxHealth,
              },
              playEvents: result.playEvents ?? [],
              reviewedResult: formData,
            },
          },
        },
        onToken: (_delta, accumulated) => setEndingStory(accumulated),
        signal: abortController.signal,
      });

      if (!full) throw new Error('No ending returned from the generator');
      checkpointRef.current({ endingStory: full });
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
      gameId: result.id,
      outcome: result.outcome,
      filmId: getFilmIdByLocation(result.location),
    });

  const handleSave = () => {
    onSave(!isGenerating && !error ? endingStory ?? '' : '', posterImageUrl || undefined);
  };

  return (
    <NarrationLayout
      background={background}
      kind="ending"
      heading={<>
        <NarrationTitle title="The End" ending />
        <p className={`narration-outcome ${isWin ? 'narration-outcome--won' : 'narration-outcome--lost'}`}>{isWin ? fate === 'died' ? 'Victory came at a terrible cost.' : fate === 'survived' ? 'She survived the night.' : 'The night is over. The cost remains.' : fate === 'survived' ? 'Alive. But the night was lost.' : 'Not every story ends with a survivor.'}</p>
      </>}
      controls={<>
        <div className="ending-actions">
          <button onClick={handleSave} className="narration-button narration-button--primary">{endingStory && !isGenerating && !error ? 'SAVE' : 'SAVE RESULT'}</button>
          {endingStory && <button onClick={handleNarrate} disabled={isNarrating || isGenerating} className="narration-button narration-button--narrate">
            {isNarrating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : isPlaying ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
            {isNarrating ? 'Generating...' : isPlaying ? 'Stop' : 'Narrate'}
          </button>}
        </div>
        <div className="ending-transport">{isPlaying && <NarrationTransport elapsed={progress.elapsed} duration={progress.duration} />}</div>
      </>}
      image={showPosterSlot ? <NarrationPhoto variant="poster" imageUrl={posterImageUrl} isGenerating={isGeneratingImage} error={imageError} onRetry={() => developPoster(posterImageUrl || undefined)} caption={`${result.finalGirl} vs ${result.killer}`} /> : undefined}
    >
      <NarrationReader kind="ending" story={endingStory} isGenerating={isGenerating} error={error} onRetry={generateEnding} />
    </NarrationLayout>
  );
};

export default TheEnd;
