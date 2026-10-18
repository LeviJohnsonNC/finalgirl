import type { Json } from '@/integrations/supabase/types';
import {validPlayLog, type PlayEvent} from '@/lib/play/events';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';
import { useDurableQueue } from './useDurableQueue';
import { supabase } from '@/integrations/supabase/client';

// Extract storage path from public URL for cleanup
const extractStoragePath = (publicUrl: string | undefined): string | null => {
  if (!publicUrl) return null;
  // URL format: .../storage/v1/object/public/posters/game-posters/filename.jpg
  const match = publicUrl.match(/\/posters\/(.+)$/);
  return match ? match[1] : null;
};

// Delete storage files associated with a game record
const deleteStorageFiles = async (game: { posterImageUrl?: string; sceneImageUrl?: string }) => {
  const posterPath = extractStoragePath(game.posterImageUrl);
  const scenePath = extractStoragePath(game.sceneImageUrl);
  
  const pathsToDelete = [posterPath, scenePath].filter(Boolean) as string[];
  
  if (pathsToDelete.length > 0) {
    const { error } = await supabase.storage
      .from('posters')
      .remove(pathsToDelete);
      
    if (error) {
      console.error('Error deleting storage files:', error);
    }
  }
};

// Strip heavy inline data: URIs before caching to localStorage to avoid
// QuotaExceededError. The full image is still available via cloud refetch.
const slimGameForCache = (game: GameResult): GameResult => {
  const slim = { ...game };
  if (typeof slim.posterImageUrl === 'string' && slim.posterImageUrl.startsWith('data:')) {
    delete slim.posterImageUrl;
  }
  if (typeof slim.sceneImageUrl === 'string' && slim.sceneImageUrl.startsWith('data:')) {
    delete slim.sceneImageUrl;
  }
  return slim;
};

const slimGamesForCache = (games: GameResult[]): GameResult[] => games.map(slimGameForCache);

const sanitizeStoredImageUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Allow http(s) URLs and inline data: image URIs (legacy stored posters).
  // Data URIs can be several MB; only reject impossibly large strings to avoid memory issues.
  if (trimmed.startsWith('data:')) {
    return trimmed.startsWith('data:image/') ? trimmed : undefined;
  }
  if (trimmed.length > 4096) return undefined;
  return trimmed;
};

// Note: the on-load summary query goes through the get_game_history_summary
// RPC (see fetchFromDb) so that legacy inline data: URIs never come back over
// the wire. The full row (including intro_story / ending_narration / any
// legacy inline image) is fetched on demand via fetchGameDetails.

export interface GameResult {
  id: string;
  timestamp: number;
  outcome: 'won' | 'lost';
  killer: string;
  location: string;
  finalGirl: string;
  setupScenario?: string | null;
  startingEvent?: string | null;
  /**
   * Falconwood only: the Mission drawn for this game. Carried in memory for the
   * current session (and folded into gameHighlights on the results form) — it
   * has no column of its own.
   */
  mission?: string | null;
  // Extended fields for game details
  introStory?: string;
  endingNarration?: string;
  gameHighlights?: string;
  finalHorrorLevel?: number; // 1-7
  finalGirlHealth?: number;
  killerHealth?: number;
  weaponUsed?: string;
  endingSubLocation?: string;
  victimsSaved?: number | null;
  victimsKilled?: number | null;
  roundsPlayed?: number | null;
  playEvents?: PlayEvent[];
  posterImageUrl?: string;
  sceneImageUrl?: string;
  /** The look description shared by this game's opening still and poster. */
  visualBible?: string;
  hasLegacyPoster?: boolean;
  hasLegacyScene?: boolean;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  byFinalGirl: Record<string, { wins: number; losses: number }>;
  byKiller: Record<string, { wins: number; losses: number }>;
  byLocation: Record<string, { wins: number; losses: number }>;
}

// Convert GameResult to database row format
const toDbRow = (result: GameResult, userId: string) => ({
  id: result.id,
  user_id: userId,
  timestamp: result.timestamp,
  outcome: result.outcome,
  killer: result.killer,
  location: result.location,
  final_girl: result.finalGirl,
  setup_scenario: result.setupScenario ?? null,
  starting_event: result.startingEvent ?? null,
  intro_story: result.introStory ?? null,
  ending_narration: result.endingNarration ?? null,
  game_highlights: result.gameHighlights ?? null,
  final_horror_level: result.finalHorrorLevel ?? null,
  final_girl_health: result.finalGirlHealth ?? null,
  killer_health: result.killerHealth ?? null,
  weapon_used: result.weaponUsed ?? null,
  ending_sub_location: result.endingSubLocation ?? null,
  victims_saved: result.victimsSaved ?? null,
  victims_killed: result.victimsKilled ?? null,
  poster_image_url: sanitizeStoredImageUrl(result.posterImageUrl) ?? null,
  scene_image_url: sanitizeStoredImageUrl(result.sceneImageUrl) ?? null,
  visual_bible: result.visualBible ?? null,
  rounds_played: result.roundsPlayed ?? null,
  play_events: (result.playEvents ?? null) as unknown as Json,
});

