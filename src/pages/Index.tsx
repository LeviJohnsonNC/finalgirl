import {trackedOutcome} from '@/lib/play/outcome';
import { usePlaySessionSync } from '@/hooks/play/usePlaySessionSync';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Marquee } from '@/components/Marquee';
import { AppHeader } from '@/components/AppHeader';
import { PageLoading } from '@/components/PageLoading';
import { VCRTime, VCRDate } from '@/components/VCRClock';
// Every page is lazy: the entry screen is the Marquee, so none of the page
// code (and none of the static lore/description data it imports) belongs in
// the entry chunk. The likely-next chunks are prefetched while the marquee
// idles — see prefetchLikelyPages below.
const castingRoomImport = () => import('./CastingRoom');
const archiveImport = () => import('./Archive');
const CastingRoom = lazy(castingRoomImport);
const Archive = lazy(archiveImport);
const NowPlaying = lazy(() => import('./NowPlaying'));
const GameOutcome = lazy(() => import('./GameOutcome'));
const TheEnd = lazy(() => import('./TheEnd'));
const Scrapbooks = lazy(() => import('./Scrapbooks'));
const Stats = lazy(() => import('./Stats'));
const Rules = lazy(() => import('./Rules'));
import type { EndingFormData, ActiveGame } from '@/lib/activeGame';
import { useActiveGame } from '@/hooks/useActiveGame';
import { Library, BookOpen, BarChart3, ArrowLeft, User, BookMarked } from 'lucide-react';
import { getFilmIdByLocation } from '@/types/gameData';
import { GameResult } from '@/hooks/useGameHistory';
import { GameHistoryProvider, useGameHistoryContext } from '@/contexts/GameHistoryContext';
import { NewsTicker } from '@/components/NewsTicker';
import { useAuth } from '@/hooks/useAuth';
import { SyncNotice } from '@/components/SyncNotice';
import { toast } from 'sonner';

// Warm the chunks the user reaches first (dashboard = CastingRoom, plus the
// Archive) once the browser is idle, so the marquee → dashboard transition
// stays instant despite the code splitting.
const prefetchLikelyPages = () => {
  const prefetch = () => {
    castingRoomImport().catch(() => {});
    archiveImport().catch(() => {});
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(prefetch, { timeout: 3000 });
  } else {
    setTimeout(prefetch, 1500);
  }
};


