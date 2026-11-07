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
/** Compact tape transport; the growing seek range represents received audio, never fake progress. */
export const NarrationTransport = ({ elapsed, duration, paused, buffering, complete = true, onPauseResume, onSeek }: NarrationTransportProps) => (
  <div className="narration-transport" aria-label="Narration player">
    {onPauseResume && <button type="button" onClick={onPauseResume} aria-label={paused ? 'Resume narration' : 'Pause narration'} title={paused ? 'Resume' : 'Pause'}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
    {onSeek && <button type="button" onClick={() => onSeek(Math.max(0, elapsed - 10))} aria-label="Rewind narration 10 seconds" title="Back 10 seconds"><RotateCcw size={15} /><span className="sr-only">10 seconds</span></button>}
    <span className="narration-timecode">{timecode(elapsed)}</span>
    <div className="narration-seek">
      <input type="range" min={0} max={Math.max(.01, duration)} step={.1} value={Math.min(elapsed, duration)} disabled={!duration || !onSeek} onChange={event => onSeek?.(Number(event.target.value))} aria-label="Seek narration" aria-valuetext={`${timecode(elapsed)} of ${timecode(duration)}${complete ? '' : ' buffered'}`} />
    </div>
    <span className="narration-timecode" title={complete ? 'Total duration' : 'Audio received so far'}>{duration > 0 ? `${timecode(duration)}${complete ? '' : '+'}` : '--:--'}</span>
    <span className="sr-only" role="progressbar" aria-label="Narration progress" aria-valuemin={0} aria-valuemax={Math.max(1, Math.round(duration))} aria-valuenow={Math.round(elapsed)} />
    <span className="sr-only" role="status">{buffering ? 'Buffering narration' : paused ? 'Narration paused' : 'Narration playing'}</span>
    {buffering && <span className="narration-buffering" aria-hidden="true" title="Buffering" />}
  </div>
);
