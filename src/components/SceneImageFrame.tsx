import { AlertTriangle, Expand, RefreshCw } from 'lucide-react';
import { ProjectorLeader } from '@/components/ProjectorLeader';
import { ImageLightbox } from '@/components/ImageLightbox';

interface SceneImageFrameProps {
  imageUrl: string;
  isGenerating: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** 'scene' is the 3:4 in-session still; 'poster' is the 2:3 movie poster. */
  variant: 'scene' | 'poster';
  /** Grease-pencil slug under the gate, e.g. "Reel 01 · Shady Acres". */
  caption?: string;
  className?: string;
}

/**
 * A generated still presented as a frame of film: sprocket rails down both
 * edges, the picture inset in the gate, a slug beneath it.
 *
 * The controls live on the frame rather than in the page's button row —
 * reshooting is something you do to a picture, so the affordance belongs on
 * the picture.
 */
export const SceneImageFrame = ({
  imageUrl,
  isGenerating,
  error,
  onRetry,
  variant,
  caption,
  className = '',
}: SceneImageFrameProps) => {
  const aspect = variant === 'poster' ? 'aspect-[2/3]' : 'aspect-[3/4]';
  const label = variant === 'poster' ? 'Movie poster' : 'Scene still';

  const frame = (body: React.ReactNode, showCaption = true) => (
    <figure className={`film-frame rounded-sm ${className}`}>
      <div className={`film-frame-gate ${imageUrl ? '' : aspect}`}>{body}</div>
      {showCaption && caption && (
        <figcaption className="film-frame-caption font-vhs text-[10px] tracking-[0.25em] uppercase text-muted-foreground/70 px-4 py-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );

  if (imageUrl) {
    return frame(
      <div className="group relative">
        <ImageLightbox imageUrl={imageUrl} caption={caption ?? label}>
          <button
            type="button"
            className="block w-full cursor-zoom-in"
            aria-label={`View ${label.toLowerCase()} full size`}
          >
            <img src={imageUrl} alt={label} className="story-image-loaded w-full h-auto" />
          </button>
        </ImageLightbox>

        <div className="film-grain absolute inset-0 pointer-events-none opacity-[0.14]" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Reshoot rides on the frame, revealed on hover and always available
            to keyboard users via focus. */}
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isGenerating}
            className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-3 py-2 rounded-sm bg-background/85 border border-border/60 font-vhs text-[10px] tracking-[0.2em] uppercase text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 disabled:opacity-50 min-h-[36px]"
          >
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Developing' : 'Reshoot'}
          </button>
        )}

        <span className="absolute top-2 left-2 z-10 flex items-center gap-1 font-vhs text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
          <Expand className="w-3 h-3" />
        </span>
      </div>,
    );
  }

  if (isGenerating) {
    return frame(
      <div className="absolute inset-0 flex items-center justify-center">
        <ProjectorLeader label="Developing" />
        <div className="film-grain absolute inset-0 pointer-events-none opacity-[0.2]" />
        <div className="vignette absolute inset-0 pointer-events-none" />
      </div>,
    );
  }

  // Failure is deliberately quiet: the story is the point, the picture is a
  // bonus. No toast, just an offer to try again.
  if (error) {
    return frame(
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
      </div>,
    );
  }

  return null;
};
