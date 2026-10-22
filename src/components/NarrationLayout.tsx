import { useLayoutEffect, useRef, type ReactNode } from 'react';
import '@/styles/narration.css';
import '@/styles/ending.css';
import { ProjectorLeader } from '@/components/ProjectorLeader';
import { renderStoryText } from '@/lib/textFormatting';

interface NarrationLayoutProps {
  background: string;
  kind: 'opening' | 'ending';
  heading: ReactNode;
  controls: ReactNode;
  children: ReactNode;
  image?: ReactNode;
}

/** A film's opening and closing spread share one composition and material palette. */
export const NarrationLayout = ({ background, kind, heading, controls, children, image }: NarrationLayoutProps) => (
  <section className={`narration-layout narration-layout--${kind}${image ? '' : ' narration-layout--text-only'}`}>
    <div className="narration-backdrop" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
    <div className="narration-shade" aria-hidden="true" />
    {kind === 'ending' ? <>
      <header className="ending-header">
        <div className="narration-heading">{heading}</div>
        <div className="narration-controls">{controls}</div>
      </header>
      <div className="ending-body">
        {children}
        {image && <aside className="narration-art" aria-label="Closing movie poster">{image}</aside>}
      </div>
    </> : <>
      <div className="narration-copy">
        <header className="narration-heading">{heading}</header>
        <div className="narration-controls">{controls}</div>
        {children}
      </div>
      {image && <aside className="narration-art" aria-label="Opening scene photograph">{image}</aside>}
    </>}
  </section>
);

/** Keep connecting words ivory; the film's subject is the blood-red second line. */
export const NarrationTitle = ({ title, ending = false }: { title: string; ending?: boolean }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const heading = titleRef.current;
    if (!heading) return;
    const fit = () => {
      if (!heading.clientWidth) return;
      heading.style.setProperty('--title-fit', '1');
      const lines = Array.from(heading.children) as HTMLElement[];
      lines.forEach(line => { line.style.width = 'max-content'; });
      const width = Math.max(...lines.map(line => line.getBoundingClientRect().width));
      lines.forEach(line => { line.style.removeProperty('width'); });
      if (width > 0) heading.style.setProperty('--title-fit', String(Math.min(1, (heading.clientWidth - 2) / width)));
    };
    fit();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    observer?.observe(heading);
    let alive = true;
    void document.fonts?.ready.then(() => { if (alive) fit(); });
    return () => { alive = false; observer?.disconnect(); };
  }, [title, ending]);

  if (ending) return <h1 ref={titleRef} className="narration-title narration-title--ending"><span>The <em>End</em></span></h1>;
  const split = title.match(/^(.+?)\s+(at|of|from|in|on|to)\s+(.+)$/i);
  if (split) return <h1 ref={titleRef} className="narration-title" aria-label={title}><span>{split[1]}</span><span>{split[2]} <em>{split[3]}</em></span></h1>;
  const words = title.split(/\s+/);
  const last = words.length > 3 ? 2 : 1;
  return <h1 ref={titleRef} className="narration-title" aria-label={title}><span>{words.slice(0, -last).join(' ')}</span><span><em>{words.slice(-last).join(' ')}</em></span></h1>;
};

interface NarrationReaderProps {
  kind: 'opening' | 'ending';
  story: string | null;
  isGenerating: boolean;
  error: string | null;
  onRetry: () => void;
  actions?: ReactNode;
}

export const NarrationReader = ({ kind, story, isGenerating, error, onRetry, actions }: NarrationReaderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    // The ending's grid supplies its height; the opening measures its stacked controls.
    if (!scroll || kind === 'ending') return;
    const resize = () => {
      const footer = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-footer-h')) || 44;
      const actionsHeight = scroll.nextElementSibling?.getBoundingClientRect().height ?? 0;
      const space = window.innerHeight - scroll.getBoundingClientRect().top - footer - actionsHeight - 28;
      scroll.style.setProperty('--reader-available', `${Math.max(200, space)}px`);
    };
    resize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    const copy = scroll.closest('.narration-copy');
    if (copy) observer?.observe(copy);
    window.addEventListener('resize', resize);
    let alive = true;
    void document.fonts?.ready.then(() => { if (alive) resize(); });
    return () => { alive = false; observer?.disconnect(); window.removeEventListener('resize', resize); };
  }, [kind]);

  return (
  <div className="narration-reader">
    <div className="narration-reader-edge" aria-hidden="true" />
    <div ref={scrollRef} className="narration-reader-scroll" role="region" aria-label={kind === 'opening' ? 'Opening narration' : 'Ending narration'} aria-busy={isGenerating} tabIndex={0}>
      {isGenerating ? (
        <div className="narration-reader-state"><ProjectorLeader label="The projector is warming up" /></div>
      ) : error ? (
        <div className="narration-reader-state" role="status">
          <p>{error}</p>
          <button className="narration-button narration-button--quiet" onClick={onRetry}>Try Again</button>
        </div>
      ) : story ? (
        <div className={`story-text story-text-dark narration-prose ${kind === 'opening' ? 'story-intro' : 'story-ending'}`}>{renderStoryText(story)}</div>
      ) : (
        <div className="narration-reader-state"><p>Waiting for the {kind === 'opening' ? 'story' : 'ending'}...</p></div>
      )}
    </div>
    {actions && <div className="narration-reader-actions">{actions}</div>}
  </div>
  );
};
