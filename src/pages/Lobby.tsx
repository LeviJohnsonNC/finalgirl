import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGameHistoryContext } from '@/contexts/GameHistoryContext';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { screeningDate } from '@/lib/theater';
import '@/styles/lobby.css';

const phoneQuery = '(max-width: 639px)';
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(phoneQuery);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
interface LobbyProps {
  onTheater: () => void;
  onScrapbooks: () => void;
  onStats: () => void;
  onRules: () => void;
  onCollection: () => void;
  onOpenCase: (id: string) => void;
}

export default function Lobby({ onTheater, onScrapbooks, onStats, onRules, onCollection, onOpenCase }: LobbyProps) {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { gameHistory, isLoading, loadError, retryLoadHistory, fetchGameDetails } = useGameHistoryContext();
  const phone = useSyncExternalStore(subscribe, () => window.matchMedia(phoneQuery).matches, () => false);
  const pageSize = phone ? 1 : 2;
  const [firstId, setFirstId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const [legacy, setLegacy] = useState<Record<string, string | null>>({});
  const attemptedLegacy = useRef(new Set<string>());
  const mounted = useRef(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const opener = useRef<HTMLButtonElement | null>(null);
  const posters = gameHistory.map(game => ({ ...game, posterImageUrl: game.posterImageUrl ?? legacy[game.id] ?? undefined })).filter(game => game.posterImageUrl || game.hasLegacyPoster)
    .sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id))
    .filter((game, index, all) => all.findIndex(other => other.id === game.id) === index);
  const index = Math.max(0, posters.findIndex(game => game.id === firstId));
  const start = Math.floor(index / pageSize) * pageSize;
  const visible = posters.slice(start, start + pageSize);
  const selected = posters.find(game => game.id === selectedId);
  const loading = authLoading || isLoading;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const visibleIds = visible.map(game => game.id).join(',');
  // Read only the visible legacy posters. Keep inline art in this page's memory
  // rather than putting multi-megabyte images back into localStorage.
  useEffect(() => {
    if (!user || loading || loadError) return;
    const batch = gameHistory.filter(game => visibleIds.split(',').includes(game.id) && game.hasLegacyPoster && !game.posterImageUrl && !attemptedLegacy.current.has(game.id));
    for (const game of batch) {
      attemptedLegacy.current.add(game.id);
      void fetchGameDetails(game.id).then(full => {
        if (mounted.current) setLegacy(old => ({ ...old, [game.id]: full?.posterImageUrl ?? null }));
      }).catch(() => { if (mounted.current) setLegacy(old => ({ ...old, [game.id]: null })); });
    }
  }, [user, loading, loadError, gameHistory, fetchGameDetails, visibleIds]);

  const move = (direction: number) => {
    const next = start + direction * pageSize;
    if (next >= 0 && next < posters.length) setFirstId(posters[next].id);
  };
  const fail = (url: string) => setFailed(old => new Set([...old, url]));
  const retry = (url: string) => setFailed(old => { const next = new Set(old); next.delete(url); return next; });
  const openPoster = (id: string, button: HTMLButtonElement) => { opener.current = button; setSelectedId(id); };
  const nav = <nav aria-label="Lobby navigation">
    <button aria-current="page">Lobby</button>
    <button onClick={onScrapbooks}>Scrapbooks</button>
    <button onClick={onStats}>Stats</button>
    <button onClick={onRules}>Rules</button>
    <button onClick={onCollection}>Collection</button>
  </nav>;

  return <div className="poster-lobby">
    <header className="lobby-header">
      <button className="lobby-brand" onClick={onTheater} aria-label="Final Girl home">
        <span>FINAL GIRL</span><small><b>Unofficial</b> Case Files</small>
      </button>
      {!authLoading && <button className="lobby-account" onClick={() => navigate('/auth')} aria-label={user ? 'Account' : 'Sign in'}>
        <Ticket size={17} aria-hidden="true" /><span>{user ? 'Account' : 'Sign in'}</span>
      </button>}
    </header>
    <main className="lobby-main" aria-label="Movie poster lobby">
      <button className="lobby-back" onClick={onTheater}><ArrowLeft size={15} aria-hidden="true" />Back to theater</button>
      <h1 className="lobby-title"><span>Starlight Lobby</span></h1>
      {visible.length ? <>
        <section className="lobby-gallery" aria-label="Your movie posters" tabIndex={0}
          onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }}
          onTouchStart={event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
          onTouchEnd={event => {
            const point = event.changedTouches[0], origin = touch.current; touch.current = null;
            if (!origin) return;
            const dx = point.clientX - origin.x, dy = point.clientY - origin.y;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) { suppressClickUntil.current = Date.now() + 400; move(dx < 0 ? 1 : -1); }
          }}
          onClickCapture={event => { if (event.detail > 0 && Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
          {visible.map(game => {
            const url = game.posterImageUrl, broken = !url || failed.has(url);
            const label = `${game.finalGirl} vs. ${game.killer} at ${game.location}`;
            const picture = url && <img src={url} alt={`Movie poster for ${label}`} decoding="async" onError={() => fail(url)} />;
            return <figure className="lobby-exhibit" key={`${game.id}:${url}`}>
              <div className="lobby-cabinet">
                {broken ? <div className="lobby-artwork lobby-artwork-unavailable"><p>{!url && legacy[game.id] === undefined ? 'Retrieving poster…' : 'Poster unavailable'}</p>{url ? <button onClick={() => retry(url)}>Retry poster</button> : legacy[game.id] === null && <button onClick={() => {
                  setLegacy(old => { const next = { ...old }; delete next[game.id]; return next; });
                  void fetchGameDetails(game.id).then(full => { if (mounted.current) setLegacy(old => ({ ...old, [game.id]: full?.posterImageUrl ?? null })); }).catch(() => { if (mounted.current) setLegacy(old => ({ ...old, [game.id]: null })); });
                }}>Retry poster</button>}</div>
                  : <button className="lobby-artwork" onClick={event => openPoster(game.id, event.currentTarget)} aria-label={`View poster for ${label}`}>{picture}</button>}
              </div>
              <figcaption>
                {screeningDate(game.timestamp) && <time className="lobby-date" dateTime={new Date(game.timestamp).toISOString()}>{screeningDate(game.timestamp)}</time>}
                <button className="lobby-view" disabled={broken} onClick={event => openPoster(game.id, event.currentTarget)} aria-label={`View full poster for ${label}`}>View poster</button>
              </figcaption>
            </figure>;
          })}
        </section>
        <div className="lobby-pagination" role="group" aria-label="Browse movie posters">
          <button aria-label="Previous posters" disabled={start === 0} onClick={() => move(-1)}><ChevronLeft size={19} /></button>
          <p aria-live="polite" aria-atomic="true">{start + 1}{visible.length > 1 ? `–${start + visible.length}` : ''}<span> / </span>{posters.length}</p>
          <button aria-label="Next posters" disabled={start + pageSize >= posters.length} onClick={() => move(1)}><ChevronRight size={19} /></button>
        </div>
        {loadError && <p role="status" className="lobby-reconnect">Showing saved posters. <button onClick={() => retryLoadHistory()}>Retry archive</button></p>}
      </> : <div className="lobby-empty" role="status">
        <h2>{loading ? 'Lighting the lobby…' : loadError ? 'The archive is unavailable' : user ? 'The lobby is waiting.' : 'Your films belong here.'}</h2>
        <p>{loading ? 'Bringing your movie posters into view.' : loadError ? 'Your saved games are safe. Reconnect and try again.' : user ? 'Your completed movie posters will appear here.' : 'Sign in to see your movie posters.'}</p>
        {!loading && loadError && <button onClick={() => retryLoadHistory()}>Retry archive</button>}
        {!loading && !loadError && !user && <button onClick={() => navigate('/auth')}>Sign in</button>}
      </div>}
    </main>
    <footer className="lobby-footer">{nav}<p>Unofficial fan-made app · Not endorsed by or affiliated with Van Ryder Games.</p></footer>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedId(null); }}>
      <DialogContent className="lobby-poster-viewer" onCloseAutoFocus={event => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus(); }}>
        <DialogTitle className="sr-only">{selected ? `${selected.finalGirl} vs. ${selected.killer} movie poster` : 'Movie poster'}</DialogTitle>
        <DialogDescription className="sr-only">Full movie poster. Open its case file to read the recorded story.</DialogDescription>
        {selected && <>
          {failed.has(selected.posterImageUrl!) ? <div className="lobby-viewer-error" role="status"><p>Poster unavailable</p><button onClick={() => retry(selected.posterImageUrl!)}>Retry poster</button></div>
            : <img className="lobby-full-poster" src={selected.posterImageUrl} alt={`Movie poster for ${selected.finalGirl} vs. ${selected.killer} at ${selected.location}`} onError={() => fail(selected.posterImageUrl!)} />}
          <button className="lobby-open-case" onClick={() => { setSelectedId(null); onOpenCase(selected.id); }}>Open case file</button>
        </>}
      </DialogContent>
    </Dialog>
  </div>;
}
