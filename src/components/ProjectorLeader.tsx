import { useEffect, useRef, useState } from 'react';

interface ProjectorLeaderProps {
  /** Line under the leader, e.g. "Developing" or "The projector is warming up". */
  label?: string;
  /** Rendered size. 'sm' suits an inline story panel, 'lg' fills an image frame. */
  size?: 'sm' | 'lg';
  className?: string;
}

const COUNT_START = 8;

/**
 * An Academy countdown leader — the sweeping hand, crosshairs and ticking
 * numerals spliced onto the head of a film reel.
 *
 * This replaces a generic border-spinner. The app already talks about
 * projectors warming up; the wait should look like the thing it claims to be.
 * The count runs down and loops, because generation has no knowable duration —
 * it reads as "the reel is running", not as a progress bar that lies.
 */
export const ProjectorLeader = ({ label, size = 'lg', className = '' }: ProjectorLeaderProps) => {
  const [count, setCount] = useState(COUNT_START);
  // Honour a reduced-motion preference: the sweep and the flicker stop, the
  // numeral stays put, and the label alone carries the "still working" message.
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    if (reducedMotion) return;
    const tick = setInterval(() => {
      setCount((n) => (n <= 1 ? COUNT_START : n - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [reducedMotion]);

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

          {/* The sweep: one revolution per second, matching the count */}
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

          <circle cx="50" cy="50" r="2" fill="hsl(var(--primary))" />
        </svg>

        {/* The numeral, sitting in the middle of the sweep */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`font-display text-foreground/90 ${size === 'lg' ? 'text-5xl sm:text-6xl' : 'text-2xl'}`}
            style={reducedMotion ? undefined : { animation: 'leader-numeral 1s steps(1) infinite' }}
          >
            {count}
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
