import { useEffect, useRef, useState } from 'react';

interface ProjectorLeaderProps {
  /** Line under the leader, e.g. "Developing" or "The projector is warming up". */
  label?: string;
  /** Rendered size. 'sm' suits an inline story panel, 'lg' fills an image frame. */
  size?: 'sm' | 'lg';
  className?: string;
}

const formatElapsed = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * An Academy countdown leader — the sweeping hand and crosshairs spliced onto
 * the head of a film reel — with a running clock in the gate.
 *
 * This used to tick 8…1 and loop. Generation has no knowable duration, so those
 * numerals counted down to a moment that never arrived and then reset, which
 * reads as a stall. The clock counts *up* instead: every digit it shows is
 * true, and a long wait looks like a long wait rather than a broken countdown.
 */
export const ProjectorLeader = ({ label, size = 'lg', className = '' }: ProjectorLeaderProps) => {
  const [elapsed, setElapsed] = useState(0);
  // Honour a reduced-motion preference: the sweep stops. The clock keeps
  // running — it is information, not decoration.
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    // Derive from a start timestamp rather than incrementing a counter, so a
    // backgrounded tab (where timers are throttled) resumes with the true time
    // rather than an undercount.
    const startedAt = Date.now();
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const dimension = size === 'lg' ? 'w-40 h-40 sm:w-48 sm:h-48' : 'w-20 h-20';

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`relative ${dimension}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" role="presentation">
          {/* Crosshair rules, running the full frame as on real leader */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.35" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.35" />

          <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.75" opacity="0.4" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.25" />

          {/* The sweep: one revolution per second */}
          <g
            style={
              reducedMotion
                ? undefined
                : { transformOrigin: '50% 50%', animation: 'leader-sweep 1s linear infinite' }
            }
          >
            <path d="M 50 50 L 50 4 A 46 46 0 0 1 96 50 Z" fill="hsl(var(--primary) / 0.16)" />
            <line x1="50" y1="50" x2="50" y2="4" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.8" />
          </g>
        </svg>

        {/* Elapsed time, sitting in the middle of the sweep */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`font-display tabular-nums text-foreground/90 tracking-[0.08em] ${
              size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-lg'
            }`}
          >
            {formatElapsed(elapsed)}
          </span>
        </div>
      </div>

      {label && (
        <p className="type-caption uppercase text-muted-foreground text-center px-4">
          {label}
        </p>
      )}
    </div>
  );
};
