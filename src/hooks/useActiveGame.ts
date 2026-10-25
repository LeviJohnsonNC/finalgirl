import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { readStoredValue, useLocalStorage } from './useLocalStorage';
import { canChangeDeathCount, isPlayEvent, isPermanentMoment, newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { ActiveGame, isActiveGame } from '@/lib/activeGame';
import { mapleLinkedChange } from '../../supabase/functions/_shared/play/maple';
import { initialModuleObservations, moduleState } from '@/lib/play/modules';
import { frightState, parseFright, initialFright, validFrightSuccessor } from '../../supabase/functions/_shared/play/fright';
import { discardedGamesKey, isGameDiscarded } from '@/lib/discardedGames';

export function useActiveGame() {
  const { user, isAuthReady } = useAuth();
  const key = `final-girl-active-game-v1:${user?.id ?? 'guest'}`;
  const owner = user?.id ?? 'guest';
  useLocalStorage(discardedGamesKey(owner), {});
  const [stored, setStored] = useLocalStorage<ActiveGame | null>(key, null);
  const activeGame = isAuthReady && isActiveGame(stored) && !isGameDiscarded(owner, stored.id) ? stored : null;
  const save = useCallback((game: ActiveGame | null) => {
    if (game && isGameDiscarded(owner, game.id)) return false;
    const ok = setStored(game);
    if (!ok) toast.error('This device could not save your game progress. Free browser storage and try again.');
    return ok;
  }, [setStored, owner]);
  const checkpoint = useCallback((id: string, updates: Partial<ActiveGame>) => {
    if (isGameDiscarded(owner, id)) return false;
    const ok = setStored(previous => previous?.id === id ? { ...previous, ...updates, ...(updates.playDrafts && {playDrafts: {...previous.playDrafts, ...updates.playDrafts}}), id, version: 1 } : previous);
    if (!ok) toast.error('Your latest progress could not be saved on this device. Please keep this page open.');
    return ok;
  }, [setStored, owner]);
  const updateFormDraft = useCallback((id: string, fields: Record<string, unknown>) => {
    if (isGameDiscarded(owner, id)) return false;
    const ok = setStored(previous => previous?.id === id ? { ...previous, formDraft: { ...previous.formDraft, ...fields } } : previous);
    if (!ok) toast.error('This device could not save the form. Free browser storage and try again.');
    return ok;
  }, [setStored, owner]);
  const appendPlayEvent = useCallback((id: string, event: PlayEvent) => {
    if (isGameDiscarded(owner, id)) return false;
    if (!isPlayEvent(event)) return false;
    let applied = false;
    const ok = setStored(previous => {
      if (previous?.id !== id || (previous.playEvents?.length ?? 0) >= 1000 || previous.playEvents?.some(e => e.id === event.id)) return previous;
      if (event.kind === 'start' && summarizePlay(previous.playEvents).tracked) return previous;
      // Shared reveal controls can be reached from two places. The durable log
      // owns uniqueness, including two taps arriving before React renders.
      if (isPermanentMoment(event) && summarizePlay(previous.playEvents).entries.some(entry => entry.kind === 'moment' && entry.momentType === event.momentType)) return previous;
      const log = previous.playEvents ?? [];
      if (event.kind === 'death-count' && !canChangeDeathCount(log, event)) return previous;
      let accepted = event;
      if (event.moduleData?.module === 'maple' && previous.selection.location !== 'Maple Lane') return previous;
      if (event.moduleData?.module === 'fright') {
        const snapshot=parseFright(event.moduleData.changes.snapshot);
        if (previous.selection.killer !== 'Dr. Fright' || !snapshot || snapshot.parent !== (frightState(summarizePlay(log).entries)?.eventId ?? 'root') || !validFrightSuccessor(snapshot,log,summarizePlay(log).entries)) return previous;
      }
      // A tap arriving before the entry effect still gets a durable baseline.
      const baseline = event.kind !== 'start' && !summarizePlay(log).tracked
        ? [newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 })] : [];
      // Persist setup and the first tap together. Never backfill an existing log:
      // a player may already have resolved, cleared or undone the starting state.
      const setup = log.length === 0
        ? initialModuleObservations(previous.selection, previous.geppettoSetupVersion === 1, previous.carnivalSetupVersion === 1, previous.billySetupVersion === 1, previous.mapleSetupVersion === 1).map(moduleData => newPlayEvent({ kind: 'module', moduleData }))
        : [];
      if (log.length === 0 && previous.frightSetupVersion === 1 && previous.selection.killer === 'Dr. Fright' && event.moduleData?.module !== 'fright') setup.unshift(newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(initialFright())}}}));
      if (event.moduleData?.module === 'maple') {
        if (previous.selection.location !== 'Maple Lane') return previous;
        const current=moduleState(summarizePlay([...log,...baseline,...setup]).entries,'maple');
        const changes=mapleLinkedChange(current,event.moduleData.changes);
        if(Object.entries(changes).every(([key,value])=>value === null ? current[key] === undefined : current[key] === value)) return previous;
        accepted={...event,moduleData:{module:'maple',changes}};
        if (!isPlayEvent(accepted)) return previous;
      }
      const additions = event.kind === 'start' ? [accepted, ...setup] : [...baseline, ...setup, accepted];
      if (log.length + additions.length > 1000) return previous;
      applied = true;
      return { ...previous, playEvents: [...log, ...additions] };
    });
    if (!ok) toast.error('This change could not be saved. Free device storage and try again.');
    return ok && applied;
  }, [setStored, owner]);
  const getCurrentGame = useCallback(() => {
    const current = readStoredValue<ActiveGame | null>(key, null);
    return isActiveGame(current) && !isGameDiscarded(owner, current.id) ? current : null;
  }, [key, owner]);
  return { activeGame, save, checkpoint, updateFormDraft, appendPlayEvent, getCurrentGame };
}
