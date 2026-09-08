import { useState, useEffect, useRef } from 'react';
import { ImageIcon, Volume2, VolumeX, Loader2, ScrollText } from 'lucide-react';
import { SpecialRulesModal, getApplicableSpecialRules } from '@/components/SpecialRulesModal';
import { getModulePromptContext } from '@/data/rules/moduleRules';
import { streamChatCompletion } from '@/lib/streamChatCompletion';

import { useNarration } from '@/hooks/useNarration';
import { getFilmDetails } from '@/types/featureFilmDetails';
import { getFilmIdByKiller, getFilmIdByLocation, getFilmIdByFinalGirl, FEATURE_FILMS } from '@/types/gameData';
import { useActiveImages } from '@/hooks/useActiveImages';
import { getKillerSpecialRules } from '@/data/killerSpecialRules';
import { getKillerDescription } from '@/data/killerDescriptions';
import { getFinalGirlDescription } from '@/data/finalGirlDescriptions';
import { getLocationDescription } from '@/data/locationDescriptions';
import { FILM_THEMES } from '@/data/filmThemes';
import { toast } from 'sonner';
import nowPlayingBg from '@/assets/now-playing-bg.png';
import projectorSound from '@/assets/sounds/projector-start.mp3';
import { SceneImageFrame } from '@/components/SceneImageFrame';
import { NarrationTransport } from '@/components/NarrationTransport';
import { StickyOutcomeBar } from '@/components/StickyOutcomeBar';
import { ProjectorLeader } from '@/components/ProjectorLeader';
import { renderStoryText } from '@/lib/textFormatting';
import { useImageGeneration } from '@/hooks/useImageGeneration';

interface NowPlayingProps {
  killer: string;
  location: string;
  finalGirl: string;
  setupScenario: string | null;
  startingEvent: string | null;
  filmId: string | null;
  onBack: () => void;
  onGameEnd: (outcome: 'won' | 'lost', story?: string, sceneImageUrl?: string, visualBible?: string) => void;
}

