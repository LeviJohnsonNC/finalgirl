import { useState } from 'react';
import { Film, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { streamChatCompletion } from '@/lib/streamChatCompletion';
import { getFilmDetails } from '@/types/featureFilmDetails';
import { toast } from 'sonner';


interface StoryGeneratorProps {
  killer: string | null;
  location: string | null;
  finalGirl: string | null;
  startingEvent: string | null;
  startingSetup: string | null;
  filmId: string | null;
}

export const StoryGenerator = ({ 
  killer, 
  location, 
  finalGirl, 
  startingEvent, 
  startingSetup,
  filmId 
}: StoryGeneratorProps) => {
  const [story, setStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = killer && location && finalGirl;

  const generateStory = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError(null);
    setStory(null);

    try {
      // Get detailed context if available
      const filmDetails = filmId ? getFilmDetails(filmId) : undefined;
      
      // Build request payload with detailed info when available
      const killerDetail = filmDetails?.killer;
      const finalGirlDetail = filmDetails?.finalGirls.find(fg => fg.name === finalGirl);
      const locationDetail = filmDetails?.location;
      const eventDetail = locationDetail?.events.find(e => e.name === startingEvent);
      const setupDetail = locationDetail?.setupCards.find(s => s.name === startingSetup);

      const payload = {
        killer: {
          name: killer,
          description: killerDetail?.description,
        },
        location: {
          name: location,
          description: locationDetail?.description,
        },
        finalGirl: {
          name: finalGirl,
          backstory: finalGirlDetail?.backstory,
        },
        startingEvent: startingEvent ? {
          name: startingEvent,
          description: eventDetail?.description,
        } : null,
        startingSetup: startingSetup ? {
          name: startingSetup,
          description: setupDetail?.description,
        } : null,
      };


      const full = await streamChatCompletion({
        functionName: 'generate-story',
        body: payload,
        onToken: (_delta, accumulated) => setStory(accumulated),
      });

      if (!full) throw new Error('No story was generated');
      setStory(full);
    } catch (err) {
      console.error('Generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="glass-card p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-title text-xl text-foreground tracking-wide flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          MOVIE SYNOPSIS
        </h3>
        <div className="flex gap-2">
          {story && (
            <Button
              onClick={generateStory}
              disabled={!canGenerate || isGenerating}
              variant="outline"
              className="vcr-button font-vhs"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
              REGENERATE
            </Button>
          )}
          {!story && (
            <Button
              onClick={generateStory}
              disabled={!canGenerate || isGenerating}
              className={cn(
                "vcr-button font-vhs glitch-hover",
                canGenerate && !isGenerating && "bg-primary hover:bg-primary/90"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  START MOVIE
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {error && !isGenerating && (
        <p className="font-vhs text-sm text-primary">
          ✕ {error}
        </p>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary/30 animate-pulse" />
          </div>
          <p className="font-vhs text-sm text-muted-foreground animate-pulse">
            [ GENERATING YOUR VHS HORROR STORY... ]
          </p>
        </div>
      )}

      {story && !isGenerating && (
        <div className="space-y-4 mt-4">
          <div className="vhs-label border-l-4 border-primary p-4 bg-background/50">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-vhs text-xs text-secondary tracking-widest">▶ NOW PLAYING</span>
              <div className="flex-1 h-px bg-gradient-to-r from-secondary/50 to-transparent" />
            </div>
            <p className="font-vhs text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {story}
            </p>
          </div>
        </div>
      )}

      {!story && !isGenerating && !error && canGenerate && (
        <p className="font-vhs text-sm text-muted-foreground text-center py-8">
          [ PRESS "START MOVIE" TO GENERATE YOUR VHS SYNOPSIS ]
        </p>
      )}

      {!canGenerate && !isGenerating && (
        <p className="font-vhs text-sm text-muted-foreground text-center py-8">
          [ SELECT A KILLER, LOCATION, AND FINAL GIRL TO BEGIN ]
        </p>
      )}
    </div>
  );
};
