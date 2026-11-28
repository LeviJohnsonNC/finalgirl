import { ORGANISM } from '../../../supabase/functions/_shared/play/organism';
import { razorfaceState } from '../../../supabase/functions/_shared/play/razorface';
import { OrganismMinorCards } from './OrganismControls';
import { useId, useState } from 'react';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import {
  freshPesadilla, pesadillaParent, pesadillaPersonEvents, pesadillaRescueSeparately,
  resolvePesadilla, SOLDIER_UPGRADES, type PesadillaCommand,
} from '../../../supabase/functions/_shared/play/pesadilla';
import { PESADILLA_MODULE, PESADILLA_PEOPLE, PESADILLA_REACHES } from '../../../supabase/functions/_shared/play/pesadillaCatalog';
import { CharacterControl } from './CharacterControl';
import { EventControl } from './EventControl';
import { IllustratedTile } from './IllustratedTile';
import { MinorPowerControl } from './MinorPowerControl';
import { MinorPowerGroup } from './MinorPowerGroup';
import { ModuleArtwork } from './ModuleArtwork';
import { MortLocationMinor } from './MortControls';
import { pesadillaArt } from './pesadillaArt';
import { useModuleRecord } from './useModuleRecord';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-pesadilla.css';

const personStates = [
  {value:'present',label:'In play'}, {value:'saved',label:'Saved'},
  {value:'killed',label:'Killed'}, {value:'left',label:'Left play'},
] as const;
const outcomes = ['saved','killed','left'] as const;

