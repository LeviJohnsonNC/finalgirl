import { useState, type ReactNode } from 'react';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import {
  FALCONWOOD_EFFECTS, FALCONWOOD_LEADS, FALCONWOOD_MISSIONS, FALCONWOOD_MODULE, FALCONWOOD_PEOPLE,
  falconwoodDestination, falconwoodParent, falconwoodProgress, falconwoodState, initialFalconwood,
  missionById, missionByName, resolveFalconwoodAction, type FalconwoodAction,
} from '../../../supabase/functions/_shared/play/falconwood';
import type { ControlsProps } from './moduleDefinitions';
import { SpecialRulesModal } from '@/components/SpecialRulesModal';
import { CharacterControl } from './CharacterControl';
import { EventControl } from './EventControl';
import { IllustratedTile } from './IllustratedTile';
import { ModuleArtwork } from './ModuleArtwork';
import { PlaySelect } from './PlaySelect';
import { useModuleRecord } from './useModuleRecord';
import { falconwoodArt } from './falconwoodArt';
import '@/styles/play-falconwood.css';

const outcomes = [
  {value:'in-play', label:'In play'}, {value:'saved', label:'Saved'},
  {value:'killed', label:'Killed'}, {value:'left', label:'Left play'},
];
const toArt = (name: string) => name.toLowerCase().replace(/ /g, '-');
const peopleArt = (id: string, status?: string) =>
  falconwoodArt(status === 'saved' || status === 'killed' ? `${id}-${status}` : id);
const clueLabels = {A:['East of river','West of river'], B:['North','South'], C:['First A–Z','Last A–Z']} as const;

function Count({label, value, max, onChange}: {label: string; value?: number; max: number; onChange: (value: number) => void}) {
  return <div className="falconwood-count" role="group" aria-label={label}>
    <span>{label}</span>
    <button type="button" aria-label={`Decrease ${label}`} disabled={value === undefined || value <= 0} onClick={() => onChange(value! - 1)}>−</button>
    <output>{value ?? '?'}</output>
    <button type="button" aria-label={`Increase ${label}`} disabled={value === undefined || value >= max} onClick={() => onChange(value! + 1)}>+</button>
    {value === undefined && <PlaySelect aria-label={`Record ${label}`} value="" onChange={event => onChange(Number(event.target.value))}>
      <option value="" disabled>Record…</option>
      {Array.from({length:max + 1}, (_, n) => <option key={n} value={String(n)}>{n}</option>)}
    </PlaySelect>}
  </div>;
}