const NowPlaying = ({
  killer,
  location,
  finalGirl,
  setupScenario,
  startingEvent,
  filmId,
  onBack,
  onGameEnd,
}: NowPlayingProps) => {
  const film = FEATURE_FILMS.find(f => f.id === filmId);
  const theme = filmId ? FILM_THEMES[filmId] ?? null : null;
  const { locationImages } = useActiveImages();
  const bgImage = locationImages[location] ?? nowPlayingBg;

  const [story, setStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sceneImageUrl, setSceneImageUrl] = useState<string>('');
  const [visualBible, setVisualBible] = useState<string | undefined>(undefined);
  // Whether the look-book call has finished (successfully or not). The first
  // image waits for this so it is composed with the same look the poster will use.
  const [visualBibleSettled, setVisualBibleSettled] = useState(false);
  const { isNarrating, isPlaying, progress, toggleNarration } = useNarration();
  const {
    isAuthenticated,
    autoGenerate,
    generateImage,
    generateVisualBible,
    isGeneratingImage,
    imageError,
  } = useImageGeneration();
  const autoGenerateTriggered = useRef(false);
  // Stable id for this session's stored images, so a reshoot replaces the file
  // it supersedes instead of orphaning it.
  const sessionImageId = useRef(crypto.randomUUID());
  // Abort the story stream when the user navigates away mid-generation so the
  // reader loop stops and no further setState fires on an unmounted component.
  const streamAbortRef = useRef<AbortController | null>(null);
  const moduleContext = getModulePromptContext(killer, location);
  const applicableSpecialRules = getApplicableSpecialRules(killer, location);
  // Reserve the image column as soon as there is something to show there —
  // a finished still, one developing, or a failure worth retrying.
  const showImageSlot = Boolean(sceneImageUrl) || isGeneratingImage || Boolean(imageError);

  // Auto-generate story on mount
  useEffect(() => {
    generateStory();
    return () => streamAbortRef.current?.abort();
  }, []);

  // Establish this game's look before the story finishes, so the first image
  // can already reference it. Cheap enough to be fire-and-forget.
  useEffect(() => {
    if (!isAuthenticated) {
      setVisualBibleSettled(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const bible = await generateVisualBible({
        killer,
        finalGirl,
        location,
        locationDescription: getLocationDescription(location),
      });
      if (cancelled) return;
      setVisualBible(bible);
      setVisualBibleSettled(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, killer, finalGirl, location]);

  const developScene = async (previousImageUrl?: string) => {
    if (!story) return;
    const url = await generateImage({
      story,
      killer,
      killerDescription: getKillerDescription(killer),
      finalGirl,
      finalGirlDescription: getFinalGirlDescription(finalGirl),
      location,
      locationDescription: getLocationDescription(location),
      moduleVisualGuidance: moduleContext?.visualGuidance,
      visualBible,
      sceneType: 'beginning',
      gameId: sessionImageId.current,
      previousImageUrl,
    });
    if (url) setSceneImageUrl(url);
  };

  // Images generate on their own now — no API key, no button to find.
  //
  // This waits for `isGenerating` to clear rather than firing on `story`: the
  // stream sets `story` on every token, so an unguarded trigger would shoot the
  // scene from the first half-sentence of the script.
  useEffect(() => {
    if (!story || isGenerating || error) return;
    if (!isAuthenticated || !autoGenerate || !visualBibleSettled) return;
    if (autoGenerateTriggered.current) return;
    autoGenerateTriggered.current = true;
    developScene();
  }, [story, isGenerating, error, isAuthenticated, autoGenerate, visualBibleSettled]);

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

      const killerRules = getKillerSpecialRules(killer);
      const moduleSpecialRules = moduleContext
        ? [moduleContext.rulesSummary, moduleContext.narrativeGuidance].filter(Boolean).join('\n')
        : undefined;

      // Build payload with complete objects matching the edge function's StoryRequest interface
      const payload = {
        killer: {
          name: killer,
          description: killerDetails?.description || `A terrifying killer known as ${killer}.`,
          ...((killerRules?.narrativeNote || moduleSpecialRules) && {
            specialRules: [killerRules?.narrativeNote, moduleSpecialRules].filter(Boolean).join('\n'),
          }),
        },
        location: {
          name: location,
          description: locationDetails?.description || `A dangerous place called ${location}.`,
          ...(moduleSpecialRules && { specialRules: moduleSpecialRules }),
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
        body: payload,
        onToken: (_delta, accumulated) => setStory(accumulated),
        signal: abortController.signal,
      });

      if (!full) throw new Error('No story returned from the generator');
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

  const handleNarrate = () => toggleNarration(story, { kind: 'intro', filmId });

  return (
    <div
      className="relative min-h-[80vh]"
      style={theme ? {
        '--primary': theme.primary,
        '--secondary': theme.secondary,
      } as React.CSSProperties : undefined}
    >
      {/* Background Image — location-specific when available */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage})`,
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
        <p className="font-vhs text-xs text-primary/70 tracking-[0.2em] uppercase mb-1 text-center">
          Now Playing
        </p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground tracking-[0.1em] sm:tracking-[0.15em] uppercase mb-1 sm:mb-1 text-center">
          {film?.name ?? 'Now Playing'}
        </h1>
        {theme?.tagline && (
          <p className="font-vhs text-xs text-muted-foreground/70 italic mb-2 text-center px-4">
            {theme.tagline}
          </p>
        )}
        <p className="font-vhs text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 text-center px-2">
          {killer} vs {finalGirl} at {location}
        </p>

        {/* Story Container */}
        <div className="w-full max-w-7xl flex flex-col gap-4 sm:gap-6">
          {/* Action Buttons — Reshoot now lives on the film frame itself */}
          {story && (
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

              {/* Special Rules — only when killer/location has dedicated rules */}
              {applicableSpecialRules.length > 0 && (
                <SpecialRulesModal killer={killer} location={location}>
                  <button className="vcr-tape-button flex items-center justify-center gap-2 px-4 sm:px-6 py-3 font-display text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all duration-300 min-h-[44px] w-full sm:w-auto">
                    <ScrollText className="w-4 h-4 shrink-0" />
                    <span>Special Rules</span>
                  </button>
                </SpecialRulesModal>
              )}
            </div>

            {isPlaying && (
              <NarrationTransport elapsed={progress.elapsed} duration={progress.duration} />
            )}
            </div>
          )}
          
          {/* Story + Still — the still sticks alongside the story on desktop
              rather than stranding an empty column beside it, and leads on
              mobile so it is not buried under a thousand words. */}
          <div
            className={`w-full px-1 sm:px-0 ${
              showImageSlot
                ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] gap-6 lg:gap-10'
                : 'flex justify-center'
            }`}
          >
            {showImageSlot && (
              <div className="order-first lg:order-last w-full max-w-[440px] mx-auto lg:mx-0">
                <div className="lg:sticky lg:top-24">
                  <SceneImageFrame
                    variant="scene"
                    imageUrl={sceneImageUrl}
                    isGenerating={isGeneratingImage}
                    error={imageError}
                    onRetry={() => developScene(sceneImageUrl || undefined)}
                    caption={`Reel 01 · ${location}`}
                  />
                </div>
              </div>
            )}

            <div className="scenario-description p-4 sm:p-8 rounded-sm w-full max-w-[68ch]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-10 sm:py-16">
                  <ProjectorLeader label="The projector is warming up" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-4">
                  <p className="font-vhs text-xs sm:text-sm text-destructive text-center px-2">
                    {error}
                  </p>
                  <button
                    onClick={generateStory}
                    className="font-display text-xs sm:text-sm tracking-wider uppercase px-4 py-2 vcr-tape-button min-h-[44px]"
                  >
                    Try Again
                  </button>
                </div>
              ) : story ? (
                <div className="story-text story-intro story-text-dark">
                  {renderStoryText(story)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="font-vhs text-sm text-muted-foreground">
                    Waiting for the story...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Outcome — also docks to the viewport once scrolled past, so the
              end of a two-hour game is never a scroll hunt. */}
          {story && !isGenerating && !error && (
            <StickyOutcomeBar enabled={Boolean(story) && !isGenerating && !error}>
              <button
                onClick={() => onGameEnd('won', story || undefined, sceneImageUrl || undefined, visualBible)}
                className="outcome-btn outcome-btn-won group relative w-full sm:w-auto min-w-[200px] sm:min-w-[240px] h-14 sm:h-16 overflow-hidden rounded-sm transition-all duration-200"
              >
                <span className="relative z-10 font-display text-xl sm:text-2xl tracking-[0.2em] uppercase text-secondary drop-shadow-lg">
                  WON
                </span>
              </button>

              <button
                onClick={() => onGameEnd('lost', story || undefined, sceneImageUrl || undefined, visualBible)}
                className="outcome-btn outcome-btn-lost group relative w-full sm:w-auto min-w-[200px] sm:min-w-[240px] h-14 sm:h-16 overflow-hidden rounded-sm transition-all duration-200"
              >
                <span className="relative z-10 font-display text-xl sm:text-2xl tracking-[0.2em] uppercase text-primary drop-shadow-lg">
                  LOST
                </span>
              </button>
            </StickyOutcomeBar>
          )}

        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
