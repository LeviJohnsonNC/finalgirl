import {useState} from 'react';
import {Minus, Plus} from 'lucide-react';
import {
  ORGANISM, ORGANISM_COLORS, ORGANISM_FORMS, ORGANISM_MINORS, ORGANISM_MODULE,
  isOrganismCasualty, minorHealthKey, minorOwnerKey, organismBonus, organismColorLabel,
  organismFinale, organismLiving, organismParent, organismRevealEffects, organismRoster, resolveOrganismAction,
  type OrganismAction, type OrganismAssignment, type OrganismColor, type OrganismCommand, type OrganismForm,
} from '@/lib/play/organism';
import {newPlayEvent,summarizePlay,type PlayEvent} from '@/lib/play/events';
import {moduleState} from '@/lib/play/modules';
import {KillerCards} from './KillerCards';
import {MinorPowerGroup} from './MinorPowerGroup';
import {MinorPowerControl} from './MinorPowerControl';
import {PlaySelect} from './PlaySelect';
import {useModuleRecord} from './useModuleRecord';
import {organismArt} from './organismArt';
import type {ControlsProps} from './moduleDefinitions';
import '@/styles/play-organism.css';

type RecordProps = {events:PlayEvent[];onEvent:ControlsProps['onEvent'];disabled?:boolean};
function useOrganismRecord({events,onEvent}:RecordProps) {
  const summary=summarizePlay(events);
  const state=moduleState(summary.entries,ORGANISM_MODULE);
  const {record,message}=useModuleRecord(events,onEvent);
  const send=(command:OrganismCommand)=>{
    const organismAction:OrganismAction={...command,parent:organismParent(summary.entries)};
    const changes=resolveOrganismAction(organismAction,state,summary.entries);
    if(!changes) return false;
    const moduleData={module:ORGANISM_MODULE,changes} as const;
    return record(newPlayEvent(isOrganismCasualty(organismAction)&&organismAction.command==='safe'
      ? {kind:'killed',quantity:1,victim:`${organismColorLabel(organismAction.who)} Exposed Victim`,organismAction,moduleData}
      : {kind:'module',organismAction,moduleData}));
  };
  return {summary,state,send,message};
}
type Figure = ReturnType<typeof organismRoster>[number];
function figureStatus(figure:Figure) {
  if(figure.pending) return `${figure.form?.name??'Mutation'} · Final Health pending`;
  if(figure.token==='defeated') return `${figure.form?.name??'Mutation'} · Defeated`;
  if(figure.form) return figure.form.name;
  if(figure.status==='safe') return 'Safe';
  if(figure.status==='casualty') return 'Killed';
  return figure.status==='exposed'?'Exposed':'Unrecorded';
}
function formOptions(roster:Figure[],who?:OrganismColor) {
  return ORGANISM_FORMS.filter(form=>!roster.some(figure=>figure.who!==who&&figure.form?.id===form.id))
    .map(form=><option key={form.id} value={form.id}>{form.name}{form.id==='tough'?' · 7 HP':''}</option>);
}
export function OrganismRoster(props:RecordProps) {
  const {summary,state,send,message}=useOrganismRecord(props);
  const roster=organismRoster(state);
  const [focus,setFocus]=useState<OrganismColor>();
  const [source,setSource]=useState<'ordinary'|'forced'|'alone'>('ordinary');
  const [reveal,setReveal]=useState(false);
  const [correct,setCorrect]=useState(false);
  const [healthInput,setHealthInput]=useState<string>();
  const [effects,setEffects]=useState<string[]>();
  const figure=roster.find(item=>item.who===focus);
  const health=figure?.health;
  const minorHealth=figure&&ORGANISM_MINORS.some(card=>state[minorOwnerKey(card.id)]===figure.who&&Number(state[minorHealthKey(card.id)])>0);
  const name=figure&&organismColorLabel(figure.who);
  const select=(who:OrganismColor)=>{
    setFocus(who);
    setSource('ordinary');
    setReveal(false);
    setCorrect(false);
    setEffects(undefined);
    setHealthInput(undefined);
  };
  const record=(command:OrganismCommand)=>{if(send(command)) {setReveal(false);setCorrect(false);setHealthInput(undefined);return true;}return false;};
  return <section className="play-state play-state--organism" aria-label="The Organism roster">
    <div className="organism-portraits">
      {roster.map(item=>{
        const status=figureStatus(item);
        const art=organismArt(item.form?.id??`${item.who}-${item.status==='safe'?'safe':'exposed'}`);
        return <button type="button" key={item.who} aria-label={`${organismColorLabel(item.who)} · ${status}`}
          aria-pressed={focus===item.who} data-color={item.who} data-status={item.token==='defeated'?'defeated':item.status??'unknown'}
          onClick={()=>select(item.who)}>
          <img src={art.src} alt="" style={{objectPosition:art.position}} />
          <span><strong>{organismColorLabel(item.who)}</strong><small>{status}</small></span>
        </button>;
      })}
    </div>
    {organismBonus(state)&&<div className="organism-bonus" role="status">+1 Horror die</div>}
    {figure?.status==='exposed'&&!correct&&<div className="organism-actions" aria-label={`Test ${name} Exposed Victim`}>
      {source!=='ordinary'&&<p>{source==='forced'?'Forced by an effect':'Are We Alone?'}</p>}
      <div className="organism-action-row">
        <button type="button" disabled={props.disabled} onClick={()=>{
          if(source==='alone') setFocus(undefined);
          else if(record({command:'safe',who:figure.who,source})) setFocus(undefined);
        }}>Safe</button>
        <button type="button" disabled={props.disabled} onClick={()=>setReveal(!reveal)} aria-expanded={reveal}>Assimilated</button>
      </div>
      {reveal&&<PlaySelect aria-label="Revealed mutation" value="" onChange={event=>{
        const form=event.target.value as OrganismForm;
        if(record({command:'assimilate',who:figure.who,source,form}))
          setEffects(organismRevealEffects(form,summary.bloodlust)?.slice()??['Use the physical Bloodlust marker and resolve the new form’s entry effects from the bottom.']);
      }}><option value="" disabled>Choose the form revealed</option>{formOptions(roster)}</PlaySelect>}
      <details className="organism-secondary"><summary>Other test or correction</summary>
        <div className="organism-action-row">
          <button type="button" onClick={()=>setSource(source==='forced'?'ordinary':'forced')}>Forced by an effect</button>
          <button type="button" onClick={()=>setSource(source==='alone'?'ordinary':'alone')}>Are We Alone?</button>
          <button type="button" onClick={()=>setCorrect(true)}>Correct record</button>
          {source==='forced'&&<button type="button" onClick={()=>{if(record({command:'safe',who:figure.who,source,alreadyCounted:true}))setFocus(undefined);}}>Safe · death already counted</button>}
        </div>
      </details>
    </div>}
    {figure?.form&&!figure.pending&&figure.token!=='defeated'&&!correct&&<>
      <div className="play-state-control-bar">
        <div className="play-state-caption"><span className="play-state-title">{name} Health</span>
          {health===1&&(figure.token==='black'||figure.token==='white')&&<small className="play-state-unknown">Final Health</small>}
        </div>
        {healthInput!==undefined?<form onSubmit={event=>{
          event.preventDefault();
          if(healthInput!=='') record({command:'health',who:figure.who,value:Number(healthInput)});
        }}><input aria-label="Set mutation Health" type="number" min={1} max={figure.form.hp} value={healthInput} onChange={e=>setHealthInput(e.target.value)} required />
          <button type="submit">Set</button><button type="button" onClick={()=>setHealthInput(undefined)}>Cancel</button></form>
          :<div className="play-state-stepper">
            <button type="button" aria-label="Decrease mutation Health" disabled={props.disabled||health===undefined||health<=1}
              onClick={()=>record({command:'health',who:figure.who,value:health!-1})}><Minus size={16}/></button>
            <button type="button" aria-label="Edit mutation Health" disabled={props.disabled} onClick={()=>setHealthInput(health?.toString()??'')}>{health??'?'}</button>
            <button type="button" aria-label="Increase mutation Health" disabled={props.disabled||health===undefined||health>=figure.form.hp}
              onClick={()=>record({command:'health',who:figure.who,value:health!+1})}><Plus size={16}/></button>
          </div>}
      </div>
      <div className="organism-actions organism-action-row">
        {health===1&&<button type="button" disabled={props.disabled||minorHealth} onClick={()=>record({command:'token-loss',who:figure.who})}>Record Final Health loss</button>}
        <button type="button" className="organism-quiet" onClick={()=>setCorrect(true)}>Correct record</button>
      </div>
    </>}
    {figure?.pending&&!correct&&<div className="organism-actions">
      <p>{roster.some(item=>item.who!==figure.who&&item.form&&item.token!=='defeated')?'Resolve at phase end':'Resolve Final Health'}</p>
      <PlaySelect aria-label="Final Health result" value="" onChange={e=>{if(e.target.value!=='')record({command:'token-result',who:figure.who,value:Number(e.target.value)});}}>
        <option value="" disabled>Choose the physical result</option>
        <option value="0">{figure.token==='pending-white'?'Spent white token · defeated':'Blank or spent · defeated'}</option>
        {figure.token!=='pending-white'&&[1,2,3].map(hp=><option key={hp} value={hp}>Recovered with {hp} Health</option>)}
      </PlaySelect>
      <button type="button" className="organism-quiet" onClick={()=>setCorrect(true)}>Correct record</button>
    </div>}
    {figure&&!correct&&(!figure.status||figure.status==='safe'||figure.status==='casualty'||figure.token==='defeated')&&
      <button type="button" className="organism-quiet organism-edit-state" onClick={()=>setCorrect(true)}>Record {name}’s current state</button>}
    {figure&&correct&&<OrganismCorrection key={figure.who} figure={figure} roster={roster} onRecord={record} onCancel={()=>setCorrect(false)} />}
    {effects&&effects.length>0&&<div className="organism-actions">
      <details open><summary>Bloodlust effects on reveal</summary><ol>{effects.map((effect,index)=><li key={index}>{effect}</li>)}</ol></details>
      <button type="button" className="organism-quiet" onClick={()=>setEffects(undefined)}>Done</button>
    </div>}
    {message&&<p role="alert" className="play-module-error">{message}</p>}
  </section>;
}

