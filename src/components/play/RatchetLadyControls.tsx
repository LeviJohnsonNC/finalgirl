import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  HOLD_HER_DOWN, MAX_MANIACS, RATCHET_LADY, RATCHET_MINORS, RATCHET_MODULE,
  ratchetCount, ratchetFinale, ratchetMinorHealth, ratchetParent, resolveRatchetAction,
  type RatchetCommand,
} from '../../../supabase/functions/_shared/play/ratchetLady';
import { newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { KillerCards } from './KillerCards';
import { MinorPowerControl } from './MinorPowerControl';
import { MinorPowerGroup } from './MinorPowerGroup';
import { ModuleArtwork } from './ModuleArtwork';
import { PlaySelect } from './PlaySelect';
import { ratchetLadyArt } from './ratchetLadyArt';
import { useModuleRecord } from './useModuleRecord';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-ratchet-lady.css';

type RecordProps = { events: PlayEvent[]; onEvent: (event: PlayEvent) => boolean; disabled?: boolean };
const counts = Array.from({ length: MAX_MANIACS + 1 }, (_, count) => count);

function useRatchetRecord({ events, onEvent }: RecordProps) {
  const entries = summarizePlay(events).entries;
  const state = moduleState(entries, RATCHET_MODULE);
  const { record, message } = useModuleRecord(events, onEvent);
  const send = (command: RatchetCommand) => {
    const action = { ...command, parent: ratchetParent(entries) };
    const changes = resolveRatchetAction(action, state, entries);
    return !!changes && record(newPlayEvent({
      kind: 'module', moduleData: { module: RATCHET_MODULE, changes }, ratchetAction: action,
    }));
  };
  return { state, finale: ratchetFinale(entries), send, record, message };
}

export function RatchetLadyControls({ events, onEvent, blocked }: ControlsProps) {
  const { state, finale, send, record, message } = useRatchetRecord({ events, onEvent });
  const [editingCount, setEditingCount] = useState(false);
  const [choosingCalm, setChoosingCalm] = useState(false);
  const count = ratchetCount(state.maniacs) ? state.maniacs : undefined;
  const calmAvailable = !!count && !state.calmRemoved && finale?.killerCard !== HOLD_HER_DOWN;
  const setCount = (value: number) => {
    if (value === count || send({ command: 'count', count: value })) {
      setEditingCount(false);
      setChoosingCalm(false);
    }
  };
  const calm = (amount: 1 | 2) => {
    if (send({ command: 'calm', amount })) setChoosingCalm(false);
  };

  return <>
    <article className="ratchet-maniacs" aria-label="Maniacs tracker">
      <div className="ratchet-maniacs-photo">
        <ModuleArtwork art={ratchetLadyArt(count === undefined ? 'banner' : `maniacs-${count}`)} />
      </div>
      <div className="ratchet-maniacs-bar">
        <div>
          <h3>Maniacs</h3>
          {state.calmRemoved && <small>Calm removed</small>}
          {count === undefined && <small>Count unrecorded</small>}
        </div>
        <div className="ratchet-maniacs-actions">
          <div className="play-state-stepper" role="group" aria-label="Maniacs on board">
            <button type="button" aria-label="Decrease Maniacs" disabled={blocked || !count}
              onClick={() => count && setCount(count - 1)}><Minus size={16} /></button>
            <button type="button" aria-label="Set Maniac count" aria-expanded={editingCount}
              aria-description={count === undefined ? 'Count unrecorded' : `Current count: ${count}`}
              disabled={blocked} onClick={() => { setChoosingCalm(false); setEditingCount(!editingCount); }}>
              {count ?? '?'}
            </button>
            <button type="button" aria-label="Increase Maniacs" disabled={blocked || count === undefined || count >= MAX_MANIACS}
              onClick={() => count !== undefined && setCount(count + 1)}><Plus size={16} /></button>
          </div>
          {calmAvailable && <button type="button" className="ratchet-action" disabled={blocked}
            onClick={() => {
              setEditingCount(false);
              if (count === 1) calm(1);
              else setChoosingCalm(!choosingCalm);
            }}>Calm</button>}
        </div>
      </div>
      {editingCount && <div className="ratchet-record-row">
        <PlaySelect aria-label="Maniac count to record" value="" disabled={blocked}
          onChange={event => { if (event.target.value) setCount(Number(event.target.value)); }}>
          <option value="" disabled>Set current count</option>
          {counts.map(value => <option key={value} value={String(value)}>{value}</option>)}
        </PlaySelect>
        <button type="button" className="ratchet-action" onClick={() => setEditingCount(false)}>Cancel</button>
      </div>}
      {choosingCalm && calmAvailable && <div className="ratchet-record-row">
        <button type="button" className="ratchet-action" disabled={blocked} onClick={() => calm(1)}>Calmed 1</button>
        <button type="button" className="ratchet-action" disabled={blocked} onClick={() => calm(2)}>Calmed 2</button>
        <button type="button" className="ratchet-action" onClick={() => setChoosingCalm(false)}>Cancel</button>
      </div>}
    </article>
    <MinorPowerGroup>
      {RATCHET_MINORS.map(card => {
        const field = ratchetMinorHealth(card.id);
        const value = state[field];
        return <MinorPowerControl key={card.id} name={card.name}
          health={typeof value === 'number' ? value : undefined} maxHealth={card.health}
          disabled={blocked} art={() => ratchetLadyArt(card.id)} heroArt={ratchetLadyArt(card.id)}
          choiceArt={ratchetLadyArt(card.id, true)} onChange={health => record(newPlayEvent({
            kind: 'module', moduleData: { module: RATCHET_MODULE, changes: { [field]: health } },
          }))} />;
      })}
    </MinorPowerGroup>
    <KillerCards killer={RATCHET_LADY} events={events} onEvent={onEvent} disabled={blocked} />
    {message && <p role="alert" className="play-module-error">{message}</p>}
  </>;
}

export function RatchetFinaleControl(props: RecordProps) {
  const { state, finale, send, message } = useRatchetRecord(props);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState('');
  const recorded = state.calmRemoved === true;
  if (!finale || (!recorded && finale.killerCard !== HOLD_HER_DOWN)) return null;

  return <div className="ratchet-finale">
    {recorded && finale.killerCard && finale.killerCard !== HOLD_HER_DOWN &&
      <small>Calm removal was recorded for Hold Her Down.</small>}
    {!open ? <button type="button" className={recorded ? 'module-unnamed' : 'ratchet-action'}
      disabled={props.disabled} onClick={() => { setCount(''); setOpen(true); }}>
      {recorded ? 'Correct Calm removal' : 'Record reveal effect'}
    </button> : <form className="ratchet-record-row" onSubmit={event => {
      event.preventDefault();
      if (!count) return;
      const observed = count === 'unknown' ? null : Number(count);
      if (send(recorded ? { command: 'correct-hold', count: observed } :
        { command: 'hold', reveal: finale.id, count: observed })) setOpen(false);
    }}>
      <PlaySelect aria-label="Maniacs after resolving the Finale" value={count} onChange={event => setCount(event.target.value)}>
        <option value="" disabled>Maniacs on board now</option>
        <option value="unknown">Unknown</option>
        {counts.map(value => <option key={value} value={String(value)}>{value}</option>)}
      </PlaySelect>
      <button type="submit" className="ratchet-action" disabled={props.disabled || !count}>
        {recorded ? 'Restore Calm' : 'Record Calm removed'}
      </button>
      <button type="button" className="ratchet-action" onClick={() => setOpen(false)}>Cancel</button>
    </form>}
    {message && <p role="alert" className="play-module-error">{message}</p>}
  </div>;
}
