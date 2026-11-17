import {useState} from 'react';
import {FEATURE_FILMS} from '@/types/gameData';
import {newPlayEvent,summarizePlay} from '@/lib/play/events';
import {INTRUDERS,INTRUDER_MODULE,INTRUDER_ROSTER,intruderFigure} from '@/lib/play/intruders';
import {ORGANISM,ORGANISM_MODULE,organismLiving,organismColorLabel} from '@/lib/play/organism';
import {moduleState} from '@/lib/play/modules';
import {PILL_COLORS,WOLFE_AMPED,WOLFE_EVENTS,WOLFE_MODULE,WOLFE_ONGOING,WOLFE_PEOPLE,WOLFE_RECIPES,type Pills} from '../../../supabase/functions/_shared/play/wolfeCatalog';
import {ampKey,emptyPills,resolveWolfe,validPillCount,wolfeCasualties,wolfeParent,wolfePills,wolfeRecipeOptions,wolfeRiders,type WolfeCommand} from '../../../supabase/functions/_shared/play/wolfe';
import {CharacterControl} from './CharacterControl';
import {EventControl} from './EventControl';
import {IllustratedTile} from './IllustratedTile';
import {ModuleArtwork} from './ModuleArtwork';
import {PlaySelect} from './PlaySelect';
import {useModuleRecord} from './useModuleRecord';
import {wolfeArt} from './wolfeArt';
import type {ControlsProps} from './moduleDefinitions';
import '@/styles/play-wolfe.css';

const colorName=(color:string)=>color[0].toUpperCase()+color.slice(1);
const outcomes=[
  {value:'present',label:'In play'},{value:'saved',label:'Saved'},
  {value:'killed',label:'Killed'},{value:'left',label:'Left play'},
] as const;
const eventName=(id:string)=>WOLFE_EVENTS.find(event=>event.id===id)!.name;