// Convert snake_case from database to camelCase
const fromDbRow = (row: Record<string, unknown>): GameResult => ({
  id: row.id as string,
  timestamp: row.timestamp as number,
  outcome: row.outcome as 'won' | 'lost',
  killer: row.killer as string,
  location: row.location as string,
  finalGirl: row.final_girl as string,
  setupScenario: row.setup_scenario as string | null,
  startingEvent: row.starting_event as string | null,
  introStory: (row.intro_story as string) || undefined,
  endingNarration: (row.ending_narration as string) || undefined,
  gameHighlights: (row.game_highlights as string) || undefined,
  finalHorrorLevel: (row.final_horror_level as number | null) ?? undefined,
  finalGirlHealth: (row.final_girl_health as number | null) ?? undefined,
  killerHealth: (row.killer_health as number | null) ?? undefined,
  weaponUsed: (row.weapon_used as string) || undefined,
  endingSubLocation: (row.ending_sub_location as string) || undefined,
  victimsSaved: (row.victims_saved as number | null) ?? undefined,
  victimsKilled: (row.victims_killed as number | null) ?? undefined,
  posterImageUrl: sanitizeStoredImageUrl(row.poster_image_url),
  sceneImageUrl: sanitizeStoredImageUrl(row.scene_image_url),
  visualBible: (row.visual_bible as string) || undefined,
  roundsPlayed: (row.rounds_played as number | null) ?? undefined,
  playEvents: validPlayLog(row.play_events) ? row.play_events : undefined,
  hasLegacyPoster: row.has_legacy_poster === true,
  hasLegacyScene: row.has_legacy_scene === true,
});

type GameWrite =
  | { kind: 'record'; game: GameResult }
  | { kind: 'update'; id: string; updates: Partial<GameResult> };

const updateColumns: Partial<Record<keyof GameResult, string>> = {
  introStory: 'intro_story', endingNarration: 'ending_narration', gameHighlights: 'game_highlights',
  finalHorrorLevel: 'final_horror_level', finalGirlHealth: 'final_girl_health', killerHealth: 'killer_health',
  weaponUsed: 'weapon_used', endingSubLocation: 'ending_sub_location', victimsSaved: 'victims_saved',
  victimsKilled: 'victims_killed', posterImageUrl: 'poster_image_url', sceneImageUrl: 'scene_image_url',
  visualBible: 'visual_bible', roundsPlayed: 'rounds_played', playEvents: 'play_events',
};

function applyWrite(games: GameResult[], write: GameWrite): GameResult[] {
  if (write.kind === 'record') {
    // A retried insert must not overwrite a later ending already in the archive.
    return games.some(game => game.id === write.game.id) ? games : [write.game, ...games];
  }
  return games.map(game => game.id === write.id ? { ...game, ...write.updates } : game);
}

