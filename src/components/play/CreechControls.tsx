import { useState } from 'react';
import { EventControl } from './EventControl';
import { CreechHunters } from './CreechHunters';
import { IllustratedTile } from './IllustratedTile';
import { PlaySelect } from './PlaySelect';
import { useModuleRecord } from './useModuleRecord';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { CREECH_EVENTS, CREECH_CONNECTIONS, CREECH_ONE_WAY, HELICOPTER_INTERPRETATION, resolveCreechAction, type CreechAction } from '@/lib/play/creech';
import { poltergeistPower } from '../../../supabase/functions/_shared/play/poltergeist';
import type { ControlsProps } from './moduleDefinitions';
import { creechArt } from './creechArt';
import '@/styles/play-creech.css';
type Command = CreechAction extends infer A ? A extends CreechAction ? Omit<A,'parent'> : never : never;
export function CreechControls({events,onEvent,blocked,killer}:ControlsProps){
 const entries=summarizePlay(events).entries;
 const state=moduleState(entries,'creech');const polter=moduleState(entries,'poltergeist');
 const parent=events[events.length-1]?.id??'root';
 const {record,message}=useModuleRecord(events,onEvent);
 const [connection,setConnection]=useState(CREECH_CONNECTIONS[0].id);
 const [helicopter,setHelicopter]=useState<string|null>(null);
 const [passengers,setPassengers]=useState('');const [carolyn,setCarolyn]=useState(false);const [floppy,setFloppy]=useState('');const [confirmed,setConfirmed]=useState(false);
 const commit=(command:Command,revision=parent)=>{
  const request={...command,parent:revision} as CreechAction;
  const result=resolveCreechAction(request,state,polter,killer);
  return !blocked&&result?record(newPlayEvent({kind:'module',creechAction:request,moduleData:{module:'creech',changes:result.changes},...(result.linkedModule?{linkedModule:result.linkedModule}:{})})):false;
 };
 const ropeStates=['unplaced',...CREECH_ONE_WAY.map(route=>route.id)];
 const nextRope=ropeStates[(ropeStates.indexOf(String(state.rope))+1)%ropeStates.length];
 const useHelicopter=()=>{
  if(state['helicopter.used']===true){setHelicopter(helicopter?null:parent);return;}
  if(state['event.helicopter']!=='active'){commit({kind:'event',id:'helicopter',active:true});return;}
  setHelicopter(helicopter?null:parent);setConfirmed(false);
 };
 return <fieldset className="play-creech" disabled={blocked} aria-label="Creech Manor tracking">
  <section aria-label="Routes and tokens"><h3>Routes & tokens</h3><div className="creech-token-grid">
   <div><IllustratedTile className="creech-scene" art={creechArt[state.ladder==='broken'?'ladder-broken':'ladder-usable']} title="External ladder" status={state.ladder===undefined?'Not recorded':String(state.ladder)} data-state={state.ladder??'unknown'} onClick={()=>commit({kind:'correct',key:'ladder',value:state.ladder==='broken'?'usable':'broken'})}/><details className="module-correction"><summary>Correct external ladder</summary><PlaySelect aria-label="External ladder status" value={String(state.ladder??'')} onChange={e=>commit({kind:'correct',key:'ladder',value:e.target.value||null})}><option value="">Not recorded</option><option value="usable">Usable</option><option value="broken">Broken</option></PlaySelect></details></div>
   <IllustratedTile className="creech-scene" art={creechArt[`rope-${state.rope??'unplaced'}`]??creechArt['rope-unplaced']} title="Rope Ladder" status={state.rope===undefined?'Not recorded':CREECH_ONE_WAY.find(r=>r.id===state.rope)?.name.replace('→','↔')??'Not placed'} aria-label="Cycle Rope Ladder" onClick={()=>commit({kind:'correct',key:'rope',value:nextRope})}/>
   <div><IllustratedTile className="creech-scene" art={creechArt.padlock} title="Padlock" status={state.padlock===undefined?'Not recorded':CREECH_CONNECTIONS.find(c=>c.id===state.padlock)?.name??String(state.padlock)} onClick={()=>document.getElementById('creech-padlock-editor')?.click()}/><details className="module-correction"><summary id="creech-padlock-editor">Place or correct Padlock</summary><PlaySelect aria-label="Padlock connection" value={connection} onChange={e=>setConnection(e.target.value)}>{CREECH_CONNECTIONS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</PlaySelect><button onClick={()=>commit({kind:'padlock',connection})}>Place Padlock</button>{CREECH_CONNECTIONS.some(c=>c.id===state.padlock)&&<><p>Confirm an Enemy attacked from a room adjacent to the Padlock. Records token removal; no damage is recorded.</p><button onClick={()=>commit({kind:'block-attack'})}>Record Padlock blocked attack</button></>}<button onClick={()=>commit({kind:'correct',key:'padlock',value:'unplaced'})}>Record Padlock unplaced</button><button onClick={()=>commit({kind:'correct',key:'padlock',value:null})}>Clear Padlock record</button></details></div>
  </div></section>
  <section aria-label="Lasting Events"><h3>Lasting Events</h3><div className="creech-event-grid">{CREECH_EVENTS.filter(e=>e.ongoing&&!['hunters','helicopter'].includes(e.id)).map(e=><EventControl key={e.id} name={e.name} value={state[`event.${e.id}`] as string|undefined} art={creechArt[e.id]} interaction="toggle" onActivate={()=>commit({kind:'event',id:e.id,active:true})} onEnd={()=>commit({kind:'event',id:e.id,active:false})} onClear={()=>commit({kind:'correct',key:`event.${e.id}`,value:null})}/>)}</div></section>
  <CreechHunters state={state} onEvent={active=>commit({kind:'event',id:'hunters',active})} onGroup={colors=>commit({kind:'hunters',colors})} onOutcome={(color,outcome,bloodlust)=>commit({kind:'hunter',color,outcome,...(bloodlust!==undefined?{bloodlust}:{})})} onCorrect={(key,value)=>commit({kind:'correct',key,value})}/>
  <section aria-label="Helicopter rescue"><h3>Helicopter Rescue</h3>
   <IllustratedTile className="creech-scene" art={creechArt.helicopter} data-state={state['event.helicopter']??'unknown'} title="Helicopter Rescue" status={state['helicopter.used']===true?'Used · Once per game':state['event.helicopter']==='active'?'On the roof · Record use':state['event.helicopter']==='ended'?'Left play':'Not recorded · Activate'} aria-label="View Helicopter Rescue" onClick={useHelicopter}/>
   {helicopter&&state['helicopter.used']!==true&&<div className="creech-editor"><label>Ordinary passengers saved<input aria-label="Ordinary passengers saved" type="number" min="0" max="50" placeholder="Not recorded" value={passengers} onChange={e=>setPassengers(e.target.value)}/></label>{killer==='Poltergeist'&&polter.carolyn==='with-you'&&<><label><input type="checkbox" checked={carolyn} onChange={e=>{setCarolyn(e.target.checked);setFloppy('');setConfirmed(false);}}/>Carolyn rescued with you</label>{carolyn&&<label>Mr. Floppy at rescue<PlaySelect aria-label="Mr. Floppy at helicopter rescue" value={floppy} onChange={e=>setFloppy(e.target.value)}><option value="">Not recorded</option><option value="true">With you</option><option value="false">Not with you</option></PlaySelect></label>}</>}{carolyn&&poltergeistPower(entries).epic&&<p>{HELICOPTER_INTERPRETATION}</p>}<p>{carolyn?'Records Carolyn rescued in the same observation. Victory remains your reported outcome.':'Records one use, return to Attic and token removal.'} No Victim totals are added.</p><label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I resolved this helicopter use on the physical board</label><button disabled={!confirmed} onClick={()=>{if(commit({kind:'helicopter',victims:passengers===''?null:Number(passengers),carolyn,floppy:carolyn&&floppy!==''?floppy==='true':null,confirmed:true},helicopter))setHelicopter(null);}}>Record helicopter use</button></div>}
   <details className="module-correction"><summary>Correct helicopter record</summary><label>Use history<PlaySelect aria-label="Helicopter use history" value={state['helicopter.used']===undefined?'':String(state['helicopter.used'])} onChange={e=>commit({kind:'correct',key:'helicopter.used',value:e.target.value===''?null:e.target.value==='true'})}><option value="">Not recorded</option><option value="false">Unused</option><option value="true">Used</option></PlaySelect></label><button onClick={()=>commit({kind:'event',id:'helicopter',active:false})}>Record helicopter left play</button></details>
  </section>

  {message&&<p role="alert">{message}</p>}
 </fieldset>;
}