function OrganismCorrection({figure,roster,onRecord,onCancel}:{figure:Figure;roster:Figure[];onRecord:(command:OrganismCommand)=>boolean;onCancel:()=>void}) {
  const [status,setStatus]=useState(figure.status??'');
  const [form,setForm]=useState<OrganismForm|''>(figure.form?.id??'');
  const [hp,setHp]=useState(figure.health?.toString()??'');
  const [token,setToken]=useState<Figure['token']|''>(figure.token??'');
  const out=token==='defeated'||token.startsWith('pending-');
  return <form className="organism-actions" onSubmit={event=>{
    event.preventDefault();
    if(status==='mutated'&&form) onRecord({command:'observe-form',who:figure.who,form,token:token||null,health:out?0:hp===''?null:Number(hp)});
    if(status==='exposed'||status==='safe'||status==='casualty') onRecord({command:'observe',who:figure.who,status});
  }}>
    <PlaySelect aria-label="Observed victim status" value={status} onChange={e=>setStatus(e.target.value as typeof status)}>
      <option value="" disabled>Current state</option>
      {!figure.form&&<><option value="exposed">Exposed</option><option value="safe">Safe</option><option value="casualty">Killed</option></>}
      <option value="mutated">Mutated</option>
    </PlaySelect>
    {status==='mutated'&&<>
      <PlaySelect aria-label="Observed mutation" value={form} onChange={e=>setForm(e.target.value as OrganismForm)}>
        <option value="" disabled>Choose form</option>{formOptions(roster,figure.who)}
      </PlaySelect>
      <PlaySelect aria-label="Observed Final Health token" value={token} onChange={e=>setToken(e.target.value as typeof token)}>
        <option value="">Token unrecorded</option><option value="black">Black token</option><option value="white">White token</option>
        <option value="pending-black">Black token pending</option><option value="pending-white">White token pending</option>
        <option value="pending-unknown">Unrecorded token pending</option><option value="defeated">Defeated</option>
      </PlaySelect>
      {!out&&<label>Health <input type="number" min={1} max={ORGANISM_FORMS.find(item=>item.id===form)?.hp??7} value={hp} placeholder="Unknown" onChange={e=>setHp(e.target.value)}/></label>}
    </>}
    <div className="organism-action-row"><button type="submit" disabled={!status||status==='mutated'&&!form}>Save observation</button>
      <button type="button" onClick={onCancel}>Cancel</button></div>
  </form>;
}

