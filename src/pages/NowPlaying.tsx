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
import { ImagePromptModal } from '@/components/ImagePromptModal';
import { ImageUploadSlot } from '@/components/ImageUploadSlot';
import { renderStoryText } from '@/lib/textFormatting';
import SceneImageControls from '@/components/SceneImageControls';
import { useImageGeneration } from '@/hooks/useImageGeneration';

interface NowPlayingProps {
  killer: string;
  location: string;
  finalGirl: string;
  setupScenario: string | null;
  startingEvent: string | null;
  filmId: string | null;
  onBack: () => void;
  onGameEnd: (outcome: 'won' | 'lost', story?: string, sceneImageUrl?: string) => void;
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
  const [generatedSceneUrl, setGeneratedSceneUrl] = useState<string | null>(null);
  const { isNarrating, isPlaying, toggleNarration } = useNarration();
  const { hasApiKey, autoGenerate, generateImage } = useImageGeneration();
  const autoGenerateTriggered = useRef(false);
  // Abort the story stream when the user navigates away mid-generation so the
  // reader loop stops and no further setState fires on an unmounted component.
  const streamAbortRef = useRef<AbortController | null>(null);
  const moduleContext = getModulePromptContext(killer, location);
  const applicableSpecialRules = getApplicableSpecialRules(killer, location);

  // Auto-generate story on mount
  useEffect(() => {
    generateStory();
    return () => streamAbortRef.current?.abort();
  }, []);

  // Auto-generate scene image when story loads (if enabled)
  useEffect(() => {
    if (story && hasApiKey && autoGenerate && !autoGenerateTriggered.current) {
      autoGenerateTriggered.current = true;
      (async () => {
        const url = await generateImage({
          story,
          killer,
          killerDescription: getKillerDescription(killer),
          finalGirl,
          finalGirlDescription: getFinalGirlDescription(finalGirl),
          location,
          locationDescription: getLocationDescription(location),
          moduleVisualGuidance: moduleContext?.visualGuidance,
          sceneType: 'beginning',
        });
        if (url) {
          setGeneratedSceneUrl(url);
          setSceneImageUrl(url);
        }
      })();
    }
  }, [story, hasApiKey, autoGenerate]);

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

  const handleNarrate = () => toggleNarration(story);

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
      <div className="relative z-10 flex flex-col items-center py-6 sm:py-8 pt-16 sm:pt-24 px-3 sm:px-4">

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
        <div className="w-full max-w-4xl flex flex-col gap-4">
          {/* Action Buttons - Above text */}
          {story && (
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 px-2">
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
              
              {/* Row 2: Image Prompt + Upload — side by side on mobile */}
              <div className="flex w-full sm:w-auto gap-2 sm:gap-3 sm:contents">
                <ImagePromptModal
                  story={story}
                  killer={killer}
                  location={location}
                  finalGirl={finalGirl}
                >
                  <button className="vcr-tape-button flex items-center justify-center gap-2 px-4 sm:px-6 py-3 font-display text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all duration-300 min-h-[44px] flex-1 sm:flex-none">
                    <ImageIcon className="w-4 h-4 shrink-0" />
                    <span>Image Prompt</span>
                  </button>
                </ImagePromptModal>
                
                <div className="flex-1 sm:flex-none">
                  <ImageUploadSlot
                    imageUrl={sceneImageUrl}
                    onImageChange={setSceneImageUrl}
                  />
                </div>
              </div>

              {/* Row 3: Generate Scene — full width on mobile */}
              <SceneImageControls
                story={story}
                killer={killer}
                finalGirl={finalGirl}
                location={location}
                sceneType="beginning"
                generatedImageUrl={generatedSceneUrl}
                onImageGenerated={(url) => {
                  setGeneratedSceneUrl(url);
                  setSceneImageUrl(url);
                }}
              />
            </div>
          )}
          
          {/* Story + Image Container */}
          <div className={`w-full px-1 sm:px-0 ${sceneImageUrl ? 'grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 lg:gap-6' : ''}`}>
            {/* Story Text */}
            <div className="scenario-description p-4 sm:p-6 rounded-sm">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="font-vhs text-xs sm:text-sm text-muted-foreground animate-pulse">
                    The projector is warming up...
                  </p>
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
            
            {/* Scene Image - Shows when uploaded */}
            {sceneImageUrl && (
              <div className="relative aspect-[3/4] w-full max-w-[300px] mx-auto lg:mx-0 rounded-sm overflow-hidden border-2 border-border/50 shadow-lg">
                <img
                  src={sceneImageUrl}
                  alt="Scene still"
                  className="w-full h-full object-cover"
                />
                {/* Film grain overlay on image */}
                <div className="film-grain absolute inset-0 pointer-events-none opacity-[0.15]" />
                {/* Subtle vignette on image */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </div>
            )}
          </div>

          {/* Won/Lost Buttons - Show when story is loaded */}
          {story && !isGenerating && !error && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8 px-2">
              <button
                onClick={() => onGameEnd('won', story || undefined, sceneImageUrl || undefined)}
                className="outcome-btn outcome-btn-won group relative w-full sm:w-auto min-w-[200px] sm:min-w-[240px] h-14 sm:h-16 overflow-hidden rounded-sm transition-all duration-200"
              >
                <span className="relative z-10 font-display text-xl sm:text-2xl tracking-[0.2em] uppercase text-secondary drop-shadow-lg">
                  WON
                </span>
              </button>
              
              <button
                onClick={() => onGameEnd('lost', story || undefined, sceneImageUrl || undefined)}
                className="outcome-btn outcome-btn-lost group relative w-full sm:w-auto min-w-[200px] sm:min-w-[240px] h-14 sm:h-16 overflow-hidden rounded-sm transition-all duration-200"
              >
                <span className="relative z-10 font-display text-xl sm:text-2xl tracking-[0.2em] uppercase text-primary drop-shadow-lg">
                  LOST
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
