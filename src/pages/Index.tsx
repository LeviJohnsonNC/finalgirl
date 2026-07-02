import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Marquee } from '@/components/Marquee';
import { AppHeader } from '@/components/AppHeader';
import CastingRoom from './CastingRoom';
import Archive from './Archive';
import NowPlaying from './NowPlaying';
import GameOutcome from './GameOutcome';
import TheEnd, { EndingFormData } from './TheEnd';
// Lazy-load heavy pages to trim the initial bundle.
const Scrapbooks = lazy(() => import('./Scrapbooks'));
const Stats = lazy(() => import('./Stats'));
const Rules = lazy(() => import('./Rules'));
import { Library, BookOpen, BarChart3, ArrowLeft, User, BookMarked, Loader2 } from 'lucide-react';
import { getFilmIdByLocation } from '@/types/gameData';
import { GameResult } from '@/hooks/useGameHistory';
import { GameHistoryProvider, useGameHistoryContext } from '@/contexts/GameHistoryContext';
import { NewsTicker } from '@/components/NewsTicker';
import { useAuth } from '@/hooks/useAuth';

const PageLoading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <p className="font-vhs text-xs tracking-widest animate-pulse">[ PROJECTOR WARMING UP... ]</p>
  </div>
);


interface GameSelection {
  killer: string;
  location: string;
  finalGirl: string;
  setupScenario: string | null;
  startingEvent: string | null;
  filmId: string | null;
  introStory?: string;
}

