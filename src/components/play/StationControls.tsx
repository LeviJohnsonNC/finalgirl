import { useRef, useState } from 'react';
import {
  initialStation, resolveStationAction, stationParent, stationState, stationSummary,
  STATION_MODULE, STATION_MOVE_SOURCES, STATION_POSITIONS, STATION_ROLES, STATION_ROUTE,
  type StationAction, type StationCommand, type StationState,
} from '../../../supabase/functions/_shared/play/station';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { ModuleArtwork } from './ModuleArtwork';
import type { ControlsProps } from './moduleDefinitions';
import { useModuleRecord } from './useModuleRecord';
import { StationCrew } from './StationCrew';
import { StationEnvironment } from './StationEnvironment';
import { stationArt } from './stationArt';
import '@/styles/play-station.css';

type Flight = NonNullable<StationState['flight']>;
type Role = typeof STATION_ROLES[number]['id'];

function FlightRecord({state, correction, preselected, submit}: {
  state: StationState;
  correction?: boolean;
  preselected?: Role;
  submit: (command: StationCommand) => boolean;
}) {
  const [position,setPosition] = useState<Flight['position']>(state.flight?.position ?? 'helipad');
  const [passengers,setPassengers] = useState(correction ? String(state.flight?.count ?? '') : preselected ? '1' : '0');
  const [roles,setRoles] = useState<Role[]>(correction ? state.flight?.roles ?? [] : preselected ? [preselected] : []);
  const [pending,setPending] = useState(correction && !!state.flight?.pending);
  const groupAllowed = !correction || position !== 'helipad' && (position !== 'airport' || pending);
  const count = groupAllowed ? passengers === '' ? null : Number(passengers) : 0;
  const selectedRoles = groupAllowed ? roles : [];
  const submitRecord = () => correction
    ? submit({kind:'flight-correction',flight:{position,count,roles:selectedRoles,pending:position === 'airport' && pending}})
    : submit({kind:'depart',count,roles:selectedRoles});

  return <div className="station-edit">
    {correction && <label>Position<select value={position} onChange={e=>{setPosition(e.target.value as Flight['position']);setPending(false);}}>
      {STATION_ROUTE.map(id=><option key={id} value={id}>{STATION_POSITIONS[id]}</option>)}
    </select></label>}
    {correction && position === 'airport' && <label className="station-check"><input type="checkbox" checked={pending} onChange={e=>setPending(e.target.checked)}/> Rescue effects pending</label>}
    {groupAllowed && <>
      <label>Total passengers<select value={passengers} onChange={e=>setPassengers(e.target.value)}>
        <option value="">Unrecorded</option>
        {[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
      </select></label>
      {STATION_ROLES.filter(role=>state.roles?.[role.id] === 'present').map(role=>
        <label className="station-check" key={role.id}><input type="checkbox" checked={roles.includes(role.id)}
          onChange={e=>setRoles(old=>e.target.checked ? [...old,role.id] : old.filter(id=>id!==role.id))}/> {role.name} aboard</label>)}
    </>}
    <div className="station-actions">
      <button type="button" disabled={selectedRoles.length > (count ?? 3) || position === 'airport' && pending && count === 0} onClick={submitRecord}>{correction ? 'Record position' : 'Transfer to Helicopter Card'}</button>
      {correction && state.flight && <button type="button" onClick={()=>submit({kind:'flight-correction',flight:null})}>Clear flight observation</button>}
    </div>
  </div>;
}

export function StationControls({events,onEvent,blocked,stationFresh,startingEvent}: ControlsProps) {
  const entries = summarizePlay(events).entries;
  const state = stationState(!events.length && stationFresh ? initialStation(startingEvent) : moduleState(entries,STATION_MODULE));
  const parent = stationParent(entries);
  const rescueRef = useRef<HTMLElement>(null);
  const [boarding,setBoarding] = useState<{role:Role;parent:string}>();
  const {record,message} = useModuleRecord(events,onEvent);
  const [source,setSource] = useState<typeof STATION_MOVE_SOURCES[number]>('Fly Faster!');
  const commit = (command: StationCommand) => {
    const stationAction: StationAction = {...command,parent};
    const changes = resolveStationAction(stationAction,{snapshot:JSON.stringify(state)},entries);
    return !blocked && !!changes && record(newPlayEvent({kind:'module',stationAction,moduleData:{module:STATION_MODULE,changes}}));
  };
  const f = state.flight;
  const moving = f && f.position !== 'helipad' && !f.pending;
  const selectedSource = source === 'Comms Specialist' && (state.roles?.comms !== 'present' || f?.roles.includes('comms')) ? 'Fly Faster!' : source;
  const outbound = () => commit({kind:'move',direction:'outbound',source:selectedSource,
    ...(f?.position === 'air' && f.count !== 0 && {arrival:'action' as const})});
  return <fieldset disabled={blocked} className="station-controls" aria-label="Station 2891 tracking">
    <section ref={rescueRef} tabIndex={-1} aria-label="Helicopter rescue" className="station-rescue">
      <div className="station-hero">
        <ModuleArtwork art={f ? stationArt[f.position] : stationArt.banner}/>
        <div className="station-hero-caption"><h3>Helicopter</h3><p>{stationSummary(state)}</p></div>
      </div>
      <ol className="station-route" aria-label="Flight route">
        {STATION_ROUTE.map(id=><li key={id} aria-current={f?.position===id?'step':undefined}>{id==='station'?'Departure':STATION_POSITIONS[id]}</li>)}
      </ol>
      {!!f?.roles.length && <p className="station-passengers">{STATION_ROLES.filter(role=>f.roles.includes(role.id)).map(role=>role.name).join(', ')} aboard</p>}
      {f?.position === 'helipad' && <FlightRecord key={`${parent}:${boarding?.role ?? ''}`} state={state}
        preselected={boarding?.parent===parent?boarding.role:undefined} submit={commit}/>}
      {f?.pending && <div className="station-actions">
        <button type="button" onClick={()=>commit({kind:'confirm-rescue'})}>Apply rescue effects</button>
        <small>Start of next Action phase · {f.count === null ? 'Passenger count unrecorded' : `${f.count}/3 aboard`}</small>
      </div>}
      {moving && <div className="station-edit">
        <label>Move from<select value={selectedSource} onChange={e=>setSource(e.target.value as typeof source)}>
          {STATION_MOVE_SOURCES.filter(id=>id!=='Comms Specialist'||state.roles?.comms==='present'&&!f.roles.includes('comms')).map(id=><option key={id}>{id}</option>)}
        </select></label>
        <div className="station-actions">
          {f.position !== 'airport' && <button type="button" onClick={outbound}>{f.position==='air' ? f.count===0?'Arrive at airport':'Arrive during Action' : 'Move into the air'}</button>}
          {f.position === 'air' && f.count !== 0 && selectedSource === 'Terror card' &&
            <button type="button" onClick={()=>commit({kind:'move',direction:'outbound',source:selectedSource,arrival:'later'})}>Arrive outside Action</button>}
          {f.count === 0 && f.position !== 'station' && <button type="button" onClick={()=>commit({kind:'move',direction:'return',source:selectedSource})}>Fly back toward Station</button>}
          {f.count === 0 && f.position === 'station' && <button type="button" onClick={()=>commit({kind:'land'})}>Land at helipad</button>}
        </div>
      </div>}
      <details className="module-correction"><summary>Correct helicopter record</summary>
        <FlightRecord key={parent} state={state} correction submit={commit}/>
        {f && f.count === 0 && f.position !== 'helipad' && <button type="button" onClick={()=>commit({kind:'help'})}>Record rescue Event relocation</button>}
      </details>
    </section>
    <StationEnvironment state={state} commit={commit}/>
    <StationCrew state={state} commit={commit} board={role=>{
      setBoarding({role,parent});
      rescueRef.current?.focus();
    }}/>
    {message && <p role="alert">{message}</p>}
  </fieldset>;
}
