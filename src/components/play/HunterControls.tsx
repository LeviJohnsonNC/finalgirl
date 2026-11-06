import '@/styles/play-ally-actions.css';
import { useState } from 'react';
import { HUNTER, HUNTER_MINORS, hunterMinorField } from '@/lib/play/hunter';
import { ModuleArtwork } from './ModuleArtwork';
import { MinorPowerControl } from './MinorPowerControl';
import { MinorPowerGroup } from './MinorPowerGroup';
import { KillerCards } from './KillerCards';
import { IllustratedTile } from './IllustratedTile';
import { PlaySelect } from './PlaySelect';
import { useHunterRecord } from './useHunterRecord';
import { hunterArt, hunterModelArt, hunterPartArt } from './hunterArt';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-hunter.css';
export function HunterControls({events,onEvent,blocked}:ControlsProps) {
 const {entries,fields,s,act,message}=useHunterRecord(events,onEvent,blocked);
 const [repairValue,setRepairValue]=useState(''),[repairPart,setRepairPart]=useState<number>();
 const [legacyPhase,setLegacyPhase]=useState<'mark-v'|'countdown'|'mark-x'>('mark-v');
 const [legacyParts,setLegacyParts]=useState(''),[legacyCountdown,setLegacyCountdown]=useState(''),[legacyHealth,setLegacyHealth]=useState('0');
 const [legacyAlly,setLegacyAlly]=useState<'unrepaired'|'alive'|'destroyed'>('unrepaired');
 const lastAction=[...entries].reverse().find(e=>e.hunterAction?.command==='use'||e.hunterAction?.command==='observe-action')?.hunterAction;
 const allyAction=lastAction&&(lastAction.command==='use'||lastAction.command==='observe-action')?(lastAction.action==='quick-move'?'move':lastAction.action):undefined;
 const allyPhoto=allyAction==='attack'?'ally-attack':allyAction==='react'?'ally-block':allyAction?'ally-move':'ally-idle';
 return <section className="play-hunter" aria-label="Hunter tracking">
  <article aria-label={s.phase==='mark-x'?'Mark X':'Mark V'} className="hunter-model">
   <div className="hunter-model-photo"><ModuleArtwork art={hunterModelArt(s)}/></div>
   <div className="hunter-model-caption"><h3>{s.phase==='mark-x'?'Mark X':'Mark V'}</h3>{s.phase==='unknown'&&<p>Unrecorded</p>}</div>
  </article>
  {s.phase==='unknown'?<details className="hunter-recovery"><summary>Record current Hunter state</summary>
   <label>Active model<PlaySelect aria-label="Current Hunter model" value={legacyPhase} onChange={e=>{const phase=e.target.value as typeof legacyPhase;setLegacyPhase(phase);setLegacyParts(phase==='mark-v'?'':'0');setLegacyCountdown(phase==='mark-x'?'0':'');}}><option value="mark-v">Mark V</option><option value="countdown">Shut down · Countdown</option><option value="mark-x">Mark X</option></PlaySelect></label>
   <label>Parts remaining<input type="number" min="0" max="20" value={legacyParts} onChange={e=>setLegacyParts(e.target.value)}/></label>
   <label>Countdown remaining<input type="number" min="0" max="2" value={legacyCountdown} onChange={e=>setLegacyCountdown(e.target.value)}/></label>
   <label>Mark V state<PlaySelect aria-label="Current Mark V state" value={legacyAlly} onChange={e=>setLegacyAlly(e.target.value as typeof legacyAlly)}><option value="unrepaired">Unrepaired</option><option value="alive">Repaired Ally</option><option value="destroyed">Permanently destroyed</option></PlaySelect></label>
   {legacyAlly==='alive'&&<label>Ally Health<input type="number" min="1" max="99" value={legacyHealth} onChange={e=>setLegacyHealth(e.target.value)}/></label>}
   <button className="hunter-action" disabled={blocked} onClick={()=>act({command:'recover',phase:legacyPhase,remaining:Number(legacyParts),countdown:Number(legacyCountdown),ally:legacyAlly,health:Number(legacyHealth)})}>Record observed state</button>
  </details>:<>
   <div className="hunter-quiet-actions">
    {s.phase==='mark-x'&&<button className="module-unnamed" disabled={blocked} onClick={()=>act({command:'reboot'})}>System Reboot · recover 4 Health</button>}
    {!s.forced&&<button className="module-unnamed" disabled={blocked} onClick={()=>act({command:'force-mark-x'})}>Resolve Mark X Terror</button>}
    {s.damage!==null&&s.damage>0&&<button className="module-unnamed" disabled={blocked} onClick={()=>act({command:'end-action'})}>Clear previously recorded partial damage</button>}
   </div>
   {fields.recovered===true&&<details className="hunter-recovery"><summary>Record existing Parts</summary><p>Earlier Part locations are not fully recorded.</p><button className="hunter-action" disabled={blocked} onClick={()=>act({command:'record-part',status:'on-board'})}>Record Part on board</button><button className="hunter-action" disabled={blocked} onClick={()=>act({command:'record-part',status:'backpack'})}>Record carried Part</button></details>}
   {s.parts.length>0&&<section className="hunter-parts" aria-label="Recovered Cybernetic Parts"><h3>Cybernetic Parts</h3><div className="hunter-parts-list">{s.parts.map(p=>{
    const installed=p.status==='installed',collected=p.status==='backpack';
    const canInstall=collected&&s.phase!=='mark-v'&&s.ally!=='destroyed'&&s.ally!=='unknown';
    return <article key={p.id} className="hunter-part" data-status={p.status}>
     <IllustratedTile art={hunterPartArt(p.id,installed)} title={`Part ${p.id}`} status={installed?`Installed · ${p.health??'?'} Health`:collected?'Collected':'Uncollected'} aria-label={`${installed?'Installed':collected?'Install':'Collect'} Part ${p.id}`} disabled={blocked||installed||collected&&!canInstall} onClick={()=>{if(collected){setRepairPart(p.id);setRepairValue('');}else act({command:'pickup',part:p.id});}}/>
     {collected&&<button className="module-unnamed" disabled={blocked} onClick={()=>act({command:'drop',part:p.id})}>Drop Part {p.id}</button>}
     {repairPart===p.id&&canInstall&&<form className="hunter-repair" onSubmit={e=>{e.preventDefault();if(repairValue!==''&&act({command:'repair',part:p.id,value:Number(repairValue)}))setRepairPart(undefined);}}>
      <label>Printed Health<input aria-label="Part printed Health" type="number" min="0" max="99" required value={repairValue} onChange={e=>setRepairValue(e.target.value)} autoFocus/></label>
      <button className="hunter-action" disabled={blocked}>Install part</button><button type="button" className="module-unnamed" onClick={()=>setRepairPart(undefined)}>Cancel</button>
     </form>}
    </article>;
   })}</div></section>}
   {(s.ally==='alive'||s.ally==='destroyed')&&<section className="hunter-ally-actions" aria-label="Mark V Ally actions">
    <article className="hunter-model hunter-ally" aria-label="Mark V Ally" data-action={s.ally==='destroyed'?'destroyed':allyPhoto}>
     <div className="hunter-model-photo"><ModuleArtwork art={hunterArt(s.ally==='destroyed'?'mark-v-destroyed':allyPhoto)}/></div>
     <div className="play-state-control-bar"><div className="play-state-caption"><span className="play-state-title">Mark V · Ally</span>{s.ally==='destroyed'&&<small>Permanently destroyed</small>}</div>
      <div className="hunter-ally-health"><span>Health</span><div className="play-state-stepper"><button aria-label="Decrease Mark V Ally Health" disabled={blocked||s.ally!=='alive'} onClick={()=>act({command:'ally-health',value:s.allyHealth!-1})}>−</button><strong aria-live="polite">{s.allyHealth}</strong><button aria-label="Increase Mark V Ally Health" disabled={blocked||s.ally!=='alive'||s.allyHealth===99} onClick={()=>act({command:'ally-health',value:s.allyHealth!+1})}>+</button></div></div>
     </div>
    </article>
    <div className="ally-observation-actions" role="group" aria-label="Mark V actions">{([{id:'attack',title:'Attack'},{id:'move',title:'Move'},{id:'react',title:'Block'}] as const).map(a=><button key={a.id} aria-pressed={allyAction===a.id} disabled={blocked||s.ally!=='alive'} onClick={()=>act({command:'observe-action',action:a.id})}>{a.title}</button>)}</div>
   </section>}
   {s.phase!=='mark-v'&&s.ally==='unrepaired'&&<button className="module-unnamed" disabled={blocked} onClick={()=>act({command:'destroy-ally'})}>Terminate Mark V · remove unrepaired model</button>}
  </>}
  <section aria-label="Hunter Minor Dark Powers"><h3>Minor Dark Powers</h3><MinorPowerGroup>{HUNTER_MINORS.map(card=>{
   const key=hunterMinorField(card.id),value=fields[key],health=typeof value==='number'?value:undefined;
   return <MinorPowerControl key={card.id} name={card.name} health={health} maxHealth={card.health} disabled={blocked} previouslyRevealed={entries.some(e=>typeof e.moduleData?.changes[key]==='number')} art={()=>hunterArt(card.id,true)} heroArt={hunterArt(card.id)} onChange={value=>act({command:'minor',card:card.id,value})}/>;
  })}</MinorPowerGroup></section>
  <KillerCards killer={HUNTER} events={events} onEvent={onEvent} disabled={blocked}/>
  <section className="hunter-effects" aria-label="Hunter ongoing Terror"><h3>Ongoing Terror</h3>{([{key:'counterMeasures',id:'counter-measures',name:'Counter-Measures'},{key:'shockAwe',id:'shock-awe',name:'Shock & Awe'}] as const).map(effect=><IllustratedTile key={effect.key} art={hunterArt(effect.id)} title={effect.name} status={fields[effect.key]===true?'In play':'Not recorded in play'} aria-pressed={fields[effect.key]===true} disabled={blocked} onClick={()=>act({command:'effect',key:effect.key,value:fields[effect.key]!==true})}/>)}</section>
  {message&&<p role="alert" className="play-module-error">{message}</p>}
 </section>;
}
