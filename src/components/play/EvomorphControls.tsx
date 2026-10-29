import { useState } from 'react';
import { moduleState, type ModuleValue } from '@/lib/play/modules';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { EVOMORPH_STAGES, EVOMORPH_MINORS, EVOMORPH_AMBUSH, evomorphParent, evomorphPower, evomorphScans, resolveEvomorphAction, type EvomorphAction } from '../../../supabase/functions/_shared/play/evomorph';
import { evomorphArt } from './evomorphArt';
import { IllustratedTile } from './IllustratedTile';
import { KillerCards } from './KillerCards';
import { MinorPowerGroup } from './MinorPowerGroup';
import { MinorPowerControl } from './MinorPowerControl';
import { PlaySelect } from './PlaySelect';
import { useModuleRecord } from './useModuleRecord';
import type { ControlsProps } from './moduleDefinitions';
import { inkanyambaCell } from './inkanyambaArt';
import '@/styles/play-evomorph.css';
const title=(v:string)=>v[0].toUpperCase()+v.slice(1);
export function EvomorphControls({events,onEvent,blocked,location}:ControlsProps) {
  const entries=summarizePlay(events).entries, state=moduleState(entries,'evomorph');
  const {record,message}=useModuleRecord(events,onEvent);
  const [open,setOpen]=useState(false),[space,setSpace]=useState(''),[slot,setSlot]=useState(''),[clear,setClear]=useState(false),[entryConfirmed,setEntryConfirmed]=useState(false);
  const [localError,setLocalError]=useState('');
  const power=evomorphPower(entries), scans=evomorphScans(state);
  const stage=typeof state.stage==='string'?state.stage:undefined;
  const act=(command:EvomorphAction['command'],fields:Partial<EvomorphAction>={})=>{
    const request:EvomorphAction={parent:evomorphParent(entries),command,...fields};
    const changes=resolveEvomorphAction(request,state,entries);
    if(blocked)return false;
    if(!changes){setLocalError('Check the current state and your physical card. This change was not recorded.');return false;}
    const ok=record(newPlayEvent({kind:'module',moduleData:{module:'evomorph',changes},evomorphAction:request}));
    if(ok){setLocalError('');setSpace('');setSlot('');setEntryConfirmed(false);}
    return ok;
  };
  const correct=(key:string,value:ModuleValue)=>act('correct',{key,value});
  const ambush=EVOMORPH_AMBUSH.find(c=>c.id===state.ambushId);
  const face=state.ambushFace==='adult'?'adult':state.ambushFace==='youngling'?'youngling':undefined;
  const freshSlot=Array.from({length:6},(_,i)=>i+1).find(n=>!scans.some(s=>s.slot===n));
  return <section className="play-evomorph" aria-label="Evomorph tracking">
    <div className="evo-evolution">
      <IllustratedTile art={evomorphArt(stage??'vanished')} title={stage?title(stage):'Evolution not recorded'} status={state.presence==='vanished'?'Vanished':state.presence==='on-board'?'On the board':'Presence not recorded'} aria-label="View evolution and presence actions" aria-expanded={open} onClick={()=>setOpen(!open)}/>
      <div className="evo-stage-actions">
        {(stage==='hatchling'||stage==='youngling')&&<><button disabled={blocked} onClick={()=>act('evolve')}>Evolve to {stage==='hatchling'?'Youngling':'Adult'}</button><p className="module-linked-preview">{stage==='hatchling'?'Records Youngling and Vanish. Resolve any Sideswipe attack at the table.':'Records Adult recovery to 10 Health and the permanent Dark Power reveal. Entry effects are recorded separately.'}</p></>}
        <label className="evo-quiet-label">Correct stage<PlaySelect aria-label="Correct Evomorph stage" value={stage??''} disabled={blocked} onChange={e=>correct('stage',e.target.value||null)}><option value="">Not recorded</option>{EVOMORPH_STAGES.map(s=><option key={s} value={s}>{title(s)}</option>)}</PlaySelect></label>
        {open&&<div className="evo-presence-actions">
          {stage!=='hatchling'&&state.presence!=='vanished'&&<button disabled={blocked||!stage} onClick={()=>act('vanish')}>Record Vanish</button>}
          <label className="evo-quiet-label">Correct presence<PlaySelect aria-label="Correct Evomorph presence" value={String(state.presence??'')} disabled={blocked} onChange={e=>correct('presence',e.target.value||null)}><option value="">Not recorded</option><option value="on-board">On the board</option><option value="vanished">Vanished</option></PlaySelect></label>
          <label>Return space<input aria-label="Evomorph return space" maxLength={120} value={space} onChange={e=>setSpace(e.target.value)}/></label>
          <label className="evo-check"><input type="checkbox" checked={clear} onChange={e=>setClear(e.target.checked)}/>The resolved card removes all Scan tokens</label>
          <button disabled={blocked||!space.trim()} onClick={()=>act('return',{space:space.trim(),value:clear})}>Record return</button>
        </div>}
      </div>
    </div>
    {power.revealed&&state.powerResolved!==true&&<div className="evo-resolution" aria-label="Dark Power entry effects">
      <h3>Dark Power entry</h3>
      {!power.card?<p>Choose the revealed Power below to record its entry effects.</p>:<>
        <p className="module-linked-preview">{power.card.id==='razor-tail'?'Use the eligible space with the most Victims. Resolve the printed kills at the table, then record casualties through the normal death flow.':'Use the closest space without a Scan token.'} This records the return and clears all Scan tokens.</p>
        <label>Return space<input aria-label="Power return space" maxLength={120} value={space} onChange={e=>setSpace(e.target.value)}/></label>
        <label className="evo-check"><input type="checkbox" checked={entryConfirmed} onChange={e=>setEntryConfirmed(e.target.checked)}/>I resolved the printed entry effects at the table</label>
        <button disabled={blocked||!entryConfirmed||!space.trim()} onClick={()=>act('power-resolve',{space:space.trim()})}>Record Power entry resolved</button>
      </>}
    </div>}
    <details className="evo-section"><summary>Scan &amp; Ambush</summary>
      <div className="evo-scan-layout">
        <IllustratedTile art={evomorphArt('scan')} title="Scanned spaces" status={`${scans.length} recorded${state.scansKnown===true?' / 6':' · coverage unknown'}`} aria-label="Scanned-space record" disabled/>
        <div className="evo-scan-controls">
          {scans.map(s=><div className="evo-scan-row" key={s.slot}><label>Token {s.slot}<input aria-label={`Scan token ${s.slot} space`} maxLength={120} defaultValue={s.space} key={`${s.slot}-${s.space}`} onBlur={e=>{const value=e.target.value.trim();if(value&&value!==s.space)act('scan-place',{slot:s.slot,space:value});}}/></label><button className="evo-quiet" aria-label={`Remove Scan token ${s.slot}`} disabled={blocked} onClick={()=>act('scan-remove',{slot:s.slot})}>Remove</button></div>)}
          <label>Space at {location}<input aria-label="New scanned space" maxLength={120} value={space} onChange={e=>setSpace(e.target.value)}/></label>
          {!freshSlot&&<label>Move the farthest token<PlaySelect aria-label="Farthest Scan token" value={slot} onChange={e=>setSlot(e.target.value)} disabled={blocked}><option value="">Choose from your physical map</option>{scans.map(s=><option key={s.slot} value={String(s.slot)}>{s.space}</option>)}</PlaySelect></label>}
          <button disabled={blocked||!space.trim()||(!freshSlot&&!slot)||state.presence!=='vanished'} onClick={()=>act('scan-place',{slot:freshSlot??Number(slot),space:space.trim()})}>{freshSlot?'Place Scan token':'Move Scan token'}</button>
          <button className="evo-quiet" disabled={blocked} onClick={()=>act('scan-clear')}>Record no Scan tokens</button>
        </div>
      </div>
      <div className="evo-observations">
        <label>Scan copies removed<PlaySelect aria-label="Scan copies removed" value={state.scanRemoved===undefined?'':String(state.scanRemoved)} disabled={blocked} onChange={e=>correct('scanRemoved',e.target.value===''?null:Number(e.target.value))}><option value="">Not recorded</option>{[0,1,2,3].map(n=><option value={String(n)} key={n}>{n} / 3</option>)}</PlaySelect></label>
        <button disabled={blocked||state.presence!=='vanished'||typeof state.scanRemoved!=='number'||state.scanRemoved>=3||state.skipPhase===true||!space.trim()} onClick={()=>act('scan-success',{space:space.trim()})}>Record Scan · 3+ successes</button>
        <p className="module-linked-preview">Uses the return space above; records return, one Scan removed and the next Killer phase skipped. Scanned-space tokens remain.</p>
        {state.skipPhase===true&&<button disabled={blocked} onClick={()=>act('skip-consumed')}>Skipped Killer phase complete</button>}
        <label>Revealed Ambush<PlaySelect aria-label="Record Ambush Danger" value="" disabled={blocked||state.presence!=='vanished'||!['youngling','adult'].includes(stage??'')} onChange={e=>{if(e.target.value)act('ambush',{key:e.target.value,face:stage as 'youngling'|'adult'});}}><option value="">Choose Danger on the revealed {stage==='adult'?'Adult':'Youngling'} face</option>{[...EVOMORPH_AMBUSH].sort((a,b)=>a[stage==='adult'?'adult':'youngling']-b[stage==='adult'?'adult':'youngling']).map(c=><option key={c.id} value={c.id}>Danger {c[stage==='adult'?'adult':'youngling']}</option>)}</PlaySelect></label>
        {ambush&&face&&<p className="evo-observation" role="status">Recorded {title(face)} Ambush · Danger {ambush[face]}</p>}
        <label>Toying with the Prey<PlaySelect aria-label="Toying with the Prey effect" value={state.toying===undefined?'':String(state.toying)} disabled={blocked} onChange={e=>correct('toying',e.target.value===''?null:e.target.value==='true')}><option value="">Not recorded</option><option value="true">Active for next Action phase</option><option value="false">Ended / inactive</option></PlaySelect></label>
        <label>Exo-Skeleton token<PlaySelect aria-label="Additional Final Health token" value={state.extraHealthToken===undefined?'':String(state.extraHealthToken)} disabled={blocked} onChange={e=>correct('extraHealthToken',e.target.value===''?null:e.target.value==='true')}><option value="">Not recorded</option><option value="true">Additional token recorded</option><option value="false">Not present</option></PlaySelect></label>
        <label className="evo-quiet-label">Correct phase skip<PlaySelect aria-label="Correct skipped Killer phase" value={state.skipPhase===undefined?'':String(state.skipPhase)} disabled={blocked} onChange={e=>correct('skipPhase',e.target.value===''?null:e.target.value==='true')}><option value="">Not recorded</option><option value="true">Next Killer phase skipped</option><option value="false">No pending skip</option></PlaySelect></label>
      </div>
    </details>
    <section aria-label="Evomorph Minor Dark Powers"><h3>Minor Dark Powers</h3><MinorPowerGroup className="evo-minors">{EVOMORPH_MINORS.map(p=><MinorPowerControl key={p.id} name={p.name} maxHealth={p.health} health={state[`minor.${p.id}.health`] as number|undefined} previouslyRevealed={entries.some(e=>e.moduleData?.module==='evomorph'&&typeof e.moduleData.changes[`minor.${p.id}.health`]==='number')} disabled={blocked} art={()=>evomorphArt(p.id)} heroArt={evomorphArt(p.id)} heartArt={inkanyambaCell(7)} onChange={health=>act('minor',{key:p.id,value:health})}/>)}</MinorPowerGroup></section>
    <KillerCards killer="Evomorph" events={events} onEvent={onEvent} disabled={blocked}/>
    {power.revealed&&<label className="evo-quiet-label">Correct Power entry record<PlaySelect aria-label="Correct Power entry record" value={state.powerResolved===undefined?'':String(state.powerResolved)} disabled={blocked} onChange={e=>correct('powerResolved',e.target.value===''?null:e.target.value==='true')}><option value="">Not confirmed</option><option value="true">Already resolved at the table</option><option value="false">Entry not yet resolved</option></PlaySelect></label>}
    {(message||localError)&&<p role="alert">{message||localError}</p>}
  </section>;
}
