import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useLocalStorage } from './useLocalStorage';
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
    const ok = setStored(previous => previous?.id === id ? { ...previous, ...updates, id, version: 1 } : previous);
    if (!ok) toast.error('Your latest progress could not be saved on this device. Please keep this page open.');
    return ok;
  }, [setStored]);
  const updateFormDraft = useCallback((id: string, fields: Record<string, unknown>) => {
    const ok = setStored(previous => previous?.id === id ? { ...previous, formDraft: { ...previous.formDraft, ...fields } } : previous);
    if (!ok) toast.error('This device could not save the form. Free browser storage and try again.');
    return ok;
  }, [setStored]);
  return { activeGame, save, checkpoint, updateFormDraft };
}
