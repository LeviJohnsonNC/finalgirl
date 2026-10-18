import { useState, type ReactNode } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import type { GameResult } from '@/hooks/useGameHistory';
import { useTheaterReel } from '@/hooks/useTheaterReel';
import { activeScreeningStatus, screeningDate, screeningVerdict } from '@/lib/theater';
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
  actions?: ReactNode;
}

export const TheaterReel = ({ games, loading, historyError, onRetryHistory, onOpenCaseFile, activeGame, actions }: TheaterReelProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [explicitPlayback, setExplicitPlayback] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const active = !showArchive ? activeGame : null;
  const reel = useTheaterReel(games, (hovered || focused) && !explicitPlayback, active);
  const { current, previous } = reel;
  const selection = active?.selection ?? current;
  const title = selection ? `${selection.finalGirl} vs. ${selection.killer}` : '';
  const date = current && !active ? screeningDate(current.timestamp) : '';
  const warming = loading || (reel.pending && !current);
  const unavailable = !warming && !current && (reel.failedCount > 0 || Boolean(historyError));
  const playbackLabel = reel.reducedMotion ? 'Automatic playback off for reduced motion'
    : `${reel.paused ? 'Play' : 'Pause'} ${active ? 'projection' : 'slideshow'}`;
  const verdict = active ? 'In progress' : current ? screeningVerdict(current) : '';
  // The carousel now spans the scenery; only picture/marquee interaction pauses it.
  const isProjectionTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('.theater-screen, .theater-program'));
  const lower = <>
    <div className={`theater-program ${selection ? 'theater-program-personal' : ''} ${activeGame ? 'theater-program-active' : ''}`}>
      {activeGame && <div className="theater-mode-switch" role="group" aria-label="Screening selection">
        <button aria-pressed={!showArchive} onClick={() => setShowArchive(false)}>Now playing</button>
        <button aria-pressed={showArchive} onClick={() => setShowArchive(true)}>Past screenings</button>
      </div>}
      {selection ? <>
        <div className="theater-caption" aria-live={active || reel.playing ? 'off' : 'polite'} aria-atomic="true">
          <h2 aria-label={title}>{title}</h2>
          <div className="theater-caption-details">
            <span>{selection.location}</span>
            {date && <><span aria-hidden="true" className="theater-meta-divider">|</span><time dateTime={new Date(current!.timestamp).toISOString()}>{date}</time></>}
            {!active && current && onOpenCaseFile && <><span aria-hidden="true" className="theater-meta-divider">|</span><button className="theater-caption-link" aria-label={`Open case file for ${title}`} onClick={() => onOpenCaseFile(current.id)}>Open case<ArrowUpRight size={12} aria-hidden="true" /></button></>}
          </div>
          {active && <p className="theater-progress-line">{activeScreeningStatus(active)}</p>}
        </div>
        <p className={`theater-verdict ${active ? 'theater-in-progress' : current?.outcome === 'won' ? 'theater-survived' : 'theater-lost'}`}>{verdict}</p>
        {(!active || current) && <div className="theater-reel-controls"><div className="theater-transport" role="group" aria-label="Projection controls">
          {!active && <button onClick={() => reel.move(-1)} disabled={reel.screenings.length < 2} aria-label="Previous scene"><ChevronLeft size={16} aria-hidden="true" /></button>}
          <button onClick={() => { if (reel.paused) setExplicitPlayback(true); reel.setPaused(!reel.paused); }} disabled={reel.reducedMotion || !current} aria-label={playbackLabel}>
            {reel.paused || reel.reducedMotion ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
          {!active && <button onClick={() => reel.move(1)} disabled={reel.screenings.length < 2} aria-label="Next scene"><ChevronRight size={16} aria-hidden="true" /></button>}
        </div></div>}
      </> : <div className="theater-empty-program">
        <p className="theater-program-kicker">{warming ? 'Preparing the feature' : unavailable ? 'The archive is safe' : 'Tonight at Starlight'}</p>
        <p className="theater-program-line">{warming ? 'Bringing your stories to the screen.' : unavailable ? 'Stills unavailable. Your case files are safe.' : games.length ? 'Your case files are ready. New scenes will appear here.' : 'The screen is waiting for your first story.'}</p>
        {unavailable && <button className="theater-retry" onClick={() => { reel.retryImages(); if (historyError) onRetryHistory(); }}><RotateCcw size={14} aria-hidden="true" />Retry projection</button>}
      </div>}
    </div>
    {active && !current?.imageUrl && reel.failedCount > 0 && !reel.pending && <p className="theater-archive-status">Your game is safe. Artwork unavailable. <button onClick={reel.retryImages}>Retry artwork</button></p>}
    {!active && current && historyError && <p className="theater-archive-status">Archive reconnecting · Showing saved case files <button onClick={onRetryHistory}>Retry</button></p>}
    {actions}
  </>;
  return <section className="theater-reel" aria-label="Personal screenings" aria-roledescription="carousel"
    onPointerOver={event => { if (event.pointerType === 'mouse' && isProjectionTarget(event.target) && !isProjectionTarget(event.relatedTarget)) { setHovered(true); setExplicitPlayback(false); } }}
    onPointerOut={event => { if (event.pointerType === 'mouse' && !isProjectionTarget(event.relatedTarget)) setHovered(false); }}
    onFocusCapture={event => { if (isProjectionTarget(event.target)) { setFocused(true); setExplicitPlayback(false); } }}
    onBlurCapture={event => { if (!isProjectionTarget(event.relatedTarget)) setFocused(false); }}>
    <DriveInScreen lower={lower} busy={reel.pending || (!active && loading)} projecting={Boolean(current) && reel.playing}>
      {current ? <ProjectorSlideshow current={current} previous={previous} reducedMotion={reel.reducedMotion} onImageError={reel.fail} /> : <div className="theater-title-card">
        <img src={openingStill} alt="" className="theater-title-art" />
        <div className="theater-title-copy">
          <span className="theater-kicker">{active ? 'A feature in progress' : warming ? 'Projector warming up…' : 'An evening of terrible possibilities'}</span>
          <h2>{active ? <>The night<br /><em>isn’t over.</em></> : <>Some nights<br /><em>stay with you.</em></>}</h2>
          <span className="theater-title-rule" /><p>{active ? 'Your story is right where you left it.' : 'Your cast. Your story. Your last chance.'}</p>
        </div>
      </div>}
    </DriveInScreen>
  </section>;
};
