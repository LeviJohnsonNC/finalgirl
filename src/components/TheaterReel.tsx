import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Expand, Pause, Play, RotateCcw } from 'lucide-react';
import type { GameResult } from '@/hooks/useGameHistory';
import { useTheaterReel } from '@/hooks/useTheaterReel';
import { activeScreeningStatus, screeningDate } from '@/lib/theater';
import type { ActiveGame } from '@/lib/activeGame';
import openingStill from '@/assets/theater-opening.jpg';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [expanded, setExpanded] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const active = !showArchive ? activeGame : null;
  const reel = useTheaterReel(games, hovered || focused || expanded, active);
  const { current, previous } = reel;
  const selection = active?.selection ?? current;
  const title = selection ? `${selection.finalGirl} vs. ${selection.killer}` : '';
  const imageUrl = current?.imageUrl;
  const imageKind = current?.kind;
  const pictureKey = current?.key;
  const warming = loading || (reel.pending && !current);
  const unavailable = !warming && !current && (reel.failedCount > 0 || Boolean(historyError));

  useEffect(() => { setExpanded(false); }, [pictureKey]);

  const viewer = imageUrl && selection ? <Dialog open={expanded} onOpenChange={setExpanded}>
    <DialogTrigger asChild><button aria-label="View projected artwork full size"><Expand size={17} aria-hidden="true" /></button></DialogTrigger>
    <DialogContent className="theater-lightbox max-w-[94vw] sm:max-w-5xl p-3 sm:p-5 bg-background border-border">
      <DialogTitle className="pr-12 font-display text-xl">{title}</DialogTitle>
      <img src={imageUrl} alt={`${imageKind === 'scene' ? 'Scene' : 'Poster'} for ${title} at ${selection.location}`} className="w-full max-h-[72dvh] object-contain" />
      <DialogDescription className="font-vhs text-lg text-muted-foreground">{selection.location} · {imageKind === 'scene' ? 'Original scene still' : 'Movie poster'}</DialogDescription>
    </DialogContent>
  </Dialog> : null;

  return (
    <section className="theater-reel" aria-label="Personal screenings" aria-roledescription="carousel"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}>
      {activeGame ? <div className="theater-mode-switch" role="group" aria-label="Screening selection">
        <button aria-pressed={!showArchive} onClick={() => setShowArchive(false)}>Now playing</button>
        <button aria-pressed={showArchive} onClick={() => setShowArchive(true)}>Past screenings</button>
      </div> : <div className="theater-billing"><span />{current ? 'From your case files' : 'Tonight’s feature'}<span /></div>}
      <div className="theater-screen-wrap">
        <div className="theater-screen" aria-busy={reel.pending || (!active && loading)}>
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
          <div className="theater-screen-texture" aria-hidden="true" />
        </div>
        <span className="theater-screen-foot theater-screen-foot-left" aria-hidden="true" />
        <span className="theater-screen-foot theater-screen-foot-right" aria-hidden="true" />
      </div>

      <div className={`theater-program ${selection ? 'theater-program-personal' : ''}`}>
        {selection ? <>
          <div className="theater-caption" aria-live={active || reel.playing ? 'off' : 'polite'} aria-atomic="true">
            <h2>{title}</h2>
            <p>{selection.location}<span aria-hidden="true"> · </span><span className={active ? 'theater-in-progress' : current?.outcome === 'won' ? 'theater-survived' : 'theater-lost'}>{active ? 'In progress' : current?.outcome === 'won' ? 'Survived' : 'Lost to the night'}</span></p>
            <div className="theater-case-line">
              {active ? <p className="theater-progress-line">{activeScreeningStatus(active)}</p> : current && <>
                {screeningDate(current.timestamp) && <time dateTime={new Date(current.timestamp).toISOString()}>{screeningDate(current.timestamp)}</time>}
                {onOpenCaseFile && <button onClick={() => onOpenCaseFile(current.id)}>Open case file <ArrowUpRight size={14} aria-hidden="true" /></button>}
              </>}
            </div>
          </div>
          {(!active || imageUrl) && <div className="theater-reel-controls">
            <div className="theater-transport" role="group" aria-label="Projection controls">
              {!active && <><button onClick={() => reel.move(-1)} disabled={reel.screenings.length < 2} aria-label="Previous scene"><ChevronLeft size={19} aria-hidden="true" /></button>
              <button onClick={() => reel.setPaused(!reel.paused)} disabled={reel.reducedMotion || reel.screenings.length < 2}
                aria-label={reel.reducedMotion ? 'Automatic playback off for reduced motion' : reel.paused ? 'Play slideshow' : 'Pause slideshow'}>
                {reel.paused || reel.reducedMotion ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
              </button>
              <button onClick={() => reel.move(1)} disabled={reel.screenings.length < 2} aria-label="Next scene"><ChevronRight size={19} aria-hidden="true" /></button></>}
              {viewer}
            </div>
            {!active && <span className="theater-reel-position" role="status">{reel.pending ? 'Loading scene…' : `${String(reel.currentIndex + 1).padStart(2, '0')} / ${String(reel.screenings.length).padStart(2, '0')}`}</span>}
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
