import {INTRUDERS,INTRUDER_ROSTER} from "./intruders.ts";
import type { PlaySummary } from './events.ts';
import type { ModuleSelection } from './modules.ts';
import { parseTormentor, TORMENTOR_TRAPS } from './tormentor.ts';
import { KONRAD_FUNCTIONS } from './konradCatalog.ts';

export interface StoryTransition { index: number; priority: number; line: string }

/** Only explicit, effective observations. Toggling a system never proves its effects. */
export function storyTransitions(entries: PlaySummary['entries'], selection?: ModuleSelection): StoryTransition[] {
  const intruderReturns:StoryTransition[]=[];
  const escapes = new Map<string, StoryTransition>();
  const systems = new Map<string, Array<{ index: number; round: number | null; active: boolean }>>();
  let traps = parseTormentor(undefined);
  entries.forEach((e, index) => {
    const intruder=e.intruderAction;
    if (selection?.killer===INTRUDERS && (intruder?.command==='return'||intruder?.command==='epic')) {
      const name=INTRUDER_ROSTER.find(person=>person.id===intruder.who)!.name;
      intruderReturns.push({index,priority:95,line:`${e.currentRound?`Round ${e.currentRound}: `:''}${name} returned ${intruder.command==='epic'?'through Won’t Stay Down':'after revealing Final Health'}.`});
    }
    if (selection?.killer === 'The Tormentor' && e.moduleData?.module === 'tormentor') {
      const next = parseTormentor(e.moduleData.changes.snapshot);
      if (!next) return;
      // Keep each completion's original position, not every later snapshot.
      for (const id of escapes.keys()) {
        if (next.traps[id]?.status !== 'escaped') escapes.delete(id);
        else if (traps?.traps[id]?.subject !== next.traps[id]?.subject) escapes.delete(id);
      }
      const action = e.tormentorAction;
      if (action && ['task', 'task-progress', 'correct'].includes(action.command) && 'id' in action) {
        const trap = next.traps[action.id], card = TORMENTOR_TRAPS.find(c => c.id === action.id);
        if (trap?.status === 'escaped' && traps?.traps[action.id]?.status !== 'escaped' && card) {
          const subject = card.deck === 'girl' ? 'Final Girl' : trap.subject || 'Victim';
          const correction = action.command === 'task' ? 'escaped' : 'escape status corrected to escaped';
          escapes.set(action.id, { index, priority: 95,
            line: `${e.currentRound ? `Round ${e.currentRound}: ` : ''}${subject} ${correction}: ${card.name}. Trap escape does not establish an Exit rescue.` });
        }
      }
      traps = next;
    }
    if (selection?.location === 'USS Konrad' && e.moduleData?.module === 'konrad' && e.konradAction) {
      const action = e.konradAction;
      const id = action.command === 'toggle' && action.target.startsWith('system:') ? action.target.slice(7)
        : action.command === 'activate' || action.command === 'cancel' ? action.system : undefined;
      if (!id || !KONRAD_FUNCTIONS.some(f => f.id === id)) return;
      const active = action.command === 'toggle' ? action.active : action.command === 'activate';
      const history = systems.get(id) ?? [];
      if (history[history.length - 1]?.active !== active) history.push({ index, round: e.currentRound, active });
      systems.set(id, history.slice(-2));
    }
  });
  return [...intruderReturns,...escapes.values(), ...[...systems].map(([id, observations]) => ({
    index: observations[observations.length - 1].index, priority: 85,
    line: `${KONRAD_FUNCTIONS.find(f => f.id === id)!.name}: ${observations.map(o => `observed ${o.active ? 'on' : 'off'}${o.round ? ` in round ${o.round}` : ''}`).join(', then ')}. Cause and effects unrecorded by these switches.`,
  }))];
}
