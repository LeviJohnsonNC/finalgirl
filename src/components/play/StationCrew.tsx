import { STATION_ROLES,type StationCommand,type StationState } from '../../../supabase/functions/_shared/play/station';
import { CharacterControl } from './CharacterControl';
import { stationCrewArt } from './stationArt';

const states = [
  {value:'present',label:'In play'},
  {value:'aboard',label:'Aboard'},
  {value:'saved',label:'Saved'},
  {value:'killed',label:'Killed'},
  {value:'left',label:'Left play'},
];

export function StationCrew({state,commit}: {
  state: StationState;
  commit: (action:StationCommand)=>boolean;
}) {
  return <section aria-label="Station special victims" className="station-grid">
    {STATION_ROLES.map(role=>{
      const aboard=state.flight?.roles.includes(role.id);
      const value=state.roles?.[role.id];
      const art=stationCrewArt[role.id][value==='saved'||value==='killed'?value:'present'];
      return <div className="station-mechanic" key={role.id}>
        <CharacterControl name={role.name} value={aboard?'aboard':value} states={states} present="present" art={art}
          showRules={false} showStatusEditor={false} allowOutcomeCorrections
          outcomes={aboard?[]:['saved','killed','left']}
          onChange={status=>commit({
            kind:'role',id:role.id,status:status as 'present'|'saved'|'killed'|'left',
            ...(status==='saved'||value==='saved'||value==='killed'?{correction:true}:{}),
          })}/>
      </div>;
    })}
  </section>;
}
