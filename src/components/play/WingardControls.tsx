import { useState } from 'react';
import { WINGARD_CRAFTS, WINGARD_MODULE, WINGARD_SPACES, WINGARD_SUPPLIES, wingardCraft } from '../../../supabase/functions/_shared/play/wingardCatalog';
import { resolveWingardAction, wingardParent, wingardState, type WingardCommand } from '../../../supabase/functions/_shared/play/wingardCottage';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { EventControl } from './EventControl';
import { CharacterControl } from './CharacterControl';
import { IllustratedTile } from './IllustratedTile';
import { PlaySelect } from './PlaySelect';
import type { ControlsProps } from './moduleDefinitions';
import { useModuleRecord } from './useModuleRecord';
import { wingardArt } from './wingardArt';
import '@/styles/play-wingard.css';

const people = [
  {id:'outsider',name:'Outsider'},
  {id:'boyfriend',name:'Boyfriend'},
  {id:'neighbor',name:'Neighbor'},
] as const;
const outcomes = [
  {value:'present',label:'In play'},
  {value:'saved',label:'Saved'},
  {value:'killed',label:'Killed'},
  {value:'left',label:'Left play'},
] as const;
const unused = [...WINGARD_CRAFTS].sort((a,b)=>a.name.localeCompare(b.name));
const trapKinds = ['snare','nail-trap'] as const;

