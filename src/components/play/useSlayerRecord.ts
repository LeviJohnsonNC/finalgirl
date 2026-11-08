import { newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { SLAYER_MODULE, slayerState, slayerParent, resolveSlayerAction, type SlayerCommand } from '@/lib/play/slayer';
import { useModuleRecord } from './useModuleRecord';

export function useSlayerRecord(events: PlayEvent[], onEvent: (event: PlayEvent) => boolean, blocked?: boolean) {
  const {record, message} = useModuleRecord(events, onEvent);
  const {entries} = summarizePlay(events);
  const fields = moduleState(entries, SLAYER_MODULE);
  const act = (command: SlayerCommand) => {
    if (blocked) return false;
    const action = {...command, parent:slayerParent(entries)};
    const changes = resolveSlayerAction(action, fields, entries);
    return !!changes && record(newPlayEvent({kind:'module', slayerAction:action, moduleData:{module:SLAYER_MODULE, changes}}));
  };
  return {entries, state:slayerState(fields), act, message};
}
