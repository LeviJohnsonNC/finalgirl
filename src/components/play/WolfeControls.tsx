import {useState} from 'react';
import {FEATURE_FILMS} from '@/types/gameData';
import {observedFinalGirlMaxHealth} from '@/data/finalGirlReferences';
import {getFinalGirlHealth} from '@/data/finalGirlHealth';
import {newPlayEvent,summarizePlay} from '@/lib/play/events';
import {moduleState} from '@/lib/play/modules';
import {PILL_COLORS,WOLFE_AMPED,WOLFE_EVENTS,WOLFE_MODULE,WOLFE_ONGOING,WOLFE_PEOPLE,WOLFE_RECIPES,type PillColor,type Pills} from '../../../supabase/functions/_shared/play/wolfeCatalog';
import {ampKey,emptyPills,resolveWolfe,validPillCount,wolfeAmped,wolfeCasualties,wolfeParent,wolfePillHorrorReduction,wolfePills,wolfeRecipeOptions,wolfeRiders,type WolfeCommand} from '../../../supabase/functions/_shared/play/wolfe';
import {CharacterControl} from './CharacterControl';
import {EventControl} from './EventControl';
import {IllustratedTile} from './IllustratedTile';
import {ModuleArtwork} from './ModuleArtwork';
import {PlaySelect} from './PlaySelect';
import {useModuleRecord} from './useModuleRecord';
import {wolfeArt} from './wolfeArt';
import pillPhoto from '@/assets/play/photos/wolfe/tablet.webp';
import type {ControlsProps} from './moduleDefinitions';
import '@/styles/play-wolfe.css';

const colorName=(color:string)=>color[0].toUpperCase()+color.slice(1);
const outcomes=[
  {value:'present',label:'In play'},{value:'saved',label:'Saved'},
  {value:'killed',label:'Killed'},{value:'left',label:'Left play'},
] as const;
const personOutcomes=['saved','killed','left'];
const eventName=(id:string)=>WOLFE_EVENTS.find(event=>event.id===id)!.name;

function Tablet({color}:{color:PillColor}) {
  return <i className="wolfe-tablet" data-color={color} aria-hidden="true">
    <img src={pillPhoto} alt=""/>
    {color==='wild'&&<><img src={pillPhoto} alt=""/><img src={pillPhoto} alt=""/></>}
  </i>;
}

