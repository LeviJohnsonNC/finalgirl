import { useState } from 'react';
import { moduleState, type ModuleValue } from '@/lib/play/modules';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { EVOMORPH_STAGES, EVOMORPH_MINORS, evomorphParent, resolveEvomorphAction, type EvomorphAction } from '../../../supabase/functions/_shared/play/evomorph';
import { evomorphArt, evomorphStageArt } from './evomorphArt';
import { IllustratedTile } from './IllustratedTile';
import { KillerCards } from './KillerCards';
import { MinorPowerGroup } from './MinorPowerGroup';
import { MinorPowerControl } from './MinorPowerControl';
import { PlaySelect } from './PlaySelect';
import { useModuleRecord } from './useModuleRecord';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-evomorph.css';
const title=(v:string)=>v[0].toUpperCase()+v.slice(1);
export function EvomorphControls({events,onEvent,blocked}:ControlsProps) {
  const entries=summarizePlay(events).entries, state=moduleState(entries,'evomorph');
  const {record,message}=useModuleRecord(events,onEvent);
  const [localError,setLocalError]=useState('');
  const [correctingStage,setCorrectingStage]=useState(false);
  const stage=typeof state.stage==='string'?state.stage:undefined;
  const act=(command:EvomorphAction['command'],fields:Partial<EvomorphAction>={})=>{
    const request:EvomorphAction={parent:evomorphParent(entries),command,...fields};
    const changes=resolveEvomorphAction(request,state,entries);
    if(blocked)return false;
    if(!changes){setLocalError('Check the current state and your physical card. This change was not recorded.');return false;}
    const ok=record(newPlayEvent({kind:'module',moduleData:{module:'evomorph',changes},evomorphAction:request}));
    if(ok)setLocalError('');
    return ok;
  };
  const correct=(key:string,value:ModuleValue)=>act('correct',{key,value});
  const canToggle=stage==='youngling'||stage==='adult';
  const hidden=state.presence==='vanished';
  const visible=state.presence==='on-board';
  const visibility=hidden?'Hidden':visible?'Visible':'Visibility not recorded';
  // Visibility is an observation only. Returning here does not resolve Scan,
  // Ambush, entry effects, damage, casualties or a skipped phase.
  const togglePresence=()=>hidden||!visible?correct('presence','on-board'):act('vanish');
  return <section className="play-evomorph" aria-label="Evomorph tracking">
    <div className="evo-evolution">
      <IllustratedTile art={visible?evomorphStageArt(stage):evomorphArt('vanished')} title={stage?title(stage):'Evolution not recorded'} status={`${visibility}${canToggle?hidden?' · Click to show':visible?' · Click to hide':' · Click to mark visible':''}`} aria-label="Evomorph visibility" aria-pressed={hidden||visible?hidden:undefined} disabled={blocked||!canToggle} onClick={togglePresence} data-presence={hidden?'hidden':visible?'visible':'unknown'}/>
      <div className="evo-stage-actions">
        {(stage==='hatchling'||stage==='youngling')&&<button disabled={blocked} onClick={()=>act('evolve')}>Evolve to {stage==='hatchling'?'Youngling':'Adult'}</button>}
        <button type="button" className="evo-quiet" aria-expanded={correctingStage} aria-controls="evomorph-stage-correction" onClick={()=>setCorrectingStage(!correctingStage)}>Correct stage</button>
        {correctingStage&&<div id="evomorph-stage-correction"><label className="evo-quiet-label">Stage<PlaySelect aria-label="Correct Evomorph stage" value={stage??''} disabled={blocked} onChange={e=>{if(e.target.value===(stage??'')||correct('stage',e.target.value||null))setCorrectingStage(false);}}><option value="">Not recorded</option>{EVOMORPH_STAGES.map(s=><option key={s} value={s}>{title(s)}</option>)}</PlaySelect></label></div>}

      </div>
    </div>
    <section aria-label="Evomorph Minor Dark Powers"><h3>Minor Dark Powers</h3><MinorPowerGroup className="evo-minors">{EVOMORPH_MINORS.map(p=><MinorPowerControl key={p.id} name={p.name} maxHealth={p.health} health={state[`minor.${p.id}.health`] as number|undefined} previouslyRevealed={entries.some(e=>e.moduleData?.module==='evomorph'&&typeof e.moduleData.changes[`minor.${p.id}.health`]==='number')} disabled={blocked} art={()=>evomorphArt(p.id)} heroArt={evomorphArt(p.id)} onChange={health=>act('minor',{key:p.id,value:health})}/>)}</MinorPowerGroup></section>
    <KillerCards killer="Evomorph" events={events} onEvent={onEvent} disabled={blocked}/>
    {(message||localError)&&<p role="alert">{message||localError}</p>}
  </section>;
}
