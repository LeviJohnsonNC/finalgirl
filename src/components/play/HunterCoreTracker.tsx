import { hunterState } from '@/lib/play/hunter';
import { moduleState } from '@/lib/play/modules';
import { summarizePlay, type PlayEvent } from '@/lib/play/events';
import { hunterArt } from './hunterArt';
export function HunterCoreTracker({events}:{events:PlayEvent[]}) {
 const s=hunterState(moduleState(summarizePlay(events).entries,'hunter'));
 return <div className="play-state play-state--killerHealth" role="group" aria-label="Killer Health tracker">
  <div className="play-state-picture"><img className="play-stat-portrait" src={hunterArt(s.phase==='mark-v'?'mark-v':'mark-v-shutdown').src} alt=""/></div>
  <div className="play-state-control-bar"><div className="play-state-caption"><span className="play-state-title">{s.phase==='mark-v'?'Mark V · Parts':'Mark X · Countdown'}</span><small>{s.phase==='mark-v'?'Cybernetic Parts':'Mark V shut down'}</small></div><strong className="hunter-core-note">{s.phase==='mark-v'?s.remaining??'?':s.countdown??'?'}</strong></div>
 </div>;
}
