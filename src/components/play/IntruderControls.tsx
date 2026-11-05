import {useState} from 'react';
import {Minus,Plus} from 'lucide-react';
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
  const mode=intruderMode(entries);
  const focusToken=focus?intruderFigure(state,focus).token:undefined;
  const who=(mode==='all'||focusToken==='pending'?focus??active:active)??'trish';
  const hero=(mode==='all'?focus??active:active??focus)??'trish';
  const person=INTRUDER_ROSTER.find(p=>p.id===who)!;
  const {health,token}=intruderFigure(state,who);
  const epic=intruderEpicReady(state,entries);
  const hasBonus=INTRUDER_ROSTER.some(({id})=>{
    const figure=intruderFigure(state,id);
    return figure.health===1 && (figure.token==='black'||figure.token==='white');
  });
  const resolve=(command:Command)=>{if(send(command))setInput(undefined);};
  const zero:Command={command:token==='white'?(epic?'epic':'dead'):'down',who};
  const portraits=[INTRUDER_ROSTER.find(p=>p.id===hero)!,...INTRUDER_ROSTER.filter(p=>p.id!==hero)];
  return (
    <div className="play-state play-state--intruders" role="group" aria-label="Intruder Killer Health tracker">
      <div className="intruder-portraits">
        {portraits.map(({id,name})=>{
          const figure=intruderFigure(state,id);
          const out=figure.token==='dead'||figure.token==='pending';
          const isActive=mode==='all'?!out&&(figure.health!==undefined||figure.token!==undefined):active===id;
          const fate=figure.token==='pending'?'Down':figure.token==='dead'?'Dead':`${figure.health??'?'} HP`;
          return <button type="button" key={id} aria-pressed={isActive} aria-label={name}
            aria-description={`${fate}${isActive?', Active':''}`} data-active={isActive} data-out={out} disabled={figure.token==='dead'}
            onClick={()=>{
              if(!out&&mode!=='all'&&id!==active&&!send({command:'activate',who:id}))return;
              setFocus(id);
              setInput(undefined);
            }}>
            <img src={intruderArt(id).src} alt="" />
            <span className="intruder-portrait-label"><strong>{name}</strong><small>{fate}</small></span>
          </button>;
        })}
      </div>
      <div className="play-state-control-bar">
        <div className="play-state-caption">
          <span className="play-state-title">{person.name} Health</span>
          {mode==='all'&&<small className="play-state-unknown">All Killers Active</small>}
          {hasBonus&&<small className="play-state-unknown">+1 Horror die</small>}
        </div>
        {input!==undefined
          ? <form onSubmit={event=>{
              event.preventDefault();
              const value=Number(input);
              if(value===0&&input!==''){if(send(zero)){setFocus(who);setInput(undefined);}}
              else if(Number.isInteger(value)&&value>=1&&value<=INTRUDER_HEALTH)resolve({command:'health',who,value});
            }}>
              <input aria-label={`Set ${person.name} health`} type="number" min={0} max={INTRUDER_HEALTH} required value={input} onChange={e=>setInput(e.target.value)} autoFocus />
              <button type="submit">Set</button><button type="button" onClick={()=>setInput(undefined)} aria-label="Cancel health edit">×</button>
            </form>
          : <div className="play-state-stepper">
              <button type="button" aria-label={`Decrease ${person.name} health`}
                disabled={health===undefined||health===0||!can(health===1?zero:{command:'health',who,value:(health??0)-1})}
                onClick={()=>{if(health===1){if(send(zero))setFocus(who);}else if(health)send({command:'health',who,value:health-1});}}><Minus size={16}/></button>
              <button type="button" aria-label={`Edit ${person.name} health`} disabled={token==='pending'||token==='dead'} onClick={()=>setInput(health===undefined?'':String(health))}>{health??'?'}</button>
              <button type="button" aria-label={`Increase ${person.name} health`} disabled={health===undefined||health>=INTRUDER_HEALTH||!can({command:'health',who,value:health+1})} onClick={()=>send({command:'health',who,value:health!+1})}><Plus size={16}/></button>
            </div>}
      </div>
      {token==='pending'&&<div className="intruder-zero-result">
        <PlaySelect aria-label={`Resolve ${person.name} at zero health`} value="" onChange={event=>{
          const choice=event.target.value;
          if(!choice)return;
          const command:Command=choice==='blank'?{command:epic?'epic':'dead',who}:{command:'return',who,value:Number(choice)};
          if(send(command))setFocus(undefined);
        }}>
          <option value="" disabled>Resolve {person.name} at 0 HP</option>
          <option value="blank">{epic?'Blank · use Won’t Stay Down':'Blank · confirm death'}</option>
          {[1,2,3].map(hp=><option key={hp} value={hp}>Returns with {hp} HP</option>)}
        </PlaySelect>
      </div>}
      {message&&<p role="alert" className="play-module-error">{message}</p>}
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
