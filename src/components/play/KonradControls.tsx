import {useState} from 'react';
import {newPlayEvent,summarizePlay} from '@/lib/play/events';
import {moduleState} from '@/lib/play/modules';
import {KONRAD_FUNCTIONS,KONRAD_SHAFTS,KONRAD_EVENTS,KONRAD_PEOPLE,konradParent,konradState,konradToggle,resolveKonradAction,type KonradAction,type KonradSnapshot} from '@/lib/play/konrad';
import {useModuleRecord} from './useModuleRecord';
import {IllustratedTile} from './IllustratedTile';
import {EventControl} from './EventControl';
import {CharacterControl} from './CharacterControl';
import {MinorPowerControl} from './MinorPowerControl';
import {konradArt} from './konradArt';
import type {ControlsProps} from './moduleDefinitions';
import '@/styles/play-konrad.css';

type Command=KonradAction extends infer A?A extends KonradAction?Omit<A,'parent'>:never:never;
const roleStates=[{value:'in-play',label:'In play'},{value:'saved',label:'Saved'},{value:'killed',label:'Killed'},{value:'left',label:'Left play'}];
const loaderStates=['parked','powered','equipped','lost'] as const;
const title=(value:string)=>value.charAt(0).toUpperCase()+value.slice(1).replace(/-/g,' ');

function SwitchPicture({name,on,inactive,active,onChange}:{name:string;on:boolean|undefined;inactive:string;active:string;onChange:(value:boolean)=>unknown}){
 return <article className="konrad-switch" data-state={on===undefined?'unknown':on?'on':'off'}>
  <IllustratedTile art={konradArt(on?active:inactive)} title={name} status={on===undefined?'Not recorded · Click to turn on':on?'On · Click to turn off':'Off · Click to turn on'} aria-label={`Toggle ${name}`} aria-pressed={on} onClick={()=>onChange(on!==true)}/>
 </article>;
}

export function KonradControls({events,onEvent,blocked}:ControlsProps){
 const entries=summarizePlay(events).entries,state=moduleState(entries,'konrad'),s=konradState(state);
 const {record,message}=useModuleRecord(events,onEvent);
 const [validation,setValidation]=useState('');
 const commit=(command:Command)=>{
  if(blocked)return false;
  const action={...command,parent:konradParent(entries)} as KonradAction;
  const changes=resolveKonradAction(action,state,entries);
  if(!changes){setValidation('This change was not recorded. Check the current state and try again.');return false;}
  setValidation('');
  return record(newPlayEvent({kind:'module',konradAction:action,moduleData:{module:'konrad',changes}}));
 };
 const toggle=(target:string,active:boolean)=>commit({command:'toggle',target,active});
 const loaderOn=konradToggle(s,'loader');
 const beaconOn=s.beacon==='unknown'?undefined:s.beacon==='placed';
 return <fieldset className="play-konrad" disabled={blocked} aria-label="USS Konrad tracking">
  {(message||validation)&&<p role="alert">{message||validation}</p>}
  <section aria-label="Maintenance systems"><h3>Maintenance systems</h3><div className="konrad-grid">
   {KONRAD_FUNCTIONS.map(f=><SwitchPicture key={f.id} name={f.name} on={konradToggle(s,`system:${f.id}`)} inactive={`${f.id}-inactive`} active={f.id==='airlock'?'airlock-released':f.id==='self-destruct'?'self-destruct-middle':`${f.id}-active`} onChange={active=>toggle(`system:${f.id}`,active)}/>)}
  </div></section>
  <section aria-label="Maintenance shafts"><h3>Maintenance shafts</h3><div className="konrad-grid konrad-shafts">
   {KONRAD_SHAFTS.map(id=><SwitchPicture key={id} name={`${title(id)} shaft`} on={konradToggle(s,`shaft:${id}`)} inactive={`shaft-${id}-inactive`} active={`shaft-${id}-active`} onChange={active=>toggle(`shaft:${id}`,active)}/>)}
  </div></section>
  <section aria-label="Ship crew" className="konrad-crew"><h3>People aboard</h3><div className="konrad-grid">
   {KONRAD_PEOPLE.map(p=><CharacterControl key={p.id} name={p.name} value={s.people[p.id]} present="in-play" states={roleStates} art={konradArt(s.people[p.id]==='saved'||s.people[p.id]==='killed'?`${p.id}-${s.people[p.id]}`:p.id)} showRules={false} showStatusEditor={false} reactivateFrom={['left']} outcomes={['saved','killed','left']} onChange={status=>status==='in-play'?commit({command:'add-person',id:p.id}):commit({command:'person',id:p.id,status:status as 'saved'|'killed'|'left'|null})}/>)}
  </div></section>
  <section aria-label="Ongoing ship Events"><h3>Ship Events</h3><div className="konrad-grid">
   {KONRAD_EVENTS.filter(e=>e.kind==='ongoing').map(e=><EventControl key={e.id} name={e.name} value={s.events[e.id]} art={konradArt(e.id)} interaction="toggle" onActivate={()=>commit({command:'event',id:e.id,active:true})} onEnd={()=>commit({command:'event',id:e.id,active:false})} onClear={()=>{}}/>)}
  </div></section>
  <section aria-label="Ship equipment and hazards"><h3>Equipment &amp; hazards</h3><div className="konrad-grid">
   <article className="konrad-loader" data-state={loaderOn===true?'on':loaderOn===false?'off':'unknown'}>
    <IllustratedTile art={konradArt(loaderOn===true&&s.loader!=='unknown'?`loader-${s.loader}`:'loader-parked')} title="Super Loader" status={loaderOn===true?s.loader==='unknown'?'In play · State not recorded':title(s.loader):loaderOn===undefined?'Not recorded · Add':'Not in play · Add'} aria-label={loaderOn===true?'Super Loader':'Add Super Loader'} disabled={loaderOn===true} onClick={()=>toggle('loader',true)}/>
    {loaderOn===true&&<div className="konrad-loader-actions" role="group" aria-label="Super Loader state">
     {loaderStates.map(status=><button key={status} disabled={s.loader===status} aria-pressed={s.loader===status} onClick={()=>commit({command:'loader',status:status as KonradSnapshot['loader'],space:null})}>{title(status)}</button>)}
     <button className="konrad-quiet" onClick={()=>toggle('loader',false)}>Not in play</button>
    </div>}
   </article>
   <SwitchPicture name="Remote Beacon" on={beaconOn} inactive="beacon" active="beacon" onChange={active=>commit({command:'beacon',status:active?'placed':'absent',space:null})}/>
   <SwitchPicture name="Hull breach" on={konradToggle(s,'breach')} inactive="breach" active="breach" onChange={active=>toggle('breach',active)}/>
  </div></section>
  <section aria-label="Slippery Minor Dark Power"><h3>Slippery</h3><MinorPowerControl name="Slippery" health={s.slippery??undefined} maxHealth={2} art={()=>konradArt('slippery')} heroArt={konradArt('slippery')} previouslyRevealed={entries.some(e=>e.moduleData?.module==='konrad'&&konradState(e.moduleData.changes).slippery!==null)} onChange={value=>commit({command:'observe',key:'slippery',value})}/></section>
 </fieldset>;
}