export function OrganismFinaleControl(props:RecordProps) {
  const {summary,state,send,message}=useOrganismRecord(props);
  const [open,setOpen]=useState(false);
  const [assignments,setAssignments]=useState<OrganismAssignment[]>([]);
  const finale=organismFinale(summary.entries);
  const roster=organismRoster(state);
  const exposed=roster.filter(figure=>figure.status==='exposed');
  if(!finale||state.finaleRecorded||!exposed.length) return null;
  if(roster.some(figure=>!figure.status)) return <small>Record each victim’s current state before confirming the Finale.</small>;
  const forms=ORGANISM_FORMS.filter(form=>!roster.some(figure=>figure.form?.id===form.id));
  return <div className="organism-actions">
    {!open?<button type="button" disabled={props.disabled} onClick={()=>{setOpen(true);setAssignments([]);}}>Record Finale assimilation</button>:<>
      <p>Record the physical reveals from right to left.</p>
      {assignments.map(item=><p key={item.who}>{organismColorLabel(item.who)} · {ORGANISM_FORMS.find(form=>form.id===item.form)?.name}</p>)}
      {assignments.length<exposed.length&&<FinaleAssignment
        key={assignments.length}
        colors={exposed.filter(item=>!assignments.some(assignment=>assignment.who===item.who)).map(item=>item.who)}
        forms={forms.filter(form=>!assignments.some(assignment=>assignment.form===form.id))}
        onAdd={assignment=>setAssignments([...assignments,assignment])}/>}
      <div className="organism-action-row">
        <button type="button" disabled={props.disabled||assignments.length!==exposed.length}
          onClick={()=>{if(send({command:'finale',reveal:finale.id,assignments}))setOpen(false);}}>Confirm assimilation</button>
        <button type="button" onClick={()=>setOpen(false)}>Cancel</button>
      </div>
    </>}
    {message&&<p role="alert">{message}</p>}
  </div>;
}
function FinaleAssignment({colors,forms,onAdd}:{colors:OrganismColor[];forms:ReadonlyArray<typeof ORGANISM_FORMS[number]>;onAdd:(assignment:OrganismAssignment)=>void}) {
  const [color,setColor]=useState<OrganismColor|''>(colors.length===1?colors[0]:'');
  return <div className="organism-action-row">
    <PlaySelect aria-label="Exposed Victim revealed" value={color} onChange={e=>setColor(e.target.value as OrganismColor)}>
      <option value="" disabled>Victim color</option>{colors.map(who=><option key={who} value={who}>{organismColorLabel(who)}</option>)}
    </PlaySelect>
    <PlaySelect aria-label="Finale mutation form" disabled={!color} value="" onChange={e=>{if(color&&e.target.value)onAdd({who:color,form:e.target.value as OrganismForm});}}>
      <option value="" disabled>Revealed form</option>{forms.map(form=><option key={form.id} value={form.id}>{form.name}</option>)}
    </PlaySelect>
  </div>;
}

