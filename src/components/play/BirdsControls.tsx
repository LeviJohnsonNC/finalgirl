import { Check, UserRound } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import {
  BIRDS, BIRDS_MODULE, BIRDS_DIFFICULTIES, BIRD_WALL,
  birdsLatest, birdsParent, birdsState, initialBirds,
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
const arrivalTriggers = [
  { value: 'ultimate', label: 'Ultimate unlocked' },
  { value: 'normal-victims-gone', label: 'No normal Victims remain' },
] as const;

export function BirdsControls({events,onEvent,blocked,birdsRequired}:ControlsProps) {
  const entries = summarizePlay(events).entries;
  const defaults = birdsRequired && !events.some(e=>e.birdsAction?.command !== 'review') ? initialBirds(birdsRequired) : {};
  const state = {...defaults,...birdsState(entries)};
  const {record,message} = useModuleRecord(events,onEvent);
  const [editor, setEditor] = useState<'arrival' | 'correction' | null>(null);
  const editorId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [required,setRequired] = useState('');
  const [rescued,setRescued] = useState('');
  const [arrived,setArrived] = useState('');
  const actualTarget = isBirdsTarget(state.required) ? state.required : undefined;
  const actualRescued = typeof state.rescued === 'number' ? state.rescued : undefined;
  const wall = typeof state.wall === 'number' ? state.wall : undefined;
  const latestObjective = birdsLatest(entries,'save');
  const latestWall = birdsLatest(entries,'count-wall');
  const waiting = state.arrival === 'hidden' && actualTarget !== undefined;
  const counting = Boolean(state.arrival && state.arrival !== 'hidden') &&
    actualTarget !== undefined && actualRescued !== undefined;
  const complete = counting && actualTarget === actualRescued;
  const needsRecord = !waiting && !counting;
  const correcting = editor === 'correction';

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
  const closeEditor = () => {
    setEditor(null);
    requestAnimationFrame(() => (primaryRef.current ?? statusRef.current)?.focus({ preventScroll: true }));
  };
  const toggleCorrection = () => {
    if (correcting) {
      setEditor(null);
      return;
    }
    setRequired(String(actualTarget ?? ''));
    setRescued(String(actualRescued ?? ''));
    setArrived(typeof state.arrival === 'string' ? state.arrival : '');
    setEditor('correction');
  };
  const correct = () => {
    const target = Number(required);
    const count = rescued === '' ? null : Number(rescued);
    const arrival = arrived === 'hidden' || arrived === 'observed' || arrived === 'ultimate' || arrived === 'normal-victims-gone' ? arrived : null;
    if (act({command:'correct',required:isBirdsTarget(target) ? target : null,rescued:count,arrival})) closeEditor();
  };
  const title = actualTarget === undefined ? 'Rescue Special Victims' :
    `Rescue ${actualTarget} Special Victim${actualTarget === 1 ? '' : 's'}`;
  const status = waiting ? 'Special Victims hidden' : needsRecord ? 'Rescue progress unrecorded' :
    complete ? 'All Special Victims rescued' : `${actualRescued} of ${actualTarget} rescued`;

  return <section className="birds-controls" aria-label="Terror From Above tracking">
    <section className="birds-objective" data-module-control="objective" data-complete={complete}>
      <div className="birds-objective-hero">
        <div className="birds-objective-art"><ModuleArtwork art={birdsArt('rescue')} /></div>
        <div className="birds-objective-copy">
          <h3>{title}</h3>
          <p className="birds-objective-status" ref={statusRef} tabIndex={-1} role="status">
            {complete && <Check aria-hidden="true" />}{status}
          </p>
          {actualTarget !== undefined && <div className="birds-rescue-slots" aria-hidden="true">
            {countOptions.slice(0, actualTarget).map(slot => {
              const rescuedSlot = actualRescued !== undefined && slot < actualRescued;
              return <span key={slot} data-state={rescuedSlot ? 'rescued' : actualRescued === undefined ? 'unknown' : 'pending'}>
                {rescuedSlot ? <Check /> : actualRescued === undefined ? '?' : <UserRound />}
              </span>;
            })}
          </div>}
        </div>
      </div>
      <div className="birds-objective-footer">
        {waiting && <p className="birds-help">Place them when your Ultimate unlocks or no normal Victims remain.</p>}
        <div className="birds-objective-controls">
          {!complete && (!correcting || needsRecord) && <div className={correcting ? 'birds-quiet birds-cancel' : 'birds-actions'}>
            {waiting && <button ref={primaryRef} type="button" disabled={blocked}
              aria-expanded={editor === 'arrival'} aria-controls={editor === 'arrival' ? editorId : undefined}
              onClick={() => setEditor(editor === 'arrival' ? null : 'arrival')}>Special Victims placed</button>}
            {counting && <button ref={primaryRef} type="button" disabled={blocked}
              onClick={() => { if (act({command:'save'})) closeEditor(); }}>Record rescue</button>}
            {needsRecord && <button ref={primaryRef} type="button" disabled={blocked}
              aria-expanded={correcting} aria-controls={correcting ? editorId : undefined}
              onClick={toggleCorrection}>{correcting ? 'Close rescue record' : 'Complete rescue record'}</button>}
          </div>}
          <div className="birds-quiet">
            {!needsRecord && <button type="button" disabled={blocked}
              aria-expanded={correcting} aria-controls={correcting ? editorId : undefined}
              onClick={toggleCorrection}>{correcting ? 'Close rescue record' : 'Correct record'}</button>}
            {latestObjective && <button type="button" disabled={blocked}
              onClick={() => { if (record(newPlayEvent({kind:'undo',target:latestObjective.id}))) closeEditor(); }}>Undo</button>}
          </div>
        </div>
        {editor === 'arrival' && waiting && <fieldset className="birds-arrival" id={editorId}>
          <legend>What brought them into play?</legend>
          <div className="birds-actions">{arrivalTriggers.map(({value, label}) =>
            <button key={value} type="button" disabled={blocked}
              onClick={() => { if (act({command:'arrive',trigger:value})) closeEditor(); }}>{label}</button>
          )}</div>
        </fieldset>}
        {correcting && <div className="birds-correction" id={editorId}>
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
      </div>
    </section>
    {message && <p className="birds-record-error" role="alert">{message}</p>}
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
  </section>;
}
