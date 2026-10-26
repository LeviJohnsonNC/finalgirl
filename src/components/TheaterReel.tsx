import { useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
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
  onResume?: () => void;
  activeGame?: ActiveGame | null;
  actions?: ReactNode;
}

export const TheaterReel = ({ games, loading, historyError, onRetryHistory, onOpenCaseFile, onResume, activeGame, actions }: TheaterReelProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const active = !showArchive ? activeGame : null;
  const reel = useTheaterReel(games, hovered || focused, active);
  const { current, previous } = reel;
  const selection = active?.selection ?? current;
  const title = selection ? `${selection.finalGirl} vs. ${selection.killer}` : '';
  const date = current && !active ? screeningDate(current.timestamp) : '';
  const warming = loading || (reel.pending && !current);
  const unavailable = !warming && !current && (reel.failedCount > 0 || Boolean(historyError));
  const verdict = active ? 'In progress' : current ? screeningVerdict(current) : '';
  const openCase = active ? onResume : current && onOpenCaseFile ? () => onOpenCaseFile(current.id) : undefined;
  // The carousel now spans the scenery; only picture/marquee interaction pauses it.
  const isProjectionTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('.theater-screen, .theater-program'));
  const lower = <>
    <div className={`theater-program ${selection ? 'theater-program-personal' : 'theater-program-empty'} ${activeGame ? 'theater-program-active' : ''}`}>
      {selection && openCase && <button type="button" className="theater-case-target" aria-label={`${active ? 'Resume case' : 'Open case file'} for ${title}`} onClick={openCase} />}
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
          </div>
          {active && <p className="theater-progress-line">{activeScreeningStatus(active)}</p>}
        </div>
        <p className={`theater-verdict ${active ? 'theater-in-progress theater-verdict-long' : current?.outcome === 'won' ? 'theater-survived' : 'theater-lost'}`} aria-label={verdict}>{verdict}</p>
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
    onPointerOver={event => { if (event.pointerType === 'mouse' && isProjectionTarget(event.target) && !isProjectionTarget(event.relatedTarget)) { setHovered(true); } }}
    onPointerOut={event => { if (event.pointerType === 'mouse' && !isProjectionTarget(event.relatedTarget)) setHovered(false); }}
    onFocusCapture={event => { if (isProjectionTarget(event.target)) { setFocused(true); } }}
    onBlurCapture={event => { if (!isProjectionTarget(event.relatedTarget)) setFocused(false); }}>
    <DriveInScreen lower={lower} busy={reel.pending || (!active && loading)} projecting={Boolean(current) && reel.playing}>
      {current ? <ProjectorSlideshow current={current} previous={previous} reducedMotion={reel.reducedMotion} onImageError={reel.fail} /> : <div className="theater-title-card">
        <img src={openingStill} alt="" className="theater-title-art" />
      </div>}
    </DriveInScreen>
  </section>;
};
