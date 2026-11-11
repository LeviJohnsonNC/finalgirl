import { STATION_ROLES,type StationCommand,type StationState } from '../../../supabase/functions/_shared/play/station';
import { CharacterControl } from './CharacterControl';
import { stationCrewArt } from './stationArt';

type Role = typeof STATION_ROLES[number]['id'];
const states = [
  {value:'present',label:'In play'},
  {value:'aboard',label:'Aboard'},
  {value:'saved',label:'Saved'},
  {value:'killed',label:'Killed'},
  {value:'left',label:'Left play'},
];

export function StationCrew({state,commit,board}: {
  state: StationState;
  commit: (action:StationCommand)=>boolean;
  board: (id:Role)=>void;
}) {
  return <section aria-label="Station special victims" className="station-grid">
    {STATION_ROLES.map(role=>{
      const aboard=state.flight?.roles.includes(role.id);
      const value=state.roles?.[role.id];
      const art=stationCrewArt[role.id][value==='saved'||value==='killed'?value:'present'];
      return <div className="station-mechanic" key={role.id}>
        <CharacterControl name={role.name} value={aboard?'aboard':value} states={states} present="present" art={art}
          showRules={false} showStatusEditor={false} reactivateFrom={['left']}
          outcomes={value==='present'&&!aboard?['killed','left']:[]}
          onChange={status=>commit({kind:'role',id:role.id,status:status as 'present'|'killed'|'left'})}/>
        {value==='present'&&!aboard&&state.flight?.position==='helipad'&&
          <button type="button" aria-label={`Board ${role.name}`} onClick={()=>board(role.id)}>Board helicopter</button>}
        {value&&!aboard&&<details className="module-correction">
          <summary>Correct {role.name} status</summary>
          <div className="station-edit"><label>Status<select value={value}
            onChange={e=>commit({kind:'role',id:role.id,status:(e.target.value||null) as typeof value|null,correction:true})}>
            <option value="">Unrecorded</option>
            {states.filter(s=>s.value!=='aboard').map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
          </select></label></div>
        </details>}
      </div>;
    })}
  </section>;
}
