import * as React from 'react';
import { Pause, Play } from 'lucide-react';
import { TICKER_HEADLINES } from '@/data/tickerHeadlines';
import '@/styles/news-ticker.css';

const shuffleArray = <T,>(array: readonly T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const NewsTicker = React.memo(React.forwardRef<HTMLDivElement>(
  (_, ref) => {
    const headlines = React.useMemo(() => shuffleArray(TICKER_HEADLINES), []);
    const groupRef = React.useRef<HTMLDivElement>(null);
    const [duration, setDuration] = React.useState(1200);
    const [paused, setPaused] = React.useState(false);

    // Each copy has exactly the same width. Travel at a steady 48px/second,
    // including after fonts load, regardless of the size of the headline pool.
    React.useEffect(() => {
      const group = groupRef.current;
      if (!group) return;
      const measure = () => setDuration(Math.max(1, group.getBoundingClientRect().width / 48));
      const observer = new ResizeObserver(measure);
      observer.observe(group);
      measure();
      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref} className="news-broadcast" role="region" aria-label="Night Watch local bulletins" data-paused={paused}>
        <div className="news-station" aria-hidden="true">
          <span className="news-station-name">NIGHT WATCH</span>
          <span className="news-station-frequency"><i /> LOCAL / 87.9 FM</span>
        </div>
        <span className="news-cue" aria-hidden="true">›››</span>
        <div className="news-viewport" tabIndex={0} aria-label="Headlines. Focus or hover to pause.">
          <div className="news-ticker" style={{ animationDuration: `${duration}s` }}>
            {[0, 1].map(copy => (
              <div className="news-ticker-group" ref={copy === 0 ? groupRef : undefined} key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {headlines.map(headline => {
                  const colon = headline.indexOf(':');
                  return (
                    <span className="news-headline" key={headline}>
                      <span className="news-headline-text"><span className="news-headline-source">{headline.slice(0, colon + 1)}</span>{headline.slice(colon + 1)}</span>
                      <span className="news-separator" aria-hidden="true">◆</span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <button type="button" className="news-pause" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Resume news ticker' : 'Pause news ticker'} aria-pressed={paused}>
          {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
        </button>
      </div>
    );
  }
));
NewsTicker.displayName = 'NewsTicker';
