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
export function TormentorControls({events,onEvent,blocked,finalGirl}:ControlsProps){
 const entries=summarizePlay(events).entries,state=moduleState(entries,'tormentor'),s=tormentorState(state);
 const {record,message}=useModuleRecord(events,onEvent);
 const [error,setError]=useState(''),[adding,setAdding]=useState(false),[deck,setDeck]=useState<'victim'|'girl'>('victim'),[subject,setSubject]=useState(''),[space,setSpace]=useState(''),[exitName,setExitName]=useState(''),[correcting,setCorrecting]=useState<string|null>(null);
 const act=(command:Command)=>{if(blocked)return false;const action={...command,parent:tormentorParent(entries)} as TormentorAction;const changes=resolveTormentorAction(action,state,entries);if(!changes){setError('Check the recorded trap state. This change was not recorded.');return false;}const ok=record(newPlayEvent({kind:'module',tormentorAction:action,moduleData:{module:'tormentor',changes}}));if(ok)setError('');return ok;};
 const active=TORMENTOR_TRAPS.filter(c=>s.traps[c.id]?.status==='active'),spent=TORMENTOR_TRAPS.filter(c=>s.traps[c.id]?.status==='spent');
 const presence=tormentorPresence(s,entries),finale=tormentorCard(entries,'finale'),power=tormentorCard(entries,'dark-power');
 const title=presence==='arrival-pending'?'Arrival pending':presence==='on-board'?'On the board':presence==='off-board'?'Unseen':'Presence not recorded';
 const canAdvance=active.length>0&&s.known&&s.pendingSetup!==true&&!s.replacement&&active.every(c=>s.traps[c.id].timer!==null&&s.traps[c.id].timer!<c.checkpoints.length-1);
 const terminal=active.filter(c=>s.traps[c.id].timer===c.checkpoints.length-2);
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
   {s.replacement>0&&<p className="tor-pending">{s.replacement} replacement Victim trap{s.replacement===1?'':'s'} to record.</p>}
   {adding&&<section className="tor-add" aria-label="Add Death Trap"><div className="tor-add-fields"><label>Subject<PlaySelect aria-label="Trap deck" value={deck} disabled={blocked} onChange={e=>setDeck(e.target.value as typeof deck)}><option value="victim">Victim</option><option value="girl">Final Girl</option></PlaySelect></label>{deck==='victim'&&<label>Name or role <span>(optional)</span><input aria-label="Trapped Victim name" maxLength={120} value={subject} onChange={e=>setSubject(e.target.value)}/></label>}<label>Space <span>(optional)</span><input aria-label="Trap space" maxLength={120} value={space} onChange={e=>setSpace(e.target.value)}/></label></div><div className="tor-choices">{TORMENTOR_TRAPS.filter(c=>c.deck===deck&&!s.traps[c.id]).sort((a,b)=>a.name.localeCompare(b.name)).map(c=><button key={c.id} disabled={blocked||deck==='girl'&&active.some(c=>c.deck==='girl')} onClick={()=>{if(act({command:'add',id:c.id,subject:deck==='girl'?finalGirl:subject||'Victim',space:space.trim()||null})){setAdding(false);setSpace('');setSubject('');}}}><ModuleArtwork art={tormentorArt(c.id,true)}/><strong>{c.name}</strong></button>)}</div><button className="tor-quiet" onClick={()=>setAdding(false)}>Cancel</button></section>}
   {!s.known&&<p className="tor-pending">Active traps not fully recorded. <button className="tor-quiet" disabled={blocked} onClick={()=>act({command:'complete-list'})}>All active traps are recorded</button></p>}
   {s.known&&!s.pendingSetup&&!active.length&&!spent.length&&<p className="tor-muted">No active traps recorded.</p>}
   <div className="tor-traps">{active.map(c=>{const t=s.traps[c.id],unfair=power==='Unfair Traps';const next=t.tasks===null?null:c.tasks[t.tasks];return <article key={c.id} className="tor-trap" aria-label={c.name}>
    <div className="tor-trap-photo"><ModuleArtwork art={tormentorArt(c.id)}/><div><p>{t.subject}{t.space?` · ${t.space}`:''}</p><h4>{c.name}</h4></div></div>
    <div className="tor-trap-body"><ol className="tor-countdown" aria-label={`${c.name} countdown`}>{c.checkpoints.map((p,i)=><li key={i} aria-current={t.timer===i?'step':undefined} data-past={t.timer!==null&&i<t.timer}><span>{i===c.checkpoints.length-1?'×':i}</span><small>{p}</small></li>)}</ol>{t.timer===null&&<p className="tor-pending">Countdown not recorded</p>}
    <div className="tor-tasks" aria-label={`${c.name} escape tasks`}>{c.tasks.map((task,i)=><div key={i} data-complete={t.tasks!==null&&i<t.tasks}><span aria-hidden="true">{t.tasks!==null&&i<t.tasks?'✓':i+1}</span><span>{unfair?task.replace(/\d+/g,n=>String(Number(n)+1)):task}</span></div>)}</div>
    {next&&<button className="tor-next-task" disabled={blocked} onClick={()=>act({command:'task',id:c.id})}>Complete task {(t.tasks??0)+1}</button>}
    {t.tasks===null&&<p className="tor-pending">Completed tasks not recorded</p>}
    <button className="tor-quiet" aria-expanded={correcting===c.id} onClick={()=>setCorrecting(correcting===c.id?null:c.id)}>Correct trap record</button>
    {correcting===c.id&&<div className="tor-correction"><label>Countdown<PlaySelect aria-label={`Correct ${c.name} countdown`} value={t.timer===null?'':String(t.timer)} disabled={blocked} onChange={e=>correct(c.id,{timer:e.target.value===''?null:Number(e.target.value)})}><option value="">Not recorded</option>{c.checkpoints.map((p,i)=><option key={i} value={i}>{i} · {p}</option>)}</PlaySelect></label><label>Tasks completed<PlaySelect aria-label={`Correct ${c.name} tasks`} value={t.tasks===null?'':String(t.tasks)} disabled={blocked} onChange={e=>correct(c.id,{tasks:e.target.value===''?null:Number(e.target.value),status:Number(e.target.value)===c.tasks.length?'escaped':'active'})}><option value="">Not recorded</option>{Array.from({length:c.tasks.length+1},(_,i)=><option key={i} value={i}>{i}</option>)}</PlaySelect></label><button className="tor-quiet" disabled={blocked} onClick={()=>act({command:'clear',id:c.id})}>Clear mistaken record</button></div>}
    </div></article>;})}</div>
   {active.length>0&&<div className="tor-advance"><button disabled={blocked||!canAdvance} onClick={()=>act({command:'advance'})}>Advance all traps</button>{terminal.length>0&&<p className="tor-consequence">Next advance: {terminal.map(c=>`${c.name} reaches Killed${c.deck==='girl'?' · Final Girl dies and game is lost':''}`).join('; ')}.</p>}</div>}
   {spent.length>0&&<div className="tor-spent" aria-label="Spent traps awaiting Upkeep"><h4>Spent traps</h4>{spent.map(c=><p key={c.id}>{c.name}{s.traps[c.id].space?` · ${s.traps[c.id].space}`:''} · pending Upkeep</p>)}<button disabled={blocked} onClick={()=>act({command:'cleanup'})}>Clear spent traps</button></div>}
   {Object.values(s.traps).some(t=>t.status==='escaped'||t.status==='removed')&&<details className="tor-history"><summary>Correct a resolved trap</summary>{TORMENTOR_TRAPS.filter(c=>['escaped','removed'].includes(s.traps[c.id]?.status)).map(c=><div key={c.id}><span>{c.name} · {s.traps[c.id].status}</span><button className="tor-quiet" disabled={blocked} onClick={()=>correct(c.id,{status:'active',timer:null,tasks:null})}>Restore for correction</button></div>)}</details>}
  </section>
  {finale==='No Escape!'&&<section className="tor-exits" aria-label="No Escape exit locks"><h3>Exit locks</h3><div>{Object.entries(s.exits).map(([name,locked])=><button key={name} className="tor-lock" aria-label={`${name} · ${locked===null?'not recorded':locked?'locked':'unlocked'}`} aria-pressed={locked===true} disabled={blocked} onClick={()=>act({command:'exit',name,locked:locked!==true})}><ModuleArtwork art={tormentorArt(locked?'locked':'unlocked')}/><strong>{name}</strong><span>{locked===null?'Not recorded':locked?'Locked':'Unlocked'}</span></button>)}</div><form onSubmit={e=>{e.preventDefault();if(act({command:'exit',name:exitName.trim(),locked:true}))setExitName('');}}><label>Exit name<input aria-label="Exit name" value={exitName} maxLength={120} onChange={e=>setExitName(e.target.value)}/></label><button disabled={blocked||!exitName.trim()}>Record locked Exit</button></form></section>}
  <KillerCards killer="The Tormentor" events={events} onEvent={onEvent} disabled={blocked}/>
  {tormentorFatal(s)&&<p role="status" className="tor-consequence">Recorded loss: {s.loss==='trap-terminal'?'Final Girl killed by a Death Trap':s.loss==='no-escape'?'No Escape exit check':'Endless Traps exhausted'}. Health and Victim totals remain as observed.</p>}
  {(message||error)&&<p role="alert">{message||error}</p>}
 </section>;
}