export function WingardControls({events, onEvent, blocked}:ControlsProps) {
  const entries = summarizePlay(events).entries;
  const fields = moduleState(entries,WINGARD_MODULE);
  const state = wingardState(fields);
  const {record,message}=useModuleRecord(events,onEvent);
  const [picker,setPicker]=useState<'offer'|'craft'>();
  const [expanded,setExpanded]=useState<string>();
  const [placing,setPlacing]=useState<string>();
  const [showEvents,setShowEvents]=useState(false);
  const [boat,setBoat]=useState('');

  function commit(command:WingardCommand) {
    if(blocked) return false;
    const action={...command,parent:wingardParent(entries)};
    const changes=resolveWingardAction(action,fields,entries);
    return !!changes && record(newPlayEvent({kind:'module',moduleData:{module:WINGARD_MODULE,changes},wingardAction:action}));
  }

  const alarm=state.alarm;
  const alarmActive=typeof alarm==='number';
  const showBoat=state.people.neighbor==='present';
  const options=(max:number)=>Array.from({length:max},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>);

  return <div className="wingard-controls">
    <section aria-label="Workbench">
      <div className="wingard-heading">
        <h3>Workbench</h3>
        <div className="wingard-recipe-links">
          <button type="button" className="module-quiet-link" aria-expanded={picker==='offer'} onClick={()=>setPicker(picker==='offer'?undefined:'offer')}>Add recipe</button>
          <button type="button" className="module-quiet-link" aria-expanded={picker==='craft'} onClick={()=>setPicker(picker==='craft'?undefined:'craft')}>Crafted recipe</button>
        </div>
      </div>
      <div className="wingard-supplies">
        {WINGARD_SUPPLIES.map(supply=><IllustratedTile key={supply.id} className="module-control-tile"
          art={wingardArt(state.supplies[supply.id]==='held'?`${supply.id}-held`:supply.id,true)} title={supply.name}
          data-state={state.supplies[supply.id] ?? 'unknown'} status={state.supplies[supply.id]==='held'?'Held':state.supplies[supply.id]==='available'?'Available':'Unrecorded'}
          aria-label={`${supply.name}: ${state.supplies[supply.id] ?? 'unrecorded'}`} aria-pressed={state.supplies[supply.id]==='held'}
          disabled={blocked} onClick={()=>commit({command:'supply',id:supply.id,value:state.supplies[supply.id]==='held'?'available':'held'})}/>)}
      </div>
      {picker&&<div className="wingard-recipes" role="group" aria-label={picker==='offer'?'Choose a recipe to add':'Choose a crafted recipe'}>
        {unused.filter(card=>!state.recipes[card.id]||(picker==='craft'&&state.recipes[card.id].status==='offered')).map(card=>
          <IllustratedTile key={card.id} className="module-control-tile"
            art={wingardArt(picker==='offer'?`${card.id}-blueprint`:card.id,true)} title={card.name} status=""
            disabled={blocked} onClick={()=>{if(commit({command:picker,id:card.id}))setPicker(undefined);}}/>)}
      </div>}
      <div className="wingard-recorded">
        {unused.filter(card=>state.recipes[card.id]).map(card=>{
          const item=state.recipes[card.id];
          const crafted=item.status==='crafted';
          const isTrap=card.id==='snare'||card.id==='nail-trap';
          const uses=crafted?card.uses:undefined;
          const remaining=item.uses;
          const canCycle=uses!==undefined&&remaining!==0;
          const status=crafted?'Crafted':'Recipe';
          return <article className="wingard-recipe-card" key={card.id}>
            <IllustratedTile className="module-control-tile" art={wingardArt(crafted?card.id:`${card.id}-blueprint`)} title={card.name}
              status={status} disabled={blocked||!canCycle}
              aria-label={uses!==undefined?`${card.name}, ${remaining??'unrecorded'} of ${uses} uses`:undefined}
              onClick={()=>{
                if(uses===undefined||remaining===0)return;
                if(!isTrap&&remaining!==undefined)commit({command:'use',id:card.id});
                else commit({command:'uses',id:card.id,uses:remaining===undefined?uses:remaining-1});
              }}>
              {uses!==undefined&&<span className="wingard-uses" aria-hidden="true">Uses: {remaining===undefined?'?':
                Array.from({length:uses},(_,i)=><span key={i} data-used={i>=remaining}>{i<remaining?'●':'○'}</span>)}</span>}
            </IllustratedTile>
            <div className="wingard-actions">
              {crafted?<>
                {isTrap&&<button type="button" disabled={blocked} aria-expanded={placing===card.id}
                  onClick={()=>setPlacing(placing===card.id?undefined:card.id)}>Place trap</button>}
                {card.id==='slingshot'&&remaining!==card.uses&&<button type="button" disabled={blocked}
                  onClick={()=>commit({command:'refill',id:card.id})}>Refill with Nails</button>}
                <button type="button" className="module-quiet-link" disabled={blocked}
                  onClick={()=>commit({command:'return',id:card.id})}>Return card</button>
              </>:<>
                <button type="button" className="wingard-craft-action" disabled={blocked}
                  onClick={()=>commit({command:'craft',id:card.id})}>Craft</button>
                <button type="button" className="module-quiet-link" disabled={blocked}
                  onClick={()=>commit({command:'clear-offer',id:card.id})}>Clear recipe</button>
              </>}
            </div>
            {crafted&&isTrap&&placing===card.id&&<div className="wingard-actions wingard-space-choices" role="group" aria-label="Trap space">
              {WINGARD_SPACES.filter(space=>!state.traps.some(trap=>trap.space===space&&trap.type===card.id)).map(space=>
                <button type="button" key={space} disabled={blocked} onClick={()=>{
                  if(commit({command:'place',id:card.id as typeof trapKinds[number],space}))setPlacing(undefined);
                }}>{space}</button>)}
            </div>}
          </article>;
        })}
      </div>
      {state.traps.length>0 && <div className="wingard-recipes" aria-label="Placed traps">
        {state.traps.map(trap=><article key={`${trap.type}:${trap.space}`}>
          <IllustratedTile className="module-control-tile" art={wingardArt(`${trap.type}-set`,true)} title={wingardCraft(trap.type)!.name} aria-expanded={expanded===`${trap.type}:${trap.space}`} status={`Set · ${trap.space}`}
            disabled={blocked} onClick={()=>setExpanded(expanded===`${trap.type}:${trap.space}`?undefined:`${trap.type}:${trap.space}`)}/>
          {expanded===`${trap.type}:${trap.space}`&&<div className="wingard-actions">
            <button type="button" disabled={blocked} onClick={()=>commit({command:'trigger',id:trap.type,space:trap.space})}>Record trigger</button>
            <button type="button" className="module-quiet-link" disabled={blocked} onClick={()=>commit({command:'remove',id:trap.type,space:trap.space})}>Clear placement</button>
          </div>}
        </article>)}
      </div>}
    </section>
    <section aria-label="Cottage events">
      <div className="wingard-heading"><h3>Events</h3><button type="button" className="module-quiet-link" aria-expanded={showEvents} onClick={()=>setShowEvents(!showEvents)}>{showEvents?'Hide unrecorded':'Record an event'}</button></div>
      <div className="wingard-events">
        {people.map(person=><CharacterControl key={person.id} name={person.name} className={showEvents||state.people[person.id]?'wingard-person':'hidden'}
          art={wingardArt(state.people[person.id]==='saved'||state.people[person.id]==='killed'?`${person.id}-${state.people[person.id]}`:person.id)} present="present" states={outcomes} value={state.people[person.id]} showRules={false} showStatusEditor={false} allowOutcomeCorrections
          outcomes={['saved','killed','left']}
          onChange={value=>commit({command:'person',id:person.id,value:value as typeof outcomes[number]['value'] | null})}/>)}
        <EventControl name="Getting Resourceful" value={state.resourceful?'active':undefined} art={wingardArt('resourceful',true)}
          className={showEvents||state.resourceful?'':'hidden'} interaction="toggle" allowed={!blocked}
          onActivate={()=>commit({command:'resourceful',value:true})}
          onEnd={()=>commit({command:'resourceful',value:false})} onClear={()=>commit({command:'resourceful',value:false})}/>
        {(showEvents||state.scooter)&&<article className="module-event module-cinematic-toggle wingard-scooter" data-state={state.scooter?'active':'unrecorded'}>
          <IllustratedTile className="module-control-tile" art={wingardArt(state.scooter==='with-you'?'scooter-with-you':'scooter',true)}
            title="Kick-Scooter" aria-pressed={!!state.scooter} status={state.scooter==='with-you'?'With you':state.scooter==='parked'?'Parked outdoors':'Unrecorded'} disabled={blocked}
            onClick={()=>commit({command:'scooter',value:state.scooter==='parked'?'with-you':'parked'})}/>
          {showEvents&&state.scooter&&<button type="button" className="module-quiet-link wingard-scooter-clear" disabled={blocked} onClick={()=>commit({command:'scooter',value:null})}>Clear Scooter</button>}
        </article>}
        {(showEvents||alarm!==undefined)&&<article>
          <IllustratedTile className="module-control-tile" art={wingardArt(alarmActive?'alarm-active':'alarm',true)} title="Home Security" aria-expanded={alarm===undefined?undefined:expanded==='alarm'}
            status={alarmActive?`Active · ${alarm}/3 blocked`:alarm==='ready'?'Ready':alarm==='disabled'?'Disabled':'Unrecorded'} disabled={blocked}
            onClick={()=>alarm===undefined?commit({command:'alarm',value:'ready'}):setExpanded(expanded==='alarm'?undefined:'alarm')}/>
          {expanded==='alarm'&&<div className="wingard-actions">
            {alarm==='ready'&&<button type="button" disabled={blocked} onClick={()=>commit({command:'alarm',value:'activate'})}>Activate · House clear</button>}
            {alarmActive&&<><button type="button" disabled={blocked} onClick={()=>commit({command:'alarm',value:'block'})}>Block entry</button>
              <button type="button" disabled={blocked} onClick={()=>commit({command:'alarm',value:'cross'})}>Record House crossing</button></>}
            {alarm!==undefined&&<button type="button" className="module-quiet-link" disabled={blocked} onClick={()=>commit({command:'alarm',value:'clear'})}>Clear alarm</button>}
          </div>}
        </article>}
        {(showBoat||state.boatSaved!==undefined)&&<article>
          <IllustratedTile className="module-control-tile" art={wingardArt('boat',true)} title={showBoat?'Boat':'Boat escape'} aria-expanded={expanded==='boat'}
            status={showBoat?'At the lake':`${state.boatSaved} saved`} disabled={blocked}
            onClick={()=>setExpanded(expanded==='boat'?undefined:'boat')}/>
          {expanded==='boat'&&<div className="wingard-actions">
            <PlaySelect aria-label="Boat party size including the Neighbor" value={boat} onChange={event=>setBoat(event.target.value)}>
              <option value="">Saved including Neighbor</option>{options(4)}
            </PlaySelect>
            <button type="button" disabled={!boat||blocked} onClick={()=>commit({command:'person',id:'neighbor',value:'saved',boatSaved:Number(boat)})}>Record boat escape</button>
          </div>}
        </article>}
      </div>
    </section>
    {message&&<p role="alert">{message}</p>}
  </div>;
}