const IndexContent = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'archive' | 'nowPlaying' | 'outcome' | 'ending' | 'scrapbooks' | 'stats' | 'rules'>('dashboard');
  // A session the stats page asked to open. Set only by that hand-off; every
  // other route into the scrapbooks clears it, so they start on the covers.
  const [scrapbookFocusId, setScrapbookFocusId] = useState<string | null>(null);

  const goToScrapbooks = (focusGameId: string | null = null) => {
    setScrapbookFocusId(focusGameId);
    setHasStarted(true);
    setCurrentPage('scrapbooks');
  };
  const { activeGame, save: saveActiveGame, checkpoint, updateFormDraft, appendPlayEvent } = useActiveGame();
  const cloudPlay = usePlaySessionSync(activeGame);
  const gameSelection = activeGame?.selection ?? null;
  const lastGameResult = activeGame?.result ?? null;
  const introStory = activeGame?.introStory;
  const visualBible = activeGame?.visualBible;
  const endingFormData = activeGame?.formData ?? null;
  const { recordGame, updateGame, pendingSaveCount, retryPendingSaves } = useGameHistoryContext();
  const recordedIds = useRef(new Set<string>());
  if (activeGame?.result) recordedIds.current.add(activeGame.id);
  const checkpointGame = (id: string, updates: Partial<ActiveGame>) => {
    checkpoint(id, updates);
    // A late image can land after SAVE unmounts its screen. Queue the attachment
    // against the stable record ID, even after the active draft was cleared.
    if (recordedIds.current.has(id)) {
      try {
        if (updates.sceneImageUrl) updateGame(id, { sceneImageUrl: updates.sceneImageUrl });
        if (updates.posterImageUrl) updateGame(id, { posterImageUrl: updates.posterImageUrl });
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save the image.'); }
    }
  };

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Warm likely-next page chunks while the marquee idles
  useEffect(() => {
    prefetchLikelyPages();
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentPage(activeGame?.phase ?? 'dashboard');
  };

  const handleArchive = () => {
    setHasStarted(true);
    setCurrentPage('archive');
  };

  const handleNavigateHome = () => {
    setHasStarted(false);
    setCurrentPage('dashboard');
  };

  const handleStartGame = (selection: {
    killer: string; location: string; finalGirl: string;
    setupScenario: string | null; startingEvent: string | null; mission: string | null;
  }) => {
    if (activeGame) {
      toast.error('Resume or discard the current game before casting a new one.');
      return;
    }
    if (saveActiveGame({ version: 1, id: crypto.randomUUID(), phase: 'nowPlaying',
      selection: { ...selection, filmId: getFilmIdByLocation(selection.location) } })) setCurrentPage('nowPlaying');
  };

  const handleBackFromNowPlaying = () => setCurrentPage('dashboard');

  const handleGameEnd = (outcome: 'won' | 'lost', story?: string, sceneImageUrl?: string, bible?: string) => {
    if (!activeGame) return;
    try {
      const result = activeGame.result ?? recordGame({ outcome, ...activeGame.selection, ...trackedOutcome(activeGame.playEvents),
        introStory: story, sceneImageUrl, visualBible: bible }, activeGame.id);
      recordedIds.current.add(activeGame.id);
      if (checkpoint(activeGame.id, { phase: 'outcome', result, introStory: story, sceneImageUrl, visualBible: bible })) {
        setCurrentPage('outcome');
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save your game.'); }
  };

  const handlePlayAgain = () => {
    if (!cloudPlay.close()) {
      toast.error(cloudPlay.conflict ? 'Resolve the cloud version before closing this game.' : 'Could not save the request to close this game. Your game is still open; check device storage and retry.');
      return false;
    }
    if (!saveActiveGame(null)) return false;
    setCurrentPage('dashboard');
    return true;
  };

  const handleContinueToEnding = (formData: EndingFormData) => {
    if (!activeGame?.result) return;
    try {
      updateGame(activeGame.result.id, formData);
      if (checkpoint(activeGame.id, { phase: 'ending', formData })) setCurrentPage('ending');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save your result.'); }
  };

  const handleSaveEnding = (endingNarration: string, posterImageUrl?: string) => {
    if (!lastGameResult || !endingFormData) return;
    try {
      updateGame(lastGameResult.id, { ...endingFormData, endingNarration: endingNarration || undefined, posterImageUrl });
      if (!cloudPlay.close()) { toast.error('Resolve the cloud version before closing this game.'); return; }
      if (saveActiveGame(null)) setCurrentPage('stats');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save the ending.'); }
  };

  const handleSaveResult = (formData: EndingFormData) => {
    if (!lastGameResult) return;
    try {
      updateGame(lastGameResult.id, formData);
      if (!cloudPlay.close()) { toast.error('Resolve the cloud version before closing this game.'); return; }
      if (saveActiveGame(null)) setCurrentPage('stats');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save your result.'); }
  };

  const handleDiscardEnding = () => {
    if (activeGame && checkpoint(activeGame.id, { phase: 'outcome' })) setCurrentPage('outcome');
  };

  const cloudNotice = <>
    {cloudPlay.conflict && <div role="alert" className={`${hasStarted ? 'fixed top-24 inset-x-3 z-[70]' : ''} border border-accent/40 bg-background p-4 shadow-2xl type-body-sm max-w-2xl mx-auto`}>
      <p>Another device changed this game. Both versions will be preserved before you choose.</p>
      <div className="flex flex-wrap gap-3"><button className="min-h-[44px] text-secondary underline" onClick={() => { const row = cloudPlay.conflict!; if(cloudPlay.adopt(row,saveActiveGame)) setCurrentPage(row.state.phase); }}>Use cloud version</button><button className="min-h-[44px] text-accent underline" onClick={cloudPlay.keepLocal}>Keep this device’s version</button></div>
    </div>}
    {!activeGame && (hasStarted ? cloudPlay.remoteGames : cloudPlay.remoteGames.slice(1)).map(row => <div key={row.id} className="border border-secondary/30 bg-background p-3 type-caption max-w-2xl mx-auto">
      CLOUD GAME · {row.state.selection.finalGirl} vs {row.state.selection.killer}
      <button className="min-h-[44px] ml-3 underline text-secondary" onClick={() => { if (cloudPlay.adopt(row,saveActiveGame)) { setHasStarted(true); setCurrentPage(row.state.phase); } }}>RESUME CLOUD GAME</button>
    </div>)}
  </>;
  const resumeNotice = activeGame ? (
    <div role="status" className="mb-4 border border-primary/30 bg-card px-4 py-3 type-caption text-foreground">
      A GAME IS IN PROGRESS · {activeGame.selection.finalGirl} vs {activeGame.selection.killer}
      <button className="ml-3 text-primary underline min-h-[44px]" onClick={() => { setHasStarted(true); setCurrentPage(activeGame.phase); }}>RESUME GAME</button>
      <button className="ml-3 text-muted-foreground underline min-h-[44px]" onClick={() => {
        if (window.confirm('Discard this unfinished game? Any result already recorded stays in your archive.')) handlePlayAgain();
      }}>DISCARD DRAFT</button>
    </div>
  ) : null;

  // The footer is fixed, so everything that stacks above it (the news ticker,
  // the docked outcome bar) has to know how tall it is. It is not a constant —
  // safe-area insets and the type scale both move it — so publish the measured
  // height instead of leaving magic numbers scattered across components.
  const footerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty('--app-footer-h', `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Show Marquee until user starts
  if (!hasStarted) {
    const cloudGame = !activeGame ? cloudPlay.remoteGames[0] : undefined;
    return (
      <Marquee 
        onStart={() => {
          if (cloudGame) {
            if (cloudPlay.adopt(cloudGame, saveActiveGame)) { setHasStarted(true); setCurrentPage(cloudGame.state.phase); }
          } else handleStart();
        }}
        resumeGame={activeGame ?? cloudGame?.state}
        resumeFromCloud={Boolean(cloudGame)}
        onStartAnother={() => {
          if (activeGame && !handlePlayAgain()) return false;
          setHasStarted(true); setCurrentPage('dashboard'); return true;
        }}
        recoveryNotice={<>{cloudNotice}{cloudPlay.error && !cloudPlay.conflict && <p role="status" className="theater-status">{cloudPlay.error} <button className="underline min-h-[44px] px-2" onClick={cloudPlay.refresh}>Retry cloud sync</button></p>}</>}
        onArchive={handleArchive} 
        onNavigateHome={handleNavigateHome}
        onScrapbooks={() => goToScrapbooks()}
        onOpenCaseFile={goToScrapbooks}
        onStats={() => { setHasStarted(true); setCurrentPage('stats'); }}
        onRules={() => { setHasStarted(true); setCurrentPage('rules'); }}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'nowPlaying':
        if (gameSelection) {
          return (
            <NowPlaying
              killer={gameSelection.killer}
              location={gameSelection.location}
              finalGirl={gameSelection.finalGirl}
              setupScenario={gameSelection.setupScenario}
              startingEvent={gameSelection.startingEvent}
              mission={gameSelection.mission}
              filmId={gameSelection.filmId}
              key={activeGame.id}
              sessionId={activeGame.id}
              playEvents={activeGame.playEvents}
              playMode={activeGame.playMode}
              showDeathPanel={activeGame.showDeathPanel}
              syncPlayNow={cloudPlay.syncNow}
              onPlayEvent={event => appendPlayEvent(activeGame.id, event)}
              syncStatus={cloudPlay.conflict ? 'Another device has changes. Open the cloud notice to choose a version.' : !user ? 'Saved on this device · sign in for cloud recovery' : cloudPlay.error || (cloudPlay.pendingCount ? 'Saved on this device · cloud sync pending' : 'Saved on this device · cloud up to date')}
              onRetrySync={user ? () => { void cloudPlay.retry(); } : undefined}
              initialStory={activeGame.introStory}
              initialSceneImageUrl={activeGame.sceneImageUrl}
              initialVisualBible={activeGame.visualBible}
              onCheckpoint={(updates) => checkpointGame(activeGame.id, updates)}
              onBack={handleBackFromNowPlaying}
              onGameEnd={handleGameEnd}
            />
          );
        }
        return <CastingRoom onStartGame={handleStartGame} onGoToArchive={() => setCurrentPage('archive')} />;
      case 'outcome':
        if (lastGameResult) {
          return (
            <GameOutcome
              result={lastGameResult}
              introStory={introStory}
              initialDraft={activeGame.formDraft}
              onDraftChange={(fields) => updateFormDraft(activeGame.id, fields)}
              onSaveResult={handleSaveResult}
              onContinue={handleContinueToEnding}
              onDiscard={handlePlayAgain}
            />
          );
        }
        return <CastingRoom onStartGame={handleStartGame} onGoToArchive={() => setCurrentPage('archive')} />;
      case 'ending':
        if (lastGameResult && endingFormData) {
          return (
            <TheEnd
              result={lastGameResult}
              introStory={introStory}
              visualBible={visualBible}
              initialEndingStory={activeGame.endingStory}
              initialPosterImageUrl={activeGame.posterImageUrl}
              onCheckpoint={(updates) => checkpointGame(activeGame.id, updates)}
              formData={endingFormData}
              onSave={handleSaveEnding}
              onDiscard={handleDiscardEnding}
            />
          );
        }
        return <CastingRoom onStartGame={handleStartGame} onGoToArchive={() => setCurrentPage('archive')} />;
      case 'archive':
        return <Archive />;
      case 'scrapbooks':
        return (
          <Scrapbooks
            focusGameId={scrapbookFocusId}
            onFocusHandled={() => setScrapbookFocusId(null)}
          />
        );
      case 'stats':
        return <Stats onOpenSession={(gameId) => goToScrapbooks(gameId)} />;
      case 'rules':
        return <Rules />;
      default:
        return <CastingRoom onStartGame={handleStartGame} onGoToArchive={() => setCurrentPage('archive')} />;
    }
  };

  const isScrapbookOpen = currentPage === 'scrapbooks';

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Shared App Header — hidden on mobile when scrapbook is open */}
      <div className={isScrapbookOpen ? 'hidden sm:block' : currentPage==='nowPlaying' && activeGame?.playMode ? 'play-active-header' : ''}>
        <AppHeader onNavigateHome={handleNavigateHome} />
      </div>
      
      {/* Main Content — one Suspense boundary covers every lazy page */}
      <main className="container mx-auto px-3 sm:px-4 pt-24 sm:pt-32 pb-28 relative z-10">
        <Suspense fallback={<PageLoading />}>
          <SyncNotice count={pendingSaveCount} onRetry={retryPendingSaves} />
          {activeGame && currentPage !== activeGame.phase && resumeNotice}
          {cloudPlay.conflict && cloudNotice}{renderPage()}
        </Suspense>
      </main>

      {/* News Ticker - above footer */}
      {!(currentPage === 'nowPlaying' && activeGame?.playMode) && <NewsTicker />}

      {/* VHS Footer */}
      <footer
        ref={footerRef}
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t border-border py-2 z-50 safe-area-bottom"
      >
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between">
          {/* Left: Back button or Play indicator */}
          {currentPage !== 'dashboard' ? (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="type-caption text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">BACK</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="type-caption text-muted-foreground">PLAY ▶</span>
            </div>
          )}
          
          {/* Center: Title - simplified on mobile */}
          <div className="type-caption text-muted-foreground truncate group relative">
            <span className="sm:hidden">FINAL GIRL™</span>
            <span className="hidden sm:inline">FINAL GIRL™ UNOFFICIAL CASE FILES • <VCRDate /></span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-background/95 border border-border rounded type-micro text-dim leading-relaxed max-w-[320px] text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal">
              This is an unofficial fan-made application that is not endorsed by or affiliated with Van Ryder Games who is the registered trademark owner of Final Girl and all associated intellectual property rights.
            </div>
          </div>
          
          {/* Right: Collection + Stats + Scrapbooks + Time */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setCurrentPage('archive')}
              aria-label="COLLECTION"
              className="type-caption text-muted-foreground hover:text-secondary transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <Library className="w-3 h-3" />
              <span className="hidden sm:inline">COLLECTION</span>
            </button>
            <button
              onClick={() => setCurrentPage('rules')}
              aria-label="RULES"
              className="type-caption text-muted-foreground hover:text-amber-400 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <BookMarked className="w-3 h-3" />
              <span className="hidden sm:inline">RULES</span>
            </button>
            <button
              onClick={() => setCurrentPage('stats')}
              aria-label="STATS"
              className="type-caption text-muted-foreground hover:text-green-400 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">STATS</span>
            </button>
            <button
              onClick={() => goToScrapbooks()}
              aria-label="SCRAPBOOKS"
              className="type-caption text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <BookOpen className="w-3 h-3" />
              <span className="hidden sm:inline">SCRAPBOOKS</span>
            </button>
            {/* Auth link */}
            {!authLoading && (
              <button
                onClick={() => navigate('/auth')}
                aria-label={user ? 'ACCOUNT' : 'SIGN IN'}
                className="type-caption text-dimmer hover:text-foreground transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
              >
                <User className="w-3 h-3" />
                <span className="hidden sm:inline">{user ? 'ACCOUNT' : 'SIGN IN'}</span>
              </button>
            )}
            <VCRTime />
            <span className="hidden sm:inline type-caption text-primary">SP</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Index = () => (
  <GameHistoryProvider>
    <IndexContent />
  </GameHistoryProvider>
);

export default Index;

