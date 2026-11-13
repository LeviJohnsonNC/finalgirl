import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  initialStation, resolveStationAction, stationParent, stationState, stationSummary,
  STATION_MODULE, STATION_POSITIONS, STATION_ROLES, STATION_ROUTE,
  type StationAction, type StationCommand, type StationState,
} from '../../../supabase/functions/_shared/play/station';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { ModuleArtwork } from './ModuleArtwork';
import type { ControlsProps } from './moduleDefinitions';
import { useModuleRecord } from './useModuleRecord';
import { StationAllies } from './StationAllies';
import { StationCrew } from './StationCrew';
import { StationEnvironment } from './StationEnvironment';
import { stationArt } from './stationArt';
import '@/styles/play-station.css';

type Flight = NonNullable<StationState['flight']>;
type Role = typeof STATION_ROLES[number]['id'];

const routeLabels = {...STATION_POSITIONS, station:'Departure'};

function PassengerControls({state, count, roles, onCount, onRoles}: {
  state: StationState;
  count: Flight['count'];
  roles: Role[];
  onCount: (count: Flight['count']) => void;
  onRoles: (roles: Role[]) => void;
}) {
  return <>
    <label className="station-passenger-count">
      <span>Total passengers</span>
      <span className="station-passenger-field">
        <select value={count??''} onChange={e=>onCount(e.target.value===''?null:Number(e.target.value))}>
          <option value="">Unrecorded</option>
          {[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </span>
    </label>
    {STATION_ROLES.filter(role=>state.roles?.[role.id]==='present').map(role=>
      <label className="station-check" key={role.id}><input type="checkbox" checked={roles.includes(role.id)}
        onChange={e=>onRoles(e.target.checked?[...roles,role.id]:roles.filter(id=>id!==role.id))}/> {role.name} aboard</label>)}
  </>;
}

function FlightCorrection({state, submit}: {state: StationState; submit: (command: StationCommand)=>boolean}) {
  const [position,setPosition]=useState<Flight['position']>(state.flight?.position??'helipad');
  const [count,setCount]=useState<Flight['count']>(state.flight?.count??null);
  const [roles,setRoles]=useState<Role[]>(state.flight?.roles??[]);
  const [pending,setPending]=useState(!!state.flight?.pending);
  const hasPassengers=position!=='helipad'&&(position!=='airport'||pending);
  const selectedRoles=hasPassengers?roles.filter(id=>state.roles?.[id]==='present'):[];
  return <div className="station-edit">
    <label>Position<select value={position} onChange={e=>{setPosition(e.target.value as Flight['position']);setPending(false);}}>
      {STATION_ROUTE.map(id=><option key={id} value={id}>{STATION_POSITIONS[id]}</option>)}
    </select></label>
    {position==='airport'&&<label className="station-check"><input type="checkbox" checked={pending} onChange={e=>setPending(e.target.checked)}/> Rescue effects pending</label>}
    {hasPassengers&&<PassengerControls state={state} count={count} roles={selectedRoles} onCount={setCount} onRoles={setRoles}/>}
    <div className="station-actions">
      <button type="button" disabled={selectedRoles.length>(count??3)||pending&&count===0} onClick={()=>submit({
        kind:'flight-correction',flight:{position,count:hasPassengers?count:0,roles:selectedRoles,pending,
          direction:position===state.flight?.position?state.flight.direction:undefined},
      })}>Record position</button>
      {state.flight&&<button type="button" onClick={()=>submit({kind:'flight-correction',flight:null})}>Clear flight observation</button>}
    </div>
  </div>;
}

export function StationControls({events,onEvent,blocked,stationFresh,startingEvent}: ControlsProps) {
  const entries = summarizePlay(events).entries;
  const state = stationState(!events.length && stationFresh ? initialStation(startingEvent) : moduleState(entries,STATION_MODULE));
  const parent = stationParent(entries);
  const [passengerCount,setPassengerCount] = useState<Flight['count']>(0);
  const [passengers,setPassengers] = useState<Role[]>([]);
  const [arrivalParent,setArrivalParent] = useState<string>();
  const {record,message} = useModuleRecord(events,onEvent);
  const commit = (command: StationCommand) => {
    const stationAction: StationAction = {...command,parent};
    const changes = resolveStationAction(stationAction,{snapshot:JSON.stringify(state)},entries);
    return !blocked && !!changes && record(newPlayEvent({kind:'module',stationAction,moduleData:{module:STATION_MODULE,changes}}));
  };
  const f = state.flight;
  const selectedPassengers = passengers.filter(id=>state.roles?.[id]==='present');
  const currentIndex = f ? STATION_ROUTE.indexOf(f.position) : -1;
  const arrivalOpen = f?.position==='air' && f.count!==0 && arrivalParent===parent;
  const canMoveTo = (index:number) => {
    if(!f || f.pending) return false;
    if(f.position==='helipad') return index===1 && selectedPassengers.length<=(passengerCount??3);
    return index===currentIndex+1 || (index===currentIndex-1 && f.count===0);
  };
  const arrive = (arrival:'action'|'later') => {
    if(commit({kind:'move',direction:'outbound',arrival})) setArrivalParent(undefined);
  };
  const moveTo = (position:Flight['position'],index:number) => {
    if(f?.position==='helipad') {
      if(commit({kind:'depart',count:passengerCount,roles:selectedPassengers})) {
        setPassengers([]);
        setPassengerCount(0);
      }
    } else if(position==='helipad') {
      commit({kind:'land'});
    } else if(position==='airport' && f?.count!==0) {
      setArrivalParent(arrivalOpen?undefined:parent);
    } else {
      commit({kind:'move',direction:index>currentIndex?'outbound':'return'});
    }
  };
  return <fieldset disabled={blocked} className="station-controls" aria-label="Station 2891 tracking">
    <section aria-label="Helicopter rescue" className="station-rescue">
      <div className="station-hero">
        <ModuleArtwork art={f ? stationArt[f.position] : stationArt.banner}/>
        <div className="station-hero-caption"><h3>Helicopter</h3><p>{stationSummary(state)}</p></div>
      </div>
      <ol className="station-route" aria-label="Flight route">
        {STATION_ROUTE.map((id,index)=><li key={id}>
          <button type="button" aria-current={f?.position===id?'step':undefined} disabled={!canMoveTo(index)}
            aria-expanded={id==='airport'&&f?.position==='air'&&f.count!==0?arrivalOpen:undefined}
            onClick={()=>moveTo(id,index)}>{routeLabels[id]}</button>
        </li>)}
      </ol>
      {!!f?.roles.length && <p className="station-passengers">{STATION_ROLES.filter(role=>f.roles.includes(role.id)).map(role=>role.name).join(', ')} aboard</p>}
      {f?.position==='helipad'&&<div className="station-edit">
        <PassengerControls state={state} count={passengerCount} roles={selectedPassengers} onCount={setPassengerCount} onRoles={roles=>{
          setPassengers(roles);
          if(passengerCount!==null&&roles.length>passengerCount) setPassengerCount(roles.length);
        }}/>
        {selectedPassengers.length>(passengerCount??3)&&<small>Include each named passenger in the total.</small>}
      </div>}
      {arrivalOpen&&<div className="station-actions" role="group" aria-label="Airport arrival timing">
        <button type="button" onClick={()=>arrive('action')}>Arrive during Action</button>
        <button type="button" onClick={()=>arrive('later')}>Arrive outside Action</button>
      </div>}
      {f?.pending && <div className="station-actions">
        <button type="button" onClick={()=>commit({kind:'confirm-rescue'})}>Apply rescue effects</button>
        <small>Start of next Action phase · {f.count === null ? 'Passenger count unrecorded' : `${f.count}/3 aboard`}</small>
      </div>}
      <details className="module-correction"><summary>Correct helicopter record</summary>
        <FlightCorrection key={JSON.stringify(f)} state={state} submit={commit}/>
        {f && f.count === 0 && f.position !== 'helipad' && <button type="button" onClick={()=>commit({kind:'help'})}>Record rescue Event relocation</button>}
      </details>
    </section>
    <StationEnvironment state={state} commit={commit}/>
    <StationCrew state={state} commit={commit}/>
    <StationAllies state={state} commit={commit}/>
    {message && <p role="alert">{message}</p>}
  </fieldset>;
}