export function FalconwoodControls({events, onEvent, mission: selected, falconwoodFresh, startingEvent, blocked, killer}: ControlsProps) {
  const entries = summarizePlay(events).entries;
  const fields = moduleState(entries, FALCONWOOD_MODULE);
  const displayed = !events.length && falconwoodFresh ? initialFalconwood(selected, startingEvent) ?? fields : fields;
  const state = falconwoodState(displayed);
  const mission = missionById(state.mission) ?? missionByName(selected);
  const {record, message} = useModuleRecord(events, onEvent);
  const [roll, setRoll] = useState('');
  const [showEvents, setShowEvents] = useState(false);
  const [nextLead, setNextLead] = useState('');
  const send = (command: FalconwoodAction['command'], value?: FalconwoodAction['value'], key?: string) => {
    if (blocked) return false;
    const action: FalconwoodAction = {parent:falconwoodParent(entries), mission:mission?.id, command, key, value};
    const result = resolveFalconwoodAction(action, displayed, entries);
    return !!result && record(newPlayEvent({kind:'module', falconwoodAction:action, moduleData:{module:FALCONWOOD_MODULE,changes:result}}));
  };
  const destination = falconwoodDestination(state.clues);
  const total = state.tokens?.reduce((sum, value) => sum + value, 0);
  const targetMet = state.count !== undefined && state.target !== undefined && state.count >= state.target;
  const ready = mission?.id === 'friend' ? state.friend === 'prone' : mission?.id === 'hunt' ? state.started && state.count === 0
    : mission?.id === 'code' ? total !== undefined && !!roll && total + Number(roll) >= 20 : targetMet;
  const hasItem = mission && 'item' in mission;
  const renderPerson = (name: string, id: string, status: string | undefined, change: (value: string) => void) =>
    <CharacterControl name={name} value={status} states={outcomes} present="in-play" art={peopleArt(id, status)}
      showStatusEditor={false} showRules={false} outcomes={['saved','killed','left']} allowOutcomeCorrections
      onChange={value => {if (value) change(value);}} />;
  const chooseMission = (name: string) => {
    const id = missionById(name)?.id;
    if (!id || blocked) return;
    const action: FalconwoodAction = {parent:falconwoodParent(entries), mission:id, command:'mission', value:id};
    const result = resolveFalconwoodAction(action, displayed, entries);
    if (result) record(newPlayEvent({kind:'module', falconwoodAction:action, moduleData:{module:FALCONWOOD_MODULE,changes:result}}));
  };
  const action = (label: string, onClick: () => void, disabled = false) =>
    <button type="button" className="falconwood-action" onClick={onClick} disabled={disabled}>{label}</button>;
  const field = (label: string, control: ReactNode) => <label className="falconwood-field"><span>{label}</span>{control}</label>;
  return <section className="play-falconwood" aria-label="Falconwood tracking">
    <fieldset disabled={blocked} className="falconwood-fieldset">
      <article className="falconwood-mission">
        <div className="falconwood-hero">
          <ModuleArtwork art={falconwoodArt(mission?.id === 'hunt' ? state.complete ? 'hunt-cleared' : state.started ? 'hunt-active' : 'hunt' : mission?.id ?? 'header')} />
          <div className="falconwood-title"><small>Mission</small><h3>{mission?.name ?? 'Mission unrecorded'}</h3></div>
        </div>
        <div className="falconwood-mission-body">
          {mission ? <>
            <div className="falconwood-events-heading">
              <strong className="falconwood-progress">{falconwoodProgress({...state, mission:mission.id})}</strong>
              <SpecialRulesModal killer="" location="Falconwood"><button type="button" className="falconwood-quiet">Location rules</button></SpecialRulesModal>
            </div>
            {!state.complete && killer !== 'Poltergeist' && <small className="falconwood-note">Final Health protected until completion · last Killer only</small>}
            {!state.complete && (mission.id === 'father' || mission.id === 'lab') && <>
              <Count label={mission.id === 'father' ? 'Banked keys' : 'Evidence recovered'} value={state.count}
                max={mission.id === 'father' ? 6 : 4} onChange={value => send('count', value)}/>
              <details className="falconwood-quiet"><summary>Adjust requirement</summary>
                {field('Required', <PlaySelect aria-label="Mission requirement" value={String(state.target ?? '')} onChange={event => send('target', Number(event.target.value))}>
                  <option value="" disabled>Unrecorded</option>
                  {Array.from({length:mission.id === 'father' ? 6 : 4}, (_, i) => <option key={i} value={String(i+1)}>{i+1}</option>)}
                </PlaySelect>)}
              </details>
              {mission.id === 'lab' && <>
                {field('Revealed lead', <PlaySelect aria-label="Revealed lead" value={String(state.lead ?? '')} onChange={event => send('lead', event.target.value ? Number(event.target.value) : null)}>
                  <option value="">No lead recorded</option>
                  {FALCONWOOD_LEADS.map((name, i) => <option key={name} value={String(i+1)}>{i+1} · {name}</option>)}
                </PlaySelect>)}
                {state.lead !== undefined && state.count !== undefined && state.count < 4 && <div className="falconwood-row">
                  <PlaySelect aria-label="Next revealed lead" value={nextLead} onChange={event => setNextLead(event.target.value)}>
                    <option value="">Next lead unrecorded</option>
                    {FALCONWOOD_LEADS.filter(name => name !== FALCONWOOD_LEADS[state.lead! - 1]).map(name => <option key={name} value={String(FALCONWOOD_LEADS.indexOf(name)+1)}>{name}</option>)}
                  </PlaySelect>
                  {action('Record evidence recovered', () => { if (send('recover', nextLead ? Number(nextLead) : null)) setNextLead(''); })}
                </div>}
              </>}
            </>}
            {!state.complete && mission.id === 'code' && <>
              <div className="falconwood-chips" role="group" aria-label="Recorded code tokens">
                {[1,2,3,4,5,6].map(value => <button key={value} type="button" aria-label={`Code token ${value}`} aria-pressed={state.tokens?.includes(value) ?? false} onClick={() => send('token', value)}>{value}</button>)}
              </div>
              {total !== undefined && <>
                <span>Shopping Mall · Roll {Math.max(1, 20-total)} or higher</span>
                {field('Physical d20 result', <PlaySelect aria-label="Physical d20 result" value={roll} onChange={event => setRoll(event.target.value)}>
                  <option value="">Record roll…</option>
                  {Array.from({length:20}, (_, i) => <option key={i} value={String(i+1)}>{i+1}</option>)}
                </PlaySelect>)}
              </>}
            </>}
            {!state.complete && mission.id === 'friend' && <>
              <div className="falconwood-clues">
                {(['A','B','C'] as const).map(letter => <div key={letter} className="falconwood-clue" role="group" aria-label={`Clue ${letter}`}>
                  <b>{letter}</b>
                  {([1,2] as const).map(value => <button key={value} type="button"
                    aria-label={`${letter}${value} · ${clueLabels[letter][value-1]}`}
                    aria-pressed={state.clues?.[letter] === value}
                    disabled={state.clues?.[letter] !== undefined && state.clues[letter] !== value}
                    onClick={() => send('clue', state.clues?.[letter] === value ? null : value, letter)}>
                    {clueLabels[letter][value-1]}
                  </button>)}
                </div>)}
              </div>
              {destination && !state.friend && action(`Record Friend found · ${destination}`, () => send('found'))}
            </>}
            {!state.complete && mission.id === 'hunt' && <>
              {!state.started ? <div className="falconwood-row">
                {action('Start hunt', () => send('start', state.reduced ? 3 : 4))}
                <button type="button" aria-pressed={state.reduced ?? false} onClick={() => send('reduced', !state.reduced)}>Start with three</button>
              </div> : <Count label="Agents remaining" value={state.count} max={4} onChange={value => send('count', value)}/>}
              <button type="button" className="falconwood-quiet" aria-pressed={state.attack3 ?? false} onClick={() => send('attack', !state.attack3)}>
                {state.attack3 ? 'Agents attack at 3' : 'Record Attack 3'}
              </button>
            </>}
            {!state.complete && ready && action(mission.completion, () => send('complete', mission.id === 'code' ? Number(roll) : undefined))}
            <details className="falconwood-quiet"><summary>{state.complete ? 'Correct completion' : 'Already completed on the board?'}</summary>
              {state.complete ? action('Mark mission incomplete', () => send('correct-completion', false))
                : action('Confirm mission completed', () => send('attest'))}
            </details>
          </> : <>
            {state.complete && <strong>Mission complete · Identity unrecorded</strong>}
            {field('Record physical mission', <PlaySelect aria-label="Record physical mission" value="" onChange={event => chooseMission(event.target.value)}>
              <option value="" disabled>Select mission…</option>
              {FALCONWOOD_MISSIONS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </PlaySelect>)}
          </>}
        </div>
      </article>
      {mission && (state.friend || state.complete || state.uses !== undefined) && <div className="falconwood-grid">
        {state.friend === 'prone' ? <IllustratedTile className="module-control-tile" art={falconwoodArt('friend-prone')} title={mission.friend}
          status={state.proneAt ? `Found prone · ${state.proneAt}` : 'Found prone'} disabled />
          : renderPerson(mission.friend, `${mission.id}-person`, state.friend, value => send('friend', value))}
        {hasItem && (state.complete || state.uses !== undefined) && <IllustratedTile className="module-control-tile" art={falconwoodArt(toArt(mission.item))} title={mission.item}
          status={state.uses === undefined ? 'Record item' : state.uses === 0 ? 'Spent · Click to correct' : `Uses remaining · ${state.uses}`}
          onClick={() => send('uses', state.uses ? state.uses - 1 : mission.id === 'hunt' ? 2 : 1)} />}
      </div>}
      <div className="falconwood-events-heading">
        <h4>Events</h4>
        <button type="button" aria-expanded={showEvents} className="falconwood-quiet" onClick={() => setShowEvents(!showEvents)}>{showEvents ? 'Hide options' : 'Record Event'}</button>
      </div>
      <div className="falconwood-grid">
        {FALCONWOOD_EFFECTS.filter(([key]) => showEvents || state.effects[key] !== undefined).map(([key, name]) =>
          <EventControl key={key} name={name} value={state.effects[key] === undefined ? undefined : state.effects[key] ? 'active' : 'ended'}
            art={falconwoodArt(state.effects[key] === false && (key === 'dry' || key === 'van') ? `${key}-off` : key)}
            interaction="toggle" onActivate={() => send('effect', true, key)} onEnd={() => send('effect', false, key)} onClear={() => send('effect', false, key)} />)}
        {FALCONWOOD_PEOPLE.filter(name => showEvents || state.people[name]).map(name =>
          <div key={name}>{renderPerson(name, toArt(name), state.people[name], value => send('person', value, name))}</div>)}
      </div>
    </fieldset>
    {message && <p role="alert">{message}</p>}
  </section>;
}
