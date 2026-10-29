import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { readStoredValue } from '@/hooks/useLocalStorage';
import { ModuleArtwork, type ModuleArt } from './ModuleArtwork';
import '@/styles/play-modules.css';

export function ModulePanel({ id, title, kind, summary, art, preferenceKey, children }: {
  id: string; title: string; kind: 'Killer' | 'Location'; summary: string;
  art: ModuleArt; preferenceKey: string; children: ReactNode;
}) {
  const [open, setOpen] = useState(() => readStoredValue<boolean>(preferenceKey, false) === true);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    // A display preference is local, never a Play observation or cloud write.
    try { localStorage.setItem(preferenceKey, JSON.stringify(next)); } catch { /* Display remains usable without storage. */ }
  };
  return <details className={`play-module-panel${id === 'hans' || id === 'camp' ? ' play-camp-panel' : ''}${id === 'hans' ? ' play-hans-panel' : ''}`}
    data-module={id} open={open}>
    <summary onClick={event => { event.preventDefault(); toggle(); }}>
      <ModuleArtwork art={art} />
      <span className="play-module-heading"><small className="play-module-kind">{kind}</small><h2>{title}</h2><span className="play-module-summary">{summary}</span></span>
      <span className="play-module-frame" aria-hidden="true" />
      <span className="play-module-disclosure" aria-hidden="true"><ChevronDown className="play-module-chevron" /></span>
    </summary>
    <div className="play-module-content">{children}</div>
  </details>;
}
