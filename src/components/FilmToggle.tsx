import * as React from 'react';
import { LoreInfoModal } from '@/components/LoreInfoModal';
import { getFinalGirlReference } from '@/data/finalGirlReferences';
import { Switch } from '@/components/ui/switch';
import { FeatureFilm, getBoxArtThumbnail } from '@/types/gameData';
import { Skull, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveImages } from '@/hooks/useActiveImages';
import { FILM_BLURBS } from '@/data/filmBlurbs';
import '@/styles/collection.css';

interface FilmToggleProps {
  film: FeatureFilm;
  isOwned: boolean;
  onToggle: (filmId: string) => void;
  disabled?: boolean;
}

export const FilmToggle = React.forwardRef<HTMLDivElement, FilmToggleProps>(
  ({ film, isOwned, onToggle, disabled = false }, ref) => {
    const { getBoxArt } = useActiveImages();
    const boxArt = getBoxArtThumbnail(getBoxArt(film));
    const comingSoon = film.killer === 'TBD';
    return (
      <div ref={ref} className={cn('glass-card collection-film', isOwned && 'collection-film-owned')}>
        <div className="collection-film-header">
          <h3 className="collection-film-title">{film.name}</h3>
          <div className="collection-ownership">
            <Switch aria-label={`Own ${film.name}`} checked={isOwned} onCheckedChange={() => onToggle(film.id)}
              className="data-[state=checked]:bg-primary" disabled={disabled} />
            <span>{isOwned ? 'Owned' : 'Unowned'}</span>
          </div>
        </div>
        <div className="collection-feature">
          {boxArt && <div className="collection-cover">
            <img src={boxArt} alt={`${film.name} box art`} width={288} height={432} loading="lazy" decoding="async"
              onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />
          </div>}
          <div className="collection-pitch">
            <span className="collection-format">{comingSoon ? 'Coming soon' : film.isVignette ? 'Vignette · Mix with a location' : 'Feature film'}</span>
            <p>{FILM_BLURBS[film.id]}</p>
          </div>
        </div>
        {!comingSoon && <dl className="collection-cast">
          <div><dt><Skull size={13} aria-hidden="true" />Killer</dt><dd>{film.killer}</dd></div>
          <div><dt><MapPin size={13} aria-hidden="true" />Location</dt><dd>{film.isVignette ? 'Your choice' : film.location}</dd></div>
          <div><dt><Users size={13} aria-hidden="true" />Final {film.finalGirls.length === 1 ? 'Girl' : 'Girls'}</dt><dd>{film.finalGirls.join(' & ')}</dd></div>
        </dl>}
        {!comingSoon && <div className="collection-girl-references">{film.finalGirls.filter(name=>getFinalGirlReference(name)).map(name=><LoreInfoModal key={name} type="finalGirl" name={name} namedTrigger/>)}</div>}
      </div>
    );
  }
);

FilmToggle.displayName = 'FilmToggle';
