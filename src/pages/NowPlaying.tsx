import {marrekOpeningGuidance} from '@/lib/play/marrekWarehouse';
import {tormentorOpeningGuidance} from '@/lib/play/tormentor';
import { evomorphOpeningGuidance } from '../../supabase/functions/_shared/play/evomorph';
import { moduleState as openingModuleState } from '@/lib/play/modules';
import { summarizePlay as openingSummary } from '@/lib/play/events';
import {DeathSceneDialog} from '@/components/play/DeathSceneDialog';
import { PlayScreen } from '@/components/play/PlayScreen';
import { SessionOptions } from '@/components/SessionOptions';
import { ModuleControls } from '@/components/play/ModuleControls';
import { validModuleObservation, moduleState } from '@/lib/play/modules';
import { newPlayEvent, summarizePlay, type PlayDetails, type PlayEvent } from '@/lib/play/events';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Loader2, ScrollText } from 'lucide-react';
import { SpecialRulesModal, getApplicableSpecialRules } from '@/components/SpecialRulesModal';
import { getModulePromptContext } from '@/data/rules/moduleRules';
import { getMissionByName } from '@/data/falconwoodMissions';
import { streamChatCompletion } from '@/lib/streamChatCompletion';

import { useNarration } from '@/hooks/useNarration';
import { getFilmDetails } from '@/types/featureFilmDetails';
import { getFilmIdByKiller, getFilmIdByLocation, getFilmIdByFinalGirl, FEATURE_FILMS } from '@/types/gameData';
import { useActiveImages } from '@/hooks/useActiveImages';
import { getKillerNarrativeRules } from '@/data/killerSpecialRules';
import { getStoryRequestRules } from '@/lib/storyRequestContext';
import { getKillerDescription } from '@/data/killerDescriptions';
import { getFinalGirlDescription } from '@/data/finalGirlDescriptions';
import { getLocationDescription } from '@/data/locationDescriptions';
import { toast } from 'sonner';
import nowPlayingBg from '@/assets/now-playing-bg.png';
import projectorSound from '@/assets/sounds/projector-start.mp3';
import { NarrationPhoto } from '@/components/NarrationPhoto';
import { NarrationTransport } from '@/components/NarrationTransport';
import { NarrationLayout, NarrationReader, NarrationTitle } from '@/components/NarrationLayout';
import { useImageGeneration } from '@/hooks/useImageGeneration';

import type { ActiveGame } from '@/lib/activeGame';
import { parseVisualBible } from '../../supabase/functions/_shared/prompts';

interface NowPlayingProps {
  marrekFreshSetup?: boolean;
  tormentorFreshSetup?: boolean;
  evomorphFreshSetup?: boolean;
  playSyncBlocked?: boolean;
  onDiscard?: () => void;
  sessionId: string;
  playEvents?: PlayEvent[];
  playMode?: boolean;
  playDrafts?: Record<string, PlayDetails>;
  showDeathPanel?: boolean;
  getPlayEvents?: () => PlayEvent[];
  syncPlayNow?: ()=>Promise<boolean>;
  onPlayEvent?: (event: PlayEvent) => boolean;
  initialStory?: string;
  initialSceneImageUrl?: string;
  initialVisualBible?: string;
  onCheckpoint: (updates: Partial<ActiveGame>) => boolean | void;
  killer: string;
  location: string;
  finalGirl: string;
  finalGirlStartingHealth?: number;
  setupScenario: string | null;
  startingEvent: string | null;
  /** Falconwood only: the Mission that must be completed to win. */
  mission?: string | null;
  filmId: string | null;
  onBack: () => void;
  onGameEnd: (outcome: 'won' | 'lost', story?: string, sceneImageUrl?: string, visualBible?: string) => void;
}

