import { useState } from 'react';
import { GameResult } from '@/hooks/useGameHistory';
import { format } from 'date-fns';

interface ScrapbookGridProps {
  games: GameResult[];
  selectedGameId: string | null;
  onSelectGame: (game: GameResult) => void;
  type: 'finalGirl' | 'killer';
}

export const ScrapbookGrid = ({ games, selectedGameId, onSelectGame, type }: ScrapbookGridProps) => {
  const [visibleCount, setVisibleCount] = useState(12);
  const visibleGames = games.slice(0, visibleCount);

  if (games.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="font-horror text-lg text-muted-foreground/60 text-center px-4">
          {type === 'finalGirl' 
            ? "No tales yet... survive to write your story"
            : "No victims claimed... the hunt continues"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="font-horror text-xl sm:text-2xl text-center mb-4 text-amber-900/90">
        {type === 'finalGirl' ? 'Survivors' : 'Victims'}
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 scrapbook-scroll">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pb-4">
          {visibleGames.map((game, index) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game)}
              className={`scrapbook-thumbnail group ${
                selectedGameId === game.id ? 'thumbnail-selected' : ''
              }`}
              style={{
                '--rotation': `${(index % 5 - 2) * 2}deg`
              } as React.CSSProperties}
            >
              <div className="thumbnail-frame">
                {game.posterImageUrl ? (
                  <img
                    src={game.posterImageUrl}
                    alt={`${game.finalGirl} story`}
                    className="thumbnail-image"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="thumbnail-placeholder">
                    <span className="type-caption text-muted-foreground">
                      NO IMAGE
                    </span>
                  </div>
                )}
              </div>
              <div className="thumbnail-label">
                <p className="type-caption truncate">
                  {game.finalGirl}
                </p>
                <p className="type-caption text-muted-foreground">
                  {format(new Date(game.timestamp), 'MMM d, yyyy')}
                </p>
              </div>
            </button>
          ))}
        </div>
        {visibleCount < games.length && (
          <button
            onClick={() => setVisibleCount(count => Math.min(count + 12, games.length))}
            className="mx-auto mb-4 block type-caption text-amber-900/80 hover:text-amber-950 underline underline-offset-4"
          >
            Load more recovered photos
          </button>
        )}
      </div>
    </div>
  );
};
