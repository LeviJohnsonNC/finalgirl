import { useRef, useEffect } from 'react';

interface SubTab {
  id: string;
  label: string;
}

interface RuleSubTabsProps {
  tabs: SubTab[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const RuleSubTabs = ({ tabs, activeId, onSelect }: RuleSubTabsProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Keep active tab visible on mobile horizontal scroll
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const active = scroller.querySelector<HTMLButtonElement>(`[data-tab-id="${activeId}"]`);
    if (active) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scroller.scrollTo({ left: active.offsetLeft - scroller.clientWidth / 2 + active.offsetWidth / 2, behavior: reducedMotion ? 'instant' : 'smooth' });
    }
  }, [activeId]);

  if (tabs.length <= 1) return null;

  return (
    <div className="binder-tabs-wrap relative -mx-1">
      <div
        ref={scrollerRef}
        className="binder-tabs flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-thin"
        role="tablist"
        aria-label="Chapter sections"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              id={`rule-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="rule-section-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              onKeyDown={event => {
                const index = tabs.findIndex(item => item.id === tab.id);
                const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
                  : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
                  : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
                if (next < 0) return;
                event.preventDefault();
                onSelect(tabs[next].id);
                document.getElementById(`rule-tab-${tabs[next].id}`)?.focus({ preventScroll: true });
              }}
              className={`binder-tab font-vhs text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap px-3 py-1.5 transition-all ${
                isActive ? 'binder-tab-active' : ''
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