const NowPlaying = ({
  playEvents = [], playDrafts = {}, playMode = false, showDeathPanel = true, syncPlayNow, getPlayEvents, onPlayEvent, playSyncBlocked=false,
  marrekFreshSetup=false,tormentorFreshSetup=false,evomorphFreshSetup=false,
  sessionId, initialStory, initialSceneImageUrl, initialVisualBible, onCheckpoint, onDiscard,
  killer,
  location,
  finalGirl,
  finalGirlStartingHealth,
  setupScenario,
  startingEvent,
  mission,
  filmId,
  onBack,
  onGameEnd,
}: NowPlayingProps) => {
  const film = FEATURE_FILMS.find(f => f.id === filmId);
  const { locationImages } = useActiveImages();
  const bgImage = locationImages[location] ?? nowPlayingBg;

  const [deathEventId,setDeathEventId]=useState<string|null>(null);
  const [story, setStory] = useState<string | null>(initialStory ?? null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sceneImageUrl, setSceneImageUrl] = useState<string>(initialSceneImageUrl ?? '');
  const [visualBible, setVisualBible] = useState<string | undefined>(() => parseVisualBible(initialVisualBible));
  // Whether the look-book call has finished (successfully or not). The first
  // image waits for this so it is composed with the same look the poster will use.
  const [visualBibleSettled, setVisualBibleSettled] = useState(false);
  const { isNarrating, isPlaying, progress, toggleNarration } = useNarration();
  const {
    isAuthenticated,
    autoGenerate,
    settingsReady,
    generateImage,
    generateVisualBible,
    isGeneratingImage,
    imageError,
  } = useImageGeneration();
  const autoGenerateTriggered = useRef(false);
  // Stable id for this session's stored images, so a reshoot replaces the file
  // it supersedes instead of orphaning it.
  const sessionImageId = useRef(sessionId);
  const checkpointRef = useRef(onCheckpoint);
  checkpointRef.current = onCheckpoint;
  // Abort the story stream when the user navigates away mid-generation so the
  // reader loop stops and no further setState fires on an unmounted component.
  const streamAbortRef = useRef<AbortController | null>(null);
  const moduleContext = getModulePromptContext(killer, location);
  const evomorphGuidance=killer==='Evomorph'?evomorphOpeningGuidance(openingModuleState(openingSummary(playEvents).entries,'evomorph').stage,evomorphFreshSetup&&!playEvents.some(e=>e.moduleData?.module==='evomorph')):undefined;
  const marrekOpening=location==='Marrek Warehouse'?(marrekFreshSetup?'fresh-v1' as const:'legacy-unknown' as const):undefined;
  const marrekGuidance=marrekOpening?marrekOpeningGuidance(marrekOpening):undefined;
  const tormentorOpening=killer==='The Tormentor'?(tormentorFreshSetup?'fresh-v1' as const:'legacy-unknown' as const):undefined;
  const tormentorGuidance=tormentorOpening?tormentorOpeningGuidance(tormentorOpening):undefined;
  const visualGuidance=[marrekGuidance,tormentorGuidance,evomorphGuidance,moduleContext?.visualGuidance].filter(Boolean).join('\n');
  const missionData = getMissionByName(mission);
  const applicableSpecialRules = getApplicableSpecialRules(killer, location);
  // Reserve the image column as soon as there is something to show there —
  // a finished still, one developing, or a failure worth retrying.
  const showImageSlot = Boolean(sceneImageUrl) || isGeneratingImage || Boolean(imageError);

  // Auto-generate story on mount
  useEffect(() => {
    if (!initialStory) void generateStory();
    return () => streamAbortRef.current?.abort();
    // A mounted screen is keyed by the persisted session id. Retry is explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Establish this game's look before the story finishes, so the first image
  // can already reference it. Cheap enough to be fire-and-forget.
  useEffect(() => {
    if (!settingsReady) return;
    if (!isAuthenticated || !autoGenerate || parseVisualBible(initialVisualBible)) { setVisualBibleSettled(true); return; }
    let cancelled = false;
    (async () => {
      const bible = await generateVisualBible({
        ...(tormentorOpening&&{tormentorOpening}),
        ...(marrekOpening&&{marrekOpening}),
        killer,
        killerDescription: evomorphGuidance ?? getKillerDescription(killer),
        finalGirl,
        finalGirlDescription: getFinalGirlDescription(finalGirl),
        location,
        moduleVisualGuidance: visualGuidance,
        locationDescription: getLocationDescription(location),
      });
      if (cancelled) return;
      const completeBible = parseVisualBible(bible);
      setVisualBible(completeBible);
      checkpointRef.current({ visualBible: completeBible });
      setVisualBibleSettled(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, autoGenerate, settingsReady, initialVisualBible, killer, finalGirl, location, generateVisualBible, marrekOpening, tormentorOpening, evomorphGuidance, visualGuidance]);

  const developScene = useCallback(async (previousImageUrl?: string) => {
    if (!story) return;
    const url = await generateImage({
      ...(tormentorOpening&&{tormentorOpening}),
        ...(marrekOpening&&{marrekOpening}),
      story,
      killer,
      killerDescription: evomorphGuidance ?? getKillerDescription(killer),
      finalGirl,
      finalGirlDescription: getFinalGirlDescription(finalGirl),
      location,
      locationDescription: getLocationDescription(location),
      moduleVisualGuidance: visualGuidance,
      visualBible,
      sceneType: 'beginning',
      mission: getMissionByName(mission),
      scenarioRules: [tormentorGuidance,evomorphGuidance, getKillerNarrativeRules(killer), moduleContext?.rulesSummary, moduleContext?.narrativeGuidance].filter(Boolean).join('\n'),
      gameId: sessionImageId.current,
      previousImageUrl,
    });
    if (url) { setSceneImageUrl(url); checkpointRef.current({ sceneImageUrl: url }); }
  }, [story, killer, finalGirl, location, moduleContext?.rulesSummary, moduleContext?.narrativeGuidance, mission, visualBible, generateImage, marrekOpening, tormentorOpening, tormentorGuidance, evomorphGuidance, visualGuidance]);

  // Images generate on their own now — no API key, no button to find.
  //
  // This waits for `isGenerating` to clear rather than firing on `story`: the
  // stream sets `story` on every token, so an unguarded trigger would shoot the
  // scene from the first half-sentence of the script.
  useEffect(() => {
    if (!story || isGenerating || error) return;
    if (!settingsReady || sceneImageUrl || !isAuthenticated || !autoGenerate || !visualBibleSettled) return;
    if (autoGenerateTriggered.current) return;
    autoGenerateTriggered.current = true;
    developScene();
  }, [story, isGenerating, error, isAuthenticated, autoGenerate, settingsReady, sceneImageUrl, visualBibleSettled, developScene]);

  const generateStory = async () => {
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
      // Look up each entity from its OWN film (supports cross-film combinations)
      const killerFilmId = getFilmIdByKiller(killer);
      const locationFilmId = getFilmIdByLocation(location);
      const finalGirlFilmId = getFilmIdByFinalGirl(finalGirl);

      const killerFilmDetails = killerFilmId ? getFilmDetails(killerFilmId) : null;
      const locationFilmDetails = locationFilmId ? getFilmDetails(locationFilmId) : null;
      const finalGirlFilmDetails = finalGirlFilmId ? getFilmDetails(finalGirlFilmId) : null;

      const killerDetails = killerFilmDetails?.killer;
      const locationDetails = locationFilmDetails?.location;
      const finalGirlDetails = finalGirlFilmDetails?.finalGirls?.find(fg => fg.name === finalGirl);

      const { killerRules, locationRules } = getStoryRequestRules(killer, location);

      // Build payload with complete objects matching the edge function's StoryRequest interface
      const payload = {
        mission: missionData,
        ...(tormentorOpening&&{tormentorOpening}),
        ...(marrekOpening&&{marrekOpening}),
        killer: {
          name: killer,
          description: killerDetails?.description || `A terrifying killer known as ${killer}.`,
          ...((killerRules||evomorphGuidance) && { specialRules: [tormentorGuidance,evomorphGuidance,killerRules].filter(Boolean).join('\n') }),
        },
        location: {
          name: location,
          description: locationDetails?.description || `A dangerous place called ${location}.`,
          ...(locationRules && { specialRules: locationRules }),
        },
        finalGirl: {
          name: finalGirl,
          backstory: finalGirlDetails?.backstory || `A survivor named ${finalGirl}.`
        },
        startingEvent: startingEvent ? {
          name: startingEvent,
          description: locationDetails?.events?.find(e => e.name === startingEvent)?.description || startingEvent
        } : undefined,
        startingSetup: setupScenario ? {
          name: setupScenario,
          description: locationDetails?.setupCards?.find(s => s.name === setupScenario)?.description || setupScenario
        } : undefined
      };


      const full = await streamChatCompletion({
        functionName: 'generate-story',
        body: {
          ...payload,
          evaluation: {
            gameId: sessionId,
            context: {
              selection: { killer, location, finalGirl, setupScenario, startingEvent, mission, filmId },
              playEvents,
            },
          },
        },
        onToken: (_delta, accumulated) => setStory(accumulated),
        signal: abortController.signal,
      });

      if (!full) throw new Error('No story returned from the generator');
      checkpointRef.current({ introStory: full });
      setStory(full);

    } catch (err) {
      // Deliberate cancellation (unmount / regenerate) is not an error state.
      if (abortController.signal.aborted) return;
      console.error('Story generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate story';
      setError(errorMessage);
      toast.error('Story generation failed', {
        description: errorMessage,
      });
    } finally {
      if (!abortController.signal.aborted) setIsGenerating(false);
    }
  };

  const handleNarrate = () => toggleNarration(story, { kind: 'intro', filmId, gameId: sessionId });

  const recordPlayEvent = (event:PlayEvent) => {
    if (!onPlayEvent?.(event)) return false;
    if (event.kind==='killed' && showDeathPanel) setDeathEventId(event.id);
    return true;
  };
  const saveDraft = (id: string, draft: PlayDetails) => {
    if (JSON.stringify(playDrafts[id]) === JSON.stringify(draft)) return true;
    return onCheckpoint({playDrafts: {[id]: draft}}) !== false;
  };
  const finishPlay = (outcome: 'won' | 'lost') => {
    const entries = summarizePlay(playEvents).entries;
    for (const [id, draft] of Object.entries(playDrafts)) {
      if (id.startsWith('module:') && draft.detail !== undefined) {
        const [,module,key] = id.split(':');
        const observation = {module, changes:{[key]:draft.detail.trim() || null}};
        if (validModuleObservation(observation) && moduleState(entries, observation.module)[key] !== observation.changes[key]) {
          if (!onPlayEvent?.(newPlayEvent({kind:'module', moduleData:observation}))) return;
        }
        continue;
      }
      const entry = entries.find(e => e.id === id);
      if (!entry) continue;
      const changed = entry.kind === 'moment' ? (draft.detail !== undefined && draft.detail !== entry.detail) || (draft.killerCard !== undefined && draft.killerCard !== entry.killerCard)
        : entry.kind === 'killed' && Object.entries(draft).some(([key, value]) => value !== (entry[key as keyof PlayEvent] ?? (key === 'cause' ? 'unspecified' : '')));
      if (changed && !onPlayEvent?.(newPlayEvent({kind: 'details', target: id, ...draft}))) return;
    }
    onGameEnd(outcome, !isGenerating && !error ? story || undefined : undefined, sceneImageUrl || undefined, visualBible);
  };
  if (playMode && onPlayEvent) return <PlayScreen killer={killer} location={location} finalGirl={finalGirl} finalGirlStartingHealth={finalGirlStartingHealth}
    imageUrl={sceneImageUrl || bgImage} events={playEvents} onEvent={recordPlayEvent}
    onExit={() => onCheckpoint({ playMode: false })}
    onFinish={finishPlay}
    onDiscard={onDiscard}
    onNarrate={handleNarrate} narrationBusy={isNarrating} narrationPlaying={isPlaying} hasStory={Boolean(story)}
    showDeathDetails={showDeathPanel} onShowDeathDetails={enabled => onCheckpoint({showDeathPanel: enabled})}
    drafts={playDrafts} onDraft={saveDraft}
    moduleControls={<ModuleControls setupScenario={setupScenario} startingEvent={startingEvent} sessionId={sessionId} killer={killer} location={location} finalGirl={finalGirl} events={playEvents} onEvent={recordPlayEvent} blocked={playSyncBlocked} />}
    deathPanel={deathEventId && syncPlayNow ? <DeathSceneDialog key={deathEventId} sessionId={sessionId} selection={{killer,location,finalGirl}} events={playEvents} getEvents={getPlayEvents} eventId={deathEventId} draft={playDrafts[deathEventId]} onDraft={saveDraft} onClose={()=>setDeathEventId(null)} onEvent={onPlayEvent} syncNow={syncPlayNow}/> : undefined}
    onDeath={event=>setDeathEventId(event.id)}/>;

  return (
    <NarrationLayout
      background={bgImage}
      kind="opening"
      heading={<>
        <NarrationTitle title={film?.name ?? 'Now Playing'} />
        {missionData && <details className="narration-mission">
          <summary>Mission · {missionData.name}</summary>
          <p>{missionData.description}</p>
        </details>}
      </>}
      controls={<>
        {onPlayEvent && <button onClick={() => onCheckpoint({ playMode: true })} className="narration-button narration-button--primary">Enter Play mode</button>}
        <div className="narration-control-row">
          {story && <button onClick={handleNarrate} disabled={isNarrating || isGenerating} className="narration-button narration-button--narrate">
            {isNarrating ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isNarrating ? 'Generating...' : isPlaying ? 'Stop' : 'Narrate'}
          </button>}
          {applicableSpecialRules.length > 0 && <SpecialRulesModal killer={killer} location={location}>
            <button className="narration-button narration-button--quiet"><ScrollText className="w-4 h-4 shrink-0" /><span>Special Rules</span></button>
          </SpecialRulesModal>}
          {onDiscard && <SessionOptions onDiscard={onDiscard} />}
        </div>
        {isPlaying && <NarrationTransport elapsed={progress.elapsed} duration={progress.duration} />}
      </>}
      image={showImageSlot ? <NarrationPhoto variant="scene" imageUrl={sceneImageUrl} isGenerating={isGeneratingImage} error={imageError} onRetry={() => developScene(sceneImageUrl || undefined)} caption={`Reel 01 · ${location}`} /> : undefined}
    >
      <NarrationReader kind="opening" story={story} isGenerating={isGenerating} error={error} onRetry={generateStory} actions={<>
        <span className="narration-result-label">Record result</span>
        <div className="narration-result-buttons">
          <button className="narration-result narration-result--won" onClick={() => onGameEnd('won', !isGenerating && !error ? story || undefined : undefined, sceneImageUrl || undefined, visualBible)}>WON</button>
          <button className="narration-result narration-result--lost" onClick={() => onGameEnd('lost', !isGenerating && !error ? story || undefined : undefined, sceneImageUrl || undefined, visualBible)}>LOST</button>
        </div>
      </>} />
    </NarrationLayout>
  );
};

export default NowPlaying;
