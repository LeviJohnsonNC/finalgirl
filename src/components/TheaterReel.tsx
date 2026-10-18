import { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import type { GameResult } from '@/hooks/useGameHistory';
import { useTheaterReel } from '@/hooks/useTheaterReel';
import { activeScreeningStatus } from '@/lib/theater';
import type { ActiveGame } from '@/lib/activeGame';
import openingStill from '@/assets/theater-opening.jpg';
import { DriveInScreen } from './DriveInScreen';
import { ProjectorSlideshow } from './ProjectorSlideshow';

interface TheaterReelProps {
  games: GameResult[];
  loading: boolean;
  historyError: string | null;
  onRetryHistory: () => void;
  onOpenCaseFile?: (id: string) => void;
  activeGame?: ActiveGame | null;
}

export const TheaterReel = ({ games, loading, historyError, onRetryHistory, onOpenCaseFile, activeGame }: TheaterReelProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [explicitPlayback, setExplicitPlayback] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const active = !showArchive ? activeGame : null;
  // An explicit Play action resumes under the pointer/keyboard focus. A fresh
  // interaction restores automatic suspension, without requiring a tap outside.
  const reel = useTheaterReel(games, (hovered || focused) && !explicitPlayback, active);
  const { current, previous } = reel;
  const selection = active?.selection ?? current;
  const title = selection ? `${selection.finalGirl} vs. ${selection.killer}` : '';
  const imageUrl = current?.imageUrl;
  const warming = loading || (reel.pending && !current);
  const unavailable = !warming && !current && (reel.failedCount > 0 || Boolean(historyError));
  const playbackLabel = reel.reducedMotion ? 'Automatic playback off for reduced motion'
    : `${reel.paused ? 'Play' : 'Pause'} ${active ? 'projection' : 'slideshow'}`;

  return (
    <section className="theater-reel" aria-label="Personal screenings" aria-roledescription="carousel"
      onPointerEnter={event => { if (event.pointerType === 'mouse') { setHovered(true); setExplicitPlayback(false); } }} onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => { setFocused(true); setExplicitPlayback(false); }} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}>
      {activeGame ? <div className="theater-mode-switch" role="group" aria-label="Screening selection">
        <button aria-pressed={!showArchive} onClick={() => setShowArchive(false)}>Now playing</button>
        <button aria-pressed={showArchive} onClick={() => setShowArchive(true)}>Past screenings</button>
      </div> : !current && <div className="theater-billing"><span />Tonight’s feature<span /></div>}
      <DriveInScreen busy={reel.pending || (!active && loading)} projecting={Boolean(current) && reel.playing}>
        {current ? <ProjectorSlideshow current={current} previous={previous} reducedMotion={reel.reducedMotion} onImageError={reel.fail} /> : (
          <div className="theater-title-card">
            <img src={openingStill} alt="" className="theater-title-art" />
            <div className="theater-title-copy">
              <span className="theater-kicker">{active ? 'A feature in progress' : warming ? 'Projector warming up…' : 'An evening of terrible possibilities'}</span>
              <h2>{active ? <>The night<br /><em>isn’t over.</em></> : <>Some nights<br /><em>stay with you.</em></>}</h2>
              <span className="theater-title-rule" />
              <p>{active ? 'Your story is right where you left it.' : 'Your cast. Your story. Your last chance.'}</p>
            </div>
          </div>
        )}
      </DriveInScreen>

      <div className={`theater-program ${selection ? 'theater-program-personal' : ''}`}>
        {selection ? <>
          <div className="theater-caption" aria-live={active || reel.playing ? 'off' : 'polite'} aria-atomic="true">
            <h2 aria-label={title}>
              {!active && current && onOpenCaseFile ? <button className="theater-caption-link"
                aria-label={`Open case file for ${title}`} onClick={() => onOpenCaseFile(current.id)}>
                {title}<ArrowUpRight size={12} aria-hidden="true" />
              </button> : title}
            </h2>
            <p className="theater-caption-details">
              <span>{selection.location}</span><span aria-hidden="true"> · </span>
              <span className={active ? 'theater-in-progress' : current?.outcome === 'won' ? 'theater-survived' : 'theater-lost'}>{active ? 'In progress' : current?.outcome === 'won' ? 'Survived' : 'Lost to the night'}</span>
            </p>
            {active && <p className="theater-progress-line">{activeScreeningStatus(active)}</p>}
          </div>
          {(!active || current) && <div className="theater-reel-controls">
            <div className="theater-transport" role="group" aria-label="Projection controls">
              {!active && <button onClick={() => reel.move(-1)} disabled={reel.screenings.length < 2} aria-label="Previous scene"><ChevronLeft size={16} aria-hidden="true" /></button>}
              <button onClick={() => { if (reel.paused) setExplicitPlayback(true); reel.setPaused(!reel.paused); }} disabled={reel.reducedMotion || !current}
                aria-label={playbackLabel}>
                {reel.paused || reel.reducedMotion ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
              </button>
              {!active && <button onClick={() => reel.move(1)} disabled={reel.screenings.length < 2} aria-label="Next scene"><ChevronRight size={16} aria-hidden="true" /></button>}
            </div>
          </div>}
        </> : <div>
          <p className="theater-program-line">{warming ? 'Bringing your stories to the screen.' : unavailable ? 'Stills unavailable. Your case files are safe.' : games.length ? 'Your case files are ready. New scenes will appear here.' : 'The screen is waiting for your first story.'}</p>
          {unavailable && <button className="theater-retry" onClick={() => { reel.retryImages(); if (historyError) onRetryHistory(); }}><RotateCcw size={14} aria-hidden="true" />Retry projection</button>}
        </div>}
      </div>
      {active && !imageUrl && reel.failedCount > 0 && !reel.pending && <p className="theater-archive-status">Your game is safe. Artwork unavailable. <button onClick={reel.retryImages}>Retry artwork</button></p>}
      {!active && current && historyError && <p className="theater-archive-status">Archive reconnecting · Showing saved case files <button onClick={onRetryHistory}>Retry</button></p>}
    </section>
  );
};
