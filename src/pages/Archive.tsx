import { StoryEvaluationTools } from "@/components/StoryEvaluationTools";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";
import { FilmToggle } from "@/components/FilmToggle";
import { FEATURE_FILMS } from "@/types/gameData";
import { useGameHistoryContext } from "@/contexts/GameHistoryContext";
import { useOwnedFilms } from "@/hooks/useOwnedFilms";
import { toast } from "sonner";

const Archive = () => {
  const {
    ownedFilms,
    setOwnedFilms,
    loadError,
    isDegraded,
    isLoading,
    retryLoadOwnedFilms,
  } = useOwnedFilms();
  const { user } = useAuth();
  const { clearHistory } = useGameHistoryContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useEffect(() => setIsDialogOpen(false), [user?.id]);

  // Group films by season - no memoization needed, FEATURE_FILMS is static
  const filmsBySeason = FEATURE_FILMS.reduce(
    (acc, film) => {
      if (!acc[film.season]) acc[film.season] = [];
      acc[film.season].push(film);
      return acc;
    },
    {} as Record<number, typeof FEATURE_FILMS>,
  );

  const handleToggleFilm = (filmId: string) => {
    setOwnedFilms((prev) =>
      prev.includes(filmId)
        ? prev.filter((id) => id !== filmId)
        : [...prev, filmId],
    );
  };

  const handleResetPlays = async () => {
    await clearHistory();
    toast.success("Your plays have been reset");
  };

  // Seasons that are in development (show "In Development" badge)
  const inDevelopmentSeasons = [4];

  // Films that have been fully configured and are available despite being in development seasons
  const availableFilmIds = [
    // Season 1 - all available (including vignette)
    "s1-camp-happy-trails",
    "s1-creech-manor",
    "s1-sacred-groves",
    "s1-carnival-of-blood",
    "s1-maple-lane",
    "s1-terror-from-above",
    // Season 2 - all available (including vignette)
    "s2-into-the-void",
    "s2-madness-in-dark",
    "s2-panic-station-2891",
    "s2-once-upon-full-moon",
    "s2-knock-at-door",
    "s2-terror-from-grave",
    // Season 3 - all available (including vignette)
    "s3-killer-from-tomorrow",
    "s3-falconwood-files",
    "s3-hell-to-pay",
    "s3-marrek-murders",
    "s3-dont-make-sound",
    "s3-terror-from-destiny",
    // Season 4
    "s4-rotten-harvest",
    "s4-shriek",
    "s4-buddyland",
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="collection-title font-display text-3xl sm:text-4xl md:text-5xl tracking-wider">
          MY COLLECTION
        </h1>
        <p className="type-label text-muted-foreground px-2">
          CHOOSE THE FEATURE FILMS ON YOUR SHELF
        </p>
      </div>

      {loadError && (
        <div className="mx-auto max-w-2xl border border-primary/30 bg-background/70 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 type-label text-primary mb-2">
            <AlertTriangle className="w-4 h-4" />
            {isDegraded
              ? "CLOUD ARCHIVE RECONNECTING"
              : "COLLECTION UNAVAILABLE"}
          </div>
          <p className="type-body-sm text-muted-foreground mb-3">
            {isDegraded
              ? "Showing your last saved collection while the archive reconnects."
              : "Your cloud collection could not be reached. This is not an empty collection."}
          </p>
          <button
            onClick={retryLoadOwnedFilms}
            className="type-label inline-flex items-center gap-2 border border-primary/40 px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            RETRY COLLECTION LOAD
          </button>
        </div>
      )}

      {/* Feature Films by Season */}
      {Object.entries(filmsBySeason).map(([season, films]) => {
        const seasonNum = parseInt(season);
        const isInDevelopment = inDevelopmentSeasons.includes(seasonNum);

        return (
          <div key={season} className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <h2 className="font-title text-xl sm:text-2xl text-foreground px-2 sm:px-4">
                  SEASON {season}
                </h2>
                {isInDevelopment && (
                  <span className="type-caption bg-muted/50 text-muted-foreground px-2 py-1 rounded uppercase">
                    In Development
                  </span>
                )}
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-transparent" />
            </div>

            <div className="collection-grid">
              {films.map((film) => {
                const isAvailable = availableFilmIds.includes(film.id);
                return (
                  <div
                    key={film.id}
                    className={!isAvailable ? "collection-upcoming" : ""}
                  >
                    <FilmToggle
                      film={film}
                      isOwned={ownedFilms.includes(film.id)}
                      onToggle={handleToggleFilm}
                      disabled={!isAvailable || isLoading || Boolean(loadError)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <details className="collection-utilities">
        <summary>Collection tools</summary>
        <div className="collection-utilities-content">
          <StoryEvaluationTools />
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="collection-reset"
          >
            <Trash2 size={13} aria-hidden="true" /> RESET MY PLAYS
          </button>
        </div>
      </details>
      <DeleteConfirmModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        confirmationKey={user?.id}
        onConfirm={handleResetPlays}
        title="Reset All Gameplay Data?"
        description="Permanently erase all game history, including wins, losses, stories and posters. Collection settings and separate story evaluation data remain unchanged. This cannot be undone."
        confirmLabel="CONFIRM RESET"
        cancelLabel="BACK OUT"
      />
    </div>
  );
};

export default Archive;
