import { ScrapbookArtwork } from './ScrapbookArtwork';
import { useState } from 'react';
import { GameResult } from '@/hooks/useGameHistory';
import { format } from 'date-fns';

interface ScrapbookGridProps {
  games: GameResult[];
  selectedGameId: string | null;
  onSelectGame: (game: GameResult) => void;
  type: 'finalGirl' | 'killer';
  onUpdateGame: (id: string, updates: Partial<GameResult>) => void;
  onFetchGameDetails: (id: string) => Promise<GameResult | null>;
}

export const ScrapbookGrid = ({ games, selectedGameId, onSelectGame, type, onUpdateGame, onFetchGameDetails }: ScrapbookGridProps) => {
  const [failedUrls, setFailedUrls] = useState<Record<string, string>>({});
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
            <div
              key={game.id}
              className={`scrapbook-thumbnail group ${
                selectedGameId === game.id ? 'thumbnail-selected' : ''
              }`}
              style={{
                '--rotation': `${(index % 5 - 2) * 2}deg`
              } as React.CSSProperties}
            >
              <div className="thumbnail-frame">
                {game.posterImageUrl && failedUrls[game.id] !== game.posterImageUrl ? (
                  <button type="button" onClick={() => onSelectGame(game)} className="block w-full h-full" aria-label={`Open ${game.finalGirl} story`}><img
                    src={game.posterImageUrl}
                    alt={`${game.finalGirl} story`}
                    className="thumbnail-image"
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailedUrls(prev => ({ ...prev, [game.id]: game.posterImageUrl! }))}
                  /></button>
                ) : (
                  <ScrapbookArtwork game={{ ...game, posterImageUrl: undefined }} kind="poster"
                    beforeGenerate={() => onFetchGameDetails(game.id)} onGenerated={onUpdateGame} />
                )}
              </div>
              <button type="button" className="thumbnail-label w-full" onClick={() => onSelectGame(game)}>
                <p className="type-caption truncate">
                  {game.finalGirl}
                </p>
                <p className="type-caption text-muted-foreground">
                  {format(new Date(game.timestamp), 'MMM d, yyyy')}
                </p>
              </button>
            </div>
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
