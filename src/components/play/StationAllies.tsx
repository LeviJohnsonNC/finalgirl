import { STATION_ALLIES,type StationCommand,type StationState } from '../../../supabase/functions/_shared/play/station';
import { IllustratedTile } from './IllustratedTile';
import { stationAllyArt } from './stationArt';

export function StationAllies({state,commit}: {
  state: StationState;
  commit: (action:StationCommand)=>boolean;
}) {
  return <section aria-label="Station allies" className="station-grid">
    {STATION_ALLIES.map(ally=>{
      const value=state.allies?.[ally.id];
      return <IllustratedTile className="module-control-tile" key={ally.id} art={stationAllyArt[ally.id]} title={ally.name}
        status={value==='present'?'Present · Record discard':value==='spent'?'Discarded · Restore record':'Unrecorded · Add'}
        data-state={value==='present'?'active':value==='spent'?'ended':'unrecorded'}
        onClick={()=>commit({kind:'ally',id:ally.id,status:value==='present'?'spent':'present'})}/>;
    })}
  </section>;
}
