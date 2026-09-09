import { useEffect, useRef, useState } from 'react';
import { useGameHistoryContext } from '@/contexts/GameHistoryContext';
import { ScrapbookBook } from '@/components/ScrapbookBook';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import finalGirlCover from '@/assets/scrapbooks/final-girl-cover.png';
import killerCover from '@/assets/scrapbooks/killer-cover.png';

interface ScrapbooksProps {
  /** A game to open straight onto, handed over by the stats page. */
  focusGameId?: string | null;
  /** Called once the focus has been used, so a later visit starts on the covers. */
  onFocusHandled?: () => void;
}

const Scrapbooks = ({ focusGameId, onFocusHandled }: ScrapbooksProps) => {
  const { gameHistory, updateGame, deleteGame, fetchGameDetails, isLoading, loadError, retryLoadHistory, isDegraded } = useGameHistoryContext();
  const { user, authError } = useAuth();
  const [openBook, setOpenBook] = useState<'finalGirl' | 'killer' | null>(null);
  const migrationAttemptedRef = useRef(false);
  const legacyBackfilledRef = useRef<Set<string>>(new Set());

  // One-time background migration of legacy inline data: URI images to the
  // posters bucket. Only runs when the summary flags a legacy asset, and only
  // once per session — the RPC will stop flagging rows after a successful pass.
  useEffect(() => {
    if (!user || isLoading || loadError) return;
    if (migrationAttemptedRef.current) return;
    const hasLegacy = gameHistory.some(g => g.hasLegacyPoster || g.hasLegacyScene);
    if (!hasLegacy) return;

    migrationAttemptedRef.current = true;
    const toastId = toast.loading('Restoring archived stills...');
    supabase.functions
      .invoke('migrate-legacy-images')
      .then(({ data, error }) => {
        if (error) {
          console.error('legacy image migration failed:', error);
          toast.error('Could not restore archived stills', { id: toastId });
          return;
        }
        const migrated = (data?.migratedPosters ?? 0) + (data?.migratedScenes ?? 0);
        toast.success(
          migrated > 0 ? `Restored ${migrated} archived still${migrated === 1 ? '' : 's'}` : 'Scrapbook up to date',
          { id: toastId },
        );
        if (migrated > 0) retryLoadHistory();
      });
  }, [user, isLoading, loadError, gameHistory, retryLoadHistory]);

  // Defensive self-heal: if any row still comes back flagged as legacy (e.g.
  // the migration hasn't run yet, or ran with partial failures), lazily fetch
  // the full row for it in the background so the poster appears in the grid
  // without requiring the user to click the tile first. Limits to a few at a
  // time to avoid a burst of requests on large scrapbooks.
  useEffect(() => {
    if (!user || isLoading) return;
    const pending = gameHistory
      .filter(g => (g.hasLegacyPoster && !g.posterImageUrl) || (g.hasLegacyScene && !g.sceneImageUrl))
      .filter(g => !legacyBackfilledRef.current.has(g.id))
      .slice(0, 5);
    if (pending.length === 0) return;
    pending.forEach(g => {
      legacyBackfilledRef.current.add(g.id);
      void fetchGameDetails(g.id);
    });
  }, [user, isLoading, gameHistory, fetchGameDetails]);



  const wonGames = gameHistory.filter(g => g.outcome === 'won');
  const lostGames = gameHistory.filter(g => g.outcome === 'lost');

  const handleOpenBook = (type: 'finalGirl' | 'killer') => {
    setOpenBook(type);
  };

  const handleCloseBook = () => {
    setOpenBook(null);
    // Spend the focus on close, so reopening the book lands on the covers
    // rather than jumping back to the game the stats page pointed at.
    onFocusHandled?.();
  };

  // A session handed over from the stats page picks its own book: a win lives
  // in the Final Girl's, a loss in the killer's. The history may still be
  // loading, so this waits for the row to appear rather than giving up.
  useEffect(() => {
    if (!focusGameId) return;
    const game = gameHistory.find((g) => g.id === focusGameId);
    if (!game) return;
    setOpenBook(game.outcome === 'won' ? 'finalGirl' : 'killer');
  }, [focusGameId, gameHistory]);

  const handleDeleteGame = async (id: string) => {
    await deleteGame(id);
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-muted-foreground type-label animate-pulse text-center">
            RETRIEVING SCRAPBOOK ARCHIVE...
          </p>
        </div>
      ) : loadError && !isDegraded ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive/70 mb-4" />
          <h1 className="font-title text-xl mb-2">{authError ? 'Session Recovery Failed' : 'Scrapbook Retrieval Failed'}</h1>
          <p className="text-muted-foreground max-w-md mb-5">
            {authError ? 'Your saved sign-in could not be restored. Please sign in again.' : loadError}
          </p>
          {!authError && (
            <button
              onClick={retryLoadHistory}
              className="type-caption inline-flex items-center gap-2 border border-primary/40 px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
            >
              RETRY SCRAPBOOK LOAD
            </button>
          )}
        </div>
      ) : !user ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <Film className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h1 className="font-title text-xl mb-2">Sign In Required</h1>
          <p className="text-muted-foreground max-w-md">
            Sign in to retrieve your cloud scrapbooks.
          </p>
        </div>
      ) : (
      <>
      {isDegraded && (
        <div className="mx-auto mb-6 max-w-2xl border border-primary/30 bg-background/70 px-4 py-3 text-center type-caption text-muted-foreground">
          CLOUD ARCHIVE RECONNECTING • SHOWING LAST SAVED SCRAPBOOKS
        </div>
      )}
      {/* Scrapbook Covers */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-20 px-4">
        {/* Final Girl Scrapbook */}
        <button
          onClick={() => handleOpenBook('finalGirl')}
          disabled={wonGames.length === 0}
          className={`scrapbook-cover-button group relative transition-all duration-300 ${
            wonGames.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105 hover:-rotate-1'
          }`}
        >
          <div className="relative">
            <img
              src={finalGirlCover}
              alt="Final Girl Scrapbook"
              className="w-64 sm:w-80 md:w-96 h-auto drop-shadow-2xl"
              style={{
                filter: wonGames.length > 0 ? 'drop-shadow(0 0 30px rgba(255, 182, 193, 0.3))' : 'none'
              }}
            />
            {/* Story Count Badge */}
            <div className="absolute -bottom-3 -right-3 bg-secondary text-secondary-foreground type-label px-3 py-1.5 rounded-full shadow-lg">
              {wonGames.length} {wonGames.length === 1 ? 'STORY' : 'STORIES'}
            </div>
          </div>
          {wonGames.length === 0 && (
            <p className="type-caption text-muted-foreground mt-4 text-center">
              No victories yet...
            </p>
          )}
        </button>

        {/* Killer Scrapbook */}
        <button
          onClick={() => handleOpenBook('killer')}
          disabled={lostGames.length === 0}
          className={`scrapbook-cover-button group relative transition-all duration-300 ${
            lostGames.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105 hover:rotate-1'
          }`}
        >
          <div className="relative">
            <img
              src={killerCover}
              alt="Killer Scrapbook"
              className="w-64 sm:w-80 md:w-96 h-auto drop-shadow-2xl"
              style={{
                filter: lostGames.length > 0 ? 'drop-shadow(0 0 30px rgba(139, 0, 0, 0.4))' : 'none'
              }}
            />
            {/* Story Count Badge */}
            <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground type-label px-3 py-1.5 rounded-full shadow-lg">
              {lostGames.length} {lostGames.length === 1 ? 'VICTIM' : 'VICTIMS'}
            </div>
          </div>
          {lostGames.length === 0 && (
            <p className="type-caption text-muted-foreground mt-4 text-center">
              No kills recorded...
            </p>
          )}
        </button>
      </div>

      {/* Open Book Overlay */}
      {openBook && (
        <ScrapbookBook
          type={openBook}
          games={openBook === 'finalGirl' ? wonGames : lostGames}
          initialGameId={focusGameId}
          onClose={handleCloseBook}
          onUpdateGame={updateGame}
          onDeleteGame={handleDeleteGame}
          onFetchGameDetails={fetchGameDetails}
        />
      )}
      </>
      )}
    </div>
  );
};

export default Scrapbooks;
