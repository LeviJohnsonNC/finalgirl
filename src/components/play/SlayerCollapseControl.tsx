import { useState } from 'react';
import { SLAYER_MARKERS, slayerCollapseReveal, type SlayerMarker } from '@/lib/play/slayer';
import type { PlayEvent } from '@/lib/play/events';
import { useSlayerRecord } from './useSlayerRecord';
import '@/styles/play-slayer.css';

export function SlayerCollapseControl({events, onEvent, disabled}: {
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  disabled?: boolean;
}) {
  const {entries, state, act, message} = useSlayerRecord(events, onEvent, disabled);
  const [preview, setPreview] = useState(false);
  const [included, setIncluded] = useState<SlayerMarker[]>([]);
  const reveal = slayerCollapseReveal(entries);
  if (state.collapsed) return <p className="slayer-recorded">Rift Collapse recorded</p>;
  if (!reveal) return null;
  if (!preview) return <button type="button" className="slayer-primary" disabled={disabled}
    onClick={() => setPreview(true)}>Record Rift Collapse</button>;
  const returning = SLAYER_MARKERS.filter(id => state.markers[id]?.dimension === 'mirror');
  const unknown = SLAYER_MARKERS.filter(id => state.markers[id]?.dimension === null);
  const label = (id: SlayerMarker) => state.markers[id]?.label || `Special Victim ${id}`;
  return <section className="slayer-editor" aria-label="Rift Collapse preview">
    <p>In Our Dimension after Collapse: Slayer, the Final Girl{returning.map(id => `, ${label(id)}`).join('')}.</p>
    {unknown.length > 0 && <fieldset><legend>Also confirm which unrecorded markers returned</legend>
      {unknown.map(id => <label className="slayer-check" key={id}>
        <input type="checkbox" checked={included.includes(id)} onChange={e =>
          setIncluded(current => e.target.checked ? [...current,id] : current.filter(value => value !== id))}/>
        {label(id)}
      </label>)}
    </fieldset>}
    <div className="slayer-actions">
      <button type="button" className="slayer-primary" disabled={disabled} onClick={() => {
        if (act({command:'collapse', reveal, includeUnknown:included.filter(id => unknown.includes(id))})) setPreview(false);
      }}>Confirm Rift Collapse</button>
      <button type="button" className="module-unnamed" onClick={() => {setPreview(false);setIncluded([]);}}>Cancel</button>
    </div>
    {message && <p role="alert">{message}</p>}
  </section>;
}
