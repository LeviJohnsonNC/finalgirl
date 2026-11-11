import { useState } from 'react';
import {
  STATION_OUTDOORS, STATION_ROLES, STATION_SPACES, STATION_FROST_TARGETS,
  type StationCommand, type StationState,
} from '../../../supabase/functions/_shared/play/station';
import { EventControl } from './EventControl';
import { IllustratedTile } from './IllustratedTile';
import { stationArt } from './stationArt';

type Props = {state:StationState; commit:(action:StationCommand)=>boolean};
const frostLabels = {
  girl:'Final Girl',doctor:'Doctor',chef:'Chef',comms:'Comms Specialist',
  killer:'Killer',enemy:'Tracked Enemy',victim:'Tracked Victim',
};
const frostOptions = {marked:'Frostbite',clear:'Clear'};
const breachLabels = {intact:'Wall intact',open:'Breach recorded',keys:'Opened by Skidozer',accident:'Opened by Lab accident'};

function Frostbite({state,commit}:Props) {
  const [open,setOpen] = useState(false);
  const targets = STATION_FROST_TARGETS.filter(id=>!STATION_ROLES.some(role=>role.id===id) ||
    STATION_ROLES.some(role=>role.id===id && state.roles?.[role.id]==='present' && !state.flight?.roles.includes(role.id)));
  return <div className="station-mechanic">
    <IllustratedTile className="module-control-tile" title="Frostbite" art={stationArt.frostbite}
      status={state.frost?.girl ? frostOptions[state.frost.girl] : 'Final Girl status unrecorded'}
      aria-expanded={open} onClick={()=>setOpen(!open)}/>
    {open && <div className="station-edit">
      {targets.map(id=><label key={id}>{frostLabels[id]}
        <select value={state.frost?.[id]??''} onChange={e=>commit({kind:'frost',target:id,status:(e.target.value || null) as 'marked'|'clear'|null})}>
          <option value="">Unrecorded</option><option value="marked">Frostbite</option><option value="clear">Clear</option>
        </select>
      </label>)}
    </div>}
    {state.generator ? <div className="station-actions">
      <button type="button" onClick={()=>commit({kind:'upkeep'})}>Record skipped Upkeep clearing</button>
    </div> : <details className="module-correction"><summary>Generator</summary>
      <button type="button" onClick={()=>commit({kind:'generator'})}>Record next Upkeep exception</button>
    </details>}
  </div>;
}

export function StationEnvironment({state,commit}:Props) {
  const [skidozerOpen,setSkidozerOpen] = useState(false);
  const [labOpen,setLabOpen] = useState(false);
  const [cacheOpen,setCacheOpen] = useState(false);
  const breached = state.breach && state.breach!=='intact';
  return <section aria-label="Station conditions">
    <div className="station-grid">
      <Frostbite state={state} commit={commit}/>
      <EventControl name="Heavy Storm" art={stationArt.storm} value={state.storm===undefined?undefined:state.storm?'active':'ended'}
        interaction="toggle" onActivate={()=>commit({kind:'storm',active:true})}
        onEnd={()=>commit({kind:'storm',active:false})} onClear={()=>commit({kind:'storm',active:null})}/>
      <div className="station-mechanic">
        <IllustratedTile className="module-control-tile" title="Lab wall" status={state.breach?breachLabels[state.breach]:'Breach status unrecorded'}
          art={breached?stationArt.labBreached:stationArt.labIntact}
          aria-expanded={labOpen} onClick={()=>setLabOpen(!labOpen)}/>
        {labOpen && <div className="station-edit"><label>Lab opening<select value={state.breach??''}
          onChange={e=>commit({kind:'breach',status:(e.target.value||null) as NonNullable<StationState['breach']>|null})}>
          <option value="">Unrecorded</option>{Object.entries(breachLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}
        </select></label></div>}
      </div>
      <div className="station-mechanic">
        <IllustratedTile className="module-control-tile" title="Skidozer" status={state.skidozer
          ? `${state.skidozer==='parked'?'Parked':'In use'}${state.skidozerSpace?` · ${STATION_SPACES[state.skidozerSpace]}`:''}`
          : 'Status unrecorded'}
          art={state.skidozer==='in-use'?stationArt.skidozerInUse:stationArt.skidozerParked}
          aria-expanded={skidozerOpen} onClick={()=>setSkidozerOpen(!skidozerOpen)}/>
        {skidozerOpen && <div className="station-edit">
          <label>Skidozer state<select value={state.skidozer??''}
            onChange={e=>{const status=(e.target.value||null) as NonNullable<StationState['skidozer']>|null;commit({kind:'skidozer',status,space:status?state.skidozerSpace:undefined});}}>
            <option value="">Unrecorded</option><option value="parked">Parked</option><option value="in-use">In use</option>
          </select></label>
          {state.skidozer && <label>Outdoor position<select value={state.skidozerSpace??''}
            onChange={e=>commit({kind:'skidozer',status:state.skidozer!,space:(e.target.value||undefined) as StationState['skidozerSpace']})}>
            <option value="">Unrecorded</option>{STATION_OUTDOORS.map(space=><option value={space} key={space}>{STATION_SPACES[space]}</option>)}
          </select></label>}
        </div>}
      </div>
      <div className="station-mechanic">
        <IllustratedTile className="module-control-tile" title="Hidden Weapons Cache" status={state.cache==='revealed'
          ? `Armory revealed${state.armorySpace?` · ${STATION_SPACES[state.armorySpace]}`:''}`
          : state.cache==='hidden'?'Cache placed':state.cache==='unsearched'?'Cache absent':'Status unrecorded'}
          art={state.cache==='revealed'?stationArt.armory:stationArt.cache} aria-expanded={cacheOpen} onClick={()=>setCacheOpen(!cacheOpen)}/>
        {cacheOpen && <div className="station-edit">
          <label>Cache state<select value={state.cache??''} onChange={e=>commit({kind:'cache',status:(e.target.value||null) as NonNullable<StationState['cache']>|null})}>
            <option value="">Unrecorded</option><option value="unsearched">Absent</option><option value="hidden">Cache placed</option><option value="revealed">Armory revealed</option>
          </select></label>
          {state.cache==='revealed' && <label>Armory position<select value={state.armorySpace??''}
            onChange={e=>commit({kind:'cache',status:'revealed',space:(e.target.value||undefined) as StationState['armorySpace']})}>
            <option value="">Unrecorded</option>{STATION_OUTDOORS.filter(space=>space!=='helipad').map(space=><option value={space} key={space}>{STATION_SPACES[space]}</option>)}
          </select></label>}
        </div>}
      </div>
    </div>
  </section>;
}
