import { useState } from 'react';
import { HealthlessMinorControl } from './HealthlessMinorControl';
import { IllustratedTile } from './IllustratedTile';
import { PlaySelect } from './PlaySelect';
import { KillerCards } from './KillerCards';
import { useModuleRecord } from './useModuleRecord';
import { moduleState, type ModuleValue } from '@/lib/play/modules';
import { newPlayEvent, summarizePlay } from '@/lib/play/events';
import { CAROLYN_STATES, FLOPPY_STATES, POLTERGEIST_MINORS, poltergeistParent, poltergeistPower, resolvePoltergeistAction, type PoltergeistAction } from '../../../supabase/functions/_shared/play/poltergeist';
import { poltergeistArt } from './poltergeistArt';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-poltergeist.css';
const labels: Record<string, string> = { hidden: 'Not found', 'with-you': 'With you', 'in-deck': 'Back in an Item deck', rescued: 'Rescued', carried: 'With you', removed: 'Removed from the game', inactive: 'Inactive', active: 'Active' };
export function PoltergeistControls({ events, onEvent, blocked }: ControlsProps) {
    const entries = summarizePlay(events).entries;
    const state = moduleState(entries, 'poltergeist');
    const power = poltergeistPower(entries);
    const { record, message } = useModuleRecord(events, onEvent);
    const [choosingMinors, setChoosingMinors] = useState(false);
    const recordedMinors = POLTERGEIST_MINORS.filter(p => state[`minor.${p.id}`] === 'active' || state[`minor.${p.id}`] === 'removed' || entries.some(e => e.moduleData?.module === 'poltergeist' && e.moduleData.changes[`minor.${p.id}`] === 'active'));
    const [open, setOpen] = useState<string | null>(null);
    const action = (command: PoltergeistAction['command'], key?: string, value?: ModuleValue) => {
        const request: PoltergeistAction = { parent: poltergeistParent(entries), command, ...(key !== undefined && { key }), ...(value !== undefined && { value }) };
        const changes = resolvePoltergeistAction(request, state, entries);
        if (blocked || !changes)
            return;
        const ok = record(newPlayEvent({ kind: 'module', moduleData: { module: 'poltergeist', changes }, poltergeistAction: request }));
        if (ok && command === 'activate-minor')
            setChoosingMinors(false);
    };
    const correction = (key: string, states: readonly string[]) => <details className="module-correction"><summary>Correct record<span className="sr-only">: {key}</span></summary><PlaySelect aria-label={`${key === 'floppy' ? 'Mr. Floppy' : key === 'carolyn' ? 'Carolyn' : key} status`} value={String(state[key] ?? '')} disabled={blocked} onChange={e => action('correct', key, e.target.value || null)}><option value="">Not recorded</option>{states.map(v => <option key={v} value={v}>{labels[v]}</option>)}</PlaySelect></details>;
    return <section className="play-poltergeist" aria-label="Poltergeist tracking">
    <div className="polter-objective-heading"><h3>Find her. Get her out.</h3><p>{power.epic ? 'Escape with Carolyn and Mr. Floppy.' : power.known ? 'Escape with Carolyn.' : power.revealed ? 'Power name not recorded · escape requirement uncertain.' : 'Find Carolyn · the revealed Power may change the escape requirement.'}</p></div>
    <div className="polter-objectives" data-module-control="objective">
      <article data-state={state.carolyn ?? 'unknown'}>
        <IllustratedTile className="module-control-tile polter-objective-photo" art={poltergeistArt('carolyn')} title="Carolyn" status={labels[String(state.carolyn)] ?? 'Not recorded'} aria-label="View Carolyn actions" aria-expanded={open === 'carolyn'} onClick={() => setOpen(open === 'carolyn' ? null : 'carolyn')}/>
        {open === 'carolyn' && <div className="polter-actions">
          {state.carolyn !== 'with-you' && state.carolyn !== 'rescued' && <><button disabled={blocked} onClick={() => action('join')}>Carolyn joins you</button><p className="module-linked-preview">Removes both Minor Dark Powers from the game.</p></>}
          {state.carolyn === 'with-you' && <><button disabled={blocked} onClick={() => action('return')}>Shuffle Carolyn back</button><button disabled={blocked || (power.epic && state.floppy !== 'carried')} onClick={() => action('rescue')}>Record Carolyn rescued</button>{power.epic && state.floppy !== 'carried' && <p>Mr. Floppy must be with you for the Epic escape.</p>}{power.name === 'Invisible Barrier' && <p>Full Health is required to enter an Exit with Carolyn.</p>}{!power.known && <p>Confirm the physical Power and escape conditions before recording rescue.</p>}</>}
          {correction('carolyn', CAROLYN_STATES)}
        </div>}
      </article>
      <article data-state={state.floppy ?? 'unknown'}>
        <IllustratedTile className="module-control-tile polter-objective-photo" art={poltergeistArt('floppy')} title="Mr. Floppy" status={labels[String(state.floppy)] ?? 'Not recorded'} aria-label="View Mr. Floppy actions" aria-expanded={open === 'floppy'} onClick={() => setOpen(open === 'floppy' ? null : 'floppy')}/>
        {open === 'floppy' && <div className="polter-actions">
          {!['carried', 'removed'].includes(String(state.floppy)) && <button disabled={blocked} onClick={() => action('find-floppy')}>Found Mr. Floppy</button>}
          {state.floppy === 'carried' && <><button disabled={blocked || !power.known || power.epic || state.carolyn !== 'with-you'} onClick={() => action('protect')}>Protect Carolyn</button><p className="module-linked-preview">Remove Mr. Floppy to cancel “Carolyn? Where are you?!?!?”{!power.known ? ' Record the revealed Power name first.' : power.epic ? ' Unavailable with the Epic Power.' : ''}</p><button disabled={blocked || !power.known || power.epic} onClick={() => action('return-floppy')}>Record discarded into Item deck</button></>}
          {correction('floppy', FLOPPY_STATES)}
        </div>}
      </article>
    </div>
    <h3>Minor Dark Powers</h3>
    <div className="polter-minors" data-module-control="minor-effect">
      {POLTERGEIST_MINORS.filter(p => recordedMinors.length === 0 || choosingMinors || recordedMinors.includes(p)).map(p => <HealthlessMinorControl key={p.id} name={p.name} value={state[`minor.${p.id}`] as string | undefined} art={poltergeistArt(p.id)} disabled={Boolean(blocked)} activationBlocked={state.minorsRemoved === true || state.carolyn === 'with-you' || state.carolyn === 'rescued'} onActivate={() => action('activate-minor', p.id)} onEnd={() => action('end-minor', p.id)} onCorrect={value => action('correct', `minor.${p.id}`, value)}/>)}
      {recordedMinors.length > 0 && recordedMinors.length < POLTERGEIST_MINORS.length && <button className="module-change-choice" aria-expanded={choosingMinors} onClick={() => setChoosingMinors(!choosingMinors)}>{choosingMinors ? 'Done choosing Minor Powers' : 'Add another Minor Power'}</button>}
    </div>
    <KillerCards killer="Poltergeist" events={events} onEvent={onEvent} disabled={blocked}/>
    {message && <p role="alert">{message}</p>}
  </section>;
}
