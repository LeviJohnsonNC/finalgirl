import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GameResult } from '@/hooks/useGameHistory';
import { validPlayLog, type PlayEvent } from '@/lib/play/events';
import { buildPlayStyle, STYLE_HISTORY_LIMIT } from '@/lib/playStyle';

type ReadState =
  | { key: string; status: 'ready'; logs: Map<string, PlayEvent[] | undefined> }
  | { key: string; status: 'error' };

export function usePlayStyle(owner: string | undefined, games: GameResult[], pending: number, archiveLoading: boolean) {
  const recent = useMemo(() => [...games]
    .sort((a, b) => b.timestamp - a.timestamp || b.id.localeCompare(a.id))
    .slice(0, STYLE_HISTORY_LIMIT), [games]);
  const ids = recent.map(game => game.id).join(',');
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([owner, ids, pending, attempt]);
  const [read, setRead] = useState<ReadState>();
  const current = read?.key === key ? read : undefined;

  useEffect(() => {
    if (!owner || !ids || archiveLoading) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const { data, error } = await supabase.from('game_history')
          .select('id,play_events')
          .eq('user_id', owner)
          .in('id', ids.split(','))
          .abortSignal(AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]));
        if (controller.signal.aborted) return;
        if (error) throw error;
        const logs = new Map((data ?? []).map(row => [
          row.id, validPlayLog(row.play_events) ? row.play_events : undefined,
        ]));
        setRead({ key, status: 'ready', logs });
      } catch {
        if (!controller.signal.aborted) setRead({ key, status: 'error' });
      }
    })();
    return () => controller.abort();
  }, [owner, ids, key, archiveLoading]);

  const report = useMemo(() => {
    if (current?.status !== 'ready') return undefined;
    return buildPlayStyle(recent.map(game => ({
      ...game,
      playEvents: pending > 0 && game.playEvents
        ? game.playEvents
        : current.logs.get(game.id),
    })));
  }, [current, recent, pending]);

  return { report, status: current?.status ?? 'loading', retry: () => setAttempt(value => value + 1) };
}
