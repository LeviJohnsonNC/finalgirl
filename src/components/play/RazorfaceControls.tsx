import { useState } from 'react';
import { Check, Link2, Plus, Unlink2 } from 'lucide-react';
import {
  AFFLICTIONS, RAZORFACE, RAZORFACE_MINORS, RAZORFACE_MODULE, affliction, razorfaceAvailable, razorfaceEntry,
  razorfaceLatest, razorfaceState, type AfflictionId, type RazorfaceCommand,
} from '../../../supabase/functions/_shared/play/razorface';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { KillerCards } from './KillerCards';
import { MinorPowerControl } from './MinorPowerControl';
import { MinorPowerGroup } from './MinorPowerGroup';
import { ModuleArtwork } from './ModuleArtwork';
import type { ControlsProps } from './moduleDefinitions';
import { PlaySelect } from './PlaySelect';
import { razorfaceAfflictionArt, razorfaceArt } from './razorfaceArt';
import { useModuleRecord } from './useModuleRecord';
import '@/styles/play-razorface.css';

type Panel = 'setup' | 'correct' | 'draw' | 'replace' | 'token';
type Card = typeof AFFLICTIONS[number];

export function RazorfaceControls({events, onEvent, blocked = false, razorfaceFresh = false}: ControlsProps) {
  const summary = summarizePlay(events);
  const state = razorfaceState(summary.entries);
  const latest = razorfaceLatest(summary.entries);
  const lastAction = latest && razorfaceEntry(latest);
  const {record, message} = useModuleRecord(events, onEvent);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [selection, setSelection] = useState<AfflictionId[]>([]);
  const [replacing, setReplacing] = useState<AfflictionId | ''>('');
  const [replacement, setReplacement] = useState<AfflictionId | ''>('');
  const [reason, setReason] = useState<'impossible' | 'exchange'>('impossible');
  const [revive, setRevive] = useState('');
  const [requiredDrawFailed, setRequiredDrawFailed] = useState(false);
  const active = AFFLICTIONS.filter(card => state.active?.includes(card.id));
  const visibleCards = AFFLICTIONS.filter(card => state.active?.includes(card.id) || state.purged.includes(card.id));
  const canReveal = state.active?.length === 0;
  const over = state.result === 'exhausted' || state.result === 'defeated';
  const disabled = blocked || over;
  const tokenReady = (canReveal || state.result === 'revived') && (summary.killerHealth ?? 0) <= 1;
  const title = state.result === 'exhausted' ? 'Affliction deck exhausted'
    : state.result === 'defeated' ? 'Razorface defeated'
    : state.result === 'revived' ? 'Final Health revealed'
    : canReveal ? 'Final Health can be revealed'
    : active.length ? 'Final Health protected' : 'Afflictions unrecorded';

  const choose = (next: Panel) => {
    setSelection(next === 'correct' ? [...state.active ?? []] : []);
    setReplacing(next === 'replace' && active.length === 1 ? active[0].id : '');
    setReplacement('');
    setRequiredDrawFailed(false);
    setReason('impossible');
    setRevive('');
    setPanel(next);
  };
  const save = (command: RazorfaceCommand) => {
    if (disabled) return;
    const action = {...command, parent:latest?.id ?? 'root'};
    if (record(newPlayEvent({kind:'module',moduleData:{module:RAZORFACE_MODULE,changes:{action:JSON.stringify(action)}}}))) {
      setPanel(null);
      setRequiredDrawFailed(false);
    }
  };
  const available = AFFLICTIONS.filter(card => razorfaceAvailable(state, card.id));

  const renderedCard = (card: Card) => {
    const purged = state.purged.includes(card.id);
    return <article className="razorface-card" data-state={purged ? 'purged' : 'afflicted'} data-affliction={card.id} key={card.id}>
      <div className="razorface-art-frame">
        <ModuleArtwork key={purged ? 'purged' : 'afflicted'} art={razorfaceAfflictionArt(card.id, purged)} />
      </div>
      <div className="razorface-card-body">
        <h4>{card.name}</h4>
        {purged
          ? <span className="razorface-purged"><Check size={16} aria-hidden />Purged</span>
          : <button type="button" className="razorface-purge" aria-label={`Mark ${card.name} purged`}
              title="Record the purge you resolved at the table" disabled={disabled}
              onClick={() => {
                // A click records an already-resolved tabletop purge, including its turn timing.
                save({kind:'purge', card:card.id, newTurn:state.purged.length > 0});
              }}><span><Unlink2 size={16} aria-hidden />Purged</span></button>}
      </div>
    </article>;
  };

  function renderExhaustion(discarded?: AfflictionId) {
    return <div className="razorface-exhaustion">
      <label className="razorface-check"><input type="checkbox" checked={requiredDrawFailed}
        onChange={event => setRequiredDrawFailed(event.target.checked)} /> A required draw failed because the deck was empty.</label>
      {requiredDrawFailed && <button type="button" className="razorface-primary" disabled={disabled}
        onClick={() => save({kind:'exhausted', ...(discarded && {discarded,reason})})}>Record Affliction deck loss</button>}
    </div>;
  }
  const availableForEditor = panel === 'draw' ? available : AFFLICTIONS.filter(card =>
    !state.purged.includes(card.id) && !state.removed.includes(card.id));
  const setCard = (card: AfflictionId) => {
    if (panel === 'draw') setSelection([card]);
    else setSelection(selection.includes(card) ? selection.filter(id => id !== card)
      : panel === 'setup' && selection.length === 3 ? selection : [...selection,card]);
  };
  const minorCards = RAZORFACE_MINORS.map(card => <MinorPowerControl key={card.id}
    name={card.name} mode="presence" active={state.minors.includes(card.id)}
    art={razorfaceArt(card.id)} choiceArt={razorfaceArt(card.id, true)} disabled={disabled || !active.length && !state.minors.includes(card.id)}
    onChange={present => save({kind:'minor', card:card.id, present})} />);

  return <section className="razorface-objective" aria-label="Afflictions" data-module-control="objective" data-cleared={canReveal && !over}>
    <header className="razorface-heading">
      <div>
        <h3>Afflictions</h3>
        <p aria-live="polite">{state.active === undefined ? 'Record the face-up cards from your table.'
          : `${active.length} in play${state.purged.length ? ` · ${state.purged.length} purged` : ''}`}</p>
      </div>
      <p className="razorface-status" aria-live="polite">{canReveal || state.result === 'revived' ? <Unlink2 aria-hidden /> : <Link2 aria-hidden />}{title}</p>
    </header>
    {visibleCards.length > 0 && <div className="razorface-grid">{visibleCards.map(renderedCard)}</div>}
    {canReveal && !over && <div className="razorface-release">
      <ModuleArtwork art={razorfaceArt('unbound')} />
      <div><strong>{state.result === 'revived' ? 'Razorface came back' : state.purged.length ? 'The last chain is broken' : 'No Afflictions in play'}</strong>
      <p>{state.result === 'revived' ? 'Record his defeat when the remaining Health is gone.' : 'Resolve his Final Health token at the table when damage would reveal it.'}</p></div>
    </div>}
    <div className="razorface-actions">
      {state.active === undefined && razorfaceFresh && <button type="button" className="razorface-primary" disabled={disabled} onClick={() => choose('setup')}>Record the opening three</button>}
      {((canReveal && !over) || state.result === 'revived') && <button type="button" className={tokenReady ? 'razorface-primary' : 'razorface-text'}
        disabled={disabled || !tokenReady} onClick={() => choose('token')}>Record Final Health result</button>}
      {state.active !== undefined && !over && <button type="button" className={tokenReady ? 'razorface-text' : 'razorface-primary'}
        disabled={disabled} onClick={() => choose('draw')}><Plus size={17} aria-hidden /> Record a draw</button>}
      {state.active === undefined && !over && <button type="button" className={razorfaceFresh ? 'razorface-text' : 'razorface-primary'} disabled={disabled}
        onClick={() => choose('correct')}>{razorfaceFresh ? 'Resume from the board' : 'Record cards in play'}</button>}
      {active.length > 0 && !over && <button type="button" className="razorface-text" disabled={blocked}
        onClick={() => choose('replace')}>Replace an Affliction</button>}
      {state.active !== undefined && !over && <button type="button" className="razorface-text" disabled={blocked} onClick={() => choose('correct')}>Correct Afflictions</button>}
      {latest && lastAction && <button type="button" className="razorface-text" disabled={blocked}
        onClick={() => { if (record(newPlayEvent({kind:'undo', target:latest.id}))) setPanel(null); }}>
        {lastAction.kind === 'purge' ? 'Undo purge' : 'Undo Affliction record'}
      </button>}
    </div>
    {(panel === 'setup' || panel === 'correct' || panel === 'draw') && <div className="razorface-editor">
      <p>{panel === 'setup' ? `Choose the three opening cards · ${selection.length}/3`
        : panel === 'draw' ? 'Choose the card you drew.' : 'Select every Affliction still in play. Leave all unselected if none remain.'}</p>
      <div className="razorface-picker">
        {availableForEditor.map(card => <button type="button" key={card.id} aria-pressed={selection.includes(card.id)}
          disabled={disabled || panel === 'setup' && selection.length === 3 && !selection.includes(card.id)}
          onClick={() => setCard(card.id)}>
          <ModuleArtwork art={razorfaceAfflictionArt(card.id, false)} /><span>{card.name}</span>{selection.includes(card.id) && <Check size={17} aria-hidden />}
        </button>)}
      </div>
      <div className="razorface-actions">
        <button type="button" className="razorface-primary" disabled={disabled || panel === 'setup' && selection.length !== 3 || panel === 'draw' && !selection.length}
          onClick={() => panel === 'draw' ? save({kind:'draw',card:selection[0]}) : save({kind:panel,cards:selection})}>
          {panel === 'setup' ? 'Set opening Afflictions' : panel === 'draw' ? 'Record drawn card' : 'Save cards in play'}
        </button>
        <button type="button" className="razorface-text" onClick={() => setPanel(null)}>Cancel</button>
      </div>
      {panel === 'draw' && renderExhaustion()}
    </div>}
    {panel === 'replace' && <div className="razorface-editor">
      {active.length > 1 && <PlaySelect value={replacing} aria-label="Affliction to replace" disabled={disabled}
        onChange={event => setReplacing(affliction(event.target.value)?.id ?? '')}>
        <option value="">Choose the Affliction to replace</option>
        {active.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
      </PlaySelect>}
      <PlaySelect value={reason} aria-label="Replacement reason" disabled={disabled}
        onChange={event => setReason(event.target.value === 'exchange' ? 'exchange' : 'impossible')}>
        <option value="impossible">Requirement is impossible</option>
        <option value="exchange">Exchanged by a card effect after a purge</option>
      </PlaySelect>
      <PlaySelect value={replacement} aria-label="Replacement Affliction" disabled={disabled}
        onChange={event => setReplacement(affliction(event.target.value)?.id ?? '')}>
        <option value="">Choose the replacement drawn</option>
        {available.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
      </PlaySelect>
      <div className="razorface-actions">
        <button type="button" className="razorface-primary" disabled={disabled || !replacing || !replacement}
          onClick={() => {if (replacing && replacement) save({kind:'replace', card:replacing, replacement, reason});}}>Record replacement</button>
        <button type="button" className="razorface-text" onClick={() => setPanel(null)}>Cancel</button>
      </div>
      {replacing && renderExhaustion(replacing)}
    </div>}
    {panel === 'token' && <div className="razorface-editor">
      <p>What happened when you resolved Razorface’s last Health at the table?</p>
      {state.result !== 'revived' && <PlaySelect value={revive} aria-label="Revival Health" onChange={event => setRevive(event.target.value)}>
        <option value="">Health shown on the revealed token</option>
        {[1,2,3].map(n => <option key={n} value={n}>{n} Health</option>)}
      </PlaySelect>}
      <div className="razorface-actions">
        {state.result !== 'revived' && <button type="button" className="razorface-primary" disabled={disabled || !revive} onClick={() => save({kind:'token',result:'revived',health:Number(revive)})}>Record revival</button>}
        <button type="button" className="razorface-primary" disabled={disabled} onClick={() => save({kind:'token',result:'defeated'})}>Record defeat</button>
      </div>
    </div>}
    {message && <p role="alert" className="razorface-effect">{message}</p>}
    <MinorPowerGroup>{minorCards}</MinorPowerGroup>
    <KillerCards killer={RAZORFACE} events={events} onEvent={onEvent} disabled={disabled} />
  </section>;
}
