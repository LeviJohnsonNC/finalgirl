import {useState} from 'react';
import {
  INTRUDERS, INTRUDER_MODULE, INTRUDER_HEALTH, INTRUDER_MINORS, INTRUDER_ROSTER,
  intruderEpicReady, intruderFigure, intruderId, intruderMinorField, intruderMode, intruderParent,
  resolveIntruderAction, type IntruderAction, type IntruderId,
} from '@/lib/play/intruders';
import {newPlayEvent,summarizePlay,type PlayEvent} from '@/lib/play/events';
import {moduleState} from '@/lib/play/modules';
import {MinorPowerControl} from './MinorPowerControl';
import {MinorPowerGroup} from './MinorPowerGroup';
import {KillerCards} from './KillerCards';
import {PlaySelect} from './PlaySelect';
import {useModuleRecord} from './useModuleRecord';
import {intruderArt} from './intruderArt';
import type {ControlsProps} from './moduleDefinitions';
import '@/styles/play-intruders.css';

type Command<T=IntruderAction> = T extends IntruderAction ? Omit<T,'parent'> : never;
function useIntruderRecord(events:PlayEvent[],onEvent:ControlsProps['onEvent']) {
  const {entries}=summarizePlay(events);
  const state=moduleState(entries,INTRUDER_MODULE);
  const {record,message}=useModuleRecord(events,onEvent);
  const request=(command:Command):IntruderAction=>({...command,parent:intruderParent(entries)});
  const can=(command:Command)=>!!resolveIntruderAction(request(command),state,entries);
  const send=(command:Command)=>{
    const intruderAction=request(command);
    const changes=resolveIntruderAction(intruderAction,state,entries);
    return !!changes && record(newPlayEvent({kind:'module',intruderAction,moduleData:{module:INTRUDER_MODULE,changes}}));
  };
  return {entries,state,can,send,message};
}
export function IntruderRoster({events,onEvent}:{events:PlayEvent[];onEvent:ControlsProps['onEvent']}) {
  const {entries,state,can,send,message}=useIntruderRecord(events,onEvent);
  const [focus,setFocus]=useState<IntruderId>();
  const [input,setInput]=useState<string>();
  const active=intruderId(state.active)?state.active:undefined;
  const who=focus??active??'trish';
  const person=INTRUDER_ROSTER.find(p=>p.id===who)!;
  const {health,token}=intruderFigure(state,who);
  const mode=intruderMode(entries);
  const epic=intruderEpicReady(state,entries);
  const hasBonus=INTRUDER_ROSTER.some(({id})=>{
    const figure=intruderFigure(state,id);
    return figure.health===1 && (figure.token==='black'||figure.token==='white');
  });
  const status=mode==='all'?'All Killers Active':mode==='unknown'?'Finale mode unconfirmed':state.active==='none'?'No Active Killer':active?'Active Killer marker':'Active Killer unrecorded';
  const resolve=(command:Command)=>{if(send(command))setInput(undefined);};
  const canDown=can({command:'down',who});
  const canConfirm=can({command:epic?'epic':'dead',who});
  return (
    <div className="play-state play-state--intruders" role="group" aria-label="Intruder Killer Health tracker">
      <div className="intruder-portraits">
        {INTRUDER_ROSTER.map(({id,name,color})=>{
          const figure=intruderFigure(state,id);
          const isActive=mode==='all'?figure.token!=='pending'&&figure.token!=='dead'&&(figure.health!==undefined||figure.token!==undefined):active===id;
          const fate=figure.token==='pending'?'Down':figure.token==='dead'?'Dead':`${figure.health??'?'} HP`;
          return <button type="button" key={id} aria-pressed={id===who} aria-label={`View ${name} health`} aria-description={`${fate}${isActive?', Active':''}`}
            data-focus={id===who} data-active={isActive} data-out={figure.token==='dead'||figure.token==='pending'}
            onClick={()=>{setFocus(id);setInput(undefined);}}>
            <img src={intruderArt(id).src} alt="" />
            <span className="intruder-portrait-label"><strong>{name}</strong><small>{fate}</small></span>
            <span className="intruder-marker-tag">{isActive?'Active':color}</span>
          </button>;
        })}
      </div>
      <div className="intruder-actions">
        {mode!=='all'&&!active&&<small className="intruder-marker-unknown">{status}</small>}
        <div className="intruder-marker-row" aria-label="Active Killer">
          {mode!=='all'&&<button type="button" aria-label="Shift Active Killer up" disabled={!can({command:'shift',direction:'up'})} onClick={()=>send({command:'shift',direction:'up'})}>↑</button>}
          {mode!=='all'&&active!==who&&can({command:'activate',who})
            ? <button type="button" onClick={()=>send({command:'activate',who})}>Set {person.name} active</button>
            : (active||mode==='all')&&<small>{status}</small>}
          {mode!=='all'&&<button type="button" aria-label="Shift Active Killer down" disabled={!can({command:'shift',direction:'down'})} onClick={()=>send({command:'shift',direction:'down'})}>↓</button>}
        </div>
        <div className="intruder-health-row">
          <span><strong>{person.name}</strong> <small>Health</small></span>
          {input!==undefined
            ? <form onSubmit={event=>{
                event.preventDefault();
                const value=Number(input);
                if(Number.isInteger(value)&&value>=1&&value<=INTRUDER_HEALTH) resolve({command:'health',who,value});
              }}>
              <input aria-label={`Set ${person.name} health`} type="number" min={1} max={INTRUDER_HEALTH} required value={input} onChange={e=>setInput(e.target.value)} autoFocus />
              <button type="submit">Set</button><button type="button" onClick={()=>setInput(undefined)} aria-label="Cancel health edit">×</button>
            </form>
            : <div className="intruder-health-stepper">
              <button type="button" aria-label={`Decrease ${person.name} health`} disabled={health===undefined||health<=1||!can({command:'health',who,value:health-1})} onClick={()=>send({command:'health',who,value:health!-1})}>−</button>
              <button type="button" aria-label={`Edit ${person.name} health`} disabled={token==='pending'||token==='dead'} onClick={()=>setInput(health===undefined?'':String(health))}>{health??'?'}</button>
              <button type="button" aria-label={`Increase ${person.name} health`} disabled={health===undefined||health>=INTRUDER_HEALTH||!can({command:'health',who,value:health+1})} onClick={()=>send({command:'health',who,value:health!+1})}>+</button>
            </div>}
        </div>
        {hasBonus&&<small className="intruder-bonus">+1 Horror die</small>}
        {token==='pending'
          ? <label className="intruder-fate">Awaiting Final Health
            <PlaySelect aria-label={`Resolve ${person.name} Final Health`} value="" onChange={event=>{
              const choice=event.target.value;
              if(choice==='blank')resolve({command:epic?'epic':'dead',who});
              else if(choice)resolve({command:'return',who,value:Number(choice)});
            }}>
              <option value="" disabled>Record token result</option>
              <option value="blank">{epic?'Blank · use Won’t Stay Down':'Blank · confirm death'}</option>
              {[1,2,3].map(hp=><option key={hp} value={hp}>Returns with {hp} HP</option>)}
            </PlaySelect>
          </label>
          : <details className="intruder-fate">
            <summary>{token==='dead'?'Correct status':health===1?'Final Health':'Final Health / correction'}</summary>
            {canDown&&<button type="button" onClick={()=>resolve({command:'down',who})}>Mark down</button>}
            {canConfirm&&<button type="button" onClick={()=>resolve({command:epic?'epic':'dead',who})}>{epic?'Confirm death · Epic return':'Confirm death'}</button>}
            <PlaySelect aria-label={`Correct ${person.name} Final Health token`} value={token==='dead'?'':token??''} onChange={e=>{
              const value=e.target.value;
              if(value==='black'||value==='white')resolve({command:'token',who,value});
              if(value==='unknown')resolve({command:'token',who,value:null});
            }}>
              <option value="" disabled>Correct token</option>
              <option value="black">Black token</option><option value="white">White token</option>
              {token!=='dead'&&<option value="unknown">Token unrecorded</option>}
            </PlaySelect>
          </details>}
        {message&&<p role="alert" className="play-module-error">{message}</p>}
      </div>
    </div>
  );
}
export function IntruderCards({events,blocked,onEvent}:ControlsProps) {
  const {entries,state,send,message}=useIntruderRecord(events,onEvent);
  return <section aria-label="Intruder cards">
    <h3>Minor Dark Powers</h3>
    <MinorPowerGroup>
      {INTRUDER_MINORS.map(card=>{
        const key=intruderMinorField(card.id);
        const value=state[key];
        return <MinorPowerControl key={card.id} name={card.name} health={typeof value==='number'?value:undefined}
          maxHealth={card.health} disabled={blocked}
          previouslyRevealed={entries.some(e=>e.moduleData?.module===INTRUDER_MODULE&&typeof e.moduleData.changes[key]==='number')}
          art={()=>intruderArt(card.id,true)} heroArt={intruderArt(card.id)}
          onChange={value=>send({command:'minor',card:card.id,value})} />;
      })}
    </MinorPowerGroup>
    {state.spent&&<p role="status">Won’t Stay Down spent</p>}
    <KillerCards killer={INTRUDERS} events={events} onEvent={onEvent} disabled={blocked} />
    {message&&<p role="alert" className="play-module-error">{message}</p>}
  </section>;
}
