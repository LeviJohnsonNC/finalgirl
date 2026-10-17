import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Play, Ticket } from 'lucide-react';
import theaterBackdrop from '@/assets/theater-backdrop.jpg';
import openingStill from '@/assets/locations/ai/camp-happy-trails.png';
import { useAuth } from '@/hooks/useAuth';
import { useGameHistoryContext } from '@/contexts/GameHistoryContext';
import { ProjectorSlideshow } from './ProjectorSlideshow';
import '@/styles/theater.css';

interface MarqueeProps {
  onStart: () => void;
  onArchive: () => void;
  onNavigateHome: () => void;
  onScrapbooks?: () => void;
  onStats?: () => void;
  onRules?: () => void;
}

export const Marquee = ({ onStart, onArchive, onNavigateHome, onScrapbooks, onStats, onRules }: MarqueeProps) => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, authError } = useAuth();
  const { gameHistory } = useGameHistoryContext();
  const projectorImages = useMemo(() => gameHistory.map(g => g.sceneImageUrl).filter((url): url is string => !!url), [gameHistory]);

  return (
    <div className="theater" style={{ backgroundImage: `url(${theaterBackdrop})` }}>
      <div className="theater-atmosphere" aria-hidden="true" />
      <div className="theater-shell">
        <header className="theater-header">
          <button className="theater-brand" onClick={onNavigateHome} aria-label="Final Girl home">
            <h1>FINAL GIRL</h1>
            <span><span className="theater-unofficial">Unofficial</span> Case Files</span>
          </button>
          <div className="theater-admission">
            <span className="theater-edition" aria-hidden="true">The midnight drive-in</span>
            {!authLoading && <button className="theater-account" onClick={() => navigate('/auth')}>
              <Ticket size={16} aria-hidden="true" />{user ? 'Account' : 'Sign in'}
            </button>}
          </div>
        </header>

        <main className="theater-main" aria-label="The drive-in theater">
          <div className="theater-billing"><span />{projectorImages.length ? 'From your case files' : 'Tonight’s feature'}<span /></div>
          <div className="theater-screen-wrap">
            <div className="theater-screen">
              {projectorImages.length ? <ProjectorSlideshow key={user?.id ?? 'guest'} images={projectorImages} /> : (
                <div className="theater-title-card">
                  <img src={openingStill} alt="" className="theater-title-art" />
                  <div className="theater-title-copy">
                    <span className="theater-kicker">An evening of terrible possibilities</span>
                    <h2>Some nights<br /><em>stay with you.</em></h2>
                    <span className="theater-title-rule" />
                    <p>Your cast. Your story. Your last chance.</p>
                  </div>
                </div>
              )}
              <div className="theater-screen-texture" aria-hidden="true" />
            </div>
            <span className="theater-screen-foot theater-screen-foot-left" aria-hidden="true" />
            <span className="theater-screen-foot theater-screen-foot-right" aria-hidden="true" />
          </div>

          <div className="theater-program">
            <p className="theater-program-line">{projectorImages.length ? 'Every game leaves a story.' : 'The screen is waiting for your first story.'}</p>
          </div>
          <div className="theater-actions">
            <button className="theater-play" onClick={onStart}>
              <span className="theater-play-icon"><Play size={16} fill="currentColor" aria-hidden="true" /></span>
              <span>START THE TAPE</span><ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <p className="theater-action-hint">Choose your cast. See how the night ends.</p>
            {authError && <p role="status" className="theater-status">Sign-in services reconnecting</p>}
          </div>
        </main>

        <footer className="theater-footer">
          <nav aria-label="Theater navigation">
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
