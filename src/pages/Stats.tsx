import { useEffect, useState } from 'react';
import { useGameHistoryContext } from '@/contexts/GameHistoryContext';
import { useGameStats } from '@/hooks/useGameStats';
import { RecordJacket } from '@/components/stats/RecordJacket';
import { TrendsSection } from '@/components/stats/TrendsSection';
import { BreakdownTabs } from '@/components/stats/BreakdownTabs';
import { PlayerArchetypeBadge } from '@/components/stats/PlayerArchetype';
import { SessionDetail } from '@/components/stats/SessionDetail';
import { AlertTriangle, Film, RotateCcw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface StatsProps {
  /** Open a recorded session in its scrapbook. */
  onOpenSession?: (gameId: string) => void;
}

const Stats = ({ onOpenSession }: StatsProps) => {
  const { gameHistory, isLoading, loadError, retryLoadHistory, isDegraded } = useGameHistoryContext();
  const { user, authError } = useAuth();
  const stats = useGameStats(gameHistory);
  const [timestamp, setTimestamp] = useState('');

  // Update timestamp every second for archival feel
  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTimestamp(`${hours}:${minutes}:${seconds}`);
    };
    
    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stats-page">
      {/* VHS Background Layers */}
      <div className="stats-bg-plate" />
      <div className="stats-grain-overlay" />
      <div className="stats-scanlines" />
      <div className="stats-vignette" />

      {/* REC Indicator */}
      <div className="rec-indicator">
        <span className="rec-dot" />
        <span>REC</span>
      </div>

      {/* Header with Archival Framing */}
      <div className="stats-header">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl sm:text-5xl text-primary blood-glow tracking-wider">
            STATS
          </h1>
          <p className="stats-subheader">
            SESSION DATA LOGGED • {timestamp}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="stats-content">
          <p className="type-label text-dim animate-pulse text-center mb-6">
            RETRIEVING SESSION DATA...
          </p>
          {/* Skeleton Record Jacket */}
          <div className="record-jacket">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="hero-stat-card-image animate-pulse bg-muted/20" style={{ minHeight: '140px' }} />
              ))}
            </div>
          </div>
          {/* Skeleton Trends */}
          <div className="mt-8 space-y-4">
            <div className="h-5 w-48 bg-muted/20 rounded animate-pulse" />
            <div className="h-32 bg-muted/10 rounded animate-pulse" />
          </div>
          {/* Skeleton Breakdowns */}
          <div className="mt-8 space-y-3">
            <div className="h-5 w-36 bg-muted/20 rounded animate-pulse" />
            <div className="h-24 bg-muted/10 rounded animate-pulse" />
          </div>
        </div>
      ) : loadError && !isDegraded ? (
        <div className="stats-empty border border-destructive/40 bg-background/70">
          <AlertTriangle className="w-16 h-16 text-destructive/70 mb-4" />
          <h2 className="font-title text-xl mb-2">{authError ? 'Session Recovery Failed' : 'Archive Retrieval Failed'}</h2>
          <p className="type-body-sm text-dim text-center max-w-md mb-4">
            {authError ? 'Your saved sign-in could not be restored. Please sign in again.' : 'The cloud records timed out before the stats reel could be assembled.'}
          </p>
          <p className="type-caption text-dimmer text-center max-w-md mb-5 break-words">
            {loadError}
          </p>
          {!authError && (
            <button
              onClick={retryLoadHistory}
              className="type-caption inline-flex items-center gap-2 border border-primary/40 px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              RETRY ARCHIVE LOAD
            </button>
          )}
        </div>
      ) : !user ? (
        <div className="stats-empty">
          <Film className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="font-title text-xl mb-2">Sign In Required</h2>
          <p className="type-body-sm text-dim text-center max-w-md">
            Sign in to retrieve your cloud session stats.
          </p>
        </div>
      ) : stats.gamesPlayed === 0 ? (
        <div className="stats-empty">
          <Film className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="font-title text-xl mb-2">No Games Recorded</h2>
          <p className="type-body-sm text-dim text-center max-w-md">
            Play your first game and record the outcome to start tracking your stats. 
            Your journey as a Final Girl awaits!
          </p>
        </div>
      ) : (
        <div className="stats-content">
          {isDegraded && (
            <div className="mb-6 border border-primary/30 bg-background/70 px-4 py-3 text-center type-caption text-dim">
              CLOUD ARCHIVE RECONNECTING • SHOWING LAST SAVED SESSION DATA
            </div>
          )}
          {/* Record Jacket */}
          <RecordJacket stats={stats} />

          {/* Trends - with archival subtitle */}
          <TrendsSection stats={stats} games={gameHistory} />

          {/* Breakdowns */}
          <BreakdownTabs stats={stats} />

          {/* Horror spread, weapons, and the last few sessions */}
          <SessionDetail stats={stats} onOpenSession={onOpenSession} />

          {/* The read on how you play, last — it is the summing-up, and it
              reads better after the evidence than before it. */}
          <PlayerArchetypeBadge
            archetype={stats.playerArchetype}
            reason={stats.archetypeReason}
            profile={stats.archetypeProfile}
            scores={stats.archetypeScores}
          />
        </div>
      )}
    </div>
  );
};

export default Stats;
