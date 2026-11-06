import { hunterCountdownReversal } from '@/lib/play/hunter';
import type { PlayEvent } from '@/lib/play/events';
import { hunterArt, hunterModelArt } from './hunterArt';
import { useHunterRecord } from './useHunterRecord';
import '@/styles/play-hunter.css';
export function HunterCoreTracker({events,onEvent}:{events:PlayEvent[];onEvent:(event:PlayEvent)=>boolean}) {
 const {s,entries,act,message}=useHunterRecord(events,onEvent);
 const parts=s.phase==='mark-v', value=parts?s.remaining:s.countdown;
 const title=parts?'Parts':'Countdown';
 const art=parts?hunterModelArt(s):hunterArt('mark-v-parts-0');
 return <div className="play-state play-state--killerHealth hunter-core" role="group" aria-label="Killer Health tracker">
  <div className="play-state-picture"><img className="play-stat-portrait" src={art.src} alt="" style={{objectPosition:art.position}}/></div>
  <div className="play-state-control-bar"><div className="play-state-caption"><span className="play-state-title">{title}</span></div>
   <div className="play-state-stepper">
    <button type="button" aria-label={`Decrease Hunter ${title}`} disabled={value===null||value<1} onClick={()=>act({command:parts?'remove-part':'countdown'})}>−</button>
    <strong aria-live="polite" aria-label={`Hunter ${title} remaining`}>{value??'?'}</strong>
    <button type="button" aria-label={`Increase Hunter ${title}`} disabled={parts?value===null||value>=20:s.countdown!==1||!hunterCountdownReversal(entries)} onClick={()=>act({command:parts?'reboot':'countdown-back'})}>+</button>
   </div>
  </div>
  {message&&<p role="alert" className="play-module-error">{message}</p>}
 </div>;
}
