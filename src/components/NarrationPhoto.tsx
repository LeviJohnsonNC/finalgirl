import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { AlertTriangle, Expand, RefreshCw } from 'lucide-react';
import { ImageLightbox } from '@/components/ImageLightbox';
import { DarkroomImageLoader } from '@/components/loaders/CinematicLoaders';
import { usePresentedImage } from '@/components/loaders/usePresentedImage';

interface NarrationPhotoProps {
  imageUrl: string;
  isGenerating: boolean;
  error?: string | null;
  onRetry: () => void;
  variant: 'scene' | 'poster';
  caption: string;
  /** Photographic atmosphere only; never official illustration/box art. */
  previewUrl?: string;
}

/** Nine-sliced paper preserves the wear at the corners of any size photograph. */
export const NarrationPhoto = ({ imageUrl, isGenerating, error, onRetry, variant, caption, previewUrl }: NarrationPhotoProps) => {
  const figure = useRef<HTMLElement>(null);
  const posterCaption = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    if (variant !== 'poster' || !posterCaption.current) return;
    const measure = () => figure.current?.style.setProperty('--poster-caption-height', `${posterCaption.current?.getBoundingClientRect().height ?? 36}px`);
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(posterCaption.current);
    return () => observer?.disconnect();
  }, [variant, caption]);
  const presentation = usePresentedImage(imageUrl, isGenerating);
  const { shown, loading, revealing, failed } = presentation;
  const ratio = variant === 'poster' ? 2 / 3 : shown.ratio;
  const label = variant === 'poster' ? 'Movie poster' : 'Scene still';
  const hasImage = Boolean(shown.url) && !(failed && shown.url === imageUrl);
  const developing = isGenerating || loading;
  const overlay = developing || revealing;
  const failure = error || (failed ? 'This photograph could not be loaded.' : null);

  const mount = (
    <div className={`narration-photo-mount${overlay ? ' narration-photo-mount--developing' : ''}`} aria-busy={developing}>
      <div className="narration-photo-edge" aria-hidden="true" />
      {hasImage || overlay ? <div className="narration-photo-stage" style={{ '--stage-ratio': ratio } as CSSProperties}>
        {hasImage && <ImageLightbox imageUrl={shown.url} caption={caption}>
          <button type="button" className="narration-photo-open" aria-label={`View ${label.toLowerCase()} full size`} disabled={developing}>
            <img src={shown.url} alt={label} onLoad={event => presentation.onImageLoad(event.currentTarget)} onError={presentation.onImageError} />
          </button>
        </ImageLightbox>}
        {overlay && <div className={`narration-photo-development${revealing && !developing ? ' narration-photo-development--revealing' : ''}`}>
          <DarkroomImageLoader variant={variant} previewUrl={previewUrl} developedUrl={revealing && !developing ? shown.url : undefined} label={revealing && !developing ? 'Your photograph is ready' : loading && !isGenerating ? 'Bringing the photograph into focus' : undefined} />
        </div>}
      </div> : <div className="narration-photo-placeholder">
        {failure ? <>
          <AlertTriangle className="w-5 h-5" />
          <p>{failure}</p>
          <button className="narration-button narration-button--quiet" onClick={failed ? presentation.retryLoad : onRetry}>{failed ? 'Reload photograph' : 'Try Again'}</button>
          {failed && <button className="narration-button narration-button--quiet" onClick={onRetry}>Reshoot</button>}
        </> : variant === 'poster' ? <p>The poster will develop after the ending.</p> : null}
      </div>}
      {variant === 'poster' && <p ref={posterCaption} className="ending-poster-caption" aria-hidden="true"><span>{caption}</span></p>}
    </div>
  );

  return (
    <figure ref={figure} className={`narration-photo narration-photo--${variant}${ratio < 1 ? ' narration-photo--portrait' : ''}`} style={{ '--photo-ratio': ratio } as CSSProperties}>
      {variant === 'poster' ? <div className="ending-poster-window">{mount}</div> : mount}
      <figcaption className={variant === 'poster' ? 'ending-poster-tools' : 'narration-photo-caption'}>
        <span className={variant === 'poster' ? 'sr-only' : undefined}>{caption}</span>
        {hasImage && <span className="narration-photo-tools">
          <ImageLightbox imageUrl={shown.url} caption={caption}>
            <button type="button" aria-label={`Expand ${label.toLowerCase()}`}><Expand className="w-3 h-3" /><span>Expand</span></button>
          </ImageLightbox>
          <button onClick={onRetry} disabled={developing}><RefreshCw className={`w-3 h-3${developing ? ' animate-spin' : ''}`} />{developing ? 'Developing' : 'Reshoot'}</button>
        </span>}
      </figcaption>
      {hasImage && failure && <p className="narration-photo-error" role="status">{failure}{failed && <button type="button" onClick={presentation.retryLoad}>Reload photograph</button>}</p>}
    </figure>
  );
};