export function WolfeControls({events,onEvent,onDeath,blocked,killer,finalGirl,finalGirlStartingHealth}:ControlsProps) {
  const summary=summarizePlay(events);
  const {entries}=summary;
  const state=moduleState(entries,WOLFE_MODULE);
  const held=wolfePills(state);
  const {record,message}=useModuleRecord(events,onEvent);
  const [inventory,setInventory]=useState<Pills>();
  const [recipes,setRecipes]=useState(false);
  const [recipe,setRecipe]=useState('');
  const [ampedPicker,setAmpedPicker]=useState(false);
  const [ampDetail,setAmpDetail]=useState('');
  const [eventsPicker,setEventsPicker]=useState(false);
  const [gurneyPanel,setGurneyPanel]=useState(false);
  const [receipt,setReceipt]=useState<{id:string;text:string}>();
  const shownPills=held??inventory;
  const canEat=!!held&&Object.values(held).some(Boolean);
  const selectedRecipe=WOLFE_RECIPES.find(card=>card.id===recipe);
  const payment=held?wolfeRecipeOptions(held,recipe):[];
  const amped=wolfeAmped(state);
  const activeAmped=WOLFE_AMPED.filter(card=>state[ampKey(card.id)]);
  const gurney=state.gurney;
  const lastGurneyOutcome=[...entries].reverse().find(entry=>entry.wolfeAction?.command==='ram'||entry.wolfeAction?.command==='spent');
  const rammed=lastGurneyOutcome?.wolfeAction?.command==='ram';
  const linkedDeath=rammed&&lastGurneyOutcome?.kind==='killed'?lastGurneyOutcome:undefined;
  const gurneyActive=wolfeRiders(gurney)||gurney==='unknown';
  const maxHealth=observedFinalGirlMaxHealth(finalGirl,events,finalGirlStartingHealth??getFinalGirlHealth(finalGirl),killer);

  function commit(command:WolfeCommand) {
    if(blocked) return false;
    const action={...command,parent:wolfeParent(entries)};
    const changes=resolveWolfe(action,state,entries);
    if(!changes) return false;
    const moduleData={module:WOLFE_MODULE,changes} as const;
    const casualties=wolfeCasualties(action);
    const event=newPlayEvent(casualties?{kind:'killed',quantity:casualties,cause:'event',eventCard:'Hospital Gurney',
      mechanism:'Hospital Gurney ram',wolfeReference:true,wolfeAction:action,moduleData}:{kind:'module',wolfeAction:action,moduleData});
    return record(event)?event.id:false;
  }

  function adjustPill(color:PillColor,change:1|-1) {
    if(held) return commit({command:change===1?'pickup':'remove-pill',color});
    const next={...(inventory??emptyPills()),[color]:(inventory?.[color]??0)+change};
    if(state.startingPill) return commit({command:'inventory',pills:next});
    setInventory(next);
  }

  function eatPills(wildFor?:Exclude<PillColor,'wild'>) {
    if(!selectedRecipe) return;
    const healing=recipe==='yellow'||recipe==='yellow-blue';
    const horror=wolfePillHorrorReduction(recipe);
    const horrorBefore=summary.finalHorrorLevel;
    const bonusTime=horrorBefore===undefined?0:Math.max(0,horror-horrorBefore);
    const manual=healing&&(maxHealth===undefined||recipe==='yellow'&&summary.finalGirlHealth===undefined)
      ||horror&&summary.finalHorrorLevel===undefined;
    const draws=selectedRecipe.draws+(state['active.powerful-meds']?1:0);
    const id=commit({command:'eat',recipe,wildFor,...(healing&&maxHealth!==undefined&&{maxHealth})});
    if(!id) return;
    const benefit=manual||recipe==='blue'||recipe==='yellow-pink'?`${selectedRecipe.benefit} on the board`:undefined;
    const text=[benefit,
      bonusTime?`Gain ${bonusTime} Time on the board`:undefined,
      draws?`Draw ${draws} Side Effects ${draws===1?'card':'cards'}`:undefined,
    ].filter(Boolean).join(' · ');
    setReceipt({id,text});
    setRecipe('');
    setRecipes(false);
    if(recipe==='amped')setAmpedPicker(true);
  }

  return <div className="wolfe-controls">
    <section aria-label="Pills">
      <h3>Pills</h3>
      <div className="wolfe-pill-tray">
        <div className="wolfe-tray-surface" aria-hidden="true">
          <ModuleArtwork art={wolfeArt('medical-tray')}/>
          <div className="wolfe-pill-slots">
            {PILL_COLORS.map(color=><div key={color} className="wolfe-pill-stack">
              {Array.from({length:shownPills?.[color]??0},(_,index)=><Tablet key={index} color={color}/>)}
            </div>)}
          </div>
        </div>
        {!held&&!inventory&&<small className="wolfe-tray-unknown">{state.startingPill?'Starting pill unrecorded':'Held pills unrecorded'}</small>}
      </div>
      <div className="wolfe-pill-counts">{PILL_COLORS.map(color=>{
        const count=shownPills?.[color];
        return <div className="wolfe-pill-count" key={color}>
          <span><Tablet color={color}/>{colorName(color)}</span>
          <div className="wolfe-stepper">
            <button type="button" disabled={blocked||!count} aria-label={`Remove ${color} pill`} onClick={()=>adjustPill(color,-1)}>−</button>
            <output aria-label={`${colorName(color)} held pills`}>{count??'?'}</output>
            <button type="button" disabled={blocked||!validPillCount(color,(count??0)+1)} aria-label={`Add ${color} pill`} onClick={()=>adjustPill(color,1)}>+</button>
          </div>
        </div>;
      })}</div>
      <div className="wolfe-row">
        {!held&&!state.startingPill&&<button disabled={blocked} onClick={()=>{
          if(commit({command:'inventory',pills:inventory??emptyPills()}))setInventory(undefined);
        }}>{inventory?'Save held pills':'Record empty tray'}</button>}
        <button disabled={blocked||!canEat} aria-expanded={canEat&&recipes} onClick={()=>{setRecipes(!recipes);setRecipe('');}}>Eat pills</button>
      </div>
      {held&&canEat&&recipes&&<div className="wolfe-recipes" aria-label="Available pill recipes">
        {WOLFE_RECIPES.map(card=>{
          const options=wolfeRecipeOptions(held,card.id);
          if(!options.length) return null;
          const colors=card.colors.map(color=>color===options[0]?'wild':color);
          return <button key={card.id} aria-pressed={card.id===recipe} aria-description={colors.map(colorName).join(' + ')}
            onClick={()=>setRecipe(card.id===recipe?'':card.id)}>
            <span>{colors.map(color=><Tablet key={color} color={color}/>)}</span>
            <strong>{card.benefit}</strong>
          </button>;
        })}
        {selectedRecipe&&payment.length>0&&<div className="wolfe-preview">
          <p>{selectedRecipe.benefit} · {selectedRecipe.draws+(state['active.powerful-meds']?1:0)} Side Effects</p>
          <div className="wolfe-row">{payment.map(wildFor=><button key={wildFor??'exact'} disabled={blocked} onClick={()=>eatPills(wildFor)}>
            {wildFor?`Eat Wild as ${colorName(wildFor)}`:'Confirm eating'}
          </button>)}</div>
        </div>}
      </div>}
      {receipt?.text&&entries.some(entry=>entry.id===receipt.id)&&<p role="status" className="wolfe-receipt">{receipt.text}</p>}
    </section>

    <section aria-label="Amped and Hospital Gurney">
      <div className="wolfe-grid">
        <article className="wolfe-feature">
          <IllustratedTile className="module-control-tile" art={wolfeArt('amped')} title="Amped" status={amped?'Active':'Inactive'}
            data-muted={!amped||undefined} disabled={blocked} aria-label="Amped" aria-pressed={amped} onClick={()=>{
              if(commit({command:'toggle-amped',active:!amped}))setAmpedPicker(!amped&&!activeAmped.length);
            }}/>
          {amped&&<div className="wolfe-row"><button className="module-quiet-link" aria-expanded={ampedPicker} onClick={()=>setAmpedPicker(!ampedPicker)}>
            {ampedPicker?'Hide Amped cards':'Choose Amped cards'}
          </button></div>}
        </article>
        <article className="wolfe-feature">
          <IllustratedTile className="module-control-tile" art={wolfeArt(gurney==='spent'?'gurney-spent':`gurney-${wolfeRiders(gurney)?gurney:0}`)} title="Hospital Gurney"
            status={gurney==='spent'?rammed?'Rammed':'Spent':gurney==='unknown'?'Riders unrecorded':wolfeRiders(gurney)?`${gurney} ${gurney===1?'rider':'riders'}`:'Unrecorded'}
            data-muted={gurney===undefined||undefined} aria-expanded={gurneyPanel} disabled={blocked&&gurney===undefined}
            aria-label={gurney===undefined?'Add Hospital Gurney':undefined}
            onClick={()=>{
              if(gurney===undefined) {
                if(commit({command:'gurney',riders:0}))setGurneyPanel(true);
              } else setGurneyPanel(!gurneyPanel);
            }}/>
          {gurneyPanel&&<div className="wolfe-feature-actions">
            {gurneyActive&&<>
              {wolfeRiders(gurney)?<div className="wolfe-riders">
                <span>Victims aboard</span>
                <div className="wolfe-stepper">
                  <button disabled={blocked||gurney===0} aria-label="Remove a victim from the gurney" onClick={()=>commit({command:'gurney',riders:gurney-1})}>−</button>
                  <output aria-label="Gurney riders">{gurney}</output>
                  <button disabled={blocked||gurney===2} aria-label="Add a victim to the gurney" onClick={()=>commit({command:'gurney',riders:gurney+1})}>+</button>
                </div>
              </div>:<div className="wolfe-row">{[0,1,2].map(count=><button key={count} disabled={blocked} onClick={()=>commit({command:'gurney',riders:count})}>{count} aboard</button>)}</div>}
              {wolfeRiders(gurney)&&<div className="wolfe-row">
                <small>{1+gurney} damage to the Enemy{gurney>0&&` · ${gurney} ${gurney===1?'rider dies':'riders die'}`}</small>
                <button disabled={blocked} onClick={()=>commit({command:'ram',riders:gurney})}>Confirm ram</button>
              </div>}
              <button className="module-quiet-link" disabled={blocked} onClick={()=>commit({command:'spent'})}>Mark spent</button>
            </>}
            {gurney==='spent'&&linkedDeath&&onDeath&&<button className="module-quiet-link" onClick={()=>onDeath(linkedDeath)}>Open Gruesome Death</button>}
          </div>}
        </article>
      </div>
      {ampedPicker&&<div className="wolfe-grid wolfe-choices" aria-label="Amped cards">
        <h4 className="wolfe-amped-picker-title">Choose the Amped card you drew</h4>
        {WOLFE_AMPED.filter(card=>!state[ampKey(card.id)]).map(card=>
          <IllustratedTile className="module-control-tile" key={card.id} art={wolfeArt(card.id)} title={card.name} status=""
            data-muted disabled={blocked} onClick={()=>{
              if(commit({command:'amped',id:card.id,active:true,...(!amped&&{enable:true})}))setAmpedPicker(false);
            }}/>
        )}
        {activeAmped.length===WOLFE_AMPED.length&&<small>All five cards recorded</small>}
      </div>}
      {amped&&activeAmped.length>0&&<div className="wolfe-grid">
        {activeAmped.map(card=><article key={card.id}>
          <IllustratedTile className="module-control-tile" art={wolfeArt(card.id)} title={card.name} status={card.id==='final-girl-2'&&state.secondUltimate?`${state.secondUltimate}’s Ultimate`:'Active'}
            aria-expanded={ampDetail===card.id} onClick={()=>setAmpDetail(ampDetail===card.id?'':card.id)}/>
          {ampDetail===card.id&&<div className="wolfe-row">
            {card.id==='final-girl-2'&&<PlaySelect aria-label="Second Ultimate" disabled={blocked} value={String(state.secondUltimate??'')}
              onChange={event=>commit({command:'ultimate',name:event.target.value||null})}>
              <option value="">Choose another Final Girl</option>
              {[...new Set(FEATURE_FILMS.flatMap(film=>[...film.finalGirls]))].filter(name=>name!==finalGirl).sort().map(name=><option key={name}>{name}</option>)}
            </PlaySelect>}
            <button className="module-quiet-link" disabled={blocked} onClick={()=>commit({command:'amped',id:card.id,active:false})}>Clear record</button>
          </div>}
        </article>)}
      </div>}
    </section>
    <section aria-label="Asylum events">
      <div className="wolfe-heading">
        <h3>Events</h3>
        <button className="module-quiet-link" aria-expanded={eventsPicker} onClick={()=>setEventsPicker(!eventsPicker)}>
          {eventsPicker?'Hide unrecorded':'Record an event'}
        </button>
      </div>
      <div className="wolfe-grid">
        {WOLFE_ONGOING.map(id=>
          <EventControl key={id} className={eventsPicker||state['active.'+id]!==undefined?'':'hidden'} name={eventName(id)} art={wolfeArt(id==='madhouse'?(state['active.'+id]?'madhouse':'madhouse-clear'):id)}
            value={state['active.'+id]?'active':state['active.'+id]===false?'ended':undefined} interaction="toggle" allowed={!blocked}
            onActivate={()=>commit({command:'event',id,active:true})}
            onEnd={()=>commit({command:'event',id,active:false})} onClear={()=>commit({command:'event',id,active:false})}/>)}
        {WOLFE_PEOPLE.map(id=>{
          const status=state['person.'+id] as typeof outcomes[number]['value']|undefined;
          return <CharacterControl key={id} className={eventsPicker||status?'':'hidden'} name={eventName(id)}
            art={wolfeArt(status==='saved'||status==='killed'?id+'-'+status:id)} present="present" states={outcomes}
            value={status} showRules={false} showStatusEditor={false} outcomes={personOutcomes} allowOutcomeCorrections
            onChange={value=>{if(value)commit({command:'person',id,status:value as typeof outcomes[number]['value']});}}/>;
        })}
      </div>
    </section>
    {message&&<p role="status">{message}</p>}
  </div>;
}
