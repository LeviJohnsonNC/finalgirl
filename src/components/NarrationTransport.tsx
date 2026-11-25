import { useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface NarrationTransportProps {
  elapsed: number;
  duration: number;
  paused?: boolean;
  buffering?: boolean;
  complete?: boolean;
  onPauseResume?: () => void;
  onSeek?: (seconds: number) => void;
}

const timecode = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export const NarrationTransport = ({ elapsed, duration, paused, buffering, complete = true, onPauseResume, onSeek }: NarrationTransportProps) => {
  // While streaming, duration is only the received audio. Freeze that interval
  // for each gesture so newly arrived packets can't move the target under it.
  const [seekLimit, setSeekLimit] = useState<number | null>(null);
  const end = seekLimit ?? duration;
  const ready = complete && duration > 0;
  const beginSeek = () => setSeekLimit(previous => previous ?? duration);
  const endSeek = () => setSeekLimit(null);
  return (
    <div className="narration-transport" aria-label="Narration player">
      {onPauseResume && <button type="button" onClick={onPauseResume} aria-label={paused ? 'Resume narration' : 'Pause narration'} title={paused ? 'Resume' : 'Pause'}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
      {onSeek && <button type="button" onClick={() => onSeek(Math.max(0, elapsed - 10))} aria-label="Rewind narration 10 seconds" title="Back 10 seconds"><RotateCcw size={15} /><span className="sr-only">10 seconds</span></button>}
      <span className="narration-timecode">{timecode(elapsed)}</span>
      <div className="narration-seek" data-pending={!ready && seekLimit === null}>
        <input type="range" min={0} max={Math.max(.01, end)} step={.1} value={Math.min(elapsed, end)} disabled={!duration || !onSeek}
          onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); beginSeek(); }}
          onPointerUp={endSeek} onLostPointerCapture={endSeek} onPointerCancel={endSeek}
          onKeyDown={event => { if (['Home', 'End', 'PageUp', 'PageDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) beginSeek(); }}
          onKeyUp={endSeek} onBlur={endSeek} onChange={event => onSeek?.(Number(event.target.value))}
          aria-label="Seek narration" title={ready ? 'Seek narration' : 'Seek within the audio loaded so far'}
          aria-valuetext={ready ? `${timecode(elapsed)} of ${timecode(duration)}` : `${timecode(elapsed)} elapsed, ${timecode(end)} available to seek`} />
      </div>
      <span className="narration-timecode" title={ready ? 'Total duration' : 'Total duration available when loading finishes'}>{ready ? timecode(duration) : '--:--'}</span>
      <span className="sr-only" role="progressbar" aria-label="Narration progress" aria-valuemin={0}
        aria-valuemax={ready ? Math.max(1, Math.round(duration)) : undefined} aria-valuenow={ready ? Math.round(elapsed) : undefined} />
      <span className="sr-only" role="status">{buffering ? 'Buffering narration' : paused ? 'Narration paused' : 'Narration playing'}</span>
      <span className="narration-buffering" data-buffering={Boolean(buffering)} aria-hidden="true" title={buffering ? 'Buffering' : undefined} />
    </div>
  );
};
