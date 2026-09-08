import { useEffect, useRef, useState } from 'react';

interface StickyOutcomeBarProps {
  /** The buttons themselves — the page owns what the outcome means. */
  children: React.ReactNode;
  /** Hide the bar while this is false (e.g. before the story has finished). */
  enabled: boolean;
}

/**
 * Docks the outcome buttons to the bottom of the viewport once the page's own
 * copy of them has scrolled out of sight.
 *
 * A game runs for an hour or more; when it ends, recording the result should
 * not mean scrolling to the foot of a thousand-word story to find the button.
 */
export const StickyOutcomeBar = ({ children, enabled }: StickyOutcomeBarProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) {
      setDocked(false);
      return;
    }

    // Dock only while the inline buttons are off-screen. Showing both at once
    // would be a duplicate control sitting directly on top of itself.
    const observer = new IntersectionObserver(
      ([entry]) => setDocked(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <>
      {/* The buttons in their natural place at the end of the story. The
          sentinel is this row itself: once it scrolls away, the dock appears. */}
      <div
        ref={sentinelRef}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8 px-2"
      >
        {children}
      </div>

      {/* The dock sits on top of the footer and covers the news ticker
          outright: it is opaque and outranks the ticker's z-40. It used to be
          bottom-0 / z-40, which put it *under* the z-50 footer and let the
          ticker scroll across the buttons. While the dock is up the alert crawl
          is not what you are looking for. */}
      {enabled && docked && (
        <div
          style={{ bottom: 'var(--app-footer-h, 56px)' }}
          className="fixed left-0 right-0 z-50 border-t border-b border-border/60 bg-background px-3 py-3 sm:py-4 animate-in slide-in-from-bottom duration-300"
        >
          <div className="scanlines pointer-events-none absolute inset-0 opacity-10" />
          <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      )}
    </>
  );
};
