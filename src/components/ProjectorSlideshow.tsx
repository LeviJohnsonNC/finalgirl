import type { Screening } from '@/lib/theater';

interface ProjectorSlideshowProps {
  current: Screening;
  previous?: Screening;
  reducedMotion: boolean;
  onImageError: (url: string) => void;
}

export const ProjectorSlideshow = ({ current, previous, reducedMotion, onImageError }: ProjectorSlideshowProps) => {
  const frame = (screening: Screening, old: boolean) => (
    <div key={screening.key} className={`theater-projection ${!old && previous && !reducedMotion ? 'theater-projection-enter' : ''}`} aria-hidden={old || undefined}>
      <img src={screening.imageUrl} className="theater-projection-fill" alt="" aria-hidden="true" />
      <img src={screening.imageUrl} className="theater-projection-art" alt={old ? '' : `${screening.kind === 'scene' ? 'Scene' : 'Poster'} from ${screening.finalGirl} vs. ${screening.killer} at ${screening.location}`}
        onError={old ? undefined : () => onImageError(screening.imageUrl)} />
    </div>
  );
  return (
    <>{previous && !reducedMotion && frame(previous, true)}{frame(current, false)}</>
  );
};