const IndexContent = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'archive' | 'nowPlaying' | 'outcome' | 'ending' | 'scrapbooks' | 'stats' | 'rules'>('dashboard');
  const [gameSelection, setGameSelection] = useState<GameSelection | null>(null);
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);
  const [introStory, setIntroStory] = useState<string | undefined>(undefined);
  const [endingFormData, setEndingFormData] = useState<EndingFormData | null>(null);
  const [time, setTime] = useState(new Date());
  const { recordGame, updateGame } = useGameHistoryContext();

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Update time every second for VCR display
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentPage('dashboard');
  };

  const handleArchive = () => {
    setHasStarted(true);
    setCurrentPage('archive');
  };

  const handleNavigateHome = () => {
    setHasStarted(false);
    setGameSelection(null);
    setLastGameResult(null);
    setCurrentPage('dashboard');
  };

  const handleStartGame = (selection: {
    killer: string;
    location: string;
    finalGirl: string;
    setupScenario: string | null;
    startingEvent: string | null;
  }) => {
    const filmId = getFilmIdByLocation(selection.location);
    setGameSelection({
      ...selection,
      filmId,
    });
    setCurrentPage('nowPlaying');
  };

  const handleBackFromNowPlaying = () => {
    setGameSelection(null);
    setLastGameResult(null);
    setIntroStory(undefined);
    setCurrentPage('dashboard');
  };

  const handleGameEnd = (outcome: 'won' | 'lost', story?: string, sceneImageUrl?: string) => {
    if (!gameSelection) return;
    
    setIntroStory(story);
    
    const result = recordGame({
      outcome,
      killer: gameSelection.killer,
      location: gameSelection.location,
      finalGirl: gameSelection.finalGirl,
      setupScenario: gameSelection.setupScenario,
      startingEvent: gameSelection.startingEvent,
      introStory: story,
      sceneImageUrl,
    });
    
    setLastGameResult(result);
    setCurrentPage('outcome');
  };

  const handleUpdateGame = (updates: Partial<GameResult>) => {
    if (lastGameResult) {
      updateGame(lastGameResult.id, updates);
    }
  };

  const handlePlayAgain = () => {
    setGameSelection(null);
    setLastGameResult(null);
    setIntroStory(undefined);
    setEndingFormData(null);
    setCurrentPage('dashboard');
  };

  const handleContinueToEnding = (formData: EndingFormData) => {
    setEndingFormData(formData);
    setCurrentPage('ending');
  };

  const handleSaveEnding = (endingNarration: string, posterImageUrl?: string) => {
    if (lastGameResult && endingFormData) {
      updateGame(lastGameResult.id, {
        ...endingFormData,
        endingNarration,
        posterImageUrl,
      });
    }
    // Navigate to scrapbooks after saving
    setGameSelection(null);
    setLastGameResult(null);
    setIntroStory(undefined);
    setEndingFormData(null);
    setCurrentPage('stats');
  };

  const handleDiscardEnding = () => {
    // Go back to outcome form without saving the ending
    setEndingFormData(null);
    setCurrentPage('outcome');
  };

  // Show Marquee until user starts
  if (!hasStarted) {
    return (
      <Marquee 
        onStart={handleStart} 
        onArchive={handleArchive} 
        onNavigateHome={handleNavigateHome}
        onScrapbooks={() => { setHasStarted(true); setCurrentPage('scrapbooks'); }}
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
              filmId={gameSelection.filmId}
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
        return <Suspense fallback={<PageLoading />}><Scrapbooks /></Suspense>;
      case 'stats':
        return <Suspense fallback={<PageLoading />}><Stats /></Suspense>;
      case 'rules':
        return <Suspense fallback={<PageLoading />}><Rules /></Suspense>;
      default:
        return <CastingRoom onStartGame={handleStartGame} onGoToArchive={() => setCurrentPage('archive')} />;
    }
  };

  const isScrapbookOpen = currentPage === 'scrapbooks';

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Shared App Header — hidden on mobile when scrapbook is open */}
      <div className={isScrapbookOpen ? 'hidden sm:block' : ''}>
        <AppHeader onNavigateHome={handleNavigateHome} />
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 pt-24 sm:pt-32 pb-28 relative z-10">
        {renderPage()}
      </main>

      {/* News Ticker - above footer */}
      <NewsTicker />

      {/* VHS Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t border-border py-2 z-50 safe-area-bottom">
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between">
          {/* Left: Back button or Play indicator */}
          {currentPage !== 'dashboard' ? (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="font-vhs text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">BACK</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-vhs text-xs text-muted-foreground">PLAY ▶</span>
            </div>
          )}
          
          {/* Center: Title - simplified on mobile */}
          <div className="font-vhs text-[10px] sm:text-xs text-muted-foreground truncate group relative">
            <span className="sm:hidden">FINAL GIRL™</span>
            <span className="hidden sm:inline">FINAL GIRL™ UNOFFICIAL CASE FILES • {time.toLocaleDateString()}</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-background/95 border border-border rounded text-[9px] text-muted-foreground/60 leading-relaxed max-w-[320px] text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal">
              This is an unofficial fan-made application that is not endorsed by or affiliated with Van Ryder Games who is the registered trademark owner of Final Girl and all associated intellectual property rights.
            </div>
          </div>
          
          {/* Right: Collection + Stats + Scrapbooks + Time */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setCurrentPage('archive')}
              className="font-vhs text-[10px] sm:text-xs text-muted-foreground hover:text-secondary transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <Library className="w-3 h-3" />
              <span className="hidden sm:inline">COLLECTION</span>
            </button>
            <button
              onClick={() => setCurrentPage('rules')}
              className="font-vhs text-[10px] sm:text-xs text-muted-foreground hover:text-amber-400 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <BookMarked className="w-3 h-3" />
              <span className="hidden sm:inline">RULES</span>
            </button>
            <button
              onClick={() => setCurrentPage('stats')}
              className="font-vhs text-[10px] sm:text-xs text-muted-foreground hover:text-green-400 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">STATS</span>
            </button>
            <button
              onClick={() => setCurrentPage('scrapbooks')}
              className="font-vhs text-[10px] sm:text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
            >
              <BookOpen className="w-3 h-3" />
              <span className="hidden sm:inline">SCRAPBOOKS</span>
            </button>
            {/* Auth link */}
            {!authLoading && (
              <button
                onClick={() => navigate('/auth')}
                className="font-vhs text-[10px] sm:text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-1 sm:px-2"
              >
                <User className="w-3 h-3" />
                <span className="hidden sm:inline">{user ? 'ACCOUNT' : 'SIGN IN'}</span>
              </button>
            )}
            <span className="font-vhs text-[10px] sm:text-xs text-secondary neon-text">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="hidden sm:inline font-vhs text-xs text-primary">SP</span>
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
