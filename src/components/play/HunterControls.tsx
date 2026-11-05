import { useState } from 'react';
import { HUNTER, HUNTER_MODULE, HUNTER_MINORS, HUNTER_ACTIONS, HUNTER_POWERS, hunterCard, hunterMinorField, hunterParent, hunterState, resolveHunterAction, type HunterAction } from '@/lib/play/hunter';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { moduleState } from '@/lib/play/modules';
import { ModuleArtwork } from './ModuleArtwork';
import { MinorPowerControl } from './MinorPowerControl';
import { MinorPowerGroup } from './MinorPowerGroup';
import { KillerCards } from './KillerCards';
import { IllustratedTile } from './IllustratedTile';
import { PlaySelect } from './PlaySelect';
import { useModuleRecord } from './useModuleRecord';
import { hunterArt } from './hunterArt';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-hunter.css';
type Command=HunterAction extends infer A ? A extends HunterAction ? Omit<A,'parent'> : never : never;
export function HunterControls({events,onEvent,blocked}:ControlsProps) {
 const entries=summarizePlay(events).entries,fields=moduleState(entries,HUNTER_MODULE),s=hunterState(fields);
 const {record,message}=useModuleRecord(events,onEvent);
 const [damage,setDamage]=useState('1'),[repairValue,setRepairValue]=useState(''),[repairPart,setRepairPart]=useState<number>();
 const [legacyPhase,setLegacyPhase]=useState<'mark-v'|'countdown'|'mark-x'>('mark-v');
 const [legacyParts,setLegacyParts]=useState(''),[legacyCountdown,setLegacyCountdown]=useState(''),[legacyHealth,setLegacyHealth]=useState('0');
 const [legacyAlly,setLegacyAlly]=useState<'unrepaired'|'alive'|'destroyed'>('unrepaired');
 const act=(command:Command)=>{
  if(blocked)return false;
  const hunterAction={...command,parent:hunterParent(entries)} as HunterAction;
  const changes=resolveHunterAction(hunterAction,fields,entries);
  return !!changes&&record(newPlayEvent({kind:'module',hunterAction,moduleData:{module:HUNTER_MODULE,changes}}));
 };
 const power=hunterCard(entries,'dark-power');
 const attackDamage=Math.max(1,(power===HUNTER_POWERS[3].name?3:2)-(hunterCard(entries,'finale')==='Adaptive A.I.'&&s.phase==='mark-x'?1:0));
 const models=[{id:'mark-v',title:'Mark V',image:s.ally==='destroyed'?'mark-v-destroyed':s.ally==='alive'?'mark-v-ally':s.phase==='mark-v'?'mark-v':'mark-v-shutdown',
  status:s.phase==='unknown'?'Unrecorded':s.phase==='mark-v'?'Active Killer':s.ally==='alive'?`Ally · ${s.allyHealth} HP`:s.ally==='destroyed'?'Permanently destroyed':'Shut down · Unrepaired'},
 {id:'mark-x',title:'Mark X',image:'mark-x',status:s.phase==='mark-x'?'Active Killer':s.phase==='unknown'?'Unrecorded':s.phase==='countdown'?`Countdown · ${s.countdown??'?'} remaining`:'Not in play'}];
 return <section className="play-hunter" aria-label="Hunter tracking">
  <div className="hunter-models">
   {models.map(model=><article key={model.id} aria-label={model.title} className="hunter-model" data-active={s.phase===model.id||model.id==='mark-v'&&s.ally==='alive'}>
    <div className="hunter-model-photo"><ModuleArtwork art={hunterArt(model.image)}/></div>
    <div className="hunter-model-caption"><h3>{model.title}</h3><p>{model.status}</p></div>
   </article>)}
  </div>
  {s.phase==='unknown'?<details className="hunter-recovery"><summary>Record current Hunter state</summary>
   <label>Active model<PlaySelect aria-label="Current Hunter model" value={legacyPhase} onChange={e=>{const phase=e.target.value as typeof legacyPhase;setLegacyPhase(phase);setLegacyParts(phase==='mark-v'?'':'0');setLegacyCountdown(phase==='mark-x'?'0':'');}}><option value="mark-v">Mark V</option><option value="countdown">Shut down · Countdown</option><option value="mark-x">Mark X</option></PlaySelect></label>
   <label>Parts remaining<input type="number" min="0" max="20" value={legacyParts} onChange={e=>setLegacyParts(e.target.value)}/></label>
   <label>Countdown remaining<input type="number" min="0" max="2" value={legacyCountdown} onChange={e=>setLegacyCountdown(e.target.value)}/></label>
   <label>Mark V state<PlaySelect aria-label="Current Mark V state" value={legacyAlly} onChange={e=>setLegacyAlly(e.target.value as typeof legacyAlly)}><option value="unrepaired">Unrepaired</option><option value="alive">Repaired Ally</option><option value="destroyed">Permanently destroyed</option></PlaySelect></label>
   {legacyAlly==='alive'&&<label>Ally Health<input type="number" min="1" max="99" value={legacyHealth} onChange={e=>setLegacyHealth(e.target.value)}/></label>}
   <button className="hunter-action" disabled={blocked} onClick={()=>act({command:'recover',phase:legacyPhase,remaining:Number(legacyParts),countdown:Number(legacyCountdown),ally:legacyAlly,health:Number(legacyHealth)})}>Record observed state</button>
  </details>:<>
   {s.phase==='mark-v'&&<section className="hunter-part-damage" aria-label="Cybernetic Parts">
    <h3>Cybernetic Parts <span>{s.remaining??'?'} remaining</span></h3>
    <form onSubmit={e=>{e.preventDefault();act({command:'damage',value:Number(damage)});}}>
     <label>Damage<input aria-label="Damage to Cybernetic Parts" type="number" min="1" max="99" value={damage} onChange={e=>setDamage(e.target.value)}/></label>
     <button className="hunter-action" disabled={blocked}>Apply part damage</button>
    </form>
    {s.damage!==null&&s.damage>0&&<div className="hunter-quiet-row"><span>{s.damage}/{power===HUNTER_POWERS[0].name?3:2} damage toward next Part</span><button className="hunter-action" disabled={blocked} onClick={()=>act({command:'end-action'})}>End Action phase · clear partial damage</button></div>}
    <button className="module-unnamed" disabled={blocked} onClick={()=>act({command:'reboot'})}>System Reboot · add a Part</button>
   </section>}
   {s.phase==='mark-x'&&<button className="module-unnamed" disabled={blocked} onClick={()=>act({command:'reboot'})}>System Reboot · recover 4 Mark X Health</button>}
   {s.phase==='countdown'&&<button className="hunter-countdown" disabled={blocked} onClick={()=>act({command:'countdown'})}>Remove next Countdown token · {s.countdown??'?'} remaining</button>}
   {!s.forced&&<details className="hunter-forced"><summary>Hunter Mark X · special Terror</summary><p>{s.phase==='mark-v'?'Shut down Mark V, drop its remaining Parts and raise Bloodlust to 10. ':''}Bring in Mark X if absent, discard remaining Terror/Countdown cards and reveal the Finale. Use a new physical Setup card for its placement.</p><button className="hunter-action" disabled={blocked} onClick={()=>act({command:'force-mark-x'})}>Resolve Hunter Mark X</button></details>}
   {s.parts.length>0&&<section className="hunter-parts" aria-label="Recovered Cybernetic Parts"><h3>Cybernetic Parts</h3><div className="hunter-parts-list">{s.parts.map(p=><div key={p.id} className="hunter-part" data-status={p.status}>
    <span>Part {p.id} · {p.status==='on-board'?'On board':p.status==='backpack'?'Backpack':`Installed · ${p.health??'?'} HP`}</span>
    {p.status==='on-board'&&<button className="hunter-action" disabled={blocked} onClick={()=>act({command:'pickup',part:p.id})}>Retrieve Part {p.id} · 1 Time</button>}
    {p.status==='backpack'&&<><button className="module-unnamed" disabled={blocked} onClick={()=>act({command:'drop',part:p.id})}>Drop Part {p.id}</button>{s.phase!=='mark-v'&&s.ally!=='destroyed'&&<button className="hunter-action" disabled={blocked} onClick={()=>{setRepairPart(p.id);setRepairValue('');}}>Install Part {p.id}</button>}</>}
   </div>)}</div>
    {repairPart!==undefined&&<form className="hunter-repair" onSubmit={e=>{e.preventDefault();if(act({command:'repair',part:repairPart,value:Number(repairValue)}))setRepairPart(undefined);}}><label>Part {repairPart} printed Health<input aria-label="Part printed Health" type="number" min="1" max="99" required value={repairValue} onChange={e=>setRepairValue(e.target.value)}/></label><p>In Mark V’s space · spend 1 Time{power===HUNTER_POWERS[0].name?' · Bio Tissue adds 1 Health':''}</p><button className="hunter-action" disabled={blocked}>Repair Mark V</button><button type="button" className="module-unnamed" onClick={()=>setRepairPart(undefined)}>Cancel</button></form>}
   </section>}
   {s.ally==='alive'&&<section className="hunter-ally-actions" aria-label="Mark V Ally actions"><div className="hunter-ally-heading"><h3>Mark V · Ally</h3><div><button className="hunter-action" aria-label="Decrease Mark V Ally Health" disabled={blocked} onClick={()=>act({command:'ally-health',value:s.allyHealth!-1})}>−</button><span>{s.allyHealth} HP</span><button className="hunter-action" aria-label="Increase Mark V Ally Health" disabled={blocked||s.allyHealth===99} onClick={()=>act({command:'ally-health',value:s.allyHealth!+1})}>+</button></div></div>
    <div className="hunter-cooldowns">{HUNTER_ACTIONS.map(a=><button className="hunter-action" key={a.id} disabled={blocked||s.cooldowns[a.id]!==0} onClick={()=>act({command:'use',action:a.id})}><strong>{a.id==='attack'?`Attack · ${attackDamage} damage`:a.name}</strong><span>{s.cooldowns[a.id]===0?'Ready':s.cooldowns[a.id]===null?'Cooldown unrecorded':`${s.cooldowns[a.id]} Upkeep${s.cooldowns[a.id]===1?'':'s'} remaining`}</span></button>)}</div>
    {Object.values(s.cooldowns).some(v=>v===null)&&<details className="hunter-recovery"><summary>Record observed Ally cooldowns</summary>{HUNTER_ACTIONS.filter(a=>s.cooldowns[a.id]===null).map(a=><label key={a.id}>{a.name}<PlaySelect aria-label={`Record ${a.id} cooldown`} disabled={blocked} value="" onChange={e=>act({command:'cooldown',action:a.id,value:Number(e.target.value)})}><option value="" disabled>Unrecorded</option>{Array.from({length:a.cooldown+1},(_,n)=><option key={n} value={n}>{n===0?'Ready':`${n} Upkeep${n===1?'':'s'} remaining`}</option>)}</PlaySelect></label>)}</details>}
    <button className="hunter-action" disabled={blocked||!Object.values(s.cooldowns).some(v=>typeof v==='number'&&v>0)} onClick={()=>act({command:'upkeep'})}>Ally Upkeep · advance cooldowns</button>
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
