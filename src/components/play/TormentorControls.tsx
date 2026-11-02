import {TrapSkull} from './TrapSkull';
import {useState} from 'react';
import {newPlayEvent,summarizePlay} from '@/lib/play/events';
import {moduleState} from '@/lib/play/modules';
import {TORMENTOR_TRAPS,tormentorState,tormentorParent,tormentorPresence,tormentorCard,resolveTormentorAction,tormentorFatal,type TormentorAction,type TrapRecord} from '@/lib/play/tormentor';
import {ModuleArtwork} from './ModuleArtwork';
import {tormentorArt} from './tormentorArt';
import {KillerCards} from './KillerCards';
import {PlaySelect} from './PlaySelect';
import {useModuleRecord} from './useModuleRecord';
import type {ControlsProps} from './moduleDefinitions';
import '@/styles/play-tormentor.css';
type Command=TormentorAction extends infer A?A extends TormentorAction?Omit<A,'parent'>:never:never;
export function TormentorControls({events,onEvent,blocked,finalGirl,location}:ControlsProps){
 const entries=summarizePlay(events).entries,state=moduleState(entries,'tormentor'),s=tormentorState(state);
 const {record,message}=useModuleRecord(events,onEvent);
 const [error,setError]=useState(''),[adding,setAdding]=useState(false),[deck,setDeck]=useState<'victim'|'girl'>('victim'),[exitName,setExitName]=useState('');
 const act=(command:Command)=>{if(blocked)return false;const action={...command,parent:tormentorParent(entries)} as TormentorAction;const changes=resolveTormentorAction(action,state,entries);if(!changes){setError('Check the recorded trap state. This change was not recorded.');return false;}const ok=record(newPlayEvent({kind:'module',tormentorAction:action,moduleData:{module:'tormentor',changes}}));if(ok)setError('');return ok;};
 const active=TORMENTOR_TRAPS.filter(c=>s.traps[c.id]?.status==='active'),spent=TORMENTOR_TRAPS.filter(c=>s.traps[c.id]?.status==='spent');
 const presence=tormentorPresence(s,entries),finale=tormentorCard(entries,'finale'),power=tormentorCard(entries,'dark-power');
 const title=presence==='arrival-pending'?'Arrival pending':presence==='on-board'?'On the board':presence==='off-board'?'Unseen':'Presence not recorded';
 const canAdvance=active.length>0&&s.known&&s.pendingSetup!==true&&!s.replacement&&active.every(c=>s.traps[c.id].timer!==null&&s.traps[c.id].timer!<c.checkpoints.length-1);
 const visible=TORMENTOR_TRAPS.filter(c=>s.traps[c.id]&&s.traps[c.id].status!=='removed');
 const correct=(id:string,patch:Partial<TrapRecord>)=>{const t=s.traps[id];return act({command:'correct',id,...t,...patch});};
 return <section className="play-tormentor" aria-label="Tormentor tracking">
  <div className="tor-presence">
   <ModuleArtwork art={tormentorArt(presence==='on-board'?'portrait':'unseen')}/>
   <div><p className="play-eyebrow">The Tormentor</p><h3>{title}</h3>
    {presence==='arrival-pending'&&<button disabled={blocked} onClick={()=>act({command:'arrive'})}>Record arrival · next Killer phase</button>}
    <details><summary className="tor-quiet">Correct presence</summary><PlaySelect aria-label="Correct Tormentor presence" value={s.presence} disabled={blocked} onChange={e=>act({command:'presence',value:e.target.value as typeof s.presence})}><option value="unknown">Not recorded</option><option value="off-board">Off the board</option><option value="on-board">On the board</option></PlaySelect></details>
   </div>
  </div>
  <section aria-label="Death Traps"><div className="tor-heading"><h3>Death Traps</h3><button disabled={blocked} onClick={()=>setAdding(!adding)} aria-expanded={adding}>Add Death Trap</button></div>
   {s.pendingSetup===true&&<p className="tor-pending">Starting Victim trap · choose the physical card.</p>}
   {s.replacement>0&&<p className="tor-pending">{s.replacement} replacement Victim trap{s.replacement===1?'':'s'} to record. <button className="tor-quiet" disabled={blocked} onClick={()=>act({command:'clear-replacements'})}>Clear mistaken reminder</button></p>}
   {adding&&<section className="tor-add" aria-label="Add Death Trap"><div className="tor-choices">{TORMENTOR_TRAPS.filter(c=>c.deck===deck&&!s.traps[c.id]).sort((a,b)=>a.name.localeCompare(b.name)).map(c=><button key={c.id} disabled={blocked||deck==='girl'&&active.some(c=>c.deck==='girl')} onClick={()=>{if(act({command:'add',id:c.id,subject:deck==='girl'?finalGirl:'Victim',space:null}))setAdding(false);}}><ModuleArtwork art={tormentorArt(c.id,true)}/><strong>{c.name}</strong></button>)}</div><label className="tor-subject">Subject<PlaySelect aria-label="Trap deck" value={deck} disabled={blocked} onChange={e=>setDeck(e.target.value as typeof deck)}><option value="victim">Victim</option><option value="girl">Final Girl</option></PlaySelect></label><button className="tor-quiet" onClick={()=>setAdding(false)}>Cancel</button></section>}
   {!s.known&&<p className="tor-pending">Active traps not fully recorded. <button className="tor-quiet" disabled={blocked} onClick={()=>act({command:'complete-list'})}>All active traps are recorded</button></p>}
   {s.known&&!s.pendingSetup&&!active.length&&!spent.length&&<p className="tor-muted">No active traps recorded.</p>}
   <div className="tor-traps">{visible.map(c=>{
    const t=s.traps[c.id],unfair=power==='Unfair Traps',resolved=t.status==='escaped'||t.status==='spent';
    const art=tormentorArt(c.id+(t.status==='escaped'?'-deactivated':t.status==='spent'?'-sprung':''));
    return <article key={c.id} className="tor-trap" aria-label={c.name} data-trap-state={t.status}>
     <div className="tor-trap-photo"><ModuleArtwork art={art}/><div><p>{t.subject}{t.space?` · ${t.space}`:''}{resolved?` · ${t.status==='escaped'?'Deactivated':'Sprung'}`:''}</p><h4>{c.name}</h4></div></div>
     <div className="tor-trap-body">
      <ol className="tor-countdown" aria-label={`${c.name} countdown`}>{c.checkpoints.map((p,i)=><li key={i} aria-current={t.timer===i?'step':undefined} data-past={t.timer!==null&&i<t.timer}><button className="tor-step" disabled={blocked} aria-label={`Set ${c.name} stage ${i}: ${p}`} aria-pressed={t.timer===i} onClick={()=>{if(t.timer!==i||t.status==='escaped'&&i===c.checkpoints.length-1)act({command:'checkpoint',id:c.id,value:i});}}><span>{i===c.checkpoints.length-1?<TrapSkull/>:i}</span><small>{p}</small></button></li>)}</ol>
      {t.timer===null&&<p className="tor-pending">Countdown not recorded</p>}
      <div className="tor-tasks" aria-label={`${c.name} escape tasks`}>{c.tasks.map((task,i)=>{
       const done=t.tasks!==null&&i<t.tasks;
       return <button key={i} className="tor-task" disabled={blocked} data-complete={done} aria-label={`Toggle ${c.name} task ${i+1}`} aria-pressed={done} onClick={()=>act(i===t.tasks&&t.status==='active'?{command:'task',id:c.id}:{command:'task-progress',id:c.id,value:done?i:i+1})}><span aria-hidden="true">{done?'✓':i+1}</span><span>{unfair?task.replace(/\d+/g,n=>String(Number(n)+1)):task}</span></button>;
      })}</div>
      {t.status==='active'&&t.tasks!==null&&<button className="tor-next-task" disabled={blocked} onClick={()=>act({command:'task',id:c.id})}>{t.tasks===c.tasks.length-1?'Complete final task':'Complete next task'}</button>}
      {t.tasks===null&&<p className="tor-pending">Completed tasks not recorded</p>}
      <button className="tor-quiet" disabled={blocked} onClick={()=>act({command:'clear',id:c.id})}>Clear mistaken record<span className="sr-only">: {c.name}</span></button>
     </div>
    </article>;
   })}</div>
   {active.length>0&&<div className="tor-advance"><button disabled={blocked||!canAdvance} onClick={()=>act({command:'advance'})}>Advance all traps</button></div>}
   {spent.length>0&&<div className="tor-spent" aria-label="Spent traps awaiting Upkeep"><h4>Spent traps</h4>{spent.map(c=><p key={c.id}>{c.name}{s.traps[c.id].space?` · ${s.traps[c.id].space}`:''} · pending Upkeep</p>)}<button disabled={blocked} onClick={()=>act({command:'cleanup'})}>Clear spent traps</button></div>}
   {Object.values(s.traps).some(t=>t.status==='removed')&&<details className="tor-history"><summary>Correct a resolved trap</summary>{TORMENTOR_TRAPS.filter(c=>s.traps[c.id]?.status==='removed').map(c=><div key={c.id}><span>{c.name} · {s.traps[c.id].status}</span><button className="tor-quiet" disabled={blocked} onClick={()=>correct(c.id,{status:'active',timer:null,tasks:null})}>Restore for correction</button></div>)}</details>}
  </section>
  {finale==='No Escape!'&&location==='Marrek Warehouse'&&<p className="tor-muted">No Escape uses the <a href="#warehouse-exits">Warehouse exit locks</a>. Record its loss check at Killer phase start when reviewing the game result.</p>}
  {finale==='No Escape!'&&location!=='Marrek Warehouse'&&<section className="tor-exits" aria-label="No Escape exit locks"><h3>Exit locks</h3><div>{Object.entries(s.exits).map(([name,locked])=><button key={name} className="tor-lock" aria-label={`${name} · ${locked===null?'not recorded':locked?'locked':'unlocked'}`} aria-pressed={locked===true} disabled={blocked} onClick={()=>act({command:'exit',name,locked:locked!==true})}><ModuleArtwork art={tormentorArt(locked?'locked':'unlocked')}/><strong>{name}</strong><span>{locked===null?'Not recorded':locked?'Locked':'Unlocked'}</span></button>)}</div><details><summary className="tor-quiet">Correct exit records</summary>{Object.keys(s.exits).map(name=><div key={name}><button className="tor-quiet" disabled={blocked} onClick={()=>act({command:'clear-exit',name})}>Clear {name} record</button></div>)}</details><form onSubmit={e=>{e.preventDefault();if(act({command:'exit',name:exitName.trim(),locked:true}))setExitName('');}}><label>Exit name<input aria-label="Exit name" value={exitName} maxLength={120} onChange={e=>setExitName(e.target.value)}/></label><button disabled={blocked||!exitName.trim()}>Record locked Exit</button></form></section>}
  <KillerCards killer="The Tormentor" events={events} onEvent={onEvent} disabled={blocked}/>
  {tormentorFatal(s)&&<p role="status" className="tor-consequence">Recorded loss: {s.loss==='trap-terminal'?'Final Girl killed by a Death Trap':s.loss==='no-escape'?'No Escape exit check':'Endless Traps exhausted'}. Health and Victim totals remain as observed.</p>}
  {(message||error)&&<p role="alert">{message||error}</p>}
 </section>;
}