export function PesadillaControls(props: ControlsProps) {
  const { killer, events, onEvent, blocked, pesadillaFresh, startingEvent } = props;
  const summary = summarizePlay(events);
  const entries = summary.entries;
  const state = pesadillaFresh && !events.length ? freshPesadilla(killer,startingEvent) : moduleState(entries,PESADILLA_MODULE);
  const { record, message } = useModuleRecord(events,onEvent);
  const [evacuation,setEvacuation] = useState(false);
  const [count,setCount] = useState('');
  const [riverChoice,setRiverChoice] = useState(false);
  const [confirmWeathers,setConfirmWeathers] = useState(false);
  const countId = useId();
  const separateRescues = pesadillaRescueSeparately(killer);
  const write = (command: PesadillaCommand) => {
    if (blocked) return false;
    const changes = resolvePesadilla(command,state);
    if (!changes) return false;
    const saved = command.command === 'evacuate' ? command.count : 0;
    return record(newPlayEvent({
      ...(saved ? {kind:'saved' as const,quantity:saved} : {kind:'module' as const}),
      pesadillaAction:{...command,parent:pesadillaParent(entries)},
      moduleData:{module:PESADILLA_MODULE,changes},
    }));
  };
  const evacuate = (quantity: number) => {
    if (!write({command:'evacuate',count:quantity})) return;
    setEvacuation(false);
    setCount('');
  };
  const hueyStatus = state.huey === undefined ? 'Exit status unrecorded'
    : state.huey ? state.choppa ? 'Clearing is an Exit · Choppa rewards active' : 'Clearing is an Exit'
    : 'Away · Clearing is closed as an Exit';
  const friendly = state['upgrade.friendly'];
  const patrol = state.twitchy ? 'patrol-twitchy' : friendly ? 'patrol-trained' : 'patrol';
  const river = PESADILLA_REACHES.find(reach => reach === state.piranhas);
  const piranhasActive = !!river || state.piranhas === 'unrecorded';
  const horrorOverflow = summary.finalHorrorLevel === undefined || summary.finalHorrorLevel > 5;
  const canPeople = pesadillaPersonEvents(killer);
  const carolynJoined = entries.some(e => e.poltergeistAction?.command === 'join');
  const afflictions = killer === 'Razorface' ? razorfaceState(entries).active : undefined;
  const minorBlocked = killer === 'Poltergeist' && carolynJoined || afflictions?.length === 0;
  const people = Object.entries(PESADILLA_PEOPLE) as [keyof typeof PESADILLA_PEOPLE,string][];
  // A recorded person remains accessible after leaving or resolving an outcome.
  const personCard = ([id,name]: [keyof typeof PESADILLA_PEOPLE,string]) => {
    const value = personStates.find(option => option.value === state['person.' + id])?.value;
    const art = pesadillaArt(value === 'saved' || value === 'killed' ? id + '-' + value : id);
    return <CharacterControl key={id} name={name} value={value} states={personStates} present="present"
      art={art} outcomes={outcomes} showRules={false} showStatusEditor={false} allowOutcomeCorrections
      onChange={next => next === 'present' && write({command:'person',id,status:next,resolve:false})}
      onOutcome={next => {
        const status = outcomes.find(option => option === next);
        if (!status || blocked) return;
        if (id === 'weathers' && status === 'killed' && value === 'present') setConfirmWeathers(true);
        else write({command:'person',id,status,resolve:value === 'present'});
      }} />;
  };
  const effect = (id: 'rain' | 'idol' | 'temple' | 'cave', name: string) => {
    const current = state[id];
    if (id !== 'rain') {
      const art = pesadillaArt(id === 'cave' ? current ? 'cave-fallen' : 'cave-intact' : id === 'idol' ? 'idol' : current ? 'temple-active' : 'temple-clear');
      const status = current === undefined ? 'Unrecorded' : id === 'cave'
        ? current ? 'Collapsed · Exit closed' : 'Exit open'
        : id === 'idol' ? current ? 'Faceup · Search unavailable' : 'Search unaffected' : current ? 'Curse active' : 'No curse in play';
      return <article key={id} data-module-control="event">
        <IllustratedTile className="module-control-tile" title={name} art={art} status={status} aria-pressed={current === true}
          disabled={blocked} onClick={()=>write({command:'effect',id,active:current !== true})} />
      </article>;
    }
    return <EventControl key={id} name={name} art={pesadillaArt(id)} interaction="toggle" allowed={!blocked}
      value={current === undefined ? undefined : current ? 'active' : 'ended'}
      onActivate={()=>write({command:'effect',id,active:true})}
      onEnd={()=>write({command:'effect',id,active:false})} onClear={()=>{}} />;
  };
  return <div className="pesadilla-play">
    <section aria-label="Huey">
      <IllustratedTile className="module-control-tile pesadilla-hero" title="The Huey" art={pesadillaArt(state.huey === false ? 'huey-away' : state.huey === undefined ? 'header' : 'huey-grounded')}
        status={hueyStatus} aria-expanded={evacuation}
        onClick={()=>setEvacuation(!evacuation)} />
      {evacuation && <form className="pesadilla-actions" onSubmit={event=>{
        event.preventDefault();
        if (Number.isInteger(Number(count)) && Number(count) >= 1 && Number(count) <= 50 && !separateRescues) evacuate(Number(count));
      }}>
        {state.huey !== false && <>
          {!separateRescues && <>
            <label htmlFor={countId}>Victims newly saved</label>
            <input id={countId} inputMode="numeric" type="number" min="1" max="50" step="1" required
              value={count} onChange={event=>setCount(event.currentTarget.value)} />
            <button disabled={blocked} type="submit">Record evacuation</button>
          </>}
          {separateRescues && <p>Record rescues with your usual rescue controls, then record departure.</p>}
          <button type="button" disabled={blocked} onClick={()=>evacuate(0)}>Record departure only</button>
        </>}
        {state.huey !== true && <button type="button" disabled={blocked}
          onClick={()=>{if (write({command:'huey',grounded:true})) setEvacuation(false);}}>Record Huey in the Clearing</button>}
        {!state.choppa && <button type="button" disabled={blocked}
          onClick={()=>{if (write({command:'choppa'})) setEvacuation(false);}}>Get to the Choppa!</button>}
        <button type="button" onClick={()=>setEvacuation(false)}>Cancel</button>
      </form>}
      <p className="pesadilla-exits">Northwest Exit · {state.cave === true ? 'Cave Exit closed' : state.cave === false ? 'Cave Exit open' : 'Cave Exit unrecorded'}</p>
    </section>
    <section aria-label="Soldiers">
      <div className="pesadilla-patrol">
        <ModuleArtwork art={pesadillaArt(patrol)} />
        <div className="play-tile-caption">
          <strong>Soldiers</strong>
          <small className="play-tile-state">{state.twitchy ? 'Twitchy Soldiers · Friendly fire 1–3' :
            friendly === true ? 'No friendly fire' : friendly === false ? 'Friendly fire 1–2' : 'Training unrecorded'}</small>
        </div>
      </div>
      <div className="pesadilla-upgrades" aria-label="Soldier upgrades">
        {(Object.entries(SOLDIER_UPGRADES) as [keyof typeof SOLDIER_UPGRADES,string][]).map(([id,name])=>{
          const current = state['upgrade.' + id];
          const label = current === undefined ? 'Unrecorded' : current ? 'Unlocked' : 'Locked';
          const ability = current === undefined ? '' : id === 'saving' ? current ? 'Free rescue' : '2 Time per Soldier'
            : id === 'range' ? current ? 'Range 0–1' : 'Range 0'
            : id === 'damage' ? current ? 'Round up' : 'Round down' : '';
          if (current === undefined) return <details className="pesadilla-upgrade-unknown" key={id}>
            <summary><strong>{name}</strong><small>{label}</small></summary>
            <button type="button" disabled={blocked}
              onClick={()=>write({command:'upgrade',id,unlocked:true})}>Record unlocked</button>
            <button type="button" disabled={blocked}
              onClick={()=>write({command:'upgrade',id,unlocked:false})}>Record locked</button>
          </details>;
          return <button key={id} type="button" disabled={blocked} aria-pressed={current === true}
            onClick={()=>write({command:'upgrade',id,unlocked:current !== true})}>
            <strong>{name}</strong><small>{label}{ability && ' · ' + ability}</small>
          </button>;
        })}
      </div>
      {!state.twitchy && <details className="pesadilla-extra" data-module-control="event">
        <summary>Soldier Event</summary>
        <IllustratedTile className="module-control-tile" art={pesadillaArt('patrol-twitchy')} title="Twitchy Soldiers" status="Record Event"
          disabled={blocked} onClick={()=>write({command:'effect',id:'twitchy',active:true})} />
      </details>}
    </section>
    <div className="pesadilla-grid" aria-label="Recorded jungle conditions">
      {(piranhasActive || riverChoice) && <article data-module-control="event">
        <IllustratedTile className="module-control-tile" art={pesadillaArt(river === 'Upper River' ? 'piranhas-upper' : river === 'Central River' ? 'piranhas-central' : 'river')}
          title="Piranhas!" status={river ?? 'River reach unrecorded'} aria-expanded={riverChoice} onClick={()=>setRiverChoice(!riverChoice)} />
        {riverChoice && <div className="pesadilla-actions" aria-label="Choose piranha reach">
          {PESADILLA_REACHES.map(reach=><button key={reach} type="button" disabled={blocked} onClick={()=>{
            if (write({command:'piranhas',reach})) setRiverChoice(false);
          }}>{reach}</button>)}
          {state.piranhas !== 'unrecorded' && <button type="button" disabled={blocked}
            onClick={()=>{if (write({command:'piranhas',reach:'unrecorded'})) setRiverChoice(false);}}>Active · Reach unrecorded</button>}
          {piranhasActive && <button type="button" disabled={blocked}
            onClick={()=>{if (write({command:'piranhas',reach:'absent'})) setRiverChoice(false);}}>Clear placement</button>}
          <button type="button" onClick={()=>setRiverChoice(false)}>Cancel</button>
        </div>}
      </article>}
      {state.cave === true && effect('cave','Cave')}
      {state.rain === true && effect('rain','Heavy Rains')}
      {state.temple === true && effect('temple','Cursed Temple')}
      {state.idol === true && effect('idol','Cursed Idol')}
      {canPeople && people.filter(([id]) => state['person.' + id] !== undefined).map(personCard)}
    </div>
    {confirmWeathers && <div className="pesadilla-actions" role="group" aria-label="Confirm Sgt. Weathers outcome">
      <p>{horrorOverflow ? 'Resolve two Horror increases on the table and record the resulting trackers.' :
        `Horror ${summary.finalHorrorLevel} → ${summary.finalHorrorLevel! + 2}`}</p>
      <button type="button" disabled={blocked} onClick={()=>{
        if (write({command:'person',id:'weathers',status:'killed',resolve:true})) setConfirmWeathers(false);
      }}>Confirm Sgt. Weathers killed</button>
      <button type="button" onClick={()=>setConfirmWeathers(false)}>Cancel</button>
    </div>}
    <details className="pesadilla-extra">
      <summary>Events, people and landmarks</summary>
      <div className="pesadilla-grid">
        {!piranhasActive && !riverChoice && <article data-module-control="event">
          <IllustratedTile className="module-control-tile" art={pesadillaArt('river')} title="Piranhas!" status="Choose river reach"
            aria-expanded={false} onClick={()=>setRiverChoice(true)}/>
        </article>}
        {state.cave !== true && effect('cave','Cave')}
        {state.rain !== true && effect('rain','Heavy Rains')}
        {state.temple !== true && effect('temple','Cursed Temple')}
        {state.idol !== true && effect('idol','Cursed Idol')}
        {canPeople && people.filter(([id]) => state['person.' + id] === undefined).map(personCard)}
      </div>
    </details>
    {killer === ORGANISM && <OrganismMinorCards {...props} river />}
    {killer !== 'Birds' && killer !== ORGANISM && <MinorPowerGroup>
      <MortLocationMinor {...props} name="Rivermaster" locationMinorArt={pesadillaArt('rivermaster')}>
        {killer === 'Poltergeist' ? <MinorPowerControl mode="presence" active={state.minor === 2 && !carolynJoined}
          name="Rivermaster" art={pesadillaArt('rivermaster')} disabled={blocked || minorBlocked}
          onChange={active=>write({command:'minor',health:active ? 2 : 0})} />
        : <MinorPowerControl name="Rivermaster" health={typeof state.minor === 'number' ? state.minor : undefined}
          maxHealth={2} art={()=>pesadillaArt('rivermaster')} heroArt={pesadillaArt('rivermaster')} disabled={blocked || minorBlocked}
          previouslyRevealed={entries.some(e=>e.pesadillaAction?.command === 'minor')}
          onChange={health=>write({command:'minor',health})} />}
      </MortLocationMinor>
    </MinorPowerGroup>}
    {message && <p role="alert">{message}</p>}
  </div>;
}
