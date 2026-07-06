import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { FeatureFilm } from '@/types/gameData';
import { Skull, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveImages } from '@/hooks/useActiveImages';

interface FilmToggleProps {
  film: FeatureFilm;
  isOwned: boolean;
  onToggle: (filmId: string) => void;
  disabled?: boolean;
}

export const FilmToggle = React.forwardRef<HTMLDivElement, FilmToggleProps>(
  ({ film, isOwned, onToggle, disabled = false }, ref) => {
    const { getBoxArt } = useActiveImages();
    const boxArt = getBoxArt(film);
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card p-3 sm:p-4 rounded transition-all duration-300",
          isOwned
            ? "border-primary/50 shadow-blood"
            : "border-border hover:border-muted-foreground/50"
        )}
      >
        <div className="flex gap-3 sm:gap-4">
          {/* Box Art */}
          {boxArt && (
            <div className="flex-shrink-0 w-20 h-28 sm:w-24 sm:h-36 relative z-10">
              <img
                src={boxArt}
                alt={`${film.name} box art`}
                loading="lazy"
                decoding="async"
                className={cn(
                  "w-full h-full object-cover object-top rounded transition-all",
                  isOwned
                    ? "ring-2 ring-primary/50 brightness-105"
                    : "opacity-60 grayscale-[30%]"
                )}
                onError={(e) => {
                  console.error(`Failed to load box art for ${film.id}:`, boxArt);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-title text-base sm:text-lg truncate transition-colors mb-1.5 sm:mb-2",
                isOwned ? "text-primary blood-glow" : "text-foreground"
              )}>
                {film.name}
              </h3>

              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Skull className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0",
                    isOwned ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-vhs truncate",
                    isOwned ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {film.killer}
                  </span>
                </div>

                {film.location && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MapPin className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0",
                      isOwned ? "text-secondary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-vhs truncate",
                      isOwned ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {film.location}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <User className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0",
                    isOwned ? "text-accent" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-vhs truncate",
                    isOwned ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {film.finalGirls.join(' & ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 min-w-[48px]">
              <Switch
                checked={isOwned}
                onCheckedChange={() => onToggle(film.id)}
                className="data-[state=checked]:bg-primary scale-90 sm:scale-100"
                disabled={disabled}
              />
              <span className="font-vhs text-[9px] sm:text-[10px] text-muted-foreground uppercase">
                {isOwned ? 'Owned' : 'Unowned'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FilmToggle.displayName = 'FilmToggle';
