import { useState } from 'react';
import { GRIMLASH_HARVEST,GRIMLASH_MINORS,harvestLevel,grimlashParent,resolveGrimlashAction,grimlashFatal,type GrimlashAction } from '@/lib/play/grimlash';
import { moduleState } from '@/lib/play/modules';
import { summarizePlay,newPlayEvent } from '@/lib/play/events';
import { useModuleRecord } from './useModuleRecord';
import { grimlashArt } from './grimlashArt';
import { ModuleArtwork } from './ModuleArtwork';
import { IllustratedTile } from './IllustratedTile';
import { MinorPowerGroup } from './MinorPowerGroup';
import { MinorPowerControl } from './MinorPowerControl';
import { KillerCards } from './KillerCards';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-grimlash.css';
export function GrimlashControls({events,onEvent,blocked}:ControlsProps) {
 const entries=summarizePlay(events).entries,s=moduleState(entries,'grimlash');
 const {record,message}=useModuleRecord(events,onEvent);
 const [editing,setEditing]=useState(false),[choosing,setChoosing]=useState<number|null>(null);
 const position=typeof s.position==='number'?s.position:undefined,level=harvestLevel(position);
 const action=(a:Omit<GrimlashAction,'parent'>)=>{const request={...a,parent:grimlashParent(entries)};const changes=resolveGrimlashAction(request,s,entries);if(changes)return record(newPlayEvent({kind:'module',grimlashAction:request,moduleData:{module:'grimlash',changes}}));return false;};
 const lostCards=(to:number)=>GRIMLASH_HARVEST.filter(c=>s[`kept.${c.level}`]===c.id&&c.level>(harvestLevel(to)??3));
 const next=position===undefined?0:Math.max(0,position-1);
 const dropping=lostCards(next);
 return <section className="play-grimlash" aria-label="Grimlash tracking">
  <section className="grim-track" aria-label="Harvest Madness tracking" data-position={position??'unknown'}>
   <div className="grim-track-photo" aria-hidden="true"><ModuleArtwork art={grimlashArt(`madness-${position??0}`)}/></div>
   <div className="grim-track-content"><p className="play-eyebrow">THE OLD ONE'S HARVEST</p><h3>Harvest Madness</h3><p className="grim-track-value">{position===undefined?'Not recorded':level===4?'Skull · game lost':`Level ${level}`} {position!==undefined&&<small>Position {position}/10</small>}</p>
   <div className="grim-position-grid" role="group" aria-label="Harvest Madness spaces">{Array.from({length:11},(_,i)=><button key={i} disabled={blocked} aria-label={`Harvest Madness position ${i}${i===10?' · Skull':''}`} aria-pressed={position===i} data-level={harvestLevel(i)} onClick={()=>action({command:'position',value:i})}>{i===10?'☠':i}</button>)}</div>
   <div className="grim-track-actions"><button disabled={blocked||position===undefined||position===0} aria-label="Decrease Harvest Madness" onClick={()=>action({command:'position',value:next})}>−</button><span>{position??'?'}</span><button disabled={blocked||position===10} aria-label="Increase Harvest Madness" onClick={()=>action({command:'position',value:position===undefined?0:position+1})}>+</button></div>
   {dropping.length>0&&position!==undefined&&<p className="grim-consequence">Reducing one space discards {dropping.map(c=>c.name).join(' and ')}.</p>}
   </div>
  </section>
  <button className="module-change-choice" aria-expanded={editing} onClick={()=>setEditing(!editing)}>Correct Madness record</button>
  {editing&&<div className="grim-corrections"><label>Observed position<select aria-label="Correct Harvest Madness position" disabled={blocked} value={position??'unknown'} onChange={e=>action({command:'position',value:e.target.value==='unknown'?null:Number(e.target.value),correction:true})}><option value="unknown">Not recorded</option>{Array.from({length:11},(_,i)=><option key={i} value={i}>{i===10?'Skull':`${i} · Level ${harvestLevel(i)}`}</option>)}</select></label><label>Loss record<select aria-label="Correct Grimlash loss" disabled={blocked} value={String(s.loss??'unknown')} onChange={e=>action({command:'loss',value:e.target.value,correction:true})}><option value="unknown">Not recorded</option><option value="none">No loss recorded</option><option value="skull">Reached skull</option><option value="telluric">Telluric Visions loss</option></select></label></div>}
  {grimlashFatal(s)&&<p role="status" className="grim-loss">Game lost · {s.loss==='skull'?'Harvest Madness reached the skull.':'Telluric Visions.'} Health remains as recorded.</p>}
  <div className="grim-kept" aria-label="Kept Harvest Madness abilities">{[1,2,3].filter(l=>level===undefined||level>=l).map(l=>{
   const card=GRIMLASH_HARVEST.find(c=>c.id===s[`kept.${l}`]);
   const face=s[`face.${l}`];
   return <section key={l} className="grim-kept-level" aria-label={`Level ${l} kept ability`}><h4>Level {l} ability</h4>
    {card&&<><IllustratedTile art={grimlashArt(card.id)} title={card.name} status={card.flip?(face==='spent'?'Spent':face==='ready'?'Ready':'Face not recorded'):'Passive'} aria-label={card.flip?`${card.name} · ${face??'face not recorded'}`:card.name} aria-pressed={card.flip?face==='ready':undefined} disabled={blocked||!card.flip} data-spent={face==='spent'} onClick={()=>action({command:'face',level:l,value:face==='ready'?'spent':'ready'})}/><button disabled={blocked} className="module-change-choice" onClick={()=>action({command:'card',level:l,value:null,correction:true})}>Clear ability name</button></>}
    {!card&&(choosing===l?<div className="grim-kept-options">{GRIMLASH_HARVEST.filter(c=>c.level===l).sort((a,b)=>a.name.localeCompare(b.name)).map(c=><IllustratedTile key={c.id} art={grimlashArt(c.id)} title={c.name} status="Record physically kept card" disabled={blocked} aria-label={`Keep ${c.name}`} onClick={()=>{if(action({command:'card',level:l,value:c.id}))setChoosing(null);}}/>)}</div>:<button className="grim-add-ability" disabled={blocked} onClick={()=>setChoosing(l)}>Record kept Level {l} ability</button>)}
   </section>;
  })}</div>
  {GRIMLASH_HARVEST.some(c=>c.flip&&s[`kept.${c.level}`]===c.id&&s[`face.${c.level}`]==='spent')&&<button className="grim-upkeep" disabled={blocked} onClick={()=>action({command:'upkeep'})}>Record Upkeep · ready spent abilities</button>}
  <section className="grim-minors"><h3>Minor Dark Powers</h3><MinorPowerGroup>{GRIMLASH_MINORS.map(c=><MinorPowerControl key={c.id} name={c.name} health={s[`minor.${c.id}.health`] as number|undefined} maxHealth={c.health} art={()=>grimlashArt(c.id)} heroArt={grimlashArt(c.id)} disabled={blocked} previouslyRevealed={entries.some(e=>e.moduleData?.module==='grimlash'&&typeof e.moduleData.changes[`minor.${c.id}.health`]==='number')} onChange={value=>action({command:'minor',id:c.id,value})}/>)}</MinorPowerGroup></section>
  <KillerCards killer="Grimlash" events={events} onEvent={onEvent} disabled={blocked}/>
  {message&&<p role="alert" className="play-module-error">{message}</p>}
 </section>;
}
