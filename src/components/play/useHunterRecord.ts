import { HUNTER_MODULE, hunterParent, hunterState, resolveHunterAction, type HunterAction } from '@/lib/play/hunter';
import { newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { useModuleRecord } from './useModuleRecord';

type Command = HunterAction extends infer A ? A extends HunterAction ? Omit<A, 'parent'> : never : never;
export function useHunterRecord(events: PlayEvent[], onEvent: (event: PlayEvent) => boolean, blocked = false) {
 const summary = summarizePlay(events), entries = summary.entries, fields = moduleState(entries, HUNTER_MODULE);
 const { record, message } = useModuleRecord(events, onEvent);
 const act = (command: Command) => {
  if (blocked) return false;
  const hunterAction = { ...command, parent: hunterParent(entries) } as HunterAction;
  const changes = resolveHunterAction(hunterAction, fields, entries);
  return !!changes && record(newPlayEvent({ kind: 'module', hunterAction, moduleData: { module: HUNTER_MODULE, changes } }));
 };
 return { summary, entries, fields, s: hunterState(fields), act, message };
}
