import {ORGANISM, ORGANISM_FINALES, organismFinale} from "@/lib/play/organism";
import { missionById } from "../../supabase/functions/_shared/play/falconwood";
import {MALL,MALL_MODULE,mallReview} from '@/lib/play/sunnydaze';
import { hunterReview, hunterReviewFacts } from '@/lib/play/hunter';
import {tormentorState} from '@/lib/play/tormentor';
import {konradState} from '@/lib/play/konrad';
import { evomorphOpeningGuidance } from '../../supabase/functions/_shared/play/evomorph';
import { moduleState as endingModuleState } from '@/lib/play/modules';
import { summarizePlay as endingSummary } from '@/lib/play/events';
import {playStoryBeats} from '@/lib/play/events';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  needsRefresh?: boolean;
  onEditRecord: () => void;
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
  initialEndingStory, initialPosterImageUrl, onCheckpoint, onEditRecord, needsRefresh,
  result,
  introStory,
  sceneImageUrl,
  visualBible,
  formData,
  onSave,
}: TheEndProps) => {
  const [endingStory, setEndingStory] = useState<string | null>(initialEndingStory ?? null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReframing, setIsReframing] = useState(false);
  const completedStoryRef = useRef(initialEndingStory ?? null);
  const [awaitingRefresh, setAwaitingRefresh] = useState(Boolean(needsRefresh));
  const [error, setError] = useState<string | null>(null);
  const [posterImageUrl, setPosterImageUrl] = useState<string>(initialPosterImageUrl ?? '');
  const { isNarrating, isPlaying, isPaused, isBuffering, isComplete, pauseResume, seek, progress, toggleNarration } = useNarration();
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
  const mounted = useRef(false);
  // Abort the ending stream when the user navigates away mid-generation.
  const streamAbortRef = useRef<AbortController | null>(null);
  const moduleContext = getModulePromptContext(result.killer, result.location);

  const evomorphGuidance=result.killer==='Evomorph'?evomorphOpeningGuidance(endingModuleState(endingSummary(result.playEvents).entries,'evomorph').stage,false):undefined;
  const mall=useMemo(()=>result.location===MALL?mallReview(endingModuleState(endingSummary(result.playEvents).entries,MALL_MODULE)):undefined,[result.location,result.playEvents]);
  const hunter=useMemo(()=>result.killer==='The Hunter'?hunterReview(endingModuleState(endingSummary(result.playEvents).entries,'hunter')):undefined,[result.killer,result.playEvents]);
  const endingVisualGuidance=[evomorphGuidance,result.killer===ORGANISM?"Depict only forms established by the recorded ending. Keep the selected location and Final Girl.":moduleContext?.visualGuidance].filter(Boolean).join('\n');
  const isWin = result.outcome === 'won';
  const grimlashReview=useMemo(()=>result.killer==='Grimlash'?(formData.grimlashReview??{loss:(endingModuleState(endingSummary(result.playEvents).entries,'grimlash').loss??'unknown') as import('@/lib/play/grimlash').GrimlashLoss}):undefined,[result.killer,result.playEvents,formData.grimlashReview]);
  const shipReview=useMemo(()=>result.location==='USS Konrad'?{fate:konradState(endingModuleState(endingSummary(result.playEvents).entries,'konrad')).fate}:undefined,[result.location,result.playEvents]);
  const falconwoodReview = result.location === "Falconwood" ? formData.falconwoodReview : undefined;
  const missionName = result.location === "Falconwood" ? result.mission ?? missionById(falconwoodReview?.mission)?.name : undefined;
  const slayerReview = result.killer === "Slayer" ? formData.slayerReview : undefined;
  const tormentorReview=useMemo(()=>result.killer==='The Tormentor'?(formData.tormentorReview??{loss:tormentorState(endingModuleState(endingSummary(result.playEvents).entries,'tormentor')).loss}):undefined,[result.killer,result.playEvents,formData.tormentorReview]);
  const fate = reviewedCharacterFate(formData.finalGirlHealth ?? undefined,shipReview,tormentorReview);
  const endingKillerHealth = hunter&&hunter.phase!=='mark-x'||result.killer==='The Intruders'||result.killer===ORGANISM||isKillerUnkillable(result.killer) ? undefined : formData.killerHealth ?? undefined;
  const organismFinaleName=result.killer===ORGANISM?organismFinale(endingSummary(result.playEvents).entries)?.killerCard:undefined;
  const organismLoss=result.killer===ORGANISM&&result.outcome==="lost"?
    (formData.organismLoss==="assimilated"?"Assimilation":formData.organismLoss==="caught"?"Caught by the Organism":formData.gameHighlights?.match(/Loss type: (Assimilation|Caught by the Organism)/)?.[1]):undefined;
  const organismLossContext=organismLoss&&[
    `The player recorded the loss as ${organismLoss}.`,
    organismLoss==="Assimilation"&&organismFinaleName&&
      `Recorded Finale: ${organismFinaleName}. Treat this as assimilation rather than assuming a conventional killing blow. ${ORGANISM_FINALES.find(card=>card.name===organismFinaleName)?.effect??""}`,
  ].filter(Boolean).join(" ");
  const { locationImages, aiEnabled } = useActiveImages();
  const background = locationImages[result.location] ?? nowPlayingBg;
  // Reserve the poster column while it develops, not just once it exists.
  const showPosterSlot = Boolean(posterImageUrl) || isGeneratingImage || Boolean(imageError) || (settingsReady && isAuthenticated && autoGenerate);

  // Auto-generate ending story on mount
  useEffect(() => {
    mounted.current = true;
    if (!initialEndingStory && !needsRefresh) void generateEnding();
    return () => { mounted.current = false; streamAbortRef.current?.abort(); };
    // Initial content belongs to this mounted record. Retry is explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.id]);

  const developPoster = useCallback(async (previousImageUrl?: string) => {
    if (!completedStoryRef.current || isGenerating || error || awaitingRefresh) return;
    const url = await generateImage({
      story: completedStoryRef.current,
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
      ...(shipReview&&{konradReview:shipReview}),
       ...(grimlashReview&&{grimlashReview}),
      ...(tormentorReview&&{tormentorReview}),
      ...(falconwoodReview && {falconwoodReview}),
      ...(slayerReview && {slayerReview}),
      introStory,
      finalGirlHealth: formData.finalGirlHealth ?? undefined,
      killerHealth: endingKillerHealth,
      mission: getMissionByName(missionName),
      ...(hunter&&{hunterReview:hunter}),
      ...(mall&&{mallReview:mall}),
      scenarioRules: [hunter&&hunterReviewFacts(hunter),result.killer===ORGANISM||result.killer==='Slayer'||result.killer==='The Hunter'||result.killer==='The Intruders'||result.killer==='Big Bad Wolf'||result.killer==='The Tormentor'||result.killer==='Evomorph'||result.killer==='Grimlash'||result.location==='Sunnydaze Mall'||result.location==='USS Konrad'||result.location==='Shady Acres'||result.location==='Storybook Woods'||result.location==='Station 2891'?playStoryBeats(result.playEvents,result):undefined, organismLossContext, evomorphGuidance, getKillerNarrativeRules(result.killer), moduleContext?.rulesSummary, moduleContext?.narrativeGuidance].filter(Boolean).join('\n'),
      gameId: result.id,
      previousImageUrl,
      draftPoster: true,
    });
    if (url && mounted.current) { setPosterImageUrl(url); checkpointRef.current({ posterImageUrl: url }); }
  }, [isGenerating, error, awaitingRefresh, hunter, mall, missionName, falconwoodReview, slayerReview, tormentorReview, shipReview, grimlashReview, result, moduleContext?.rulesSummary, moduleContext?.narrativeGuidance, introStory, sceneImageUrl, formData.finalGirlHealth, endingKillerHealth, organismLossContext, visualBible, generateImage, evomorphGuidance, endingVisualGuidance]);

  // The poster develops on its own once the ending narration lands.
  //
  // Gated on `isGenerating` clearing, not on `endingStory` appearing: the stream
  // updates the story on every token, and a poster built from the first
  // half-sentence would be worse than no poster.
  useEffect(() => {
    if (!endingStory || isGenerating || error || awaitingRefresh) return;
    if (!settingsReady || posterImageUrl || !isAuthenticated || !autoGenerate) return;
    if (autoGenerateTriggered.current) return;
    autoGenerateTriggered.current = true;
    developPoster();
  }, [endingStory, isGenerating, error, awaitingRefresh, isAuthenticated, autoGenerate, settingsReady, posterImageUrl, developPoster]);

  const generateEnding = async () => {
    setAwaitingRefresh(false);
    if (!introStory) {
      setError('Your result is saved. An opening story is needed to generate an ending.');
      return;
    }

    streamAbortRef.current?.abort();
    const abortController = new AbortController();
    streamAbortRef.current = abortController;

    setIsGenerating(true);
    setIsReframing(false);
    setEndingStory(null);
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
        mission: getMissionByName(missionName),
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
        ...(formData.finalHorrorLevel != null && { finalHorrorLevel: formData.finalHorrorLevel }),
        ...(formData.weaponUsed && { weaponUsed: formData.weaponUsed }),
        ...(formData.finalGirlHealth != null && { finalGirlHealth: formData.finalGirlHealth }),
        ...(endingKillerHealth !== undefined && { killerHealth: endingKillerHealth }),
        ...(formData.victimsSaved != null && { victimsSaved: formData.victimsSaved }),
        ...(formData.victimsKilled != null && { victimsKilled: formData.victimsKilled }),
        ...(formData.roundsPlayed != null && {roundsPlayed:formData.roundsPlayed}),
        ...(result.playEvents?.length && {playSummary:playStoryBeats(result.playEvents, result)}),
        ...(hunter&&{hunterReview:hunter}),
      ...(mall&&{mallReview:mall}),
        ...(shipReview&&{konradReview:shipReview}),
       ...(grimlashReview&&{grimlashReview}),
      ...(tormentorReview&&{tormentorReview}),
        ...(falconwoodReview && {falconwoodReview}),
        ...(slayerReview && {slayerReview}),
        ...(result.killer==='Poltergeist'&&formData.poltergeistReview&&{poltergeistReview:formData.poltergeistReview}),
        ...(formData.endingSubLocation && { endingSubLocation: formData.endingSubLocation }),
        ...((formData.gameHighlights||organismLossContext) && {gameHighlights:[formData.gameHighlights,organismLossContext].filter(Boolean).join(" ")}),
      };


      const full = await streamChatCompletion({
        functionName: 'generate-ending',
        body: {
          ...payload,
          endingStreamVersion: 1,
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
        onToken: (_delta, accumulated) => { if (!abortController.signal.aborted) setEndingStory(accumulated); },
        requireComplete: true,
        onRestart: () => { if (!abortController.signal.aborted) setIsReframing(true); },
        signal: abortController.signal,
      });

      if (abortController.signal.aborted) return;
      if (!full) throw new Error('No ending returned from the generator');
      completedStoryRef.current = full;
      checkpointRef.current({ endingStory: full, endingNeedsRefresh: false });
      setEndingStory(full);

    } catch (err) {
      // Deliberate cancellation (unmount / regenerate) is not an error state.
      if (abortController.signal.aborted) return;
      console.error('Ending generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate ending';
      setEndingStory(completedStoryRef.current);
      setError(errorMessage);
      toast.error('Ending generation failed', {
        description: errorMessage,
      });
    } finally {
      if (!abortController.signal.aborted) { setIsGenerating(false); setIsReframing(false); }
    }
  };

  const handleNarrate = () =>
    toggleNarration(endingStory, {
      kind: 'ending',
      gameId: result.id,
      outcome: result.outcome,
      filmId: getFilmIdByLocation(result.location),
    });

  const canSaveEnding = Boolean(endingStory && endingStory === completedStoryRef.current && !isGenerating && !error && !awaitingRefresh);

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
          {awaitingRefresh
            ? <button onClick={generateEnding} className="narration-button narration-button--primary">Update ending</button>
            : <button disabled={!canSaveEnding} onClick={() => onSave(endingStory!, posterImageUrl || undefined)}
                className="narration-button narration-button--primary">Save to scrapbook</button>}
          {endingStory && <button onClick={handleNarrate} disabled={isGenerating || Boolean(error)} className="narration-button narration-button--narrate">
            {isNarrating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : (isPlaying || isPaused) ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
            {isNarrating ? 'Cancel narration' : isPlaying || isPaused ? 'Stop' : 'Narrate'}
          </button>}
        </div>
        <div className="ending-record-actions">
          <button type="button" onClick={onEditRecord}>Edit record</button>
          <button type="button" onClick={() => onSave('', undefined)}>Save record only</button>
        </div>
        {isGeneratingImage && !posterImageUrl && <p className="ending-poster-save-note">The poster is developing. Wait to include it, or save the story now.</p>}
        <div className="ending-transport">{(isPlaying || isPaused) && <NarrationTransport elapsed={progress.elapsed} duration={progress.duration} paused={isPaused} buffering={isBuffering} complete={isComplete} onPauseResume={() => void pauseResume()} onSeek={seek} />}</div>
      </>}
      image={showPosterSlot ? <NarrationPhoto previewUrl={aiEnabled ? locationImages[result.location] : undefined} variant="poster" imageUrl={posterImageUrl} isGenerating={isGeneratingImage} error={imageError} onRetry={() => developPoster(posterImageUrl || undefined)} caption={`${result.finalGirl} vs ${result.killer}`} /> : undefined}
    >
      {awaitingRefresh
        ? <p className="ending-review-message" role="status">The record changed. Update the ending to reflect the new details.</p>
        : <NarrationReader kind="ending" location={result.location} story={endingStory} isGenerating={isGenerating} generatingLabel={isReframing ? 'Reframing the ending…' : undefined} error={error} onRetry={generateEnding} />}
    </NarrationLayout>
  );
};

export default TheEnd;