export const useGameHistory = () => {
  const { user, isLoading: authLoading, isAuthReady, authError } = useAuth();
  const userId = user?.id ?? null;
  const ownerRef = useRef(userId);
  ownerRef.current = userId;
  const [localGameHistory, setLocalGameHistory] = useLocalStorage<GameResult[]>('final-girl-game-history', []);
  // Deliberately do not import the old unowned cache: its account is unknown.
  const [cachedGames, setCachedGames] = useLocalStorage<GameResult[]>(`final-girl-history-v3:${userId ?? 'guest'}`, []);
  const [remote, setRemote] = useState<{ owner: string; games: GameResult[] } | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const fetchId = useRef(0);
  const base = userId && remote?.owner === userId ? remote.games : cachedGames;
  const baseRef = useRef(base);
  baseRef.current = base;

  const replaceBase = useCallback((games: GameResult[]) => {
    if (!userId || ownerRef.current !== userId) return;
    baseRef.current = games;
    const cached = slimGamesForCache(games);
    if (setCachedGames(cached)) setRemote(null);
    else setRemote({ owner: userId, games });
  }, [userId, setCachedGames]);

  const send = useCallback(async (write: GameWrite) => {
    if (!userId || ownerRef.current !== userId) throw new Error('Please sign in to finish saving your records.');
    if (write.kind === 'record') {
      const { error } = await supabase.from('game_history')
        .upsert(toDbRow(write.game, userId), { onConflict: 'id', ignoreDuplicates: true })
        .abortSignal(AbortSignal.timeout(20000));
      if (error) throw new Error(error.message);
    } else {
      const updates: Record<string, unknown> = {};
      Object.entries(write.updates).forEach(([key, value]) => {
        const column = updateColumns[key as keyof GameResult];
        if (!column || value === undefined) return;
        updates[column] = key === 'posterImageUrl' || key === 'sceneImageUrl'
          ? sanitizeStoredImageUrl(value) ?? null : value;
      });
      if (Object.keys(updates).length) {
        const { data, error } = await supabase.from('game_history').update(updates)
          .eq('id', write.id).eq('user_id', userId).select('id').abortSignal(AbortSignal.timeout(20000)).maybeSingle();
        if (error || !data) throw new Error(error?.message || 'The record was not found. Your changes remain on this device.');
      }
    }
    if (ownerRef.current === userId) replaceBase(applyWrite(baseRef.current, write));
  }, [userId, replaceBase]);

  const { pending, enqueue, flush, error: saveError } = useDurableQueue<GameWrite>(`final-girl-history-outbox-v1:${userId ?? 'guest'}`, Boolean(userId && isAuthReady && (loadedOwner === userId || loadError)), send);
  const gameHistory = userId ? pending.reduce(applyWrite, base) : localGameHistory;

  const fetchFromDb = useCallback(async () => {
    if (!userId) return;
    const requestId = ++fetchId.current;
    setIsDbLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.rpc('get_game_history_summary').abortSignal(AbortSignal.timeout(20000));
      if (error) throw new Error(error.message || 'Failed to retrieve session data.');
      if (requestId !== fetchId.current || ownerRef.current !== userId) return;
      const games = (data ?? []).map(row => {
        const summary = fromDbRow(row as unknown as Record<string, unknown>);
        const existing = baseRef.current.find(game => game.id === summary.id);
        // The summary intentionally omits narrative fields, not their existence.
        return { ...existing, ...summary,
          introStory: existing?.introStory, endingNarration: existing?.endingNarration,
          gameHighlights: existing?.gameHighlights, visualBible: existing?.visualBible,
          playEvents: existing?.playEvents,
        };
      });
      replaceBase(games);
      setLoadedOwner(userId);
    } catch (error) {
      if (requestId === fetchId.current && ownerRef.current === userId) {
        setLoadError(error instanceof Error ? error.message : 'Failed to retrieve session data.');
      }
    } finally {
      if (requestId === fetchId.current && ownerRef.current === userId) setIsDbLoading(false);
    }
  }, [userId, replaceBase]);

  useEffect(() => {
    if (isAuthReady && userId) void fetchFromDb();
    return () => { fetchId.current += 1; };
  }, [isAuthReady, userId, fetchFromDb]);

  useEffect(() => {
    if (!userId || loadedOwner !== userId || loadError || !localGameHistory.length) return;
    try {
      // Idempotent inserts merge guest history even into a non-empty archive.
      // Do not erase the guest copy until every entry has a durable owner log.
      localGameHistory.forEach(game => {
        if (!pending.some(write => write.kind === 'record' && write.game.id === game.id)) {
          enqueue({ kind: 'record', game });
        }
      });
      setLocalGameHistory([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not import saved games.');
    }
  }, [userId, loadedOwner, loadError, localGameHistory, enqueue, pending, setLocalGameHistory]);

  const recordGame = useCallback((result: Omit<GameResult, 'id' | 'timestamp'>, gameId?: string): GameResult => {
    const game = { ...result, id: gameId ?? crypto.randomUUID(), timestamp: Date.now() };
    if (userId) enqueue({ kind: 'record', game });
    else if (!setLocalGameHistory(games => [game, ...games])) throw new Error('This device could not save the game. Free some browser storage and try again.');
    return game;
  }, [userId, enqueue, setLocalGameHistory]);

  const updateGame = useCallback((id: string, updates: Partial<GameResult>) => {
    if (userId) enqueue({ kind: 'update', id, updates });
    else if (!setLocalGameHistory(games => games.map(game => game.id === id ? { ...game, ...updates } : game))) {
      throw new Error('This device could not save the changes. Please try again.');
    }
  }, [userId, enqueue, setLocalGameHistory]);

  const getStats = useCallback((): GameStats => {
    const history = gameHistory;
    const wins = history.filter(g => g.outcome === 'won').length;
    const losses = history.filter(g => g.outcome === 'lost').length;
    const totalGames = history.length;

    const byFinalGirl: Record<string, { wins: number; losses: number }> = {};
    const byKiller: Record<string, { wins: number; losses: number }> = {};
    const byLocation: Record<string, { wins: number; losses: number }> = {};

    history.forEach(game => {
      // Final Girl stats
      if (!byFinalGirl[game.finalGirl]) {
        byFinalGirl[game.finalGirl] = { wins: 0, losses: 0 };
      }
      if (game.outcome === 'won') {
        byFinalGirl[game.finalGirl].wins++;
      } else {
        byFinalGirl[game.finalGirl].losses++;
      }

      // Killer stats
      if (!byKiller[game.killer]) {
        byKiller[game.killer] = { wins: 0, losses: 0 };
      }
      if (game.outcome === 'won') {
        byKiller[game.killer].wins++;
      } else {
        byKiller[game.killer].losses++;
      }

      // Location stats
      if (!byLocation[game.location]) {
        byLocation[game.location] = { wins: 0, losses: 0 };
      }
      if (game.outcome === 'won') {
        byLocation[game.location].wins++;
      } else {
        byLocation[game.location].losses++;
      }
    });

    return {
      totalGames,
      wins,
      losses,
      winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
      byFinalGirl,
      byKiller,
      byLocation,
    };
  }, [gameHistory]);

  const fetchGameDetails = useCallback(async (id: string): Promise<GameResult | null> => {
    const existing = gameHistory.find(game => game.id === id);
    if (!userId) return existing ?? null;
    const { data, error } = await supabase.from('game_history').select('*')
      .eq('id', id).eq('user_id', userId).abortSignal(AbortSignal.timeout(20000)).maybeSingle();
    if (ownerRef.current !== userId) return null;
    if (error || !data) return existing ?? null;
    const full = fromDbRow(data as unknown as Record<string, unknown>);
    replaceBase(baseRef.current.map(game => game.id === id ? full : game));
    // Pending edits take precedence over a possibly older server response.
    return pending.reduce(applyWrite, [full]).find(game => game.id === id) ?? full;
  }, [gameHistory, userId, replaceBase, pending]);

  const deleteGame = useCallback(async (id: string) => {
    const game = gameHistory.find(item => item.id === id);
    if (!userId) {
      if (!setLocalGameHistory(games => games.filter(item => item.id !== id))) throw new Error('Could not delete the local record.');
      return;
    }
    if (!await flush()) throw new Error('Your saved changes must reach the archive before deleting records. Reconnect and try again.');
    const { error } = await supabase.from('game_history').delete().eq('id', id).eq('user_id', userId)
      .abortSignal(AbortSignal.timeout(20000));
    if (error) throw new Error(error.message);
    if (ownerRef.current !== userId) return;
    replaceBase(baseRef.current.filter(item => item.id !== id));
    if (game) await deleteStorageFiles(game);
  }, [gameHistory, userId, flush, replaceBase, setLocalGameHistory]);

  const clearHistory = useCallback(async () => {
    if (!userId) {
      if (!setLocalGameHistory([])) throw new Error('Could not clear local records.');
      return;
    }
    if (!await flush()) throw new Error('Your saved changes must reach the archive before resetting your plays. Reconnect and try again.');
    const games = [...baseRef.current];
    const { error } = await supabase.from('game_history').delete().eq('user_id', userId)
      .abortSignal(AbortSignal.timeout(20000));
    if (error) throw new Error(error.message);
    if (ownerRef.current !== userId) return;
    replaceBase([]);
    await Promise.all(games.map(deleteStorageFiles));
  }, [userId, flush, replaceBase, setLocalGameHistory]);

  return {
    gameHistory, recordGame, updateGame, deleteGame, getStats, fetchGameDetails, clearHistory,
    retryLoadHistory: fetchFromDb,
    retryPendingSaves: flush,
    pendingSaveCount: userId ? pending.length : 0,
    saveError: saveError,
    isLoading: !isAuthReady || authLoading || Boolean(userId && isDbLoading),
    loadError: userId ? loadError : authError,
    isDegraded: Boolean(userId && loadError && gameHistory.length),
  };
};

