import { AlertTriangle } from 'lucide-react';

interface SceneImageFrameProps {
  imageUrl: string;
  isGenerating: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** 'scene' is the 3:4 in-session still; 'poster' is the 2:3 movie poster. */
  variant: 'scene' | 'poster';
  className?: string;
}

/**
 * The image slot on Now Playing and The End. Images generate on their own, so
 * this shows the developing state in the same place the finished picture will
 * land — the frame never pops into existence, it develops in.
 */
export const SceneImageFrame = ({
  imageUrl,
  isGenerating,
  error,
  onRetry,
  variant,
  className = '',
}: SceneImageFrameProps) => {
  const aspect = variant === 'poster' ? 'aspect-[2/3]' : 'aspect-[3/4]';

  if (imageUrl) {
    return (
      <div className={`relative rounded-sm overflow-hidden border-2 border-border/50 shadow-lg ${className}`}>
        <img
          src={imageUrl}
          alt={variant === 'poster' ? 'Movie poster' : 'Scene still'}
          className="w-full h-auto"
          style={variant === 'poster' ? { filter: 'contrast(1.1) saturate(0.85) sepia(0.15)' } : undefined}
        />
        <div className="film-grain absolute inset-0 pointer-events-none opacity-[0.14]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div
        className={`relative ${aspect} w-full rounded-sm overflow-hidden border-2 border-border/50 bg-card/40 ${className}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-vhs text-xs text-muted-foreground animate-pulse text-center tracking-[0.15em] uppercase">
            Developing...
          </p>
        </div>
        <div className="film-grain absolute inset-0 pointer-events-none opacity-[0.2]" />
        <div className="vignette absolute inset-0 pointer-events-none" />
      </div>
    );
  }

  // Failure is deliberately quiet: the story is the point, the picture is a
  // bonus. No toast, just an offer to try again.
  if (error) {
    return (
      <div
        className={`relative ${aspect} w-full rounded-sm overflow-hidden border-2 border-dashed border-border/40 bg-card/20 ${className}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <AlertTriangle className="w-5 h-5 text-muted-foreground/50" />
          <p className="font-vhs text-[10px] text-muted-foreground/70">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="font-display text-[10px] tracking-[0.15em] uppercase px-3 py-2 vcr-tape-button min-h-[36px]"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
