import { memo, useEffect, useState } from 'react';

/**
 * Self-contained ticking clock for the VCR footer.
 *
 * The per-second interval lives HERE, not in the page shell: when this state
 * updated inside Index.tsx it re-rendered the entire mounted page tree
 * (casting room, scrapbooks, ticker, ...) once a second for no reason.
 */
const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

export const VCRTime = memo(() => {
  const now = useNow();
  return (
    <span className="font-vhs text-[10px] sm:text-xs text-secondary neon-text">
      {now.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
});
VCRTime.displayName = 'VCRTime';

export const VCRDate = memo(() => {
  const now = useNow();
  return <>{now.toLocaleDateString()}</>;
});
VCRDate.displayName = 'VCRDate';
