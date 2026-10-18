import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { readStoredValue, useLocalStorage } from './useLocalStorage';
import { isPlayEvent, newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { ActiveGame, isActiveGame } from '@/lib/activeGame';

export function useActiveGame() {
  const { user, isAuthReady } = useAuth();
  const key = `final-girl-active-game-v1:${user?.id ?? 'guest'}`;
  const [stored, setStored] = useLocalStorage<ActiveGame | null>(key, null);
  const activeGame = isAuthReady && isActiveGame(stored) ? stored : null;
  const save = useCallback((game: ActiveGame | null) => {
    const ok = setStored(game);
    if (!ok) toast.error('This device could not save your game progress. Free browser storage and try again.');
    return ok;
  }, [setStored]);
  const checkpoint = useCallback((id: string, updates: Partial<ActiveGame>) => {
    const ok = setStored(previous => previous?.id === id ? { ...previous, ...updates, ...(updates.playDrafts && {playDrafts: {...previous.playDrafts, ...updates.playDrafts}}), id, version: 1 } : previous);
    if (!ok) toast.error('Your latest progress could not be saved on this device. Please keep this page open.');
    return ok;
  }, [setStored]);
  const updateFormDraft = useCallback((id: string, fields: Record<string, unknown>) => {
    const ok = setStored(previous => previous?.id === id ? { ...previous, formDraft: { ...previous.formDraft, ...fields } } : previous);
    if (!ok) toast.error('This device could not save the form. Free browser storage and try again.');
    return ok;
  }, [setStored]);
  const appendPlayEvent = useCallback((id: string, event: PlayEvent) => {
    if (!isPlayEvent(event)) return false;
    let applied = false;
    const ok = setStored(previous => {
      if (previous?.id !== id || (previous.playEvents?.length ?? 0) >= 1000 || previous.playEvents?.some(e => e.id === event.id)) return previous;
      if (event.kind === 'start' && summarizePlay(previous.playEvents).tracked) return previous;
      const log = previous.playEvents ?? [];
      // A tap arriving before the entry effect still gets a durable baseline.
      const baseline = event.kind !== 'start' && !summarizePlay(log).tracked
        ? [newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 })] : [];
      if (log.length + baseline.length + 1 > 1000) return previous;
      applied = true;
      return { ...previous, playEvents: [...log, ...baseline, event] };
    });
    if (!ok) toast.error('This change could not be saved. Free device storage and try again.');
    return ok && applied;
  }, [setStored]);
  const getCurrentGame = useCallback(() => {
    const current = readStoredValue<ActiveGame | null>(key, null);
    return isActiveGame(current) ? current : null;
  }, [key]);
  return { activeGame, save, checkpoint, updateFormDraft, appendPlayEvent, getCurrentGame };
}
