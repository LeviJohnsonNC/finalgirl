import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Ticket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGameHistoryContext } from '@/contexts/GameHistoryContext';
import { TheaterReel } from './TheaterReel';
import { TheaterActions } from './TheaterActions';
import type { ActiveGame } from '@/lib/activeGame';
import '@/styles/theater.css';

interface MarqueeProps {
  onStart: () => void;
  onArchive: () => void;
  onNavigateHome: () => void;
  onScrapbooks?: () => void;
  onStats?: () => void;
  onRules?: () => void;
  onLobby?: () => void;
  onOpenCaseFile?: (id: string) => void;
  resumeGame?: ActiveGame | null;
  resumeFromCloud?: boolean;
  onStartAnother?: () => boolean;
  recoveryNotice?: ReactNode;
}

export const Marquee = ({ onStart, onArchive, onNavigateHome, onScrapbooks, onStats, onRules, onLobby, onOpenCaseFile,
  resumeGame, resumeFromCloud, onStartAnother, recoveryNotice }: MarqueeProps) => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, authError } = useAuth();
  const { gameHistory, isLoading, loadError, retryLoadHistory } = useGameHistoryContext();

  return (
    <div className="theater">
      <div className="theater-shell">
        <header className="theater-header">
          <button className="theater-brand" onClick={onNavigateHome} aria-label="Final Girl home">
            <h1>FINAL GIRL</h1>
            <span><span className="theater-unofficial">Unofficial</span> Case Files</span>
          </button>
          <div className="theater-admission">
            {!authLoading && <button className="theater-account" aria-label={user ? 'Account' : 'Sign in'} onClick={() => navigate('/auth')}>
              <Ticket size={18} aria-hidden="true" /><span className="theater-account-text">{user ? 'Account' : 'Sign in'}</span>
            </button>}
          </div>
        </header>

        <main className="theater-main" aria-label="The drive-in theater">
          <TheaterReel key={user?.id ?? 'guest'} games={authLoading ? [] : gameHistory} loading={authLoading || isLoading}
            historyError={loadError} onRetryHistory={retryLoadHistory} onOpenCaseFile={user ? onOpenCaseFile : undefined} activeGame={resumeGame}
            actions={<>
              <div className="theater-recovery">{recoveryNotice}</div>
              <TheaterActions game={resumeGame} cloud={resumeFromCloud} onStart={onStart} onStartAnother={onStartAnother} />
              {authError && <p role="status" className="theater-status">Sign-in services reconnecting</p>}
            </>} />
        </main>

        <footer className="theater-footer">
          <nav aria-label="Theater navigation">
            {onLobby && <button onClick={onLobby}>Lobby</button>}
            {onScrapbooks && <button onClick={onScrapbooks}>Scrapbooks</button>}
            {onStats && <button onClick={onStats}>Stats</button>}
            {onRules && <button onClick={onRules}>Rules</button>}
            <button onClick={onArchive}>Collection</button>
          </nav>
          <p className="theater-disclaimer">Unofficial fan-made app · Not endorsed by or affiliated with Van Ryder Games.<span> Final Girl and associated intellectual property belong to their respective owners.</span></p>
        </footer>
      </div>
    </div>
  );
};
