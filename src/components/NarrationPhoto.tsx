import { useState, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { AlertTriangle, Expand, RefreshCw } from 'lucide-react';
import { ImageLightbox } from '@/components/ImageLightbox';
import { ProjectorLeader } from '@/components/ProjectorLeader';

interface NarrationPhotoProps {
  imageUrl: string;
  isGenerating: boolean;
  error?: string | null;
  onRetry: () => void;
  variant: 'scene' | 'poster';
  caption: string;
}

/** Nine-sliced paper preserves the wear at the corners of any size photograph. */
export const NarrationPhoto = ({ imageUrl, isGenerating, error, onRetry, variant, caption }: NarrationPhotoProps) => {
  const figure = useRef<HTMLElement>(null);
  const posterCaption = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    if (variant !== 'poster' || !posterCaption.current) return;
    const measure = () => figure.current?.style.setProperty('--poster-caption-height', `${posterCaption.current?.getBoundingClientRect().height ?? 36}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(posterCaption.current);
    return () => observer.disconnect();
  }, [variant, caption]);
  const [dimensions, setDimensions] = useState({ url: '', ratio: 4 / 3 });
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const ratio = variant === 'poster' ? 2 / 3 : dimensions.url === imageUrl ? dimensions.ratio : 4 / 3;
  const label = variant === 'poster' ? 'Movie poster' : 'Scene still';
  const hasImage = Boolean(imageUrl) && failedUrl !== imageUrl;
  const failure = error || (failedUrl === imageUrl && imageUrl ? 'This photograph could not be loaded.' : null);

  const mount = (
    <div className="narration-photo-mount" aria-busy={isGenerating}>
      <div className="narration-photo-edge" aria-hidden="true" />
      {hasImage ? (
        <ImageLightbox imageUrl={imageUrl} caption={caption}>
          <button type="button" className="narration-photo-open" aria-label={`View ${label.toLowerCase()} full size`}>
            <img src={imageUrl} alt={label} onLoad={event => { const img = event.currentTarget; setDimensions({ url: imageUrl, ratio: img.naturalWidth / img.naturalHeight }); }} onError={() => setFailedUrl(imageUrl)} />
          </button>
        </ImageLightbox>
      ) : (
        <div className="narration-photo-placeholder">
          {isGenerating ? <ProjectorLeader label="Developing" /> : failure ? <>
            <AlertTriangle className="w-5 h-5" />
            <p>{failure}</p>
            <button className="narration-button narration-button--quiet" onClick={() => { setFailedUrl(null); onRetry(); }}>Try Again</button>
          </> : variant === 'poster' ? <p>The poster will develop after the ending.</p> : null}
        </div>
      )}
      {variant === 'poster' && <p ref={posterCaption} className="ending-poster-caption" aria-hidden="true"><span>{caption}</span></p>}
    </div>
  );

  return (
    <figure ref={figure} className={`narration-photo narration-photo--${variant}${ratio < 1 ? ' narration-photo--portrait' : ''}`} style={{ '--photo-ratio': ratio } as CSSProperties}>
      {variant === 'poster' ? <div className="ending-poster-window">{mount}</div> : mount}
      <figcaption className={variant === 'poster' ? 'ending-poster-tools' : 'narration-photo-caption'}>
        <span className={variant === 'poster' ? 'sr-only' : undefined}>{caption}</span>
        {hasImage && <span className="narration-photo-tools">
          <ImageLightbox imageUrl={imageUrl} caption={caption}>
            <button type="button" aria-label={`Expand ${label.toLowerCase()}`}><Expand className="w-3 h-3" /><span>Expand</span></button>
          </ImageLightbox>
          <button onClick={onRetry} disabled={isGenerating}><RefreshCw className={`w-3 h-3${isGenerating ? ' animate-spin' : ''}`} />{isGenerating ? 'Developing' : 'Reshoot'}</button>
        </span>}
      </figcaption>
      {hasImage && failure && <p className="narration-photo-error" role="status">{failure}</p>}
    </figure>
  );
};
