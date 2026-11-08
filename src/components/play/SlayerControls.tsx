import { useState } from 'react';
import { SLAYER, SLAYER_MARKERS, SLAYER_MINORS, dimensionLabel, isDimension, type Dimension, type SlayerMarker } from '@/lib/play/slayer';
import { KillerCards } from './KillerCards';
import { MinorPowerControl } from './MinorPowerControl';
import { MinorPowerGroup } from './MinorPowerGroup';
import { ModuleArtwork } from './ModuleArtwork';
import { slayerArt } from './slayerArt';
import { useSlayerRecord } from './useSlayerRecord';
import type { ControlsProps } from './moduleDefinitions';
import '@/styles/play-slayer.css';

const dimensions = ['our','mirror'] as const;
const DimensionOptions = () => <>{dimensions.map(value => <option key={value} value={value}>{dimensionLabel(value)}</option>)}</>;

export function SlayerControls({events, onEvent, blocked}: ControlsProps) {
  const {state, act, message} = useSlayerRecord(events, onEvent, blocked);
  const [companionsOpen, setCompanionsOpen] = useState(false);
  const [companions, setCompanions] = useState<SlayerMarker[]>([]);
  const [openMarker, setOpenMarker] = useState<SlayerMarker | null>(null);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [markerDimension, setMarkerDimension] = useState<Dimension | null>(null);
  const destination = state.girl === 'mirror' ? 'our' : 'mirror';
  const crossing = state.girl === 'mirror' ? 'Return to Our Dimension' : 'Enter Mirror Dimension';
  const used = SLAYER_MARKERS.filter(id => !!state.markers[id]);
  const available = SLAYER_MARKERS.find(id => !state.markers[id]);
  const eligible = used.filter(id => state.girl !== null && state.markers[id]?.dimension === state.girl);
  const art = state.girl === 'mirror' ? 'mirror' : state.collapsed && state.girl === 'our' && state.slayer === 'our' ? 'collapsed' : 'our';
  const cross = (withMarkers: SlayerMarker[]) => {
    if (act({command:'cross', to:destination, companions:withMarkers})) {
      setCompanionsOpen(false);
      setCompanions([]);
    }
  };

  return <section className="play-slayer" aria-label="Slayer tracking">
    <article className="slayer-tracker" aria-label="Dimension Tracker" data-dimension={state.girl ?? 'unknown'}>
      <div className="slayer-tracker-photo"><ModuleArtwork art={slayerArt(art)}/></div>
      <div className="slayer-tracker-bar">
        <div>
          <h3>Dimension Tracker</h3>
          <p>Final Girl · {dimensionLabel(state.girl)} <span>Slayer · {dimensionLabel(state.slayer)}</span></p>
          {state.collapsed && <p className="slayer-recorded">Rift Collapse recorded</p>}
        </div>
        {state.girl && <div className="slayer-actions">
          <button type="button" className="slayer-primary" disabled={blocked} onClick={() => cross([])}>{crossing}</button>
          {eligible.length > 0 && <button type="button" className="module-unnamed" aria-expanded={companionsOpen}
            disabled={blocked} onClick={() => {setCompanionsOpen(!companionsOpen);setCompanions([]);}}>With Special Victims</button>}
        </div>}
      </div>
      {companionsOpen && eligible.length > 0 && <fieldset className="slayer-editor">
        <legend>Cross with Special Victims in your space</legend>
        {eligible.map(id => <label className="slayer-check" key={id}>
          <input type="checkbox" checked={companions.includes(id)} onChange={e => setCompanions(current =>
            e.target.checked ? [...current,id] : current.filter(value => value !== id))}/>
          {state.markers[id]?.label || `Special Victim ${id}`}
        </label>)}
        <button type="button" className="slayer-primary" disabled={blocked || !companions.some(id => eligible.includes(id))}
          onClick={() => cross(companions.filter(id => eligible.includes(id)))}>Cross with selected</button>
      </fieldset>}
      {(!state.girl || !state.slayer) && <details className="slayer-editor slayer-correction">
        <summary>Record current dimension</summary>
        <div className="slayer-actions">
          {(['girl','slayer'] as const).filter(who => !state[who]).map(who => <label key={who}>{who === 'girl' ? 'Final Girl' : 'Slayer'}
            <select aria-label={who === 'girl' ? 'Final Girl dimension' : 'Slayer dimension'} disabled={blocked}
              value={state[who] ?? ''} onChange={e => {
                if (isDimension(e.target.value)) act({command:'set-dimension',who,to:e.target.value});
              }}>
              <option value="" disabled>Unrecorded</option><DimensionOptions/>
            </select>
          </label>)}
        </div>
      </details>}
    </article>
    <section className="slayer-markers" aria-label="Special Victims">
      <div className="slayer-actions">
        {used.map(id => <button type="button" className="slayer-chip" key={id} disabled={blocked} aria-expanded={openMarker === id}
          onClick={() => {setOpenMarker(openMarker === id ? null : id);setAdding(false);}}>
          <strong>{state.markers[id]?.label || `Special Victim ${id}`}</strong> · {dimensionLabel(state.markers[id]?.dimension ?? null)}
        </button>)}
        {available && <button type="button" className="module-unnamed" disabled={blocked} aria-expanded={adding}
          onClick={() => {setAdding(!adding);setOpenMarker(null);setLabel('');setMarkerDimension(null);}}>Add Special Victim</button>}
      </div>
      {openMarker && state.markers[openMarker] && <div className="slayer-actions slayer-editor">
        {state.markers[openMarker].dimension === 'our' && <button type="button" className="slayer-primary"
          disabled={blocked} onClick={() => act({command:'pull',id:openMarker})}>Pulled into Mirror</button>}
        <label>Correct marker dimension
          <select aria-label="Special Victim dimension" disabled={blocked} value={state.markers[openMarker].dimension ?? ''}
            onChange={e => act({command:'set-marker',id:openMarker,to:isDimension(e.target.value) ? e.target.value : null})}>
            <option value="">Unrecorded</option><DimensionOptions/>
          </select>
        </label>
        <button type="button" className="module-unnamed" disabled={blocked} onClick={() => {
          if (act({command:'untrack-marker',id:openMarker})) setOpenMarker(null);
        }}>Stop tracking marker</button>
      </div>}
      {adding && available && <form className="slayer-actions slayer-editor" onSubmit={e => {
        e.preventDefault();
        if (act({command:'track-marker',id:available,label:label.trim(),dimension:markerDimension})) setAdding(false);
      }}>
        <label>Role name (optional)<input maxLength={32} value={label} onChange={e => setLabel(e.target.value)}/></label>
        <label>Observed dimension<select value={markerDimension ?? ''} onChange={e => {
          setMarkerDimension(isDimension(e.target.value) ? e.target.value : null);
        }}><option value="">Unrecorded</option><DimensionOptions/></select></label>
        <button className="slayer-primary" disabled={blocked}>Record marker</button>
      </form>}
    </section>
    {message && <p role="alert">{message}</p>}
    <MinorPowerGroup>
      {SLAYER_MINORS.map(card => <MinorPowerControl key={card.id} name={card.name} health={state.minors[card.id]}
        maxHealth={card.health} art={() => slayerArt(card.id)} heroArt={slayerArt(card.id)} choiceArt={slayerArt(card.id,true)} disabled={blocked}
        onChange={health => act({command:'minor',id:card.id,health})}/>)}
    </MinorPowerGroup>
    <KillerCards killer={SLAYER} events={events} onEvent={onEvent} disabled={blocked}/>
  </section>;
}
