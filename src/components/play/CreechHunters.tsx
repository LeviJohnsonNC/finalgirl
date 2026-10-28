import { useId, useState } from 'react';
import { IllustratedTile } from './IllustratedTile';
import { PlaySelect } from './PlaySelect';
import { creechArt } from './creechArt';
import { CREECH_HUNTERS, CREECH_PEOPLE } from '@/lib/play/creech';
import type { ModuleState, ModuleValue } from '@/lib/play/modules';

const states = [{ value: 'in-play', label: 'In play' }, { value: 'saved', label: 'Saved' }, { value: 'killed', label: 'Killed' }, { value: 'left-play', label: 'Left play' }, { value: 'not-participating', label: 'Not participating' }];

/** Keep the roster quiet; only the selected hunter discloses actions. */
export function CreechHunters({ state, onEvent, onGroup, onOutcome, onCorrect }: {
  state: ModuleState;
  onEvent: (active: boolean) => boolean;
  onGroup: (colors: string[]) => boolean;
  onOutcome: (color: string, outcome: 'saved' | 'killed', bloodlust?: number) => boolean;
  onCorrect: (key: string, value: ModuleValue) => boolean;
}) {
  const id = useId();
  const [colors, setColors] = useState<string[]>([...CREECH_HUNTERS]);
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [bloodlust, setBloodlust] = useState('');
  const invalidBloodlust = bloodlust !== '' && (!Number.isInteger(Number(bloodlust)) || Number(bloodlust) < 0 || Number(bloodlust) > 99);
  const known = CREECH_HUNTERS.some(color => state[`hunter.${color}`] !== undefined);
  const active = state['event.hunters'] === 'active';
  const roster = CREECH_PEOPLE.filter(h => state[`hunter.${h.id}`] !== undefined && state[`hunter.${h.id}`] !== 'not-participating');
  const hunter = roster.find(h => h.id === selected);
  const summary = !active ? 'Ended' : state['hunters.firstDeath'] === true ? 'Survivors can follow' : 'Will not follow yet';
  const outcome = (value: 'saved' | 'killed') => {
    if (hunter && onOutcome(hunter.id, value, value === 'killed' && bloodlust !== '' ? Number(bloodlust) : undefined)) {
      setSelected(null);
      document.getElementById(`${id}-${hunter.id}`)?.focus();
    }
  };
  return <section aria-label="Ghost Hunters" className="creech-hunter-section" data-module-control="character">
    <h3>Ghost Hunters</h3>
    {!known ? <>
      <IllustratedTile className="creech-scene" art={creechArt.hunters} title="Ghost Hunters" status={active ? 'Choose participating hunters' : state['event.hunters'] === 'ended' ? 'Ended · Activate' : 'Not recorded · Activate'} data-state={active ? 'active' : state['event.hunters'] ?? 'unknown'} aria-label="View Ghost Hunters" onClick={() => onEvent(!active)} />
      {active && <div className="creech-editor"><div className="creech-color-choices">{CREECH_PEOPLE.map(h => <label key={h.id}><input type="checkbox" checked={colors.includes(h.id)} onChange={e => setColors(e.target.checked ? [...colors, h.id] : colors.filter(c => c !== h.id))} />{h.id[0].toUpperCase() + h.id.slice(1)}</label>)}</div><button onClick={() => onGroup(colors)}>Record participating hunters</button></div>}
    </> : <>
      <button className="creech-hunter-summary" aria-label="View Ghost Hunters" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><span>{summary}</span><small>{roster.filter(h => state[`hunter.${h.id}`] === 'in-play').length} in play · {expanded ? 'Hide' : 'Show'}</small></button>
      {expanded && <>
        <div className="creech-hunters">{roster.map(h => <IllustratedTile key={h.id} id={`${id}-${h.id}`} className="creech-hunter-portrait" art={creechArt[`hunter-${h.id}`]} title={h.id[0].toUpperCase() + h.id.slice(1)} status={states.find(s => s.value === state[`hunter.${h.id}`])?.label ?? 'Not recorded'} data-state={state[`hunter.${h.id}`]} aria-label={`View ${h.name}`} aria-expanded={selected === h.id} aria-pressed={selected === h.id} onClick={() => { setSelected(selected === h.id ? null : h.id); setBloodlust(''); }} />)}</div>
        {hunter && <div className="creech-hunter-actions" role="group" aria-label={`${hunter.name} actions`}>
          <strong>{hunter.name}</strong>
          {state[`hunter.${hunter.id}`] === 'in-play' && <>
            <div className="module-outcomes"><button aria-label={`Mark ${hunter.name} saved`} onClick={() => outcome('saved')}>Saved</button><button aria-label={`Mark ${hunter.name} killed`} disabled={invalidBloodlust} onClick={() => outcome('killed')}>Killed</button></div>
            <details className="module-correction"><summary>Bloodlust with death (optional)</summary><label>Observed final Bloodlust<input aria-label="Observed final Bloodlust" aria-invalid={invalidBloodlust || undefined} type="number" min="0" max="99" value={bloodlust} onChange={e => setBloodlust(e.target.value)} /></label>{invalidBloodlust && <p role="alert">Use a whole number from 0 to 99, or leave this blank.</p>}</details>
          </>}
          <details className="module-correction"><summary>Correct hunter status</summary><PlaySelect aria-label={`${hunter.name} status`} value={String(state[`hunter.${hunter.id}`] ?? '')} onChange={e => onCorrect(`hunter.${hunter.id}`, e.target.value || null)}><option value="">Not recorded</option>{states.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</PlaySelect></details>
        </div>}
        <details className="module-correction"><summary>Correct hunter group</summary>
          <label>First hunter death<PlaySelect aria-label="Hunter first death" value={state['hunters.firstDeath'] === undefined ? '' : String(state['hunters.firstDeath'])} onChange={e => onCorrect('hunters.firstDeath', e.target.value === '' ? null : e.target.value === 'true')}><option value="">Not recorded</option><option value="false">Not reported</option><option value="true">Reported</option></PlaySelect></label>
          {CREECH_PEOPLE.map(h => <label key={h.id}>{h.name}<PlaySelect aria-label={`Correct ${h.name} participation`} value={String(state[`hunter.${h.id}`] ?? '')} onChange={e => onCorrect(`hunter.${h.id}`, e.target.value || null)}><option value="">Not recorded</option>{states.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</PlaySelect></label>)}
          <button onClick={() => onEvent(!active)}>{active ? 'End Ghost Hunters' : 'Reactivate Ghost Hunters'}</button>
        </details>
      </>}
    </>}
  </section>;
}
