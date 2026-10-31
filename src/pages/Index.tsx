import {shadyParent,shadyState,resolveShadyAction} from '@/lib/play/shadyAcres';
import {grimlashFatal,grimlashParent,resolveGrimlashAction} from '@/lib/play/grimlash';
import {konradFatal,konradParent,konradState,resolveKonradAction} from '@/lib/play/konrad';
import {moduleState} from '@/lib/play/modules';
import {summarizePlay,newPlayEvent} from '@/lib/play/events';
import { getFinalGirlHealth } from '@/data/finalGirlHealth';
import { observedFinalGirlMaxHealth } from '@/data/finalGirlReferences';
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
const Lobby = lazy(() => import('./Lobby'));
import type { EndingFormData, ActiveGame } from '@/lib/activeGame';
import { useActiveGame } from '@/hooks/useActiveGame';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { Library, BookOpen, BarChart3, ArrowLeft, User, BookMarked, Film } from 'lucide-react';
import { getFilmIdByLocation } from '@/types/gameData';
import { GameResult } from '@/hooks/useGameHistory';
import { GameHistoryProvider, useGameHistoryContext } from '@/contexts/GameHistoryContext';
import { NewsTicker } from '@/components/NewsTicker';
import { DiscardGameDialog } from '@/components/DiscardGameDialog';
import { isGameDiscarded } from '@/lib/discardedGames';
import { useAuth } from '@/hooks/useAuth';
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
  const owner = user?.id ?? 'guest';
  const sessionOwner = useRef(owner); sessionOwner.current = owner;
  const [discardTarget,setDiscardTarget] = useState<{owner:string;game:ActiveGame}|null>(null);
  const [setupReturn,setSetupReturn] = useState<{owner:string;selection:ActiveGame['selection']}|null>(null);
  const { page: currentPage, navigate: setCurrentPage, back: goBack, canGoBack } = usePageNavigation<'home' | 'dashboard' | 'archive' | 'nowPlaying' | 'outcome' | 'ending' | 'scrapbooks' | 'stats' | 'rules' | 'lobby'>('home');
  const hasStarted = currentPage !== 'home';
  const isLobby = currentPage === 'lobby';
  // A session the stats page asked to open. Set only by that hand-off; every
  // other route into the scrapbooks clears it, so they start on the covers.
  const [scrapbookFocusId, setScrapbookFocusId] = useState<string | null>(null);

  const goToScrapbooks = (focusGameId: string | null = null) => {
    setScrapbookFocusId(focusGameId);
    setCurrentPage('scrapbooks');
  };
  const { activeGame, save: saveActiveGame, checkpoint, updateFormDraft, appendPlayEvent, getCurrentGame } = useActiveGame();
  const cloudPlay = usePlaySessionSync(activeGame);
  const gameSelection = activeGame?.selection ?? null;
  const lastGameResult = activeGame?.result ?? null;
  const introStory = activeGame?.introStory;
  const visualBible = activeGame?.visualBible;
  const endingFormData = activeGame?.formData ?? null;
  const { recordGame, updateGame, discardGame } = useGameHistoryContext();
  const recordedIds = useRef(new Set<string>());
  if (activeGame?.result) recordedIds.current.add(activeGame.id);
  const checkpointGame = (id: string, updates: Partial<ActiveGame>) => {
    if (isGameDiscarded(owner,id)) return false;
    const saved = checkpoint(id, updates);
    // A late image can land after SAVE unmounts its screen. Queue the attachment
    // against the stable record ID, even after the active draft was cleared.
    if (recordedIds.current.has(id)) {
      try {
        if (updates.sceneImageUrl) updateGame(id, { sceneImageUrl: updates.sceneImageUrl });
        if (updates.posterImageUrl) updateGame(id, { posterImageUrl: updates.posterImageUrl });
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save the image.'); }
    }
    return saved;
  };
  const previousActive = useRef<{owner:string;game:ActiveGame|null}>({owner,game:activeGame});
  useEffect(() => {
    const previous = previousActive.current;
    if (previous.owner === owner && previous.game && !activeGame && isGameDiscarded(owner,previous.game.id)) {
      setSetupReturn({owner,selection:previous.game.selection});
      setCurrentPage('dashboard');
    }
    previousActive.current = {owner,game:activeGame};
  },[activeGame,owner,setCurrentPage]);
  const requestDiscard = (game:ActiveGame) => setDiscardTarget({owner,game});
  const confirmDiscard = async (game:ActiveGame) => {
    const requestOwner = owner;
    const result = await discardGame(game.id,game);
    recordedIds.current.delete(game.id);
    setDiscardTarget(null);
    if (sessionOwner.current !== requestOwner) return;
    if (!getCurrentGame()) { setSetupReturn({owner,selection:game.selection}); setCurrentPage('dashboard'); }
    if (result.cleanupPending) toast.info('Game discarded. Image cleanup will retry when connected.');
    else toast.success('Game discarded.');
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
    setCurrentPage(activeGame?.phase ?? 'dashboard');
  };

  const handleArchive = () => {
    setCurrentPage('archive');
  };

  const handleNavigateHome = () => setCurrentPage('home');

  const handleStartGame = (selection: {
    killer: string; location: string; finalGirl: string;
    setupScenario: string | null; startingEvent: string | null; mission: string | null;
  }) => {
    if (activeGame) {
      toast.error('Resume or discard the current game before casting a new one.');
      return;
    }
    if (saveActiveGame({ version: 1, id: crypto.randomUUID(), phase: 'nowPlaying',
      ...(selection.location === 'Shady Acres' && {shadySetupVersion:1 as const}),
      ...(selection.location === 'USS Konrad' && {konradSetupVersion:1 as const}),
      ...(selection.killer === 'Grimlash' && {grimlashSetupVersion:1 as const}),
      ...(selection.killer === 'Evomorph' && {evomorphSetupVersion:1 as const}),
      ...(selection.location === 'Creech Manor' && {creechSetupVersion:1 as const}),
      ...(selection.location === 'Sacred Groves' && {grovesSetupVersion: 1 as const}),
      ...(selection.killer === 'Poltergeist' && {poltergeistSetupVersion: 1 as const}),
      ...(selection.killer === 'Inkanyamba' && {inkanyambaSetupVersion: 1 as const}),
      ...(selection.killer === 'Billy the Bear' && {billySetupVersion: 1 as const}),
      ...(selection.killer === 'Geppetto' && {geppettoSetupVersion: 1 as const}),
      ...(selection.killer === 'Dr. Fright' && {frightSetupVersion: 1 as const}),
      ...(selection.location === 'Maple Lane' && {mapleSetupVersion: 1 as const}),
      ...(selection.location === 'Carnival of Blood' && {carnivalSetupVersion: 1 as const}),
      selection: { ...selection, filmId: getFilmIdByLocation(selection.location), finalGirlStartingHealth: getFinalGirlHealth(selection.finalGirl) } })) setCurrentPage('nowPlaying');
  };

  const handleBackFromNowPlaying = goBack;

  const handleGameEnd = (outcome: 'won' | 'lost', story?: string, sceneImageUrl?: string, bible?: string) => {
    const game = getCurrentGame();
    if (!game || game.id !== activeGame?.id) return;
    try {
      const grimlashLost=game.selection.killer==='Grimlash'&&grimlashFatal(moduleState(summarizePlay(game.playEvents).entries,'grimlash'));
      const resolvedOutcome=grimlashLost?'lost':game.selection.location==='USS Konrad'&&konradFatal(moduleState(summarizePlay(game.playEvents).entries,'konrad'))?'lost':outcome;
      const result = game.result ?? recordGame({ outcome:resolvedOutcome, ...game.selection, ...trackedOutcome(game.playEvents),
        introStory: story, sceneImageUrl, visualBible: bible, finalGirlMaxHealth: observedFinalGirlMaxHealth(game.selection.finalGirl,game.playEvents,game.selection.finalGirlStartingHealth,game.selection.killer) }, game.id);
      recordedIds.current.add(game.id);
      if (checkpoint(game.id, { phase: 'outcome', result, introStory: story, sceneImageUrl, visualBible: bible })) {
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

  // Each durable boundary remains retryable; use one case ID across retries.
  const saveReviewedResult = (formData: EndingFormData) => {
    let game=getCurrentGame();
    if(!game?.result)throw new Error('The current result is unavailable. Keep this page open and retry.');
    if(game.selection.location==='USS Konrad'&&formData.konradReview) {
      const entries=summarizePlay(game.playEvents).entries,state=moduleState(entries,'konrad');
      if(konradState(state).fate!==formData.konradReview.fate) {
        const action={parent:konradParent(entries),command:'observe' as const,key:'fate' as const,value:formData.konradReview.fate};
        const changes=resolveKonradAction(action,state,entries);
        if(!changes||!appendPlayEvent(game.id,newPlayEvent({kind:'module',konradAction:action,moduleData:{module:'konrad',changes}})))throw new Error('Ship review could not be saved. Please retry.');
        game=getCurrentGame();
        if(!game?.result)throw new Error('The saved ship review could not be read. Please retry.');
      }
    }
    if(game.selection.killer==='Grimlash'&&formData.grimlashReview) {const en=summarizePlay(game.playEvents).entries,state=moduleState(en,'grimlash');if(state.loss!==formData.grimlashReview.loss){const action={parent:grimlashParent(en),command:'loss' as const,value:formData.grimlashReview.loss,correction:true};const changes=resolveGrimlashAction(action,state,en);if(!changes||!appendPlayEvent(game.id,newPlayEvent({kind:'module',grimlashAction:action,moduleData:{module:'grimlash',changes}})))throw new Error('The Madness ending could not be saved. Please retry.');game=getCurrentGame();if(!game?.result)throw new Error('The saved Madness ending is unavailable.');}}
    if(game.selection.location==='Shady Acres'&&formData.childrenOnBoardAtFinish!==undefined){const entries=summarizePlay(game.playEvents).entries,state=moduleState(entries,'shady-acres');if(shadyState(state).finishChildren!==formData.childrenOnBoardAtFinish){const action={parent:shadyParent(entries),command:'finish' as const,value:formData.childrenOnBoardAtFinish};const changes=resolveShadyAction(action,state,entries);if(!changes||!appendPlayEvent(game.id,newPlayEvent({kind:'module',shadyAction:action,moduleData:{module:'shady-acres',changes}})))throw new Error('The Children observation could not be saved. Please retry.');game=getCurrentGame();if(!game?.result)throw new Error('The saved Children observation is unavailable.');}}
    const {konradReview:_review,childrenOnBoardAtFinish:_children,...fields}=formData;
    const reviewedEntries=summarizePlay(game.playEvents).entries;
    const fatalEnding=game.selection.killer==='Grimlash'&&grimlashFatal(moduleState(reviewedEntries,'grimlash'))||game.selection.location==='USS Konrad'&&konradFatal(moduleState(reviewedEntries,'konrad'));
    const outcome=fatalEnding?'lost':game.selection.killer==='Grimlash'||game.selection.location==='USS Konrad'?formData.outcome??game.result.outcome:game.result.outcome;
    const updates={...fields,outcome,playEvents:game.playEvents};
    updateGame(game.result.id,updates);
    const result={...game.result,...updates};
    if(!checkpoint(game.id,{result,formData}))throw new Error('The reviewed result is saved, but this game could not advance. Keep it open and retry.');
    return result;
  };
  const handleContinueToEnding = (formData: EndingFormData) => {
    if (!activeGame?.result) return;
    try {
      const reviewed=saveReviewedResult(formData);
      if (checkpoint(activeGame.id, { phase: 'ending', formData, result:reviewed })) setCurrentPage('ending');
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
      saveReviewedResult(formData);
      if (!cloudPlay.close()) { toast.error('Resolve the cloud version before closing this game.'); return; }
      if (saveActiveGame(null)) setCurrentPage('stats');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save your result.'); }
  };

  const cloudNotice = <>
    {cloudPlay.conflict && <div role="alert" className={`${hasStarted ? 'fixed top-24 inset-x-3 z-[70]' : ''} border border-accent/40 bg-background p-4 shadow-2xl type-body-sm max-w-2xl mx-auto`}>
      <p>Another device changed this game. Both versions will be preserved before you choose.</p>
      <div className="flex flex-wrap gap-3"><button className="min-h-[44px] text-secondary underline" onClick={() => { const row = cloudPlay.conflict!; if(cloudPlay.adopt(row,saveActiveGame)) setCurrentPage(row.state.phase); }}>Use cloud version</button><button className="min-h-[44px] text-accent underline" onClick={cloudPlay.keepLocal}>Keep this device’s version</button></div>
    </div>}
    {!activeGame && (hasStarted ? cloudPlay.remoteGames : cloudPlay.remoteGames.slice(1)).map(row => <div key={row.id} className="border border-secondary/30 bg-background p-3 type-caption max-w-2xl mx-auto">
      CLOUD GAME · {row.state.selection.finalGirl} vs {row.state.selection.killer}
      <button className="min-h-[44px] ml-3 underline text-secondary" onClick={() => { if (cloudPlay.adopt(row,saveActiveGame)) { setCurrentPage(row.state.phase); } }}>RESUME CLOUD GAME</button>
    </div>)}
  </>;
  const resumeNotice = activeGame ? (
    <div role="status" className="mb-4 border border-primary/30 bg-card px-4 py-3 type-caption text-foreground">
      A GAME IS IN PROGRESS · {activeGame.selection.finalGirl} vs {activeGame.selection.killer}
      <button className="ml-3 text-primary underline min-h-[44px]" onClick={() => { setCurrentPage(activeGame.phase); }}>RESUME GAME</button>
      <button className="ml-3 text-muted-foreground underline min-h-[44px]" onClick={() => requestDiscard(activeGame)}>DISCARD GAME</button>
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
  }, [hasStarted, isLobby]);

  if (isLobby) return <Suspense fallback={<PageLoading />}><Lobby key={owner}
    onTheater={handleNavigateHome} onScrapbooks={() => goToScrapbooks()} onStats={() => setCurrentPage('stats')}
    onRules={() => setCurrentPage('rules')} onCollection={handleArchive} onOpenCase={goToScrapbooks} /></Suspense>;

  // Show Marquee until user starts
  if (!hasStarted) {
    const cloudGame = !activeGame ? cloudPlay.remoteGames[0] : undefined;
    return (
      <Marquee 
        onStart={() => {
          if (cloudGame) {
            if (cloudPlay.adopt(cloudGame, saveActiveGame)) { setCurrentPage(cloudGame.state.phase); }
          } else handleStart();
        }}
        resumeGame={activeGame ?? cloudGame?.state}
        resumeFromCloud={Boolean(cloudGame)}
        onStartAnother={() => {
          if (activeGame && !handlePlayAgain()) return false;
          setCurrentPage('dashboard'); return true;
        }}
        recoveryNotice={cloudNotice}
        onArchive={handleArchive} 
        onNavigateHome={handleNavigateHome}
        onScrapbooks={() => goToScrapbooks()}
        onOpenCaseFile={goToScrapbooks}
        onStats={() => { setCurrentPage('stats'); }}
        onRules={() => { setCurrentPage('rules'); }}
        onLobby={() => setCurrentPage('lobby')}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'nowPlaying':
        if (gameSelection) {
          return (
            <NowPlaying
              finalGirlStartingHealth={activeGame.selection.finalGirlStartingHealth}
              killer={gameSelection.killer}
              location={gameSelection.location}
              finalGirl={gameSelection.finalGirl}
              setupScenario={gameSelection.setupScenario}
              startingEvent={gameSelection.startingEvent}
              mission={gameSelection.mission}
              filmId={gameSelection.filmId}
              key={activeGame.id}
              sessionId={activeGame.id}
              evomorphFreshSetup={activeGame.evomorphSetupVersion === 1}
              playEvents={activeGame.playEvents}
              playDrafts={activeGame.playDrafts}
              playMode={activeGame.playMode}
              showDeathPanel={activeGame.showDeathPanel}
              syncPlayNow={cloudPlay.syncNow}
              getPlayEvents={() => getCurrentGame()?.playEvents ?? []}
              playSyncBlocked={Boolean(cloudPlay.conflict)}
              onPlayEvent={event => appendPlayEvent(activeGame.id, event)}
              initialStory={activeGame.introStory}
              initialSceneImageUrl={activeGame.sceneImageUrl}
              initialVisualBible={activeGame.visualBible}
              onCheckpoint={(updates) => checkpointGame(activeGame.id, updates)}
              onBack={handleBackFromNowPlaying}
              onGameEnd={handleGameEnd}
              onDiscard={() => requestDiscard(activeGame)}
            />
          );
        }
        return <CastingRoom key={setupReturn?.owner === owner ? JSON.stringify(setupReturn.selection) : owner} initialSelection={setupReturn?.owner === owner ? setupReturn.selection : undefined} onStartGame={handleStartGame} onGoToArchive={handleArchive} />;
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
              onDiscard={() => requestDiscard(activeGame)}
            />
          );
        }
        return <CastingRoom key={setupReturn?.owner === owner ? JSON.stringify(setupReturn.selection) : owner} initialSelection={setupReturn?.owner === owner ? setupReturn.selection : undefined} onStartGame={handleStartGame} onGoToArchive={handleArchive} />;
      case 'ending':
        if (lastGameResult && endingFormData) {
          return (
            <TheEnd
              result={lastGameResult}
              introStory={introStory}
              sceneImageUrl={activeGame.sceneImageUrl}
              visualBible={visualBible}
              initialEndingStory={activeGame.endingStory}
              initialPosterImageUrl={activeGame.posterImageUrl}
              onCheckpoint={(updates) => checkpointGame(activeGame.id, updates)}
              formData={endingFormData}
              onSave={handleSaveEnding}
            />
          );
        }
        return <CastingRoom key={setupReturn?.owner === owner ? JSON.stringify(setupReturn.selection) : owner} initialSelection={setupReturn?.owner === owner ? setupReturn.selection : undefined} onStartGame={handleStartGame} onGoToArchive={handleArchive} />;
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
        return <CastingRoom key={setupReturn?.owner === owner ? JSON.stringify(setupReturn.selection) : owner} initialSelection={setupReturn?.owner === owner ? setupReturn.selection : undefined} onStartGame={handleStartGame} onGoToArchive={handleArchive} />;
    }
  };

  const isScrapbookOpen = currentPage === 'scrapbooks';
  const isNarrationPage = (currentPage === 'nowPlaying' && !activeGame?.playMode) || currentPage === 'ending';
  const isGameSession = currentPage === 'nowPlaying' || currentPage === 'outcome' || currentPage === 'ending';

  return (
    <div className={`app-shell min-h-screen bg-background relative overflow-x-hidden${isGameSession ? ' game-session' : ''}${isNarrationPage ? ' narration-session' : ''}`}>
      <DiscardGameDialog game={discardTarget?.owner === owner ? discardTarget.game : null} onClose={() => setDiscardTarget(null)} onConfirm={confirmDiscard} />
      {/* Shared App Header — hidden on mobile when scrapbook is open */}
      {!isNarrationPage && <div className={isScrapbookOpen ? 'hidden sm:block' : currentPage==='nowPlaying' && activeGame?.playMode ? 'play-active-header' : ''}>
        <AppHeader onNavigateHome={handleNavigateHome} />
      </div>}
      
      {/* Main Content — one Suspense boundary covers every lazy page */}
      <main className={isNarrationPage ? "narration-main relative z-10" : "container mx-auto px-3 sm:px-4 pt-24 sm:pt-32 pb-28 relative z-10"}>
        <Suspense fallback={<PageLoading />}>
          {activeGame && currentPage !== activeGame.phase && resumeNotice}
          {cloudPlay.conflict && cloudNotice}{renderPage()}
        </Suspense>
      </main>

      {/* News Ticker - above footer */}
      {!isNarrationPage && !(currentPage === 'nowPlaying' && activeGame?.playMode) && <NewsTicker />}

      {/* VHS Footer */}
      <footer
        ref={footerRef}
        className="app-footer fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t border-border py-2 z-50 safe-area-bottom"
      >
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between">
          {/* Left: Back button or Play indicator */}
          {canGoBack ? (
            <button
              onClick={goBack}
              aria-label="Back"
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
            {!isGameSession && <button
              onClick={() => setCurrentPage('lobby')}
              aria-label="LOBBY"
              className="type-caption text-muted-foreground hover:text-amber-400 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <Film className="w-3 h-3" />
              <span className="hidden sm:inline">LOBBY</span>
            </button>}
            <button
              onClick={handleArchive}
              aria-label="COLLECTION"
              aria-current={currentPage === 'archive' ? 'page' : undefined}
              className="type-caption text-muted-foreground hover:text-secondary transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <Library className="w-3 h-3" />
              <span className="hidden sm:inline">COLLECTION</span>
            </button>
            <button
              onClick={() => setCurrentPage('rules')}
              aria-label="RULES"
              aria-current={currentPage === 'rules' ? 'page' : undefined}
              className="type-caption text-muted-foreground hover:text-amber-400 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <BookMarked className="w-3 h-3" />
              <span className="hidden sm:inline">RULES</span>
            </button>
            <button
              onClick={() => setCurrentPage('stats')}
              aria-label="STATS"
              aria-current={currentPage === 'stats' ? 'page' : undefined}
              className="type-caption text-muted-foreground hover:text-green-400 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">STATS</span>
            </button>
            <button
              onClick={() => goToScrapbooks()}
              aria-label="SCRAPBOOKS"
              aria-current={currentPage === 'scrapbooks' ? 'page' : undefined}
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
            {!isNarrationPage && <>
              <VCRTime />
              <span className="hidden sm:inline type-caption text-primary">SP</span>
            </>}
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


