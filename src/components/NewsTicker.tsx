import * as React from 'react';
import { useMemo } from 'react';
import { TICKER_HEADLINES } from '@/data/tickerHeadlines';

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// memo: content is static after mount; no reason to reconcile this subtree
// when the page shell re-renders.
export const NewsTicker = React.memo(React.forwardRef<HTMLDivElement>(
  (_, ref) => {
    // Shuffle headlines once on mount, then duplicate for seamless loop
    const tickerContent = useMemo(() => {
      const shuffled = shuffleArray(TICKER_HEADLINES);
      return [...shuffled, ...shuffled];
    }, []);
    
    return (
      <div 
        ref={ref}
        className="fixed bottom-11 sm:bottom-14 left-0 right-0 z-40 bg-black/95 border-t border-b border-primary/30 overflow-hidden"
      >
        <div className="relative h-7 sm:h-8 flex items-center">
          {/* Breaking news badge */}
          <div className="absolute left-0 z-10 h-full flex items-center px-2 sm:px-3 bg-gradient-to-r from-black via-black to-transparent pr-8">
            <span className="font-vhs text-[10px] sm:text-xs text-primary uppercase tracking-wider blood-glow animate-pulse">
              ⚠ ALERT ⚠
            </span>
          </div>
          
          {/* Scrolling ticker content */}
          <div className="news-ticker flex items-center whitespace-nowrap pl-24 sm:pl-28">
            {tickerContent.map((headline, idx) => (
              <span key={idx} className="inline-flex items-center">
                <span className="font-vhs text-[10px] sm:text-xs text-amber-400/90 uppercase tracking-wide">
                  {headline}
                </span>
                <span className="mx-32 sm:mx-48 text-primary/60">◆</span>
              </span>
            ))}
          </div>
          
          {/* Right fade overlay */}
          <div className="absolute right-0 z-10 h-full w-8 sm:w-12 bg-gradient-to-l from-black to-transparent" />
        </div>
      </div>
    );
  }
));

NewsTicker.displayName = 'NewsTicker';
