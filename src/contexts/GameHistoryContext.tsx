import { createContext, useContext, ReactNode } from 'react';
import { useGameHistory, GameResult } from '@/hooks/useGameHistory';
import type { GameStats } from '@/hooks/useGameHistory';
import type { ActiveGame } from '@/lib/activeGame';

interface GameHistoryContextValue {
  gameHistory: GameResult[];
  recordGame: (result: Omit<GameResult, 'id' | 'timestamp'>, gameId?: string) => GameResult;
  updateGame: (id: string, updates: Partial<GameResult>) => void;
  deleteGame: (id: string) => Promise<void>;
  discardGame: (id: string, snapshot?: ActiveGame) => Promise<{cleanupPending:boolean}>;
  getStats: () => GameStats;
  fetchGameDetails: (id: string) => Promise<GameResult | null>;
  clearHistory: () => Promise<void>;
  retryLoadHistory: () => Promise<void>;
  pendingSaveCount: number;
  saveError: string | null;
  retryPendingSaves: () => Promise<boolean>;
  isLoading: boolean;
  loadError: string | null;
  isDegraded: boolean;
}

const GameHistoryContext = createContext<GameHistoryContextValue | null>(null);

export const GameHistoryProvider = ({ children }: { children: ReactNode }) => {
  const value = useGameHistory();
  return (
    <GameHistoryContext.Provider value={value}>
      {children}
    </GameHistoryContext.Provider>
  );
};

export const useGameHistoryContext = (): GameHistoryContextValue => {
  const ctx = useContext(GameHistoryContext);
  if (!ctx) {
    throw new Error('useGameHistoryContext must be used within a GameHistoryProvider');
  }
  return ctx;
};

