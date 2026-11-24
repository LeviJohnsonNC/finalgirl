import { useState } from 'react';
import { ArrowDown, Check, ChevronDown, Link2, Plus, Unlink2 } from 'lucide-react';
import {
  AFFLICTIONS, RAZORFACE, RAZORFACE_MINORS, RAZORFACE_MODULE, affliction, razorfaceAvailable, razorfaceEntry,
  razorfaceLatest, razorfaceState, raisesHorrorOnPurge, type AfflictionId, type RazorfaceCommand,
} from '../../../supabase/functions/_shared/play/razorface';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { KillerCards } from './KillerCards';
import { MinorPowerControl } from './MinorPowerControl';
import { MinorPowerGroup } from './MinorPowerGroup';
import { ModuleArtwork } from './ModuleArtwork';
import type { ControlsProps } from './moduleDefinitions';
import { PlaySelect } from './PlaySelect';
import { razorfaceArt } from './razorfaceArt';
import { useModuleRecord } from './useModuleRecord';
import '@/styles/play-razorface.css';

type Panel = 'setup' | 'correct' | 'draw' | 'replace' | 'token';
type Card = typeof AFFLICTIONS[number];
const lifeDrainName = 'Life Drain';

export function RazorfaceControls({events, onEvent, blocked = false, razorfaceFresh = false}: ControlsProps) {
  const summary = summarizePlay(events);
  const state = razorfaceState(summary.entries);
  const latest = razorfaceLatest(summary.entries);
  const lastAction = latest && razorfaceEntry(latest);
  const {record, message} = useModuleRecord(events, onEvent);
  const [open, setOpen] = useState<AfflictionId | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [selection, setSelection] = useState<AfflictionId[]>([]);
  const [newTurn, setNewTurn] = useState(false);
  const [health, setHealth] = useState({girl:'', killer:'', horror:''});
  const [replacement, setReplacement] = useState<AfflictionId | ''>('');
  const [reason, setReason] = useState<'impossible' | 'exchange'>('impossible');
  const [revive, setRevive] = useState('');
  const [requiredDrawFailed, setRequiredDrawFailed] = useState(false);
  const lifeDrain = summary.entries.some(e => e.momentType === 'dark-power' && e.killerCard === lifeDrainName);
  const active = AFFLICTIONS.filter(card => state.active?.includes(card.id));
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
    setReplacement('');
    setRequiredDrawFailed(false);
    setReason('impossible');
    setRevive('');
    setPanel(next);
  };
  const openCard = (id: AfflictionId) => {
    setOpen(open === id ? null : id);
    setPanel(null);
    setNewTurn(false);
    setHealth({girl:'',killer:'',horror:''});
  };
  const save = (command: RazorfaceCommand) => {
    if (disabled || command.kind === 'purge' && [command.girlHealth, command.killerHealth].some(
      value => value !== undefined && (!Number.isInteger(value) || value < 0 || value > 99),
    )) return;
    const action = {...command, parent:latest?.id ?? 'root'};
    if (record(newPlayEvent({kind:'module',moduleData:{module:RAZORFACE_MODULE,changes:{action:JSON.stringify(action)}}}))) {
      setPanel(null);
      setOpen(null);
      setNewTurn(false);
      setHealth({girl:'',killer:'',horror:''});
      setRequiredDrawFailed(false);
    }
  };
  const available = AFFLICTIONS.filter(card => razorfaceAvailable(state, card.id));

  const renderedCard = (card: Card) => {
    const expanded = card.id === open;
    const showGirlHealth = lifeDrain || card.id === 'the-gift-of-pain';
    const showKillerHealth = lifeDrain || card.id === 'experience-unbound';
    const showHorror = raisesHorrorOnPurge(card.id);
    const inputsValid = [health.girl, health.killer].every(value => value === '' || /^\d{1,2}$/.test(value)) &&
      (health.horror === '' || /^[0-7]$/.test(health.horror));
    return <article className="razorface-card" data-expanded={expanded} data-affliction={card.id} key={card.id}>
      <button type="button" className="razorface-card-trigger" aria-expanded={expanded} onClick={() => openCard(card.id)}>
        <span className="razorface-art-frame"><ModuleArtwork art={razorfaceArt(card.id)} /></span>
        <span className="razorface-card-label"><strong>{card.name}</strong><ChevronDown size={17} aria-hidden /></span>
        <span className="razorface-card-requirement">{card.requirement}</span>
      </button>
      {expanded && <div className="razorface-card-details">
        <div className="razorface-requirement-effect">
          <ArrowDown size={16} aria-hidden />
          <div><strong>Purge effect</strong><p>{card.effect}</p></div>
        </div>
        {lifeDrain && <p className="razorface-effect">Life Drain · You lose 1 Health and Razorface recovers 1.</p>}
        {state.minors.length > 0 && <p className="razorface-effect">This purge discards {state.minors.length === 1 ? 'the active Minor Dark Power' : 'both active Minor Dark Powers'}.</p>}
        {(showGirlHealth || showKillerHealth || showHorror) && <details className="module-correction">
          <summary>{showHorror ? showGirlHealth || showKillerHealth ? 'Record trackers after effects' : 'Record Horror after effects' : 'Record Health after effects'}</summary>
          <div className="razorface-health-fields">
            {showGirlHealth && <label>Final Girl Health
              <input type="number" min={0} max={99} step={1} value={health.girl} onChange={event => setHealth({...health, girl:event.target.value})} />
            </label>}
            {showHorror && <label>Horror
              <input type="number" min={0} max={7} step={1} value={health.horror} onChange={event => setHealth({...health,horror:event.target.value})} />
            </label>}
            {showKillerHealth && <label>Killer Health
              <input type="number" min={0} max={99} step={1} value={health.killer} onChange={event => setHealth({...health, killer:event.target.value})} />
            </label>}
          </div>
          <p>Leave a field blank if its tracker is already up to date.</p>
        </details>}
        {state.purged.length > 0
          ? <label className="razorface-check"><input type="checkbox" checked={newTurn} onChange={event => setNewTurn(event.target.checked)} /> This is a new turn since the last purge.</label>
          : <p className="razorface-effect">One purge per turn during the Action phase.</p>}
        <div className="razorface-actions">
          <button type="button" className="razorface-primary" disabled={disabled || !inputsValid || state.purged.length > 0 && !newTurn}
            onClick={() => save({kind:'purge', card:card.id, newTurn,
              ...(showGirlHealth && health.girl !== '' && {girlHealth:Number(health.girl)}),
              ...(showKillerHealth && health.killer !== '' && {killerHealth:Number(health.killer)}),
              ...(showHorror && health.horror !== '' && {horror:Number(health.horror)})})}>Record purge</button>
          <button type="button" className="razorface-text" disabled={disabled} onClick={() => choose('replace')}>Replace Affliction</button>
        </div>
        {panel === 'replace' && <div className="razorface-editor">
          <PlaySelect value={reason} aria-label="Replacement reason"
            onChange={event => setReason(event.target.value === 'exchange' ? 'exchange' : 'impossible')}>
            <option value="impossible">Requirement is impossible</option>
            <option value="exchange">Exchanged by a card effect after a purge</option>
          </PlaySelect>
          <PlaySelect value={replacement} aria-label="Replacement Affliction" disabled={disabled}
            onChange={event => setReplacement(affliction(event.target.value)?.id ?? '')}>
            <option value="">Choose the replacement drawn</option>
            {available.map(choice => <option key={choice.id} value={choice.id}>{choice.name}</option>)}
          </PlaySelect>
          <button type="button" className="razorface-primary" disabled={disabled || !replacement}
            onClick={() => {if(replacement) save({kind:'replace', card:card.id, replacement, reason});}}>Record replacement</button>
          {renderExhaustion(card.id)}
        </div>}
      </div>}
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
        <p>{state.active === undefined ? 'Record the face-up cards from your table.'
          : `${active.length} in play${state.purged.length ? ` · ${state.purged.length} purged` : ''}`}</p>
      </div>
      <p className="razorface-status" aria-live="polite">{canReveal || state.result === 'revived' ? <Unlink2 aria-hidden /> : <Link2 aria-hidden />}{title}</p>
    </header>
    {active.length > 0 && <div className="razorface-grid">{active.map(renderedCard)}</div>}
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
          <ModuleArtwork art={razorfaceArt(card.id)} /><span>{card.name}</span>{selection.includes(card.id) && <Check size={17} aria-hidden />}
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
