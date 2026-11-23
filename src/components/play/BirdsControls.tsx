import { mallUnlocksUltimate } from '@/lib/play/sunnydaze';
import { useState } from 'react';
import {
  BIRDS, BIRDS_MODULE, BIRDS_DIFFICULTIES, BIRD_WALL,
  birdsLatest, birdsParent, birdsState, birdsSummary, initialBirds,
  isBirdsTarget, resolveBirdsAction, type BirdsAction,
} from '../../../supabase/functions/_shared/play/birds';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { ModuleArtwork } from './ModuleArtwork';
import { KillerCards } from './KillerCards';
import { MinorPowerSection } from './MinorPowerSection';
import { PlaySelect } from './PlaySelect';
import { birdsArt } from './birdsArt';
import { useModuleRecord } from './useModuleRecord';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-birds.css';

type WithoutParent<T> = T extends BirdsAction ? Omit<T,'parent'> : never;
type Command = WithoutParent<BirdsAction>;
const countOptions = [0,1,2,3];

export function BirdsControls({events,onEvent,blocked,birdsRequired}:ControlsProps) {
  const entries = summarizePlay(events).entries;
  const defaults = birdsRequired && !events.some(e=>e.birdsAction?.command !== 'review') ? initialBirds(birdsRequired) : {};
  const state = {...defaults,...birdsState(entries)};
  const {record,message} = useModuleRecord(events,onEvent);
  const [correcting,setCorrecting] = useState(false);
  const [required,setRequired] = useState('');
  const [rescued,setRescued] = useState('');
  const [arrived,setArrived] = useState('');
  const actualTarget = isBirdsTarget(state.required) ? state.required : undefined;
  const actualRescued = typeof state.rescued === 'number' ? state.rescued : undefined;
  const wall = typeof state.wall === 'number' ? state.wall : undefined;
  const latestObjective = birdsLatest(entries,'save');
  const latestWall = birdsLatest(entries,'count-wall');
  const ready = Boolean(state.arrival && state.arrival !== 'hidden');
  const won = actualTarget !== undefined && actualTarget === actualRescued;
  const ultimateRecorded = entries.some(e=>e.kind === 'moment' && e.momentType === 'ultimate-unlocked') || mallUnlocksUltimate(entries);

  const act = (command:Command) => {
    if (blocked) return false;
    const birdsAction: BirdsAction = {...command,parent:birdsParent(entries,command.command)};
    const initial = Object.keys(defaults).length ? [{
      id:'setup-preview',kind:'module' as const,moduleData:{module:BIRDS_MODULE as typeof BIRDS_MODULE,changes:defaults},
    }] : [];
    const changes = resolveBirdsAction(birdsAction,[...initial,...entries]);
    if (!changes) return false;
    return record(newPlayEvent({
      ...(command.command === 'save' ? {kind:'saved' as const,quantity:1} : {kind:'module' as const}),
      birdsAction,moduleData:{module:BIRDS_MODULE,changes},
    }));
  };
  const correct = () => {
    const target = Number(required);
    const count = rescued === '' ? null : Number(rescued);
    const arrival = arrived === 'hidden' || arrived === 'observed' || arrived === 'ultimate' || arrived === 'normal-victims-gone' ? arrived : null;
    if (act({command:'correct',required:isBirdsTarget(target) ? target : null,rescued:count,arrival})) setCorrecting(false);
  };

  return <section className="birds-controls" aria-label="Terror From Above tracking">
    <section className="birds-objective" data-module-control="objective">
      <div>
        <h3>Special Victims</h3>
        <p role="status">{birdsSummary(state)}{state.arrival === 'hidden' && actualTarget ? ` · target ${actualTarget}` : ''}</p>
      </div>
      {!ready && <div className="birds-actions" aria-label="Reveal Special Victims after the physical trigger">
        <button type="button" disabled={blocked} onClick={()=>act({command:'arrive',trigger:'ultimate'})}>
          {ultimateRecorded ? 'Record Special Victims on board' : 'Ultimate unlocked'}
        </button>
        <button type="button" disabled={blocked} onClick={()=>act({command:'arrive',trigger:'normal-victims-gone'})}>No normal Victims remain</button>
      </div>}
      {ready && !won && actualTarget && actualRescued !== undefined &&
        <div className="birds-actions"><button type="button" disabled={blocked} onClick={()=>act({command:'save'})}>Record Special Victim rescued</button></div>}
      {ready && !won && (actualTarget === undefined || actualRescued === undefined) &&
        <p className="birds-help">Record the rescue target and current progress to count future rescues.</p>}
      <div className="birds-quiet">
        <button type="button" disabled={blocked} aria-expanded={correcting} onClick={()=>{
          if (!correcting) {
            setRequired(String(actualTarget ?? ''));
            setRescued(String(actualRescued ?? ''));
            setArrived(typeof state.arrival === 'string' ? state.arrival : '');
          }
          setCorrecting(!correcting);
        }}>Correct rescue record</button>
        {latestObjective && <button type="button" disabled={blocked} onClick={()=>record(newPlayEvent({kind:'undo',target:latestObjective.id}))}>Undo rescue observation</button>}
      </div>
      {correcting && <div className="birds-correction">
        <label>Rescue target<PlaySelect aria-label="Rescue target" value={required} onChange={e=>setRequired(e.target.value)}>
          <option value="">Unrecorded</option>{BIRDS_DIFFICULTIES.map(d=><option key={d.value} value={d.value}>{d.label} · {d.value}</option>)}
        </PlaySelect></label>
        <label>Special Victims<PlaySelect aria-label="Special Victims status" value={arrived} onChange={e=>setArrived(e.target.value)}>
          <option value="">Unrecorded</option><option value="hidden">Hidden</option><option value="observed">Entered play · trigger unrecorded</option>
          <option value="ultimate">Entered play · Ultimate unlocked</option>
          <option value="normal-victims-gone">Entered play · no normal Victims</option>
        </PlaySelect></label>
        <label>Rescued<PlaySelect aria-label="Number of Special Victims rescued" value={rescued} onChange={e=>setRescued(e.target.value)}>
          <option value="">Unrecorded</option>{countOptions.map(n=><option key={n} value={n}>{n}</option>)}
        </PlaySelect></label>
        <div className="birds-actions"><button type="button" disabled={blocked ||
          Boolean(required && rescued && Number(rescued)>Number(required)) ||
          Boolean(Number(rescued) && (!arrived || arrived === 'hidden'))} onClick={correct}>Save correction</button></div>
      </div>}
    </section>
    <MinorPowerSection>
      <article data-module-control="minor-effect" className="birds-wall module-minor module-cinematic-minor">
        {wall !== undefined && wall < 5 ? (
          <div className="module-minor-scene">
            <div className="module-minor-art"><ModuleArtwork art={birdsArt('bird-wall')} /></div>
            <div className="module-minor-body">
              <span className="cinematic-eyebrow">Minor Dark Power</span>
              <h3>Bird Wall</h3>
              <p className="module-health-status birds-wall-status">{wall}/5 Bird tokens</p>
              <div className="birds-actions"><button type="button" disabled={blocked} onClick={()=>act({command:'count-wall'})}>Mark Bird killed</button></div>
            </div>
          </div>
        ) : (
          <button type="button" className="module-minor-choice" disabled={wall === 5 || blocked}
            aria-label={wall === 5 ? 'Bird Wall removed' : 'Record Bird Wall revealed'} onClick={()=>act({command:'add-wall'})}>
            <span className="module-minor-art"><ModuleArtwork art={birdsArt('bird-wall')} /></span>
            <span className="module-minor-choice-copy">
              <span className="cinematic-eyebrow">Minor Dark Power</span>
              <strong>Bird Wall</strong>
              <span className="module-health-status birds-wall-status">{wall === 5 ? 'Removed · 5 tokens' : state.wall === 'inactive' ? 'Inactive' : 'Unrecorded'}</span>
            </span>
          </button>
        )}
        {latestWall && <div className="birds-quiet"><button type="button" disabled={blocked} onClick={()=>record(newPlayEvent({kind:'undo',target:latestWall.id}))}>Undo Bird Wall observation</button></div>}
        <details className="module-correction"><summary>Correct Bird Wall</summary>
          <PlaySelect aria-label="Bird Wall progress" value={String(state.wall ?? '')} disabled={blocked} onChange={e=>{
            const value=e.target.value;
            act({command:'correct-wall',value:value === '' ? null : value === 'inactive' ? value : Number(value)});
          }}>
            <option value="">Unrecorded</option><option value="inactive">Inactive</option>
            {[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n === 5 ? 'Removed · 5 tokens' : `${n}/5 tokens`}</option>)}
          </PlaySelect>
        </details>
      </article>
    </MinorPowerSection>
    <KillerCards killer={BIRDS} events={events} onEvent={onEvent} disabled={blocked} />
    {message && <p role="alert">{message}</p>}
  </section>;
}
