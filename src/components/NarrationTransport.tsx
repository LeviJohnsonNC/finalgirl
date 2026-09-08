interface NarrationTransportProps {
  elapsed: number;
  duration: number;
}

const timecode = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Tape counter for narration playback. A narration runs for minutes, and a bare
 * Stop button gives no sense of how much is left — this is the VCR readout that
 * answers it.
 */
export const NarrationTransport = ({ elapsed, duration }: NarrationTransportProps) => {
  const pct = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <div className="flex items-center gap-3 w-full max-w-md mx-auto px-2">
      <span className="type-caption text-secondary neon-text tabular-nums">
        {timecode(elapsed)}
      </span>

      <div
        className="relative flex-1 h-1.5 bg-muted/30 rounded-sm overflow-hidden"
        role="progressbar"
        aria-label="Narration progress"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(elapsed)}
      >
        <div
          className="absolute inset-y-0 left-0 bg-secondary/70 transition-[width] duration-300 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>

      <span className="type-caption text-muted-foreground tabular-nums">
        {duration > 0 ? timecode(duration) : '--:--'}
      </span>
    </div>
  );
};