export function WolfeControls({events,onEvent,onDeath,blocked,killer,finalGirl}:ControlsProps) {
  const entries=summarizePlay(events).entries;
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
  const [showStun,setShowStun]=useState(false);
  const [enemy,setEnemy]=useState('killer');
  const [stunCount,setStunCount]=useState(1);
  const selectedRecipe=WOLFE_RECIPES.find(card=>card.id===recipe);
  const payment=held?wolfeRecipeOptions(held,recipe):[];
  const activeAmped=WOLFE_AMPED.filter(card=>state[ampKey(card.id)]);
  const gurney=state.gurney;
  const tookPills=entries.some(e=>e.wolfeAction?.command==='spend'&&e.wolfeAction.recipe==='amped');
  const linkedDeath=[...entries].reverse().find(e=>e.kind==='killed'&&e.wolfeAction?.command==='ram');
  const stuns=Object.entries(state).filter(([key,value])=>key.startsWith('stun.')&&value);
  const namedEnemies=killer===INTRUDERS
    ? INTRUDER_ROSTER.filter(item=>!['dead','pending','reboot','escaped'].includes(intruderFigure(moduleState(entries,INTRUDER_MODULE),item.id).token??'')).map(item=>({id:item.id,label:item.name}))
    : killer===ORGANISM
      ? organismLiving(moduleState(entries,ORGANISM_MODULE)).map(figure=>({id:figure.who,label:organismColorLabel(figure.who)+' Organism'}))
      : [{id:'killer',label:killer}];
  const enemyChoices=[...namedEnemies,killer==='Ratchet Lady'?{id:'maniacs',label:'Maniacs'}:{id:'other-enemies',label:'Other Enemies'}];
  const selectedEnemy=enemyChoices.some(item=>item.id===enemy)?enemy:enemyChoices[0].id;
  const enemyLabel=(id:string)=>enemyChoices.find(item=>item.id===id)?.label??id.split('-').map(colorName).join(' ');

  function commit(command:WolfeCommand) {
    if(blocked) return false;
    const action={...command,parent:wolfeParent(entries)};
    const changes=resolveWolfe(action,state,entries);
    if(!changes) return false;
    const moduleData={module:WOLFE_MODULE,changes} as const;
    const casualties=wolfeCasualties(action);
    return record(newPlayEvent(casualties?{kind:'killed',quantity:casualties,cause:'event',eventCard:'Hospital Gurney',
      mechanism:'Hospital Gurney ram',wolfeReference:true,wolfeAction:action,moduleData}:{kind:'module',wolfeAction:action,moduleData}));
  }

  return <div className="wolfe-controls">
    <section aria-label="Pills">
      <div className="wolfe-pill-photo">
        <ModuleArtwork art={wolfeArt(!held?'pill-unknown':Object.values(held).some(Boolean)?'pill-held':'pill-empty')}/>
        <div className="wolfe-pill-caption"><h3>Pills</h3>{!held&&<small>{state.startingPill?'Starting pill unrecorded':'Held pills unrecorded'}</small>}</div>
      </div>
      {!held&&(state.startingPill&&!inventory?
        <div className="wolfe-row" aria-label="Starting pill color">{PILL_COLORS.map(color=>
          <button key={color} disabled={blocked} onClick={()=>commit({command:'inventory',pills:{...emptyPills(),[color]:1}})}>
            <i className="wolfe-pill" data-color={color}/>{colorName(color)}
          </button>)}</div>:
        <button className="module-quiet-link" onClick={()=>setInventory(inventory?undefined:emptyPills())}>Record held pills</button>)}
      {held&&!inventory&&<div className="wolfe-pill-counts">{PILL_COLORS.map(color=><div className="wolfe-pill-count" key={color}>
        <span><i className="wolfe-pill" data-color={color}/>{colorName(color)}</span>
        <output aria-label={colorName(color)+' held pills'}>{held[color]}</output>
        <button disabled={blocked||!validPillCount(color,held[color]+1)} aria-label={'Record '+color+' pill pickup'}
          onClick={()=>commit({command:'pickup',color})}>+</button>
      </div>)}</div>}
      {inventory&&<form className="wolfe-form" onSubmit={event=>{
        event.preventDefault();
        if(commit({command:'inventory',pills:inventory}))setInventory(undefined);
      }}>
        <div className="wolfe-pill-counts">{PILL_COLORS.map(color=><label className="wolfe-pill-count" key={color}>
          <span><i className="wolfe-pill" data-color={color}/>{colorName(color)}</span>
          <PlaySelect aria-label={colorName(color)+' pill count'} value={String(inventory[color])} onChange={event=>setInventory({...inventory,[color]:+event.target.value})}>
            {Array.from({length:color==='wild'?2:4},(_,i)=><option key={i}>{i}</option>)}
          </PlaySelect>
        </label>)}</div>
        <div className="wolfe-row"><button disabled={blocked} type="submit">Save held pills</button><button type="button" onClick={()=>setInventory(undefined)}>Cancel</button></div>
      </form>}
      {held&&!inventory&&<div className="wolfe-row wolfe-pill-actions">
        <button disabled={!Object.values(held).some(Boolean)} aria-expanded={recipes} onClick={()=>{setRecipes(!recipes);setRecipe('');}}>Spend pills</button>
        <button className="module-quiet-link" onClick={()=>{setInventory(held);setRecipes(false);}}>Correct held pills</button>
      </div>}
      {held&&recipes&&<div className="wolfe-recipes" aria-label="Pill recipes">
        <div className="wolfe-recipe-photo" aria-hidden="true"><ModuleArtwork art={wolfeArt('pill-reference')}/></div>
        {WOLFE_RECIPES.filter(card=>wolfeRecipeOptions(held,card.id).length).map(card=><button key={card.id}
          aria-pressed={card.id===recipe} onClick={()=>setRecipe(card.id===recipe?'':card.id)}>
          <span>{card.colors.map(color=><i key={color} className="wolfe-pill" data-color={color} title={colorName(color)}/>)}</span>
          <strong>{card.benefit}</strong>
        </button>)}
        {selectedRecipe&&payment.length>0&&<div className="wolfe-preview">
          <p>{selectedRecipe.benefit} · {selectedRecipe.draws+(state['active.powerful-meds']?1:0)} Side Effects</p>
          <div className="wolfe-row">{payment.map(wildFor=><button key={wildFor??'exact'} disabled={blocked} onClick={()=>{
            if(commit({command:'spend',recipe,wildFor})) {
              setRecipe('');setRecipes(false);
              if(recipe==='amped')setAmpedPicker(true);
            }
          }}>{wildFor?`Spend Wild as ${colorName(wildFor)}`:'Confirm spend'}</button>)}</div>
        </div>}
      </div>}
    </section>

    <section aria-label="Amped">
      <div className="wolfe-heading">
        <h3>Amped</h3>
        <button className="module-quiet-link" aria-expanded={ampedPicker} onClick={()=>setAmpedPicker(!ampedPicker)}>
          {ampedPicker?'Hide choices':activeAmped.length?'Record another Amped':'Record Amped'}
        </button>
      </div>
      {ampedPicker&&<div className="wolfe-grid wolfe-choices">
        {WOLFE_AMPED.filter(card=>!state[ampKey(card.id)]).map(card=><IllustratedTile className="module-control-tile" key={card.id} art={wolfeArt(card.id)} title={card.name}
          status="" disabled={blocked} onClick={()=>{if(commit({command:'amped',id:card.id,active:true}))setAmpedPicker(false);}}/>)}
        {activeAmped.length===WOLFE_AMPED.length&&<small>All five cards recorded</small>}
      </div>}
      {tookPills&&!activeAmped.length&&!ampedPicker&&<small className="wolfe-muted">Record the revealed card when ready.</small>}
      <div className="wolfe-grid">
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
      </div>
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
          const available=id==='dr-death'?['killed','left']:['saved','killed','left'];
          return <CharacterControl key={id} className={eventsPicker||status?'':'hidden'} name={eventName(id)}
            art={wolfeArt(status==='saved'||status==='killed'?id+'-'+status:id)} present="present" states={outcomes}
            value={status} showRules={false} showStatusEditor={false} outcomes={available} allowOutcomeCorrections
            onChange={value=>{if(value)commit({command:'person',id,status:value as typeof outcomes[number]['value']});}}/>;
        })}
        {(eventsPicker||gurney!==undefined)&&<article className="wolfe-gurney">
          <IllustratedTile className="module-control-tile" art={wolfeArt(gurney==='spent'?'gurney-spent':`gurney-${wolfeRiders(gurney)?gurney:0}`)} title="Hospital Gurney"
            status={gurney==='spent'?'Spent':wolfeRiders(gurney)?`${gurney} ${gurney===1?'rider':'riders'}`:gurney==='unknown'?'Riders unrecorded':'Unrecorded'}
            aria-expanded={gurneyPanel} onClick={()=>setGurneyPanel(!gurneyPanel)}/>
          {gurneyPanel&&<div className="wolfe-preview">
            {gurney!=='spent'&&<>
              <div className="wolfe-row">
                <PlaySelect aria-label="Gurney riders" disabled={blocked} value={wolfeRiders(gurney)?String(gurney):''}
                  onChange={event=>commit({command:'gurney',riders:event.target.value===''?null:+event.target.value})}>
                  <option value="">Riders unrecorded</option>
                  {[0,1,2].map(n=><option key={n} value={n}>{n} {n===1?'rider':'riders'}</option>)}
                </PlaySelect>
              </div>
              {wolfeRiders(gurney)&&<><p>{1+gurney} damage to the Enemy · {gurney} {gurney===1?'rider dies':'riders die'}</p>
                <button disabled={blocked} onClick={()=>commit({command:'ram',riders:gurney})}>Confirm ram</button></>}
              <button className="module-quiet-link" disabled={blocked} onClick={()=>commit({command:'spent'})}>Record as spent</button>
            </>}
            {gurney==='spent'&&linkedDeath&&onDeath&&<button className="module-quiet-link" onClick={()=>onDeath(linkedDeath)}>Open Gruesome Death</button>}
          </div>}
        </article>}
      </div>
    </section>
    <section aria-label="Stunned Enemies">
      <button className="module-quiet-link" aria-expanded={showStun} onClick={()=>setShowStun(!showStun)}>Stunned{stuns.length?` · ${stuns.reduce((total,[,value])=>total+Number(value),0)}`:''}</button>
      {showStun&&<div className="wolfe-stun">
        {stuns.map(([key,value])=><div className="wolfe-row" key={key}><span>{enemyLabel(key.slice(5))} · {value}</span>
          <button className="module-quiet-link" disabled={blocked} onClick={()=>commit({command:'stun',enemy:key.slice(5),count:0})}>Clear</button>
        </div>)}
        <div className="wolfe-row">
          <PlaySelect aria-label="Stunned Enemy" value={selectedEnemy} onChange={event=>{setEnemy(event.target.value);setStunCount(1);}}>
            {enemyChoices.map(choice=><option key={choice.id} value={choice.id}>{choice.label}</option>)}
          </PlaySelect>
          {['other-enemies','maniacs'].includes(selectedEnemy)&&<PlaySelect aria-label="Number of Stunned Enemies" value={String(stunCount)} onChange={event=>setStunCount(+event.target.value)}>
            {Array.from({length:selectedEnemy==='maniacs'?6:8},(_,i)=><option key={i}>{i+1}</option>)}
          </PlaySelect>}
          <button disabled={blocked} onClick={()=>commit({command:'stun',enemy:selectedEnemy,count:['maniacs','other-enemies'].includes(selectedEnemy)?stunCount:1})}>Record Stunned</button>
        </div>
        {!!stuns.length&&<button className="module-quiet-link" disabled={blocked} onClick={()=>commit({command:'clear-stun'})}>Clear at Upkeep</button>}
      </div>}
    </section>
    {message&&<p role="status">{message}</p>}
  </div>;
}