export function OrganismCards({events,onEvent,blocked}:ControlsProps) {
  const {state,send,message}=useOrganismRecord({events,onEvent});
  const [assign,setAssign]=useState<typeof ORGANISM_MINORS[number]['id']>();
  const living=organismLiving(state);
  return <section aria-label="Organism cards">
    <MinorPowerGroup description={assign&&<div className="organism-actions">
      <PlaySelect aria-label="Assign Minor Dark Power" value="" onChange={event=>{
        const card=ORGANISM_MINORS.find(item=>item.id===assign)!;
        if(event.target.value&&send({command:'minor',card:assign,owner:event.target.value as OrganismColor,health:card.health}))setAssign(undefined);
      }}><option value="" disabled>Choose the closest mutation</option>
        {living.map(figure=><option key={figure.who} value={figure.who}>{organismColorLabel(figure.who)} · {figure.form?.name}</option>)}
      </PlaySelect><button type="button" className="organism-quiet" onClick={()=>setAssign(undefined)}>Cancel</button>
    </div>}>
      {ORGANISM_MINORS.map(card=>{
        const value=state[minorHealthKey(card.id)];
        const owner=state[minorOwnerKey(card.id)] as OrganismColor|'waiting'|undefined;
        return <MinorPowerControl key={card.id} name={card.name} health={typeof value==='number'?value:undefined}
          maxHealth={card.health} disabled={blocked} heroArt={organismArt(card.id)} choiceArt={organismArt(card.id,true)} art={()=>organismArt(card.id)}
          observation={owner==='waiting'?'Waiting for a mutation':owner?organismColorLabel(owner):undefined}
          onChange={health=>{
            if(!owner&&health!==null&&living.length>1) {setAssign(card.id);return;}
            send({command:'minor',card:card.id,owner:health===null?null:owner??living[0]?.who??'waiting',health});
          }}/>;
      })}
    </MinorPowerGroup>
    <KillerCards killer={ORGANISM} events={events} onEvent={onEvent} disabled={blocked} />
    {message&&<p role="alert" className="play-module-error">{message}</p>}
  </section>;
}
